import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  resolveIssueEntryFile,
  resolveIssueEntryOriginalFile,
} from "@/lib/issueEntryFile";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const maxDuration = 30;

function mimeForFile(fileName: string, isPdf: boolean, fallback?: string) {
  const lower = fileName.toLowerCase();
  if (isPdf || lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) return "application/msword";
  return fallback || "application/octet-stream";
}

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

  const { searchParams } = new URL(request.url);
  const asAttachment = isAdmin && searchParams.get("original") === "1";

  if (!item.pdfBase64 && item.pdfUrl?.trim() && !item.manuscriptId) {
    return NextResponse.redirect(item.pdfUrl.trim());
  }

  // Prefer the original uploaded manuscript paper so formatting stays intact.
  const file =
    (await resolveIssueEntryOriginalFile(item)) ||
    (await resolveIssueEntryFile(item));

  if (!file) {
    return NextResponse.json({ error: "Paper file not available." }, { status: 404 });
  }

  const contentType = mimeForFile(file.fileName, file.isPdf, file.mimeType);
  const disposition =
    asAttachment && !file.isPdf
      ? `attachment; filename="${file.fileName.replace(/"/g, "")}"`
      : "inline";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=120",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "X-File-Name": encodeURIComponent(file.fileName),
      "X-File-Kind": file.isPdf ? "pdf" : file.isDocx ? "docx" : "doc",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
