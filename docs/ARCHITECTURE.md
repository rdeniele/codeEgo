# Architecture

## Application shell

The project uses Next.js App Router with TypeScript and Tailwind CSS v4. The learning workspace is a client component because it coordinates the editor, local progress, navigation, notes, and execution requests. Static metadata and the API route remain on the server.

## Curriculum model

`src/data/curriculum.ts` defines a reusable manifest:

- Course
- Chapter
- Lesson
- Exercise tests
- Starter code
- Three hint levels
- Reference solution
- Duration and skills

The current manifest intentionally distinguishes fully authored lessons from the planned catalog.

## Execution flow

```text
Monaco editor
    -> POST /api/execute
    -> validate source and resolve tests by lesson ID
    -> start a dedicated worker thread
    -> load local Pyodide runtime
    -> run learner code in the WebAssembly Python environment
    -> capture stdout and stderr
    -> run server-owned exercise checks
    -> return structured output and test results
```

The API never executes learner Python inside the Next.js process. Each run receives a new worker and is terminated after five seconds. The worker has no application secrets, and Pyodide provides an in-memory filesystem rather than direct host filesystem access.

## Progress model

The browser stores completion, attempts, notes, bookmarks, and the active lesson in local storage. Export files include a schema version so migrations can be added later. A future SQLite service can preserve the same domain shape while supporting larger datasets.

## UI structure

- Fixed application navigation
- Collapsible course outline
- Scrollable lesson instructions
- Monaco editor
- Resizable output panel
- Responsive single-column mobile fallback
- Activity-backed dashboard and review queue

## Adding a lesson

Add a lesson object to a chapter in `src/data/curriculum.ts`. Include a stable ID, objective, explanation, example, starter code, solution, exactly three hints, and at least two behavioral checks. The existing UI and persistence layer will pick it up automatically.
