import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
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

  const isPublic = item.status === "approved";
  if (!isPublic && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!item.pdfBase64) {
    return NextResponse.json({ error: "No uploaded PDF available." }, { status: 404 });
  }

  const buffer = Buffer.from(item.pdfBase64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": item.pdfMimeType || "application/pdf",
      "Content-Disposition": `inline; filename=\"${item.pdfFileName || "submission.pdf"}\"`,
      "Cache-Control": "no-store",
    },
  });
}
