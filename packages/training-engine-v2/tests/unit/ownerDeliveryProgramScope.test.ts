import { describe, expect, it } from "vitest";
import {
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  PRODUCTION_WEEK_POLICY_V2,
  buildOwnerEnrollmentRevision,
  buildOwnerEquipmentCapabilities,
  buildOwnerGenerationCommand,
  buildOwnerGetStrongerWeeklyPriorities,
  buildOwnerProfileRevision,
  buildOwnerProgramPreview,
  composeSupportedPurposeWeekV1_1,
  evaluateOwnerProgramSemanticCompleteness,
  planSupportedPurposeWeeklyIntentV1_1,
  resolveOwnerExerciseDoseBlocks,
  runControlledOwnerProductionPipeline,
  type OwnerGetStrongerProfileRevision,
  type OwnerAvailableTrainingDays,
  type OwnerWeekTopologyEvidence,
  type OwnerPipelineStageArtifact,
  type ProductionWeekAllocationPlan,
  type ProductionWeeklyIntentPlanningResult,
  type AssessmentState,
} from "../../src";

const NOW = "2026-08-17T20:00:00.000Z";

function fixture(input: {
  readonly id?: string;
  readonly days?: OwnerAvailableTrainingDays;
  readonly minutes?: number | null;
  readonly environment?: "home" | "commercial_gym" | "mixed";
  readonly capabilityIds?: readonly string[];
  readonly experience?: "beginner" | "intermediate" | "advanced";
  readonly painRegions?: readonly string[];
  readonly familiarity?: OwnerGetStrongerProfileRevision["familiarity"];
  readonly continuityReferences?: readonly string[];
  readonly assessment?: AssessmentState;
} = {}) {
  const days = input.days ?? 2;
  const minutes = input.minutes === undefined ? 90 : input.minutes;
  const userId = `owner-scope-${input.id ?? "default"}`;
  const enrollment = buildOwnerEnrollmentRevision({ userId, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: "preview_only", explicitConsent: true,
    acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["frozen-owner-scope-fixture"] },
    createdAt: NOW });
  const profile = buildOwnerProfileRevision({ userId, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: days,
    sessionOpportunities: Array.from({ length: days }, (_, index) => ({
      opportunityId: `owner-opportunity-${index + 1}`, order: index + 1, minutes,
    })),
    sessionMinutes: minutes === null ? { status: "explicit_unknown", minutes: null } :
      { status: "known", minutes },
    equipmentCapabilitySnapshot: { environment: input.environment ?? "commercial_gym",
      capabilityIds: input.capabilityIds ?? ["commercial_gym", "dumbbells", "adjustable_bench"],
      confirmed: true, sourceRevision: "owner-equipment:frozen-live-equivalent" },
    coarseExperience: input.experience ?? "advanced", familiarity: input.familiarity ?? [],
    painContext: { regionIds: input.painRegions ?? [], limitationIds: [], confirmed: true,
      diagnosticClaimCount: 0 },
    assessmentReferences: input.assessment?.signals.map((signal) =>
      `assessment:observation:${signal.provenance?.sourceObservationId ?? signal.id}`) ?? [],
    trainingSafety: "clear",
    continuityReferences: input.continuityReferences ?? [], evaluationTime: NOW,
    provenance: { source: "owner_confirmation", sourceRefs: ["frozen-owner-scope-fixture"] },
    reviewState: "confirmed", createdAt: NOW });
  const command = buildOwnerGenerationCommand({ userId, enrollmentRevisionId: enrollment.revisionId,
    profileRevisionId: profile.revisionId, sourceProductSnapshotId: "product-snapshot:frozen",
    sourceProductRevisionId: "product-revision:frozen", activeLegacyProgramRevisionId: "legacy-program:frozen",
    engineVersion: "training-engine-v2@owner-scope-test",
    policyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
    evaluationTime: NOW, requestedAt: NOW });
  const assessmentHandoff = input.assessment ? {
    assessment: input.assessment, sourceProductRevisionId: command.sourceProductRevisionId,
    confirmedAssessmentReferences: profile.assessmentReferences,
    mappingTraceRefs: input.assessment.signals.flatMap((signal) => signal.provenance?.evidenceRefs ?? []),
    unresolvedConfirmedReferences: [], mappingStatus: "mapped" as const, opaqueTextConsumed: false as const,
    diagnosticInferenceCount: 0 as const,
  } : undefined;
  return { profile, command, result: runControlledOwnerProductionPipeline({ command, profile,
    proposedProductFacts: [], ...(assessmentHandoff ? { assessmentHandoff } : {}) }) };
}

