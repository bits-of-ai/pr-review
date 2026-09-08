import { redirect, siteOrigin } from "../../../lib/http.js";
import {
  getOauthState,
  setGithubCookie,
  clearOauthStateCookie,
  oauthConfigured,
} from "../../../lib/session.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = siteOrigin(request);
  const home = `${origin}/`;
  const fail = (reason) => redirect(`${home}?auth_error=${encodeURIComponent(reason)}`);

  if (!oauthConfigured(env)) {
    return fail("OAuth is not configured.");
  }

  const error = url.searchParams.get("error");
  if (error) {
    return fail(url.searchParams.get("error_description") || error);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = getOauthState(request);
  if (!code || !state || !expected || state !== expected) {
    return fail("OAuth state did not match. Start authorization again.");
  }

  const upstream = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/oauth/callback`,
    }),
  });

  const payload = await upstream.json().catch(() => ({}));
  const token = payload.access_token;
  if (!token) {
    return fail(payload.error_description || payload.error || "GitHub did not return an access token.");
  }

  const headers = new Headers();
  headers.set("Location", `${home}?auth=ok`);
  // GitHub token last so it is kept if the runtime keeps only one Set-Cookie.
  headers.append("Set-Cookie", clearOauthStateCookie(request.url));
  headers.append("Set-Cookie", setGithubCookie(token, request.url));
  return new Response(null, { status: 303, headers });
}