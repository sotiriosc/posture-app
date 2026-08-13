import { createHash } from "node:crypto";
import {
  BODYWEIGHT_EQUIPMENT,
  CONTROLLED_CANDIDATE_SCENARIOS,
  EMPTY_TRAINING_HISTORY,
  NO_PAIN_OR_INJURY,
  NO_TRAINING_SAFETY_SIGNALS,
  planAndComposeSessionSkeleton,
  planSessionIntent,
  type AllocatedSessionObjective,
  type AssessmentState,
  type CurrentSessionEquipment,
  type PainAndInjuryState,
  type SessionAllocationDirective,
  type SessionIntentPlannerInput,
  type SessionIntentPlanningResult,
  type TrainingHistory,
  type TrainingOutcomeGoal,
} from "../../src";

export const PLANNER_PRODUCTION_AS_OF = "2026-08-12T12:00:00-04:00";
const BASE_REQUEST = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) => entry.id === "horizontal-pull-gym-neutral")!.request;

export function plannerObjective(input: Partial<AllocatedSessionObjective> & Pick<AllocatedSessionObjective, "id" | "kind">): AllocatedSessionObjective {
  return {
    id: input.id,
    kind: input.kind,
    priority: input.priority ?? (input.kind === "dominant_main" || input.kind === "capacity_main" ? "required" : "preferred"),
    priorityOrder: input.priorityOrder ?? 0,
    selectionTarget: input.selectionTarget ?? {
      targetMovementRoles: ["horizontal_pull"],
      targetActionFunctions: [],
      targetMuscles: ["mid_back", "lats"],
      muscleRequirement: "primary_required",
      targetBodyRegions: ["shoulder", "thoracic_spine"],
    },
    sourceEvidence: input.sourceEvidence ?? [{
      sourceKind: "standalone_session_brief",
      sourceId: `${input.id}:source`,
      evidenceRefs: [`${input.id}:allocation`],
    }],
    standaloneAdmissionDirection: input.standaloneAdmissionDirection ?? "policy_default",
    reasonCode: input.reasonCode ?? `allocated_${input.kind}`,
    explanation: input.explanation ?? `Trace explanation for ${input.id}.`,
  };
}

export function plannerDirective(input: {
  readonly id?: string;
  readonly athleteId?: string;
  readonly outcomeGoal?: TrainingOutcomeGoal;
  readonly objectives?: readonly AllocatedSessionObjective[];
  readonly capacity?: "condensed" | "standard" | "expanded" | "unknown";
  readonly minutes?: number | null;
  readonly source?: SessionAllocationDirective["source"];
  readonly programmingContextModes?: SessionAllocationDirective["programmingContextModes"];
  readonly unresolved?: SessionAllocationDirective["unresolvedContextObservations"];
  readonly weekReallocationEvidenceRefs?: readonly string[];
  readonly unresolvedWeeklyContextRefs?: readonly string[];
  readonly neighboringSessionContextRefs?: readonly string[];
} = {}): SessionAllocationDirective {
  const id = input.id ?? "planner-production-directive";
  return {
    id,
    source: input.source ?? "explicit_standalone_session_brief",
    athleteId: input.athleteId ?? BASE_REQUEST.athlete.id,
    sessionType: "ordinary_training",
    outcomeGoal: input.outcomeGoal ?? "strength",
    programmingContextModes: input.programmingContextModes ?? [],
    currentSessionAvailability: {
      availableMinutes: input.minutes === undefined ? 45 : input.minutes,
      structuralCapacity: input.capacity ?? "standard",
      provenance: "explicit_today",
      sourceRef: `${id}:availability`,
    },
    allocatedObjectives: input.objectives ?? [plannerObjective({ id: "main-pull", kind: "dominant_main" })],
    neighboringSessionContextRefs: input.neighboringSessionContextRefs ?? [],
    unresolvedWeeklyContextRefs: input.unresolvedWeeklyContextRefs ?? [],
    weekReallocationEvidenceRefs: input.weekReallocationEvidenceRefs ?? [],
    unresolvedContextObservations: input.unresolved ?? [],
    sourceTrace: {
      owner: input.source ?? "explicit_standalone_session_brief",
      sourceRefs: [`${id}:source`],
      transformationRuleIds: ["explicit_test_allocation"],
    },
    evaluationAsOf: PLANNER_PRODUCTION_AS_OF,
  };
}

