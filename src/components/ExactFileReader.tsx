"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const html2pdf = (await import("html2pdf.js")).default;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#fff";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const blob = (await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: "paper.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(container)
      .outputPdf("blob")) as Blob;

    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  } finally {
    container.remove();
  }
}

export default function ExactFileReader({ title, fileUrl }: ExactFileReaderProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading paper…");
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

    async function loadPaper() {
      setLoading(true);
      setError("");
      setPdfData(null);
      setPageCount(0);
      setStatus("Loading paper…");

      try {
        const response = await fetch(fileUrl, { cache: "no-store" });
        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        const headerName = response.headers.get("x-file-name");

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Unable to load the paper.");
        }

        if (cancelled) return;
        setFileName(headerName ? decodeURIComponent(headerName) : "");

        if (contentType.includes("application/pdf")) {
          const buffer = await response.arrayBuffer();
          if (cancelled) return;
          setPdfData(new Uint8Array(buffer));
          setLoading(false);
          return;
        }

        // Word papers arrive as print HTML; convert to PDF in the browser.
        setStatus("Converting Word paper to PDF…");
        const payload = (await response.json()) as {
          kind?: string;
          html?: string;
          fileName?: string;
          error?: string;
        };
        if (payload.error) throw new Error(payload.error);
        if (!payload.html) throw new Error("Paper HTML was empty.");

        if (payload.fileName) setFileName(payload.fileName);
        const pdfBytes = await htmlToPdfBytes(payload.html);
        if (cancelled) return;
        setPdfData(pdfBytes);
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load the paper PDF.",
        );
        setLoading(false);
      }
    }

    void loadPaper();
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

      {loading ? <p className="pdf-reader-status">{status}</p> : null}
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
