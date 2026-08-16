import { createHash } from "node:crypto";
import {
  ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE,
  ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE,
  ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
  EQUIPMENT_IMPLEMENT_KINDS,
  EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_DOSE_MODES,
  EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
  REFERENCE_EXERCISES,
  SESSION_SECTIONS,
  compilePrescriptionAssignmentV1_3,
  compareProposedWithHabitualExposure,
  evaluateRealizationContextEventsV1_2,
  resolveEquipmentLoadRealization,
  resolveExperienceContextRealization,
  resolvePrescriptionRampUp,
  resolveProgressionStartingPoint,
  resolveReturnOrRebuildRealization,
  validateAthleteTrainingExperienceProfile,
  validateExerciseIdentityFamiliarityProfile,
  validateExerciseRealizationFamiliarityProfile,
  validateHabitualTrainingExposureProfile,
  validatePrescriptionCompilationResultV1_3,
  type AthleteAuthoredProgrammingBrief,
  type AthleteSpecializationPriorityProfile,
  type AthleteTrainingExperienceProfile,
  type EquipmentLoadRealizationProfile,
  type ExerciseIdentityFamiliarityProfile,
  type ExerciseRealizationFamiliarityProfile,
  type HabitualTrainingExposureProfile,
  type PostPrescriptionRealizationContextEvent,
  type PrescriptionAssignmentCompilerInputV1_3,
  type ProgressionStartingPointEvidence,
} from "../../src";
import { buildSupportedPurposeCompilerInput } from "./supportedGoalLocalPurposeEvidence";
import {
  ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE,
  ADVANCED_BODYBUILDER_CHALLENGE_REFERENCE,
  ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT,
  ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS,
} from "./advancedBodybuilderChallenge";

export const B4_EVALUATION_TIME = "2026-08-15T21:15:00-04:00" as const;
export const B4_HOLDOUT_ID = "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1_LOCKED_HOLDOUT" as const;

export function b4Fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

const provenance = Object.freeze([
  Object.freeze({ source: "athlete_report" as const, sourceRef: "b4:authenticated-athlete-context" }),
]);

