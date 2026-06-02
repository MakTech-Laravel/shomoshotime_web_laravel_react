import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pdfDist = join(root, "node_modules/pdfjs-dist");
const publicPdfjs = join(root, "public/pdfjs");

mkdirSync(publicPdfjs, { recursive: true });

copyFileSync(
  join(pdfDist, "build/pdf.worker.min.mjs"),
  join(publicPdfjs, "pdf.worker.min.mjs"),
);

for (const folder of ["cmaps", "standard_fonts"]) {
  const src = join(pdfDist, folder);
  const dest = join(publicPdfjs, folder);
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true });
  }
}

console.log("Copied pdfjs worker, cmaps, and standard_fonts to public/pdfjs/");
