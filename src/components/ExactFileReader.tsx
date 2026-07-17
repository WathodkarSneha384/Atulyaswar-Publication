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

  const filePath = `/api/issue-entry-submissions/${entryId}/pdf`;

  const viewerSrc = useMemo(() => {
    if (typeof window === "undefined" || !kind) return "";
    const absolute = `${window.location.origin}${filePath}`;
    if (kind === "pdf") {
      // Native browser PDF viewer, fit page width.
      return `${filePath}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-width`;
    }
    // Google Docs viewer fits the uploaded Word page to the frame width.
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

    async function detectKind() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(filePath, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!response.ok) {
          const ranged = await fetch(filePath, {
            headers: { Range: "bytes=0-4" },
            cache: "no-store",
          });
          if (!ranged.ok) throw new Error("Unable to load the paper.");
          const headerKind = ranged.headers.get("x-file-kind");
          const name = decodeURIComponent(ranged.headers.get("x-file-name") || "");
          const buf = new Uint8Array(await ranged.arrayBuffer());
          const isPdf =
            buf.length >= 4 &&
            String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) === "%PDF";
          if (cancelled) return;
          setKind(
            isPdf
              ? "pdf"
              : headerKind === "docx" || name.toLowerCase().endsWith(".docx")
                ? "docx"
                : "doc",
          );
          setLoading(false);
          return;
        }

        const headerKind = response.headers.get("x-file-kind");
        const name = decodeURIComponent(response.headers.get("x-file-name") || "");
        if (cancelled) return;
        if (headerKind === "pdf" || headerKind === "docx" || headerKind === "doc") {
          setKind(headerKind);
        } else if (name.toLowerCase().endsWith(".pdf")) {
          setKind("pdf");
        } else if (name.toLowerCase().endsWith(".docx")) {
          setKind("docx");
        } else {
          setKind("doc");
        }
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the paper.");
        setLoading(false);
      }
    }

    void detectKind();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  return (
    <section className="pdf-reader pdf-reader-fullbleed pdf-reader-no-copy">
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

      {viewerSrc ? (
        <div className="pdf-reader-frame-wrap pdf-reader-frame-wrap-tall">
          <iframe
            title={title}
            src={viewerSrc}
            className="pdf-reader-frame"
            allowFullScreen
          />
        </div>
      ) : null}
    </section>
  );
}
