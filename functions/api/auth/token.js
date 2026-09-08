import { json } from "../../../lib/http.js";
import { setGithubCookie } from "../../../lib/session.js";
import { getAuthenticatedUser } from "../../../lib/github.js";

export async function onRequestPost({ request }) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "").trim();
  if (!token) return json({ error: "Paste a GitHub personal access token first." }, 400);

  try {
    const user = await getAuthenticatedUser(token);
    return json(
      {
        user: {
          login: user.login,
          avatar_url: user.avatar_url,
        },
      },
      200,
      { "Set-Cookie": setGithubCookie(token, request.url) },
    );
  } catch (error) {
    return json({ error: error.message || "That token was rejected." }, error.status || 401);
  }
}