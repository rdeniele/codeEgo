/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { Worker } = require("node:worker_threads");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const curriculumPath = path.join(root, "src", "data", "curriculum.ts");
const projectsPath = path.join(root, "src", "data", "projects.ts");
const workerPath = path.join(root, "src", "execution", "python-worker.mjs");
const source = fs.readFileSync(curriculumPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const moduleRecord = { exports: {} };
vm.runInNewContext(compiled, {
  module: moduleRecord,
  exports: moduleRecord.exports,
  require,
});

const projectSource = fs.readFileSync(projectsPath, "utf8");
const projectCompiled = ts.transpileModule(projectSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const projectModule = { exports: {} };
vm.runInNewContext(projectCompiled, {
  module: projectModule,
  exports: projectModule.exports,
  require,
});

const lessons = moduleRecord.exports.pythonFundamentals.chapters.flatMap(
  (chapter) => chapter.lessons,
);
const activities = [...lessons, ...projectModule.exports.pythonProjects];

function verifyLesson(lesson) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData: {
        source: lesson.solution,
        tests: lesson.tests,
        outputLimit: 12_000,
      },
    });
    const timer = setTimeout(async () => {
      await worker.terminate();
      reject(new Error(`${lesson.id}: timed out`));
    }, 7_000);

    worker.once("message", (result) => {
      clearTimeout(timer);
      const failed = result.tests.filter((test) => !test.passed);
      if (result.stderr || result.tests.length !== lesson.tests.length || failed.length) {
        reject(
          new Error(
            `${lesson.id}: ${result.stderr || failed.map((test) => test.message).join("; ") || "missing checks"}`,
          ),
        );
        return;
      }
      resolve();
    });
    worker.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

(async () => {
  for (const activity of activities) {
    await verifyLesson(activity);
    process.stdout.write(`✓ ${activity.id}\n`);
  }
  process.stdout.write(`Verified ${activities.length} reference solutions.\n`);
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
