# Security

## What visitors can see

`public/` is the only tree served as static files. The review prompt, GitHub fetching, and provider calls live in `lib/` and run inside Pages Functions. GitHub access tokens are stored in an **HttpOnly** cookie, not in JavaScript storage.

## What this app stores

- GitHub OAuth / PAT: HttpOnly cookie `prreview_gh` (8 hours).
- Optional user AI keys: `sessionStorage` or `localStorage` if the user opts in. Prefer setting `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` on the server.
- Cloudflare holds `GITHUB_CLIENT_SECRET` and any hosted provider keys. They are not logged by this code.

## Repository visibility

A public GitHub repo still contains `lib/` and `functions/`. Use a **private** repository if that source must not be public. Pages deploy does not hide git history.

## Reporting a vulnerability

Open a private GitHub security advisory, or contact the maintainers. Do not file a public issue that includes tokens, secrets, or a working exploit.

## Deployment checklist

- Use your own GitHub OAuth App. Callback must be `https://<host>/api/oauth/callback`.
- Mark `GITHUB_CLIENT_SECRET` and provider keys as secrets, not plaintext vars.
- Rotate the OAuth client secret if it leaks.
- Do not commit `.dev.vars`.
