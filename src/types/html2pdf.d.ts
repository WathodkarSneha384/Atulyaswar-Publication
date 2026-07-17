declare module "html2pdf.js" {
  type Html2PdfWorker = {
    set: (options: Record<string, unknown>) => Html2PdfWorker;
    from: (element: HTMLElement | string) => Html2PdfWorker;
    outputPdf: (type: "blob" | "arraybuffer" | "datauristring") => Promise<Blob | ArrayBuffer | string>;
    save: () => Promise<void>;
  };

  type Html2PdfFactory = () => Html2PdfWorker;

  const html2pdf: Html2PdfFactory & { default?: Html2PdfFactory };
  export default html2pdf;
}
