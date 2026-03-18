import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getManuscriptById } from "@/lib/manuscriptStore";
import { readManuscriptAttachment } from "@/lib/manuscriptFiles";

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
    });

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": item.paperFileMimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${item.paperFileName}"`,
      },
    });
  } catch {
    if (item.paperFileBase64) {
      const fileBuffer = Buffer.from(item.paperFileBase64, "base64");
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": item.paperFileMimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${item.paperFileName}"`,
        },
      });
    }

    return NextResponse.json(
      {
        error:
          "Paper file not found for this older submission. Please ask the author to submit again.",
      },
      { status: 404 },
    );
  }
}
