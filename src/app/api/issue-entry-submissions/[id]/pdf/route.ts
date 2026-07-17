import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { resolveIssueEntryFile } from "@/lib/issueEntryFile";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

  const file = await resolveIssueEntryFile(item);
  if (!file) {
    return NextResponse.json(
      {
        error:
          "No uploaded file available for this entry. Upload a PDF under Issue To Publish, or open the manuscript Paper link.",
      },
      { status: 404 },
    );
  }

  // Public Current Issue: always inline (read), never force download.
  // Admin DOC/DOCX can still download as attachment for review.
  const disposition =
    isAdmin && !file.isPdf
      ? `attachment; filename="${file.fileName.replace(/"/g, "")}"`
      : "inline";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.isPdf
        ? "application/pdf"
        : file.mimeType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
