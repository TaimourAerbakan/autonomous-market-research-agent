export type PipelineSuccess = {
  success: true;
  fileName: string;
  message: string;
};

export type PipelineFailure = {
  error: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 120_000;

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

/**
 * Calls the existing research endpoint with basic client-side validation,
 * timeout handling, and readable network/API errors.
 *
 * This helper is additive and is not yet wired into the existing page.
 */
export async function runResearchPipeline(subjectInput: string): Promise<PipelineSuccess> {
  const subject = subjectInput.trim();

  if (subject.length < 2) {
    throw new Error("Enter a subject with at least 2 characters.");
  }

  if (subject.length > 160) {
    throw new Error("Subject must be 160 characters or fewer.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response: Response;

    try {
      response = await fetch(`${getApiBaseUrl()}/api/run-pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("The research request timed out. Try again.");
      }

      throw new Error(
        "Cannot reach the research server. Check that the backend is running and NEXT_PUBLIC_API_BASE_URL is correct.",
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("The research server returned an invalid response.");
    }

    if (!response.ok) {
      const apiMessage =
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : `Research request failed (HTTP ${response.status}).`;
      throw new Error(apiMessage);
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("success" in payload) ||
      payload.success !== true ||
      !("fileName" in payload) ||
      typeof payload.fileName !== "string" ||
      !("message" in payload) ||
      typeof payload.message !== "string"
    ) {
      throw new Error("The research server returned an unexpected response format.");
    }

    return {
      success: true,
      fileName: payload.fileName,
      message: payload.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}
