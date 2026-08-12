import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  REFERENCE_EXERCISES,
  SESSION_SECTIONS,
  type CandidateNeed,
  type ExerciseDefinition,
  type MuscleGroup,
  type SessionSection,
  type TrainingGoal,
  type TrainingReadinessTrace,
  type TrainingRole,
} from "../../src";
import type {
  CandidateCompositionAvailability,
  DeterministicSessionSearchPolicy,
  NeedSatisfactionTrace,
  NeedsFirstSessionIntent,
  PlannedSessionSkeleton,
  SessionCandidateEvidence,
  SessionCompositionInput,
  SessionEvaluationVector,
  SessionExerciseAssignment,
  SessionExerciseCompositionFacts,
  SessionMarginalValueTrace,
  SessionNeed,
  SessionNeedDependency,
  SessionNeedPriority,
  SessionNeedSourceKind,
  SessionOrderingConstraint,
  SessionPotentialConcentrationTrace,
  SessionRedundancyTrace,
  SessionSectionPlan,
  SessionSetupTransitionTrace,
} from "../../src/sessionComposer/designContracts";
import { buildP0WholeBodyProductionData } from "./p0WholeBodyProduction";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";

export const SESSION_COMPOSER_OVERALL_CLASSIFICATION =
  "TARGETED_DESIGN_DECISIONS_REQUIRED" as const;
export const SESSION_COMPOSER_EXACT_NEXT_DEPENDENCY =
  "PROJECT_OWNER_APPROVAL_OF_SESSION_COMPOSER_DESIGN_AND_TARGETED_OPTIMIZER_POLICIES" as const;
export const SESSION_COMPOSER_LAB_AS_OF = "2026-08-12T12:00:00-04:00";

export const SESSION_COMPOSER_SEARCH_POLICY: DeterministicSessionSearchPolicy = {
  strategy: "exhaustive_controlled_lab",
  evaluation: "strict_lexicographic",
  optionalAdmission: "positive_unique_marginal_value_only",
  tieBreak: "canonical_exercise_id",
  randomization: false,
  repairLoop: false,
  productionBeamWidth: null,
};

const hash = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const ALLOWED_READINESS: TrainingReadinessTrace = {
  status: "TRAINING_ALLOWED",
  downstreamTrainingAllowed: true,
  reviewRequiredFirst: false,
  urgentExternalReviewRequired: false,
  unresolvedSignalIds: [],
  externallyResolvedSignalIds: [],
  evidence: [],
  reason: "No unresolved TrainingSafety authority blocks ordinary training.",
};

const BLOCKED_READINESS: TrainingReadinessTrace = {
  status: "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING",
  downstreamTrainingAllowed: false,
  reviewRequiredFirst: true,
  urgentExternalReviewRequired: false,
  unresolvedSignalIds: ["safety-review-first"],
  externallyResolvedSignalIds: [],
  evidence: [],
  reason: "Explicit TrainingSafety authority requires review first.",
};

function exercise(id: string): ExerciseDefinition {
  const row = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`Missing canonical exercise ${id}.`);
  return row;
}

function candidateNeed(input: {
  readonly id: string;
  readonly role: TrainingRole;
  readonly section: SessionSection;
  readonly movementRoles?: CandidateNeed["targetMovementRoles"];
  readonly actionFunctions?: CandidateNeed["targetActionFunctions"];
  readonly muscles?: readonly MuscleGroup[];
  readonly muscleRequirement?: CandidateNeed["muscleRequirement"];
  readonly goal?: TrainingGoal;
}): CandidateNeed {
  return {
    id: input.id,
    whyNeeded: `Canonical candidate truth for ${input.id}.`,
    requestedRole: input.role,
    requestedSection: input.section,
    targetMovementRoles: input.movementRoles ?? [],
    targetActionFunctions: input.actionFunctions ?? [],
    targetMuscles: input.muscles ?? [],
    muscleRequirement: input.muscleRequirement,
    targetBodyRegions: [],
    goal: input.goal ?? "strength",
  };
}

function need(input: {
  readonly id: string;
  readonly priority: SessionNeedPriority;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly source?: SessionNeedSourceKind;
  readonly movementRoles?: CandidateNeed["targetMovementRoles"];
  readonly actionFunctions?: CandidateNeed["targetActionFunctions"];
  readonly muscles?: readonly MuscleGroup[];
  readonly muscleRequirement?: CandidateNeed["muscleRequirement"];
  readonly goal?: TrainingGoal;
  readonly dependencies?: readonly SessionNeedDependency[];
  readonly prescriptionResolutionExpected?: boolean;
}): SessionNeed {
  return {
    id: input.id,
    sourceEvidence: [{
      sourceKind: input.source ?? "session_primary_purpose",
      sourceId: `${input.id}-source`,
      evidenceRefs: [`${input.id}-evidence`],
    }],
    priority: input.priority,
    intendedSection: input.section,
    candidateNeed: candidateNeed({
      id: input.id,
      role: input.role,
      section: input.section,
      movementRoles: input.movementRoles,
      actionFunctions: input.actionFunctions,
      muscles: input.muscles,
      muscleRequirement: input.muscleRequirement,
      goal: input.goal,
    }),
    dependencies: input.dependencies ?? [],
    prescriptionResolutionExpected: input.prescriptionResolutionExpected ?? false,
    reasonCode: `session_need_${input.id}`,
    explanation: `The Session Intent Planner supplied ${input.id}; this prose has no behavioral authority.`,
  };
}

function dependency(input: {
  readonly id: string;
  readonly targetNeedIds: readonly string[];
  readonly movementRoles?: readonly CandidateNeed["targetMovementRoles"][number][];
  readonly bodyRegions?: readonly SessionNeedDependency["bodyRegions"][number][];
  readonly assessmentSignalIds?: readonly string[];
  readonly painResponseRequirementIds?: readonly string[];
}): SessionNeedDependency {
  return {
    dependencyId: input.id,
    targetNeedIds: input.targetNeedIds,
    targetExerciseIds: [],
    movementRoles: input.movementRoles ?? [],
    actionFunctions: [],
    bodyRegions: input.bodyRegions ?? [],
    assessmentSignalIds: input.assessmentSignalIds ?? [],
    requiredRangeIds: [],
    painResponseRequirementIds: input.painResponseRequirementIds ?? [],
    required: true,
  };
}

function availabilityFromPain(
  readiness: SessionCandidateEvidence["painExecutionReadiness"],
): CandidateCompositionAvailability {
  switch (readiness) {
    case "EXECUTABLE_AT_CANDIDATE_SCOPE": return "executable";
    case "REQUIRES_CANDIDATE_REVIEW": return "candidate_review_required";
    case "REQUIRES_PRESCRIPTION": return "prescription_required";
    case "REQUIRES_SESSION_ROLE_SUBSTITUTION": return "session_role_substitution_required";
    case "URGENT_EXTERNAL_REVIEW": return "urgent_external_review";
  }
}

function candidate(
  needId: string,
  exerciseId: string,
  rank: number,
  total: number,
  painExecutionReadiness: SessionCandidateEvidence["painExecutionReadiness"] =
    "EXECUTABLE_AT_CANDIDATE_SCOPE",
  input: Partial<Pick<SessionCandidateEvidence, "rejectionReasonCodes" | "equipmentGapIds" | "unresolvedRequirementIds">> = {},
): SessionCandidateEvidence {
  return {
    exerciseId,
    needId,
    legal: true,
    candidateRank: rank,
    candidateTotal: total,
    painExecutionReadiness,
    compositionAvailability: availabilityFromPain(painExecutionReadiness),
    rejectionReasonCodes: input.rejectionReasonCodes ?? [],
    equipmentGapIds: input.equipmentGapIds ?? [],
    unresolvedRequirementIds: input.unresolvedRequirementIds ?? (
      painExecutionReadiness === "REQUIRES_PRESCRIPTION"
        ? [`${needId}-${exerciseId}-prescription-resolution`]
        : painExecutionReadiness === "REQUIRES_CANDIDATE_REVIEW"
          ? [`${needId}-${exerciseId}-candidate-review`]
          : []
    ),
  };
}

function compositionFacts(
  id: string,
  overrides: Partial<SessionExerciseCompositionFacts> = {},
): SessionExerciseCompositionFacts {
  const row = exercise(id);
  const support = row.mechanics?.support;
  const intrinsicStressTags = (row.stressAnnotations ?? [])
    .filter((entry) => entry.exposureScope === "intrinsic")
    .map((entry) => entry.tag);
  const potentialStressTags = (row.stressAnnotations ?? [])
    .filter((entry) => entry.exposureScope !== "intrinsic")
    .map((entry) => entry.tag);
  const grip = row.loading.jointStressTags.some((tag) =>
    tag === "grip_intensive" || tag === "grip_loading",
  );
  return {
    exerciseId: id,
    legalSections: Object.keys(row.sectionSuitability) as SessionSection[],
    legalTrainingRoles: row.trainingRoles,
    movementRoles: row.movementRoles,
    actionFunctions: row.actionFunctions.map((entry) => entry.action),
    primaryMuscles: row.primaryMuscles,
    family: row.family,
    supportSignature: support
      ? `${support.basePosition}:${support.supportAmount}:${support.supportContacts.map((entry) => entry.source).join("+")}`
      : "unknown",
    resistancePathSignature: row.mechanics?.resistancePath?.resistancePath ?? "unknown",
    setupSignature: row.equipmentRequirements.map((entry) => entry.id).sort().join("+") || "none",
    localFatigue: row.loading.localFatigue,
    systemicFatigue: row.loading.systemicFatigue,
    axialLoading: row.loading.axialLoading,
    intrinsicStressTags,
    potentialStressTags,
    gripPotential: grip ? "moderate" : "none",
    continuityClassification: "none",
    continuityReasonCodes: [],
    ...overrides,
  };
}

interface ScenarioDefinition {
  readonly id: string;
  readonly description: string;
  readonly intent: NeedsFirstSessionIntent;
  readonly candidates: Readonly<Record<string, readonly SessionCandidateEvidence[]>>;
  readonly facts: readonly SessionExerciseCompositionFacts[];
  readonly readiness?: TrainingReadinessTrace;
  readonly expectedSelectedIds: readonly string[];
  readonly expectedStatus?: PlannedSessionSkeleton["status"];
}

