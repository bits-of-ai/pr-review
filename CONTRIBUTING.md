# Contributing

The browser only gets `public/`. Review logic lives in `lib/` and is called from `functions/`.

## Setup

```bash
cp .dev.vars.example .dev.vars
npx wrangler pages dev public --port 4173
npm test
```

## How to change things

| Goal | Where |
| --- | --- |
| Review prompt / JSON schema | `lib/prompt.js` |
| GitHub REST | `lib/github.js` |
| Model calls | `lib/ai.js` |
| Diff filtering | `lib/diff.js` |
| HTTP routes | `functions/api/` |
| Layout / copy | `public/index.html`, `public/css/app.css` |
| Client wiring | `public/js/app.js` |

Do not put the prompt or GitHub/AI clients in `public/`. That would ship them to every visitor.

`lib/` modules should stay importable from Node so `tests/` can cover them.

## Tests

`npm test` uses Node’s built-in runner. Add a test when you change parsing, diff filtering, or review JSON handling.

## Pull requests

- One concern per PR.
- Do not commit `.dev.vars`, API keys, or OAuth secrets.
- Match the existing style: 2-space indent, ESM, no bundler, no CSS framework.

## Code of conduct

Be respectful in issues and reviews. Harassment, spam, and PRs that exfiltrate tokens will be closed.
