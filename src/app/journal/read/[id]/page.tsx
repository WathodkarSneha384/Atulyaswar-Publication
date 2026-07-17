import ExactFileReader from "@/components/ExactFileReader";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";
import { notFound } from "next/navigation";

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

  return <ExactFileReader title={item.title} entryId={item.id} />;
}
