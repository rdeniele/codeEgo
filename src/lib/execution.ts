export type TestResult = { name: string; passed: boolean; message?: string; hidden?: boolean };

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  truncated: boolean;
  tests: TestResult[];
};

export const MAX_SOURCE_LENGTH = 20_000;
export const MAX_OUTPUT_LENGTH = 12_000;

export function validateExecutionInput(source: unknown, tests: unknown) {
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new Error("Add some Python code before running.");
  }
  if (source.length > MAX_SOURCE_LENGTH) throw new Error("Code is too long for this learning runner.");
  if (!Array.isArray(tests)) throw new Error("Invalid exercise tests.");
}

export function sanitiseTests(tests: unknown) {
  if (!Array.isArray(tests)) return [];
  return tests
    .filter((test) => test && typeof test === "object")
    .map((test) => {
      const value = test as Record<string, unknown>;
      return {
        name: typeof value.name === "string" ? value.name.slice(0, 120) : "Exercise check",
        code: typeof value.code === "string" ? value.code.slice(0, 4_000) : "assert False",
        hidden: Boolean(value.hidden),
      };
    })
    .slice(0, 20);
}
