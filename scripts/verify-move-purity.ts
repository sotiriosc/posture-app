/**
 * verify-move-purity.ts
 *
 * For every file in packages/engine/src/ (excluding index.ts, which is new),
 * compare its content against the pre-monorepo tag (where engine lived at src/lib/).
 *
 * "Pure" means: identical after stripping import-specifier lines (those changed
 * from @/lib/* to relative paths in some editors; in our alias approach they are
 * actually unchanged — so any remaining diff is a real content change).
 *
 * For gyms app-shell files, compare apps/gyms/ files against the subtree-add
 * commit (8f26f91) to confirm no modifications were made during Day 2.
 *
 * Output: one line per file — IDENTICAL | JUSTIFIED <reason> | DIVERGED.
 * Required verdict: 100% IDENTICAL or JUSTIFIED. Any bare DIVERGED = failure.
 *
 * Usage: node --import tsx scripts/verify-move-purity.ts
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const ROOT = path.resolve(__dirname, "..");

// Files in packages/engine/src that are genuinely new (no pre-monorepo counterpart).
const ENGINE_NEW_FILES = new Set(["index.ts"]);

// Known justified divergences: engine files that were fixed during transport.
// Each entry: { file, reason } where file is relative to packages/engine/src/.
const JUSTIFIED: Record<string, string> = {
  "authToken.ts":
    "as BufferSource cast added — TypeScript 5.x Uint8Array<ArrayBufferLike> " +
    "vs BufferSource strict-generic fix; no behavior change.",
  "exercises.ts":
    "Three experienceMin: \"advanced\" corrected to \"Advanced\" to match " +
    "ExperienceLevel enum casing; data fix, no behavior change.",
};

function gitShow(ref: string, filePath: string): string | null {
  try {
    return execSync(`git show "${ref}:${filePath}"`, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024, // 64 MB — program.ts is ~34k lines
    });
  } catch {
    return null;
  }
}

function normalizeImports(content: string): string {
  // Normalize import-specifier lines: strip the from "..." portion so that
  // path changes (e.g. @/lib/X → ./X) don't count as divergences.
  // In practice our alias approach preserves @/lib/X unchanged, but we
  // normalise anyway to be robust to future codemods.
  return content
    .split("\n")
    .map((line) => {
      // Match: import ... from "..." or } from "..."
      if (/^\s*(import|}\s*from)\s/.test(line) || /from\s+['"]/.test(line)) {
        return line.replace(/from\s+['"][^'"]+['"]/, 'from "<normalized>"');
      }
      return line;
    })
    .join("\n");
}

interface Result {
  file: string;
  verdict: "IDENTICAL" | "JUSTIFIED" | "DIVERGED" | "NEW";
  reason?: string;
}

const results: Result[] = [];

// ── Engine purity check ────────────────────────────────────────────────────
const engineSrcDir = path.join(ROOT, "packages/engine/src");

function walkDir(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full, baseDir));
    } else if (entry.isFile() && /\.(ts|tsx|js)$/.test(entry.name)) {
      files.push(path.relative(baseDir, full));
    }
  }
  return files;
}

const engineFiles = walkDir(engineSrcDir, engineSrcDir);

for (const relFile of engineFiles.sort()) {
  if (ENGINE_NEW_FILES.has(relFile)) {
    results.push({ file: `packages/engine/src/${relFile}`, verdict: "NEW", reason: "Barrel — introduced in Phase 1 Day 1; no pre-monorepo counterpart." });
    continue;
  }

  // Skip __debug__ — they are developer scripts, not engine business logic,
  // and they existed pre-monorepo at the same path.
  const preMonorepoPath = `src/lib/${relFile}`;
  const preBlobRaw = gitShow("pre-monorepo", preMonorepoPath);

  if (preBlobRaw === null) {
    results.push({ file: `packages/engine/src/${relFile}`, verdict: "DIVERGED", reason: "File not found in pre-monorepo tag at expected path src/lib/" + relFile });
    continue;
  }

  const currentPath = path.join(engineSrcDir, relFile);
  const currentRaw = fs.readFileSync(currentPath, "utf8");

  if (preBlobRaw === currentRaw) {
    results.push({ file: `packages/engine/src/${relFile}`, verdict: "IDENTICAL" });
    continue;
  }

  // Try normalized comparison
  const preNorm = normalizeImports(preBlobRaw);
  const curNorm = normalizeImports(currentRaw);

  if (preNorm === curNorm) {
    results.push({ file: `packages/engine/src/${relFile}`, verdict: "IDENTICAL", reason: "Byte-identical after import-specifier normalization." });
    continue;
  }

  // Check against known justified divergences
  const topLevel = relFile.split("/")[0];
  const justification = JUSTIFIED[relFile] || JUSTIFIED[topLevel];
  if (justification) {
    results.push({ file: `packages/engine/src/${relFile}`, verdict: "JUSTIFIED", reason: justification });
    continue;
  }

  results.push({ file: `packages/engine/src/${relFile}`, verdict: "DIVERGED", reason: "Content differs from pre-monorepo tag and is not listed in JUSTIFIED." });
}

// ── Gyms app-shell purity check ────────────────────────────────────────────
// Compare surviving gyms files against the subtree-add commit (8f26f91).
// Everything under apps/gyms/ that was not deleted in Day 2 should be identical
// to what the subtree brought in (no modifications were made in Day 2).
const SUBTREE_COMMIT = "8f26f91";
const GYMS_INFRA_FILES = new Set([
  "package.json",
  "tsconfig.json",
  "vitest.config.ts",
]);

const gymsDir = path.join(ROOT, "apps/gyms");
const gymsSrcDir = path.join(gymsDir, "src");

function walkGymsDir(dir: string, base: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // Skip build artifacts
    if (entry.name === ".next" || entry.name === "node_modules") continue;
    if (entry.isDirectory()) {
      files.push(...walkGymsDir(full, base));
    } else if (entry.isFile()) {
      files.push(path.relative(base, full));
    }
  }
  return files;
}

const gymsFiles = [
  ...walkGymsDir(gymsSrcDir, gymsDir),
  // Top-level infra files that were replaced during Day 2 workspace scaffold
  ...GYMS_INFRA_FILES,
];

for (const relFile of gymsFiles.sort()) {
  const prefixedPath = `apps/gyms/${relFile}`;

  if (GYMS_INFRA_FILES.has(relFile)) {
    results.push({
      file: prefixedPath,
      verdict: "JUSTIFIED",
      reason: "Workspace scaffold replacement: @praxis/gyms package.json, " +
              "tsconfig (extends tsconfig.base.json + monorepo paths), " +
              "vitest.config.ts (root pinned, alias to engine). " +
              "Infrastructure change, not app-shell business logic.",
    });
    continue;
  }

  const preBlob = gitShow(SUBTREE_COMMIT, prefixedPath);
  if (preBlob === null) {
    // File was added after subtree (shouldn't happen for app-shell files)
    results.push({ file: prefixedPath, verdict: "DIVERGED", reason: "Not found in subtree-add commit — unexpected new file." });
    continue;
  }

  const currentRaw = fs.readFileSync(path.join(ROOT, prefixedPath), "utf8");
  if (preBlob === currentRaw) {
    results.push({ file: prefixedPath, verdict: "IDENTICAL" });
  } else {
    results.push({ file: prefixedPath, verdict: "DIVERGED", reason: "Content differs from subtree-add commit — unexpected modification." });
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
const identical = results.filter((r) => r.verdict === "IDENTICAL");
const justified = results.filter((r) => r.verdict === "JUSTIFIED");
const newFiles = results.filter((r) => r.verdict === "NEW");
const diverged = results.filter((r) => r.verdict === "DIVERGED");

const lines: string[] = [
  "# Phase 1 Move-Purity Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Pre-monorepo tag: \`pre-monorepo\` (${execSync("git rev-parse pre-monorepo", { cwd: ROOT, encoding: "utf8" }).trim()})`,
  `Gyms subtree-add commit: \`${SUBTREE_COMMIT}\``,
  "",
  "## Summary",
  "",
  `| Verdict | Count |`,
  `|---------|-------|`,
  `| IDENTICAL | ${identical.length} |`,
  `| JUSTIFIED | ${justified.length} |`,
  `| NEW (no pre-monorepo counterpart) | ${newFiles.length} |`,
  `| DIVERGED (failure) | ${diverged.length} |`,
  "",
  diverged.length === 0
    ? "**Verdict: PASS — 100% identical-or-justified. No unexplained divergences.**"
    : `**Verdict: FAIL — ${diverged.length} unexplained divergence(s). See below.**`,
  "",
];

if (diverged.length > 0) {
  lines.push("## ❌ Unexplained divergences (must be resolved before merge)", "");
  for (const r of diverged) {
    lines.push(`- \`${r.file}\`: ${r.reason}`);
  }
  lines.push("");
}

if (justified.length > 0) {
  lines.push("## Justified divergences (transport fixes, individually reviewed)", "");
  for (const r of justified) {
    lines.push(`- \`${r.file}\`: ${r.reason}`);
  }
  lines.push("");
}

if (newFiles.length > 0) {
  lines.push("## New files (introduced in Phase 1, no pre-monorepo counterpart)", "");
  for (const r of newFiles) {
    lines.push(`- \`${r.file}\`: ${r.reason}`);
  }
  lines.push("");
}

lines.push("## Full file list", "");
lines.push("| File | Verdict |");
lines.push("|------|---------|");
for (const r of results.sort((a, b) => a.file.localeCompare(b.file))) {
  lines.push(`| \`${r.file}\` | ${r.verdict} |`);
}

const reportContent = lines.join("\n") + "\n";

// Write report
const reportPath = path.join(ROOT, "docs/phase1-move-purity.md");
fs.writeFileSync(reportPath, reportContent, "utf8");
console.log(reportContent);

if (diverged.length > 0) {
  process.exit(1);
}