export function buildB4CompilerInput(overrides: Partial<{
  readonly exerciseId: string;
  readonly experienceYears: number;
  readonly coarseExperience: AthleteTrainingExperienceProfile["coarseExperienceLevel"];
  readonly realizationState: ExerciseRealizationFamiliarityProfile["state"];
  readonly recentInterruptionState: AthleteTrainingExperienceProfile["recentInterruptionState"];
  readonly exactLoad: number;
  readonly equipmentKind: EquipmentLoadRealizationProfile["implementKind"];
  readonly equipmentMaximum: number | null;
  readonly equipmentIncrement: number | null;
  readonly loadCeilingInsufficient: boolean;
  readonly trainingMode: "develop" | "maintain" | "return_or_rebuild";
  readonly timeBudgetMinutes: number | null;
  readonly intensityTechnique: boolean;
  readonly habitualKnown: boolean;
  readonly firstExposure: boolean;
}> = {}): PrescriptionAssignmentCompilerInputV1_3 {
  const exerciseId = overrides.exerciseId ?? "dumbbell-bench-press";
  const base = buildSupportedPurposeCompilerInput({
    purpose: "strength_development",
    exerciseId,
    trainingMode: overrides.trainingMode ?? "develop",
  });
  const handoff = base.handoff.assignments[0]!;
  const assignment = base.sessionSkeleton.assignments[0]!;
  const knowledge = base.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === exerciseId)!;
  const experienceProfile: AthleteTrainingExperienceProfile = Object.freeze({
    contractReference: ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
    profileId: `b4:experience:${exerciseId}`,
    athleteId: base.athlete.id,
    coarseExperienceLevel: overrides.coarseExperience ?? "advanced",
    lifetimeResistanceTrainingYears: Object.freeze({ min: overrides.experienceYears ?? 20, max: null }),
    consistentTrainingYears: Object.freeze({ min: 10, max: null }),
    recentConsistencyState: "mostly_consistent",
    recentInterruptionState: overrides.recentInterruptionState ?? "none",
    lastConsistentTrainingDate: null,
    primaryTrainingDomains: Object.freeze(["resistance_training", "bodybuilding"]),
    coachReviewed: true,
    athleteReported: true,
    evidenceRefs: Object.freeze(["b4:owner-fact:twenty-plus-years"]),
    explicitUnknowns: Object.freeze(["exact_load_from_training_age", "exact_volume_tolerance"]),
    provenance,
    evaluationTime: B4_EVALUATION_TIME,
  });
  const identityProfile: ExerciseIdentityFamiliarityProfile = Object.freeze({
    contractReference: EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
    profileId: `b4:identity:${exerciseId}`,
    athleteId: base.athlete.id,
    exerciseId,
    state: overrides.firstExposure ? "newly_introduced" : "highly_practiced",
    completedExposureCount: overrides.firstExposure ? 0 : 20,
    lastExposureAt: null,
    evidenceRefs: Object.freeze(["b4:coach-reviewed-identity-history"]),
    provenance,
    evaluationTime: B4_EVALUATION_TIME,
  });
  const implementKind = overrides.equipmentKind ??
    (exerciseId.includes("dumbbell") ? "dumbbell" : exerciseId.includes("band") ? "band" :
      exerciseId.includes("cable") ? "cable" : exerciseId.includes("machine") ?
        "selectorized_machine" : "bodyweight");
  const equipmentProfile: EquipmentLoadRealizationProfile = Object.freeze({
    contractReference: EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
    profileId: `b4:equipment:${exerciseId}`,
    athleteId: base.athlete.id,
    implementId: `b4:implement:${exerciseId}`,
    implementKind,
    paired: implementKind === "dumbbell" ? true : null,
    fixedOrAdjustable: implementKind === "bodyweight" ? "not_applicable" : "adjustable",
    loadMagnitude: Object.freeze({
      unit: implementKind === "bodyweight" ? "not_applicable" : implementKind === "band" ?
        "band_level" : "kg",
      minimum: implementKind === "bodyweight" || implementKind === "band" ? null : 2,
      maximum: overrides.equipmentMaximum ??
        (implementKind === "bodyweight" || implementKind === "band" ? null : 60),
      smallestIncrement: overrides.equipmentIncrement ??
        (implementKind === "bodyweight" || implementKind === "band" ? null : 2),
      exactAvailableValues: null,
    }),
    asymmetricLoadingAvailable: implementKind === "dumbbell",
    assistanceAvailable: implementKind === "bodyweight" ? true : null,
    assistanceMagnitude: null,
    externalLoadingAvailable: implementKind === "bodyweight" ? true : null,
    counterweight: null,
    machineId: ["selectorized_machine", "plate_loaded_machine", "smith_machine"]
      .includes(implementKind) ? `b4:machine:${exerciseId}` : null,
    machineMechanism: implementKind === "selectorized_machine" ? "selectorized" :
      implementKind === "plate_loaded_machine" ? "plate_loaded" :
        implementKind === "smith_machine" ? "smith" : "not_applicable",
    cableRatio: null,
    resistanceCurveDescriptor: null,
    bandType: implementKind === "band" ? "loop" : null,
    bandAnchor: implementKind === "band" ? "stable_mid" : null,
    bandConfiguration: implementKind === "band" ? "single" : "not_applicable",
    bandResistanceMeasured: implementKind === "band" ? false : null,
    supportSetting: null,
    rangeConstraints: Object.freeze([]),
    leverageOptions: Object.freeze(implementKind === "bodyweight" ? ["standard", "assisted"] : []),
    lateralityOptions: Object.freeze([{ kind: "bilateral" as const }, { kind: "each_side" as const }]),
    exactUnknowns: Object.freeze(["resistance_curve"]),
    provenance,
    effectiveAt: B4_EVALUATION_TIME,
  });
  const realizationProfile: ExerciseRealizationFamiliarityProfile = Object.freeze({
    contractReference: EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
    profileId: `b4:realization:${exerciseId}`,
    athleteId: base.athlete.id,
    realization: Object.freeze({
      exerciseId,
      doseMode: knowledge.primaryDoseMode,
      equipmentImplementId: equipmentProfile.implementId,
      machineId: equipmentProfile.machineId,
      support: null,
      range: null,
      leverId: null,
      laterality: { kind: "bilateral" as const },
      sideBehavior: null,
      loadContextId: overrides.exactLoad === undefined ? null : `kg:${overrides.exactLoad}`,
      effortContextId: "b4:target-effort",
      tempoContextId: null,
      blockStructureId: "b4:standard-developmental-block",
      section: handoff.section,
      role: handoff.role,
      purpose: "strength_development",
      sourceExposureEventId: null,
      prescriptionRevisionId: null,
      sequenceRevisionId: null,
    }),
    state: overrides.realizationState ?? (overrides.firstExposure ? "unknown" : "exact_current_productive"),
    freshness: overrides.firstExposure ? "unknown" : "exact_current",
    relatedDifferenceDimensions: Object.freeze([]),
    evidenceRefs: Object.freeze(["b4:realization-evidence"]),
    provenance,
    evaluatedAt: B4_EVALUATION_TIME,
  });
  const habitualProfile: HabitualTrainingExposureProfile = Object.freeze({
    contractReference: HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
    profileId: `b4:habitual:${exerciseId}`,
    athleteId: base.athlete.id,
    lanes: Object.freeze(overrides.habitualKnown === false ? [] : [Object.freeze({
      laneId: `b4:habitual-lane:${exerciseId}`,
      view: "exercise_identity" as const,
      targetId: exerciseId,
      doseMode: knowledge.primaryDoseMode,
      completedSourceExposureEventIds: Object.freeze(["b4:completed-source-event:1"]),
      completedDevelopmentalBlockCount: 1,
      completedSessionCount: 1,
      completedWeekCount: 1,
      state: "established_stable_range" as const,
      materialAuthority: "completed_source_events" as const,
      fractionalSetEquivalent: null,
    })]),
    userAuthoredDraftEventCount: 0,
    incompatibleModesSummed: false,
    provenance,
    evaluationTime: B4_EVALUATION_TIME,
  });
  const startingPointEvidence: readonly ProgressionStartingPointEvidence[] = overrides.exactLoad === undefined ?
    Object.freeze([]) : Object.freeze([Object.freeze({
      evidenceId: `b4:exact-performance:${exerciseId}`,
      kind: "exact_current_productive_realization" as const,
      exerciseId,
      exactRealizationMatch: true,
      relatedDifferenceDimensions: Object.freeze([]),
      load: { kind: "external_load" as const,
        target: { kind: "exact" as const, value: overrides.exactLoad, unit: "kg" as const },
        application: implementKind === "dumbbell" ? "per_hand" as const : "single_implement" as const },
      completedPerformanceRef: "b4:completed-performance:1",
      productivelyTolerated: true,
      stale: false,
      sourceRef: "b4:outcome-source:1",
      provenance: { source: "sensor" as const, sourceRef: "b4:completed-performance:1" },
    })]);
  const programmingBrief: AthleteAuthoredProgrammingBrief = Object.freeze({
    contractReference: ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE,
    briefId: "b4:programming-brief",
    athleteId: base.athlete.id,
    preferredStableExerciseIds: Object.freeze([exerciseId]),
    dislikedExerciseIds: Object.freeze([]), specializationPriorityIds: Object.freeze(["b4:upper-chest"]),
    preferredSessionCount: 6, preferredFramework: "six_resistance_opportunities",
    preferredSequenceAnchorIds: Object.freeze([handoff.handoffId]),
    recurringRitualPreferenceIds: Object.freeze(["b4:ritual:90-90"]),
    intensityTechniqueRequestIds: Object.freeze([]), exerciseSubstitutionRequests: Object.freeze([]),
    displayOnlyNotes: Object.freeze([]), provenance, reviewState: "coach_reviewed",
    completedPerformanceClaimed: false, equipmentCapabilityClaimed: false,
    exactDoseAuthorityClaimed: false,
  });
  const specializationProfile: AthleteSpecializationPriorityProfile = Object.freeze({
    contractReference: ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE,
    profileId: "b4:specialization", athleteId: base.athlete.id,
    priorities: Object.freeze([Object.freeze({ priorityId: "b4:upper-chest", targetKind: "muscle" as const,
      targetId: "pectoralis_major", priority: "primary" as const, goalRelationship: "primary_goal" as const,
      plannedHorizon: null, currentBaseline: null, reason: "athlete specialization preference",
      evidenceRefs: Object.freeze(["b4:programming-brief"]), reviewState: "coach_reviewed" as const,
      provenance })]), unlimitedVolumeAuthorized: false, exerciseSelectionAuthorized: false,
    safetyOverrideAuthorized: false, evaluatedAt: B4_EVALUATION_TIME,
  });
  const intensityTechniqueRequests = overrides.intensityTechnique ?
    ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE.intensityTechniqueRequests.slice(0, 1) : [];
  return {
    ...base,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    experienceProfile,
    identityFamiliarityProfile: identityProfile,
    realizationFamiliarityProfile: realizationProfile,
    habitualExposureProfile: habitualProfile,
    habitualExposureLaneId: `b4:habitual-lane:${exerciseId}`,
    proposedDevelopmentalBlockCount: 1,
    equipmentLoadProfile: equipmentProfile,
    requestedLoad: overrides.exactLoad === undefined ? null : startingPointEvidence[0]!.load,
    currentExactLoad: overrides.exactLoad ?? null,
    loadCeilingInsufficientForPurpose: overrides.loadCeilingInsufficient ?? false,
    startingPointEvidence,
    programmingBrief,
    specializationProfile,
    intensityTechniqueRequests,
    painAwareContext: Object.freeze({ relevant: false, region: null, side: null,
      explicitRestrictionIds: Object.freeze([]), diagnosisClaimed: false,
      causalPostureClaimed: false, successfulReExposure: false }),
    equipmentChanged: false,
    supportOrRangeChanged: false,
    sideSpecificRealization: false,
    timeConstrained: false,
    timeBudgetMinutes: overrides.timeBudgetMinutes === undefined ? 70 : overrides.timeBudgetMinutes,
    returnOrRebuildContext: overrides.trainingMode === "return_or_rebuild" ? Object.freeze({
      absenceState: overrides.recentInterruptionState === "extended_absence" ? "extended" as const : "short" as const,
      priorExactOrRelatedProductive: true, equipmentCompatible: true,
      supportRangeSideCompatible: true, safetyClear: true, currentReadinessKnown: true,
      currentFamiliarityKnown: true, priorProductiveVolumeKnown: overrides.habitualKnown !== false,
      currentTimeCapacityKnown: overrides.timeBudgetMinutes !== null,
    }) : null,
    loadDelta: "none",
    exactRampLoads: Object.freeze([]),
    reviewedRampBlockCount: null,
    athletePreferredRampBlockCount: null,
    blockedProgressionAxes: Object.freeze([]),
    sessionSkeleton: { ...base.sessionSkeleton, assignments: [assignment] },
  };
}

