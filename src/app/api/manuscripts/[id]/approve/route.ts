import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { approveManuscript } from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const updated = await approveManuscript(id);

  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: updated });
}
