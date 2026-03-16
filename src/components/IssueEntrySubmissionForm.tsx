"use client";

import { FormEvent, useState } from "react";

type Props = {
  issueId: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function IssueEntrySubmissionForm({ issueId }: Props) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      issueId,
      title: String(formData.get("title") ?? "").trim(),
      author: String(formData.get("author") ?? "").trim(),
      pageNo: String(formData.get("pageNo") ?? "").trim(),
      pdfUrl: String(formData.get("pdfUrl") ?? "").trim(),
      submitterEmail: String(formData.get("submitterEmail") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/issue-entry-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to submit issue entry.");
      }

      form.reset();
      setState("success");
      setMessage(
        "Entry submitted successfully. Admin has been notified for review.",
      );
    } catch (submitError) {
      setState("error");
      setMessage(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit issue entry.",
      );
    }
  }

  return (
    <div className="issue-entry-submit-wrap">
      <h3>Submit Entry to Current Issue</h3>
      <p>Your submission will be reviewed by admin before publishing.</p>
      <form className="submit-form-grid" onSubmit={handleSubmit}>
        <label className="full-span">
          Title
          <input className="subscribe-input" name="title" required />
        </label>
        <label className="full-span">
          Author
          <input className="subscribe-input" name="author" required />
        </label>
        <label>
          Page no
          <input className="subscribe-input" name="pageNo" required />
        </label>
        <label>
          Submitter Email
          <input
            type="email"
            className="subscribe-input"
            name="submitterEmail"
            required
          />
        </label>
        <label className="full-span">
          PDF URL
          <input type="url" className="subscribe-input" name="pdfUrl" required />
        </label>
        <button type="submit" className="subscribe-button" disabled={state === "submitting"}>
          {state === "submitting" ? "Submitting..." : "Submit Entry"}
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
    </div>
  );
}
