import {
  getProviderKey,
  setProviderKey,
  getPrefs,
  setPrefs,
  rememberSecrets,
  setRememberSecrets,
} from "./storage.js";
import { resolvePullRequest } from "./parse-pr.js";
import { escapeHtml, renderMarkdown } from "./markdown.js";
import { PROVIDERS, getProvider } from "./models.js";

const TOKEN_URL =
  "https://github.com/settings/tokens/new?description=PR%20Review&scopes=repo";

const state = {
  user: null,
  config: { oauthConfigured: false, hostedKeys: { anthropic: false, openai: false } },
  review: null,
  markdown: "",
  ref: null,
};

const el = (id) => document.getElementById(id);

init().catch((error) => {
  showBanner(error.message || String(error), "error");
});

async function init() {
  bind();
  restoreForm();
  updateProviderUi();
  el("token-docs").href = TOKEN_URL;

  const params = new URLSearchParams(window.location.search);
  if (params.get("auth") === "ok") {
    showBanner("Signed in with GitHub.", "success");
  }
  if (params.get("auth_error")) {
    showBanner(params.get("auth_error"), "error");
  }
  if (params.has("auth") || params.has("auth_error")) {
    history.replaceState({}, "", window.location.pathname);
  }

  try {
    state.config = await api("/api/config");
  } catch {
    state.config = { oauthConfigured: false, hostedKeys: { anthropic: false, openai: false } };
  }
  updateOauthButton();
  updateKeyHint();

  try {
    const session = await api("/api/session");
    state.user = session.user;
    if (session.user && !params.get("auth_error")) {
      if (params.get("auth") !== "ok") {
        /* already signed in from cookie */
      }
    }
  } catch {
    state.user = null;
  }
  updateAuthUi();
}

function bind() {
  el("authorize-btn").addEventListener("click", () => {
    window.location.assign("/api/oauth/start");
  });

  el("sign-out-btn").addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    state.user = null;
    updateAuthUi();
    showBanner("Signed out.", "success");
  });

  el("save-token-btn").addEventListener("click", onSaveToken);
  el("token-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") onSaveToken();
  });

  el("pr-url").addEventListener("input", onUrlInput);
  el("provider").addEventListener("change", () => {
    updateProviderUi();
    updateKeyHint();
    setPrefs({ provider: el("provider").value, model: el("model").value });
  });
  el("model").addEventListener("change", () => {
    setPrefs({ provider: el("provider").value, model: el("model").value });
  });
  el("remember").addEventListener("change", () => {
    setRememberSecrets(el("remember").checked);
  });

  el("review-form").addEventListener("submit", (event) => {
    event.preventDefault();
    runReview();
  });

  el("copy-btn").addEventListener("click", copyMarkdown);
  el("post-btn").addEventListener("click", postComment);
}

function restoreForm() {
  const prefs = getPrefs();
  el("repo").value = prefs.repo;
  el("provider").innerHTML = PROVIDERS.map(
    (p) => `<option value="${p.id}">${p.label}</option>`,
  ).join("");
  el("provider").value = prefs.provider;
  el("remember").checked = rememberSecrets();
  const key = getProviderKey(prefs.provider);
  if (key) el("api-key").value = key;
}

