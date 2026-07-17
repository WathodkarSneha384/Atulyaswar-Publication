import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
  updateIssueEntrySubmission,
} from "@/lib/issueEntrySubmissionStore";
import { loadManuscriptFileBlob } from "@/lib/manuscriptFileStore";
import {
  approveManuscript,
  getManuscriptById,
} from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** Attach the exact manuscript paper file to the issue entry (same file admin downloads). */
async function loadManuscriptPaperFields(manuscript: {
  id: string;
  paperFileName: string;
  paperFileMimeType?: string;
  paperFileBase64?: string;
}) {
  const stored = await loadManuscriptFileBlob({
    id: manuscript.id,
    kind: "paper",
    fileName: manuscript.paperFileName,
    fallbackBase64: manuscript.paperFileBase64,
    fallbackMimeType: manuscript.paperFileMimeType,
  });

  if (!stored?.base64) return null;

  return {
    pdfFileName: stored.fileName || manuscript.paperFileName,
    pdfMimeType:
      stored.mimeType ||
      manuscript.paperFileMimeType ||
      "application/octet-stream",
    pdfBase64: stored.base64,
  };
}

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

  const paperFields = await loadManuscriptPaperFields(manuscript);
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
      publishStatus: "published",
      ...(paperFields ?? {}),
    });
  } else {
    await updateIssueEntrySubmission(existingEntry.id, {
      issueId: currentIssue.id,
      issueTitle: currentIssue.title,
      title: manuscript.title,
      author: manuscript.authorNames,
      submitterEmail: manuscript.email,
      status: "approved",
      publishStatus: "published",
      rejectedReason: undefined,
      ...(paperFields && !existingEntry.pdfBase64 ? paperFields : {}),
    });
  }

  return NextResponse.json({ ok: true, item: updated });
}
