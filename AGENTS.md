# Agent notes

This repo is a Cloudflare Worker that reviews GitHub pull requests. The browser form is only UI. Fetching the PR, building the prompt, and calling the model all run on the server.

Humans: start with [README.md](README.md) (how to run and deploy) and [CONTRIBUTING.md](CONTRIBUTING.md) (where to edit). This file is for coding agents.

## Layout

| Path | Role |
| --- | --- |
| `public/` | Static website. Never put review logic, tokens, or secrets here. |
| `src/index.js` | Worker entry. Maps `/api/*` to handlers in `functions/api/`. |
| `functions/api/` | One file per API route (`review`, `comment`, OAuth, session). |
| `lib/` | Server-only review pipeline. |
| `tests/` | Node built-in test runner (`npm test`). |
| `wrangler.toml` | Worker name, `public/` assets, `OAUTH_SCOPE`. Do not put secrets here. |

Pipeline order is `lib/run-review.js`: fetch PR → filter/truncate diff → `lib/prompt.js` → provider call → parse JSON.

## Conventions

- Plain JavaScript ESM. Node 20+. No new dependencies unless there is a strong reason.
- 2-space indent, LF, UTF-8 (see `.editorconfig`).
- Keep changes small. One idea per PR.
- After changing prompts, review JSON, diffs, or parsing, add or update a test in `tests/` and run `npm test`.
- Local: `cp .dev.vars.example .dev.vars` then `npm start` (http://127.0.0.1:4173). Never commit `.dev.vars`.

## Where to edit

| Change | Files |
| --- | --- |
| Review focus, nits, verdict rules | `lib/prompt.js` |
| Review JSON shape | `lib/review-schema.js` and `lib/review-parse.js` |
| Provider catalog / hosted key names | `lib/providers.js` **and** `public/js/models.js` (same `id`) |
| GitHub API | `lib/github.js` |
| Model HTTP calls | `lib/ai.js` |
| Skipped/truncated diffs | `lib/diff.js` |
| New `/api/...` route | `functions/api/` **and** `src/index.js` |
| Form / clicks | `public/js/app.js` |
| Layout / copy | `public/index.html`, `public/css/app.css` |

Form **Notes** arrive as `extraContext` and are injected as “Reviewer notes (highest priority)” in `lib/prompt.js`.

## Do not

- Commit secrets, tokens, or `.dev.vars`.
- Put `GITHUB_CLIENT_ID` or API keys in `wrangler.toml` (an empty `[vars]` value can wipe the Cloudflare dashboard value on deploy).
- Move review/prompt/GitHub code into `public/`.
- Add Cursor-only or vendor-only instruction files that repeat this one. Prefer this portable `AGENTS.md`.
