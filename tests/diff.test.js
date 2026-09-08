import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldSkipFile, filterUnifiedDiff, truncateDiff, summarizeFiles } from "../lib/diff.js";

describe("shouldSkipFile", () => {
  it("skips lockfiles and build artifacts", () => {
    assert.equal(shouldSkipFile("package-lock.json"), true);
    assert.equal(shouldSkipFile("app/dist/bundle.js"), true);
    assert.equal(shouldSkipFile("photo.png"), true);
  });

  it("keeps source files", () => {
    assert.equal(shouldSkipFile("src/app.js"), false);
    assert.equal(shouldSkipFile("README.md"), false);
  });
});

describe("filterUnifiedDiff", () => {
  it("drops skipped paths and keeps source diffs", () => {
    const diff = [
      "diff --git a/src/app.js b/src/app.js",
      "--- a/src/app.js",
      "+++ b/src/app.js",
      "@@ -1 +1 @@",
      "-old",
      "+new",
      "diff --git a/package-lock.json b/package-lock.json",
      "--- a/package-lock.json",
      "+++ b/package-lock.json",
      "@@ -1 +1 @@",
      "-a",
      "+b",
    ].join("\n");

    const filtered = filterUnifiedDiff(diff);
    assert.match(filtered, /src\/app\.js/);
    assert.doesNotMatch(filtered, /package-lock/);
  });
});

describe("truncateDiff", () => {
  it("does not truncate short diffs", () => {
    const result = truncateDiff("hello", 100);
    assert.equal(result.truncated, false);
    assert.equal(result.text, "hello");
  });

  it("marks long diffs as truncated", () => {
    const result = truncateDiff("x".repeat(50), 10);
    assert.equal(result.truncated, true);
    assert.match(result.text, /truncated/);
  });
});

describe("summarizeFiles", () => {
  it("counts skipped files separately", () => {
    const summary = summarizeFiles([
      { filename: "src/a.js", status: "modified", additions: 2, deletions: 1 },
      { filename: "yarn.lock", status: "modified", additions: 40, deletions: 2 },
    ]);
    assert.equal(summary.skipped, 1);
    assert.equal(summary.listed.length, 1);
    assert.equal(summary.additions, 42);
  });
});