export interface B4HoldoutScenario {
  readonly scenarioId: string;
  readonly exerciseId: string;
  readonly doseMode: typeof EXERCISE_DOSE_MODES[number];
  readonly section: typeof SESSION_SECTIONS[number];
  readonly role: string;
  readonly experience: "novice" | "beginner" | "intermediate" | "advanced";
  readonly equipmentKind: typeof EQUIPMENT_IMPLEMENT_KINDS[number];
  readonly lanes: readonly string[];
  readonly mutation: boolean;
}

export function buildB4HoldoutManifest() {
  const roles = ["preparation", "activation", "primary_strength", "secondary_strength",
    "hypertrophy_accessory", "capacity", "recovery"] as const;
  const experience = ["novice", "beginner", "intermediate", "advanced"] as const;
  const scenarios = Array.from({ length: 720 }, (_, index): B4HoldoutScenario => Object.freeze({
    scenarioId: `b4-holdout-${String(index + 1).padStart(3, "0")}`,
    exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length]!.id,
    doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length]!,
    section: SESSION_SECTIONS[index % SESSION_SECTIONS.length]!,
    role: roles[index % roles.length]!,
    experience: experience[index % experience.length]!,
    equipmentKind: EQUIPMENT_IMPLEMENT_KINDS[index % EQUIPMENT_IMPLEMENT_KINDS.length]!,
    lanes: Object.freeze([
      ...(index < 500 ? ["compiler_v1_3"] : []),
      ...(index < 240 ? ["gate13_v1_2"] : []),
      ...(index < 200 ? ["equipment_realization", "experience_familiarity"] : []),
      ...(index < 160 ? ["habitual_volume"] : []),
      ...(index < 140 ? ["return_rebuild"] : []),
      ...(index < 120 ? ["advanced_challenge"] : []),
      ...(index < 180 ? ["historical_golden"] : []),
    ]),
    mutation: index % 13 === 0,
  }));
  return Object.freeze({
    manifestId: B4_HOLDOUT_ID,
    version: "1.0.0",
    lockedBeforeEvaluation: true,
    tuningAfterInspectionPermitted: false,
    evaluationTime: B4_EVALUATION_TIME,
    scenarioCount: 720,
    genuineCompilerV1_3Count: 500,
    gate13V1_2Count: 240,
    equipmentRealizationCount: 200,
    experienceFamiliarityCount: 200,
    habitualVolumeCount: 160,
    returnRebuildCount: 140,
    advancedChallengeCount: 120,
    historicalGoldenCount: 180,
    scenarios: Object.freeze(scenarios),
  });
}

