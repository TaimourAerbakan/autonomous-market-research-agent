# Autonomous Market Research Agent

A full-stack research assistant prototype that coordinates two AI agents: a researcher that gathers web-search results and an editor that formats findings into a local report.

The repository contains a Next.js frontend, an Express backend, a Gemini-powered agent loop, and Tavily-powered web search. This README documents the current implementation; it does not imply that the app is production-hardened or deployed.

## Project structure

```text
.
├── agent.js                 # Gemini conversation/tool-call loop
├── index.js                 # CLI workflow (currently researches Sony Corporation)
├── server.js                # Express API for the web interface
├── tools.js                 # Tavily search and local file-writing tools
├── tests/
│   └── project-smoke.test.js # Dependency-free structural/syntax checks
├── docs/
│   └── QUALITY_AND_SECURITY.md
├── .env.example              # Names of required local environment variables
└── frontend/                 # Next.js / React interface
```

## Requirements

- Node.js 20 or newer
- npm
- A Gemini API key
- A Tavily API key

## Local setup

1. Install the backend dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

   Add your own keys to `.env`. Never commit real API keys or paste them into issue reports.

3. Start the Express API in the repository root:

   ```bash
   node server.js
   ```

   The current backend listens on `http://localhost:5000`.

4. In a second terminal, install and start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

> Current integration note: the frontend calls `http://localhost:5000/api/run-pipeline` directly. That is suitable for local development, but needs a configurable API base URL before deployment. The backend currently enables broad CORS; restrict allowed origins before exposing it publicly.

## Run the CLI workflow

From the repository root, run:

```bash
node index.js
```

The current CLI example researches a fixed subject (Sony Corporation) and asks the editor agent to write `sony_analysis.txt`. The web workflow accepts a subject from the UI and returns the generated filename. Generated reports are written to the backend process's current working directory.

## Checks

Run the dependency-free smoke tests from the repository root:

```bash
node --test tests/*.test.js
```

These checks validate JavaScript syntax and a few important integration assumptions. They do **not** call external APIs or prove that live Gemini/Tavily requests will succeed.

## Current limitations to know about

- The agent loop uses a fixed model, turn limit, and delays.
- Tool-call parsing currently reads only the first response part.
- Report filenames are derived from user/model-controlled text; review the file-writing behavior before accepting untrusted input or running the service in a sensitive directory.
- The backend has no authentication, request rate limiting, or configurable CORS allowlist.
- The web UI uses a hardcoded local API URL.
- The root package's existing `npm test` script is a placeholder. The added smoke tests can be run directly with Node as shown above; existing package scripts have deliberately not been changed.

See [Quality and security notes](docs/QUALITY_AND_SECURITY.md) for the review checklist and safe next steps.

## Technology

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, CORS, dotenv
- **AI orchestration:** Google GenAI SDK
- **Search:** Tavily
- **Tests:** Node.js built-in test runner

## Project status

This is an active learning and portfolio project. Run it locally with your own API keys, inspect the generated reports, and treat AI-generated research as a starting point that needs source verification.
