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

  if (!item.pdfBase64 && item.pdfUrl?.trim() && !item.manuscriptId) {
    return NextResponse.redirect(item.pdfUrl.trim());
  }

  const file = await loadPublishedEntryPaperExact(item);
  if (!file) {
    return NextResponse.json({ error: "Paper file not available." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const asAttachment = isAdmin && searchParams.get("original") === "1";
  const kind = file.isPdf ? "pdf" : file.isDocx ? "docx" : "doc";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": asAttachment
        ? `attachment; filename="${file.fileName.replace(/"/g, "")}"`
        : "inline",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "X-File-Name": encodeURIComponent(file.fileName),
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
