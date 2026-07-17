import { loadManuscriptFileBlob, saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import { getManuscriptById } from "@/lib/manuscriptStore";
import type { IssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";

export type ResolvedEntryFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  isPdf: boolean;
  isDocx: boolean;
};

/** True PDF by magic bytes (filename alone is not enough). */
export function bufferIsPdf(buffer: Buffer) {
  if (buffer.length < 5) return false;
  const head = buffer.subarray(0, 5).toString("utf8");
  return head.startsWith("%PDF");
}

function isDocxFile(fileName: string, mimeType?: string) {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".docx") ||
    (mimeType ?? "").includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
  );
}

function toResolved(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): ResolvedEntryFile {
  const isPdf = bufferIsPdf(buffer);
  const lower = fileName.toLowerCase();
  return {
    buffer,
    fileName,
    mimeType: isPdf
      ? "application/pdf"
      : mimeType ||
        (lower.endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : lower.endsWith(".doc")
            ? "application/msword"
            : "application/octet-stream"),
    isPdf,
    isDocx: !isPdf && isDocxFile(fileName, mimeType),
  };
}

async function loadManuscriptPaper(manuscriptId: string): Promise<ResolvedEntryFile | null> {
  const manuscript = await getManuscriptById(manuscriptId);
  if (!manuscript) return null;

  const stored = await loadManuscriptFileBlob({
    id: manuscript.id,
    kind: "paper",
    fileName: manuscript.paperFileName,
    fallbackBase64: manuscript.paperFileBase64,
    fallbackMimeType: manuscript.paperFileMimeType,
  });

  if (!stored?.base64) return null;

  const buffer = Buffer.from(stored.base64, "base64");
  const fileName = stored.fileName || manuscript.paperFileName || "paper.bin";
  const mimeType =
    stored.mimeType || manuscript.paperFileMimeType || "application/octet-stream";

  void saveManuscriptFileBlob({
    id: manuscript.id,
    kind: "paper",
    fileName,
    mimeType,
    buffer,
  }).catch(() => undefined);

  return toResolved(buffer, fileName, mimeType);
}

/** Exact Issue To Publish upload bytes (PDF or Word) — never rewrite/swap. */
export function resolveIssueEntryUploadExact(
  item: IssueEntrySubmission,
): ResolvedEntryFile | null {
  if (!item.pdfBase64) return null;
  return toResolved(
    Buffer.from(item.pdfBase64, "base64"),
    item.pdfFileName || "submission.bin",
    item.pdfMimeType || "application/octet-stream",
  );
}

/** Original uploaded manuscript paper. */
export async function resolveIssueEntryOriginalFile(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  if (item.manuscriptId) {
    const paper = await loadManuscriptPaper(item.manuscriptId);
    if (paper) return paper;
  }
  return resolveIssueEntryUploadExact(item);
}

/**
 * Prefer exact Issue To Publish file; else manuscript Paper.
 * Do not discard Word uploads from Issue To Publish.
 */
export async function resolveIssueEntryFile(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  const uploaded = resolveIssueEntryUploadExact(item);
  if (uploaded) return uploaded;

  if (item.manuscriptId) {
    return loadManuscriptPaper(item.manuscriptId);
  }

  return null;
}

export async function issueEntryHasReadableFile(item: IssueEntrySubmission) {
  if (item.pdfUrl?.trim() || item.pdfBase64) return true;
  if (!item.manuscriptId) return false;
  const file = await loadManuscriptPaper(item.manuscriptId);
  return Boolean(file);
}
