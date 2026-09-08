const SKIP_NAME =
  /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|composer\.lock|Cargo\.lock|go\.sum|poetry\.lock|uv\.lock|bun\.lockb?)$/i;

const SKIP_PATH =
  /(^|\/)(dist|build|out|coverage|\.next|vendor|node_modules)\//;

const SKIP_EXT =
  /\.(min\.(js|css)|map|png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|eot|mp4|mp3|zip|gz|tgz|wasm|exe|dll|so|dylib|bin)$/i;

/**
 * @param {string} filename
 */
export function shouldSkipFile(filename) {
  const name = String(filename ?? "");
  if (!name) return true;
  return SKIP_NAME.test(name) || SKIP_PATH.test(name) || SKIP_EXT.test(name);
}

/**
 * Drop generated / binary noise from a unified diff.
 * @param {string} diff
 */
export function filterUnifiedDiff(diff) {
  const text = String(diff ?? "");
  if (!text) return "";

  const chunks = text.split(/^diff --git /m);
  const kept = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    const body = chunk.startsWith("diff --git ") ? chunk : `diff --git ${chunk}`;
    const pathMatch = body.match(/^diff --git a\/(.+?) b\/(.+)$/m);
    const path = pathMatch ? pathMatch[2] : "";
    if (path && shouldSkipFile(path)) continue;
    if (/^Binary files /m.test(body) || /^GIT binary patch/m.test(body)) continue;
    kept.push(body.trimEnd());
  }

  return kept.join("\n");
}

/**
 * @param {string} diff
 * @param {number} maxChars
 * @returns {{ text: string, truncated: boolean, originalChars: number }}
 */
export function truncateDiff(diff, maxChars) {
  const text = String(diff ?? "");
  const originalChars = text.length;
  if (originalChars <= maxChars) {
    return { text, truncated: false, originalChars };
  }

  const cut = text.slice(0, maxChars);
  const lastHunk = cut.lastIndexOf("\ndiff --git ");
  const sliced = lastHunk > maxChars * 0.6 ? cut.slice(0, lastHunk) : cut;

  return {
    text:
      sliced.trimEnd() +
      `\n\n[diff truncated: ${originalChars} characters originally, kept ${sliced.length}]`,
    truncated: true,
    originalChars,
  };
}

/**
 * @param {Array<{ filename: string, status: string, additions: number, deletions: number, changes: number }>} files
 */
export function summarizeFiles(files, skipFn = shouldSkipFile) {
  const listed = [];
  let skipped = 0;
  let additions = 0;
  let deletions = 0;

  for (const file of files) {
    additions += file.additions || 0;
    deletions += file.deletions || 0;
    if (skipFn(file.filename)) {
      skipped += 1;
      continue;
    }
    listed.push(
      `${file.status.padEnd(8)} +${file.additions}/-${file.deletions}  ${file.filename}`,
    );
  }

  return { listed, skipped, additions, deletions };
}