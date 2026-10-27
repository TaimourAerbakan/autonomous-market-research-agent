import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { saveReportWithoutOverwrite } from "../safe-report-writer.js";

test("creates a report inside the reports directory", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "report-writer-"));
  try {
    const destination = await saveReportWithoutOverwrite("summary.txt", "Report body", root);
    assert.equal(await readFile(destination, "utf8"), "Report body");
    assert.equal(path.dirname(destination), path.resolve(root));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("refuses to overwrite an existing report", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "report-writer-"));
  try {
    await saveReportWithoutOverwrite("summary.txt", "Original", root);
    await assert.rejects(
      saveReportWithoutOverwrite("summary.txt", "Replacement", root),
      (error) => error.code === "EEXIST",
    );
    assert.equal(await readFile(path.join(root, "summary.txt"), "utf8"), "Original");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects path traversal and unsupported names", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "report-writer-"));
  try {
    for (const filename of ["../outside.txt", "nested/report.txt", ".env", "bad name.txt", "report..txt"]) {
      await assert.rejects(
        saveReportWithoutOverwrite(filename, "body", root),
        { name: "TypeError" },
        filename,
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects non-string report content", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "report-writer-"));
  try {
    await assert.rejects(
      saveReportWithoutOverwrite("summary.txt", { secret: "no" }, root),
      { name: "TypeError" },
    );
    await assert.rejects(stat(path.join(root, "summary.txt")), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
