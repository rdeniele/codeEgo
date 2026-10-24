import { describe, expect, it } from "vitest";
import { MAX_SOURCE_LENGTH, sanitiseTests, validateExecutionInput } from "@/lib/execution";

describe("execution boundary", () => {
  it("rejects empty and oversized source", () => {
    expect(() => validateExecutionInput("", [])).toThrow("Add some Python code");
    expect(() => validateExecutionInput("x".repeat(MAX_SOURCE_LENGTH + 1), [])).toThrow("too long");
  });

  it("caps and normalises tests", () => {
    const tests = Array.from({ length: 30 }, (_, index) => ({ name: `test ${index}`, code: "assert True" }));
    expect(sanitiseTests(tests)).toHaveLength(20);
    expect(sanitiseTests([{ name: 3, code: null }])[0]).toMatchObject({ name: "Exercise check", code: "assert False" });
  });
});
