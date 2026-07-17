import mammoth from "mammoth";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapPrintHtml(bodyHtml: string, title?: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title || "Paper")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
      font-family: "Noto Serif", "Noto Sans Devanagari", "Times New Roman", serif;
      font-size: 12pt;
      line-height: 1.55;
    }
    h1, h2, h3, h4 { font-family: "Noto Sans Devanagari", "Noto Serif", sans-serif; line-height: 1.3; }
    p { margin: 0 0 0.7em; text-align: justify; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
    td, th { border: 1px solid #ccc; padding: 0.35em 0.5em; vertical-align: top; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export async function convertOfficeToHtml(
  buffer: Buffer,
  fileName: string,
  title?: string,
): Promise<string> {
  const lower = fileName.toLowerCase();
  let bodyHtml = "<p></p>";

  if (lower.endsWith(".docx")) {
    const result = await mammoth.convertToHtml({ buffer });
    bodyHtml = result.value || "<p></p>";
  } else if (lower.endsWith(".doc")) {
    const WordExtractorMod = await import("word-extractor");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const WordExtractor = (WordExtractorMod as any).default ?? WordExtractorMod;
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(buffer);
    const body = extracted.getBody() || "";
    bodyHtml = body
      .split(/\n+/)
      .map((line: string) => line.trim())
      .filter(Boolean)
      .map((line: string) => `<p>${escapeHtml(line)}</p>`)
      .join("\n");
  } else {
    throw new Error(`Unsupported office format: ${fileName}`);
  }

  return wrapPrintHtml(bodyHtml, title);
}

export function isOfficePaperFile(fileName: string, mimeType?: string) {
  const lower = fileName.toLowerCase();
  const mime = (mimeType || "").toLowerCase();
  return (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    mime.includes("msword") ||
    mime.includes("wordprocessingml")
  );
}
