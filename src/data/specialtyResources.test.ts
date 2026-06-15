import { describe, expect, it } from "vitest";

import { buildSpecialtyDropdownLinks } from "@/data/specialtyResources";

describe("buildSpecialtyDropdownLinks", () => {
  it("uses API flashcard and practice children without SPI template fallback", () => {
    const links = buildSpecialtyDropdownLinks(undefined, [], {
      studyGuidesReady: true,
      flashcardChildren: [{ label: "Vascular Cards", slug: "deck-12" }],
      practiceChildren: [{ label: "Vascular Practice", slug: "deck-34" }],
    });

    const flashcards = links.find((l) => l.slug === "flashcards");
    const practice = links.find((l) => l.slug === "practice-questions");

    expect(flashcards?.children).toEqual([{ label: "Vascular Cards", slug: "deck-12" }]);
    expect(practice?.children).toEqual([{ label: "Vascular Practice", slug: "deck-34" }]);
  });

  it("shows empty flashcard and practice submenus while guest nav data is loading", () => {
    const links = buildSpecialtyDropdownLinks(undefined, [], {
      studyGuidesReady: false,
      flashcardChildren: [],
      practiceChildren: [],
    });

    expect(links.find((l) => l.slug === "flashcards")?.children).toEqual([]);
    expect(links.find((l) => l.slug === "practice-questions")?.children).toEqual([]);
  });
});
