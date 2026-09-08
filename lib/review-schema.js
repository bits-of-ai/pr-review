/**
 * Shared review output contract.
 *
 * Change severities or verdicts here, then the prompt (`lib/prompt.js`)
 * and parser (`lib/review-parse.js`) stay aligned.
 */

export const SEVERITIES = ["critical", "warning", "suggestion", "nit", "praise"];

export const VERDICTS = ["approve", "comment", "request_changes"];

export const REVIEW_JSON_EXAMPLE = `{
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
}`;