export function plannerInput(input: {
  readonly directive?: SessionAllocationDirective | null;
  readonly assessment?: AssessmentState;
  readonly pain?: PainAndInjuryState;
  readonly history?: TrainingHistory;
  readonly equipment?: CurrentSessionEquipment;
} = {}): SessionIntentPlannerInput {
  return {
    ...(input.directive !== null ? { directive: input.directive ?? plannerDirective() } : {}),
    athlete: BASE_REQUEST.athlete,
    phaseIntent: BASE_REQUEST.phase,
    assessment: input.assessment ?? { signals: [], historicalWeaknesses: [] },
    painAndInjury: input.pain ?? NO_PAIN_OR_INJURY,
    trainingSafety: BASE_REQUEST.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS,
    currentEquipment: input.equipment ?? {
      capabilities: BASE_REQUEST.equipment,
      provenance: "explicit_today",
      sourceRef: "current-gym-snapshot",
    },
    history: input.history ?? EMPTY_TRAINING_HISTORY,
    trainingResponseHistory: input.history?.trainingResponseHistory ?? { observations: [] },
    satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control", "suitcase-carry-loaded-gait-setup"],
    evaluationAsOf: PLANNER_PRODUCTION_AS_OF,
  };
}

function pain(kind: "shoulder" | "low_back" | "knee" | "irrelevant"): PainAndInjuryState {
  const region = kind === "shoulder" ? "shoulder" : kind === "low_back" ? "lumbar_spine" : kind === "knee" ? "knee" : "ankle";
  return {
    ...NO_PAIN_OR_INJURY,
    historicalSensitivities: [{
      kind: "historical_sensitivity",
      id: `${kind}-sensitivity`,
      region,
      stressTags: kind === "shoulder" ? ["horizontal_pressing"] : kind === "low_back" ? ["loaded_hinge"] : kind === "knee" ? ["loaded_knee_flexion"] : ["high_impact"],
      preferredModification: "monitor",
      description: `${kind} trace-only sensitivity.`,
    }],
  };
}

const HIGH_RELEVANT: AssessmentState = {
  signals: [{ id: "high-pull-control", type: "control_finding", source: "movement_screen", confidence: "high", priority: "primary",
    region: "shoulder", movementRole: "horizontal_pull", actionFunctions: ["scapular_retraction"], side: "bilateral",
    description: "Structured pull control finding." }], historicalWeaknesses: [],
};
const LOW_RELEVANT: AssessmentState = {
  signals: [{ ...HIGH_RELEVANT.signals[0], id: "low-pull-control", confidence: "low" }], historicalWeaknesses: [],
};

function historyWith(input: { readonly stable?: boolean; readonly adverse?: boolean; readonly missed?: boolean }): TrainingHistory {
  return {
    ...EMPTY_TRAINING_HISTORY,
    exerciseHistory: {
      events: input.stable ? [{ id: "row-success", exerciseId: "machine-row", type: "successful_completion", movementRole: "horizontal_pull", notes: "Completed." }]
        : input.adverse ? [{ id: "row-adverse", exerciseId: "machine-row", type: "pain_response", movementRole: "horizontal_pull", notes: "Adverse." }] : [],
      stableExerciseIds: input.stable ? ["machine-row"] : [],
      blockedExerciseIds: [],
    },
    sessionHistory: { ...EMPTY_TRAINING_HISTORY.sessionHistory, missedSessionIds: input.missed ? ["missed-week-session"] : [] },
  };
}

export type PlannerCohortClassification =
  | "MATERIAL_PLANNER_DIFFERENCE"
  | "MATERIAL_DOWNSTREAM_DIFFERENCE_SAME_NEEDS"
  | "SAME_INTENT_DIFFERENT_PRESCRIPTION_REQUIRED"
  | "JUSTIFIED_CONVERGENCE"
  | "REQUIRES_WEEK_REALLOCATION"
  | "REQUIRES_EXPLICIT_ALLOCATION"
  | "UNRESPONSIVE_TO_MATERIAL_INPUT"
  | "WRONG_LAYER_EFFECT"
  | "UNSUPPORTED_CONTEXT_REQUIRES_TYPED_CONTRACT";

export interface PlannerCohortRow {
  readonly id: string;
  readonly classification: PlannerCohortClassification;
  readonly result: ReturnType<typeof planAndComposeSessionSkeleton>;
}

const calfObjective = plannerObjective({ id: "direct-calves", kind: "direct_accessory", priority: "preferred", priorityOrder: 0,
  selectionTarget: { targetMovementRoles: ["accessory"], targetActionFunctions: ["ankle_plantar_flexion"], targetMuscles: ["calves"],
    muscleRequirement: "primary_required", targetBodyRegions: ["ankle"] } });

