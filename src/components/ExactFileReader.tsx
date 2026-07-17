"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ExactFileReaderProps = {
  title: string;
  /** Public PDF endpoint (auto-converts DOC/DOCX to print-style PDF). */
  fileUrl: string;
};

function blockCopyShortcuts(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "s", "p"].includes(key)) {
    event.preventDefault();
  }
}

export default function ExactFileReader({ title, fileUrl }: ExactFileReaderProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [pageWidth, setPageWidth] = useState(900);

  useEffect(() => {
    const updateWidth = () => setPageWidth(Math.min(920, window.innerWidth - 48));
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

    async function loadPdf() {
      setLoading(true);
      setError("");
      setPdfData(null);
      setPageCount(0);

      try {
        const response = await fetch(fileUrl, { cache: "no-store" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Unable to load the paper PDF.");
        }

        const buffer = await response.arrayBuffer();
        const headerName = response.headers.get("x-file-name");
        if (cancelled) return;
        setFileName(headerName ? decodeURIComponent(headerName) : "");
        setPdfData(new Uint8Array(buffer));
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load the paper PDF.",
        );
        setLoading(false);
      }
    }

    void loadPdf();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <section className="pdf-reader pdf-reader-no-copy">
      <header className="pdf-reader-header">
        <div>
          <p className="pdf-reader-kicker">Current Issue</p>
          <h1 className="pdf-reader-title">{title}</h1>
          <p className="pdf-reader-note">
            Read-only PDF view — copy and download are disabled
            {fileName ? ` · ${fileName}` : ""}
          </p>
        </div>
        <Link href="/journal/current-issue" className="ghost-admin-btn">
          Back to Current Issue
        </Link>
      </header>

      {loading ? (
        <p className="pdf-reader-status">
          Preparing PDF… (Word papers are converted on first open)
        </p>
      ) : null}
      {error ? <p className="pdf-reader-status error">{error}</p> : null}

      {pdfData ? (
        <div className="exact-pdf-pages">
          <Document
            file={{ data: pdfData }}
            loading={<p className="pdf-reader-status">Opening PDF…</p>}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            onLoadError={() => setError("Could not open this PDF in the reader.")}
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      ) : null}
    </section>
  );
}
