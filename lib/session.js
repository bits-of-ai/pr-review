const GH_COOKIE = "prreview_gh";
const STATE_COOKIE = "prreview_oauth_state";
const MAX_AGE = 60 * 60 * 8;

function cookieFlags(requestUrl) {
  const secure = new URL(requestUrl).protocol === "https:";
  return `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const parts = header.split(/;\s*/);
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return "";
}

export function getGithubToken(request) {
  return getCookie(request, GH_COOKIE);
}

export function setGithubCookie(token, requestUrl) {
  return `${GH_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags(requestUrl)}; Max-Age=${MAX_AGE}`;
}

export function clearGithubCookie(requestUrl) {
  return `${GH_COOKIE}=; ${cookieFlags(requestUrl)}; Max-Age=0`;
}

export function setOauthStateCookie(state, requestUrl) {
  return `${STATE_COOKIE}=${encodeURIComponent(state)}; ${cookieFlags(requestUrl)}; Max-Age=600`;
}

export function getOauthState(request) {
  return getCookie(request, STATE_COOKIE);
}

export function clearOauthStateCookie(requestUrl) {
  return `${STATE_COOKIE}=; ${cookieFlags(requestUrl)}; Max-Age=0`;
}

export function oauthConfigured(env) {
  return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

export function hostedKeys(env) {
  return {
    anthropic: Boolean(env.ANTHROPIC_API_KEY),
    openai: Boolean(env.OPENAI_API_KEY),
  };
}