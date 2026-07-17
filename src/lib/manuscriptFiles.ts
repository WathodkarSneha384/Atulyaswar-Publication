import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  loadManuscriptFileBlob,
  saveManuscriptFileBlob,
} from "@/lib/manuscriptFileStore";

type AttachmentKind = "paper" | "plagiarism";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "atulyaswar-data")
  : path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "manuscript-uploads");

function fileExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext || "";
}

function getStoredFileName(id: string, kind: AttachmentKind, originalFileName: string) {
  return `${id}-${kind}${fileExtension(originalFileName)}`;
}

function getStoredFilePath(id: string, kind: AttachmentKind, originalFileName: string) {
  return path.join(UPLOAD_DIR, getStoredFileName(id, kind, originalFileName));
}

export async function saveManuscriptAttachments(options: {
  id: string;
  paperFileName: string;
  paperBuffer: Buffer;
  paperMimeType?: string;
  plagiarismFileName?: string;
  plagiarismBuffer?: Buffer;
  plagiarismMimeType?: string;
}) {
  await saveManuscriptFileBlob({
    id: options.id,
    kind: "paper",
    fileName: options.paperFileName,
    mimeType: options.paperMimeType || "application/octet-stream",
    buffer: options.paperBuffer,
  });

  if (options.plagiarismFileName && options.plagiarismBuffer) {
    await saveManuscriptFileBlob({
      id: options.id,
      kind: "plagiarism",
      fileName: options.plagiarismFileName,
      mimeType: options.plagiarismMimeType || "application/pdf",
      buffer: options.plagiarismBuffer,
    });
  }

  // Keep local copies for non-Vercel / fallback.
  await mkdir(UPLOAD_DIR, { recursive: true });
  const writes = [
    writeFile(
      getStoredFilePath(options.id, "paper", options.paperFileName),
      options.paperBuffer,
    ),
  ];
  if (options.plagiarismFileName && options.plagiarismBuffer) {
    writes.push(
      writeFile(
        getStoredFilePath(options.id, "plagiarism", options.plagiarismFileName),
        options.plagiarismBuffer,
      ),
    );
  }
  await Promise.all(writes);
}

export async function readManuscriptAttachment(options: {
  id: string;
  kind: AttachmentKind;
  originalFileName: string;
  fallbackBase64?: string;
  fallbackMimeType?: string;
}) {
  const fromStore = await loadManuscriptFileBlob({
    id: options.id,
    kind: options.kind,
    fileName: options.originalFileName,
    fallbackBase64: options.fallbackBase64,
    fallbackMimeType: options.fallbackMimeType,
  });
  if (fromStore?.base64) {
    return Buffer.from(fromStore.base64, "base64");
  }

  const filePath = getStoredFilePath(options.id, options.kind, options.originalFileName);
  return readFile(filePath);
}
