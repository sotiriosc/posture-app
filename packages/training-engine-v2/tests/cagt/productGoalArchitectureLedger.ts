import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import {
  PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
  PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
} from "../../src/productGoalArchitecture/contracts";

export const PRODUCT_GOAL_ARCHITECTURE_REQUIRED_HEADINGS = Object.freeze([
  "# Owner-Approved Architecture Direction",
  "# Owner-Approved Prescription Resolution Direction",
  "# Completed and Proven",
  "# Future Work",
  "# Explicitly Not Complete Yet",
  "# Architecture Completion Rules",
  "# Final Completion Note",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_LINKED_DOCS = Object.freeze([
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/PACKAGE_EXPORTS.md",
] as const);

export function normalizeProductGoalArchitectureLedger(value: string): string {
  return `${value.replace(/\r\n?/g, "\n").replace(/\n*$/, "")}\n`;
}

export function productGoalArchitectureLedgerFingerprint(value: string): string {
  return createHash("sha256").update(normalizeProductGoalArchitectureLedger(value)).digest("hex");
}

function countExactLine(source: string, line: string): number {
  return source.split("\n").filter((entry) => entry === line).length;
}

export type ProductGoalArchitectureLedgerB1State = "future" | "completed";

export function validateProductGoalArchitectureLedger(
  value: string,
  expectedB1State: ProductGoalArchitectureLedgerB1State,
): readonly string[] {
  const source = normalizeProductGoalArchitectureLedger(value);
  const issues: string[] = [];
  for (const heading of PRODUCT_GOAL_ARCHITECTURE_REQUIRED_HEADINGS) {
    if (countExactLine(source, heading) !== 1) {
      issues.push(`LEDGER_REQUIRED_HEADING_INVALID:${heading}`);
    }
  }
  if (!source.includes("**Current state:** `INCOMPLETE_FUTURE_WORK_REMAINS`")) {
    issues.push("LEDGER_INCOMPLETE_FINAL_STATE_REQUIRED");
  }
  if (/^\*\*Current state:\*\*\s+`COMPLETED`$/m.test(source)) {
    issues.push("LEDGER_FINAL_STATE_PREMATURELY_COMPLETED");
  }
  const requiredChunks = ["B2", "B3", "B4", "C", "D", "E", "F", "G", "H"];
  for (const chunk of requiredChunks) {
    if (!new RegExp(`^## Chunk ${chunk}(?:\\s|\\u2014)`, "m").test(source)) {
      issues.push(`LEDGER_FUTURE_CHUNK_MISSING:${chunk}`);
    }
  }
  if (!/^## Future extension lanes$/m.test(source)) issues.push("LEDGER_FUTURE_EXTENSION_LANES_MISSING");
  const futureB1 = /^## Chunk B1 \u2014 Record canonical owner policy contracts$/m.test(source);
  const completedB1 = /^## Chunk B1 \u2014 Canonical owner-policy contracts$/m.test(source);
  if (expectedB1State === "future" && (!futureB1 || completedB1)) {
    issues.push("LEDGER_B1_FUTURE_STATE_INVALID");
  }
  if (expectedB1State === "completed" && (futureB1 || !completedB1)) {
    issues.push("LEDGER_B1_COMPLETED_STATE_INVALID");
  }
  for (const marker of [
    "G4 purpose-first resolution", "G1 fail-closed unsupported-policy guard",
    "`strength`", "`hypertrophy`", "`pain_aware_return`",
    "one primary outcome goal", "one optional secondary outcome goal",
    "T0", "T2", "body-composition", "nutrition owner",
    "power development", "muscular endurance", "systemic conditioning",
  ]) {
    if (!source.toLowerCase().includes(marker.toLowerCase())) {
      issues.push(`LEDGER_OWNER_ARCHITECTURE_MARKER_MISSING:${marker}`);
    }
  }
  for (const field of ["Completion date:", "Final commit SHA:", "Final Product vocabulary:",
    "Final engine mapping:", "Known limitations:"]) {
    if (!source.includes(field)) issues.push(`LEDGER_FINAL_COMPLETION_TEMPLATE_MISSING:${field}`);
  }
  return Object.freeze([...new Set(issues)].sort());
}

const IGNORED_DIRECTORIES = new Set([".git", ".next", "node_modules", "coverage", "dist"]);

function findNamedFiles(root: string, filename: string, current = root): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(current)) {
    if (IGNORED_DIRECTORIES.has(entry)) continue;
    const path = join(current, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) paths.push(...findNamedFiles(root, filename, path));
    else if (basename(path) === filename) paths.push(relative(root, path).replaceAll("\\", "/"));
  }
  return paths.sort();
}

export function findProductGoalArchitectureLedgers(workspaceRoot: string): readonly string[] {
  return Object.freeze(findNamedFiles(workspaceRoot, basename(PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH)));
}

export interface ProductGoalArchitectureLedgerWorkspaceResult {
  readonly ledgerPaths: readonly string[];
  readonly canonicalPath: string;
  readonly fingerprint: string;
  readonly seedFingerprintMatches: boolean;
  readonly b1State: ProductGoalArchitectureLedgerB1State;
  readonly issues: readonly string[];
}

export function validateProductGoalArchitectureLedgerWorkspace(
  workspaceRoot: string,
  expectedB1State: ProductGoalArchitectureLedgerB1State,
): ProductGoalArchitectureLedgerWorkspaceResult {
  const ledgerPaths = findProductGoalArchitectureLedgers(workspaceRoot);
  const issues: string[] = [];
  if (ledgerPaths.length !== 1) issues.push("LEDGER_EXACTLY_ONE_CANONICAL_COPY_REQUIRED");
  if (ledgerPaths[0] !== PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH) issues.push("LEDGER_CANONICAL_PATH_REQUIRED");
  const canonicalPath = resolve(workspaceRoot, PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH);
  const source = ledgerPaths.includes(PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH) ?
    readFileSync(canonicalPath, "utf8") : "";
  issues.push(...validateProductGoalArchitectureLedger(source, expectedB1State));
  const fingerprint = productGoalArchitectureLedgerFingerprint(source);
  return Object.freeze({
    ledgerPaths,
    canonicalPath: PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
    fingerprint,
    seedFingerprintMatches: expectedB1State === "future" &&
      fingerprint === PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
    b1State: expectedB1State,
    issues: Object.freeze([...new Set(issues)].sort()),
  });
}

export function productGoalArchitectureLinkGraph(workspaceRoot: string): readonly string[] {
  const ledgerFilename = basename(PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH);
  return Object.freeze(PRODUCT_GOAL_ARCHITECTURE_LINKED_DOCS.map((path) => {
    const source = readFileSync(resolve(workspaceRoot, path), "utf8");
    return `${path}:${source.includes(ledgerFilename) ? "linked" : "missing"}`;
  }).sort());
}
