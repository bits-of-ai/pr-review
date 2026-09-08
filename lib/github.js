export const GITHUB_API = "https://api.github.com";
export const GITHUB_API_VERSION = "2022-11-28";
export const MAX_FILES_LISTED = 400;
export const MAX_DIFF_CHARS = 120_000;

export class GithubError extends Error {
  constructor(message, status, extra = {}) {
    super(message);
    this.name = "GithubError";
    this.status = status;
    this.extra = extra;
  }
}

function headers(token, extra = {}) {
  const h = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pr-review",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    ...extra,
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(token, path, init = {}) {
  const url = path.startsWith("http") ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(token, init.headers) },
  });

  if (!res.ok) {
    const raw = await res.text();
    let detail = raw;
    try {
      const body = JSON.parse(raw);
      detail = body.message || JSON.stringify(body);
    } catch {
      // keep raw text (diff errors are not JSON)
    }
    throw new GithubError(githubMessage(res.status, detail, Boolean(token)), res.status, { detail });
  }

  return res;
}

function githubMessage(status, detail, signedIn) {
  if (status === 401) {
    return "GitHub rejected this sign-in. Deauthorize and try again, or paste a new personal access token.";
  }
  if (status === 403) {
    if (/rate limit/i.test(detail)) {
      return signedIn
        ? "GitHub rate limit reached. Wait a few minutes and retry."
        : "GitHub rate limit reached for unsigned requests. Sign in to continue.";
    }
    return "GitHub denied access. For a private pull request, authorize with GitHub first.";
  }
  if (status === 404) {
    return signedIn
      ? "Pull request not found. Check the repository, number, and that this account can read it."
      : "Pull request not found. If it is private, authorize with GitHub first.";
  }
  return `GitHub API error (${status}): ${detail || "unknown error"}`;
}

export async function getAuthenticatedUser(token) {
  const res = await request(token, "/user");
  return res.json();
}

export async function getPullRequest(token, owner, repo, number) {
  const res = await request(token, `/repos/${owner}/${repo}/pulls/${number}`);
  return res.json();
}

export async function getPullRequestDiff(token, owner, repo, number) {
  const res = await request(token, `/repos/${owner}/${repo}/pulls/${number}`, {
    headers: { Accept: "application/vnd.github.diff" },
  });
  return res.text();
}

export async function listPullRequestFiles(token, owner, repo, number) {
  const files = [];
  let page = 1;
  const perPage = 100;

  while (files.length < MAX_FILES_LISTED) {
    const res = await request(
      token,
      `/repos/${owner}/${repo}/pulls/${number}/files?per_page=${perPage}&page=${page}`,
    );
    const batch = await res.json();
    files.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return files;
}

export async function createIssueComment(token, owner, repo, number, body) {
  const res = await request(token, `/repos/${owner}/${repo}/issues/${number}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return res.json();
}

export function publicPullRequest(pr) {
  return {
    title: pr.title,
    number: pr.number,
    html_url: pr.html_url,
    user: { login: pr.user?.login || "unknown" },
    additions: pr.additions,
    deletions: pr.deletions,
    changed_files: pr.changed_files,
  };
}