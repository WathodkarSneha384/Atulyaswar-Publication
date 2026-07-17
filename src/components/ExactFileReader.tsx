"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ExactFileReaderProps = {
  title: string;
  entryId: string;
};

type PaperKind = "pdf" | "docx" | "doc" | "";

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

export default function ExactFileReader({ title, entryId }: ExactFileReaderProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<PaperKind>("");
  const [pdfObjectUrl, setPdfObjectUrl] = useState("");

  const filePath = `/api/issue-entry-submissions/${entryId}/pdf`;

  // Google Docs viewer keeps the Word masthead as authored (flat purple banner).
  // Our local docx-preview was rewriting it into a bordered card with logo.
  const wordEmbedSrc = useMemo(() => {
    if (typeof window === "undefined" || (kind !== "docx" && kind !== "doc")) {
      return "";
    }
    const absolute = `${window.location.origin}${filePath}`;
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absolute)}`;
  }, [filePath, kind]);

  useEffect(() => {
    const blockClipboard = (event: Event) => event.preventDefault();
    const clearSelection = () => window.getSelection()?.removeAllRanges();

    window.addEventListener("keydown", blockCopyShortcuts);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("selectstart", blockClipboard);
    document.addEventListener("dragstart", blockClipboard);
    document.addEventListener("contextmenu", blockClipboard);
    document.addEventListener("mouseup", clearSelection);

    return () => {
      window.removeEventListener("keydown", blockCopyShortcuts);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("selectstart", blockClipboard);
      document.removeEventListener("dragstart", blockClipboard);
      document.removeEventListener("contextmenu", blockClipboard);
      document.removeEventListener("mouseup", clearSelection);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    async function loadPaper() {
      setLoading(true);
      setError("");
      setKind("");
      setPdfObjectUrl("");

      try {
        const response = await fetch(filePath, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load the paper.");
        }

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const headerKind = (response.headers.get("x-file-kind") || "").toLowerCase();
        const name = decodeURIComponent(response.headers.get("x-file-name") || "");
        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        const isPdfMagic =
          bytes.length >= 4 &&
          String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "%PDF";
        const isPdf =
          isPdfMagic ||
          headerKind === "pdf" ||
          contentType.includes("application/pdf") ||
          name.toLowerCase().endsWith(".pdf");

        if (cancelled) return;

        if (isPdf) {
          objectUrl = URL.createObjectURL(
            new Blob([buffer], { type: "application/pdf" }),
          );
          setKind("pdf");
          setPdfObjectUrl(objectUrl);
          setLoading(false);
          return;
        }

        const isZipMagic =
          bytes.length >= 4 &&
          bytes[0] === 0x50 &&
          bytes[1] === 0x4b &&
          (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
          (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08);
        const isDocx =
          headerKind === "docx" ||
          name.toLowerCase().endsWith(".docx") ||
          contentType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ) ||
          (isZipMagic && !name.toLowerCase().endsWith(".doc"));

        setKind(isDocx ? "docx" : "doc");
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the paper.");
        setLoading(false);
      }
    }

    void loadPaper();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath]);

  const pdfSrc = pdfObjectUrl
    ? `${pdfObjectUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : "";

  return (
    <section className="pdf-reader pdf-reader-fullbleed pdf-reader-no-copy">
      <header className="pdf-reader-toolbar">
        <h1 className="pdf-reader-title">{title}</h1>
        <Link href="/journal/current-issue" className="ghost-admin-btn">
          Back to Current Issue
        </Link>
      </header>

      {loading ? <div className="pdf-reader-loading" aria-hidden="true" /> : null}
      {error ? <p className="pdf-reader-status error">{error}</p> : null}

      {kind === "pdf" && pdfSrc ? (
        <div className="pdf-reader-frame-wrap pdf-reader-frame-wrap-tall">
          <object
            data={pdfSrc}
            type="application/pdf"
            title={title}
            className="pdf-reader-frame"
          >
            <iframe title={title} src={pdfSrc} className="pdf-reader-frame" />
          </object>
        </div>
      ) : null}

      {(kind === "docx" || kind === "doc") && wordEmbedSrc ? (
        <div className="pdf-reader-frame-wrap pdf-reader-frame-wrap-tall">
          <iframe
            title={title}
            src={wordEmbedSrc}
            className="pdf-reader-frame"
            allowFullScreen
          />
        </div>
      ) : null}
    </section>
  );
}
