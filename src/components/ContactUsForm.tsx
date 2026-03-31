"use client";

import { FormEvent, useState } from "react";
import { apiErrorMessage, caughtErrorMessage } from "@/lib/userMessage";

type SubmitState = "idle" | "submitting" | "success" | "error";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return /^[+]?\d{8,15}$/.test(compact);
}

export default function ContactUsForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.subject || !payload.email || !payload.phone || !payload.message) {
      setState("error");
      setMessage("Please fill all required fields.");
      return;
    }

    if (!isEmail(payload.email)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!isPhone(payload.phone)) {
      setState("error");
      setMessage("Please enter a valid phone number.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !result.ok) {
        throw new Error(apiErrorMessage(result.error, "Could not send your message."));
      }

      form.reset();
      setState("success");
      setMessage("Thank you. Your message has been sent successfully.");
    } catch (error) {
      setState("error");
      setMessage(caughtErrorMessage(error, "Could not send your message."));
    }
  }

  return (
    <form className="submit-form-grid contact-form-grid" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          name="name"
          className="subscribe-input"
          placeholder="Full name"
          required
        />
      </label>
      <label>
        Subject
        <input
          type="text"
          name="subject"
          className="subscribe-input"
          placeholder="Subject"
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="email"
          className="subscribe-input"
          placeholder="name@example.com"
          required
        />
      </label>
      <label>
        Phone No
        <input
          type="tel"
          name="phone"
          className="subscribe-input"
          placeholder="+91 XXXXXXXXXX"
          required
        />
      </label>
      <label className="full-span">
        Message
        <textarea name="message" className="subscribe-input form-textarea" required />
      </label>
      <button
        type="submit"
        className="subscribe-button contact-submit-btn"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Sending..." : "Send"}
      </button>
      {state !== "idle" && (
        <p
          className={`contact-form-status ${
            state === "success" ? "success" : "error"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