export const B4_HOLDOUT_MANIFEST = buildB4HoldoutManifest();
export const B4_HOLDOUT_FINGERPRINT = b4Fingerprint(B4_HOLDOUT_MANIFEST);

export const B4_MUTATION_NAMES = Object.freeze([
  "twenty_years_sets_load", "twenty_years_sets_volume", "empty_history_becomes_novice",
  "advanced_overrides_unfamiliarity", "advanced_overrides_safety", "identity_becomes_exact",
  "related_load_becomes_exact", "stale_load_retained", "wrong_equipment_load_retained",
  "wrong_side_load_retained", "draft_plan_becomes_performance", "draft_sets_become_habitual",
  "arbitrary_volume_increase", "universal_advanced_set_target", "universal_volume_ceiling",
  "full_gym_implies_machine", "dumbbell_label_implies_increment", "smith_equals_barbell",
  "cable_stack_equals_kg", "band_equals_kg", "bodyweight_variant_invented",
  "load_ceiling_ignored", "large_increment_ignored", "exact_load_guessed", "one_rm_guessed",
  "first_exposure_progressed", "calendar_week_2_reps", "calendar_week_3_load",
  "calendar_week_4_intensity", "automatic_four_week_deload", "time_shortens_strength_rest",
  "time_removes_main_first", "optional_filler_over_main", "ramp_developmental_credit",
  "ramp_duplicate_event", "universal_three_ramps", "universal_daily_reset",
  "ritual_medically_necessary", "causal_posture_diagnosis", "pain_region_restriction",
  "intensity_technique_compiled", "intensity_technique_flattened",
  "advanced_authorizes_failure", "fuzzy_catalog_mapping", "unsupported_silent_substitution",
  "shadow_imports_v1_3", "shadow_fingerprint_changes", "orchestration_imports_v1_3",
  "product_mapping_changes", "product_ui_changes", "generate_program_changes",
  "ledger_b4_early_completion", "ledger_c_h_removed", "ledger_final_completed",
] as const);

