import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { rejectIssueEntrySubmission } from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RejectPayload = {
  reason?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: RejectPayload = {};
  try {
    payload = (await request.json()) as RejectPayload;
  } catch {
    // reason is optional, ignore parse errors
  }

  const { id } = await context.params;
  const rejected = await rejectIssueEntrySubmission(id, payload.reason);
  if (!rejected) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: rejected });
}
