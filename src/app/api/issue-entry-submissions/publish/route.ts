import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  publishApprovedIssueEntries,
  publishIssueEntrySubmissions,
} from "@/lib/issueEntrySubmissionStore";

type PublishPayload = {
  issueId?: string;
  submissionIds?: string[];
};

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: PublishPayload;
  try {
    payload = (await request.json()) as PublishPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const issueId = clean(payload.issueId);
  const submissionIds = Array.isArray(payload.submissionIds)
    ? payload.submissionIds.map((id) => clean(id)).filter(Boolean)
    : [];

  if (!issueId && submissionIds.length === 0) {
    return NextResponse.json(
      { error: "Issue id or submission ids are required." },
      { status: 400 },
    );
  }

  if (submissionIds.length > 0) {
    const result = await publishIssueEntrySubmissions(submissionIds);
    return NextResponse.json({
      ok: true,
      publishedCount: result.updatedCount,
    });
  }

  const result = await publishApprovedIssueEntries(issueId);
  return NextResponse.json({
    ok: true,
    publishedCount: result.updatedCount,
  });
}