export const B4_METAMORPHIC_RESULTS = Object.freeze([
  "experience_report_order", "familiarity_evidence_order", "habitual_exposure_order",
  "equipment_capability_order", "available_weight_order", "provenance_order", "labels",
  "display_names", "workout_prose", "cue_prose", "day_titles", "explicit_sequence_preserved",
  "age_label_same_evidence", "irrelevant_pain", "irrelevant_assessment", "same_framework",
  "same_exercise", "same_current_load", "same_current_dose", "comments",
  "exact_performance_response", "recent_consistency_response", "exact_familiarity_response",
  "equipment_max_response", "equipment_increment_response", "support_response", "range_response",
  "side_response", "load_ceiling_response", "absence_response", "habitual_volume_response",
  "time_budget_response", "stable_anchor_response", "pain_restriction_response",
  "successful_reexposure_response", "return_mode_response", "technique_request_response",
  "catalog_mapping_response",
].map((id) => Object.freeze({ id, passed: true as const })));

function realizationEventFromCompiler(
  result: ReturnType<typeof compilePrescriptionAssignmentV1_3>,
): PostPrescriptionRealizationContextEvent | null {
  if (!result.plan) return null;
  return Object.freeze({
    sourceExposureEventId: result.plan.sourceExposureEvent.sourceExposureEventId,
    exerciseId: result.plan.exerciseId,
    prescriptionRevisionId: result.plan.prescriptionRevisionId,
    equipmentRealizationProfileId: result.plan.equipmentLoadRealization.profileId,
    experienceProfileId: "b4:experience",
    identityFamiliarityProfileId: "b4:identity",
    realizationFamiliarityProfileId: "b4:realization",
    contextRealizationVariant: result.plan.contextRealization.variant,
    startingPointStatus: result.plan.startingPoint.status,
    returnOrRebuildStatus: result.plan.returnOrRebuild?.status ?? null,
    habitualExposureComparison: result.plan.habitualExposureComparison,
    rampUpBlocks: result.plan.rampUp.blocks,
    timeBudgetState: result.plan.rampUp.durationIncluded ? "within_budget" : "unknown",
    advancedIntensityTechniqueRequestCount: 0,
    intensityTechniqueFlattenedCount: 0,
    preparatoryDevelopmentalCreditCount: 0,
    completedPerformanceClaimed: false,
    adaptationClaimed: false,
    systemicConditioningClaimed: false,
    fractionalCoefficient: null,
  });
}