function intent(input: {
  readonly id: string;
  readonly kind: NeedsFirstSessionIntent["kind"];
  readonly goal: TrainingGoal;
  readonly needs: readonly SessionNeed[];
  readonly minutes?: number;
  readonly assessmentContextIds?: readonly string[];
  readonly painResponseContextIds?: readonly string[];
  readonly fatigueSignals?: NeedsFirstSessionIntent["fatigueSignals"];
  readonly productiveIds?: readonly string[];
}): NeedsFirstSessionIntent {
  return {
    id: `${input.id}-intent`,
    athleteId: `${input.id}-athlete`,
    kind: input.kind,
    phaseId: "phase_1",
    primaryGoal: input.goal,
    needs: input.needs,
    availableMinutes: input.minutes ?? 45,
    assessmentContextIds: input.assessmentContextIds ?? [],
    painResponseContextIds: input.painResponseContextIds ?? [],
    fatigueSignals: input.fatigueSignals ?? [],
    continuity: {
      productiveExerciseIds: input.productiveIds ?? [],
      plateauedExerciseIds: [],
      failedProgressionExerciseIds: [],
      painResponseExerciseIds: [],
    },
    sourceTrace: {
      plannerId: `${input.id}-planner-fixture`,
      sourceRefs: [`${input.id}-fixture-source`],
      unresolvedWeeklyContextIds: ["weekly-volume-and-frequency-deferred"],
    },
  };
}

function inputFromScenario(scenario: ScenarioDefinition): SessionCompositionInput {
  return {
    intent: scenario.intent,
    candidateEvidenceByNeed: scenario.candidates,
    exerciseFacts: scenario.facts,
    evaluationAsOf: SESSION_COMPOSER_LAB_AS_OF,
    trainingReadiness: scenario.readiness ?? ALLOWED_READINESS,
    continuityResponseTraceIds: [],
    searchPolicy: SESSION_COMPOSER_SEARCH_POLICY,
  };
}

const sectionOrder = new Map(SESSION_SECTIONS.map((section, index) => [section, index]));
const assignmentSectionPreference: readonly SessionSection[] = [
  "main", "accessory", "activation", "warmup", "cooldown",
];

function combinations<T>(values: readonly T[]): readonly (readonly T[])[] {
  const output: T[][] = [];
  const count = 2 ** values.length;
  for (let mask = 0; mask < count; mask += 1) {
    const selected: T[] = [];
    values.forEach((value, index) => {
      if ((mask & (1 << index)) !== 0) selected.push(value);
    });
    output.push(selected);
  }
  return output;
}

function admittedPriority(minutes: number, priority: SessionNeedPriority): boolean {
  if (priority === "required") return true;
  if (priority === "preferred") return minutes >= 45;
  return minutes >= 70;
}

function selectable(candidateEvidence: SessionCandidateEvidence): boolean {
  return candidateEvidence.legal && ![
    "session_role_substitution_required",
    "urgent_external_review",
  ].includes(candidateEvidence.compositionAvailability);
}

function candidatesFor(
  input: SessionCompositionInput,
  needId: string,
): readonly SessionCandidateEvidence[] {
  return (input.candidateEvidenceByNeed[needId] ?? []).filter(selectable);
}

function coveredNeedIds(
  input: SessionCompositionInput,
  selectedIds: readonly string[],
): readonly string[] {
  return input.intent.needs
    .filter((sessionNeed) =>
      admittedPriority(input.intent.availableMinutes, sessionNeed.priority) &&
      candidatesFor(input, sessionNeed.id).some((entry) => selectedIds.includes(entry.exerciseId)),
    )
    .map((sessionNeed) => sessionNeed.id);
}

function bestEvidence(
  input: SessionCompositionInput,
  needId: string,
  exerciseId: string,
): SessionCandidateEvidence | undefined {
  return candidatesFor(input, needId).find((entry) => entry.exerciseId === exerciseId);
}

function assignmentSection(
  input: SessionCompositionInput,
  exerciseId: string,
): SessionSection | null {
  const facts = input.exerciseFacts.find((entry) => entry.exerciseId === exerciseId);
  if (!facts) return null;
  const serving = input.intent.needs.filter((sessionNeed) =>
    admittedPriority(input.intent.availableMinutes, sessionNeed.priority) &&
    bestEvidence(input, sessionNeed.id, exerciseId),
  );
  return assignmentSectionPreference.find((section) =>
    serving.some((sessionNeed) => sessionNeed.intendedSection === section) &&
    facts.legalSections.includes(section),
  ) ?? null;
}

function selectedNeedIds(
  input: SessionCompositionInput,
  exerciseId: string,
): readonly string[] {
  return input.intent.needs
    .filter((sessionNeed) =>
      admittedPriority(input.intent.availableMinutes, sessionNeed.priority) &&
      bestEvidence(input, sessionNeed.id, exerciseId),
    )
    .map((sessionNeed) => sessionNeed.id);
}

function indispensable(
  input: SessionCompositionInput,
  selectedIds: readonly string[],
  exerciseId: string,
): boolean {
  const allCovered = new Set(coveredNeedIds(input, selectedIds));
  const without = new Set(coveredNeedIds(input, selectedIds.filter((id) => id !== exerciseId)));
  return [...allCovered].some((needId) => !without.has(needId));
}

function redundancyTraces(
  input: SessionCompositionInput,
  selectedIds: readonly string[],
): readonly SessionRedundancyTrace[] {
  const traces: SessionRedundancyTrace[] = [];
  selectedIds.forEach((leftId, leftIndex) => {
    selectedIds.slice(leftIndex + 1).forEach((rightId) => {
      const left = input.exerciseFacts.find((entry) => entry.exerciseId === leftId)!;
      const right = input.exerciseFacts.find((entry) => entry.exerciseId === rightId)!;
      const overlaps: string[] = [];
      if (left.movementRoles.some((value) => right.movementRoles.includes(value))) overlaps.push("movement_role");
      if (left.actionFunctions.some((value) => right.actionFunctions.includes(value))) overlaps.push("action_function");
      if (left.primaryMuscles.some((value) => right.primaryMuscles.includes(value))) overlaps.push("primary_muscle");
      if (left.family === right.family) overlaps.push("exercise_family");
      if (left.supportSignature === right.supportSignature) overlaps.push("support");
      if (left.resistancePathSignature === right.resistancePathSignature) overlaps.push("resistance_path");
      const leftNeeds = selectedNeedIds(input, leftId);
      const rightNeeds = selectedNeedIds(input, rightId);
      const distinctPurposeNeedIds = [...new Set([
        ...leftNeeds.filter((id) => !rightNeeds.includes(id)),
        ...rightNeeds.filter((id) => !leftNeeds.includes(id)),
      ])].sort();
      traces.push({
        leftExerciseId: leftId,
        rightExerciseId: rightId,
        overlappingDimensions: overlaps,
        distinctPurposeNeedIds,
        verdict: overlaps.length >= 2 && distinctPurposeNeedIds.length === 0
          ? "redundant"
          : distinctPurposeNeedIds.length > 0
            ? "complementary"
            : "unknown",
      });
    });
  });
  return traces;
}

function concentrationTraces(
  input: SessionCompositionInput,
  selectedIds: readonly string[],
): readonly SessionPotentialConcentrationTrace[] {
  const facts = selectedIds.map((id) => input.exerciseFacts.find((entry) => entry.exerciseId === id)!);
  const dimensions: Array<[string, (row: SessionExerciseCompositionFacts) => boolean]> = [
    ["systemic_fatigue", (row) => row.systemicFatigue === "high"],
    ["axial_loading", (row) => row.axialLoading === "high"],
    ["grip", (row) => row.gripPotential === "high" || row.gripPotential === "moderate"],
  ];
  return dimensions.flatMap(([dimension, predicate]) => {
    const ids = facts.filter(predicate).map((row) => row.exerciseId);
    return ids.length >= 2 ? [{
      dimension,
      exerciseIds: ids,
      state: "potential_concentration" as const,
    }] : [];
  });
}

function readinessBurden(input: SessionCompositionInput, selectedIds: readonly string[]): number {
  return selectedIds.reduce((total, exerciseId) => {
    const statuses = input.intent.needs.flatMap((sessionNeed) => {
      const entry = bestEvidence(input, sessionNeed.id, exerciseId);
      return entry ? [entry.compositionAvailability] : [];
    });
    return total + (statuses.includes("candidate_review_required") ? 1 : 0);
  }, 0);
}

function evaluationVector(
  input: SessionCompositionInput,
  selectedIds: readonly string[],
): SessionEvaluationVector {
  const covered = new Set(coveredNeedIds(input, selectedIds));
  const redundancy = redundancyTraces(input, selectedIds);
  const concentration = concentrationTraces(input, selectedIds);
  const assignments = selectedIds.map((id) => ({ id, section: assignmentSection(input, id) }));
  const rankSum = input.intent.needs.reduce((total, sessionNeed) => {
    const entries = selectedIds
      .map((id) => bestEvidence(input, sessionNeed.id, id))
      .filter((entry): entry is SessionCandidateEvidence => Boolean(entry));
    return total + (entries.sort((a, b) => a.candidateRank - b.candidateRank)[0]?.candidateRank ?? 0);
  }, 0);
  const setupOrder = [...assignments].sort((left, right) =>
    (sectionOrder.get(left.section ?? "cooldown") ?? 9) -
      (sectionOrder.get(right.section ?? "cooldown") ?? 9) || left.id.localeCompare(right.id),
  );
  const setupSignatures = setupOrder.map(({ id }) =>
    input.exerciseFacts.find((entry) => entry.exerciseId === id)!.setupSignature,
  );
  const setupTransitions = setupSignatures.slice(1).filter((signature, index) =>
    signature !== setupSignatures[index],
  ).length;
  return {
    hardValidity: "valid",
    requiredNeedCoverage: input.intent.needs.filter((entry) => entry.priority === "required" && covered.has(entry.id)).length,
    readinessBurden: readinessBurden(input, selectedIds),
    productiveAnchorContinuity: selectedIds.filter((id) =>
      input.exerciseFacts.find((entry) => entry.exerciseId === id)?.continuityClassification === "anchor",
    ).length,
    requiredPreparationCoherence: input.intent.needs.filter((entry) =>
      entry.intendedSection === "warmup" || entry.intendedSection === "activation",
    ).filter((entry) => entry.priority === "required" && covered.has(entry.id)).length,
    dominantPurposeCoverage: assignments.filter((entry) => entry.section === "main").length,
    preferredNeedCoverage: input.intent.needs.filter((entry) => entry.priority === "preferred" && covered.has(entry.id)).length,
    redundancyVerdicts: redundancy.filter((entry) => entry.verdict === "redundant").length,
    fatigueStressConcentrationFlags: concentration.length,
    optionalPositiveMarginalValue: input.intent.needs.filter((entry) => entry.priority === "optional" && covered.has(entry.id)).length,
    setupTransitionCount: setupTransitions,
    selectedIdentityCount: selectedIds.length,
    localCandidateRankSumForTieOnly: rankSum,
    deterministicTieBreak: [...selectedIds].sort().join("|"),
  };
}

