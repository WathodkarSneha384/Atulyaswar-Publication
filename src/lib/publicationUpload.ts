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

export function validatePublicationUpload(file: File): string | null {
  if (!isAllowedPublicationFileName(file.name)) {
    return "Please upload a PDF, DOC, or DOCX file.";
  }
  if (file.size > MAX_PUBLICATION_BYTES) {
    return "File size should not exceed 8 MB.";
  }
  return null;
}
