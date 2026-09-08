import { json, errorMessage } from "../../lib/http.js";
import { getGithubToken } from "../../lib/session.js";
import { createIssueComment } from "../../lib/github.js";
import { resolvePullRequest } from "../../lib/parse-pr.js";

export async function onRequestPost({ request }) {
  const body = await request.json().catch(() => ({}));
  const token = getGithubToken(request);
  const ref = resolvePullRequest(body.repo, body.number, body.url);
  const markdown = String(body.markdown || "").trim();

  if (!token) return json({ error: "Sign in before posting a comment." }, 401);
  if (!ref) return json({ error: "Missing pull request." }, 400);
  if (!markdown) return json({ error: "Missing review markdown." }, 400);

  try {
    const comment = await createIssueComment(
      token,
      ref.owner,
      ref.repo,
      ref.number,
      markdown,
    );
    return json({ html_url: comment.html_url });
  } catch (error) {
    return json({ error: errorMessage(error) }, error.status || 500);
  }
}