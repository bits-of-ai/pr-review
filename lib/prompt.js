/**
 * Review prompt. This is the file to edit when you want a different review style.
 *
 * - REVIEW_FOCUS / REVIEW_AVOID / VERDICT_RULES: what the model looks for
 * - lib/review-schema.js: JSON shape the model must return
 * - lib/review-parse.js: how that JSON is read back
 * - Notes from the form arrive as `extraContext` and are labeled reviewer notes
 */
import { REVIEW_JSON_EXAMPLE, SEVERITIES, VERDICTS } from "./review-schema.js";

/** Short system message for providers that have a separate system role. */
export const PROVIDER_SYSTEM =
  "You are a senior engineer. Follow the user's instructions exactly, including the JSON-only output requirement.";

/** What to look for. Add or remove lines; they become bullets in the prompt. */
export const REVIEW_FOCUS = [
  "Correctness bugs, race conditions, null/edge cases",
  "Security (injection, authz, secrets, unsafe deserialization, SSRF, XSS)",
  "Breaking API/behavior changes",
  "Data loss, concurrency, and performance traps",
  "Missing tests for risky logic",
];

export const REVIEW_AVOID = [
  "Do not nitpick formatting, import order, or naming unless it hides a real defect.",
  "Do not praise the change at length. Be specific: cite file paths and line numbers from the diff when possible.",
  "If the diff is truncated, say so and only review what you can see.",
];

export const VERDICT_RULES = [
  `Use "${VERDICTS[2]}" if any finding is critical or if a warning would break production.`,
  `Use "${VERDICTS[0]}" only when the diff looks safe to merge with at most nits.`,
  "If there are no issues, return an empty findings array and a brief summary.",
];

export function buildSystemPrompt() {
  const focus = REVIEW_FOCUS.map((line) => `- ${line}`).join("\n");
  const avoid = REVIEW_AVOID.join("\n");
  const verdicts = VERDICT_RULES.map((line) => `- ${line}`).join("\n");

  return `You are a senior software engineer performing a careful pull request review.

Focus on:
${focus}

${avoid}

Return ONLY valid JSON — no markdown fences, no prose before or after — matching:
${REVIEW_JSON_EXAMPLE}

Allowed verdicts: ${VERDICTS.join(", ")}.
Allowed severities: ${SEVERITIES.join(", ")}.
${verdicts}`;
}

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
  const notes = String(extraContext || "").trim();

  const limits = [
    truncated ? "The unified diff was truncated to fit the model context." : null,
    skippedFiles ? `${skippedFiles} generated/binary files were omitted from the diff.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const reviewerNotes = notes
    ? `
## Reviewer notes (highest priority)
The person requesting this review wrote the following. Prefer these over the default focus list when they conflict.

${notes}
`
    : "";

  return `${buildSystemPrompt()}
${reviewerNotes}
## Pull request
- Title: ${title}
- Author: ${pr.user?.login || "unknown"}
- ${pr.html_url || ""}
- Base: ${base}
- Head: ${head}
- +${pr.additions ?? "?"} / -${pr.deletions ?? "?"} across ${pr.changed_files ?? "?"} files
${limits ? `- Notes: ${limits}` : ""}

## Description
${body}

## Changed files
${filesSummary || "(file list unavailable)"}

## Diff
${diff || "(empty diff)"}
`;
}

export const SYSTEM_PROMPT = buildSystemPrompt();
