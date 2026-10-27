# Quality and Security Review

This document records findings from a read-through of the current codebase. It is a checklist, not a claim that the issues have already been fixed.

## Findings

### 1. File output must be constrained

**Observed:** `tools.js` builds a destination from `process.cwd()` and a filename supplied to `saveFile`. The editor agent receives instructions containing a requested filename, but the filename is not validated against path traversal or existing files.

**Risk:** Unexpected filenames can target locations outside the intended report area, and an existing file can be overwritten.

**Safe follow-up:** Add a dedicated report-output directory and validate filenames with a strict allowlist (for example, a conservative basename ending in `.txt`). Resolve the final path and verify it remains inside that directory. Refuse to overwrite an existing report unless the user explicitly requests it. Add unit tests for traversal strings, separators, empty names, extensions, and collisions before wiring the helper into the existing tool.

### 2. Backend request validation is minimal

**Observed:** `server.js` checks that `subject` is truthy, but does not enforce a string type, trimmed non-empty content, or a maximum length.

**Safe follow-up:** Validate the request body shape, trim the subject, enforce a reasonable length limit, and return consistent 4xx errors for invalid input.

### 3. API access is not restricted

**Observed:** The Express server enables CORS without an origin allowlist and exposes a resource-intensive pipeline endpoint without authentication or rate limiting.

**Risk:** If deployed publicly, other websites or automated clients could trigger expensive model/search requests.

**Safe follow-up:** Configure an explicit allowed-origin list, add rate limiting and request timeouts, and require authentication if the endpoint is not intended to be public. Do not expose the backend to the public internet until these controls are considered.

### 4. Frontend API URL is hardcoded

**Observed:** `frontend/app/page.tsx` calls `http://localhost:5000/api/run-pipeline`.

**Risk:** The request will still point to the visitor's own computer after the frontend is hosted elsewhere.

**Safe follow-up:** Add a documented public environment variable for the API base URL, keep local development as the default, and handle connection errors with a user-facing message. Do not put server-side secrets in `NEXT_PUBLIC_*` variables.

### 5. Agent response and tool-call handling needs stronger guards

**Observed:** `agent.js` reads only `candidate.parts[0]` for both text and function calls. The loop has a maximum turn count and retry logic, but tool results and unsupported tool names do not have a comprehensive validation path.

**Risk:** Multi-part responses or multiple tool calls can be missed; malformed or unsupported calls may lead to confusing behavior.

**Safe follow-up:** Iterate through all response parts, validate tool names and argument shapes against an allowlist, handle each tool result consistently, and distinguish model/API errors from a valid empty answer.

### 6. Error matching relies on output text

**Observed:** `index.js` and `server.js` identify some failures by searching returned text for words such as `Failed`, `Timeout`, or `empty`.

**Risk:** A legitimate research answer may contain one of those words, while another failure format may not.

**Safe follow-up:** Return structured results from the agent loop, for example `{ ok, text, error }`, and branch on `ok` instead of matching human-readable messages.

### 7. Runtime configuration is hardcoded

**Observed:** The server port is fixed at 5000 and the CLI target is fixed to Sony Corporation.

**Safe follow-up:** Read the port from an environment variable with a 5000 fallback, and allow the CLI subject to be passed as a command-line argument while preserving the current default.

### 8. Automated checks were missing

**Observed:** The root package's `test` script intentionally exits with an error and no tests are defined.

**Added in this branch:** `tests/project-smoke.test.js` uses Node's built-in test runner to check JavaScript syntax and key frontend/backend contract assumptions without requiring API credentials or making network calls.

Run it with:

```bash
node --test tests/*.test.js
```

The smoke tests are intentionally limited; they are not substitutes for endpoint integration tests or unit tests around filesystem safety.

## Suggested implementation order

1. Constrain file output and prevent accidental overwrites.
2. Validate request bodies and limit expensive endpoint use.
3. Make frontend API configuration environment-driven.
4. Strengthen structured agent results and tool-call parsing.
5. Add tests for validation, filename safety, and failure handling.
6. Add CI to run syntax checks, tests, and frontend lint/build checks.

## Secrets

The root `.gitignore` already ignores `.env` and `*.local`. The added `.env.example` contains variable names only, with no credentials. If a real API key was ever committed in the past, removing it from the current tree is not enough; revoke/rotate it with the provider.
