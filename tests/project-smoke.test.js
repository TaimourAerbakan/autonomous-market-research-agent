import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readProjectFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("backend JavaScript files pass Node syntax checks", async () => {
  for (const file of ["index.js", "agent.js", "tools.js", "server.js"]) {
    const result = spawnSync(process.execPath, ["--check", path.join(root, file)], {
      encoding: "utf8",
    });

    assert.equal(
      result.status,
      0,
      `${file} failed syntax check:\n${result.stderr || result.stdout}`,
    );
  }
});

test("frontend and backend agree on the pipeline endpoint", async () => {
  const [server, page] = await Promise.all([
    readProjectFile("server.js"),
    readProjectFile("frontend/app/page.tsx"),
  ]);

  assert.match(server, /app\.post\(["']\/api\/run-pipeline["']/);
  assert.match(page, /\/api\/run-pipeline/);
});

test("local environment template documents both provider keys without credentials", async () => {
  const example = await readProjectFile(".env.example");

  assert.match(example, /^GEMINI_API_KEY=$/m);
  assert.match(example, /^TAVILY_API_KEY=$/m);
  assert.doesNotMatch(example, /(?:AIza[0-9A-Za-z_-]{20,}|tvly-[0-9A-Za-z_-]{10,})/);
});

test("local environment files remain ignored by Git", async () => {
  const gitignore = await readProjectFile(".gitignore");

  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\*\.local$/m);
});
