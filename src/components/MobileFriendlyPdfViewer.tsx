"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type MobileFriendlyPdfViewerProps = {
  fileUrl: string;
  title: string;
};

export default function MobileFriendlyPdfViewer({
  fileUrl,
  title,
}: MobileFriendlyPdfViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(360);
  const [error, setError] = useState("");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const updateWidth = () => {
      const next = Math.max(280, Math.floor(host.clientWidth - 16));
      setPageWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="exact-pdf-pages exact-pdf-pages-tall" aria-label={title}>
      {error ? <p className="pdf-reader-status error">{error}</p> : null}
      <Document
        file={fileUrl}
        loading={<div className="pdf-reader-loading" aria-hidden="true" />}
        onLoadSuccess={({ numPages: pages }) => {
          setNumPages(pages);
          setError("");
        }}
        onLoadError={() => {
          setError("Unable to display this PDF on mobile. Please try again.");
        }}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={pageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
