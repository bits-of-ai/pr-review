import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReviewResponse, reviewToMarkdown } from "../lib/review-parse.js";

describe("parseReviewResponse", () => {
  it("parses raw JSON", () => {
    const review = parseReviewResponse(
      JSON.stringify({
        summary: "Looks risky.",
        verdict: "request_changes",
        findings: [
          {
            severity: "critical",
            file: "auth.js",
            line: 10,
            title: "Open redirect",
            body: "Validate the next URL.",
          },
        ],
      }),
    );
    assert.equal(review.parsed, true);
    assert.equal(review.verdict, "request_changes");
    assert.equal(review.findings[0].file, "auth.js");
  });

  it("extracts JSON from a fenced block", () => {
    const review = parseReviewResponse('```json\n{"summary":"ok","verdict":"approve","findings":[]}\n```');
    assert.equal(review.parsed, true);
    assert.equal(review.verdict, "approve");
    assert.equal(review.findings.length, 0);
  });

  it("falls back when the model returns prose", () => {
    const review = parseReviewResponse("This PR looks fine overall.");
    assert.equal(review.parsed, false);
    assert.equal(review.findings[0].severity, "suggestion");
  });
});

describe("reviewToMarkdown", () => {
  it("renders a readable GitHub comment", () => {
    const md = reviewToMarkdown({
      summary: "One issue.",
      verdict: "comment",
      findings: [
        {
          severity: "warning",
          file: "db.js",
          line: 4,
          title: "Missing index",
          body: "This query will scan the table.",
        },
      ],
    });
    assert.match(md, /\*\*Verdict:\*\* Comment/);
    assert.match(md, /Missing index/);
    assert.match(md, /db\.js:4/);
  });
});
