import { loadManuscriptFileBlob, saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import { getManuscriptById } from "@/lib/manuscriptStore";
import type { IssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";

export type ResolvedEntryFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  isPdf: boolean;
};

function isPdfFile(fileName: string, mimeType?: string) {
  return (
    fileName.toLowerCase().endsWith(".pdf") ||
    (mimeType ?? "").toLowerCase().includes("pdf")
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

  // Ensure durable copy exists for future serverless reads.
  void saveManuscriptFileBlob({
    id: manuscript.id,
    kind: "paper",
    fileName: stored.fileName || manuscript.paperFileName || "paper.bin",
    mimeType: stored.mimeType || manuscript.paperFileMimeType || "application/octet-stream",
    buffer,
  }).catch(() => undefined);

  return {
    buffer,
    fileName: stored.fileName || manuscript.paperFileName || "paper.bin",
    mimeType: stored.mimeType || manuscript.paperFileMimeType || "application/octet-stream",
    isPdf: isPdfFile(
      stored.fileName || manuscript.paperFileName || "",
      stored.mimeType || manuscript.paperFileMimeType,
    ),
  };
}

/** Prefer entry PDF; fall back to the linked manuscript paper file. */
export async function resolveIssueEntryFile(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  if (item.pdfBase64) {
    return {
      buffer: Buffer.from(item.pdfBase64, "base64"),
      fileName: item.pdfFileName || "submission.pdf",
      mimeType: item.pdfMimeType || "application/pdf",
      isPdf: true,
    };
  }

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
