import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { convertOfficeToPdf, isOfficePaperFile } from "@/lib/convertOfficeToPdf";
import {
  resolveIssueEntryFile,
  resolveIssueEntryOriginalFile,
} from "@/lib/issueEntryFile";
import {
  getIssueEntrySubmissionById,
  updateIssueEntrySubmission,
} from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const file = wantOriginal
    ? await resolveIssueEntryOriginalFile(item)
    : await resolveIssueEntryFile(item);
  if (!file) {
    return NextResponse.json(
      {
        error:
          "No uploaded file available for this entry. Open Paper on the manuscript, or upload a PDF under Issue To Publish.",
      },
      { status: 404 },
    );
  }

  // Admin can still download the original DOC/DOCX via ?original=1
  if (wantOriginal) {
    const disposition = file.isPdf
      ? "inline"
      : `attachment; filename="${file.fileName.replace(/"/g, "")}"`;
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "X-File-Name": encodeURIComponent(file.fileName),
      },
    });
  }

  // Public Current Issue reader always receives a PDF (convert DOC/DOCX like Print to PDF).
  let pdfBuffer = file.buffer;
  let pdfName = file.fileName;

  if (file.isPdf) {
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "X-File-Name": encodeURIComponent(
          pdfName.toLowerCase().endsWith(".pdf") ? pdfName : `${pdfName}.pdf`,
        ),
      },
    });
  }

  // Prefer the original Word upload for conversion (not a stale cached non-PDF).
  let source = file;
  if (item.manuscriptId) {
    const original = await resolveIssueEntryOriginalFile(item);
    if (original && !original.isPdf) source = original;
  }

  if (isOfficePaperFile(source.fileName, source.mimeType)) {
    try {
      pdfBuffer = await convertOfficeToPdf(source.buffer, source.fileName, item.title);
      pdfName = source.fileName.replace(/\.(docx?|DOCX?)$/i, "") + ".pdf";

      await updateIssueEntrySubmission(item.id, {
        pdfFileName: pdfName,
        pdfMimeType: "application/pdf",
        pdfBase64: pdfBuffer.toString("base64"),
      });
    } catch (error) {
      console.error("[atulyaswar] DOC/DOCX to PDF conversion failed", error);
      return NextResponse.json(
        {
          error:
            "Could not convert this Word paper to PDF for reading. Please upload a PDF from Admin → Issue To Publish → Edit.",
        },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      {
        error:
          "This paper is not a PDF. Please upload a PDF from Admin → Issue To Publish → Edit.",
      },
      { status: 415 },
    );
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "X-File-Name": encodeURIComponent(pdfName),
    },
  });
}
