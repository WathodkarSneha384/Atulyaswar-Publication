import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
} from "@/lib/issueEntrySubmissionStore";

type CreatePayload = {
  issueId?: string;
  title?: string;
  author?: string;
  pageNo?: string;
  pdfUrl?: string;
  submitterEmail?: string;
};

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendIssueEntryEmail(input: {
  issueTitle: string;
  title: string;
  author: string;
  pageNo: string;
  pdfUrl: string;
  submitterEmail: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.MANUSCRIPT_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) return;

  const resend = new Resend(apiKey);
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "Atulyaswar Contact <onboarding@resend.dev>";

  await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: input.submitterEmail,
    subject: `[Issue Entry Submission] ${input.title}`,
    text: [
      "A new issue-entry submission has been received.",
      "",
      `Issue: ${input.issueTitle}`,
      `Title: ${input.title}`,
      `Author: ${input.author}`,
      `Page No: ${input.pageNo}`,
      `PDF URL: ${input.pdfUrl}`,
      `Submitter Email: ${input.submitterEmail}`,
      "",
      "Please review and approve from admin panel.",
    ].join("\n"),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const items = await listIssueEntrySubmissions();
    return NextResponse.json({ items });
  }

  return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: CreatePayload;
  try {
    payload = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const issueId = clean(payload.issueId);
  const title = clean(payload.title);
  const author = clean(payload.author);
  const pageNo = clean(payload.pageNo);
  const pdfUrl = clean(payload.pdfUrl);
  const submitterEmail = clean(payload.submitterEmail);

  if (!issueId || !title || !author || !pageNo || !pdfUrl || !submitterEmail) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!isEmail(submitterEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const current = await getCurrentIssue();
  if (!current || current.id !== issueId) {
    return NextResponse.json(
      { error: "Submissions are open only for current issue." },
      { status: 400 },
    );
  }

  const submission = await createIssueEntrySubmission({
    issueId: current.id,
    issueTitle: current.title,
    title,
    author,
    pageNo,
    pdfUrl,
    submitterEmail,
  });

  try {
    await sendIssueEntryEmail({
      issueTitle: current.title,
      title,
      author,
      pageNo,
      pdfUrl,
      submitterEmail,
    });
  } catch {
    // Do not block submission if email fails.
  }

  return NextResponse.json({ ok: true, item: submission });
}
