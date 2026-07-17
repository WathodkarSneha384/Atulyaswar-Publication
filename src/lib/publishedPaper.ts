import { getManuscriptById } from "@/lib/manuscriptStore";
import { readManuscriptAttachment } from "@/lib/manuscriptFiles";
import { saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import {
  bufferIsPdf,
  resolveIssueEntryUploadExact,
  type ResolvedEntryFile,
} from "@/lib/issueEntryFile";
import type { IssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";

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
    isDocx: !isPdf && lower.endsWith(".docx"),
  };
}

/** Exact same paper bytes admin downloads from Manuscripts → Paper. */
export async function loadManuscriptPaperExact(
  manuscriptId: string,
): Promise<ResolvedEntryFile | null> {
  const item = await getManuscriptById(manuscriptId);
  if (!item?.paperFileName && !item?.paperFileBase64) return null;

  try {
    const fileBuffer = await readManuscriptAttachment({
      id: item.id,
      kind: "paper",
      originalFileName: item.paperFileName || "paper.bin",
      fallbackBase64: item.paperFileBase64,
      fallbackMimeType: item.paperFileMimeType,
    });

    void saveManuscriptFileBlob({
      id: item.id,
      kind: "paper",
      fileName: item.paperFileName || "paper.bin",
      mimeType: item.paperFileMimeType || "application/octet-stream",
      buffer: fileBuffer,
    }).catch(() => undefined);

    return toResolved(
      fileBuffer,
      item.paperFileName || "paper.bin",
      item.paperFileMimeType || "application/octet-stream",
    );
  } catch {
    if (item.paperFileBase64) {
      return toResolved(
        Buffer.from(item.paperFileBase64, "base64"),
        item.paperFileName || "paper.bin",
        item.paperFileMimeType || "application/octet-stream",
      );
    }
    return null;
  }
}

/**
 * Published Current Issue paper:
 * 1. Exact file uploaded under Issue To Publish (PDF/DOC/DOCX) — as-is.
 * 2. Original manuscript Paper only when no issue file was uploaded.
 */
export async function loadPublishedEntryPaperExact(
  item: IssueEntrySubmission,
): Promise<ResolvedEntryFile | null> {
  const uploaded = resolveIssueEntryUploadExact(item);
  if (uploaded) return uploaded;

  if (item.manuscriptId) {
    return loadManuscriptPaperExact(item.manuscriptId);
  }

  return null;
}
