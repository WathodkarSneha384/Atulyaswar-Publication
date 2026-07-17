import { notFound } from "next/navigation";
import HtmlReadOnlyViewer from "@/components/HtmlReadOnlyViewer";
import PdfReadOnlyViewer from "@/components/PdfReadOnlyViewer";
import { resolveIssueEntryFile } from "@/lib/issueEntryFile";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function JournalReadPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getIssueEntrySubmissionById(id);

  if (!item || item.status !== "approved" || item.publishStatus !== "published") {
    notFound();
  }

  if (item.pdfUrl?.trim() && !item.pdfBase64 && !item.manuscriptId) {
    return <PdfReadOnlyViewer title={item.title} pdfSrc={item.pdfUrl.trim()} />;
  }

  const file = await resolveIssueEntryFile(item);

  if (!file) {
    return (
      <HtmlReadOnlyViewer
        title={item.title}
        html={`<p>The paper file for this entry could not be loaded. Please re-upload the paper from Admin → Manuscripts / Issue To Publish (PDF or DOCX recommended).</p>`}
      />
    );
  }

  if (file.isPdf) {
    return (
      <PdfReadOnlyViewer
        title={item.title}
        pdfSrc={`/api/issue-entry-submissions/${item.id}/pdf`}
      />
    );
  }

  const lowerName = file.fileName.toLowerCase();
  if (lowerName.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.convertToHtml({ buffer: file.buffer });
    return <HtmlReadOnlyViewer title={item.title} html={result.value || "<p>(Empty document)</p>"} />;
  }

  // Legacy .doc and other formats cannot be rendered in-browser reliably.
  return (
    <HtmlReadOnlyViewer
      title={item.title}
      html={`<p>This paper was uploaded as <strong>${file.fileName}</strong>. Online read view supports <strong>PDF</strong> and <strong>DOCX</strong>. Please upload a PDF (or DOCX) from Admin → Issue To Publish → Edit → Replace PDF.</p>`}
    />
  );
}
