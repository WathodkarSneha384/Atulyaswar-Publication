import { notFound } from "next/navigation";
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

  if (item.pdfUrl?.trim() && !item.pdfBase64) {
    const linkedFile = item.manuscriptId ? await resolveIssueEntryFile(item) : null;
    if (!linkedFile?.isPdf) {
      return <PdfReadOnlyViewer title={item.title} pdfSrc={item.pdfUrl.trim()} />;
    }
  }

  const file = await resolveIssueEntryFile(item);
  const pdfSrc =
    item.pdfBase64 || file?.isPdf
      ? `/api/issue-entry-submissions/${item.id}/pdf`
      : item.pdfUrl?.trim() || "";

  if (!pdfSrc) {
    notFound();
  }

  return <PdfReadOnlyViewer title={item.title} pdfSrc={pdfSrc} />;
}
