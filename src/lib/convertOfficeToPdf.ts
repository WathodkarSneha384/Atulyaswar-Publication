import mammoth from "mammoth";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapPrintHtml(bodyHtml: string, title?: string) {
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

async function officeBufferToHtml(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".docx")) {
    const result = await mammoth.convertToHtml({ buffer });
    return result.value || "<p></p>";
  }

  if (lower.endsWith(".doc")) {
    const WordExtractorMod = await import("word-extractor");
    const WordExtractor =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (WordExtractorMod as any).default ?? WordExtractorMod;
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(buffer);
    const body = extracted.getBody() || "";
    return body
      .split(/\n+/)
      .map((line: string) => line.trim())
      .filter(Boolean)
      .map((line: string) => `<p>${escapeHtml(line)}</p>`)
      .join("\n");
  }

  throw new Error(`Unsupported office format: ${fileName}`);
}

async function launchBrowser() {
  const puppeteer = await import("puppeteer-core");

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    const chromiumMod = await import("@sparticuz/chromium");
    const chromium = chromiumMod.default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const localCandidates = [
    process.env.CHROME_PATH,
    process.env.PROGRAMFILES
      ? `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
      : "",
    process.env["PROGRAMFILES(X86)"]
      ? `${process.env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`
      : "",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];

  for (const executablePath of localCandidates) {
    try {
      return await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch {
      // try next candidate
    }
  }

  const chromiumMod = await import("@sparticuz/chromium");
  const chromium = chromiumMod.default;
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

/**
 * Convert DOC/DOCX to a print-style PDF (A4), similar to "Print to PDF" from Word.
 */
export async function convertOfficeToPdf(
  buffer: Buffer,
  fileName: string,
  title?: string,
): Promise<Buffer> {
  const bodyHtml = await officeBufferToHtml(buffer, fileName);
  const html = wrapPrintHtml(bodyHtml, title);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 45000 });
    await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts = (document as any).fonts;
      if (fonts?.ready) await fonts.ready;
    });
    // Small settle time for remote fonts.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
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
