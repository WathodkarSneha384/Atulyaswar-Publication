/** Allowed publication files for Issue To Publish / Current Issue Read. */

const MAX_PUBLICATION_BYTES = 8 * 1024 * 1024;

export function isAllowedPublicationFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".doc");
}

export function mimeForPublicationFile(fileName: string, fileType?: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) return "application/msword";
  return fileType || "application/octet-stream";
}

export function validatePublicationUpload(
  fileName: string,
  size: number,
): string | null {
  if (!isAllowedPublicationFileName(fileName)) {
    return "Please upload a PDF, DOC, or DOCX file.";
  }
  if (size > MAX_PUBLICATION_BYTES) {
    return "File size should not exceed 8 MB.";
  }
  return null;
}

/**
 * Next.js/Node FormData may return File or Blob. Accept either so replace uploads
 * are not silently skipped.
 */
export function getPublicationUploadFromForm(form: FormData): {
  fileName: string;
  mimeType: string;
  blob: Blob;
} | null {
  const value = form.get("pdfFile");
  if (!value || typeof value === "string") return null;
  if (!(value instanceof Blob) || value.size <= 0) return null;

  const fileName =
    "name" in value && typeof (value as File).name === "string" && (value as File).name
      ? (value as File).name
      : "publication.bin";

  return {
    fileName,
    mimeType: mimeForPublicationFile(fileName, value.type),
    blob: value,
  };
}
