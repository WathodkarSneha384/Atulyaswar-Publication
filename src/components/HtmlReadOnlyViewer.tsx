"use client";

import Link from "next/link";
import { useEffect } from "react";

type HtmlReadOnlyViewerProps = {
  title: string;
  html: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

export default function HtmlReadOnlyViewer({ title, html }: HtmlReadOnlyViewerProps) {
  useEffect(() => {
    const blockClipboard = (event: Event) => {
      event.preventDefault();
    };
    const blockSelect = () => {
      const selection = window.getSelection();
      selection?.removeAllRanges();
    };

    window.addEventListener("keydown", blockCopyShortcuts);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("selectstart", blockClipboard);
    document.addEventListener("dragstart", blockClipboard);
    document.addEventListener("contextmenu", blockClipboard);
    document.addEventListener("mouseup", blockSelect);

    return () => {
      window.removeEventListener("keydown", blockCopyShortcuts);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("selectstart", blockClipboard);
      document.removeEventListener("dragstart", blockClipboard);
      document.removeEventListener("contextmenu", blockClipboard);
      document.removeEventListener("mouseup", blockSelect);
    };
  }, []);

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
      <article
        className="html-reader-content"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
