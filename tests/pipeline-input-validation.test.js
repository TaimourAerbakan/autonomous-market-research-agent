import test from "node:test";
import assert from "node:assert/strict";
import { validatePipelineSubject } from "../pipeline-input-validation.js";

test("trims and accepts a normal subject", () => {
  assert.deepEqual(validatePipelineSubject("  Sony Corporation  "), {
    valid: true,
    subject: "Sony Corporation",
  });
});

test("rejects non-string and empty subjects", () => {
  for (const value of [undefined, null, 123, {}, "", "  ", "x"]) {
    assert.equal(validatePipelineSubject(value).valid, false, String(value));
  }
});

test("rejects overly long subjects", () => {
  const result = validatePipelineSubject("a".repeat(161));
  assert.equal(result.valid, false);
  assert.match(result.error, /160 characters/);
});

test("rejects control characters", () => {
  assert.equal(validatePipelineSubject("Sony\nCorporation").valid, false);
  assert.equal(validatePipelineSubject("Sony\u0000Corp").valid, false);
});
