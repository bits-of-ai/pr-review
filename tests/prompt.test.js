import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReviewPrompt, REVIEW_FOCUS } from "../lib/prompt.js";
import { SEVERITIES, VERDICTS } from "../lib/review-schema.js";

describe("buildReviewPrompt", () => {
  const sample = {
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
  };

  it("includes PR metadata, diff, and extra context", () => {
    const prompt = buildReviewPrompt(sample);

    assert.match(prompt, /Fix login/);
    assert.match(prompt, /Pay attention to session cookies/);
    assert.match(prompt, /Reviewer notes \(highest priority\)/);
    assert.match(prompt, /truncated/);
    assert.match(prompt, /src\/login\.js/);
    assert.match(prompt, /request_changes/);
  });

  it("omits reviewer notes when extra context is empty", () => {
    const prompt = buildReviewPrompt({ ...sample, extraContext: "  " });
    assert.doesNotMatch(prompt, /Reviewer notes/);
  });

  it("lists every shared verdict and severity", () => {
    const prompt = buildReviewPrompt({ ...sample, extraContext: "" });
    for (const value of [...SEVERITIES, ...VERDICTS]) {
      assert.match(prompt, new RegExp(value));
    }
    assert.ok(REVIEW_FOCUS.length > 0);
  });
});
