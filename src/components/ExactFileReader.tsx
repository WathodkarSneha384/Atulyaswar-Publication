"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ExactFileReaderProps = {
  title: string;
  entryId: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

export default function ExactFileReader({ title, entryId }: ExactFileReaderProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<"pdf" | "docx" | "doc" | "">("");
  const [pdfObjectUrl, setPdfObjectUrl] = useState("");

  const filePath = `/api/issue-entry-submissions/${entryId}/pdf`;

  const viewerSrc = useMemo(() => {
    if (typeof window === "undefined" || !kind) return "";
    if (kind === "pdf") {
      // Blob URL forces inline PDF viewing (avoids browser download prompt).
      return pdfObjectUrl
        ? `${pdfObjectUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
        : "";
    }
    const absolute = `${window.location.origin}${filePath}`;
    // Word files keep the current Google Docs viewer.
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absolute)}`;
  }, [filePath, kind, pdfObjectUrl]);

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

        if (headerKind === "docx" || name.toLowerCase().endsWith(".docx")) {
          setKind("docx");
          setLoading(false);
          return;
        }

        setKind("doc");
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

      {viewerSrc ? (
        <div className="pdf-reader-frame-wrap pdf-reader-frame-wrap-tall">
          {kind === "pdf" ? (
            <object
              data={viewerSrc}
              type="application/pdf"
              title={title}
              className="pdf-reader-frame"
            >
              <iframe title={title} src={viewerSrc} className="pdf-reader-frame" />
            </object>
          ) : (
            <iframe
              title={title}
              src={viewerSrc}
              className="pdf-reader-frame"
              allowFullScreen
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
