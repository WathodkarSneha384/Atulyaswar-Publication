"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

/** Strip oversized font-size from docx-preview list number ::before styles. */
function normalizeDocxListMarkers(host: HTMLElement) {
  const styleTags = host.querySelectorAll("style");
  styleTags.forEach((styleEl) => {
    const css = styleEl.textContent || "";
    if (!css.includes(":before") && !css.includes("::before")) return;
    styleEl.textContent = css.replace(
      /(p\.docx-num-[^{]+::?before\s*\{)([^}]*)(\})/gi,
      (_match, start: string, body: string, end: string) => {
        const cleaned = body
          .replace(/font-size\s*:\s*[^;]+;?/gi, "")
          .replace(/font-weight\s*:\s*[^;]+;?/gi, "")
          .replace(/line-height\s*:\s*[^;]+;?/gi, "");
        return `${start}${cleaned} font-size: 1em !important; font-weight: inherit !important; line-height: inherit !important;${end}`;
      },
    );
  });
}

export default function ExactFileReader({ title, entryId }: ExactFileReaderProps) {
  const docxHostRef = useRef<HTMLDivElement | null>(null);
  const docxBufferRef = useRef<ArrayBuffer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<PaperKind>("");
  const [pdfObjectUrl, setPdfObjectUrl] = useState("");
  const [officeEmbedSrc, setOfficeEmbedSrc] = useState("");

  const filePath = `/api/issue-entry-submissions/${entryId}/pdf`;

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
      setOfficeEmbedSrc("");
      docxBufferRef.current = null;
      if (docxHostRef.current) docxHostRef.current.innerHTML = "";

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
          bytes.length >= 5 &&
          String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "%PDF";
        const isPdf =
          isPdfMagic ||
          headerKind === "pdf" ||
          contentType.includes("application/pdf") ||
          name.toLowerCase().endsWith(".pdf");

        if (cancelled) return;

        // Real PDFs: show inline via blob URL (never Google Docs — it often says
        // "No preview available" for our Vercel file URLs).
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

        if (isDocx) {
          docxBufferRef.current = buffer;
          setKind("docx");
          return;
        }

        // Legacy .doc — Office Online (same-origin converters can't render .doc).
        const absolute = `${window.location.origin}${filePath}`;
        setKind("doc");
        setOfficeEmbedSrc(
          `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absolute)}`,
        );
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

  // Render DOCX after host mounts — same-origin, no Google "No preview available".
  useEffect(() => {
    if (kind !== "docx" || !docxBufferRef.current) return;

    let cancelled = false;

    async function renderDocx() {
      const host = docxHostRef.current;
      const buffer = docxBufferRef.current;
      if (!host || !buffer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        host.innerHTML = "";
        const { renderAsync } = await import("docx-preview");
        if (cancelled) return;
        await renderAsync(buffer, host, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          useBase64URL: true,
        });
        if (cancelled) return;
        normalizeDocxListMarkers(host);
      } catch (renderError) {
        if (cancelled) return;
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Unable to display the Word document.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void renderDocx();
    return () => {
      cancelled = true;
    };
  }, [kind]);

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
            <embed src={pdfSrc} type="application/pdf" className="pdf-reader-frame" />
          </object>
        </div>
      ) : null}

      {kind === "docx" ? (
        <div
          ref={docxHostRef}
          className="exact-docx-host exact-docx-host-tall"
          aria-label={title}
        />
      ) : null}

      {kind === "doc" && officeEmbedSrc ? (
        <div className="pdf-reader-frame-wrap pdf-reader-frame-wrap-tall">
          <iframe
            title={title}
            src={officeEmbedSrc}
            className="pdf-reader-frame"
            allowFullScreen
          />
        </div>
      ) : null}
    </section>
  );
}
