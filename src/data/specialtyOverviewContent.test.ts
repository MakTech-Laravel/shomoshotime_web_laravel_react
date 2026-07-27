import { describe, expect, it } from "vitest";

import { OUTLINE_CARDS, SPECIALTY_OVERVIEW } from "@/data/specialtyOverviewContent";
import { SPECIALTY_SLUGS } from "@/data/specialtyResources";

describe("specialtyOverviewContent", () => {
  it("defines complete overview content for all specialties", () => {
    for (const slug of SPECIALTY_SLUGS) {
      const content = SPECIALTY_OVERVIEW[slug];
      expect(content.heroTitle.length).toBeGreaterThan(0);
      expect(content.heroIntro.length).toBeGreaterThan(0);
      expect(content.includedTools.length).toBeGreaterThan(0);
      expect(content.alignedTopics.length).toBeGreaterThan(0);
      expect(content.whyChoose.length).toBeGreaterThan(0);
      expect(content.infographic.length).toBeGreaterThan(0);
    }
  });

  it("provides outline cards for each specialty", () => {
    expect(OUTLINE_CARDS).toHaveLength(SPECIALTY_SLUGS.length);
    expect(OUTLINE_CARDS.map((c) => c.slug).sort()).toEqual([...SPECIALTY_SLUGS].sort());
  });
});
