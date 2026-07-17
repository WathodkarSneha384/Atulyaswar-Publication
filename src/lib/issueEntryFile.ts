import { loadManuscriptFileBlob, saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import { getManuscriptById } from "@/lib/manuscriptStore";
import type { IssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";
import { updateIssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";
import { isOfficePaperFile } from "@/lib/convertOfficeToPdf";

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
  return {
    buffer,
    fileName,
    mimeType: isPdf ? "application/pdf" : mimeType || "application/octet-stream",
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

/** Original uploaded manuscript paper (ignores converted PDF cache on the entry). */
export async function resolveIssueEntryOriginalFile(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  if (item.manuscriptId) {
    const paper = await loadManuscriptPaper(item.manuscriptId);
    if (paper) return paper;
  }
  return resolveIssueEntryFile(item);
}

/** Prefer entry-stored file (exact admin Read/Download source); else manuscript paper. */
export async function resolveIssueEntryFile(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  if (item.pdfBase64) {
    const buffer = Buffer.from(item.pdfBase64, "base64");
    const fileName = item.pdfFileName || "submission.bin";
    const mimeType = item.pdfMimeType || "application/octet-stream";
    const resolved = toResolved(buffer, fileName, mimeType);

    // Ignore bogus "PDF" cache (e.g. Word bytes saved with a .pdf name).
    if (resolved.isPdf) {
      return resolved;
    }

    if (item.manuscriptId) {
      const paper = await loadManuscriptPaper(item.manuscriptId);
      if (paper) return paper;
    }

    // Keep non-PDF entry file only if it is a Word document we can render.
    if (isOfficePaperFile(fileName, mimeType) || resolved.isDocx) {
      return resolved;
    }
  }

  if (item.manuscriptId) {
    const paper = await loadManuscriptPaper(item.manuscriptId);
    if (paper?.isPdf) {
      void updateIssueEntrySubmission(item.id, {
        pdfFileName: paper.fileName,
        pdfMimeType: "application/pdf",
        pdfBase64: paper.buffer.toString("base64"),
      }).catch(() => undefined);
    }
    return paper;
  }

  return null;
}

export async function issueEntryHasReadableFile(item: IssueEntrySubmission) {
  if (item.pdfUrl?.trim() || item.pdfBase64) return true;
  if (!item.manuscriptId) return false;
  const file = await loadManuscriptPaper(item.manuscriptId);
  return Boolean(file);
}
