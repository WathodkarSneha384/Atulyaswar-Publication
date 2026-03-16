import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { kv } from "@vercel/kv";

export type IssueEntrySubmissionStatus = "pending" | "approved";

export type IssueEntrySubmission = {
  id: string;
  issueId: string;
  issueTitle: string;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
  submitterEmail: string;
  createdAt: string;
  status: IssueEntrySubmissionStatus;
};

type NewSubmissionInput = Omit<
  IssueEntrySubmission,
  "id" | "createdAt" | "status"
>;
type UpdateSubmissionInput = Partial<
  Omit<IssueEntrySubmission, "id" | "createdAt" | "status">
>;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "issue-entry-submissions.json");
const KV_KEY = "atulyaswar:issue-entry-submissions";

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<IssueEntrySubmission[]> {
  if (hasKvConfig()) {
    const data = await kv.get<IssueEntrySubmission[]>(KV_KEY);
    return Array.isArray(data) ? data : [];
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
  if (hasKvConfig()) {
    await kv.set(KV_KEY, items);
    return;
  }
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function createIssueEntrySubmission(input: NewSubmissionInput) {
  const all = await readAll();
  const submission: IssueEntrySubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
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
