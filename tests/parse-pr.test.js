import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePullRequestRef, resolvePullRequest } from "../lib/parse-pr.js";
import * as browserParse from "../public/js/parse-pr.js";

describe("parsePullRequestRef", () => {
  it("parses github.com pull URLs", () => {
    assert.deepEqual(parsePullRequestRef("https://github.com/acme/widgets/pull/42"), {
      owner: "acme",
      repo: "widgets",
      number: 42,
    });
  });

  it("parses URLs with extra path and query", () => {
    assert.deepEqual(
      parsePullRequestRef("https://github.com/acme/widgets/pull/42/files?diff=unified"),
      { owner: "acme", repo: "widgets", number: 42 },
    );
  });

  it("parses owner/repo#number", () => {
    assert.deepEqual(parsePullRequestRef("acme/widgets#99"), {
      owner: "acme",
      repo: "widgets",
      number: 99,
    });
  });

  it("returns null for empty input", () => {
    assert.equal(parsePullRequestRef(""), null);
    assert.equal(parsePullRequestRef("   "), null);
  });
});

describe("resolvePullRequest", () => {
  it("prefers a pasted URL", () => {
    assert.deepEqual(
      resolvePullRequest("other/repo", "1", "https://github.com/acme/widgets/pull/7"),
      { owner: "acme", repo: "widgets", number: 7 },
    );
  });

  it("combines repository and number fields", () => {
    assert.deepEqual(resolvePullRequest("acme/widgets", "12"), {
      owner: "acme",
      repo: "widgets",
      number: 12,
    });
  });

  it("rejects a bare number without a repository", () => {
    assert.equal(resolvePullRequest("", "12"), null);
  });
});

describe("browser parse-pr copy", () => {
  it("matches the server parser", () => {
    const samples = [
      "https://github.com/acme/widgets/pull/42",
      "acme/widgets#99",
      "",
    ];
    for (const sample of samples) {
      assert.deepEqual(browserParse.parsePullRequestRef(sample), parsePullRequestRef(sample));
    }
    assert.deepEqual(
      browserParse.resolvePullRequest("acme/widgets", "12"),
      resolvePullRequest("acme/widgets", "12"),
    );
  });
});
