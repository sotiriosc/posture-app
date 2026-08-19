import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHUNK_D_COMBINED_FINGERPRINT,
  HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
  buildPostChunkDBoundaryRepairEvidence,
} from "./postChunkDBoundaryRepairEvidence";

const workspaceRoot = resolve(process.cwd().endsWith("packages/engine") ? process.cwd() :
  resolve(process.cwd(), "packages/engine"), "../..");

describe("Post-Chunk D pure/server boundary repair evidence", () => {
  it("proves zero pure-to-server edges without reducing type coverage", () => {
    const evidence = buildPostChunkDBoundaryRepairEvidence(workspaceRoot);
    expect(evidence.importGraphBefore).toHaveLength(5);
    expect(evidence.importGraphAfter).toEqual([]);
    expect(evidence.boundary).toMatchObject({ classification: "PURE_SERVER_DEPENDENCY_DIRECTION_VALID",
      packageAliasViolations: [], typeCoverageFailures: [] });
  });

  it("preserves all 63 reports and frozen Product Shadow fingerprints", () => {
    const evidence = buildPostChunkDBoundaryRepairEvidence(workspaceRoot);
    expect(evidence.reportFileCount).toBe(63);
    expect(evidence.reportEquivalence).toBe("REPORT_CORPUS_BYTE_EQUIVALENT");
    expect(evidence.chunkDCombinedFingerprint).toBe(CHUNK_D_COMBINED_FINGERPRINT);
    expect(evidence.historicalProductShadowFingerprint).toBe(HISTORICAL_PRODUCT_SHADOW_FINGERPRINT);
    expect(Object.values(evidence.activationGuards).every((count) => count === 0)).toBe(true);
  });

  it("rejects all semantic mutations and passes every metamorphic relation", () => {
    const evidence = buildPostChunkDBoundaryRepairEvidence(workspaceRoot);
    expect(evidence.mutations).toMatchObject({ mutationCount: 18, rejectedCount: 18, acceptedCount: 0 });
    expect(evidence.mutations.results.every((entry) => entry.semanticStructureChanged)).toBe(true);
    expect(evidence.metamorphic).toMatchObject({ relationCount: 13, passedCount: 13, failedCount: 0 });
  });
});
