"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { apiErrorMessage, caughtErrorMessage } from "@/lib/userMessage";

type SubmitState = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<
  Record<
    | "authorNames"
    | "title"
    | "designations"
    | "email"
    | "phone"
    | "address"
    | "paperFile"
    | "plagiarismFile"
    | "accepted",
    string
  >
>;

const designationOptions = [
  "Researcher",
  "Faculty member",
  "Artist",
  "Musicologist",
] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DOC_EXTENSIONS = [".doc", ".docx"];

function hasAllowedDocExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return DOC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isPdf(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf");
}

function hasSixDigitPincode(value: string) {
  return /\b\d{6}\b/.test(value);
}

function isValidPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  return /^[+]?\d{8,15}$/.test(compact);
}

export default function SubmitManuscriptForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [paperFileName, setPaperFileName] = useState("");
  const [plagiarismFileName, setPlagiarismFileName] = useState("");

  const designationValue = useMemo(() => selected.join(", "), [selected]);

  function toggleDesignation(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
    setFieldErrors((prev) => ({ ...prev, designations: "" }));
  }

  function handlePaperFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setPaperFileName(selectedFile?.name ?? "");
    setFieldErrors((prev) => ({ ...prev, paperFile: "" }));
  }

  function handlePlagiarismFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setPlagiarismFileName(selectedFile?.name ?? "");
    setFieldErrors((prev) => ({ ...prev, plagiarismFile: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("designations", designationValue);
    const authorNames = String(formData.get("authorNames") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const paperFile = formData.get("paperFile");
    const plagiarismFile = formData.get("plagiarismFile");
    const accepted = formData.get("accepted");
    const errors: FieldErrors = {};

    if (!authorNames || !title || !email || !phone || !address) {
      if (!authorNames) errors.authorNames = "Author name is required.";
      if (!title) errors.title = "Research paper title is required.";
      if (!email) errors.email = "Email is required.";
      if (!phone) errors.phone = "Phone number is required.";
      if (!address) errors.address = "Address with pincode is required.";
    }

    if (selected.length === 0) {
      errors.designations = "Please select at least one designation.";
    }

    if (phone && !isValidPhone(phone)) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (address && !hasSixDigitPincode(address)) {
      errors.address = "Address should include a valid 6-digit pincode.";
    }

    if (!(paperFile instanceof File) || !(plagiarismFile instanceof File)) {
      if (!(paperFile instanceof File)) errors.paperFile = "Please upload paper file.";
      if (!(plagiarismFile instanceof File)) {
        errors.plagiarismFile = "Please upload plagiarism report.";
      }
    }

    if (paperFile instanceof File && !hasAllowedDocExtension(paperFile.name)) {
      errors.paperFile = "Paper file must be DOC or DOCX.";
    }

    if (plagiarismFile instanceof File && !isPdf(plagiarismFile.name)) {
      errors.plagiarismFile = "Plagiarism report must be a PDF file.";
    }

    if (paperFile instanceof File && paperFile.size > MAX_FILE_SIZE) {
      errors.paperFile = "Paper file size should not exceed 5 MB.";
    }
    if (plagiarismFile instanceof File && plagiarismFile.size > MAX_FILE_SIZE) {
      errors.plagiarismFile = "Plagiarism file size should not exceed 5 MB.";
    }

    if (accepted !== "true") {
      errors.accepted = "Please accept terms and conditions.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setState("error");
      setMessage("Please fix the highlighted form fields.");
      return;
    }

    setState("submitting");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/manuscripts", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !data.ok) {
        throw new Error(apiErrorMessage(data.error, "Could not submit manuscript."));
      }

      form.reset();
      setSelected([]);
      setPaperFileName("");
      setPlagiarismFileName("");
      setState("success");
      setMessage(
        "Manuscript submitted successfully. Admin has been notified for review.",
      );
    } catch (error) {
      setState("error");
      setMessage(caughtErrorMessage(error, "Could not submit manuscript."));
    }
  }

  return (
    <div className="submit-manuscript-layout">
      <form className="submit-form-grid submit-manuscript-card" onSubmit={handleSubmit}>
        <h3 className="full-span">Manuscript Submission Form</h3>
        <p className="full-span manuscript-form-help">
          Fields marked * are mandatory.
        </p>

        <label>
          Author name(s) *
          <input
            type="text"
            name="authorNames"
            className="subscribe-input"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, authorNames: "" }))}
          />
          {fieldErrors.authorNames && <span className="field-error-text">{fieldErrors.authorNames}</span>}
        </label>

        <label>
          Research Paper Title *
          <input
            type="text"
            name="title"
            className="subscribe-input"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, title: "" }))}
          />
          {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
        </label>

        <fieldset className="full-span manuscript-fieldset">
          <legend>Designation *</legend>
          <div className="manuscript-designation-grid">
            {designationOptions.map((option) => (
              <label key={option} className="manuscript-option-label">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleDesignation(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {fieldErrors.designations && (
          <p className="field-error-text full-span">{fieldErrors.designations}</p>
        )}
        <input type="hidden" name="designations" value={designationValue} />
        <label>
          Email *
          <input
            type="email"
            name="email"
            className="subscribe-input"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, email: "" }))}
          />
          {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
        </label>
        <label>
          Phone *
          <input
            type="tel"
            name="phone"
            className="subscribe-input"
            placeholder="+91 9765556076"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, phone: "" }))}
          />
          {fieldErrors.phone && <span className="field-error-text">{fieldErrors.phone}</span>}
        </label>
        <label className="full-span">
          Address with pincode *
          <textarea
            name="address"
            className="subscribe-input form-textarea"
            placeholder="Full postal address with 6-digit pincode"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, address: "" }))}
          />
          {fieldErrors.address && <span className="field-error-text">{fieldErrors.address}</span>}
        </label>
        <div className="file-upload-field">
          Upload Paper: Max. size 5 MB, DOCX/DOC format only *
          <input
            id="paperFile"
            type="file"
            name="paperFile"
            className="visually-hidden-file-input"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            onChange={handlePaperFileChange}
          />
          <label htmlFor="paperFile" className="file-picker-row">
            <span className="file-picker-button">Select file</span>
            <span className="file-picker-name">
              {paperFileName || "No file selected"}
            </span>
          </label>
          {fieldErrors.paperFile && <span className="field-error-text">{fieldErrors.paperFile}</span>}
        </div>
        <div className="file-upload-field">
          Upload Plagiarism report: Max. size 5 MB, PDF file only *
          <input
            id="plagiarismFile"
            type="file"
            name="plagiarismFile"
            className="visually-hidden-file-input"
            accept=".pdf,application/pdf"
            required
            onChange={handlePlagiarismFileChange}
          />
          <label htmlFor="plagiarismFile" className="file-picker-row">
            <span className="file-picker-button">Select file</span>
            <span className="file-picker-name">
              {plagiarismFileName || "No file selected"}
            </span>
          </label>
          {fieldErrors.plagiarismFile && (
            <span className="field-error-text">{fieldErrors.plagiarismFile}</span>
          )}
        </div>
        <label className="full-span checkbox-row">
          <input
            type="checkbox"
            name="accepted"
            value="true"
            required
            onChange={() => setFieldErrors((prev) => ({ ...prev, accepted: "" }))}
          />
          {" "}
          I accept terms and conditions *
        </label>
        {fieldErrors.accepted && <p className="field-error-text full-span">{fieldErrors.accepted}</p>}
        <button
          type="submit"
          className="subscribe-button submit-button-centered full-span"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? "Submitting..." : "Submit"}
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
