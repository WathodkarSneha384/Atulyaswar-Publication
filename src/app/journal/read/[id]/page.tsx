import { notFound } from "next/navigation";
import PdfReadOnlyViewer from "@/components/PdfReadOnlyViewer";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function JournalReadPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getIssueEntrySubmissionById(id);

  if (
    !item ||
    item.status !== "approved" ||
    item.publishStatus !== "published" ||
    !(item.pdfUrl?.trim() || item.pdfBase64)
  ) {
    notFound();
  }

  const pdfSrc = item.pdfBase64
    ? `/api/issue-entry-submissions/${item.id}/pdf`
    : (item.pdfUrl as string);

  return <PdfReadOnlyViewer title={item.title} pdfSrc={pdfSrc} />;
}
