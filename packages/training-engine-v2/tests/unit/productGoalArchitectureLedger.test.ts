import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCT_GOAL_ARCHITECTURE_REQUIRED_HEADINGS,
  findProductGoalArchitectureLedgers,
  normalizeProductGoalArchitectureLedger,
  productGoalArchitectureLedgerFingerprint,
  productGoalArchitectureLinkGraph,
  validateProductGoalArchitectureLedgerWorkspace,
} from "../cagt/productGoalArchitectureLedger";
import {
  PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
  PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
} from "../../src/productGoalArchitecture/contracts";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const ledger = readFileSync(resolve(workspaceRoot, PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH), "utf8");
const b1State = ledger.includes("## Chunk B1 \u2014 Canonical owner-policy contracts") ?
  "completed" as const : "future" as const;

describe("Product goal architecture canonical ledger", () => {
  it("has exactly one canonical path and the required incomplete structure", () => {
    expect(findProductGoalArchitectureLedgers(workspaceRoot)).toEqual([
      PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
    ]);
    const result = validateProductGoalArchitectureLedgerWorkspace(workspaceRoot, b1State);
    expect(result.issues).toEqual([]);
    expect(PRODUCT_GOAL_ARCHITECTURE_REQUIRED_HEADINGS.every((heading) =>
      normalizeProductGoalArchitectureLedger(ledger).split("\n").filter((line) => line === heading)
        .length === 1)).toBe(true);
    expect(ledger).toContain("**Current state:** `INCOMPLETE_FUTURE_WORK_REMAINS`");
    expect(ledger).not.toMatch(/^\*\*Current state:\*\*\s+`COMPLETED`$/m);
  });

  it("preserves seed provenance before closure and records a distinct final fingerprint after it", () => {
    const fingerprint = productGoalArchitectureLedgerFingerprint(ledger);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    if (b1State === "future") expect(fingerprint).toBe(PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT);
    else expect(fingerprint).not.toBe(PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT);
  });

  it("links every bounded architecture document to the canonical ledger", () => {
    expect(productGoalArchitectureLinkGraph(workspaceRoot).every((entry) =>
      entry.endsWith(":linked"))).toBe(true);
  });
});
