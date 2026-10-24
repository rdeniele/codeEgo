import { describe, expect, it } from "vitest";
import { allLessons, findLesson, pythonFundamentals } from "@/data/curriculum";

describe("curriculum", () => {
  it("loads a fully authored starter course", () => {
    expect(pythonFundamentals.id).toBe("python-fundamentals");
    expect(allLessons()).toHaveLength(19);
  });

  it("covers the complete beginner foundations sequence", () => {
    const ids = allLessons().map((lesson) => lesson.id);
    expect(ids).toEqual(expect.arrayContaining([
      "data-types",
      "operators",
      "conditionals",
      "for-loops",
      "while-loops",
      "functions-return",
      "parameters-defaults",
      "scope",
      "lists",
      "dictionaries",
      "tuples-sets",
      "string-methods",
      "exceptions",
      "debugging",
      "clean-code",
    ]));
  });

  it("gives every lesson runnable content and three hints", () => {
    for (const lesson of allLessons()) {
      expect(lesson.starterCode).toBeTypeOf("string");
      expect(lesson.solution.trim().length).toBeGreaterThan(0);
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.tests.length).toBeGreaterThan(1);
    }
  });

  it("finds lessons by stable identifier", () => {
    expect(findLesson("variables")?.title).toBe("Store a value");
    expect(findLesson("missing")).toBeUndefined();
  });
});
