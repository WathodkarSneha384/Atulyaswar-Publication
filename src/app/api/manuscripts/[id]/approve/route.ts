import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
} from "@/lib/issueEntrySubmissionStore";
import {
  approveManuscript,
  getManuscriptById,
} from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const currentIssue = await getCurrentIssue();
  if (!currentIssue) {
    return NextResponse.json(
      { error: "Create a current issue before approving manuscripts." },
      { status: 400 },
    );
  }

  const manuscript = await getManuscriptById(id);
  if (!manuscript) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const updated = await approveManuscript(id);

  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const allEntries = await listIssueEntrySubmissions();
  const existingEntry = allEntries.find((item) => item.manuscriptId === id);
  if (!existingEntry) {
    await createIssueEntrySubmission({
      manuscriptId: id,
      issueId: currentIssue.id,
      issueTitle: currentIssue.title,
      title: manuscript.title,
      author: manuscript.authorNames,
      pageNo: "TBD",
      submitterEmail: manuscript.email,
      status: "approved",
      publishStatus: "draft",
    });
  }

  return NextResponse.json({ ok: true, item: updated });
}
