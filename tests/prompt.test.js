import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReviewPrompt } from "../lib/prompt.js";

describe("buildReviewPrompt", () => {
  it("includes PR metadata, diff, and extra context", () => {
    const prompt = buildReviewPrompt({
      pr: {
        title: "Fix login",
        body: "Handle empty passwords.",
        html_url: "https://github.com/acme/app/pull/3",
        user: { login: "ada" },
        additions: 4,
        deletions: 1,
        changed_files: 1,
        head: { sha: "abcdef123456", label: "acme:fix" },
        base: { ref: "main" },
      },
      filesSummary: "modified +4/-1  src/login.js",
      diff: "diff --git a/src/login.js b/src/login.js\n+return false",
      extraContext: "Pay attention to session cookies.",
      truncated: true,
      skippedFiles: 2,
    });

    assert.match(prompt, /Fix login/);
    assert.match(prompt, /Pay attention to session cookies/);
    assert.match(prompt, /truncated/);
    assert.match(prompt, /src\/login\.js/);
    assert.match(prompt, /request_changes/);
  });
});