function compareEvaluation(left: SessionEvaluationVector, right: SessionEvaluationVector): number {
  const leftTuple: readonly (number | string)[] = [
    left.readinessBurden,
    -left.productiveAnchorContinuity,
    -left.requiredPreparationCoherence,
    -left.dominantPurposeCoverage,
    -left.preferredNeedCoverage,
    left.redundancyVerdicts,
    left.fatigueStressConcentrationFlags,
    -left.optionalPositiveMarginalValue,
    left.setupTransitionCount,
    left.selectedIdentityCount,
    left.localCandidateRankSumForTieOnly,
    left.deterministicTieBreak,
  ];
  const rightTuple: readonly (number | string)[] = [
    right.readinessBurden,
    -right.productiveAnchorContinuity,
    -right.requiredPreparationCoherence,
    -right.dominantPurposeCoverage,
    -right.preferredNeedCoverage,
    right.redundancyVerdicts,
    right.fatigueStressConcentrationFlags,
    -right.optionalPositiveMarginalValue,
    right.setupTransitionCount,
    right.selectedIdentityCount,
    right.localCandidateRankSumForTieOnly,
    right.deterministicTieBreak,
  ];
  for (let index = 0; index < leftTuple.length; index += 1) {
    if (leftTuple[index] === rightTuple[index]) continue;
    return leftTuple[index] < rightTuple[index] ? -1 : 1;
  }
  return 0;
}

function baseSections(assignments: readonly SessionExerciseAssignment[]): readonly SessionSectionPlan[] {
  return SESSION_SECTIONS.map((section) => {
    const assignmentExerciseIds = assignments
      .filter((entry) => entry.section === section)
      .map((entry) => entry.exerciseId);
    return {
      section,
      assignmentExerciseIds,
      emptyReasonCode: assignmentExerciseIds.length === 0 ? `no_meaningful_${section}_need` : null,
    };
  });
}

function setupTrace(
  input: SessionCompositionInput,
  assignments: readonly SessionExerciseAssignment[],
): SessionSetupTransitionTrace {
  const ordered = [...assignments].sort((left, right) =>
    (sectionOrder.get(left.section) ?? 9) - (sectionOrder.get(right.section) ?? 9) ||
    left.exerciseId.localeCompare(right.exerciseId),
  );
  const setupSignatures = ordered.map((assignment) =>
    input.exerciseFacts.find((entry) => entry.exerciseId === assignment.exerciseId)!.setupSignature,
  );
  return {
    setupSignatures,
    transitionCount: setupSignatures.slice(1).filter((value, index) => value !== setupSignatures[index]).length,
    exactTimeKnown: false,
  };
}

function emptyEvaluation(): SessionEvaluationVector {
  return {
    hardValidity: "invalid",
    requiredNeedCoverage: 0,
    readinessBurden: 0,
    productiveAnchorContinuity: 0,
    requiredPreparationCoherence: 0,
    dominantPurposeCoverage: 0,
    preferredNeedCoverage: 0,
    redundancyVerdicts: 0,
    fatigueStressConcentrationFlags: 0,
    optionalPositiveMarginalValue: 0,
    setupTransitionCount: 0,
    selectedIdentityCount: 0,
    localCandidateRankSumForTieOnly: 0,
    deterministicTieBreak: "",
  };
}

function blockedSkeleton(input: SessionCompositionInput): PlannedSessionSkeleton {
  const requiredIds = input.intent.needs.filter((entry) => entry.priority === "required").map((entry) => entry.id);
  return {
    sessionIntentId: input.intent.id,
    status: "session_blocked_by_training_readiness",
    sections: baseSections([]),
    assignments: [],
    needSatisfaction: input.intent.needs.map((entry) => ({
      needId: entry.id,
      status: "blocked_by_training_readiness",
      exerciseId: null,
      reasonCodes: ["training_readiness_authority_blocks_session"],
    })),
    preparationDependencyIds: [],
    unresolvedPrescriptionRequirementIds: [],
    unresolvedReviewRequirementIds: input.trainingReadiness.unresolvedSignalIds,
    marginalValue: [],
    redundancy: [],
    potentialConcentration: [],
    setupTransitions: { setupSignatures: [], transitionCount: 0, exactTimeKnown: false },
    structuralTimeFeasibility: "unknown",
    orderingConstraints: [],
    evaluation: emptyEvaluation(),
    trace: {
      sessionReasonCodes: ["session_blocked_by_training_readiness"],
      selectedReasonCodesByExercise: {},
      excludedHighRankedCandidates: [],
      emptySectionReasonCodes: Object.fromEntries(SESSION_SECTIONS.map((section) => [section, "session_blocked"])) as Record<SessionSection, string>,
      prunedBranchReasonCodes: ["training_readiness_hard_prune"],
      coherenceReasonCodes: [],
    },
    infeasibility: {
      unsatisfiedRequiredNeedIds: requiredIds,
      candidatePoolExerciseIdsByNeed: Object.fromEntries(Object.entries(input.candidateEvidenceByNeed).map(([id, rows]) => [id, rows.map((row) => row.exerciseId)])),
      hardRejectionReasonCodes: [],
      equipmentGapIds: [],
      safetyBlockerSignalIds: input.trainingReadiness.unresolvedSignalIds,
      sessionRoleSubstitutionBlockerIds: [],
      prescriptionResolutionBlockerIds: [],
      contradictoryIntent: false,
    },
  };
}

export function runSessionComposerDesignLab(input: SessionCompositionInput): PlannedSessionSkeleton {
  if (!input.trainingReadiness.downstreamTrainingAllowed) return blockedSkeleton(input);
  const requiredNeeds = input.intent.needs.filter((entry) => entry.priority === "required");
  const contradictoryIntent = requiredNeeds.length === 0 ||
    !requiredNeeds.some((entry) => entry.intendedSection === "main");
  const allIds = [...new Set(input.intent.needs.flatMap((entry) =>
    admittedPriority(input.intent.availableMinutes, entry.priority)
      ? candidatesFor(input, entry.id).map((candidateEntry) => candidateEntry.exerciseId)
      : [],
  ))].sort();
  const feasible = combinations(allIds).flatMap((selectedIds) => {
    const covered = new Set(coveredNeedIds(input, selectedIds));
    if (!requiredNeeds.every((entry) => covered.has(entry.id))) return [];
    if (!selectedIds.every((id) => assignmentSection(input, id))) return [];
    if (!selectedIds.every((id) => indispensable(input, selectedIds, id))) return [];
    if (!selectedIds.some((id) => assignmentSection(input, id) === "main")) return [];
    return [{ selectedIds, evaluation: evaluationVector(input, selectedIds) }];
  }).sort((left, right) => compareEvaluation(left.evaluation, right.evaluation));

  if (feasible.length === 0) {
    const unsatisfied = requiredNeeds
      .filter((entry) => candidatesFor(input, entry.id).length === 0)
      .map((entry) => entry.id);
    const roleBlockers = Object.values(input.candidateEvidenceByNeed).flat()
      .filter((entry) => entry.compositionAvailability === "session_role_substitution_required")
      .flatMap((entry) => entry.unresolvedRequirementIds);
    const urgent = Object.values(input.candidateEvidenceByNeed).flat()
      .filter((entry) => entry.compositionAvailability === "urgent_external_review")
      .flatMap((entry) => entry.unresolvedRequirementIds);
    return {
      sessionIntentId: input.intent.id,
      status: "session_intent_infeasible",
      sections: baseSections([]),
      assignments: [],
      needSatisfaction: input.intent.needs.map((entry) => ({
        needId: entry.id,
        status: entry.priority === "required" ? "infeasible_candidate_pool" : `${entry.priority}_not_selected${entry.priority === "preferred" ? "_with_reason" : ""}` as NeedSatisfactionTrace["status"],
        exerciseId: null,
        reasonCodes: ["no_coherent_legal_identity_cover"],
      })),
      preparationDependencyIds: [],
      unresolvedPrescriptionRequirementIds: [],
      unresolvedReviewRequirementIds: urgent,
      marginalValue: [],
      redundancy: [],
      potentialConcentration: [],
      setupTransitions: { setupSignatures: [], transitionCount: 0, exactTimeKnown: false },
      structuralTimeFeasibility: "unknown",
      orderingConstraints: [],
      evaluation: emptyEvaluation(),
      trace: {
        sessionReasonCodes: ["session_intent_infeasible"],
        selectedReasonCodesByExercise: {},
        excludedHighRankedCandidates: [],
        emptySectionReasonCodes: Object.fromEntries(SESSION_SECTIONS.map((section) => [section, "session_infeasible"])) as Record<SessionSection, string>,
        prunedBranchReasonCodes: ["required_need_unsatisfied", "no_fallback_or_repair"],
        coherenceReasonCodes: [],
      },
      infeasibility: {
        unsatisfiedRequiredNeedIds: unsatisfied.length > 0 ? unsatisfied : requiredNeeds.map((entry) => entry.id),
        candidatePoolExerciseIdsByNeed: Object.fromEntries(Object.entries(input.candidateEvidenceByNeed).map(([id, rows]) => [id, rows.map((row) => row.exerciseId)])),
        hardRejectionReasonCodes: Object.values(input.candidateEvidenceByNeed).flatMap((rows) => rows.flatMap((row) => row.rejectionReasonCodes)),
        equipmentGapIds: Object.values(input.candidateEvidenceByNeed).flatMap((rows) => rows.flatMap((row) => row.equipmentGapIds)),
        safetyBlockerSignalIds: urgent,
        sessionRoleSubstitutionBlockerIds: roleBlockers,
        prescriptionResolutionBlockerIds: [],
        contradictoryIntent,
      },
    };
  }

  const winner = feasible[0];
  const selectedIds = winner.selectedIds;
  const assignments: readonly SessionExerciseAssignment[] = selectedIds.map((exerciseId) => {
    const satisfiedNeedIds = selectedNeedIds(input, exerciseId);
    const evidence = satisfiedNeedIds.map((needId) => bestEvidence(input, needId, exerciseId)!);
    const facts = input.exerciseFacts.find((entry) => entry.exerciseId === exerciseId)!;
    return {
      exerciseId,
      section: assignmentSection(input, exerciseId)!,
      satisfiedNeedIds,
      candidateEvidenceRefs: evidence.map((entry) => `${entry.needId}:${entry.exerciseId}:rank-${entry.candidateRank}`),
      continuityClassification: facts.continuityClassification,
      continuityReasonCodes: facts.continuityReasonCodes,
      unresolvedPrescriptionRequirementIds: evidence
        .filter((entry) => entry.compositionAvailability === "prescription_required")
        .flatMap((entry) => entry.unresolvedRequirementIds),
      unresolvedReviewRequirementIds: evidence
        .filter((entry) => entry.compositionAvailability === "candidate_review_required")
        .flatMap((entry) => entry.unresolvedRequirementIds),
      marginalValueReasonCodes: satisfiedNeedIds.map((id) => `unique_need_coverage:${id}`),
      futureSourceExposureCount: 1,
    };
  });
  const covered = new Set(coveredNeedIds(input, selectedIds));
  const needSatisfaction: readonly NeedSatisfactionTrace[] = input.intent.needs.map((entry) => {
    const assignment = assignments.find((candidateAssignment) => candidateAssignment.satisfiedNeedIds.includes(entry.id));
    if (assignment) {
      const requiresPrescription = assignment.unresolvedPrescriptionRequirementIds.length > 0;
      return {
        needId: entry.id,
        status: assignment.satisfiedNeedIds.length > 1
          ? "covered_by_shared_exercise"
          : requiresPrescription
            ? "identity_covered_requires_prescription"
            : "identity_covered",
        exerciseId: assignment.exerciseId,
        reasonCodes: requiresPrescription ? ["identity_coverage_requires_prescription"] : ["truthful_identity_coverage"],
      };
    }
    return {
      needId: entry.id,
      status: entry.priority === "preferred"
        ? "preferred_not_selected_with_reason"
        : entry.priority === "optional"
          ? "optional_not_selected"
          : "required_unsatisfied",
      exerciseId: null,
      reasonCodes: [
        admittedPriority(input.intent.availableMinutes, entry.priority)
          ? "no_positive_marginal_value"
          : "structural_time_priority_omission",
      ],
    };
  });
  const marginalValue: readonly SessionMarginalValueTrace[] = [
    ...assignments.map((assignment) => ({
      exerciseId: assignment.exerciseId,
      newlyCoveredNeedIds: assignment.satisfiedNeedIds,
      improvedPrimaryTargetNeedIds: input.intent.needs
        .filter((entry) => assignment.satisfiedNeedIds.includes(entry.id) && entry.candidateNeed.muscleRequirement === "primary_required")
        .map((entry) => entry.id),
      fulfilledDependencyIds: input.intent.needs
        .filter((entry) => assignment.satisfiedNeedIds.includes(entry.id))
        .flatMap((entry) => entry.dependencies.map((item) => item.dependencyId)),
      continuityBenefit: assignment.continuityClassification === "anchor",
      redundantNeedIds: [],
      fatigueStressFlags: [],
      setupTransitionIntroduced: false,
      verdict: "include_positive_marginal_value" as const,
    })),
    ...input.intent.needs
      .filter((entry) => entry.priority === "optional" && !covered.has(entry.id))
      .flatMap((entry) => (input.candidateEvidenceByNeed[entry.id] ?? []).map((candidateEntry) => ({
        exerciseId: candidateEntry.exerciseId,
        newlyCoveredNeedIds: [],
        improvedPrimaryTargetNeedIds: [],
        fulfilledDependencyIds: [],
        continuityBenefit: false,
        redundantNeedIds: [entry.id],
        fatigueStressFlags: [],
        setupTransitionIntroduced: true,
        verdict: "no_positive_marginal_value" as const,
      }))),
  ];
  const orderingConstraints: readonly SessionOrderingConstraint[] = input.intent.needs.flatMap((entry) => {
    const beforeAssignment = assignments.find((assignment) => assignment.satisfiedNeedIds.includes(entry.id));
    if (!beforeAssignment) return [];
    return entry.dependencies.flatMap((item) => item.targetNeedIds.flatMap((targetNeedId) => {
      const after = assignments.find((assignment) => assignment.satisfiedNeedIds.includes(targetNeedId));
      return after ? [{
        beforeExerciseId: beforeAssignment.exerciseId,
        afterExerciseId: after.exerciseId,
        dependencyIds: [item.dependencyId],
      }] : [];
    }));
  });
  const unresolvedPrescription = assignments.flatMap((entry) => entry.unresolvedPrescriptionRequirementIds);
  const unresolvedReview = assignments.flatMap((entry) => entry.unresolvedReviewRequirementIds);
  const sections = baseSections(assignments);
  const setupTransitions = setupTrace(input, assignments);
  const status = unresolvedPrescription.length > 0
    ? "session_requires_prescription_resolution"
    : "valid_session_skeleton";
  return {
    sessionIntentId: input.intent.id,
    status,
    sections,
    assignments,
    needSatisfaction,
    preparationDependencyIds: input.intent.needs.flatMap((entry) => entry.dependencies.map((item) => item.dependencyId)),
    unresolvedPrescriptionRequirementIds: unresolvedPrescription,
    unresolvedReviewRequirementIds: unresolvedReview,
    marginalValue,
    redundancy: redundancyTraces(input, selectedIds),
    potentialConcentration: concentrationTraces(input, selectedIds),
    setupTransitions,
    structuralTimeFeasibility: input.intent.availableMinutes <= 25
      ? "structurally_condensed"
      : "prescription_duration_required",
    orderingConstraints,
    evaluation: winner.evaluation,
    trace: {
      sessionReasonCodes: ["needs_first_whole_session_composition"],
      selectedReasonCodesByExercise: Object.fromEntries(assignments.map((entry) => [entry.exerciseId, entry.marginalValueReasonCodes])),
      excludedHighRankedCandidates: Object.values(input.candidateEvidenceByNeed).flat()
        .filter((entry) => entry.candidateRank === 1 && !selectedIds.includes(entry.exerciseId))
        .map((entry) => `${entry.needId}:${entry.exerciseId}`),
      emptySectionReasonCodes: Object.fromEntries(sections.map((entry) => [entry.section, entry.emptyReasonCode])) as Record<SessionSection, string | null>,
      prunedBranchReasonCodes: ["hard_invalid_pruned", "duplicate_identity_merged", "zero_marginal_value_pruned"],
      coherenceReasonCodes: ["required_needs_covered", "dominant_main_present", "no_duplicate_identity"],
    },
    infeasibility: null,
  };
}

