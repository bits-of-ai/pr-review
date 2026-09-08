/** Keep in sync with lib/parse-pr.js (server copy). The browser cannot import lib/. */
const PR_URL =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i;
const OWNER_REPO_NUMBER = /^([^/\s]+)\/([^#\s/]+)(?:#|\/pull\/|\/)(\d+)$/i;
const OWNER_REPO = /^([^/\s]+)\/([^/\s]+)$/;

/**
 * Parse a GitHub pull request from a URL, `owner/repo#123`, or `owner/repo/123`.
 * @param {string} input
 * @returns {{ owner: string, repo: string, number: number } | null}
 */
export function parsePullRequestRef(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) return null;

  const fromUrl = trimmed.match(PR_URL);
  if (fromUrl) {
    return normalize(fromUrl[1], fromUrl[2], fromUrl[3]);
  }

  const compact = trimmed.match(OWNER_REPO_NUMBER);
  if (compact) {
    return normalize(compact[1], compact[2], compact[3]);
  }

  return null;
}

/**
 * Combine a repository field and a PR number (or a full ref in either field).
 * @param {string} repoField
 * @param {string | number} numberField
 * @param {string} [urlField]
 */
export function resolvePullRequest(repoField, numberField, urlField) {
  const url = String(urlField ?? "").trim();
  if (url) {
    const parsed = parsePullRequestRef(url);
    if (parsed) return parsed;
  }

  const repo = String(repoField ?? "").trim();
  const numberRaw = String(numberField ?? "").trim();

  const fromRepo = parsePullRequestRef(repo);
  if (fromRepo) return fromRepo;

  if (numberRaw) {
    const fromNumber = parsePullRequestRef(numberRaw);
    if (fromNumber) return fromNumber;
  }

  const repoMatch = repo.match(OWNER_REPO);
  const number = Number.parseInt(numberRaw, 10);
  if (repoMatch && Number.isInteger(number) && number > 0) {
    return normalize(repoMatch[1], repoMatch[2], number);
  }

  return null;
}

function normalize(owner, repo, number) {
  const cleanRepo = String(repo).replace(/\.git$/i, "");
  const n = Number(number);
  if (!owner || !cleanRepo || !Number.isInteger(n) || n <= 0) return null;
  return { owner, repo: cleanRepo, number: n };
}