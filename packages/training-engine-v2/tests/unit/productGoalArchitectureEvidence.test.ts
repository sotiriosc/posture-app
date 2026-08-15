import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH } from
  "../../src/productGoalArchitecture/contracts";
import {
  PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS,
  PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE,
  buildProductGoalArchitectureCagtResult,
  buildProductGoalArchitectureMetamorphicEvidence,
  runProductGoalArchitectureMutations,
  validateProductGoalArchitectureSourceGuards,
} from "../cagt/productGoalArchitectureEvidence";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const ledger = readFileSync(resolve(workspaceRoot, PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH), "utf8");
const b1State = ledger.includes("## Chunk B1 \u2014 Canonical owner-policy contracts") ?
  "completed" as const : "future" as const;

describe("Product goal architecture test-only evidence", () => {
  it("rejects all 31 structural mutations through real validators", () => {
    expect(validateProductGoalArchitectureSourceGuards(
      PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE)).toEqual([]);
    const results = runProductGoalArchitectureMutations(ledger, b1State);
    expect(results).toHaveLength(31);
    expect(new Set(results.map((entry) => entry.id)).size).toBe(31);
    expect(results.every((entry) => entry.result === "REJECTED" && entry.issueCount > 0)).toBe(true);
  });

  it("proves nine invariants and eight material fingerprint responses", () => {
    const evidence = buildProductGoalArchitectureMetamorphicEvidence(ledger, b1State);
    expect(evidence.invariants).toHaveLength(9);
    expect(evidence.materialResponses).toHaveLength(8);
    expect(evidence.invariantFailureCount).toBe(0);
    expect(evidence.materialResponseFailureCount).toBe(0);
  });

  it("keeps all nine CAGT scenarios architecture-only", () => {
    const result = buildProductGoalArchitectureCagtResult();
    expect(PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS).toHaveLength(9);
    expect(result).toMatchObject({
      scenarioCount: 9,
      passedScenarioCount: 9,
      artificialRuntimeDifferenceCount: 0,
      downstreamNumericalRescueCount: 0,
      executableResolverCount: 0,
    });
  });
});