export function buildFixedShellPlannerCohort(): readonly PlannerCohortRow[] {
  const rows: readonly [string, SessionIntentPlannerInput, PlannerCohortClassification][] = [
    ["strength-allocation", plannerInput(), "JUSTIFIED_CONVERGENCE"],
    ["hypertrophy-allocation", plannerInput({ directive: plannerDirective({ id: "hypertrophy", outcomeGoal: "hypertrophy" }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["posture-allocation", plannerInput({ directive: plannerDirective({ id: "posture", outcomeGoal: "posture_and_movement_quality" }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["pain-aware-strength", plannerInput({ directive: plannerDirective({ id: "pain-aware", programmingContextModes: ["pain_aware_return"] }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["shoulder-discomfort", plannerInput({ directive: plannerDirective({ id: "shoulder" }), pain: pain("shoulder") }), "MATERIAL_DOWNSTREAM_DIFFERENCE_SAME_NEEDS"],
    ["low-back-sensitivity", plannerInput({ directive: plannerDirective({ id: "low-back" }), pain: pain("low_back") }), "JUSTIFIED_CONVERGENCE"],
    ["knee-sensitivity", plannerInput({ directive: plannerDirective({ id: "knee" }), pain: pain("knee") }), "JUSTIFIED_CONVERGENCE"],
    ["high-assessment", plannerInput({ directive: plannerDirective({ id: "high-assessment" }), assessment: HIGH_RELEVANT }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["low-assessment", plannerInput({ directive: plannerDirective({ id: "low-assessment" }), assessment: LOW_RELEVANT }), "JUSTIFIED_CONVERGENCE"],
    ["productive-continuity", plannerInput({ directive: plannerDirective({ id: "productive" }), history: historyWith({ stable: true }) }), "MATERIAL_DOWNSTREAM_DIFFERENCE_SAME_NEEDS"],
    ["adverse-response", plannerInput({ directive: plannerDirective({ id: "adverse" }), history: historyWith({ adverse: true }) }), "MATERIAL_DOWNSTREAM_DIFFERENCE_SAME_NEEDS"],
    ["calf-priority", plannerInput({ directive: plannerDirective({ id: "calf", objectives: [plannerObjective({ id: "main-pull", kind: "dominant_main" }), calfObjective] }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["condensed", plannerInput({ directive: plannerDirective({ id: "condensed", capacity: "condensed" }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["home-equipment", plannerInput({ directive: plannerDirective({ id: "home" }), equipment: { capabilities: BODYWEIGHT_EQUIPMENT, provenance: "explicit_today", sourceRef: "temporary-home" } }), "MATERIAL_DOWNSTREAM_DIFFERENCE_SAME_NEEDS"],
    ["explicit-user-request", plannerInput({ directive: plannerDirective({ id: "user-request", objectives: [plannerObjective({ id: "main-pull", kind: "dominant_main", sourceEvidence: [{ sourceKind: "user_explicit_session_request", sourceId: "request-1", evidenceRefs: ["user-request"] }] })] }) }), "MATERIAL_PLANNER_DIFFERENCE"],
    ["missed-session-context", plannerInput({ directive: plannerDirective({ id: "missed" }), history: historyWith({ missed: true }) }), "JUSTIFIED_CONVERGENCE"],
    ["no-allocation", plannerInput({ directive: null }), "REQUIRES_EXPLICIT_ALLOCATION"],
    ["irrelevant-pain", plannerInput({ directive: plannerDirective({ id: "irrelevant-pain" }), pain: pain("irrelevant") }), "JUSTIFIED_CONVERGENCE"],
  ];
  return rows.map(([id, input, classification]) => ({ id, classification, result: planAndComposeSessionSkeleton(input) }));
}

export function behavioralSignature(result: SessionIntentPlanningResult): unknown {
  const intent = result.sessionIntent;
  return {
    status: result.status,
    outcomeGoal: intent?.outcomeGoal,
    modes: intent?.programmingContextModes,
    capacity: intent?.structuralCapacity,
    needs: intent?.needs.map((need) => ({ section: need.section, priority: need.priority, order: need.priorityOrder,
      admission: need.standaloneAdmission, selection: need.selection, dependencies: need.dependencies.map((dependency) => ({
        targetNeedIds: dependency.targetNeedIds, movements: dependency.movementRoles, actions: dependency.actionFunctions,
        regions: dependency.bodyRegions, required: dependency.required,
      })) })),
    continuity: intent?.continuityEvidence.identities.map((identity) => ({ exerciseId: identity.exerciseId,
      served: identity.previouslyServedNeedIds, classification: identity.observationalClassification,
      productive: identity.productive, adverse: identity.repeatedAdverseEvidence, equipmentLost: identity.equipmentLost })),
  };
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildPlannerFingerprintPayloads() {
  const cohort = buildFixedShellPlannerCohort();
  const baseline = planSessionIntent(plannerInput());
  const high = planSessionIntent(plannerInput({ assessment: HIGH_RELEVANT }));
  const mobility = planSessionIntent(plannerInput({ assessment: { signals: [{
    id: "high-pull-range", type: "mobility_finding", source: "movement_screen", confidence: "high", priority: "primary",
    region: "shoulder", movementRole: "horizontal_pull", actionFunctions: ["scapular_retraction"], side: "bilateral",
    description: "Structured pull range finding.",
  }], historicalWeaknesses: [] } }));
  const unresolved = planSessionIntent(plannerInput({ directive: plannerDirective({ unresolved: [{ observationId: "sleep", source: "user prose",
    contextCategory: "recovery_readiness", proposedOwner: "future_readiness_adapter", resolutionState: "requires_typed_input", blocksPlanning: false,
    description: "Slept badly." }] }) }));
  const capacityMain = planSessionIntent(plannerInput({ directive: plannerDirective({ id: "capacity-main-fingerprint",
    outcomeGoal: "conditioning", objectives: [plannerObjective({ id: "capacity-main", kind: "capacity_main" })] }) }));
  const integrated = planAndComposeSessionSkeleton(plannerInput());
  const payloads = {
    goalContextOntology: { outcome: ["strength", "hypertrophy", "general_fitness", "conditioning", "posture_and_movement_quality"], context: ["pain_aware_return"] },
    sessionTypeOntology: ["ordinary_training"],
    allocationDirective: plannerDirective(),
    currentSessionAvailability: baseline.availabilityTrace,
    objectiveNormalization: baseline.sessionIntent?.needs,
    objectiveRoleSectionMapping: baseline.sessionIntent?.needs.map((need) => [need.section, need.selection.requestedRole]),
    assessmentActionExtension: HIGH_RELEVANT.signals.map((signal) => signal.actionFunctions),
    typedRangeDependency: mobility.sessionIntent?.needs.flatMap((need) => need.dependencies.flatMap((dependency) => dependency.rangeRequirements ?? [])),
    needMergePolicy: "structured_equivalent_need_truth_merge",
    assessmentEnrichment: high.assessmentEnrichmentTraces,
    painBoundary: behavioralSignature(planSessionIntent(plannerInput({ pain: pain("irrelevant") }))),
    phaseBoundary: baseline.decisionTrace.phaseContextOnlyFields,
    continuityProjection: behavioralSignature(planSessionIntent(plannerInput({ history: historyWith({ stable: true }) }))),
    unresolvedContextProtocol: unresolved.unresolvedContextFindings,
    plannerValidation: { baseline: baseline.validationFindings, capacityMain: {
      findings: capacityMain.validationFindings, signature: behavioralSignature(capacityMain),
    } },
    plannerOutput: behavioralSignature(baseline),
    plannerCandidateAdapter: Object.fromEntries(Object.entries(integrated.candidateResultsByNeed ?? {}).map(([id, result]) => [id, result.request.id])),
    plannerComposerIntegration: integrated.skeleton && { status: integrated.skeleton.compositionStatus, assignments: integrated.skeleton.assignments.map((entry) => entry.exerciseId) },
    fixedShellPersonalization: cohort.map((row) => [row.id, row.classification, behavioralSignature(row.result.planning)]),
    sameExperienceEquipmentRegression: cohort.slice(0, 12).map((row) => digest(behavioralSignature(row.result.planning))),
    realUserVariableAudit: ["explicit_session_purpose", "current_availability", "current_equipment", "readiness", "social_context", "crowding", "novelty_request"],
    ontologyGraduationReview: "SESSION_INTENT_PLANNER_READY_FOR_WEEK_COMPOSER_DESIGN",
  };
  return payloads;
}

export function computePlannerFingerprints(): Readonly<Record<string, string>> {
  const payloads = buildPlannerFingerprintPayloads();
  const individual = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedPlannerKernel: digest(individual) };
}

export const EXPECTED_PLANNER_FINGERPRINTS: Readonly<Record<string, string>> = {
  goalContextOntology: "5f52ec7b421a5c0fe46a614ca1aa56ee58f30525bef67ae911e4b8ab491beadb",
  sessionTypeOntology: "b70c7426d86e6db68ea4cebd9e76498c9fc1b835844aa6d99e2db1ced07de2ea",
  allocationDirective: "09574cdba1b70f46a509ff50f3c66855e89ba9d65e42b34a01d4fb8754a8fe93",
  currentSessionAvailability: "69338ab96629dd73026b11ea0db1e5501d332736e7bbae9768096d30344592ca",
  objectiveNormalization: "aeab89dbda25320ba4ea8d902804d99f063ed1111f883643c93b362d0384bcd4",
  objectiveRoleSectionMapping: "3294498baaa84642ff18dcee59d65176e897cadf3015da4c374d4e03c6910237",
  assessmentActionExtension: "135de337a7dff70e9c40091f5e9b1bf81ffa12179d3a6719da452f28458ec10c",
  typedRangeDependency: "77920c3b39665d754b44163a593d9cb7f9f63dea038ff1cebdbb95ccafaf5b40",
  needMergePolicy: "b31b46c3d19beb7893d8d5cf34411ab126caeea7a95a9042b5e63e982caf24e6",
  assessmentEnrichment: "fce7551c184c01c3afa43a4ceea2f71043a8d212a25270168c7c3f877b89c12a",
  painBoundary: "ff7b1090d7e62f3a95e6c3b4115a6dd2a62a8c00497fc28c3c2f9698ce070041",
  phaseBoundary: "8808fb5ef384084a0cb44af21dc1ffcb81b355f0881140d566f6ae7c68a6700c",
  continuityProjection: "673a18f57f5449692bc6c2f27b6c02d358ab993ffd86c952901cc3788dfcf551",
  unresolvedContextProtocol: "3dee5afe72eb4d9dec44f99f239aa34c10dc449cf09c7b5b419ba02746305226",
  plannerValidation: "99628fb3033aa7f0167a93d23fa235a2f9c39dd9eaefec3076dd465d2f3b0f86",
  plannerOutput: "ff7b1090d7e62f3a95e6c3b4115a6dd2a62a8c00497fc28c3c2f9698ce070041",
  plannerCandidateAdapter: "54dd4ec4080469a5fc93a4e8934ca52787539d04fb3a87f6a3e9ae5e5d60b54e",
  plannerComposerIntegration: "35486e970821ee299868809b562a2cabcf007b4864edf94b32547ba9f1b6a150",
  fixedShellPersonalization: "64f7561e4690fe3c6cd362277055740f3d663caa91d7f252c13fdcbdfc78b888",
  sameExperienceEquipmentRegression: "cfacf66f40d3f51b3038db0474fd14978a54d4cb5b90b307d7ef7ef7951345f6",
  realUserVariableAudit: "b969afebdbc1f17548e691292c599a8ac08ca2ab3887784ee16fd6cba31ecf70",
  ontologyGraduationReview: "aef4b803d6f9a38b566747e50546b53ca9d5474748ebaa9c2f7b03d49a2cc0e1",
  combinedPlannerKernel: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
};

export function runDeterministicPlannerFuzz(caseCount = 10_000): { readonly cases: number; readonly failures: readonly string[]; readonly digest: string } {
  let seed = 0x0806710;
  const next = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const failures: string[] = [];
  const signatures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const objective = plannerObjective({ id: `main-${index}`, kind: "dominant_main", explanation: `prose-${next()}`,
      sourceEvidence: next() % 2 === 0
        ? [{ sourceKind: "standalone_session_brief", sourceId: "b", evidenceRefs: ["2", "1"] }, { sourceKind: "typed_dependency", sourceId: "a", evidenceRefs: ["3"] }]
        : [{ sourceKind: "typed_dependency", sourceId: "a", evidenceRefs: ["3"] }, { sourceKind: "standalone_session_brief", sourceId: "b", evidenceRefs: ["1", "2"] }] });
    const capacity = (["condensed", "standard", "expanded", "unknown"] as const)[next() % 4];
    const directive = plannerDirective({ id: `fuzz-${index}`, capacity, objectives: [objective] });
    const result = planSessionIntent(plannerInput({ directive }));
    const repeated = planSessionIntent(plannerInput({ directive }));
    const left = digest(behavioralSignature(result));
    const right = digest(behavioralSignature(repeated));
    if (left !== right) failures.push(`non_deterministic:${index}`);
    if (result.status !== "planned" || result.sessionIntent?.needs.length !== 1) failures.push(`unexpected_shape:${index}`);
    signatures.push(left);
  }
  return { cases: caseCount, failures, digest: digest(signatures) };
}
