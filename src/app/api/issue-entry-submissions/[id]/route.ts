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

    const pdfFile = form.get("pdfFile");
    if (pdfFile instanceof File && pdfFile.size > 0) {
      if (!pdfFile.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json(
          { error: "Please upload PDF file only." },
          { status: 400 },
        );
      }

      if (pdfFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "PDF size should not exceed 5 MB." },
          { status: 400 },
        );
      }

      uploadedPdfFileName = pdfFile.name;
      uploadedPdfMimeType = pdfFile.type || "application/pdf";
      uploadedPdfBase64 = Buffer.from(await pdfFile.arrayBuffer()).toString("base64");
      payload.pdfUrl = undefined;
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
        }
      : {}),
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: updated });
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
