import type { ControlledProductShadowPipelineResult } from "@praxis/training-engine-v2";
import { CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE,
  type ControlledProductShadowClientTrigger, type ControlledProductShadowResourcePolicy,
  type ControlledProductShadowV2PipelinePort } from "../../src/controlledProductShadow";
import type { TrainingSnapshot } from "../../src/trainingStateModel";

export const SHADOW_TIME = "2026-08-15T12:00:00.000-04:00";

export function productShadowSnapshot(): TrainingSnapshot {
  return {
    questionnaire: { goals: "Improve posture", painAreas: ["Lower back"], experience: "Beginner",
      equipment: ["none"], daysPerWeek: 3, trainingIntent: "build" },
    assessment: { signals: [{ id: "assessment-1", confidence: 0.9, region: "trunk", action: "reviewed" }] },
    prefs: { schemaVersion: 1, feedbackByExercise: {} },
    programs: [{ id: "legacy-program-1", userId: "athlete-shadow-1", createdAt: SHADOW_TIME,
      updatedAt: SHADOW_TIME, questionnaireSignature: "questionnaire-signature-1",
      goalTrack: "posture", daysPerWeek: 3, estimatedSessionMinutesRange: { min: 45, max: 60 },
      phaseIndex: 1, weekIndex: 1, cycleIndex: 1, week: [{ dayIndex: 0, title: "Day 1", focusTags: [],
        routine: [{ exerciseId: "dead-bug", section: "main", sets: 2, reps: "8",
          durationSec: null, loadType: "bodyweight" }] }, { dayIndex: 1, title: "Day 2", focusTags: [],
        routine: [{ exerciseId: "push-up", section: "main", sets: 2, reps: "8",
          durationSec: null, loadType: "bodyweight" }] }, { dayIndex: 2, title: "Day 3", focusTags: [],
        routine: [{ exerciseId: "glute-bridge", section: "main", sets: 2, reps: "8",
          durationSec: null, loadType: "bodyweight" }] }] }],
    programProgress: [{ programId: "legacy-program-1", lastCompletedDayIndex: null, nextDayIndex: 0,
      completedDayIndices: [], daysPerWeek: 3, updatedAt: SHADOW_TIME }], sessions: [], exerciseLogs: [],
    meta: { stateUpdatedAt: SHADOW_TIME, programUpdatedAtById: { "legacy-program-1": SHADOW_TIME },
      programProgressUpdatedAtByProgramId: { "legacy-program-1": SHADOW_TIME },
      sessionUpdatedAtById: {}, exerciseLogUpdatedAtById: {} },
  };
}

export function productShadowClientTrigger(overrides: Partial<ControlledProductShadowClientTrigger> = {}):
ControlledProductShadowClientTrigger {
  return { triggerContract: { contractId: "CONTROLLED_PRODUCT_SHADOW_TRIGGER", contractVersion: "1.0.0" },
    triggerKind: "product_program_changed", appSurface: "server_resolved",
    productPatchSemanticFingerprint: "product-patch:fingerprint-1",
    changedEntityCategories: ["program"], changedEntityIds: ["legacy-program-1"],
    anchorProgramId: "legacy-program-1", anchorSessionId: null, anchorLogIds: [],
    clientOperationId: "client-operation-1", clientObservedOperationalTime: SHADOW_TIME,
    provenance: ["fixture:successful-product-sync"], ...overrides };
}

export const PRODUCT_SHADOW_RESOURCE_POLICY: ControlledProductShadowResourcePolicy = Object.freeze({
  acceptedTriggersPerWindow: 20, windowSeconds: 3600, concurrentRunsPerAthlete: 1, maximumPendingRuns: 3,
  maximumProductSnapshotBytes: 2_000_000, maximumSessions: 500, maximumLogs: 5_000,
  maximumSearchUnits: 50_000, wallClockBudgetMs: 8_000,
});

export const PRODUCT_SHADOW_DATA_POLICY = Object.freeze({
  reference: CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE,
  rawProductSnapshotPersistence: false as const, emailPersistence: false as const, notesPersistence: false as const,
  photoPersistence: false as const, authTokenPersistence: false as const, structuredReferencesOnly: true as const,
});

export const COMPLETE_PRODUCT_SHADOW_PIPELINE: ControlledProductShadowV2PipelinePort = Object.freeze({
  evaluate: async (): Promise<ControlledProductShadowPipelineResult> => Object.freeze({
    status: "shadow_orchestration_complete_unapplied", runType: "combined_product_shadow",
    artifactReferences: Object.freeze([{ artifactType: "phase_program_snapshot", artifactId: "v2-program-1",
      artifactRevisionId: "v2-program-revision-1", contractId: "PRODUCTION_PHASE_PROGRAM_SNAPSHOT",
      contractVersion: "1.0.0", counterfactualOnly: true as const }]),
    unresolvedRequirements: Object.freeze(["PRODUCT_SESSION_AVAILABILITY_REQUIRED"]), gate13Status: "passed",
    phaseStatus: "remain", longitudinalStatus: "complete_unapplied",
    orchestrationStatus: "complete_unapplied", productMutationApplied: false, applicationApplied: false }),
});
