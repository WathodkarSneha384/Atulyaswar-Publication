"use client";

import Link from "next/link";
import { useEffect } from "react";

type PdfReadOnlyViewerProps = {
  title: string;
  pdfSrc: string;
};

export default function PdfReadOnlyViewer({ title, pdfSrc }: PdfReadOnlyViewerProps) {
  useEffect(() => {
    const blockKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && (key === "s" || key === "p")) {
        event.preventDefault();
      }
    };
    const blockContext = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockContext);
    return () => {
      window.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, []);

  const embedSrc = `${pdfSrc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <section className="pdf-reader">
      <header className="pdf-reader-header">
        <div>
          <p className="pdf-reader-kicker">Current Issue</p>
          <h1 className="pdf-reader-title">{title}</h1>
          <p className="pdf-reader-note">Read-only view — downloading is disabled</p>
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