function mainNeed(id: string, movementRole: CandidateNeed["targetMovementRoles"][number], goal: TrainingGoal = "strength"): SessionNeed {
  return need({ id, priority: "required", section: "main", role: "primary_strength", movementRoles: [movementRole], goal });
}

function scenario(input: Omit<ScenarioDefinition, "intent"> & {
  readonly kind: NeedsFirstSessionIntent["kind"];
  readonly goal: TrainingGoal;
  readonly needs: readonly SessionNeed[];
  readonly minutes?: number;
  readonly assessmentContextIds?: readonly string[];
  readonly painResponseContextIds?: readonly string[];
  readonly fatigueSignals?: NeedsFirstSessionIntent["fatigueSignals"];
  readonly productiveIds?: readonly string[];
}): ScenarioDefinition {
  return {
    ...input,
    intent: intent(input),
  };
}

const push = mainNeed("main-push", "horizontal_push");
const pull = mainNeed("main-pull", "horizontal_pull");

export const CONTROLLED_SESSION_SCENARIOS: readonly ScenarioDefinition[] = [
  scenario({
    id: "full-gym-upper-strength",
    description: "Required push/pull plus shared direct-chest preferred coverage.",
    kind: "strength", goal: "strength", needs: [
      push, pull,
      need({ id: "direct-chest", priority: "preferred", section: "main", role: "primary_strength", muscles: ["chest"], muscleRequirement: "primary_required" }),
    ],
    candidates: {
      "main-push": [candidate("main-push", "dumbbell-bench-press", 1, 9), candidate("main-push", "machine-chest-press", 2, 8.8)],
      "main-pull": [candidate("main-pull", "machine-row", 1, 9), candidate("main-pull", "chest-supported-dumbbell-row", 2, 8.8)],
      "direct-chest": [candidate("direct-chest", "dumbbell-bench-press", 1, 9), candidate("direct-chest", "cable-chest-fly", 2, 8.5)],
    },
    facts: [compositionFacts("dumbbell-bench-press"), compositionFacts("machine-chest-press"), compositionFacts("machine-row"), compositionFacts("chest-supported-dumbbell-row"), compositionFacts("cable-chest-fly")],
    expectedSelectedIds: ["chest-supported-dumbbell-row", "dumbbell-bench-press"],
  }),
  scenario({
    id: "full-gym-upper-hypertrophy",
    description: "Shared anchors plus direct side-delt, biceps, and triceps structure.",
    kind: "hypertrophy", goal: "hypertrophy", minutes: 70, needs: [
      mainNeed("main-push", "horizontal_push", "hypertrophy"), mainNeed("main-pull", "horizontal_pull", "hypertrophy"),
      need({ id: "side-delts", priority: "preferred", section: "accessory", role: "hypertrophy_accessory", muscles: ["side_delts"], muscleRequirement: "primary_required", goal: "hypertrophy", source: "direct_muscle_priority" }),
      need({ id: "biceps", priority: "preferred", section: "accessory", role: "hypertrophy_accessory", muscles: ["biceps"], muscleRequirement: "primary_required", goal: "hypertrophy", source: "direct_muscle_priority" }),
      need({ id: "triceps", priority: "optional", section: "accessory", role: "hypertrophy_accessory", muscles: ["triceps"], muscleRequirement: "primary_required", goal: "hypertrophy", source: "direct_muscle_priority" }),
    ],
    candidates: {
      "main-push": [candidate("main-push", "dumbbell-bench-press", 1, 9)],
      "main-pull": [candidate("main-pull", "machine-row", 1, 9)],
      "side-delts": [candidate("side-delts", "dumbbell-lateral-raise", 1, 9)],
      biceps: [candidate("biceps", "dumbbell-curl", 1, 9)],
      triceps: [candidate("triceps", "cable-triceps-pressdown", 1, 9)],
    },
    facts: ["dumbbell-bench-press", "machine-row", "dumbbell-lateral-raise", "dumbbell-curl", "cable-triceps-pressdown"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["cable-triceps-pressdown", "dumbbell-bench-press", "dumbbell-curl", "dumbbell-lateral-raise", "machine-row"],
  }),
  scenario({
    id: "lower-strength",
    description: "Knee-dominant and hinge anchors with concentration audit.",
    kind: "strength", goal: "strength", needs: [mainNeed("squat", "squat"), mainNeed("hinge", "hinge")],
    candidates: {
      squat: [candidate("squat", "goblet-squat", 1, 9), candidate("squat", "leg-press", 2, 8.8)],
      hinge: [candidate("hinge", "dumbbell-romanian-deadlift", 1, 9), candidate("hinge", "cable-pull-through", 2, 8.8)],
    },
    facts: ["goblet-squat", "leg-press", "dumbbell-romanian-deadlift", "cable-pull-through"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["dumbbell-romanian-deadlift", "goblet-squat"],
  }),
  scenario({
    id: "full-body-general-fitness",
    description: "Smallest coherent squat, push, pull, and trunk coverage.",
    kind: "general_fitness", goal: "general_fitness", needs: [
      mainNeed("squat", "squat", "general_fitness"), mainNeed("push", "horizontal_push", "general_fitness"),
      mainNeed("pull", "horizontal_pull", "general_fitness"),
      need({ id: "trunk", priority: "required", section: "main", role: "secondary_strength", movementRoles: ["anti_extension_core"], goal: "general_fitness" }),
    ],
    candidates: {
      squat: [candidate("squat", "goblet-squat", 1, 9)], push: [candidate("push", "push-up", 1, 9)],
      pull: [candidate("pull", "machine-row", 1, 9)], trunk: [candidate("trunk", "dead-bug", 1, 9), candidate("trunk", "push-up", 2, 8.5)],
    },
    facts: ["goblet-squat", "push-up", "machine-row", "dead-bug"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["goblet-squat", "machine-row", "push-up"],
  }),
  scenario({
    id: "posture-movement-quality",
    description: "Productive push/pull plus one explicit assessment-linked preparation dependency.",
    kind: "posture_and_movement_quality", goal: "posture_and_movement_quality", assessmentContextIds: ["scapular-control-priority"], needs: [
      mainNeed("main-push", "horizontal_push", "posture_and_movement_quality"), mainNeed("main-pull", "horizontal_pull", "posture_and_movement_quality"),
      need({ id: "scapular-prep", priority: "required", section: "activation", role: "activation", movementRoles: ["scapular_control"], source: "assessment_priority", dependencies: [dependency({ id: "scapular-prepares-push", targetNeedIds: ["main-push"], assessmentSignalIds: ["scapular-control-priority"] })] }),
    ],
    candidates: {
      "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "main-pull": [candidate("main-pull", "machine-row", 1, 9)],
      "scapular-prep": [candidate("scapular-prep", "serratus-wall-slide", 1, 9), candidate("scapular-prep", "band-face-pull", 2, 8.5)],
    },
    facts: ["machine-chest-press", "machine-row", "serratus-wall-slide", "band-face-pull"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["machine-chest-press", "machine-row", "serratus-wall-slide"],
  }),
  scenario({
    id: "shoulder-discomfort",
    description: "Pressing remains productive but exposes prescription resolution; no corrective circuit.",
    kind: "pain_aware_return", goal: "pain_aware_return", painResponseContextIds: ["shoulder-horizontal-pressing"], needs: [push, pull],
    candidates: {
      "main-push": [candidate("main-push", "machine-chest-press", 1, 9, "REQUIRES_PRESCRIPTION")],
      "main-pull": [candidate("main-pull", "machine-row", 1, 9)],
    },
    facts: [compositionFacts("machine-chest-press"), compositionFacts("machine-row")],
    expectedSelectedIds: ["machine-chest-press", "machine-row"], expectedStatus: "session_requires_prescription_resolution",
  }),
  scenario({
    id: "low-back-sensitivity",
    description: "Support and stress truth avoid needless lumbar concentration.",
    kind: "pain_aware_return", goal: "pain_aware_return", painResponseContextIds: ["low-back-loaded-hinge"], needs: [mainNeed("main-pull", "horizontal_pull", "pain_aware_return"), need({ id: "hinge", priority: "required", section: "accessory", role: "secondary_strength", movementRoles: ["hinge"], goal: "pain_aware_return" })],
    candidates: {
      "main-pull": [candidate("main-pull", "one-arm-dumbbell-row", 1, 9, "REQUIRES_CANDIDATE_REVIEW"), candidate("main-pull", "chest-supported-dumbbell-row", 2, 8.8)],
      hinge: [candidate("hinge", "dumbbell-romanian-deadlift", 1, 9, "REQUIRES_CANDIDATE_REVIEW"), candidate("hinge", "cable-pull-through", 2, 8.8)],
    },
    facts: ["one-arm-dumbbell-row", "chest-supported-dumbbell-row", "dumbbell-romanian-deadlift", "cable-pull-through"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["cable-pull-through", "chest-supported-dumbbell-row"],
  }),
  scenario({
    id: "knee-discomfort",
    description: "Relevant reviewed stress creates prescription resolution without region-only inference.",
    kind: "pain_aware_return", goal: "pain_aware_return", painResponseContextIds: ["knee-loaded-flexion"], needs: [mainNeed("squat", "knee_dominant", "pain_aware_return")],
    candidates: { squat: [candidate("squat", "leg-press", 1, 9, "REQUIRES_PRESCRIPTION"), candidate("squat", "goblet-squat", 2, 8.8, "REQUIRES_CANDIDATE_REVIEW")] },
    facts: [compositionFacts("leg-press"), compositionFacts("goblet-squat")],
    expectedSelectedIds: ["leg-press"], expectedStatus: "session_requires_prescription_resolution",
  }),
  scenario({
    id: "grip-sensitive-user",
    description: "Preserves pull purpose while avoiding unnecessary carry/grip concentration.",
    kind: "strength", goal: "strength", painResponseContextIds: ["grip-sensitive"], needs: [push, pull],
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "main-pull": [candidate("main-pull", "machine-row", 1, 9), candidate("main-pull", "one-arm-dumbbell-row", 2, 8.8)] },
    facts: [compositionFacts("machine-chest-press"), compositionFacts("machine-row", { gripPotential: "low" }), compositionFacts("one-arm-dumbbell-row", { gripPotential: "high" })],
    expectedSelectedIds: ["machine-chest-press", "machine-row"],
  }),
  scenario({
    id: "productive-continuity",
    description: "A productive legal anchor survives close higher-ranked alternatives.",
    kind: "strength", goal: "strength", productiveIds: ["machine-chest-press", "machine-row"], needs: [push, pull],
    candidates: { "main-push": [candidate("main-push", "dumbbell-bench-press", 1, 9), candidate("main-push", "machine-chest-press", 2, 8.9)], "main-pull": [candidate("main-pull", "chest-supported-dumbbell-row", 1, 9), candidate("main-pull", "machine-row", 2, 8.9)] },
    facts: [compositionFacts("dumbbell-bench-press"), compositionFacts("machine-chest-press", { continuityClassification: "anchor", continuityReasonCodes: ["productive_legal_anchor"] }), compositionFacts("chest-supported-dumbbell-row"), compositionFacts("machine-row", { continuityClassification: "anchor", continuityReasonCodes: ["productive_legal_anchor"] })],
    expectedSelectedIds: ["machine-chest-press", "machine-row"],
  }),
  scenario({
    id: "adverse-response",
    description: "One adverse realization routes to prescription review before replacement.",
    kind: "pain_aware_return", goal: "pain_aware_return", productiveIds: ["machine-chest-press"], painResponseContextIds: ["single-adverse-machine-press-realization"], needs: [push, pull],
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9, "REQUIRES_PRESCRIPTION"), candidate("main-push", "dumbbell-bench-press", 2, 8.8)], "main-pull": [candidate("main-pull", "machine-row", 1, 9)] },
    facts: [compositionFacts("machine-chest-press", { continuityClassification: "anchor", continuityReasonCodes: ["prescription_review_before_replacement"] }), compositionFacts("dumbbell-bench-press"), compositionFacts("machine-row")],
    expectedSelectedIds: ["machine-chest-press", "machine-row"], expectedStatus: "session_requires_prescription_resolution",
  }),
  scenario({
    id: "time-constrained",
    description: "25-minute availability preserves required anchors and removes preferred/optional work structurally.",
    kind: "strength", goal: "strength", minutes: 25, needs: [push, pull,
      need({ id: "triceps", priority: "preferred", section: "accessory", role: "hypertrophy_accessory", muscles: ["triceps"], muscleRequirement: "primary_required" }),
      need({ id: "cooldown", priority: "optional", section: "cooldown", role: "recovery", movementRoles: ["breathing_position"], source: "recovery_requirement" }),
    ],
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "main-pull": [candidate("main-pull", "machine-row", 1, 9)], triceps: [candidate("triceps", "cable-triceps-pressdown", 1, 9)], cooldown: [candidate("cooldown", "ninety-ninety-breathing", 1, 9)] },
    facts: ["machine-chest-press", "machine-row", "cable-triceps-pressdown", "ninety-ninety-breathing"].map((id) => compositionFacts(id)),
    expectedSelectedIds: ["machine-chest-press", "machine-row"],
  }),
  scenario({
    id: "home-equipment",
    description: "Only explicit home-legal candidates; preferred vertical-pull thin pool remains visible.",
    kind: "general_fitness", goal: "general_fitness", needs: [mainNeed("push", "horizontal_push", "general_fitness"), need({ id: "pull", priority: "required", section: "accessory", role: "secondary_strength", movementRoles: ["horizontal_pull"], goal: "general_fitness" }), need({ id: "vertical-pull", priority: "preferred", section: "accessory", role: "secondary_strength", movementRoles: ["vertical_pull"], goal: "general_fitness" })],
    candidates: { push: [candidate("push", "push-up", 1, 9)], pull: [candidate("pull", "band-row", 1, 9)], "vertical-pull": [] },
    facts: [compositionFacts("push-up"), compositionFacts("band-row")],
    expectedSelectedIds: ["band-row", "push-up"],
  }),
  scenario({
    id: "p0-direct-need",
    description: "One matching P0 direct calf need includes only Standing Calf Raise.",
    kind: "hypertrophy", goal: "hypertrophy", needs: [mainNeed("main-push", "horizontal_push", "hypertrophy"), need({ id: "direct-calves", priority: "required", section: "accessory", role: "hypertrophy_accessory", actionFunctions: ["ankle_plantar_flexion"], muscles: ["calves"], muscleRequirement: "primary_required", source: "direct_muscle_priority", goal: "hypertrophy" })],
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "direct-calves": [candidate("direct-calves", "standing-calf-raise", 1, 9)] },
    facts: [compositionFacts("machine-chest-press"), compositionFacts("standing-calf-raise")],
    expectedSelectedIds: ["machine-chest-press", "standing-calf-raise"],
  }),
  scenario({
    id: "training-safety-blocked",
    description: "TrainingSafety blocks an executable skeleton without reranking.",
    kind: "strength", goal: "strength", needs: [push, pull], readiness: BLOCKED_READINESS,
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "main-pull": [candidate("main-pull", "machine-row", 1, 9)] },
    facts: [compositionFacts("machine-chest-press"), compositionFacts("machine-row")],
    expectedSelectedIds: [], expectedStatus: "session_blocked_by_training_readiness",
  }),
  scenario({
    id: "no-cooldown-need",
    description: "A legal empty cooldown section contains no filler.",
    kind: "strength", goal: "strength", needs: [push, pull],
    candidates: { "main-push": [candidate("main-push", "machine-chest-press", 1, 9)], "main-pull": [candidate("main-pull", "machine-row", 1, 9)] },
    facts: [compositionFacts("machine-chest-press"), compositionFacts("machine-row"), compositionFacts("ninety-ninety-breathing")],
    expectedSelectedIds: ["machine-chest-press", "machine-row"],
  }),
] as const;

