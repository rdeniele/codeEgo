# CodeEgo Academy

CodeEgo Academy is a free, local-first coding school built around one dependable loop: read a short lesson, write code, run it, inspect the result, submit it against real checks, and continue.

The current release includes a working Python course engine, a complete 19-lesson Python Foundations sequence, a Monaco editor, isolated Python execution with Pyodide in a worker thread, visible and hidden checks, progressive hints, reference solutions, notes, bookmarks, lesson locking, saved attempts, a review queue, and JSON progress import/export.

## Start on Windows

Requirements:

- Node.js 24 or newer
- npm 11 or newer
- No Python installation is required for this release
- No API key, account, subscription, or Docker installation is required

Install and run:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```powershell
npm run build
npm start
```

## Useful commands

```powershell
npm test
npm run test:curriculum
npm run lint
npm run build
```

## What is complete

- Responsive desktop and mobile learning workspace
- Original CodeEgo Academy visual system
- Python Foundations curriculum schema
- Nineteen authored lessons covering core syntax, types, input cleanup, operators, decisions, loops, functions, scope, collections, strings, exceptions, debugging, and clean code
- Six runnable Python projects with requirements, milestones, hints, behavioral checks, and saved completion
- Four scored chapter assessments combining knowledge checks, output prediction, and interactive code ordering
- 100-point project rubrics and locally saved retrospectives
- Adaptive review scheduling based on failed attempts, hint use, solution reveals, and independent recall
- Monaco editor with Python syntax support
- Real Python execution through locally installed Pyodide assets
- Five-second execution timeout
- Source and output limits
- Captured standard output and error output
- Server-owned exercise tests, including hidden checks
- Incorrect answers fail and correct answers pass
- Three hint levels per lesson
- Reference solution reveal
- Lesson unlocking and next-lesson flow
- Local notes and bookmarks
- Local attempt and completion persistence
- Dashboard metrics based on saved activity
- Review queue based on real failed attempts
- Progress import and export as versioned JSON
- Light and dark modes
- Keyboard focus styles and reduced-motion support
- Unit tests for curriculum, progress serialization, and execution input boundaries

## What is planned

The remaining course catalog and career paths are shown as planned instead of being represented as finished. Expansion order:

1. Add adaptive mixed-topic review sessions and spaced practice scheduling.
2. Add study-time tracking, achievement rules, and skill evidence.
3. Add SQLite persistence through a local service for larger libraries and multi-device export workflows.
4. Add intermediate Python, SQL, web, backend, data, AI, games, and professional engineering tracks.
5. Add optional container runners for additional languages.

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md), [SECURITY.md](./docs/SECURITY.md), and [ROADMAP.md](./docs/ROADMAP.md).

## Data and privacy

Progress is stored in the browser's local storage under `codeego-progress-v1`, with automatic migration from the former `codequest-progress-v1` key. No telemetry is included. Export a JSON backup from Dashboard or Progress before clearing browser data.
