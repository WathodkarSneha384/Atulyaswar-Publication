import { NextResponse } from "next/server";
import { Resend } from "resend";
import { resolveFromEmail } from "@/lib/resolveFromEmail";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return /^[+]?\d{8,15}$/.test(compact);
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(payload.name);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const subject = clean(payload.subject);
  const message = clean(payload.message);

  if (!name || !email || !phone || !subject || !message) {
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

  if (!isPhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Email service is not configured yet." },
      { status: 500 },
    );
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = resolveFromEmail(process.env.CONTACT_FROM_EMAIL);

  if (!toEmail) {
    return NextResponse.json(
      { error: "Recipient email is not configured yet." },
      { status: 500 },
    );
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[Contact Us] ${subject}`,
      text: [
        "New contact form submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send email right now. Please try again." },
      { status: 500 },
    );
  }
}
