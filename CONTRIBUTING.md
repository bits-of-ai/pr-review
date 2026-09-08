# Contributing

Thanks for helping. Keep changes small and easy to review.

## Run locally

```bash
cp .dev.vars.example .dev.vars
npx wrangler dev --port 4173
npm test
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Do not commit `.dev.vars` or any API keys.

## Where to edit

| You want to change | Open this |
| --- | --- |
| How the review is written | `lib/prompt.js` |
| How GitHub is called | `lib/github.js` |
| How an AI provider is called | `lib/ai.js`, `lib/providers.js` |
| Which files are skipped in the diff | `lib/diff.js` |
| A `/api/...` URL | `functions/api/` and `src/index.js` |
| Layout or wording | `public/index.html`, `public/css/app.css` |
| Button clicks and form behavior | `public/js/app.js` |

Keep review logic out of `public/`. That folder is sent to every visitor.

## Tests

After changing parsing, diffs, or the review JSON, add or update a test in `tests/` and run:

```bash
npm test
```

## Pull requests

- One idea per PR.
- Do not commit secrets.
- Use 2-space indent. No extra libraries unless we really need them.

Be kind in issues and reviews.
