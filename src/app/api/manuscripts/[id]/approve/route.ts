import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
  updateIssueEntrySubmission,
} from "@/lib/issueEntrySubmissionStore";
import {
  approveManuscript,
  getManuscriptById,
} from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Link manuscript → issue entry without embedding the paper bytes.
 * Read resolves the exact file via manuscriptId (avoids huge KV payloads that
 * can fail after the manuscript was already marked approved).
 */
function manuscriptEntryFields(manuscript: {
  id: string;
  title: string;
  authorNames: string;
  email: string;
  paperFileName?: string;
  paperFileMimeType?: string;
}) {
  return {
    manuscriptId: manuscript.id,
    title: manuscript.title,
    author: manuscript.authorNames,
    submitterEmail: manuscript.email,
    pageNo: "TBD" as const,
    status: "approved" as const,
    publishStatus: "published" as const,
    ...(manuscript.paperFileName
      ? {
          pdfFileName: manuscript.paperFileName,
          pdfMimeType: manuscript.paperFileMimeType || "application/octet-stream",
        }
      : {}),
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

  const entryFields = manuscriptEntryFields(manuscript);
  const allEntries = await listIssueEntrySubmissions();
  const existingEntry = allEntries.find((item) => item.manuscriptId === id);

  try {
    if (!existingEntry) {
      await createIssueEntrySubmission({
        ...entryFields,
        issueId: currentIssue.id,
        issueTitle: currentIssue.title,
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
        ...(manuscript.paperFileName && !existingEntry.pdfFileName
          ? {
              pdfFileName: manuscript.paperFileName,
              pdfMimeType:
                manuscript.paperFileMimeType || "application/octet-stream",
            }
          : {}),
      });
    }
  } catch (error) {
    console.error("[atulyaswar] Failed to create/update issue entry on approve:", error);
    return NextResponse.json(
      {
        error:
          "Could not add this manuscript to Issue To Publish / Current Issue. Please try Approve again.",
      },
      { status: 500 },
    );
  }

  const updated = await approveManuscript(id);
  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: updated });
}
