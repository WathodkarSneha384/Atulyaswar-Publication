import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  deleteManuscript,
  getManuscriptById,
  updateManuscript,
} from "@/lib/manuscriptStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  authorNames?: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  paperFileName?: string;
  plagiarismFileName?: string;
  designations?: string[];
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await getManuscriptById(id);
  if (!item) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let payload: UpdatePayload;
  try {
    payload = (await request.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id } = await context.params;
  const updated = await updateManuscript(id, payload);
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const deleted = await deleteManuscript(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
