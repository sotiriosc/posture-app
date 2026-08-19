import { describe, expect, it } from "vitest";
import {
  EXPECTED_POST_PRESCRIPTION_WEEK_VALIDATION_FINGERPRINTS,
  POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
  POST_PRESCRIPTION_WEEK_UPDATED_DOCS,
  buildPostPrescriptionWeekValidationReportData,
  renderPostPrescriptionWeekReports,
} from "../helpers/postPrescriptionWeekValidationReport";

describe("post-Prescription Week deterministic reports", () => {
  const data = buildPostPrescriptionWeekValidationReportData();

  it("emits the complete requested report surface", () => {
    const reports = renderPostPrescriptionWeekReports(data);
    expect(Object.keys(reports)).toHaveLength(24);
    expect(POST_PRESCRIPTION_WEEK_UPDATED_DOCS).toHaveLength(17);
    expect(reports["POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_AUDIT.md"])
      .toContain("POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_READY");
    expect(reports["POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md"])
      .toContain("POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION");
    expect(reports["POST_PRESCRIPTION_WEEK_CAGT_ADMISSION_REPORT.json"])
      .not.toContain("effective weekly stimulus");
  });

  it("locks every design fingerprint and preserves every frozen production fingerprint", () => {
    expect(data.fingerprints).toEqual(EXPECTED_POST_PRESCRIPTION_WEEK_VALIDATION_FINGERPRINTS);
    expect(POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS).toMatchObject({
      candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
      weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
      productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
      cagtCore: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
      productionFinalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
    });
  });

  it("records hard-zero causal evidence without production or completion claims", () => {
    expect(data).toMatchObject({
      productionActivationStatus: "NOT_ACTIVATED",
      productionValidatorImplemented: false,
      productionBehaviorChanged: false,
      holdout: {
        scenarioCount: 160,
        genuineCompletePrescribedWeekCount: 128,
        hardZeroFailureCount: 0,
      },
      aggregateIntegrity: {
        expectedEventCount: 860,
        uniqueEventCount: 860,
        duplicateEventCount: 0,
        missingEventCount: 0,
        orphanEventCount: 0,
        stalePrescriptionRevisionCount: 0,
        staleSequenceRevisionCount: 0,
      },
      causalOutcomes: {
        underAdaptationCount: 0,
        overAdaptationCount: 0,
        wrongLayerAcceptedEffectCount: 0,
        acceptedDownstreamRescueCount: 0,
      },
    });
    expect(data.warmupActivation).toMatchObject({
      weeklyPreparationEventCount: 15,
      weeklyActivationEventCount: 15,
      genericWarmupRecurrenceCount: 0,
      genericActivationRecurrenceCount: 0,
      developmentalMiscreditCount: 0,
    });
  });
});