function updateProviderUi() {
  const provider = getProvider(el("provider").value);
  const prefs = getPrefs();
  el("model").innerHTML = provider.models
    .map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.label)}</option>`)
    .join("");
  const selected = provider.models.some((m) => m.id === prefs.model)
    ? prefs.model
    : provider.models[0].id;
  el("model").value = selected;
  el("api-key").placeholder = provider.keyLabel;
  el("api-key-label").textContent = provider.keyLabel;
  el("api-key-docs").href = provider.docs;
  const stored = getProviderKey(provider.id);
  if (stored) el("api-key").value = stored;
}

function updateOauthButton() {
  const button = el("authorize-btn");
  const hint = el("oauth-hint");
  if (state.config.oauthConfigured) {
    button.disabled = false;
    button.title = "Authorize this app with GitHub";
    hint.hidden = true;
  } else {
    button.disabled = true;
    button.title = "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET on Cloudflare Pages";
    hint.hidden = false;
  }
}

function updateKeyHint() {
  const provider = el("provider").value;
  const hosted = state.config.hostedKeys?.[provider];
  el("key-optional").hidden = !hosted;
}

function updateAuthUi() {
  const signedIn = Boolean(state.user);
  el("auth-guest").hidden = signedIn;
  el("auth-user").hidden = !signedIn;
  if (signedIn) {
    el("user-name").textContent = state.user.login;
    el("user-avatar").src = state.user.avatar_url;
    el("user-avatar").alt = "";
  }
}

async function onSaveToken() {
  const token = el("token-input").value.trim();
  if (!token) {
    showBanner("Paste a GitHub personal access token first.", "error");
    return;
  }
  try {
    const data = await api("/api/auth/token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    state.user = data.user;
    el("token-input").value = "";
    updateAuthUi();
    showBanner(`Authenticated as ${data.user.login}.`, "success");
  } catch (error) {
    showBanner(error.message || "That token was rejected.", "error");
  }
}

function onUrlInput() {
  const parsed = resolvePullRequest("", "", el("pr-url").value);
  if (!parsed) return;
  el("repo").value = `${parsed.owner}/${parsed.repo}`;
  el("number").value = String(parsed.number);
}

async function runReview() {
  hideBanner();
  state.review = null;
  state.markdown = "";
  el("results").hidden = true;
  el("review-btn").disabled = true;

  const providerId = el("provider").value;
  const apiKey = el("api-key").value.trim();
  const extraContext = el("context").value;
  const ref = resolvePullRequest(el("repo").value, el("number").value, el("pr-url").value);

  try {
    if (!ref) throw new Error("Enter a repository (owner/repo) and pull request number, or paste a PR URL.");
    const hosted = state.config.hostedKeys?.[providerId];
    if (!apiKey && !hosted) {
      throw new Error(`Enter your ${getProvider(providerId).keyLabel}.`);
    }

    if (apiKey) setProviderKey(providerId, apiKey);
    setPrefs({ provider: providerId, model: el("model").value, repo: `${ref.owner}/${ref.repo}` });
    state.ref = ref;

    setStatus("Reviewing on the server…");
    const data = await api("/api/review", {
      method: "POST",
      body: JSON.stringify({
        repo: `${ref.owner}/${ref.repo}`,
        number: ref.number,
        extraContext,
        provider: providerId,
        model: el("model").value,
        apiKey,
      }),
    });

    state.review = data.review;
    state.markdown = data.markdown;
    renderPrMeta(data.pr);
    renderReview(data.review);
    setStatus("");
  } catch (error) {
    setStatus("");
    showBanner(error.message || String(error), "error");
  } finally {
    el("review-btn").disabled = false;
  }
}

function renderPrMeta(pr) {
  el("pr-title").textContent = pr.title;
  el("pr-title").href = pr.html_url;
  el("pr-meta").textContent = `#${pr.number} · ${pr.user?.login || "unknown"} · +${pr.additions} / −${pr.deletions} · ${pr.changed_files} files`;
}

function renderReview(review) {
  const verdictLabel = {
    approve: "Looks safe to merge",
    comment: "Needs discussion",
    request_changes: "Request changes",
  }[review.verdict];

  el("verdict").className = `verdict verdict-${review.verdict}`;
  el("verdict").textContent = verdictLabel;
  el("summary").innerHTML = renderMarkdown(review.summary);

  const list = el("findings");
  list.innerHTML = "";
  if (!review.findings.length) {
    list.innerHTML = `<li class="finding finding-empty">No findings. Still give the diff a human pass before merging.</li>`;
  } else {
    for (const finding of review.findings) {
      const loc = [finding.file, finding.line].filter(Boolean).join(":");
      const item = document.createElement("li");
      item.className = `finding finding-${finding.severity}`;
      item.innerHTML = `
        <div class="finding-head">
          <span class="pill pill-${finding.severity}">${escapeHtml(finding.severity)}</span>
          <strong>${escapeHtml(finding.title)}</strong>
          ${loc ? `<span class="finding-loc">${escapeHtml(loc)}</span>` : ""}
        </div>
        <div class="finding-body">${renderMarkdown(finding.body)}</div>
      `;
      list.appendChild(item);
    }
  }

  el("unparsed-note").hidden = Boolean(review.parsed);
  el("results").hidden = false;
  el("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyMarkdown() {
  if (!state.markdown) return;
  try {
    await navigator.clipboard.writeText(state.markdown);
    showBanner("Review copied as Markdown.", "success");
  } catch {
    showBanner("Could not copy. Select the findings and copy manually.", "error");
  }
}

async function postComment() {
  if (!state.markdown || !state.ref) return;
  if (!window.confirm("Post this review as a comment on the pull request?")) return;
  try {
    el("post-btn").disabled = true;
    const data = await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({
        repo: `${state.ref.owner}/${state.ref.repo}`,
        number: state.ref.number,
        markdown: state.markdown,
      }),
    });
    showBanner("Comment posted on the pull request.", "success");
    if (data.html_url) window.open(data.html_url, "_blank", "noopener");
  } catch (error) {
    showBanner(error.message || "Could not post the comment.", "error");
  } finally {
    el("post-btn").disabled = false;
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

function setStatus(text) {
  el("status").hidden = !text;
  el("status").textContent = text;
}

function showBanner(message, kind) {
  const banner = el("banner");
  banner.hidden = false;
  banner.className = `banner banner-${kind}`;
  banner.textContent = message;
  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideBanner() {
  el("banner").hidden = true;
}