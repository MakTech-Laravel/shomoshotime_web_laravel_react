import { describe, expect, it } from "vitest";

import { formatPlanPrice } from "./planPresentation";

describe("formatPlanPrice", () => {
  it("preserves decimal prices from the API", () => {
    expect(formatPlanPrice(9.99)).toBe("9.99");
    expect(formatPlanPrice(29.99)).toBe("29.99");
  });

  it("shows whole-dollar prices without trailing decimals", () => {
    expect(formatPlanPrice(249)).toBe("249");
    expect(formatPlanPrice(249.0)).toBe("249");
  });
});
