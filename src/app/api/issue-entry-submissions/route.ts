import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdminRequest } from "@/lib/adminAuth";
import { getCurrentIssue } from "@/lib/issueStore";
import {
  createIssueEntrySubmission,
  listIssueEntrySubmissions,
} from "@/lib/issueEntrySubmissionStore";
import { resolveFromEmail } from "@/lib/resolveFromEmail";

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
  pdfUrl?: string;
  pdfFileName?: string;
  pdfBytes?: Buffer;
  pdfMimeType?: string;
  submitterEmail: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.MANUSCRIPT_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) return;

  const resend = new Resend(apiKey);
  const fromEmail = resolveFromEmail(process.env.CONTACT_FROM_EMAIL);

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
      `PDF URL: ${input.pdfUrl ?? "Attached in email"}`,
      `Submitter Email: ${input.submitterEmail}`,
      "",
      "Please review and approve from admin panel.",
    ].join("\n"),
    attachments:
      input.pdfBytes && input.pdfFileName
        ? [
            {
              filename: input.pdfFileName,
              content: input.pdfBytes,
              contentType: input.pdfMimeType ?? "application/pdf",
            },
          ]
        : undefined,
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
    const sanitized = items.map((item) => ({
      ...item,
      pdfBase64: undefined,
    }));
    return NextResponse.json({ items: sanitized });
  }

  return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let issueId = "";
  let title = "";
  let author = "";
  let pageNo = "";
  let pdfUrl = "";
  let submitterEmail = "";
  let pdfFileName: string | undefined;
  let pdfMimeType: string | undefined;
  let pdfBase64: string | undefined;
  let pdfBytes: Buffer | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    issueId = clean(String(form.get("issueId") ?? ""));
    title = clean(String(form.get("title") ?? ""));
    author = clean(String(form.get("author") ?? ""));
    pageNo = clean(String(form.get("pageNo") ?? ""));
    pdfUrl = clean(String(form.get("pdfUrl") ?? ""));
    submitterEmail = clean(String(form.get("submitterEmail") ?? ""));
    const pdfFile = form.get("pdfFile");

    if (pdfFile instanceof File && pdfFile.size > 0) {
      if (!pdfFile.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json(
          { error: "Please upload PDF file only." },
          { status: 400 },
        );
      }
      if (pdfFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "PDF size should not exceed 5 MB." },
          { status: 400 },
        );
      }

      pdfFileName = pdfFile.name;
      pdfMimeType = pdfFile.type || "application/pdf";
      pdfBytes = Buffer.from(await pdfFile.arrayBuffer());
      pdfBase64 = pdfBytes.toString("base64");
    }
  } else {
    let payload: CreatePayload;
    try {
      payload = (await request.json()) as CreatePayload;
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    issueId = clean(payload.issueId);
    title = clean(payload.title);
    author = clean(payload.author);
    pageNo = clean(payload.pageNo);
    pdfUrl = clean(payload.pdfUrl);
    submitterEmail = clean(payload.submitterEmail);
  }

  if (!issueId || !title || !author || !pageNo || !submitterEmail) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!pdfUrl && !pdfBase64) {
    return NextResponse.json(
      { error: "Provide a PDF URL or upload a PDF file." },
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
    pdfUrl: pdfUrl || undefined,
    pdfFileName,
    pdfMimeType,
    pdfBase64,
    submitterEmail,
    status: "pending",
    publishStatus: "draft",
  });

  try {
    await sendIssueEntryEmail({
      issueTitle: current.title,
      title,
      author,
      pageNo,
      pdfUrl: pdfUrl || undefined,
      pdfFileName,
      pdfBytes,
      pdfMimeType,
      submitterEmail,
    });
  } catch {
    // Do not block submission if email fails.
  }

  return NextResponse.json({ ok: true, item: submission });
}
