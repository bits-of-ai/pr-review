import { json } from "../../lib/http.js";
import { getGithubToken } from "../../lib/session.js";
import { getAuthenticatedUser } from "../../lib/github.js";

export async function onRequestGet({ request }) {
  const token = getGithubToken(request);
  if (!token) return json({ user: null });

  try {
    const user = await getAuthenticatedUser(token);
    return json({
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
      },
    });
  } catch {
    return json({ user: null });
  }
}