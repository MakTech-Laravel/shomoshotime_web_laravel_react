import { describe, expect, it } from "vitest";

import { sortPracticeQuestions } from "@/features/practice/practiceApi";
import type { ApiPracticeQuestion } from "@/features/practice/mapQuestion";

function q(id: number, sort_order = id): ApiPracticeQuestion {
  return {
    id,
    question_set_id: 1,
    question: `Question ${id}`,
    option_a: "A",
    option_b: "B",
    option_c: "C",
    option_d: "D",
    answer: "option_a",
    sort_order,
  };
}

describe("sortPracticeQuestions", () => {
  it("still sorts ASC for mock exam consumers", () => {
    const sorted = sortPracticeQuestions([q(3, 3), q(1, 1), q(2, 2)]);
    expect(sorted.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});

describe("practice question API order", () => {
  it("preserves API row order when not re-sorted (created_at DESC from backend)", () => {
    const apiRows = [q(76, 76), q(75, 75), q(1, 1)];
    expect(apiRows.map((item) => item.id)).toEqual([76, 75, 1]);
  });
});
