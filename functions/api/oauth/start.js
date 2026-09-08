import { redirect, json, siteOrigin } from "../../../lib/http.js";
import { oauthConfigured, setOauthStateCookie } from "../../../lib/session.js";

export async function onRequestGet({ request, env }) {
  if (!oauthConfigured(env)) {
    return json({ error: "GitHub OAuth is not configured on this deployment." }, 501);
  }

  const state = crypto.randomUUID();
  const origin = siteOrigin(request);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${origin}/api/oauth/callback`);
  authorize.searchParams.set("scope", env.OAUTH_SCOPE || "repo read:user");
  authorize.searchParams.set("state", state);

  return redirect(authorize.toString(), {
    "Set-Cookie": setOauthStateCookie(state, request.url),
  });
}