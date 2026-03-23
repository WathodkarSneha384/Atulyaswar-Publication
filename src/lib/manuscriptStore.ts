import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { kv } from "@vercel/kv";

export type ManuscriptStatus = "pending" | "approved" | "rejected";

export type ManuscriptRecord = {
  id: string;
  createdAt: string;
  status: ManuscriptStatus;
  authorNames: string;
  designations: string[];
  title: string;
  email: string;
  phone: string;
  address: string;
  paperFileName: string;
  paperFileMimeType?: string;
  paperFileBase64?: string;
  plagiarismFileName: string;
  plagiarismFileMimeType?: string;
  plagiarismFileBase64?: string;
  rejectedReason?: string;
};

type NewManuscriptInput = Omit<ManuscriptRecord, "id" | "createdAt" | "status">;
type UpdateManuscriptInput = Partial<
  Omit<ManuscriptRecord, "id" | "createdAt" | "status">
>;

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "atulyaswar-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "manuscripts.json");
const KV_KEY = "atulyaswar:manuscripts";

function hasKvConfig() {
  const rawUrl = process.env.KV_REST_API_URL ?? "";
  const rawToken = process.env.KV_REST_API_TOKEN ?? "";
  const url = rawUrl.trim();
  const token = rawToken.trim();
  const hasWhitespace = /\s/.test(rawUrl) || /\s/.test(rawToken);
  return !hasWhitespace && url.startsWith("https://") && token.length > 0;
}

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<ManuscriptRecord[]> {
  if (hasKvConfig()) {
    try {
      const records = await kv.get<ManuscriptRecord[]>(KV_KEY);
      return Array.isArray(records) ? records : [];
    } catch (error) {
      console.error(
        "[atulyaswar] KV read failed (manuscripts); falling back to local file.",
        error,
      );
    }
  }

  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as ManuscriptRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(records: ManuscriptRecord[]) {
  if (hasKvConfig()) {
    try {
      await kv.set(KV_KEY, records);
      return;
    } catch (error) {
      console.error(
        "[atulyaswar] KV write failed (manuscripts); falling back to local file.",
        error,
      );
    }
  }

  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function createManuscript(input: NewManuscriptInput) {
  const all = await readAll();
  const record: ManuscriptRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
  };
  all.unshift(record);
  await writeAll(all);
  return record;
}

export async function listManuscripts(status?: ManuscriptStatus) {
  const all = await readAll();
  if (!status) return all;
  return all.filter((record) => record.status === status);
}

export async function approveManuscript(id: string) {
  const all = await readAll();
  const index = all.findIndex((record) => record.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    status: "approved",
    rejectedReason: undefined,
  };
  await writeAll(all);
  return all[index];
}

export async function rejectManuscript(id: string, reason?: string) {
  const all = await readAll();
  const index = all.findIndex((record) => record.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    status: "rejected",
    rejectedReason: reason?.trim() || all[index].rejectedReason,
  };
  await writeAll(all);
  return all[index];
}

export async function getManuscriptById(id: string) {
  const all = await readAll();
  return all.find((record) => record.id === id) ?? null;
}

export async function updateManuscript(id: string, updates: UpdateManuscriptInput) {
  const all = await readAll();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    designations: updates.designations ?? all[index].designations,
  };
  await writeAll(all);
  return all[index];
}

export async function deleteManuscript(id: string) {
  const all = await readAll();
  const index = all.findIndex((record) => record.id === id);
  if (index === -1) return false;
  all.splice(index, 1);
  await writeAll(all);
  return true;
}
