"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ExactFileReaderProps = {
  title: string;
  fileUrl: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

function extractBodyHtml(fullHtml: string) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1]?.trim() || fullHtml;
}

export default function ExactFileReader({ title, fileUrl }: ExactFileReaderProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [htmlBody, setHtmlBody] = useState("");

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
      setPdfUrl("");
      setHtmlBody("");

      try {
        const response = await fetch(fileUrl, { cache: "no-store" });
        const contentType = (response.headers.get("content-type") || "").toLowerCase();

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Unable to load the paper.");
        }

        if (cancelled) return;

        if (contentType.includes("application/pdf")) {
          const buffer = await response.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const isPdf =
            bytes.length >= 4 &&
            String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "%PDF";
          if (!isPdf) {
            throw new Error("Unable to load the paper.");
          }
          objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
          setPdfUrl(objectUrl);
          setLoading(false);
          return;
        }

        const payload = (await response.json()) as {
          kind?: string;
          html?: string;
          error?: string;
        };
        if (payload.error) throw new Error(payload.error);
        if (!payload.html) throw new Error("Unable to load the paper.");

        setHtmlBody(extractBodyHtml(payload.html));
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
  }, [fileUrl]);

  return (
    <section className="pdf-reader pdf-reader-no-copy">
      <header className="pdf-reader-header">
        <div>
          <h1 className="pdf-reader-title">{title}</h1>
        </div>
        <Link href="/journal/current-issue" className="ghost-admin-btn">
          Back to Current Issue
        </Link>
      </header>

      {loading ? <div className="pdf-reader-loading" aria-hidden="true" /> : null}
      {error ? <p className="pdf-reader-status error">{error}</p> : null}

      {pdfUrl ? (
        <div className="pdf-reader-frame-wrap">
          <iframe
            title={title}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="pdf-reader-frame"
          />
        </div>
      ) : null}

      {htmlBody ? (
        <article
          className="html-reader-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      ) : null}
    </section>
  );
}