function assessmentSignal(input: { readonly id: string; readonly region: "shoulder" | "hip" | "lumbar_spine";
  readonly movementRole: "scapular_control" | "single_leg" | "anti_extension_core" }) {
  return Object.freeze({ id: `product-assessment:${input.id}`, type: "control_finding" as const,
    source: "photo_assessment" as const, confidence: "high" as const, priority: "primary" as const,
    region: input.region, movementRole: input.movementRole,
    description: `Structured ${input.id} control observation.`,
    provenance: Object.freeze({ sourceSystem: "product_assessment_report" as const,
      sourceObservationId: input.id, sourceRevision: "product-revision:frozen",
      mappingRuleId: `product-assessment-report-v1:${input.id}`,
      evidenceRefs: Object.freeze([`product-revision:frozen:observation:${input.id}`]),
      opaqueTextConsumed: false as const }) });
}

function stage<T>(stages: readonly OwnerPipelineStageArtifact[], name: OwnerPipelineStageArtifact["stage"]): T {
  return stages.find((entry) => entry.stage === name)!.payload as T;
}

describe("controlled owner Get stronger program scope and projection truth", () => {
  it("freezes the live-equivalent whole-person trace without filling availability", () => {
    const { result } = fixture({ id: "live-equivalent", days: 5 });

    expect(result.status, JSON.stringify(result.unresolvedFacts)).toBe("complete");
    expect(result.approvalAllowed).toBe(false);
    expect(result.unresolvedFacts.some((fact) =>
      fact.startsWith("OWNER_CALCULATED_SESSION_DURATION_INDETERMINATE:"))).toBe(true);
    const intentResult = stage<ProductionWeeklyIntentPlanningResult>(result.stages, "week_intent");
    const intent = intentResult.weeklyIntent!;
    expect(intent.objectives.map((objective) => [...objective.target.targetMovementRoles].sort())).toEqual([
      ["single_leg", "squat"], ["hinge"], ["horizontal_push"], ["horizontal_pull"],
    ]);
    const week = stage<{ readonly weekPlan: ProductionWeekAllocationPlan;
      readonly topologyEvidence: OwnerWeekTopologyEvidence }>(result.stages, "week_allocation");
    expect(week.topologyEvidence).toMatchObject({ availableOpportunityCount: 5,
      occupiedSessionCount: 4, responsibilityCountsBySession: [2, 2, 2, 2] });
    expect(week.topologyEvidence.unusedOpportunityIds).toHaveLength(1);
    for (const objective of intent.objectives) {
      expect(week.weekPlan.reservations.filter((reservation) => reservation.allocatedObjectives.some((entry) =>
        entry.weeklyObjectiveId === objective.objectiveId))).toHaveLength(2);
    }

    expect(result.projection?.sessions).toHaveLength(4);
    const exerciseIds = result.projection!.sessions.map((session) =>
      session.exerciseAssignments.map((assignment) => assignment.exerciseId).sort());
    expect(exerciseIds[0]).toEqual(["dumbbell-romanian-deadlift", "goblet-squat"]);
    expect(exerciseIds[1]).toEqual(["chest-supported-dumbbell-row", "dumbbell-bench-press"]);
    expect(exerciseIds[2]).toEqual(exerciseIds[0]);
    expect(exerciseIds[3]).toEqual(exerciseIds[1]);
    expect(result.projection!.sessions.every((session) =>
      session.practiceModes.join("|") === "full|lighter|recovery")).toBe(true);
    expect(result.projection!.sessions.every((session) =>
      session.availableMinutes === 90 && session.calculatedDuration?.noInventedTime)).toBe(true);
  });

  it("preserves every ordered Prescription block as readable, calibration-honest display truth", () => {
    const { profile, command, result } = fixture({ id: "projection" });
    const assignments = result.projection!.sessions.flatMap((session) => session.exerciseAssignments);

    expect(assignments.every((assignment) => assignment.doseBlocks?.length === 2)).toBe(true);
    for (const assignment of assignments) {
      expect(assignment.doseBlocks?.map((block) => block.purpose)).toEqual([
        "preparatory_acclimation", "developmental_work",
      ]);
      expect(assignment.doseBlocks?.every((block) => block.calibrationRequired)).toBe(true);
      for (const block of assignment.doseBlocks ?? []) {
        expect([block.volume, block.target, block.rest, block.effort, block.tempo, block.load].join(" "))
          .not.toMatch(/[{}"]|\bkind\b/);
      }
    }
    const floorEquivalent = assignments.find((assignment) => assignment.exerciseId === "goblet-squat")!;
    expect(floorEquivalent.doseBlocks).toMatchObject([
      { volume: "1 set", target: "4-8 reps", rest: "60-180 seconds before strength work" },
      { volume: "2 sets", target: "3-6 reps", rest: "120-240 seconds between strength sets",
        effort: "2-4 reps in reserve" },
    ]);

    const preview = buildOwnerProgramPreview({ userId: profile.userId,
      generationCommandId: command.commandId, profileId: profile.profileId,
      profileRevisionId: profile.revisionId, sourceProductSnapshotId: command.sourceProductSnapshotId,
      sourceProductRevisionId: command.sourceProductRevisionId,
      activeLegacyProgramRevisionId: command.activeLegacyProgramRevisionId,
      engineVersion: command.engineVersion, policyVersions: command.policyVersions,
      completeProgramSnapshot: result.stages, productProjection: result.projection!, unresolvedFacts: [],
      readinessStatus: "ready_for_approval", safetyState: "clear", createdAt: NOW });
    const legacyAssignment = { ...preview.productProjection.sessions[0]!.exerciseAssignments[0]!,
      doseBlocks: undefined };
    expect(resolveOwnerExerciseDoseBlocks(preview, legacyAssignment)).toHaveLength(2);
  });

  it("maps only explicitly confirmed equipment capabilities", () => {
    const exact = buildOwnerEquipmentCapabilities(fixture({ id: "equipment" }).profile);
    expect(exact).toMatchObject({ environment: "commercial_gym",
      trainingSpace: { stableLoadedStandingSpace: false, loadedGait: { available: false } },
      bodyweight: { floorSpace: false, pullUpBar: false },
      bench: { types: ["adjustable"], stable: true },
      dumbbells: { available: true, pairAvailable: true },
      cables: { available: false, availableHeights: [] },
      bands: { types: [], anchors: [] }, machines: { availableMachineIds: [] } });

    const genericGym = buildOwnerEquipmentCapabilities(fixture({ id: "generic-gym",
      capabilityIds: ["commercial_gym", "selectorized_machines", "bands", "cables"] }).profile);
    expect(genericGym.machines.availableMachineIds).toEqual([]);
    expect(genericGym.bands).toEqual({ types: [], anchors: [] });
    expect(genericGym.cables).toMatchObject({ available: true, adjustableHeight: false,
      availableHeights: [] });
    expect(genericGym.bodyweight.wallAvailable).toBe(false);
    const wall = buildOwnerEquipmentCapabilities(fixture({ id: "exact-wall",
      capabilityIds: ["commercial_gym", "wall"] }).profile);
    expect(wall.bodyweight.wallAvailable).toBe(true);
    expect(wall.supportSurfaces).toEqual(["wall"]);
  });

  it("uses confirmed assessment facts for causal shared preparation without manufacturing defaults", () => {
    const noAssessment = fixture({ id: "no-assessment" }).result;
    expect(noAssessment.pipelineFingerprint).toMatch(/^[a-f0-9]{16}$/);
    expect(noAssessment.projection!.sessions.flatMap((session) => session.exerciseAssignments)
      .filter((assignment) => assignment.section === "warmup" || assignment.section === "activation")).toEqual([]);

    const upper = fixture({ id: "upper-preparation",
      capabilityIds: ["commercial_gym", "bodyweight", "wall", "stable_loaded_standing_space",
        "dumbbells", "adjustable_bench"],
      assessment: { signals: [assessmentSignal({ id: "pose-shoulder-asymmetry", region: "shoulder",
        movementRole: "scapular_control" })], historicalWeaknesses: [] } }).result;
    expect(upper.status, JSON.stringify(upper.unresolvedFacts)).toBe("complete");
    expect(upper.pipelineFingerprint).toMatch(/^[a-f0-9]{16}$/);
    for (const session of upper.projection!.sessions) {
      const preparation = session.exerciseAssignments.filter((assignment) => assignment.section === "activation");
      expect(preparation).toHaveLength(1);
      expect(preparation[0]).toMatchObject({ exerciseId: "scapular-push-up",
        preparationCategories: ["activation_control"] });
      expect(preparation[0]!.doseBlocks?.some((block) => block.purpose === "developmental_work")).toBe(false);
    }

    const lower = fixture({ id: "lower-preparation",
      capabilityIds: ["commercial_gym", "bodyweight", "stable_loaded_standing_space",
        "dumbbells", "adjustable_bench"],
      assessment: { signals: [
        assessmentSignal({ id: "pose-hip-shift", region: "hip", movementRole: "single_leg" }),
        assessmentSignal({ id: "pose-trunk-bias", region: "lumbar_spine", movementRole: "anti_extension_core" }),
      ], historicalWeaknesses: [] } }).result;
    expect(lower.pipelineFingerprint).toMatch(/^[a-f0-9]{16}$/);
    const lowerPreparation = lower.projection!.sessions.flatMap((session) => session.exerciseAssignments)
      .filter((assignment) => assignment.section === "activation");
    expect(lowerPreparation.map((assignment) => assignment.exerciseId)).toEqual(
      expect.arrayContaining(["dead-bug", "single-leg-balance-rehearsal"]));
    expect(lowerPreparation.every((assignment) => assignment.dependencyIds?.length)).toBe(true);
  });

  it("retains the complete floor-press dose when that realization is the best legal answer", () => {
    const result = fixture({ id: "floor-press", capabilityIds: ["commercial_gym", "bodyweight", "dumbbells"] }).result;
    const floorPress = result.projection!.sessions.flatMap((session) => session.exerciseAssignments)
      .find((assignment) => assignment.exerciseId === "dumbbell-floor-press");

    expect(floorPress?.doseBlocks).toMatchObject([
      { purpose: "preparatory_acclimation", volume: "1 set", target: "4-8 reps",
        rest: "60-180 seconds before strength work", effort: "Quality remains the limiting standard.",
        load: "Choose load to match the effort target", calibrationRequired: true },
      { purpose: "developmental_work", volume: "2 sets", target: "5-10 reps",
        rest: "90-180 seconds between strength sets", effort: "2-3 reps in reserve",
        load: "Choose load to match the effort target", calibrationRequired: true },
    ]);
  });

  it("uses explicit causal completeness invariants and fails each mutation closed", () => {
    const complete = {
      weeklyResponsibilitiesComplete: true, allocationCoverageComplete: true,
      sessionNeedCoverageComplete: true, assignmentCoverageComplete: true,
      developmentalPrescriptionCoverageComplete: true, projectionCoverageComplete: true,
      availabilityNotAutomaticallyFilled: true, exactEquipmentCapabilityPreserved: true,
      supportingWorkCarriesNoDevelopmentalCredit: true, durationProjectionTruthful: true,
      topologyQualitySatisfied: true,
    } as const;
    expect(evaluateOwnerProgramSemanticCompleteness(complete)).toMatchObject({ approvalAllowed: true,
      reasonCodes: [] });
    for (const key of Object.keys(complete) as Array<keyof typeof complete>) {
      const result = evaluateOwnerProgramSemanticCompleteness({ ...complete, [key]: false });
      expect(result.approvalAllowed, key).toBe(false);
      expect(result.reasonCodes, key).toHaveLength(1);
    }
  });

  it("keeps distributed Week composition as the unchanged default", () => {
    const profile = fixture({ id: "week-composer-default" }).profile;
    const canonicalPriorities = buildOwnerGetStrongerWeeklyPriorities(profile);
    const intent = planSupportedPurposeWeeklyIntentV1_1({ policy: PRODUCTION_WEEK_POLICY_V2,
      intentId: "legacy-week-intent", athleteId: profile.userId, outcomeGoal: "strength",
      priorities: canonicalPriorities.map((priority) => ({ ...priority,
        localPrescriptionPurpose: "strength_development" as const,
        purposeAuthority: "primary_local_purpose" as const,
        sourceEvidenceRefs: priority.sourceEvidence.flatMap((entry) => entry.evidenceRefs) })),
      evaluationTime: NOW });
    const opportunities = Array.from({ length: 5 }, (_, index) => ({
      opportunityId: `default-opportunity-${index + 1}`,
      structuralCapacity: "expanded" as const,
    }));
    const implicitDefault = composeSupportedPurposeWeekV1_1({ intent, opportunities });
    const explicitDefault = composeSupportedPurposeWeekV1_1({ intent, opportunities,
      responsibilityPacking: "distributed_across_opportunities" });
    const ownerPacked = composeSupportedPurposeWeekV1_1({ intent, opportunities,
      responsibilityPacking: "coherent_shared_sessions" });

    expect(implicitDefault).toEqual(explicitDefault);
    expect(new Set(implicitDefault.reservations.map((entry) => entry.opportunityId)).size).toBe(5);
    expect(new Set(ownerPacked.reservations.map((entry) => entry.opportunityId)).size).toBe(2);
    expect(ownerPacked.opportunities).toEqual(opportunities);
  });

  it("retains deterministic boundaries across availability, duration, experience, environment, and unknowns", () => {
    for (const days of [2, 3, 4] as const) {
      const result = fixture({ id: `days-${days}`, days }).result;
      expect(result.status, `days=${days}:${result.unresolvedFacts.join(",")}`).toBe("complete");
      expect(result.projection?.sessions).toHaveLength(Math.min(days, 4));
    }
    for (const minutes of [15, 30, 45, 90, 180]) {
      expect(fixture({ id: `minutes-${minutes}`, minutes }).result.status).toBe("complete");
    }
    for (const experience of ["beginner", "intermediate", "advanced"] as const) {
      expect(fixture({ id: `experience-${experience}`, experience }).result.status).toBe("complete");
    }
    for (const environment of ["home", "mixed", "commercial_gym"] as const) {
      const capabilityIds = environment === "commercial_gym" ?
        ["commercial_gym", "dumbbells", "adjustable_bench"] : ["dumbbells", "adjustable_bench"];
      expect(fixture({ id: `environment-${environment}`, environment, capabilityIds }).result.status).toBe("complete");
    }
    const unknown = fixture({ id: "unknown-duration", minutes: null }).result;
    expect(unknown).toMatchObject({ status: "complete", approvalAllowed: false });
    expect(unknown.unresolvedFacts).toContain("OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN");
  });

  it("fails restricted equipment closed and keeps canonical pain and opaque history non-authoritative", () => {
    const restricted = fixture({ id: "bodyweight-only", capabilityIds: ["bodyweight"] }).result;
    expect(restricted.status).toBe("blocked");
    expect(restricted.approvalAllowed).toBe(false);

    const painResults = [["shoulder"], ["knee"], ["lower-back"]].map((painRegions) =>
      fixture({ id: `pain-${painRegions[0]}`, painRegions }).result);
    expect(painResults.map((result) => result.status)).toEqual(["blocked", "blocked", "complete"]);
    expect(painResults.map((result) => result.pipelineFingerprint)
      .every((fingerprint) => /^[a-f0-9]{16}$/.test(fingerprint))).toBe(true);
    expect(painResults.every((result) => result.approvalAllowed === false)).toBe(true);

    const familiar = fixture({ id: "familiar", familiarity: [{ exerciseId: "dumbbell-bench-press",
      realizationId: null, status: "known" }], continuityReferences: ["history:opaque-owner-reference"] });
    const repeated = familiar.result.projection!.sessions.map((session) =>
      session.exerciseAssignments.map((assignment) => assignment.exerciseId).sort());
    expect(repeated[1]).toEqual(repeated[0]);
    expect(familiar.profile.continuityReferences).toEqual(["history:opaque-owner-reference"]);
  });
});
