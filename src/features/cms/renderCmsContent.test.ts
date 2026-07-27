import { describe, expect, it } from "vitest";

import { isCmsContentEmpty, renderCmsContent } from "@/features/cms/renderCmsContent";

describe("renderCmsContent", () => {
  it("converts Quill delta ops JSON to HTML", () => {
    const delta = JSON.stringify([
      { insert: "Privacy Policy", attributes: { bold: true } },
      { insert: "\n", attributes: { header: 1 } },
      { insert: "Effective Date: March 5, 2026\n" },
    ]);

    const html = renderCmsContent(delta);

    expect(html).toContain("<strong>Privacy Policy</strong>");
    expect(html).toContain("Effective Date: March 5, 2026");
    expect(html).not.toContain('"insert"');
  });

  it("converts full delta object with ops key", () => {
    const delta = JSON.stringify({
      ops: [{ insert: "Terms of Service\n" }],
    });

    expect(renderCmsContent(delta)).toContain("Terms of Service");
  });

  it("passes through existing HTML unchanged", () => {
    const html = "<p>Legacy <strong>HTML</strong> content</p>";
    expect(renderCmsContent(html)).toBe(html);
  });

  it("passes through plain text unchanged", () => {
    const text = "Plain paragraph content.";
    expect(renderCmsContent(text)).toBe(text);
  });
});

describe("isCmsContentEmpty", () => {
  it("treats newline-only Quill output as empty", () => {
    const html = renderCmsContent(JSON.stringify([{ insert: "\n" }]));
    expect(isCmsContentEmpty(html)).toBe(true);
  });

  it("detects non-empty rendered HTML", () => {
    expect(isCmsContentEmpty("<p>Hello</p>")).toBe(false);
  });
});
