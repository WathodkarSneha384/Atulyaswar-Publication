import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
  updateIssueEntrySubmission,
} from "@/lib/issueEntrySubmissionStore";
import { readManuscriptAttachment } from "@/lib/manuscriptFiles";
import {
  approveManuscript,
  getManuscriptById,
} from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function loadManuscriptPdfFields(manuscript: {
  id: string;
  paperFileName: string;
  paperFileMimeType?: string;
  paperFileBase64?: string;
}) {
  const isPdf =
    manuscript.paperFileName.toLowerCase().endsWith(".pdf") ||
    (manuscript.paperFileMimeType ?? "").toLowerCase().includes("pdf");
  if (!isPdf) return null;

  try {
    const buffer = await readManuscriptAttachment({
      id: manuscript.id,
      kind: "paper",
      originalFileName: manuscript.paperFileName,
    });
    return {
      pdfFileName: manuscript.paperFileName,
      pdfMimeType: manuscript.paperFileMimeType || "application/pdf",
      pdfBase64: buffer.toString("base64"),
    };
  } catch {
    if (manuscript.paperFileBase64) {
      return {
        pdfFileName: manuscript.paperFileName,
        pdfMimeType: manuscript.paperFileMimeType || "application/pdf",
        pdfBase64: manuscript.paperFileBase64,
      };
    }
    return null;
  }
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

  const pdfFields = await loadManuscriptPdfFields(manuscript);
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
      // Publish immediately so the paper appears on Current Issue after approve.
      publishStatus: "published",
      ...(pdfFields ?? {}),
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
      ...(pdfFields && !existingEntry.pdfBase64 && !existingEntry.pdfUrl
        ? pdfFields
        : {}),
    });
  }

  return NextResponse.json({ ok: true, item: updated });
}
