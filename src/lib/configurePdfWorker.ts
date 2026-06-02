import * as pdfjs from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

function assetUrl(relativePath: string) {
    const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
    if (typeof window !== "undefined") {
        return new URL(normalized, window.location.origin).href;
    }
    const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
    return `${base}${normalized.replace(/^\//, "")}`;
}

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export const PDF_DOCUMENT_OPTIONS = {
    cMapUrl: assetUrl("/pdfjs/cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: assetUrl("/pdfjs/standard_fonts/"),
} as const;

export { pdfjs };
