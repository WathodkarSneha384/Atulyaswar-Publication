import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { addIssueEntry } from "@/lib/issueStore";
import {
  approveIssueEntrySubmission,
  listIssueEntrySubmissions,
} from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const submissions = await listIssueEntrySubmissions();
  const item = submissions.find((submission) => submission.id === id);
  if (!item) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  if (item.status !== "approved") {
    const updatedIssue = await addIssueEntry(item.issueId, {
      title: item.title,
      author: item.author,
      pageNo: item.pageNo,
      pdfUrl: item.pdfUrl,
    });
    if (!updatedIssue) {
      return NextResponse.json(
        { error: "Related issue not found." },
        { status: 400 },
      );
    }
  }

  const approved = await approveIssueEntrySubmission(id);
  return NextResponse.json({ ok: true, item: approved });
}
