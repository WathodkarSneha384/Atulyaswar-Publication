import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { rejectManuscript } from "@/lib/manuscriptStore";

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
    // reason is optional, allow empty body
  }

  const { id } = await context.params;
  const updated = await rejectManuscript(id, payload.reason);

  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: updated });
}
