import { describe, expect, it } from "vitest";
import { assertV1HoldoutManifestFingerprint } from "../cagt/weekPolicyV1Contracts";
import {
  EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT, WEEK_POLICY_V1_HOLDOUT_MANIFEST,
  WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT, WEEK_POLICY_V1_HOLDOUT_SCENARIOS,
} from "../cagt/weekPolicyV1Holdout";
import { LOCKED_HOLDOUT_POLICY_SCENARIOS } from "../cagt/weekPolicyTournamentScenarios";

describe("CAGT Week Policy V1 independent holdout", () => {
  it("locks at least 32 new scenarios before results and excludes the prior holdout", () => {
    const priorIds = new Set(LOCKED_HOLDOUT_POLICY_SCENARIOS.map((entry) => entry.id));
    expect(WEEK_POLICY_V1_HOLDOUT_SCENARIOS.length).toBeGreaterThanOrEqual(32);
    expect(WEEK_POLICY_V1_HOLDOUT_SCENARIOS.every((entry) => entry.locked && !priorIds.has(entry.id))).toBe(true);
    expect(WEEK_POLICY_V1_HOLDOUT_MANIFEST).toEqual(expect.objectContaining({
      frozenBeforeExecution: true, priorHoldoutScenarioIdsExcluded: true,
    }));
    expect(Object.isFrozen(WEEK_POLICY_V1_HOLDOUT_SCENARIOS)).toBe(true);
  });

  it("matches the independently declared fingerprint and rejects a mutated manifest", () => {
    expect(WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT)
      .toBe(EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT);
    expect(() => assertV1HoldoutManifestFingerprint(WEEK_POLICY_V1_HOLDOUT_MANIFEST,
      EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT)).not.toThrow();
    const mutated = { ...WEEK_POLICY_V1_HOLDOUT_MANIFEST,
      scenarios: WEEK_POLICY_V1_HOLDOUT_MANIFEST.scenarios.slice(1) } as typeof WEEK_POLICY_V1_HOLDOUT_MANIFEST;
    expect(() => assertV1HoldoutManifestFingerprint(mutated,
      EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT))
      .toThrow(/WEEK_POLICY_V1_HOLDOUT_FINGERPRINT_MISMATCH/);
  });
});
