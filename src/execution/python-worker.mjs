import { parentPort, workerData } from "node:worker_threads";
import { loadPyodide } from "pyodide";

const startedAt = performance.now();
const output = [];
const errors = [];
let truncated = false;
const outputLimit = workerData.outputLimit;

function append(target, value) {
  const text = String(value);
  const currentLength = output.join("").length + errors.join("").length;
  if (currentLength >= outputLimit) {
    truncated = true;
    return;
  }
  target.push(text.slice(0, outputLimit - currentLength));
}

try {
  const pyodide = await loadPyodide({
    stdout: (text) => append(output, `${text}\n`),
    stderr: (text) => append(errors, `${text}\n`),
  });

  let runtimeError = "";
  try {
    await pyodide.runPythonAsync(workerData.source);
  } catch (error) {
    runtimeError = error instanceof Error ? error.message : String(error);
    append(errors, runtimeError);
  }

  const userOutput = output.join("");
  pyodide.globals.set("__user_output__", userOutput);
  const testResults = [];

  if (!runtimeError) {
    for (const test of workerData.tests) {
      try {
        await pyodide.runPythonAsync(test.code);
        testResults.push({ name: test.name, passed: true, hidden: test.hidden });
      } catch (error) {
        const message = error instanceof Error
          ? error.message.split("\n").map((line) => line.trim()).filter(Boolean).at(-1)
          : String(error);
        testResults.push({
          name: test.name,
          passed: false,
          hidden: test.hidden,
          message: test.hidden ? "A hidden edge-case check failed." : message,
        });
      }
    }
  }

  parentPort.postMessage({
    stdout: output.join(""),
    stderr: errors.join(""),
    durationMs: Math.round(performance.now() - startedAt),
    timedOut: false,
    truncated,
    tests: testResults,
  });
} catch (error) {
  parentPort.postMessage({
    stdout: output.join(""),
    stderr: error instanceof Error ? error.message : String(error),
    durationMs: Math.round(performance.now() - startedAt),
    timedOut: false,
    truncated,
    tests: [],
  });
}