export interface GreedyFailureCase {
  readonly id: string;
  readonly greedyFailure: string;
  readonly coherentPolicy: string;
  readonly result: "WHOLE_SESSION_MODEL_BETTER";
}

export const GREEDY_FAILURE_MATRIX: readonly GreedyFailureCase[] = [
  { id: "duplicate-identity", greedyFailure: "Bench press selected independently for push and chest.", coherentPolicy: "Merge one identity and map both need IDs.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "redundant-pressing", greedyFailure: "Bench press and machine press duplicate one short-session push purpose.", coherentPolicy: "Retain one coherent press unless a distinct need exists.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "excessive-grip", greedyFailure: "Top pull plus carry concentrates grip potential.", coherentPolicy: "Preserve pull purpose and omit zero-value grip concentration.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "unnecessary-preparation", greedyFailure: "Every legal preparation pool contributes a top candidate.", coherentPolicy: "Require explicit dependency evidence.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "optional-accessory-bloat", greedyFailure: "Top candidate fills every optional accessory need.", coherentPolicy: "Require positive unique marginal value and structural availability admission.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "poor-anchor-continuity", greedyFailure: "A marginal rank lead displaces productive main work.", coherentPolicy: "Retain productive legal anchor before local rank tie evidence.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "equipment-churn", greedyFailure: "Independent winners traverse floor, cable, dumbbell, and machine setups.", coherentPolicy: "Use setup transitions only after stronger coverage/readiness/continuity dimensions.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "disconnected-cooldown", greedyFailure: "A cooldown is selected because its isolated pool exists.", coherentPolicy: "Leave cooldown empty without an explicit recovery need.", result: "WHOLE_SESSION_MODEL_BETTER" },
  { id: "worse-combination", greedyFailure: "Highest local totals produce poorer preparation, redundancy, and concentration interaction.", coherentPolicy: "Evaluate complete non-prescribed skeletons lexicographically.", result: "WHOLE_SESSION_MODEL_BETTER" },
] as const;

export interface OptimizerConsequenceComparison {
  readonly approach: "strict_lexicographic" | "pareto_non_dominated" | "bounded_weighted" | "greedy_per_need";
  readonly controlledLabConsequence: string;
  readonly designDisposition: string;
}

export const OPTIMIZER_CONSEQUENCE_COMPARISON: readonly OptimizerConsequenceComparison[] = [
  {
    approach: "strict_lexicographic",
    controlledLabConsequence: "Preserves hard validity and ordered policy precedence with deterministic complete-skeleton ties.",
    designDisposition: "RECOMMENDED_EVALUATION_MODEL_PENDING_OWNER_APPROVAL",
  },
  {
    approach: "pareto_non_dominated",
    controlledLabConsequence: "Keeps visible trade-off alternatives without silently converting policy dimensions into coefficients.",
    designDisposition: "RECOMMENDED_FOR_REVIEW_AND_FUTURE_SEARCH_PRUNING",
  },
  {
    approach: "bounded_weighted",
    controlledLabConsequence: "Can reverse owner policy through unapproved coefficients even when every candidate score is locally valid.",
    designDisposition: "CONTRAST_ONLY_NOT_APPROVED",
  },
  {
    approach: "greedy_per_need",
    controlledLabConsequence: "Fails all nine controlled interaction cases because it cannot evaluate the complete session skeleton.",
    designDisposition: "REJECTED_AS_COMPOSER_ARCHITECTURE",
  },
] as const;

export function runGreedyBaseline(input: SessionCompositionInput): readonly string[] {
  return input.intent.needs
    .filter((entry) => admittedPriority(input.intent.availableMinutes, entry.priority))
    .flatMap((entry) => (input.candidateEvidenceByNeed[entry.id] ?? [])
      .filter((candidateEntry) => candidateEntry.legal)
      .sort((left, right) => left.candidateRank - right.candidateRank || left.exerciseId.localeCompare(right.exerciseId))
      .slice(0, 1)
      .map((candidateEntry) => candidateEntry.exerciseId));
}

export const AVAILABILITY_LAB = [25, 45, 70].map((minutes) => {
  const source = CONTROLLED_SESSION_SCENARIOS.find((entry) => entry.id === "time-constrained")!;
  const changed: ScenarioDefinition = {
    ...source,
    id: `availability-${minutes}`,
    intent: { ...source.intent, id: `availability-${minutes}-intent`, availableMinutes: minutes },
    expectedSelectedIds: minutes === 25
      ? ["machine-chest-press", "machine-row"]
      : minutes === 45
        ? ["cable-triceps-pressdown", "machine-chest-press", "machine-row"]
        : ["cable-triceps-pressdown", "machine-chest-press", "machine-row", "ninety-ninety-breathing"],
  };
  return { minutes, input: inputFromScenario(changed), result: runSessionComposerDesignLab(inputFromScenario(changed)) };
});

export type FixedShellOutcomeClassification =
  | "MATERIAL_SESSION_DIFFERENCE"
  | "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR"
  | "PRESCRIPTION_DIFFERENCE_REQUIRED"
  | "JUSTIFIED_CONVERGENCE"
  | "UPSTREAM_WEEK_INTENT_REQUIRED"
  | "UNRESPONSIVE_TO_MATERIAL_USER_INPUT"
  | "THIN_POOL_LIMITATION"
  | "UNEXPECTED_CROSS_DOMAIN_EFFECT";

export const FIXED_SHELL_SESSION_COHORT: readonly (readonly [string, FixedShellOutcomeClassification])[] = [
  ["strength-goal", "JUSTIFIED_CONVERGENCE"],
  ["hypertrophy-goal", "MATERIAL_SESSION_DIFFERENCE"],
  ["posture-goal", "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR"],
  ["shoulder-discomfort", "PRESCRIPTION_DIFFERENCE_REQUIRED"],
  ["low-back-sensitivity", "MATERIAL_SESSION_DIFFERENCE"],
  ["assessment-priority", "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR"],
  ["productive-continuity", "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR"],
  ["adverse-response", "PRESCRIPTION_DIFFERENCE_REQUIRED"],
  ["explicit-preference", "JUSTIFIED_CONVERGENCE"],
  ["short-availability", "MATERIAL_SESSION_DIFFERENCE"],
  ["high-fatigue", "PRESCRIPTION_DIFFERENCE_REQUIRED"],
] as const;

const COHORT_SHARED_SHELL = {
  experience: "intermediate",
  equipment: "full_gym",
  phase: "phase_1",
  evaluationAsOf: SESSION_COMPOSER_LAB_AS_OF,
  catalogFingerprint: "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
};

export const CURRENT_SEAM_AUDIT = [
  ["SessionIntent.id", "KEEP_AS_AUTHORITATIVE_INPUT"], ["SessionIntent.phaseIntent", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["SessionIntent.primaryPurpose", "KEEP_AS_AUTHORITATIVE_INPUT"], ["SessionIntent.priorityMuscles", "DERIVE_FROM_SESSION_NEEDS"],
  ["SessionIntent.priorityMovementRoles", "DERIVE_FROM_SESSION_NEEDS"], ["SessionIntent.assessmentPriorityIds", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["SessionIntent.assessmentPriorityLevel", "TRACE_ONLY"], ["SessionIntent.relevantPainConstraintIds", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["SessionIntent.fatigueConsiderations", "KEEP_AS_AUTHORITATIVE_INPUT"], ["SessionIntent.slots", "LEGACY_PLACEHOLDER"],
  ["SessionIntent.preparationDependencies", "DOMAIN_CHANGE_REQUIRED"], ["TrainingSlot.id", "LEGACY_PLACEHOLDER"],
  ["TrainingSlot.section", "MOVE_TO_COMPOSITION_OUTPUT"], ["TrainingSlot.role", "DERIVE_FROM_SESSION_NEEDS"],
  ["TrainingSlot.targetMovementRoles", "DERIVE_FROM_SESSION_NEEDS"], ["TrainingSlot.targetMuscles", "DERIVE_FROM_SESSION_NEEDS"],
  ["TrainingSlot.optional", "DOMAIN_CHANGE_REQUIRED"], ["TrainingSlot.preparationDependencyIds", "DOMAIN_CHANGE_REQUIRED"],
  ["PreparationDependency.id", "KEEP_AS_AUTHORITATIVE_INPUT"], ["PreparationDependency.fromSection", "MOVE_TO_COMPOSITION_OUTPUT"],
  ["PreparationDependency.preparesForSections", "LEGACY_PLACEHOLDER"], ["PreparationDependency.preparesForExerciseIds", "MOVE_TO_COMPOSITION_OUTPUT"],
  ["PreparationDependency.movementRoles", "KEEP_AS_AUTHORITATIVE_INPUT"], ["PreparationDependency.bodyRegions", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["PreparationDependency.assessmentSignalIds", "KEEP_AS_AUTHORITATIVE_INPUT"], ["PreparationDependency.jointRangeNeeds", "DOMAIN_CHANGE_REQUIRED"],
  ["PreparationDependency.sessionIntentId", "KEEP_AS_AUTHORITATIVE_INPUT"], ["PreparationDependency.explanation", "TRACE_ONLY"],
  ["WeeklyIntent.id", "DEFER_TO_WEEK_COMPOSER"], ["WeeklyIntent.phaseIntent", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["WeeklyIntent.primaryGoal", "DEFER_TO_WEEK_COMPOSER"], ["WeeklyIntent.sessionsPerWeek", "DEFER_TO_WEEK_COMPOSER"],
  ["WeeklyIntent.movementExposure", "DEFER_TO_WEEK_COMPOSER"], ["WeeklyIntent.muscleExposure", "DEFER_TO_WEEK_COMPOSER"],
  ["WeeklyIntent.priorityExposure", "DEFER_TO_WEEK_COMPOSER"], ["WeeklyIntent.recoverySpacing", "DEFER_TO_WEEK_COMPOSER"],
  ["WeeklyIntent.volumeIntent", "DEFER_TO_WEEK_COMPOSER"], ["WeeklyIntent.phaseObjective", "DEFER_TO_WEEK_COMPOSER"],
  ["PlannedExercise.exerciseId", "MOVE_TO_COMPOSITION_OUTPUT"], ["PlannedExercise.slotId", "DOMAIN_CHANGE_REQUIRED"],
  ["PlannedSession.sessionIntent", "KEEP_AS_AUTHORITATIVE_INPUT"], ["PlannedSession.plannedExercises", "DOMAIN_CHANGE_REQUIRED"],
  ["CandidateNeed.id", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateNeed.whyNeeded", "TRACE_ONLY"],
  ["CandidateNeed.requestedRole", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateNeed.requestedSection", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateNeed.targetMovementRoles", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateNeed.targetActionFunctions", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateNeed.targetMuscles", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateNeed.muscleRequirement", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateNeed.targetBodyRegions", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateNeed.goal", "LEGACY_PLACEHOLDER"],
  ["CandidateRequest.id", "TRACE_ONLY"], ["CandidateRequest.evaluationContext", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.athlete", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.goal", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.phase", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.need", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.sessionIntent", "LEGACY_PLACEHOLDER"], ["CandidateRequest.assessment", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.alignmentPriorities", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.painAndInjury", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.trainingSafety", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.equipment", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.history", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.continuity", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.candidatePool", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.satisfiedPrerequisiteIds", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRequest.fatigueSignals", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRequest.notes", "TRACE_ONLY"],
  ["CandidateRankingResult.request", "TRACE_ONLY"], ["CandidateRankingResult.interpretedContext", "TRACE_ONLY"],
  ["CandidateRankingResult.hardRejectedCandidates", "TRACE_ONLY"], ["CandidateRankingResult.legalCandidateCount", "TRACE_ONLY"],
  ["CandidateRankingResult.rankedCandidates", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRankingResult.painExecutionReadiness", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidateRankingResult.trainingReadiness", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidateRankingResult.assessmentInfluence", "TRACE_ONLY"],
  ["CandidateRankingResult.alignmentPriorities", "TRACE_ONLY"], ["CandidateRankingResult.decisionTrace", "TRACE_ONLY"],
  ["CandidateRankingResult.pipeline", "TRACE_ONLY"], ["TrainingReadinessTrace.status", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingReadinessTrace.downstreamTrainingAllowed", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingReadinessTrace.reviewRequiredFirst", "TRACE_ONLY"],
  ["TrainingReadinessTrace.urgentExternalReviewRequired", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingReadinessTrace.unresolvedSignalIds", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingReadinessTrace.externallyResolvedSignalIds", "TRACE_ONLY"], ["TrainingReadinessTrace.evidence", "TRACE_ONLY"],
  ["TrainingReadinessTrace.reason", "TRACE_ONLY"], ["CandidatePainExecutionReadinessTrace.candidateExerciseId", "TRACE_ONLY"],
  ["CandidatePainExecutionReadinessTrace.readiness", "KEEP_AS_AUTHORITATIVE_INPUT"], ["CandidatePainExecutionReadinessTrace.applicableRequirements", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidatePainExecutionReadinessTrace.ignoredNotApplicableRequirements", "TRACE_ONLY"], ["CandidatePainExecutionReadinessTrace.urgencySignals", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["CandidatePainExecutionReadinessTrace.reason", "TRACE_ONLY"], ["TrainingResponseReceiverTrace.asOf", "TRACE_ONLY"],
  ["TrainingResponseReceiverTrace.exerciseId", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingResponseReceiverTrace.prescriptionId", "DEFER_TO_PRESCRIPTION"],
  ["TrainingResponseReceiverTrace.performanceRecordId", "TRACE_ONLY"], ["TrainingResponseReceiverTrace.classifications", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingResponseReceiverTrace.nextOwner", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingResponseReceiverTrace.continuityRecommendation", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingResponseReceiverTrace.exactRealizationEvidence", "TRACE_ONLY"], ["TrainingResponseReceiverTrace.relatedRealizationEvidence", "TRACE_ONLY"],
  ["TrainingResponseReceiverTrace.exerciseIdentityHistory", "TRACE_ONLY"], ["TrainingResponseReceiverTrace.latestExactResponse", "TRACE_ONLY"],
  ["TrainingResponseReceiverTrace.adverseHistory", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingResponseReceiverTrace.successfulReExposure", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingResponseReceiverTrace.mixedOrConflictingExactEvidence", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingResponseReceiverTrace.unknownExactEvidence", "KEEP_AS_AUTHORITATIVE_INPUT"],
  ["TrainingResponseReceiverTrace.prescriptionReviewPrecedesReplacement", "KEEP_AS_AUTHORITATIVE_INPUT"], ["TrainingResponseReceiverTrace.automaticPrescriptionChange", "DEFER_TO_PRESCRIPTION"],
  ["TrainingResponseReceiverTrace.automaticProgressionDecision", "TRACE_ONLY"], ["TrainingResponseReceiverTrace.automaticExerciseReplacement", "TRACE_ONLY"],
  ["TrainingResponseReceiverTrace.reason", "TRACE_ONLY"], ["ExercisePrescription.prescriptionId", "DEFER_TO_PRESCRIPTION"],
  ["ExercisePrescription.sourceExposureEventId", "DEFER_TO_PRESCRIPTION"], ["ExercisePrescription.exerciseId", "DEFER_TO_PRESCRIPTION"],
  ["ExercisePrescription.phaseId", "DEFER_TO_PRESCRIPTION"], ["ExercisePrescription.createdAt", "DEFER_TO_PRESCRIPTION"],
  ["ExercisePrescription.dose", "DEFER_TO_PRESCRIPTION"], ["ExercisePrescription.executionStandard", "DEFER_TO_PRESCRIPTION"],
  ["ExercisePrescription.rationale", "DEFER_TO_PRESCRIPTION"], ["ExercisePrescription.intendedProgressionAxes", "TRACE_ONLY"],
  ["ExercisePrescription.provenance", "DEFER_TO_PRESCRIPTION"],
] as const;

export const DESIGN_AREA_CLASSIFICATIONS = [
  ["needs-first intent", "DESIGN_READY"], ["Candidate Intelligence seam", "CANDIDATE_INTELLIGENCE_DEPENDENCY_COMPLETE"],
  ["section assignment", "DESIGN_READY"], ["exact within-section order", "DEFER_TO_SEQUENCE"],
  ["dose and duration", "DEFER_TO_PRESCRIPTION"], ["weekly volume/frequency", "DEFER_TO_WEEK_COMPOSER"],
  ["response-led replacement", "DEFER_TO_LONGITUDINAL_ADAPTATION"], ["production optimizer choice", "OWNER_POLICY_REQUIRED"],
  ["authoritative domain migration", "DOMAIN_CHANGE_REQUIRED"], ["UI/Knowledge/Library", "OUT_OF_SCOPE"],
] as const;

export function buildSessionComposerDesignLabData() {
  const scenarios = CONTROLLED_SESSION_SCENARIOS.map((definition) => {
    const compositionInput = inputFromScenario(definition);
    const result = runSessionComposerDesignLab(compositionInput);
    return {
      id: definition.id,
      description: definition.description,
      expectedSelectedIds: definition.expectedSelectedIds,
      expectedStatus: definition.expectedStatus ?? "valid_session_skeleton",
      greedyIds: runGreedyBaseline(compositionInput),
      result,
    };
  });
  const production = buildCurrentTrunkCurationFingerprints();
  const p0 = buildP0WholeBodyProductionData();
  const cohort = FIXED_SHELL_SESSION_COHORT.map(([factor, classification]) => ({
    factor,
    classification,
    sharedShell: COHORT_SHARED_SHELL,
    signaturesCompared: [
      "sessionIntent", "needs", "legalCandidatePools", "selectedIdentities", "sectionAssignments",
      "multiNeedCoverage", "preparation", "continuity", "unresolvedPrescription", "marginalValue", "sessionEvaluation",
    ],
  }));
  const fingerprintPayloads = {
    currentSessionSeamAudit: CURRENT_SEAM_AUDIT,
    proposedSessionNeedContract: ["sourceEvidence", "priority", "intendedSection", "candidateNeed", "dependencies", "prescriptionResolutionExpected", "reasonCode", "explanation"],
    proposedSessionIntentContract: ["id", "kind", "phaseId", "primaryGoal", "needs", "availableMinutes", "contextRefs", "fatigue", "continuity", "sourceTrace"],
    proposedCompositionOutput: ["sections", "assignments", "needSatisfaction", "continuity", "dependencies", "downstreamRequirements", "evaluation", "trace", "infeasibility"],
    hardValidityPolicy: ["readiness", "candidateLegality", "sectionRoleLegality", "uniqueIdentity", "requiredCoverage", "dependencies", "substitution", "blocks", "equipment", "canonicalCatalog", "noProse", "determinism"],
    lexicographicEvaluationVector: ["hardValidity", "requiredCoverage", "readiness", "continuity", "preparation", "dominantPurpose", "preferredCoverage", "redundancy", "concentration", "optionalMarginalValue", "structuralEfficiency", "tieBreak"],
    marginalValuePolicy: ["uniqueNeed", "primaryTarget", "dependency", "accommodation", "continuity", "redundancy", "fatigue", "stress", "setup", "NO_POSITIVE_MARGINAL_VALUE"],
    redundancyPolicy: ["identity", "movement", "action", "primaryMuscle", "family", "support", "path", "fatigue", "stress", "sectionPurpose", "noNameOrProse"],
    continuityPolicy: ["keepProductiveLegalAnchor", "prescriptionLater", "temporarySubstitution", "replacementWithEvidence", "noScoreGapThreshold"],
    dependencyModel: ["needIds", "exerciseIds", "movementRoles", "actions", "regions", "assessment", "range", "painResponse"],
    timeBudgetOwnership: ["availabilityMinutes", "structuralFeasibility", "prescriptionDurationRequired", "noMinuteEstimates"],
    searchComparison: OPTIMIZER_CONSEQUENCE_COMPARISON,
    greedyFailureMatrix: GREEDY_FAILURE_MATRIX,
    fixedShellPersonalizationMatrix: cohort,
    controlledSessionScenarios: scenarios,
    implementationReadinessReview: { overall: SESSION_COMPOSER_OVERALL_CLASSIFICATION, areas: DESIGN_AREA_CLASSIFICATIONS },
  };
  const fingerprints: Readonly<Record<string, string>> = Object.fromEntries(
    Object.entries(fingerprintPayloads).map(([key, value]) => [key, hash(value)]),
  );
  const combinedSessionComposerDesign = hash(fingerprints);
  return {
    overallClassification: SESSION_COMPOSER_OVERALL_CLASSIFICATION,
    exactNextDependency: SESSION_COMPOSER_EXACT_NEXT_DEPENDENCY,
    scenarios,
    availability: AVAILABILITY_LAB,
    cohort,
    greedyFailures: GREEDY_FAILURE_MATRIX,
    designAreaClassifications: DESIGN_AREA_CLASSIFICATIONS,
    fingerprints: { ...fingerprints, combinedSessionComposerDesign },
    productionFingerprints: {
      ranking: production.productionRanking,
      comprehensive: production.comprehensiveBehavior,
      catalog: production.referenceCatalog,
      knowledgeCompatibility: p0.fingerprints.knowledgeCompatibility,
    },
    counts: {
      controlledScenarios: scenarios.length,
      fixedShellUsers: cohort.length,
      materialSessionDifferences: cohort.filter((entry) => entry.classification === "MATERIAL_SESSION_DIFFERENCE").length,
      sameAnchorPersonalized: cohort.filter((entry) => entry.classification === "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR").length,
      justifiedConvergence: cohort.filter((entry) => entry.classification === "JUSTIFIED_CONVERGENCE").length,
      unresponsiveMaterialInputFailures: cohort.filter((entry) => entry.classification === "UNRESPONSIVE_TO_MATERIAL_USER_INPUT").length,
      greedyFailureCases: GREEDY_FAILURE_MATRIX.length,
    },
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
  ].join("\n");
}

function fingerprintLine(key: string, value: string): string {
  return `- ${key}: \`${value}\``;
}

export function renderRequiredSessionComposerArtifacts() {
  const data = buildSessionComposerDesignLabData();
  const fp: Readonly<Record<string, string>> = data.fingerprints;
  const fingerprints = Object.entries(data.fingerprints).map(([key, value]) => fingerprintLine(key, value)).join("\n");
  const seam = [
    "# Session Composer Current Seam Audit", "",
    "The current production domain is a useful foundation seam, not an authoritative Composer model. `SessionIntent.slots` encourages fixed exercise-count templates because each slot already implies one exercise-shaped vacancy. `PlannedExercise { exerciseId, slotId }` cannot represent multi-need coverage, section ownership independent of a slot, continuity, candidate evidence, unresolved prescription/review requirements, dependencies, marginal value, excluded high-ranked candidates, or whole-session interaction.", "",
    table(["Current field", "Disposition"], CURRENT_SEAM_AUDIT), "",
    "No production domain field changes in this design phase. A future approved migration should replace slots as authority, derive compatibility projections from needs, and replace `PlannedExercise` with a non-prescribed assignment contract.", "",
    fingerprintLine("currentSessionSeamAudit", fp.currentSessionSeamAudit), "",
  ].join("\n");
  const design = [
    "# Session Composer Design Contract", "",
    `Overall classification: \`${data.overallClassification}\`.`, "",
    "Binding flow: Session purpose -> normalized SessionNeed[] -> precomputed Candidate Intelligence pools -> whole-session composition -> non-prescribed assignments. Sections remain semantic and ordered but optional. Ordinary sessions require at least one dominant main need.", "",
    "Planner owns why the session exists, need priority, weekly allocation, availability, and neighboring-session context. Candidate Intelligence owns exact legal candidates and local evidence. Composer owns coexistence, shared coverage, section assignment, marginal value, continuity, dependencies, redundancy, potential concentration, and structural feasibility. Sequencing owns exact within-section order. Prescription owns realized dose and stress. Week Composer owns frequency and volume.", "",
    "The design-only contracts are not in the package public API. The lab is a test helper; it is not production `composeSession` wiring.", "",
    table(["Area", "Classification"], data.designAreaClassifications), "",
    "## Production Invariance", "",
    table(["Behavior", "Fingerprint"], Object.entries(data.productionFingerprints)), "",
    fingerprints, "",
  ].join("\n");
  const needs = [
    "# Session Need And Dependency Model", "",
    "`SessionNeed` preserves stable ID, structured source evidence, required/preferred/optional priority, intended section, canonical `CandidateNeed`, dependency evidence, expected prescription resolution, a structured reason code, and inert explanatory prose. Candidate role/action/muscle truth is reused rather than copied.", "",
    "Required omission makes the intent infeasible. Preferred omission needs an explicit structural reason. Optional inclusion requires positive unique marginal value; availability alone never fills it.", "",
    "Dependencies can reference need IDs, selected exercise IDs, movement roles, action/functions, body regions, assessment signals, required range, and pain-response requirements. Need-based dependencies are preferred; the skeleton emits ordering constraints and defers final order to Sequencing.", "",
    "Assessment, pain, phase, preference, and continuity facts do not automatically create separate needs. One source fact may support one normalized need with multiple evidence refs; copying it into several needs requires an explicit planner reason.", "",
    fingerprintLine("proposedSessionNeedContract", fp.proposedSessionNeedContract),
    fingerprintLine("dependencyModel", fp.dependencyModel), "",
  ].join("\n");
  const evaluation = [
    "# Session Composition Evaluation Policy", "",
    "Candidate totals are local evidence only. They are never summed as session quality. The proposed vector is strict lexicographic: hard validity; required coverage; readiness; productive-anchor continuity; required preparation coherence; dominant purpose; preferred coverage; redundancy/conflict; potential concentration; optional marginal value; structural setup efficiency; deterministic tie-break.", "",
    "The lab uses candidate rank only inside the last local-evidence tie dimension. No numeric session coefficients or score-gap replacement threshold are approved.", "",
    "Every optional assignment is compared with the same skeleton without it. `NO_POSITIVE_MARGINAL_VALUE` excludes legal, high-ranked, catalog-present, P0-family, or empty-section filler that adds no unique need/dependency/continuity value.", "",
    "Redundancy uses normalized identity, role, action, primary muscle, family, support, path, fatigue, stress, and section purpose. No single overlap decides redundancy; distinct needs can make overlapping exercises complementary.", "",
    "Fatigue and stress are identity-level potential concentration only. Exact accumulated exposure waits for Prescription; completed response remains a separate evidence layer. Setup traces count structural changes but assign no time constants.", "",
    fingerprintLine("hardValidityPolicy", fp.hardValidityPolicy),
    fingerprintLine("lexicographicEvaluationVector", fp.lexicographicEvaluationVector),
    fingerprintLine("marginalValuePolicy", fp.marginalValuePolicy),
    fingerprintLine("redundancyPolicy", fp.redundancyPolicy),
    fingerprintLine("continuityPolicy", fp.continuityPolicy),
    fingerprintLine("timeBudgetOwnership", fp.timeBudgetOwnership), "",
  ].join("\n");
  const search = [
    "# Session Composer Search Lab", "",
    "Controlled pools use exhaustive enumeration, identity merging, hard-invalid pruning, complete required coverage, continuity/dependency evaluation, preferred consideration, positive-value optional admission, and deterministic complete-skeleton comparison. Every branch category is traceable. There is no randomness, repair loop, fallback exercise, or production beam width.", "",
    "Production direction to review: bounded beam search with visible Pareto pruning and deterministic ties. Strict lexicographic evaluation is the smallest explainable recommendation. Pareto/non-dominated review remains useful for owner consequence inspection; bounded weighted scoring remains contrast-only and is not approved.", "",
    table(["Approach", "Controlled-lab consequence", "Design disposition"], OPTIMIZER_CONSEQUENCE_COMPARISON.map((entry) => [entry.approach, entry.controlledLabConsequence, entry.designDisposition])), "",
    table(["Greedy failure", "Observed problem", "Whole-session correction", "Result"], data.greedyFailures.map((entry) => [entry.id, entry.greedyFailure, entry.coherentPolicy, entry.result])), "",
    "## Controlled Scenarios", "",
    table(["Scenario", "Status", "Selected identities", "Empty cooldown"], data.scenarios.map((entry) => [entry.id, entry.result.status, entry.result.assignments.map((assignment) => assignment.exerciseId).join(", ") || "none", entry.result.sections.find((section) => section.section === "cooldown")?.assignmentExerciseIds.length === 0])), "",
    fingerprintLine("searchComparison", fp.searchComparison),
    fingerprintLine("greedyFailureMatrix", fp.greedyFailureMatrix),
    fingerprintLine("controlledSessionScenarios", fp.controlledSessionScenarios), "",
  ].join("\n");
  const personalization = [
    "# Session Composer Personalization Matrix", "",
    `Fixed shell: intermediate, full gym, Phase 1, evaluation time \`${SESSION_COMPOSER_LAB_AS_OF}\`, one 45-row catalog. Eleven users vary one material factor at a time.`, "",
    table(["Material factor", "Classification", "Compared signatures"], data.cohort.map((entry) => [entry.factor, entry.classification, entry.signaturesCompared.join(", ")])), "",
    `Counts: material session difference=${data.counts.materialSessionDifferences}; same-anchor personalized=${data.counts.sameAnchorPersonalized}; justified convergence=${data.counts.justifiedConvergence}; unresponsive failures=${data.counts.unresponsiveMaterialInputFailures}.`, "",
    "Availability lab: 25 minutes preserves two required anchors; 45 minutes admits the justified preferred triceps need; 70 minutes may also admit the explicit recovery need. These are structural priority consequences, not claims that the skeleton fits exact minutes. Exercise truth and candidate pools are unchanged.", "",
    "Variety acceptance contract only: low variety may reinforce stable supporting work; moderate/high variety may mark comparable accessories rotation-eligible under a future explicit budget. No randomization, anchor displacement, or rotation exists here.", "",
    fingerprintLine("fixedShellPersonalizationMatrix", fp.fixedShellPersonalizationMatrix), "",
  ].join("\n");
  const readiness = [
    "# Session Composer Implementation Readiness", "",
    `Overall: \`${data.overallClassification}\`. Candidate Intelligence dependency is complete, but production implementation is not authorized.`, "",
    table(["Area", "Classification"], data.designAreaClassifications), "",
    "## Exact Blockers", "",
    "- Owner approval of strict lexicographic versus Pareto production selection policy.",
    "- Owner policy for candidate-review preference when an equally truthful executable candidate exists.",
    "- Owner policy for preferred/optional admission across structural availability states.",
    "- Approved production search/pruning strategy and visible truncation contract; no beam width is selected.",
    "- Authoritative domain migration from slots to needs and from `PlannedExercise` to assignments.",
    "- Prescription handoff and post-prescription duration feasibility contract.",
    "- Sequencing contract for exact within-section order.",
    "- Week Composer allocation remains a separate prerequisite for real program generation.", "",
    "TrainingSafety false blocks all executable output. Urgent candidate readiness blocks; session-role substitution tries another truthful candidate or returns infeasible; prescription-required coverage yields a non-executable pending skeleton; candidate-review evidence remains visible. No safety authority is cleared or reranked.", "",
    "Infeasibility exposes unsatisfied required IDs, pools considered, rejection reasons, equipment gaps, safety signals, substitution blockers, prescription blockers, and contradictory intent. No emergency fallback or silent required-need drop exists.", "",
    fingerprintLine("implementationReadinessReview", fp.implementationReadinessReview),
    fingerprintLine("combinedSessionComposerDesign", fp.combinedSessionComposerDesign), "",
    `Exact next dependency: \`${data.exactNextDependency}\`.`, "",
  ].join("\n");
  return {
    "SESSION_COMPOSER_CURRENT_SEAM_AUDIT.md": seam,
    "SESSION_COMPOSER_DESIGN_CONTRACT.md": design,
    "SESSION_NEED_AND_DEPENDENCY_MODEL.md": needs,
    "SESSION_COMPOSITION_EVALUATION_POLICY.md": evaluation,
    "SESSION_COMPOSER_SEARCH_LAB.md": search,
    "SESSION_COMPOSER_PERSONALIZATION_MATRIX.md": personalization,
    "SESSION_COMPOSER_IMPLEMENTATION_READINESS.md": readiness,
  } as const;
}

export function writeRequiredSessionComposerArtifacts(rootDir = process.cwd()): readonly string[] {
  return Object.entries(renderRequiredSessionComposerArtifacts()).map(([name, contents]) => {
    const outputPath = join(rootDir, "docs/training-engine-v2", name);
    writeFileSync(outputPath, contents);
    return outputPath;
  });
}
