# Contributing

Thanks for helping. Keep changes small and easy to review.

## Run locally

```bash
cp .dev.vars.example .dev.vars
npm start
npm test
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Do not commit `.dev.vars` or any API keys.

## Where to edit

| You want to change | Open this |
| --- | --- |
| What the model looks for (focus, nits, verdicts) | `lib/prompt.js` |
| The JSON the model must return | `lib/review-schema.js` and `lib/review-parse.js` |
| How GitHub is called | `lib/github.js` |
| How an AI provider is called | `lib/ai.js` |
| Add a provider or hosted key name | `lib/providers.js` **and** `public/js/models.js` (same `id`) |
| Which files are skipped in the diff | `lib/diff.js` |
| The review pipeline order | `lib/run-review.js` |
| A `/api/...` URL | `functions/api/` and `src/index.js` |
| Layout or wording | `public/index.html`, `public/css/app.css` |
| Button clicks and form behavior | `public/js/app.js` |

The **Notes** field on the form is `extraContext`. It is injected as “Reviewer notes (highest priority)” in `lib/prompt.js`.

Keep review logic out of `public/`. That folder is sent to every visitor.

## Tests

After changing parsing, diffs, prompts, or the review JSON, add or update a test in `tests/` and run:

```bash
npm test
```

## Pull requests

- One idea per PR.
- Do not commit secrets.
- Use 2-space indent. No extra libraries unless we really need them.

Be kind in issues and reviews.
