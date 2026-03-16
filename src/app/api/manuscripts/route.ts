import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createManuscript, listManuscripts } from "@/lib/manuscriptStore";
import { isAdminRequest } from "@/lib/adminAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DOC_EXTENSIONS = [".doc", ".docx"];

function hasAllowedDocExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return DOC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isPdf(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf");
}

function parseDesignations(raw: FormDataEntryValue | null) {
  const value = typeof raw === "string" ? raw : "";
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function sendSubmissionEmail(options: {
  authorNames: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  designations: string[];
  paperFile: File;
  plagiarismFile: File;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const toEmail = process.env.MANUSCRIPT_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL;
  if (!toEmail) return;

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "Atulyaswar Contact <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const paperBytes = Buffer.from(await options.paperFile.arrayBuffer());
  const plagiarismBytes = Buffer.from(await options.plagiarismFile.arrayBuffer());

  await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: options.email,
    subject: `[Manuscript Submission] ${options.title}`,
    text: [
      "A new manuscript has been submitted.",
      "",
      `Author name(s): ${options.authorNames}`,
      `Designation(s): ${options.designations.join(", ") || "Not provided"}`,
      `Research paper title: ${options.title}`,
      `Email: ${options.email}`,
      `Phone: ${options.phone}`,
      `Address with pincode: ${options.address}`,
      "",
      `Paper file: ${options.paperFile.name}`,
      `Plagiarism report: ${options.plagiarismFile.name}`,
    ].join("\n"),
    attachments: [
      {
        filename: options.paperFile.name,
        content: paperBytes,
      },
      {
        filename: options.plagiarismFile.name,
        content: plagiarismBytes,
      },
    ],
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const all = await listManuscripts();
    return NextResponse.json({ items: all });
  }

  const approved = await listManuscripts("approved");
  return NextResponse.json({ items: approved });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const authorNames = clean(formData.get("authorNames"));
  const title = clean(formData.get("title"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const address = clean(formData.get("address"));
  const designations = parseDesignations(formData.get("designations"));

  const paperFile = formData.get("paperFile");
  const plagiarismFile = formData.get("plagiarismFile");
  const accepted = formData.get("accepted");

  if (!authorNames || !title || !email || !phone || !address) {
    return NextResponse.json(
      { error: "Please fill all required fields." },
      { status: 400 },
    );
  }

  if (!(paperFile instanceof File) || !(plagiarismFile instanceof File)) {
    return NextResponse.json(
      { error: "Please upload both required files." },
      { status: 400 },
    );
  }

  if (!hasAllowedDocExtension(paperFile.name)) {
    return NextResponse.json(
      { error: "Paper file must be DOC or DOCX." },
      { status: 400 },
    );
  }

  if (!isPdf(plagiarismFile.name)) {
    return NextResponse.json(
      { error: "Plagiarism report must be a PDF file." },
      { status: 400 },
    );
  }

  if (paperFile.size > MAX_FILE_SIZE || plagiarismFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size should not exceed 5 MB." },
      { status: 400 },
    );
  }

  if (accepted !== "true") {
    return NextResponse.json(
      { error: "Please accept terms and conditions." },
      { status: 400 },
    );
  }

  const record = await createManuscript({
    authorNames,
    designations,
    title,
    email,
    phone,
    address,
    paperFileName: paperFile.name,
    plagiarismFileName: plagiarismFile.name,
  });

  try {
    await sendSubmissionEmail({
      authorNames,
      title,
      email,
      phone,
      address,
      designations,
      paperFile,
      plagiarismFile,
    });
  } catch {
    // Submission should still be accepted even if email delivery fails.
  }

  return NextResponse.json({ ok: true, id: record.id });
}
