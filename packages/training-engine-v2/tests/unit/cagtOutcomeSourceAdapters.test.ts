import { describe, expect, it } from "vitest";
import {
  ADHERENCE_SOURCE_ADAPTER_CONTRACT,
  CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT,
  EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT,
  EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT,
  RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT,
  TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT,
  validateNormalizedOutcomeSourceRecord,
} from "../../src/outcomeSources/designContracts";
import {
  ADAPTATION_APPLICATION_STATES,
  ADAPTATION_PERSISTENCE_ENTITY_TYPES,
  evaluateAdaptationApplicationPreconditions,
  routeAdaptationApplicationOwner,
} from "../../src/adaptationPersistence/designContracts";
import { buildAdaptationApplicationRequest, runAdaptationApplicationHandoffCases,
  satisfiedAdaptationApplicationPreconditions } from "../helpers/adaptationPersistenceDesignLab";
import { buildBaselineOutcomeSourceFixture, buildBaselineOutcomeSourceSnapshot } from
  "../helpers/outcomeSourceDesignLab";

describe("source-specific adapter and application design contracts", () => {
  it("Performance rejects planned-as-actual and preserves block/revision requirements", () => {
    expect(EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT).toMatchObject({ liveAdapter: false,
      plannedValuesMayBecomeActual: false, blockLevelRequired: true,
      preservesPrescriptionAndSequenceRevisions: true });
    const record = buildBaselineOutcomeSourceFixture().record;
    const invalid = { ...record,
      structuredFacts: [{ ...record.structuredFacts[0], independentlyObserved: false }] };
    expect(validateNormalizedOutcomeSourceRecord(invalid)).toContain("PLANNED_VALUE_CANNOT_BECOME_ACTUAL");
  });

  it("Response, recovery, adherence, clinician, and external-load contracts forbid semantic invention", () => {
    expect(TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT).toMatchObject({ diagnoses: false,
      painRegionAloneCreatesIntolerance: false, automaticallyCreatesSafetyBlock: false });
    expect(RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT).toMatchObject({ inferredFromCalendarOrSilence: false,
      universalThreshold: false });
    expect(ADHERENCE_SOURCE_ADAPTER_CONTRACT.oneMissedSessionCreatesRegressionOrDeload).toBe(false);
    expect(CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT).toMatchObject({ structuredRestrictionsOnly: true,
      diagnosisInference: false });
    expect(EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT.receiverState).toBe("EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED");
  });

  it("authorization revocation excludes decision use while retaining an auditable snapshot result", () => {
    const revoked = buildBaselineOutcomeSourceSnapshot({ authorizationState: "revoked" });
    expect(revoked.reasonCodes).toEqual([]);
    expect(revoked.snapshot).toMatchObject({ activeSourceRevisionIds: [],
      excludedRevisions: [{ reasons: ["OUTCOME_SOURCE_DECISION_USE_NOT_AUTHORIZED"] }] });
  });

  it("application handoff routes rightful owners, blocks stale state, and never applies", () => {
    expect(routeAdaptationApplicationOwner("week_reallocation_review")).toEqual({ owner: "week",
      available: false, reasonCode: "APPLICATION_OWNER_UNAVAILABLE" });
    const request = buildAdaptationApplicationRequest("progress_prescription_axis");
    expect(request.applicationOwner).toBe("prescription");
    const stale = evaluateAdaptationApplicationPreconditions({ ...satisfiedAdaptationApplicationPreconditions(),
      currentPrescriptionRevisionMatches: false });
    expect(stale).toMatchObject({ state: "blocked_stale", satisfied: false, silentRebasePerformed: false });
    expect(runAdaptationApplicationHandoffCases()).toMatchObject({ caseCount: 35, appliedStateCount: 0,
      failureCount: 0 });
    expect(ADAPTATION_APPLICATION_STATES).toContain("applied");
    expect(ADAPTATION_PERSISTENCE_ENTITY_TYPES).toHaveLength(20);
  });
});
