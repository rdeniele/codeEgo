import { Worker } from "node:worker_threads";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  MAX_OUTPUT_LENGTH,
  sanitiseTests,
  validateExecutionInput,
  type ExecutionResult,
} from "@/lib/execution";
import { findLesson } from "@/data/curriculum";
import { findProject } from "@/data/projects";

export const runtime = "nodejs";

const TIMEOUT_MS = 5_000;

function runInWorker(source: string, tests: ReturnType<typeof sanitiseTests>) {
  return new Promise<ExecutionResult>((resolve, reject) => {
    const workerPath = path.join(process.cwd(), "src", "execution", "python-worker.mjs");
    const worker = new Worker(workerPath, {
      workerData: { source, tests, outputLimit: MAX_OUTPUT_LENGTH },
    });

    const timer = setTimeout(async () => {
      await worker.terminate();
      resolve({
        stdout: "",
        stderr: "Execution stopped after 5 seconds.",
        durationMs: TIMEOUT_MS,
        timedOut: true,
        truncated: false,
        tests: [],
      });
    }, TIMEOUT_MS);

    worker.once("message", (result: ExecutionResult) => {
      clearTimeout(timer);
      resolve(result);
    });
    worker.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      source?: unknown;
      lessonId?: unknown;
      validate?: unknown;
    };
    const activity = typeof body.lessonId === "string"
      ? findLesson(body.lessonId) ?? findProject(body.lessonId)
      : undefined;
    const tests = body.validate === true && activity ? activity.tests : [];
    validateExecutionInput(body.source, tests);
    const result = await runInWorker(body.source as string, sanitiseTests(tests));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run this code.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
