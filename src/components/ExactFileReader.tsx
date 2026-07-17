"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

type ExactFileReaderProps = {
  title: string;
  entryId: string;
  fileUrl: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

function kindFromName(fileName: string, headerKind: string | null) {
  if (headerKind === "pdf" || headerKind === "docx" || headerKind === "doc") {
    return headerKind;
  }
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".doc")) return "doc";
  return "";
}

export default function ExactFileReader({ title, entryId, fileUrl }: ExactFileReaderProps) {
  const docxHostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<"pdf" | "docx" | "doc" | "">("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);

  const officeEmbedUrl = useMemo(() => {
    if (typeof window === "undefined" || kind !== "doc") return "";
    const rawUrl = `${window.location.origin}/api/issue-entry-submissions/${entryId}/pdf?raw=1`;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`;
  }, [entryId, kind]);

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
      setPdfUrl("");
      setDocxBuffer(null);

      try {
        // Always load the original uploaded bytes for faithful display.
        const rawUrl = fileUrl.includes("?")
          ? `${fileUrl}&raw=1`
          : `${fileUrl}?raw=1`;
        const response = await fetch(rawUrl, { cache: "no-store" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Unable to load the paper.");
        }

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const headerName = response.headers.get("x-file-name");
        const fileName = headerName ? decodeURIComponent(headerName) : "";
        const headerKind = response.headers.get("x-file-kind");
        const isPdfMagic =
          bytes.length >= 4 &&
          String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "%PDF";

        if (cancelled) return;

        const detected = isPdfMagic
          ? "pdf"
          : kindFromName(fileName, headerKind);

        if (detected === "pdf") {
          objectUrl = URL.createObjectURL(
            new Blob([buffer], { type: "application/pdf" }),
          );
          setKind("pdf");
          setPdfUrl(objectUrl);
          setLoading(false);
          return;
        }

        if (detected === "docx") {
          setKind("docx");
          setDocxBuffer(buffer);
          setLoading(false);
          return;
        }

        if (detected === "doc") {
          setKind("doc");
          setLoading(false);
          return;
        }

        throw new Error("Unable to load the paper.");
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
  }, [fileUrl]);

  useEffect(() => {
    if (kind !== "docx" || !docxBuffer || !docxHostRef.current) return;
    const host = docxHostRef.current;
    host.innerHTML = "";
    void renderAsync(docxBuffer, host, undefined, {
      className: "docx-preview-doc",
      inWrapper: true,
      ignoreWidth: false,
      breakPages: true,
    }).catch(() => {
      setError("Unable to open this document.");
    });
  }, [kind, docxBuffer]);

  return (
    <section className="pdf-reader pdf-reader-no-copy">
      <header className="pdf-reader-brand-bar">
        <div className="pdf-reader-brand">
          <p className="pdf-reader-brand-name">Atulyaswar</p>
          <p className="pdf-reader-brand-tag">A Peer Reviewed Indian Music Journal</p>
        </div>
        <Link href="/journal/current-issue" className="ghost-admin-btn">
          Back to Current Issue
        </Link>
      </header>

      <h1 className="pdf-reader-title">{title}</h1>

      {loading ? <div className="pdf-reader-loading" aria-hidden="true" /> : null}
      {error ? <p className="pdf-reader-status error">{error}</p> : null}

      {kind === "pdf" && pdfUrl ? (
        <div className="pdf-reader-frame-wrap">
          <iframe
            title={title}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="pdf-reader-frame"
          />
        </div>
      ) : null}

      {kind === "docx" ? <div className="exact-docx-host" ref={docxHostRef} /> : null}

      {kind === "doc" && officeEmbedUrl ? (
        <div className="pdf-reader-frame-wrap">
          <iframe title={title} src={officeEmbedUrl} className="pdf-reader-frame" />
        </div>
      ) : null}
    </section>
  );
}
