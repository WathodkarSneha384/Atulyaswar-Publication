import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

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
  plagiarismFileName: string;
  plagiarismBuffer: Buffer;
}) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await Promise.all([
    writeFile(
      getStoredFilePath(options.id, "paper", options.paperFileName),
      options.paperBuffer,
    ),
    writeFile(
      getStoredFilePath(options.id, "plagiarism", options.plagiarismFileName),
      options.plagiarismBuffer,
    ),
  ]);
}

export async function readManuscriptAttachment(options: {
  id: string;
  kind: AttachmentKind;
  originalFileName: string;
}) {
  const filePath = getStoredFilePath(options.id, options.kind, options.originalFileName);
  const buffer = await readFile(filePath);
  return buffer;
}
