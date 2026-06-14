import { describe, expect, it } from "vitest";

import {
  isPlaceholderMediaUrl,
  resolveQuestionMedia,
} from "@/features/practice/questionMedia";

describe("isPlaceholderMediaUrl", () => {
  it("detects default no-image placeholder", () => {
    expect(
      isPlaceholderMediaUrl("https://api.example.com/storage/default_img/no_img.jpg"),
    ).toBe(true);
  });

  it("detects no_img.jpg anywhere in the path", () => {
    expect(isPlaceholderMediaUrl("https://cdn.example.com/no_img.jpg")).toBe(true);
  });

  it("returns false for real media URLs", () => {
    expect(
      isPlaceholderMediaUrl("https://api.example.com/storage/questions/scan.png"),
    ).toBe(false);
  });
});

describe("resolveQuestionMedia", () => {
  it("returns image media for image URLs", () => {
    expect(
      resolveQuestionMedia(
        "https://api.example.com/storage/questions/knee.jpg",
        "Radiopaedia case 123",
      ),
    ).toEqual({
      kind: "image",
      url: "https://api.example.com/storage/questions/knee.jpg",
      caption: "Radiopaedia case 123",
    });
  });

  it("returns pdf media for PDF URLs", () => {
    expect(
      resolveQuestionMedia("https://api.example.com/storage/questions/report.pdf"),
    ).toEqual({
      kind: "pdf",
      url: "https://api.example.com/storage/questions/report.pdf",
    });
  });

  it("returns null for placeholder URLs", () => {
    expect(
      resolveQuestionMedia("https://api.example.com/storage/default_img/no_img.jpg"),
    ).toBeNull();
  });

  it("returns null for missing or empty file", () => {
    expect(resolveQuestionMedia(null)).toBeNull();
    expect(resolveQuestionMedia("")).toBeNull();
    expect(resolveQuestionMedia(undefined)).toBeNull();
  });

  it("returns null for unsupported extensions", () => {
    expect(
      resolveQuestionMedia("https://api.example.com/storage/questions/file.docx"),
    ).toBeNull();
  });
});
