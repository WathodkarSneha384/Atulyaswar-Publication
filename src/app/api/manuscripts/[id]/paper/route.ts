import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getManuscriptById } from "@/lib/manuscriptStore";
import { readManuscriptAttachment } from "@/lib/manuscriptFiles";
import { saveManuscriptFileBlob } from "@/lib/manuscriptFileStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getManuscriptById(id);

  if (!item) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  try {
    const fileBuffer = await readManuscriptAttachment({
      id: item.id,
      kind: "paper",
      originalFileName: item.paperFileName,
      fallbackBase64: item.paperFileBase64,
      fallbackMimeType: item.paperFileMimeType,
    });

    // Backfill durable blob store when older records only had inline base64 /tmp files.
    void saveManuscriptFileBlob({
      id: item.id,
      kind: "paper",
      fileName: item.paperFileName,
      mimeType: item.paperFileMimeType || "application/octet-stream",
      buffer: fileBuffer,
    }).catch(() => undefined);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": item.paperFileMimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${item.paperFileName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Paper file not found for this older submission. Please ask the author to submit again.",
      },
      { status: 404 },
    );
  }
}
