const SYSTEM_PROMPT = `You are a senior software engineer performing a careful pull request review.

Focus on:
- Correctness bugs, race conditions, null/edge cases
- Security (injection, authz, secrets, unsafe deserialization, SSRF, XSS)
- Breaking API/behavior changes
- Data loss, concurrency, and performance traps
- Missing tests for risky logic

Do not nitpick formatting, import order, or naming unless it hides a real defect.
Do not praise the change at length. Be specific: cite file paths and line numbers from the diff when possible.
If the diff is truncated, say so and only review what you can see.

Return ONLY valid JSON — no markdown fences, no prose before or after — matching:
{
  "summary": "2-5 sentence overview of the change and review",
  "verdict": "approve" | "comment" | "request_changes",
  "findings": [
    {
      "severity": "critical" | "warning" | "suggestion" | "nit" | "praise",
      "file": "path relative to repo or null",
      "line": 123,
      "title": "short headline",
      "body": "what is wrong, why it matters, and a concrete fix"
    }
  ]
}

Use "request_changes" if any finding is critical or if a warning would break production.
Use "approve" only when the diff looks safe to merge with at most nits.
If there are no issues, return an empty findings array and a brief summary.`;

/**
 * @param {{
 *   pr: object,
 *   filesSummary: string,
 *   diff: string,
 *   extraContext: string,
 *   truncated: boolean,
 *   skippedFiles: number
 * }} input
 */
export function buildReviewPrompt(input) {
  const { pr, filesSummary, diff, extraContext, truncated, skippedFiles } = input;
  const title = pr.title || "(no title)";
  const body = (pr.body || "").trim() || "(no description)";
  const head = `${pr.head?.repo?.full_name || pr.head?.label || "head"} @ ${pr.head?.sha?.slice(0, 12) || "?"}`;
  const base = `${pr.base?.ref || "base"}`;

  const extra = String(extraContext || "").trim()
    ? `\n## Additional context from the reviewer\n${String(extraContext).trim()}\n`
    : "";

  const notes = [
    truncated ? "The unified diff was truncated to fit the model context." : null,
    skippedFiles ? `${skippedFiles} generated/binary files were omitted from the diff.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return `${SYSTEM_PROMPT}

## Pull request
- Title: ${title}
- Author: ${pr.user?.login || "unknown"}
- ${pr.html_url || ""}
- Base: ${base}
- Head: ${head}
- +${pr.additions ?? "?"} / -${pr.deletions ?? "?"} across ${pr.changed_files ?? "?"} files
${notes ? `- Notes: ${notes}` : ""}

## Description
${body}
${extra}
## Changed files
${filesSummary || "(file list unavailable)"}

## Diff
${diff || "(empty diff)"}
`;
}

export { SYSTEM_PROMPT };