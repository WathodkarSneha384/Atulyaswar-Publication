"use client";

import Link from "next/link";

type HtmlReadOnlyViewerProps = {
  title: string;
  html: string;
};

export default function HtmlReadOnlyViewer({ title, html }: HtmlReadOnlyViewerProps) {
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
      <article
        className="html-reader-content"
        onContextMenu={(event) => event.preventDefault()}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
