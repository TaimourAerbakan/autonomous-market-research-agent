# Frontend API client (additive)

Added `frontend/lib/pipeline-client.ts`, a typed wrapper for the existing `POST /api/run-pipeline` endpoint. It includes:

- subject trimming and length validation;
- configurable API base URL via `NEXT_PUBLIC_API_BASE_URL`;
- a two-minute request timeout;
- clearer messages for unreachable servers and invalid JSON;
- validation of the existing success response shape.

## Configuration

Copy `frontend/.env.example` to `frontend/.env.local` if the backend is not running at the default local URL. Restart the Next.js dev server after changing environment variables.

## Integration status

The helper is deliberately not imported by `frontend/app/page.tsx` yet. The existing UI and request path remain unchanged. This isolates the change for review and avoids accidentally replacing any current interface behavior. Once reviewed, a follow-up can switch the submit handler to this helper while preserving all existing markup and status messages.
