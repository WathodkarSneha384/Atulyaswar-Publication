import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  createIssue,
  getArchiveIssues,
  getCurrentIssue,
  listIssues,
} from "@/lib/issueStore";

type CreateIssuePayload = {
  title?: string;
  publicationWindow?: string;
  volumeDisplay?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const items = await listIssues();
    return NextResponse.json({ items });
  }

  const current = await getCurrentIssue();
  const archives = await getArchiveIssues();
  return NextResponse.json({ current, archives });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: CreateIssuePayload;
  try {
    payload = (await request.json()) as CreateIssuePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const publicationWindow = (payload.publicationWindow ?? "").trim();
  const volumeDisplay = (payload.volumeDisplay ?? "").trim();

  try {
    const issue = await createIssue({ title, publicationWindow, volumeDisplay });
    return NextResponse.json({ ok: true, item: issue });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create issue." },
      { status: 400 },
    );
  }
}
