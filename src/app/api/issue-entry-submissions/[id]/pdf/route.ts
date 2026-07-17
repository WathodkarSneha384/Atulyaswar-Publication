import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { convertOfficeToHtml, isOfficePaperFile } from "@/lib/convertOfficeToPdf";
import {
  resolveIssueEntryFile,
  resolveIssueEntryOriginalFile,
} from "@/lib/issueEntryFile";
import { getIssueEntrySubmissionById } from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = await getIssueEntrySubmissionById(id);
  if (!item) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const isAdmin = isAdminRequest(request);
  const isPublic =
    item.status === "approved" && item.publishStatus === "published";
  if (!isPublic && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const wantOriginal = isAdmin && searchParams.get("original") === "1";

  if (!item.pdfBase64 && item.pdfUrl?.trim() && !item.manuscriptId) {
    return NextResponse.redirect(item.pdfUrl.trim());
  }

  if (wantOriginal) {
    const original = await resolveIssueEntryOriginalFile(item);
    if (!original) {
      return NextResponse.json({ error: "No uploaded file available." }, { status: 404 });
    }
    const disposition = original.isPdf
      ? "inline"
      : `attachment; filename="${original.fileName.replace(/"/g, "")}"`;
    return new NextResponse(new Uint8Array(original.buffer), {
      headers: {
        "Content-Type": original.mimeType || "application/octet-stream",
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "X-File-Name": encodeURIComponent(original.fileName),
      },
    });
  }

  // Prefer cached/native PDF when available.
  const file = await resolveIssueEntryFile(item);
  if (file?.isPdf) {
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "X-File-Name": encodeURIComponent(
          file.fileName.toLowerCase().endsWith(".pdf")
            ? file.fileName
            : `${file.fileName}.pdf`,
        ),
        "X-File-Kind": "pdf",
      },
    });
  }

  // Word papers: convert to print HTML (client turns this into a PDF view).
  let source = file;
  if (item.manuscriptId) {
    const original = await resolveIssueEntryOriginalFile(item);
    if (original && !original.isPdf) source = original;
  }

  if (!source || !isOfficePaperFile(source.fileName, source.mimeType)) {
    return NextResponse.json(
      {
        error:
          "No readable paper found. Upload a PDF or DOC/DOCX from Admin → Issue To Publish → Edit.",
      },
      { status: 404 },
    );
  }

  try {
    const html = await convertOfficeToHtml(source.buffer, source.fileName, item.title);
    const pdfName = source.fileName.replace(/\.(docx?|DOCX?)$/i, "") + ".pdf";
    return NextResponse.json(
      {
        kind: "html",
        title: item.title,
        fileName: pdfName,
        html,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
          "X-File-Kind": "html",
          "X-File-Name": encodeURIComponent(pdfName),
        },
      },
    );
  } catch (error) {
    console.error("[atulyaswar] Office to HTML conversion failed", error);
    return NextResponse.json(
      {
        error:
          "Could not prepare this Word paper for reading. Please upload a PDF from Admin → Issue To Publish → Edit.",
      },
      { status: 500 },
    );
  }
}
