import { describe, expect, it } from "vitest";
import {
  OUTCOME_SOURCE_CONTROLLED_SCENARIO_NAMES,
  OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST,
  outcomeSourceHoldoutCounts,
} from "../cagt/outcomeSourceCohorts";
import {
  OUTCOME_SOURCE_INVARIANT_METAMORPHICS,
  OUTCOME_SOURCE_MATERIAL_METAMORPHICS,
  OUTCOME_SOURCE_MUTATIONS,
  outcomeSourceActivationGuards,
  runOutcomeSourceControlledScenarios,
  runOutcomeSourceFixedShell,
  runOutcomeSourceHoldout,
  runOutcomeSourceMetamorphicChecks,
  runOutcomeSourceMutationChecks,
} from "../helpers/outcomeSourceDesignLab";

describe("outcome source cohorts, holdout, and semantic attacks", () => {
  it("runs more than 140 controlled scenarios and the 40-history fixed shell", () => {
    expect(OUTCOME_SOURCE_CONTROLLED_SCENARIO_NAMES.length).toBeGreaterThanOrEqual(140);
    expect(runOutcomeSourceControlledScenarios()).toMatchObject({
      scenarioCount: OUTCOME_SOURCE_CONTROLLED_SCENARIO_NAMES.length, failureCount: 0 });
    expect(runOutcomeSourceFixedShell()).toMatchObject({ cohortCount: 40, failureCount: 0 });
  });

  it("locks the required holdout coverage before execution", () => {
    expect(OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST.frozenBeforeExecution).toBe(true);
    expect(outcomeSourceHoldoutCounts()).toEqual({ total: 360, completeReplay: 240, performance: 80,
      response: 60, adherence: 40, recovery: 40, safetyClinician: 25, equipmentEnvironment: 25,
      externalLoad: 20, correction: 50, authorizationPrivacy: 40, application: 35,
      exerciseIdentities: 45, doseModes: 7, sections: 5, actionClasses: 14 });
    expect(runOutcomeSourceHoldout()).toMatchObject({ total: 360, failureCount: 0,
      manifestFingerprint: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST.fingerprint });
  });

  it("rejects all 47 semantic mutations and proves invariant/material metamorphics", () => {
    expect(OUTCOME_SOURCE_MUTATIONS).toHaveLength(47);
    expect(runOutcomeSourceMutationChecks()).toMatchObject({ mutationCount: 47, acceptedMutationCount: 0 });
    expect(OUTCOME_SOURCE_INVARIANT_METAMORPHICS).toHaveLength(16);
    expect(OUTCOME_SOURCE_MATERIAL_METAMORPHICS).toHaveLength(15);
    expect(runOutcomeSourceMetamorphicChecks()).toMatchObject({ invariantCaseCount: 16,
      materialResponseCaseCount: 15, failureCount: 0 });
  });

  it("proves every runtime activation and mutation count remains zero", () => {
    expect(outcomeSourceActivationGuards()).toMatchObject({ failureCount: 0,
      livePerformanceAdapterCount: 0, liveResponseAdapterCount: 0, liveAdherenceAdapterCount: 0,
      liveRecoveryAdapterCount: 0, liveClinicianAdapterCount: 0, liveEquipmentAdapterCount: 0,
      liveExternalLoadAdapterCount: 0, databaseMigrationCount: 0, persistenceWriteCount: 0,
      directiveApplicationCount: 0, candidateComposerRerunCount: 0, prescriptionMutationCount: 0,
      weekMutationCount: 0, phaseMutationCount: 0, result: "OUTCOME_SOURCE_FOUNDATION_NOT_ACTIVATED" });
  });
});
