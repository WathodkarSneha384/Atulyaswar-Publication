import { loadManuscriptFileBlob, saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import { getManuscriptById } from "@/lib/manuscriptStore";
import type { IssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";
import { updateIssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";

export type ResolvedEntryFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  isPdf: boolean;
  isDocx: boolean;
};

function isPdfFile(fileName: string, mimeType?: string) {
  return (
    fileName.toLowerCase().endsWith(".pdf") ||
    (mimeType ?? "").toLowerCase().includes("pdf")
  );
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

  return {
    buffer,
    fileName,
    mimeType,
    isPdf: isPdfFile(fileName, mimeType),
    isDocx: isDocxFile(fileName, mimeType),
  };
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
    const fileName = item.pdfFileName || "submission.bin";
    const mimeType = item.pdfMimeType || "application/octet-stream";
    return {
      buffer: Buffer.from(item.pdfBase64, "base64"),
      fileName,
      mimeType,
      isPdf: isPdfFile(fileName, mimeType),
      isDocx: isDocxFile(fileName, mimeType),
    };
  }

  if (item.manuscriptId) {
    const paper = await loadManuscriptPaper(item.manuscriptId);
    if (paper?.isPdf) {
      // Only cache native PDFs here; DOC/DOCX are converted and cached by the PDF route.
      void updateIssueEntrySubmission(item.id, {
        pdfFileName: paper.fileName,
        pdfMimeType: paper.mimeType,
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
