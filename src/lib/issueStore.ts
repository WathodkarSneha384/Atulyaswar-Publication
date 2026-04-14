import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  hasSupabaseConfig,
  supabaseReadJson,
  supabaseWriteJson,
} from "@/lib/supabaseStore";
import {
  getVolumeNumberForYear,
} from "@/lib/volumeIssue";

export type IssueStatus = "current" | "archive";

export type IssueEntry = {
  id: string;
  srNo: number;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
};

export type JournalIssue = {
  id: string;
  year: string;
  volume: string;
  issueNo: string;
  title: string;
  publicationWindow?: string;
  volumeDisplay?: string;
  status: IssueStatus;
  createdAt: string;
  entries: IssueEntry[];
};

type NewIssueInput = {
  title?: string;
  publicationWindow?: string;
  volumeDisplay?: string;
  issueNo?: "1" | "2";
  publicationDate?: Date;
};

type NewEntryInput = {
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
};
type UpdateIssueInput = Partial<
  Pick<
    JournalIssue,
    "year" | "volume" | "issueNo" | "title" | "publicationWindow" | "volumeDisplay" | "status"
  >
>;

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "atulyaswar-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "issues.json");
const KV_KEY = "atulyaswar:issues";

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<JournalIssue[]> {
  if (hasSupabaseConfig()) {
    try {
      const records = await supabaseReadJson<JournalIssue[]>(KV_KEY);
      if (records === null) return [];
      return Array.isArray(records) ? records : [];
    } catch (error) {
      console.error(
        "[atulyaswar] Supabase read failed (issues); falling back to local file.",
        error,
      );
    }
  }

  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as JournalIssue[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(records: JournalIssue[]) {
  if (hasSupabaseConfig()) {
    try {
      await supabaseWriteJson(KV_KEY, records);
      return;
    } catch (error) {
      console.error(
        "[atulyaswar] Supabase write failed (issues); falling back to local file.",
        error,
      );
    }
  }

  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function listIssues() {
  return readAll();
}

export async function getCurrentIssue() {
  const issues = await readAll();
  const current = issues.find((issue) => issue.status === "current");
  if (current) return current;

  if (issues.length === 0) return null;

  // Self-heal fallback: if current is missing, promote latest issue as current.
  const fallback = [...issues].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const updated = issues.map((issue) =>
    issue.id === fallback.id ? { ...issue, status: "current" as const } : { ...issue, status: "archive" as const },
  );
  await writeAll(updated);
  return updated.find((issue) => issue.id === fallback.id) ?? null;
}

export async function getArchiveIssues() {
  const issues = await readAll();
  return issues
    .filter((issue) => issue.status === "archive")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createIssue(input: NewIssueInput) {
  const all = await readAll();
  const cleanTitle = (input.title ?? "").trim();
  const cleanPublicationWindow = (input.publicationWindow ?? "").trim();
  const cleanVolumeDisplay = (input.volumeDisplay ?? "").trim();

  const updated = all.map((issue) =>
    issue.status === "current"
      ? {
          ...issue,
          status: "archive" as const,
        }
      : issue,
  );

  const now = input.publicationDate ?? new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const requestedIssueNo = input.issueNo === "1" || input.issueNo === "2" ? input.issueNo : "1";
  const issueNumber: 1 | 2 = requestedIssueNo === "2" ? 2 : 1;

  // Create issue against the next upcoming cycle (never backdated).
  // Example: in April, Issue 1 => Jul-Dec current year, Issue 2 => Jan-Jun next year.
  const displayYear =
    issueNumber === 1
      ? (currentMonth < 6 ? currentYear : currentYear + 1)
      : currentYear + 1;
  const volumeStartYear = issueNumber === 1 ? displayYear : displayYear - 1;
  const year = String(displayYear);
  const volume = String(getVolumeNumberForYear(volumeStartYear));
  const issueNo = String(issueNumber);

  const issue: JournalIssue = {
    id: randomUUID(),
    year,
    volume,
    issueNo,
    title: cleanTitle,
    publicationWindow: cleanPublicationWindow || undefined,
    volumeDisplay: cleanVolumeDisplay || undefined,
    status: "current",
    createdAt: now.toISOString(),
    entries: [],
  };

  updated.unshift(issue);
  await writeAll(updated);
  return issue;
}

export async function addIssueEntry(issueId: string, entryInput: NewEntryInput) {
  const all = await readAll();
  const index = all.findIndex((issue) => issue.id === issueId);
  if (index === -1) return null;

  const issue = all[index];
  const entry: IssueEntry = {
    id: randomUUID(),
    srNo: issue.entries.length + 1,
    title: entryInput.title.trim(),
    author: entryInput.author.trim(),
    pageNo: entryInput.pageNo.trim(),
    pdfUrl: entryInput.pdfUrl.trim(),
  };

  const updatedIssue: JournalIssue = {
    ...issue,
    entries: [...issue.entries, entry],
  };

  all[index] = updatedIssue;
  await writeAll(all);
  return updatedIssue;
}

export async function getIssueById(id: string) {
  const all = await readAll();
  return all.find((issue) => issue.id === id) ?? null;
}

export async function updateIssue(id: string, updates: UpdateIssueInput) {
  const all = await readAll();
  const index = all.findIndex((issue) => issue.id === id);
  if (index === -1) return null;

  const current = all[index];
  const currentYear = new Date().getFullYear();
  const nextYearRaw = updates.year?.trim();
  if (nextYearRaw) {
    const nextYear = Number.parseInt(nextYearRaw, 10);
    if (Number.isFinite(nextYear) && nextYear < currentYear) {
      throw new Error(`Backdated issues are not allowed. Please use year ${currentYear} or later.`);
    }
  }
  const nextStatus = updates.status ?? current.status;

  if (nextStatus === "current") {
    for (let i = 0; i < all.length; i += 1) {
      if (all[i].id !== id && all[i].status === "current") {
        all[i] = { ...all[i], status: "archive" };
      }
    }
  }

  all[index] = {
    ...current,
    ...updates,
  };
  await writeAll(all);
  return all[index];
}

export async function deleteIssue(id: string) {
  const all = await readAll();
  const index = all.findIndex((issue) => issue.id === id);
  if (index === -1) return false;
  const deletedIssue = all[index];
  all.splice(index, 1);

  // If current was deleted, promote latest remaining issue to current.
  if (deletedIssue.status === "current" && all.length > 0 && !all.some((issue) => issue.status === "current")) {
    const fallback = [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    for (let i = 0; i < all.length; i += 1) {
      all[i] = {
        ...all[i],
        status: all[i].id === fallback.id ? "current" : "archive",
      };
    }
  }

  await writeAll(all);
  return true;
}
