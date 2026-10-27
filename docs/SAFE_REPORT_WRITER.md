# Safe report writer (opt-in)

## What it provides

`safe-report-writer.js` exports `saveReportWithoutOverwrite(filename, content, reportsDirectory)`.

- Accepts simple filenames ending in `.txt`, `.md`, `.json`, or `.csv`.
- Rejects path separators, traversal-like names, unsupported extensions, and non-string content.
- Writes into the supplied reports directory (default: `./reports`).
- Uses Node's exclusive `wx` file flag, so an existing report is never silently replaced. A duplicate filename fails with `EEXIST`.

## Test it

Run from the repository root:

```bash
node --test tests/safe-report-writer.test.js
```

The tests use temporary directories and do not make API calls.

## Important integration boundary

This helper is deliberately additive and is **not wired into** the existing `tools.js` or server pipeline. The current application still uses its existing report-writing implementation until a separate, explicitly reviewed integration change is made. Do not treat the running pipeline as protected by this helper yet.
