import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  hasSupabaseConfig,
  supabaseReadJson,
  supabaseWriteJson,
} from "@/lib/supabaseStore";

export type IssueEntrySubmissionStatus = "pending" | "approved" | "rejected";
export type IssueEntryPublishStatus = "draft" | "published";

export type IssueEntrySubmission = {
  id: string;
  manuscriptId?: string;
  issueId: string;
  issueTitle: string;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfMimeType?: string;
  pdfBase64?: string;
  submitterEmail: string;
  rejectedReason?: string;
  createdAt: string;
  status: IssueEntrySubmissionStatus;
  publishStatus: IssueEntryPublishStatus;
};

export type ApprovedIssueEntry = {
  id: string;
  srNo: number;
  title: string;
  author: string;
  pageNo: string;
  readUrl: string;
};

type NewSubmissionInput = Omit<IssueEntrySubmission, "id" | "createdAt">;
type UpdateSubmissionInput = Partial<
  Omit<IssueEntrySubmission, "id" | "createdAt" | "status">
>;

function hasReadablePdf(item: Pick<IssueEntrySubmission, "pdfUrl" | "pdfBase64">) {
  return Boolean(item.pdfUrl?.trim()) || Boolean(item.pdfBase64);
}

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "atulyaswar-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "issue-entry-submissions.json");
const KV_KEY = "atulyaswar:issue-entry-submissions";

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<IssueEntrySubmission[]> {
  if (hasSupabaseConfig()) {
    try {
      const data = await supabaseReadJson<IssueEntrySubmission[]>(KV_KEY);
      if (data === null) return [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(
        "[atulyaswar] Supabase read failed (issue entry submissions); falling back to local file.",
        error,
      );
    }
  }

  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as IssueEntrySubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(items: IssueEntrySubmission[]) {
  if (hasSupabaseConfig()) {
    try {
      await supabaseWriteJson(KV_KEY, items);
      return;
    } catch (error) {
      console.error(
        "[atulyaswar] Supabase write failed (issue entry submissions); falling back to local file.",
        error,
      );
    }
  }
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function createIssueEntrySubmission(input: NewSubmissionInput) {
  const all = await readAll();
  const submission: IssueEntrySubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
    status: input.status ?? "pending",
    publishStatus: input.publishStatus ?? "draft",
  };
  all.unshift(submission);
  await writeAll(all);
  return submission;
}

export async function listIssueEntrySubmissions(
  status?: IssueEntrySubmissionStatus,
) {
  const all = await readAll();
  if (!status) return all;
  return all.filter((item) => item.status === status);
}

export async function approveIssueEntrySubmission(id: string) {
  const all = await readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: IssueEntrySubmission = {
    ...all[index],
    status: "approved",
    publishStatus: "draft",
    rejectedReason: undefined,
  };
  all[index] = updated;
  await writeAll(all);
  return updated;
}

export async function rejectIssueEntrySubmission(id: string, reason?: string) {
  const all = await readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: IssueEntrySubmission = {
    ...all[index],
    status: "rejected",
    publishStatus: "draft",
    rejectedReason: reason?.trim() || all[index].rejectedReason,
  };
  all[index] = updated;
  await writeAll(all);
  return updated;
}

export async function getIssueEntrySubmissionById(id: string) {
  const all = await readAll();
  return all.find((item) => item.id === id) ?? null;
}

export async function updateIssueEntrySubmission(
  id: string,
  updates: UpdateSubmissionInput,
) {
  const all = await readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
  };
  await writeAll(all);
  return all[index];
}

export async function deleteIssueEntrySubmission(id: string) {
  const all = await readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return false;
  all.splice(index, 1);
  await writeAll(all);
  return true;
}

export async function listApprovedIssueEntriesForIssue(issueId: string) {
  const all = await readAll();
  const approvedAndPublished = all.filter(
    (item) =>
      item.issueId === issueId &&
      item.status === "approved" &&
      item.publishStatus === "published" &&
      hasReadablePdf(item),
  );

  const priorityPrefix = "atulyaswar -";
  const prioritized = approvedAndPublished.filter((item) =>
    item.title.trim().toLowerCase().startsWith(priorityPrefix),
  );
  const regular = approvedAndPublished.filter(
    (item) => !item.title.trim().toLowerCase().startsWith(priorityPrefix),
  );
  const sortedEntries = [...prioritized, ...regular];

  return sortedEntries.map<ApprovedIssueEntry>((item, index) => ({
    id: item.id,
    srNo: index + 1,
    title: item.title,
    author: item.author,
    pageNo: item.pageNo,
    readUrl: item.pdfUrl ?? (item.pdfBase64 ? `/api/issue-entry-submissions/${item.id}/pdf` : ""),
  }));
}

export async function publishApprovedIssueEntries(issueId: string) {
  const all = await readAll();
  let updatedCount = 0;

  const next = all.map((item) => {
    if (
      item.issueId === issueId &&
      item.status === "approved" &&
      item.publishStatus !== "published" &&
      hasReadablePdf(item)
    ) {
      updatedCount += 1;
      return {
        ...item,
        publishStatus: "published" as const,
      };
    }
    return item;
  });

  if (updatedCount > 0) {
    await writeAll(next);
  }

  return { updatedCount };
}

export async function publishIssueEntrySubmissions(ids: string[]) {
  if (ids.length === 0) {
    return { updatedCount: 0 };
  }

  const idSet = new Set(ids);
  const all = await readAll();
  let updatedCount = 0;

  const next = all.map((item) => {
    if (
      idSet.has(item.id) &&
      item.status === "approved" &&
      item.publishStatus !== "published" &&
      hasReadablePdf(item)
    ) {
      updatedCount += 1;
      return {
        ...item,
        publishStatus: "published" as const,
      };
    }
    return item;
  });

  if (updatedCount > 0) {
    await writeAll(next);
  }

  return { updatedCount };
}
