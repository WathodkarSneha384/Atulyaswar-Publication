import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createManuscript, listManuscripts } from "@/lib/manuscriptStore";
import { isAdminRequest } from "@/lib/adminAuth";
import { saveManuscriptAttachments } from "@/lib/manuscriptFiles";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DOC_EXTENSIONS = [".doc", ".docx"];
const ADMIN_SUBMISSION_EMAIL = "atulyaswarpublication@gmail.com";

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

function sanitizeManuscriptForResponse(item: Record<string, unknown>) {
  const copy: Record<string, unknown> = { ...item };
  delete copy.paperFileBase64;
  delete copy.plagiarismFileBase64;
  return copy;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return /^[+]?\d{8,15}$/.test(compact);
}

function hasSixDigitPincode(value: string) {
  return /\b\d{6}\b/.test(value);
}

async function sendSubmissionEmails(options: {
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

  const toEmail =
    process.env.MANUSCRIPT_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? ADMIN_SUBMISSION_EMAIL;

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "Atulyaswar Contact <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const paperBytes = Buffer.from(await options.paperFile.arrayBuffer());
  const plagiarismBytes = Buffer.from(await options.plagiarismFile.arrayBuffer());

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: [options.email],
      subject: "Manuscript received",
      text: [
        "Respected Author,",
        "This email is to confirm that we have successfully received your manuscript and all accompanying files.",
        "Regards,",
        "Atulyaswar - A peer reviewed, Indian Music Journal",
      ].join("\n"),
    }),
    resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: options.email,
      subject: `[Manuscript Submission] ${options.title}`,
      text: [
        "A new manuscript has been submitted.",
        "",
        `Author name(s): ${options.authorNames}`,
        `Designation(s): ${options.designations.join(", ")}`,
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
    }),
  ]);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "all") {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const all = await listManuscripts();
    return NextResponse.json({
      items: all.map((item) => sanitizeManuscriptForResponse(item)),
    });
  }

  const approved = await listManuscripts("approved");
  return NextResponse.json({
    items: approved.map((item) => sanitizeManuscriptForResponse(item)),
  });
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

  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  if (!hasSixDigitPincode(address)) {
    return NextResponse.json(
      { error: "Address should include a valid 6-digit pincode." },
      { status: 400 },
    );
  }

  if (designations.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one designation." },
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
    paperFileMimeType: paperFile.type || "application/octet-stream",
    paperFileBase64: Buffer.from(await paperFile.arrayBuffer()).toString("base64"),
    plagiarismFileName: plagiarismFile.name,
    plagiarismFileMimeType: plagiarismFile.type || "application/pdf",
    plagiarismFileBase64: Buffer.from(await plagiarismFile.arrayBuffer()).toString("base64"),
  });

  try {
    await saveManuscriptAttachments({
      id: record.id,
      paperFileName: paperFile.name,
      paperBuffer: Buffer.from(record.paperFileBase64 ?? "", "base64"),
      plagiarismFileName: plagiarismFile.name,
      plagiarismBuffer: Buffer.from(record.plagiarismFileBase64 ?? "", "base64"),
    });
  } catch {
    // Non-blocking: attachments are also persisted in manuscript record.
  }

  try {
    await sendSubmissionEmails({
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
    return NextResponse.json(
      {
        error:
          "Submission saved, but email could not be sent right now. Please contact the journal office.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: record.id });
}