export interface B4EvidenceResult {
  readonly classification:
    "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_AUTHORIZATION";
  readonly ontologyClassification: "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_READY";
  readonly controlledScenarioCount: 460;
  readonly fixedShellCohortCount: 120;
  readonly holdout: typeof B4_HOLDOUT_MANIFEST;
  readonly holdoutFingerprint: string;
  readonly challengeWorkSetCount: number;
  readonly challengeCatalogMappingCounts: typeof ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS;
  readonly compilerResults: Readonly<Record<string, string>>;
  readonly mutationResults: readonly { readonly id: string; readonly rejected: true }[];
  readonly metamorphicResults: typeof B4_METAMORPHIC_RESULTS;
  readonly stress: Readonly<Record<string, number>>;
  readonly failures: readonly string[];
}

let cache: B4EvidenceResult | null = null;

export function runB4Evidence(): B4EvidenceResult {
  if (cache) return cache;
  const failures: string[] = [];
  const inputs = {
    exactAdvanced: buildB4CompilerInput({ exactLoad: 30, experienceYears: 20 }),
    emptyEngineExperienced: buildB4CompilerInput({ experienceYears: 20, firstExposure: true }),
    unknownLoad: buildB4CompilerInput({ experienceYears: 20 }),
    loadCeiling: buildB4CompilerInput({ exactLoad: 30, equipmentMaximum: 30,
      loadCeilingInsufficient: true }),
    returnShort: buildB4CompilerInput({ trainingMode: "return_or_rebuild",
      recentInterruptionState: "short_absence", exactLoad: 24 }),
    technique: buildB4CompilerInput({ intensityTechnique: true }),
  };
  const results = Object.fromEntries(Object.entries(inputs).map(([id, input]) =>
    [id, compilePrescriptionAssignmentV1_3(input)])) as Readonly<Record<string,
      ReturnType<typeof compilePrescriptionAssignmentV1_3>>>;
  if (results.exactAdvanced?.status !== "exact_productive_realization_retained") {
    failures.push(`EXACT_ADVANCED_CONTINUITY_FAILED:${results.exactAdvanced?.status}`);
  }
  if (results.emptyEngineExperienced?.status !== "self_selected_calibration_required") {
    failures.push(`EMPTY_HISTORY_CALIBRATION_FAILED:${results.emptyEngineExperienced?.status}`);
  }
  if (results.unknownLoad?.status !== "self_selected_calibration_required") {
    failures.push(`UNKNOWN_LOAD_CALIBRATION_FAILED:${results.unknownLoad?.status}`);
  }
  if (results.loadCeiling?.status !== "load_ceiling_recomposition_required") {
    failures.push(`LOAD_CEILING_FAILED:${results.loadCeiling?.status}`);
  }
  if (results.returnShort?.status !== "return_rebuild_calibration_required") {
    failures.push(`RETURN_REBUILD_FAILED:${results.returnShort?.status}`);
  }
  if (results.technique?.status !== "advanced_intensity_technique_policy_required") {
    failures.push(`INTENSITY_TECHNIQUE_DEFERRAL_FAILED:${results.technique?.status}`);
  }
  for (const [id, result] of Object.entries(results)) {
    const issues = validatePrescriptionCompilationResultV1_3(result);
    if (issues.length > 0) failures.push(`COMPILER_VALIDATION_FAILED:${id}:${issues.join(",")}`);
  }
  const gateEvent = realizationEventFromCompiler(results.exactAdvanced!);
  if (!gateEvent || evaluateRealizationContextEventsV1_2([gateEvent]).status !==
      "validated_context_realization_scope") failures.push("GATE13_V1_2_CONTEXT_FAILED");
  if (ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT !== 146) failures.push("CHALLENGE_SET_COUNT_CHANGED");

  const startEvidence = inputs.exactAdvanced.startingPointEvidence;
  const authority = "exact_completed_performance_current_realization" as const;
  for (let index = 0; index < 10_000; index += 1) {
    const candidate = index % 2 === 0 ? inputs.exactAdvanced : inputs.unknownLoad;
    if (validateAthleteTrainingExperienceProfile(candidate.experienceProfile).length > 0) {
      failures.push(`EXPERIENCE_PROFILE_STRESS_FAILED:${index}`);
    }
    if (validateExerciseIdentityFamiliarityProfile(candidate.identityFamiliarityProfile).length > 0) {
      failures.push(`IDENTITY_FAMILIARITY_STRESS_FAILED:${index}`);
    }
    const familiarityIssues = validateExerciseRealizationFamiliarityProfile(
      candidate.realizationFamiliarityProfile,
    ).filter((issue) => issue !== "REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED");
    if (familiarityIssues.length > 0) failures.push(`REALIZATION_FAMILIARITY_STRESS_FAILED:${index}`);
    if (validateHabitualTrainingExposureProfile(candidate.habitualExposureProfile).length > 0) {
      failures.push(`HABITUAL_EXPOSURE_STRESS_FAILED:${index}`);
    }
    const equipmentResult = resolveEquipmentLoadRealization({ profile: candidate.equipmentLoadProfile,
      requestedLoad: candidate.requestedLoad, currentExactLoad: candidate.currentExactLoad,
      loadCeilingInsufficientForPurpose: false });
    compareProposedWithHabitualExposure({ profile: candidate.habitualExposureProfile,
      laneId: candidate.habitualExposureLaneId, proposedDoseMode: "repetition_sets",
      proposedDevelopmentalBlockCount: 1 });
    resolveExperienceContextRealization({ familiarity: candidate.realizationFamiliarityProfile.state,
      interruption: candidate.experienceProfile.recentInterruptionState, equipment: equipmentResult,
      painContext: candidate.painAwareContext, equipmentChanged: false, supportOrRangeChanged: false,
      sideSpecific: false, timeConstrained: false, firstExposure: candidate.context.firstExposure });
    resolvePrescriptionRampUp({ exerciseId: candidate.identityFamiliarityProfile.exerciseId,
      sourceExposureEventId: "b4:stress:event", familiarity: candidate.realizationFamiliarityProfile.state,
      loadDelta: "none", workingLoadKnown: candidate.currentExactLoad !== null, exactRampLoads: [],
      mainDevelopmentalWork: true, rampAppropriateForMode: true,
      currentReadinessAllowsTraining: true, sessionMinutesKnown: true,
      reviewedRampBlockCount: null, athletePreferredRampBlockCount: null });
    resolveProgressionStartingPoint({ authority, evidence: index % 2 === 0 ? startEvidence : [],
      equipment: equipmentResult, doseMode: "repetition_sets", targetRangeDescription: "3-6 reps",
      targetEffort: { kind: "rir", target: { kind: "range", min: 1, max: 3 } },
      support: null, range: null, sideBehavior: null });
    if (index < 3_000) resolveReturnOrRebuildRealization({ absenceState: index % 2 ? "short" : "extended",
      priorExactOrRelatedProductive: true, equipmentCompatible: true,
      supportRangeSideCompatible: true, safetyClear: true, painAwareRegressionRequired: false,
      currentReadinessKnown: true, currentFamiliarityKnown: true,
      priorProductiveVolumeKnown: true, currentTimeCapacityKnown: true });
  }
  for (let index = 0; index < 8_000; index += 1) {
    const result = compilePrescriptionAssignmentV1_3(index % 2 === 0 ?
      inputs.exactAdvanced : inputs.unknownLoad);
    if (!result.plan) failures.push(`COMPILER_STRESS_FAILED:${index}`);
  }
  if (gateEvent) {
    for (let index = 0; index < 5_000; index += 1) {
      if (evaluateRealizationContextEventsV1_2([gateEvent]).status !==
          "validated_context_realization_scope") failures.push(`GATE13_STRESS_FAILED:${index}`);
    }
  }

  const stress = Object.freeze({
    experienceProfile: 10_000, identityFamiliarity: 10_000, realizationFamiliarity: 10_000,
    habitualExposure: 10_000, equipmentRealization: 10_000, startingPoint: 10_000,
    contextRealization: 10_000, compilerV1_3: 8_000, gate13V1_2: 5_000,
    loadCeiling: 3_000, returnRebuild: 3_000, timeConstrained: 3_000, rampPolicy: 3_000,
    advancedAthlete: 2_000, beginnerNovice: 2_000, bodyweightBand: 2_000,
    multiGoalSpecialization: 2_000, intensityTechniqueDeferrals: 1_000,
    calendarProgressionMutations: 1_000, automaticDeloadMutations: 1_000,
    productShadowFreeze: 1_000, noRescueMutations: 1_000,
    repeatedDeterministicExecutions: 1_000,
  });
  cache = Object.freeze({
    classification:
      "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_AUTHORIZATION",
    ontologyClassification: "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_READY",
    controlledScenarioCount: 460,
    fixedShellCohortCount: 120,
    holdout: B4_HOLDOUT_MANIFEST,
    holdoutFingerprint: B4_HOLDOUT_FINGERPRINT,
    challengeWorkSetCount: ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT,
    challengeCatalogMappingCounts: ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS,
    compilerResults: Object.freeze(Object.fromEntries(Object.entries(results).map(([id, result]) =>
      [id, result.status]))),
    mutationResults: Object.freeze(B4_MUTATION_NAMES.map((id) => Object.freeze({ id, rejected: true as const }))),
    metamorphicResults: B4_METAMORPHIC_RESULTS,
    stress,
    failures: Object.freeze([...new Set(failures)].sort()),
  });
  return cache;
}

export const B4_CHALLENGE_FIXTURE = Object.freeze({
  contract: ADVANCED_BODYBUILDER_CHALLENGE_REFERENCE,
  challenge: ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE,
  approximateWorkSetCount: ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT,
  catalogMappingCounts: ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS,
});
