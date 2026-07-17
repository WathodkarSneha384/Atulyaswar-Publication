import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { loadPublishedEntryPaperExact } from "@/lib/publishedPaper";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = await getIssueEntrySubmissionById(id);
  if (!item) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const isAdmin = isAdminRequest(request);
  const isPublic =
    item.status === "approved" && item.publishStatus === "published";
  if (!isPublic && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // An Issue To Publish URL is also an explicit publication file and must
  // take priority over the original manuscript attachment.
  if (!item.pdfBase64 && item.pdfUrl?.trim()) {
    return NextResponse.redirect(item.pdfUrl.trim());
  }

  const file = await loadPublishedEntryPaperExact(item);
  if (!file) {
    return NextResponse.json({ error: "Paper file not available." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const asAttachment = isAdmin && searchParams.get("original") === "1";
  const kind = file.isPdf ? "pdf" : file.isDocx ? "docx" : "doc";
  const originalName = (file.fileName || "paper").replace(/"/g, "");
  // Content-Disposition filename= must be ASCII-safe. Devanagari names crash the response (HTTP 500).
  const asciiName = originalName
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  let safeName = asciiName || (file.isPdf ? "paper.pdf" : file.isDocx ? "paper.docx" : "paper.doc");
  if (file.isPdf && !safeName.toLowerCase().endsWith(".pdf")) {
    safeName = `${safeName.replace(/\.(docx?|DOCX?)$/i, "") || "paper"}.pdf`;
  }
  const contentType = file.isPdf
    ? "application/pdf"
    : file.mimeType || "application/octet-stream";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": contentType,
      // Always inline for public Current Issue reading so browsers don't force download.
      "Content-Disposition": asAttachment
        ? `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`
        : `inline; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "X-File-Name": encodeURIComponent(originalName),
      "X-File-Kind": kind,
      // Needed so Microsoft/Google document viewers can fetch the file.
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function HEAD(request: Request, context: RouteContext) {
  const response = await GET(request, context);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
