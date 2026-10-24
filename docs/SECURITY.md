# Execution security

## Current boundary

This release is intended for one person running CodeEgo Academy on their own computer. It is not presented as a secure public multi-user execution service.

Python runs in a dedicated Node worker through Pyodide's WebAssembly runtime. It does not run inside the Next.js request process. The runner enforces:

- Five-second wall-clock timeout
- Worker termination on timeout
- 20,000-character source limit
- 12,000-character combined output limit
- Maximum of 20 exercise checks
- Server-owned tests selected by lesson ID
- In-memory Python filesystem
- No platform credentials passed to the worker
- No dedicated network bridge in the runner

## Known limitations

- WebAssembly isolation is useful for local learning, but this project has not been audited as a hostile multi-tenant sandbox.
- Memory is indirectly limited by the worker process and host runtime rather than an independently verified hard cap.
- CPU control uses termination after the timeout rather than instruction metering.
- The browser application and execution service run with the permissions of the local user who started them.
- Do not expose the development or production server to untrusted networks.

## Before public hosting

Use a hardened container or microVM per execution, a read-only base filesystem, strict CPU and memory quotas, an unprivileged user, a syscall policy, disabled outbound networking, request rate limits, queue isolation, audit logs, and independent penetration testing.

## Dependency policy

Dependencies are pinned in `package.json` and `package-lock.json`. Run `npm audit` before releases. The Monaco dependency chain is overridden to a patched DOMPurify version.
