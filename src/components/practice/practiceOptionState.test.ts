import { describe, expect, it } from "vitest";

import { getOptionState } from "@/components/practice/practiceOptionState";

describe("getOptionState", () => {
  const correctIndex = 1;

  it("returns selected before submit", () => {
    expect(getOptionState(0, 0, correctIndex, false)).toBe("selected");
    expect(getOptionState(1, 0, correctIndex, false)).toBe("default");
  });

  it("returns correct when user picked the right answer", () => {
    expect(getOptionState(1, 1, correctIndex, true)).toBe("correct");
    expect(getOptionState(0, 1, correctIndex, true)).toBe("disabled");
    expect(getOptionState(2, 1, correctIndex, true)).toBe("disabled");
  });

  it("returns incorrect and correctReveal when user picked wrong", () => {
    expect(getOptionState(0, 0, correctIndex, true)).toBe("incorrect");
    expect(getOptionState(1, 0, correctIndex, true)).toBe("correctReveal");
    expect(getOptionState(2, 0, correctIndex, true)).toBe("disabled");
  });
});
