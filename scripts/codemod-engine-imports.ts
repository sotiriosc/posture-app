/**
 * codemod-engine-imports.ts
 *
 * Phase 1 codemod (committed as auditable artifact per bloom-plan § 1.3):
 * Transforms consumer-side imports of `@/lib/*` → `@praxis/engine` barrel.
 *
 * Usage:
 *   node --import tsx scripts/codemod-engine-imports.ts [--dry-run]
 *
 * What it does:
 *   1. Scans apps/consumer/src and apps/consumer/middleware.ts for
 *      `import ... from '@/lib/...'` statements.
 *   2. Groups named imports from the same module where possible.
 *   3. Rewrites each @/lib/* import to `@praxis/engine`.
 *   4. Writes the transformed file back in-place (idempotent).
 *
 * What it does NOT do:
 *   - Modify engine-internal imports (those stay @/lib/* via tsconfig alias).
 *   - Change type-only imports structure (preserves `import type`).
 *   - Alter any logic, only import specifiers.
 */

import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const REPO_ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");
const CONSUMER_ROOTS = [
  path.join(REPO_ROOT, "apps/consumer/src"),
  path.join(REPO_ROOT, "apps/consumer/middleware.ts"),
];

// Matches any `from '@/lib/someModule'` occurrence in a line
// Covers both single-line imports and multi-line continuation `} from '@/lib/...'`
const FROM_LIB_RE = /from\s*['"]@\/lib\/([^'"]+)['"]/;

function transformFile(filePath: string): boolean {
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split("\n");
  let changed = false;

  const out = lines.map((line) => {
    const m = FROM_LIB_RE.exec(line);
    if (!m) return line;
    changed = true;
    return line
      .replace(`'@/lib/${m[1]}'`, `'@praxis/engine'`)
      .replace(`"@/lib/${m[1]}"`, `"@praxis/engine"`);
  });

  if (changed && !DRY_RUN) {
    fs.writeFileSync(filePath, out.join("\n"), "utf8");
  }
  return changed;
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

let changedCount = 0;
let scannedCount = 0;

for (const root of CONSUMER_ROOTS) {
  const files = fs.statSync(root, { throwIfNoEntry: false })?.isFile()
    ? [root]
    : walkDir(root);

  for (const f of files) {
    scannedCount++;
    if (transformFile(f)) {
      changedCount++;
      console.log(`  ${DRY_RUN ? "[dry]" : "[mod]"} ${path.relative(REPO_ROOT, f)}`);
    }
  }
}

console.log(`\nScanned ${scannedCount} files, transformed ${changedCount}.`);
if (DRY_RUN) console.log("(dry-run — no files written)");
