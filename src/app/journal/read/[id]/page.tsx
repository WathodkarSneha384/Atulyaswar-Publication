import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PdfReadOnlyViewer from "@/components/PdfReadOnlyViewer";
import { resolveIssueEntryFile } from "@/lib/issueEntryFile";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function siteOrigin(headerStore: Headers) {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (envUrl) return envUrl.replace(/\/$/, "");

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "";
}

export default async function JournalReadPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getIssueEntrySubmissionById(id);

  if (!item || item.status !== "approved" || item.publishStatus !== "published") {
    notFound();
  }

  const headerStore = await headers();
  const origin = siteOrigin(headerStore);
  const apiPath = `/api/issue-entry-submissions/${item.id}/pdf`;

  if (item.pdfUrl?.trim() && !item.pdfBase64 && !item.manuscriptId) {
    return (
      <PdfReadOnlyViewer
        title={item.title}
        pdfSrc={item.pdfUrl.trim()}
        kind="pdf"
      />
    );
  }

  const file = await resolveIssueEntryFile(item);
  if (!file && !item.pdfUrl?.trim()) {
    notFound();
  }

  if (file && !file.isPdf) {
    const absoluteFileUrl = origin ? `${origin}${apiPath}` : apiPath;
    return (
      <PdfReadOnlyViewer
        title={item.title}
        pdfSrc={apiPath}
        absoluteFileUrl={absoluteFileUrl}
        kind="office"
      />
    );
  }

  return (
    <PdfReadOnlyViewer
      title={item.title}
      pdfSrc={file || item.pdfBase64 ? apiPath : (item.pdfUrl as string)}
      kind="pdf"
    />
  );
}
