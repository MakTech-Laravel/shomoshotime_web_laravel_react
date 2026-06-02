import type { PDFDocumentProxy } from "pdfjs-dist";

import type { SearchMatch } from "@/components/study-guide/pdf-viewer-types";

export async function searchPdfText(
  pdf: PDFDocumentProxy,
  query: string,
): Promise<SearchMatch[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const matches: SearchMatch[] = [];

  for (let page = 1; page <= pdf.numPages; page += 1) {
    const pdfPage = await pdf.getPage(page);
    const content = await pdfPage.getTextContent();
    const fullText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    let index = 0;
    const lower = fullText.toLowerCase();
    while (index < lower.length) {
      const found = lower.indexOf(term, index);
      if (found === -1) break;
      matches.push({ page, index: found });
      index = found + term.length;
    }
  }

  return matches;
}
