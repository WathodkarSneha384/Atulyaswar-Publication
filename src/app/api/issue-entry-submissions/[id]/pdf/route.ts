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
          "No uploaded file available for this entry. Open Paper on the manuscript, or upload a PDF under Issue To Publish.",
      },
      { status: 404 },
    );
  }

  // Same bytes for admin and public. Public is always inline (read); admin DOC may download.
  const disposition =
    isAdmin && !file.isPdf
      ? `attachment; filename="${file.fileName.replace(/"/g, "")}"`
      : "inline";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "X-File-Name": encodeURIComponent(file.fileName),
    },
  });
}
