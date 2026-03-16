import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { kv } from "@vercel/kv";

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
  status: IssueStatus;
  createdAt: string;
  entries: IssueEntry[];
};

type NewIssueInput = {
  year: string;
  volume: string;
  issueNo: string;
  title: string;
};

type NewEntryInput = {
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
};
type UpdateIssueInput = Partial<Pick<JournalIssue, "year" | "volume" | "issueNo" | "title" | "status">>;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "issues.json");
const KV_KEY = "atulyaswar:issues";

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

async function readAll(): Promise<JournalIssue[]> {
  if (hasKvConfig()) {
    const records = await kv.get<JournalIssue[]>(KV_KEY);
    return Array.isArray(records) ? records : [];
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
  if (hasKvConfig()) {
    await kv.set(KV_KEY, records);
    return;
  }

  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function listIssues() {
  return readAll();
}

export async function getCurrentIssue() {
  const issues = await readAll();
  return issues.find((issue) => issue.status === "current") ?? null;
}

export async function getArchiveIssues() {
  const issues = await readAll();
  return issues
    .filter((issue) => issue.status === "archive")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createIssue(input: NewIssueInput) {
  const all = await readAll();

  const updated = all.map((issue) =>
    issue.status === "current"
      ? {
          ...issue,
          status: "archive" as const,
        }
      : issue,
  );

  const issue: JournalIssue = {
    id: randomUUID(),
    year: input.year.trim(),
    volume: input.volume.trim(),
    issueNo: input.issueNo.trim(),
    title: input.title.trim() || `Vol. ${input.volume}, Issue ${input.issueNo}`,
    status: "current",
    createdAt: new Date().toISOString(),
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
  all.splice(index, 1);
  await writeAll(all);
  return true;
}
