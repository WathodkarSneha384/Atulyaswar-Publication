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

  // External URL only — redirect public/admin there when no stored bytes.
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

  // Public Current Issue reader only serves PDFs inline.
  if (!isAdmin && !file.isPdf) {
    return NextResponse.json(
      {
        error:
          "A PDF version is required for public reading. Please upload a PDF for this entry.",
      },
      { status: 404 },
    );
  }

  const disposition = file.isPdf
    ? "inline"
    : `attachment; filename="${file.fileName.replace(/"/g, "")}"`;

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
