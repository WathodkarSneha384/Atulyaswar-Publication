"use client";

import { FormEvent, useMemo, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

const designationOptions = [
  "Researcher",
  "Faculty member",
  "Artist",
  "Musicologist",
] as const;

export default function SubmitManuscriptForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const designationValue = useMemo(() => selected.join(", "), [selected]);

  function toggleDesignation(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("designations", designationValue);

    try {
      const response = await fetch("/api/manuscripts", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not submit manuscript.");
      }

      form.reset();
      setSelected([]);
      setState("success");
      setMessage(
        "Manuscript submitted successfully. Admin has been notified for review.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not submit manuscript.",
      );
    }
  }

  return (
    <form className="submit-form-grid" onSubmit={handleSubmit}>
      <label className="full-span">
        1. Author name(s)
        <input type="text" name="authorNames" className="subscribe-input" required />
      </label>

      <fieldset className="full-span manuscript-fieldset">
        <legend>2. Designation (Multiple option selection) for each author</legend>
        {designationOptions.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleDesignation(option)}
            />
            {" "}
            {option}
          </label>
        ))}
      </fieldset>
      <input type="hidden" name="designations" value={designationValue} />

      <label className="full-span">
        3. Research Paper Title
        <input type="text" name="title" className="subscribe-input" required />
      </label>
      <label>
        4. Email
        <input type="email" name="email" className="subscribe-input" required />
      </label>
      <label>
        5. Phone
        <input type="tel" name="phone" className="subscribe-input" required />
      </label>
      <label className="full-span">
        6. Address with pincode
        <textarea name="address" className="subscribe-input form-textarea" required />
      </label>
      <label className="full-span">
        7. Upload Paper: Max. size 5 MB, DOCX/DOC format only
        <input
          type="file"
          name="paperFile"
          className="subscribe-input"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
        />
      </label>
      <label className="full-span">
        8. Upload Plagiarism report: Max. size 5 MB, PDF file only
        <input
          type="file"
          name="plagiarismFile"
          className="subscribe-input"
          accept=".pdf,application/pdf"
          required
        />
      </label>
      <label className="full-span checkbox-row">
        <input type="checkbox" name="accepted" value="true" required />
        {" "}
        9. I accept terms and conditions
      </label>
      <button type="submit" className="subscribe-button" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting..." : "10. Submit"}
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
