import { json, errorMessage } from "../../lib/http.js";
import { getGithubToken } from "../../lib/session.js";
import { resolveApiKey } from "../../lib/ai.js";
import { resolvePullRequest } from "../../lib/parse-pr.js";
import { reviewPullRequest } from "../../lib/run-review.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const token = getGithubToken(request) || String(body.githubToken || "").trim();
  const ref = resolvePullRequest(body.repo, body.number, body.url);
  const provider = body.provider === "openai" ? "openai" : "anthropic";
  const model = String(body.model || "").slice(0, 80);
  const apiKey = resolveApiKey(env, provider, body.apiKey);

  if (!token) {
    return json({ error: "Authorize with GitHub or paste a personal access token." }, 401);
  }
  if (!ref) {
    return json(
      { error: "Enter a repository (owner/repo) and pull request number, or paste a PR URL." },
      400,
    );
  }
  if (!model) return json({ error: "Choose a model." }, 400);
  if (!apiKey) {
    return json(
      {
        error:
          provider === "openai"
            ? "Enter an OpenAI API key, or set OPENAI_API_KEY on the server."
            : "Enter an Anthropic API key, or set ANTHROPIC_API_KEY on the server.",
      },
      400,
    );
  }

  try {
    const result = await reviewPullRequest({
      token,
      owner: ref.owner,
      repo: ref.repo,
      number: ref.number,
      extraContext: String(body.extraContext || "").slice(0, 20_000),
      provider,
      model,
      apiKey,
    });
    return json(result);
  } catch (error) {
    return json({ error: errorMessage(error) }, error.status || 500);
  }
}