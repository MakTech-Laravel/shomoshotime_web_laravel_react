import { describe, expect, it } from "vitest";

import type { MockExamSet } from "./mockExamsApi";
import { filterMockExamsByTab, isArrtMockExam } from "./mockExamFilters";

function mockExam(overrides: Partial<MockExamSet> & Pick<MockExamSet, "title">): MockExamSet {
  return {
    id: 1,
    sort_order: 0,
    subtitle: "",
    category: "SPI",
    status: 0,
    status_label: "Easy",
    total_questions: 50,
    attempts_used: 0,
    attempts_remaining: 999,
    can_start: true,
    best_score_percentage: 0,
    ...overrides,
  };
}

describe("isArrtMockExam", () => {
  it("matches ARRT category", () => {
    expect(isArrtMockExam({ title: "Mock Exam 1", category: "ARRT" })).toBe(true);
  });

  it("matches ARRT in title", () => {
    expect(
      isArrtMockExam({ title: "1. ARRT Mock Exam", category: "Vascular" }),
    ).toBe(true);
  });

  it("does not match SPI exams", () => {
    expect(
      isArrtMockExam({ title: "ARDMS SPI Mock Exam", category: "SPI" }),
    ).toBe(false);
  });
});

describe("filterMockExamsByTab", () => {
  const exams = [
    mockExam({ id: 1, title: "1. ARRT Mock Exam", category: "Vascular" }),
    mockExam({ id: 2, title: "ARDMS RVT Mock Exam", category: "Vascular" }),
    mockExam({ id: 3, title: "ARDMS SPI Mock Exam", category: "SPI" }),
    mockExam({ id: 4, title: "CCI RVS Mock Exam", category: "Vascular" }),
  ];

  it("ARRT tab includes only ARRT exams", () => {
    const result = filterMockExamsByTab(exams, "arrt");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("1. ARRT Mock Exam");
  });

  it("vascular tab excludes ARRT exams", () => {
    const result = filterMockExamsByTab(exams, "vascular");
    expect(result.map((e) => e.title)).toEqual([
      "ARDMS RVT Mock Exam",
      "CCI RVS Mock Exam",
    ]);
  });

  it("spi tab includes SPI exams only", () => {
    const result = filterMockExamsByTab(exams, "spi");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("ARDMS SPI Mock Exam");
  });
});
