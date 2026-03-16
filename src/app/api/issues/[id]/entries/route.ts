import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { addIssueEntry } from "@/lib/issueStore";

type EntryPayload = {
  title?: string;
  author?: string;
  pageNo?: string;
  pdfUrl?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: EntryPayload;
  try {
    payload = (await request.json()) as EntryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const author = (payload.author ?? "").trim();
  const pageNo = (payload.pageNo ?? "").trim();
  const pdfUrl = (payload.pdfUrl ?? "").trim();

  if (!title || !author || !pageNo || !pdfUrl) {
    return NextResponse.json(
      { error: "All fields are required for an issue entry." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const issue = await addIssueEntry(id, { title, author, pageNo, pdfUrl });
  if (!issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: issue });
}
