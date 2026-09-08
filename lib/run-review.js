import { filterUnifiedDiff, truncateDiff, summarizeFiles } from "./diff.js";
import {
  getPullRequest,
  getPullRequestDiff,
  listPullRequestFiles,
  publicPullRequest,
  MAX_DIFF_CHARS,
} from "./github.js";
import { buildReviewPrompt } from "./prompt.js";
import { runReviewModel } from "./ai.js";
import { parseReviewResponse, reviewToMarkdown } from "./review-parse.js";

/**
 * Fetch PR → filter/truncate diff → build prompt → call the model → parse JSON.
 * Extra form notes are passed as extraContext into the prompt.
 */

export async function reviewPullRequest({
  token,
  owner,
  repo,
  number,
  extraContext,
  provider,
  model,
  apiKey,
}) {
  const pr = await getPullRequest(token, owner, repo, number);
  const [rawDiff, files] = await Promise.all([
    getPullRequestDiff(token, owner, repo, number),
    listPullRequestFiles(token, owner, repo, number),
  ]);

  const filtered = filterUnifiedDiff(rawDiff);
  const truncated = truncateDiff(filtered, MAX_DIFF_CHARS);
  const summary = summarizeFiles(files);
  const prompt = buildReviewPrompt({
    pr,
    filesSummary: summary.listed.join("\n"),
    diff: truncated.text,
    extraContext: String(extraContext || ""),
    truncated: truncated.truncated,
    skippedFiles: summary.skipped,
  });

  const raw = await runReviewModel({ provider, model, apiKey, prompt });
  const review = parseReviewResponse(raw);

  return {
    pr: publicPullRequest(pr),
    review: {
      summary: review.summary,
      verdict: review.verdict,
      findings: review.findings,
      parsed: review.parsed,
    },
    markdown: reviewToMarkdown(review),
  };
}