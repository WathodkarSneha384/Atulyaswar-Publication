import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  hasSupabaseConfig,
  supabaseReadJson,
  supabaseWriteJson,
} from "@/lib/supabaseStore";

export type StoredManuscriptFile = {
  fileName: string;
  mimeType: string;
  base64: string;
};

type AttachmentKind = "paper" | "plagiarism";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "atulyaswar-data")
  : path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "manuscript-uploads");

function kvKey(id: string, kind: AttachmentKind) {
  return `atulyaswar:manuscript-file:${id}:${kind}`;
}

function localPath(id: string, kind: AttachmentKind, fileName: string) {
  const ext = path.extname(fileName) || "";
  return path.join(UPLOAD_DIR, `${id}-${kind}${ext}`);
}

export async function saveManuscriptFileBlob(options: {
  id: string;
  kind: AttachmentKind;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const payload: StoredManuscriptFile = {
    fileName: options.fileName,
    mimeType: options.mimeType || "application/octet-stream",
    base64: options.buffer.toString("base64"),
  };

  if (hasSupabaseConfig()) {
    try {
      await supabaseWriteJson(kvKey(options.id, options.kind), payload);
    } catch (error) {
      console.error(
        `[atulyaswar] Failed to persist manuscript ${options.kind} blob to Supabase.`,
        error,
      );
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(localPath(options.id, options.kind, options.fileName), options.buffer);
}

export async function loadManuscriptFileBlob(options: {
  id: string;
  kind: AttachmentKind;
  fileName?: string;
  fallbackBase64?: string;
  fallbackMimeType?: string;
}): Promise<StoredManuscriptFile | null> {
  if (hasSupabaseConfig()) {
    try {
      const fromKv = await supabaseReadJson<StoredManuscriptFile>(
        kvKey(options.id, options.kind),
      );
      if (fromKv?.base64) return fromKv;
    } catch (error) {
      console.error(
        `[atulyaswar] Failed to read manuscript ${options.kind} blob from Supabase.`,
        error,
      );
    }
  }

  if (options.fallbackBase64) {
    return {
      fileName: options.fileName || `${options.kind}.bin`,
      mimeType: options.fallbackMimeType || "application/octet-stream",
      base64: options.fallbackBase64,
    };
  }

  if (options.fileName) {
    try {
      const buffer = await readFile(localPath(options.id, options.kind, options.fileName));
      return {
        fileName: options.fileName,
        mimeType: options.fallbackMimeType || "application/octet-stream",
        base64: buffer.toString("base64"),
      };
    } catch {
      return null;
    }
  }

  return null;
}
