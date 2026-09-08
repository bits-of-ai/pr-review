# PR Review

Review a GitHub pull request with Claude, OpenAI, OpenRouter, Google AI Studio, Groq, Mistral, or Cerebras.

The form you see in the browser is only the website. Fetching the PR, building the review, and calling the AI all run on the server.

Live site: [https://pr-review.razonkumar.workers.dev/](https://pr-review.razonkumar.workers.dev/)  
Code: [https://github.com/bits-of-ai/pr-review](https://github.com/bits-of-ai/pr-review)

## How to use it

1. Paste a public PR link (or `owner/repo` and the number). Sign in only for private repos or to comment.
2. Add extra notes if you want (optional).
3. Pick a provider. OpenRouter, Google AI Studio, Groq, and Cerebras offer free API keys (rate-limited). Paste a key unless the host already added one.
4. Click **Review**. Copy the result, or sign in to post it as a PR comment.

## Run it on your computer

```bash
cp .dev.vars.example .dev.vars
```

Put your GitHub app ID and secret in `.dev.vars` if you want the **Authorize** button locally. Then:

```bash
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

```bash
npm test
```

## Put it on Cloudflare

The site is hosted on Cloudflare. Connecting this GitHub repo is enough; Cloudflare should use deploy command `npx wrangler deploy`.

After the first successful deploy:

1. Create a [GitHub OAuth App](https://github.com/settings/applications/new).
   - Homepage URL: your live site, for example `https://pr-review.razonkumar.workers.dev`
   - Callback URL: `https://pr-review.razonkumar.workers.dev/api/oauth/callback`
   - Leave **wildcard matching** and **Device Flow** off.
2. In Cloudflare, open the project → **Settings → Variables and Secrets** and add:
   - `GITHUB_CLIENT_ID` (from the GitHub app)
   - `GITHUB_CLIENT_SECRET` (from the GitHub app, mark as secret)
   - Optional hosted keys so users do not have to paste their own: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_AI_API_KEY` (or `GEMINI_API_KEY`), `GROQ_API_KEY`, `MISTRAL_API_KEY`, `CEREBRAS_API_KEY`
3. Redeploy: **Deployments → Retry**, or push a new commit to GitHub.

Until the two GitHub values are set, **Authorize with GitHub** stays off. People can still paste a token.

Do not put secrets in this git repo.

## Folders

```
public/        the website (what visitors see)
src/           the server entry (routes the /api calls)
functions/api/ the code for each /api URL
lib/           review logic (not shown in the browser)
  prompt.js    review instructions and how notes are added
  review-schema.js  JSON shape (verdicts, severities)
tests/         automated tests
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
