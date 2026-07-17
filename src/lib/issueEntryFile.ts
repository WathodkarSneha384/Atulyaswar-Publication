import { readManuscriptAttachment } from "@/lib/manuscriptFiles";
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
  if (!manuscript?.paperFileName) return null;

  try {
    const buffer = await readManuscriptAttachment({
      id: manuscript.id,
      kind: "paper",
      originalFileName: manuscript.paperFileName,
    });
    return {
      buffer,
      fileName: manuscript.paperFileName,
      mimeType: manuscript.paperFileMimeType || "application/octet-stream",
      isPdf: isPdfFile(manuscript.paperFileName, manuscript.paperFileMimeType),
    };
  } catch {
    if (manuscript.paperFileBase64) {
      return {
        buffer: Buffer.from(manuscript.paperFileBase64, "base64"),
        fileName: manuscript.paperFileName,
        mimeType: manuscript.paperFileMimeType || "application/octet-stream",
        isPdf: isPdfFile(manuscript.paperFileName, manuscript.paperFileMimeType),
      };
    }
    return null;
  }
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
  const manuscript = await getManuscriptById(item.manuscriptId);
  return Boolean(manuscript?.paperFileName || manuscript?.paperFileBase64);
}
