# Pipeline input validation (opt-in)

`pipeline-input-validation.js` exports `validatePipelineSubject(value)`, a dependency-free validator for the subject submitted to the research pipeline.

It rejects non-string values, blank or one-character subjects, subjects longer than 160 characters, and control characters. Accepted subjects are trimmed. The helper returns a structured result instead of throwing for expected invalid input.

## Test it

Run from the repository root:

```bash
node --test tests/pipeline-input-validation.test.js
```

## Integration boundary

This is an additive helper and is not yet imported by `server.js`. The running API's request validation is therefore unchanged. A later integration change should call this validator before starting either agent, return HTTP 400 for invalid subjects, and preserve the existing response shape for valid requests. The current server's broad CORS policy, fixed port, and report-writing behavior also remain unchanged.
