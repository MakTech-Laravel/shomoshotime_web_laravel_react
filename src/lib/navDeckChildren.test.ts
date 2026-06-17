import { describe, expect, it } from "vitest";

import { apiItemsToNavChildren, reverseNavChildren } from "@/lib/navDeckChildren";

describe("reverseNavChildren", () => {
  it("reverses order without changing slug-label pairs", () => {
    const input = [
      { label: "First", slug: "first" },
      { label: "Second", slug: "second" },
      { label: "Third", slug: "third" },
    ];
    expect(reverseNavChildren(input)).toEqual([
      { label: "Third", slug: "third" },
      { label: "Second", slug: "second" },
      { label: "First", slug: "first" },
    ]);
  });
});

describe("apiItemsToNavChildren", () => {
  it("returns nav children in reversed sort_order for web display", () => {
    const children = apiItemsToNavChildren(
      [
        { id: 1, sort_order: 1, title: "Alpha" },
        { id: 2, sort_order: 2, title: "Beta" },
        { id: 3, sort_order: 3, title: "Gamma" },
      ],
      { specialty: "vascular" },
    );

    expect(children.map((c) => c.label)).toEqual(["Gamma", "Beta", "Alpha"]);
    expect(children[0]?.slug).toBe("deck-3");
  });

  it("keeps SPI legacy slugs paired with ASC-sorted items after reversal", () => {
    const children = apiItemsToNavChildren(
      [
        { id: 10, sort_order: 0, title: "Basic Metrics" },
        { id: 20, sort_order: 5, title: "Fundamentals" },
      ],
      { specialty: "spi" },
    );

    expect(children).toHaveLength(2);
    expect(children[0]).toEqual({ label: "Fundamentals", slug: "transducers" });
    expect(children[1]).toEqual({ label: "Basic Metrics", slug: "fundamentals" });
  });
});
