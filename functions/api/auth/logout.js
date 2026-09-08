import { json } from "../../../lib/http.js";
import { clearGithubCookie } from "../../../lib/session.js";

export async function onRequestPost({ request }) {
  return json({ ok: true }, 200, {
    "Set-Cookie": clearGithubCookie(request.url),
  });
}