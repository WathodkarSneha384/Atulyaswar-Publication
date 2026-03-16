import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  createIssue,
  getArchiveIssues,
  getCurrentIssue,
  listIssues,
} from "@/lib/issueStore";

type CreateIssuePayload = {
  year?: string;
  volume?: string;
  issueNo?: string;
  title?: string;
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

  const year = (payload.year ?? "").trim();
  const volume = (payload.volume ?? "").trim();
  const issueNo = (payload.issueNo ?? "").trim();
  const title = (payload.title ?? "").trim();

  if (!year || !volume || !issueNo) {
    return NextResponse.json(
      { error: "Year, volume, and issue no are required." },
      { status: 400 },
    );
  }

  const issue = await createIssue({ year, volume, issueNo, title });
  return NextResponse.json({ ok: true, item: issue });
}
