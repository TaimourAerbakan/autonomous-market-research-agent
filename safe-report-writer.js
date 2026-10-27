import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SAFE_REPORT_NAME = /^[a-z0-9][a-z0-9._-]{0,119}\.(txt|md|json|csv)$/i;

/**
 * Save a text report without overwriting an existing file.
 *
 * This is an additive, standalone helper. Existing application code is not
 * switched to it automatically; callers must opt in explicitly.
 */
export async function saveReportWithoutOverwrite(
  filename,
  content,
  reportsDirectory = path.resolve(process.cwd(), "reports"),
) {
  if (typeof filename !== "string" || !SAFE_REPORT_NAME.test(filename) || filename.includes("..")) {
    throw new TypeError(
      "Invalid report filename. Use a simple .txt, .md, .json, or .csv filename.",
    );
  }

  if (typeof content !== "string") {
    throw new TypeError("Report content must be a string.");
  }

  const directory = path.resolve(reportsDirectory);
  await mkdir(directory, { recursive: true });

  // The exclusive "wx" flag makes creation atomic and refuses to overwrite
  // an existing file, including when concurrent requests use the same name.
  const destination = path.join(directory, filename);
  await writeFile(destination, content, { encoding: "utf8", flag: "wx" });

  return destination;
}
