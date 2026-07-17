import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  deleteIssueEntrySubmission,
  getIssueEntrySubmissionById,
  updateIssueEntrySubmission,
} from "@/lib/issueEntrySubmissionStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  title?: string;
  author?: string;
  pageNo?: string;
  pdfUrl?: string;
  submitterEmail?: string;
};

function clean(value: string | null | undefined) {
  return (value ?? "").trim();
}

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await getIssueEntrySubmissionById(id);
  if (!item) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  let payload: UpdatePayload = {};
  let uploadedPdfFileName: string | undefined;
  let uploadedPdfMimeType: string | undefined;
  let uploadedPdfBase64: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    payload = {
      title: clean(String(form.get("title") ?? "")) || undefined,
      author: clean(String(form.get("author") ?? "")) || undefined,
      pageNo: clean(String(form.get("pageNo") ?? "")) || undefined,
      submitterEmail: clean(String(form.get("submitterEmail") ?? "")) || undefined,
      pdfUrl: clean(String(form.get("pdfUrl") ?? "")) || undefined,
    };

    const { getPublicationUploadFromForm, validatePublicationUpload } = await import(
      "@/lib/publicationUpload"
    );
    const upload = getPublicationUploadFromForm(form);
    if (upload) {
      const uploadError = validatePublicationUpload(upload.fileName, upload.blob.size);
      if (uploadError) {
        return NextResponse.json({ error: uploadError }, { status: 400 });
      }

      uploadedPdfFileName = upload.fileName;
      uploadedPdfMimeType = upload.mimeType;
      uploadedPdfBase64 = Buffer.from(await upload.blob.arrayBuffer()).toString("base64");
      // New file replaces any previous URL-based paper.
      payload.pdfUrl = "";
    }
  } else {
    try {
      payload = (await request.json()) as UpdatePayload;
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
  }
  const { id } = await context.params;
  const updated = await updateIssueEntrySubmission(id, {
    ...payload,
    ...(uploadedPdfFileName
      ? {
          pdfFileName: uploadedPdfFileName,
          pdfMimeType: uploadedPdfMimeType,
          pdfBase64: uploadedPdfBase64,
          pdfUrl: "",
        }
      : {}),
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    item: {
      ...updated,
      // Do not echo huge base64 back to the admin UI.
      pdfBase64: updated.pdfBase64 ? "[stored]" : undefined,
    },
    replacedFile: Boolean(uploadedPdfFileName),
    pdfFileName: updated.pdfFileName,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const deleted = await deleteIssueEntrySubmission(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
