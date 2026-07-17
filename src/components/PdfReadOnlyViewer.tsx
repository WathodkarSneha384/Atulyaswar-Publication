"use client";

import Link from "next/link";
import { useEffect } from "react";

type PdfReadOnlyViewerProps = {
  title: string;
  pdfSrc: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

export default function PdfReadOnlyViewer({ title, pdfSrc }: PdfReadOnlyViewerProps) {
  useEffect(() => {
    const blockClipboard = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", blockCopyShortcuts);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("contextmenu", blockClipboard);
    document.addEventListener("dragstart", blockClipboard);

    return () => {
      window.removeEventListener("keydown", blockCopyShortcuts);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("contextmenu", blockClipboard);
      document.removeEventListener("dragstart", blockClipboard);
    };
  }, []);

  const embedSrc = `${pdfSrc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <section className="pdf-reader pdf-reader-no-copy">
      <header className="pdf-reader-header">
        <div>
          <p className="pdf-reader-kicker">Current Issue</p>
          <h1 className="pdf-reader-title">{title}</h1>
          <p className="pdf-reader-note">Read-only view — copy and download are disabled</p>
        </div>
        <Link href="/journal/current-issue" className="ghost-admin-btn">
          Back to Current Issue
        </Link>
      </header>
      <div className="pdf-reader-frame-wrap">
        <iframe title={`Read: ${title}`} src={embedSrc} className="pdf-reader-frame" />
      </div>
    </section>
  );
}
