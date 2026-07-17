/**
 * One-shot: create Issue To Publish / Current Issue rows for any approved
 * manuscripts that are missing an issue-entry submission.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const TABLE = "atulyaswar_kv";
const MS_KEY = "atulyaswar:manuscripts";
const ENTRY_KEY = "atulyaswar:issue-entry-submissions";
const ISSUE_KEY = "atulyaswar:issues";

const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function readKv(kvKey) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", kvKey)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

async function writeKv(kvKey, value) {
  const { error } = await supabase.from(TABLE).upsert(
    { key: kvKey, value, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw error;
}

const manuscripts = (await readKv(MS_KEY)) || [];
const entriesRaw = await readKv(ENTRY_KEY);
const entries = Array.isArray(entriesRaw) ? entriesRaw : [];
const issues = (await readKv(ISSUE_KEY)) || [];

const approved = manuscripts.filter((m) => m.status === "approved");
const linked = new Set(entries.map((e) => e.manuscriptId).filter(Boolean));
const missing = approved.filter((m) => !linked.has(m.id));

console.log("approved manuscripts:", approved.length);
console.log("issue entries:", entries.length);
console.log(
  "missing:",
  missing.map((m) => ({ id: m.id, title: m.title, author: m.authorNames })),
);

const current =
  issues.find((i) => i.isCurrent) ||
  issues.find((i) => i.status === "published") ||
  issues[0];

if (!current) {
  console.error("No current issue found");
  process.exit(1);
}
console.log("current issue:", current.id, current.title);

if (missing.length === 0) {
  console.log("Nothing to backfill.");
  process.exit(0);
}

for (const m of missing) {
  const row = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    manuscriptId: m.id,
    issueId: current.id,
    issueTitle: current.title,
    title: m.title,
    author: m.authorNames,
    pageNo: "TBD",
    submitterEmail: m.email || "",
    status: "approved",
    publishStatus: "published",
    pdfFileName: m.paperFileName || undefined,
    pdfMimeType: m.paperFileMimeType || undefined,
  };
  entries.unshift(row);
  console.log("added entry for:", m.title, row.id);
}

await writeKv(ENTRY_KEY, entries);
console.log("Wrote", entries.length, "entries to Supabase.");
