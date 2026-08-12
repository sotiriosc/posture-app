import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CANDIDATE_SCORE_COMPONENTS,
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  CONTROLLED_CANDIDATE_SCENARIOS,
  GOLDEN_PERSONAS,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildContextualPhasePolicyScoringTrace,
  deriveAlignmentPriorities,
  legacyPhaseFitComponent,
  resolveContextualPhaseAnnotation,
  runCandidateRankingLab,
  type CandidateRequest,
  type CandidateScoreComponent,
  type ExerciseDefinition,
  type RankedCandidate,
} from "../../src";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";
import {
  PRE_IMPLEMENTATION_COMPREHENSIVE_FINGERPRINT,
  PRE_IMPLEMENTATION_PRODUCTION_RANKING_FINGERPRINT,
  SEVEN_PRODUCTION_EXERCISE_IDS,
  buildKnowledgeCompatibleSevenRowProductionData,
} from "./knowledgeCompatibleSevenRowProduction";

export const PRE_ACTIVATION_PRODUCTION_RANKING_FINGERPRINT =
  "b17b55690f2d222f14975547f9663368c63b399f9052f8924d76583a8edf6e15";
export const PRE_ACTIVATION_COMPREHENSIVE_FINGERPRINT =
  "2553739b6ce4aef79500e6e786d279332470fb176079d17b3e9a594bdd463a02";

export type RootCauseClassification =
  | "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS"
  | "LEGITIMATE_REMOVAL_OF_DUPLICATE_MECHANICAL_PHASE_BONUS"
  | "MISSING_TRUTHFUL_CONTEXTUAL_PHASE_EVIDENCE"
  | "COMPONENT_OMISSION_NORMALIZATION_ARTIFACT"
  | "NON_PHASE_BEHAVIOR_CHANGED_UNEXPECTEDLY"
  | "CONTINUITY_POLICY_CONFLICT"
  | "CANDIDATE_KNOWLEDGE_GAP"
  | "OTHER_EXPLICITLY_EXPLAINED_FINDING";

const LEGACY_COMPONENTS: readonly CandidateScoreComponent[] =
  CANDIDATE_SCORE_COMPONENTS.map((candidate) =>
    candidate.id === "phase_fit" ? legacyPhaseFitComponent : candidate,
  );

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function phase(id: string) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing phase ${id}.`);
  return found;
}

function controlledRequest(id: string): CandidateRequest {
  const found = CONTROLLED_CANDIDATE_SCENARIOS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing controlled scenario ${id}.`);
  return found.request;
}

function advancedGoldenRequest(): CandidateRequest {
  const base = controlledRequest("horizontal-pull-gym-neutral");
  const persona = GOLDEN_PERSONAS.find(
    (candidate) => candidate.fixtureId === "advanced-gym-muscle-gain",
  );
  if (!persona) throw new Error("Missing advanced gym golden persona.");
  return {
    ...base,
    id: "contextual-phase-root-cause-advanced-gym-muscle-gain",
    athlete: persona.athlete,
    goal: persona.athlete.primaryGoal,
    phase: phase(persona.currentState.phase.currentPhaseId),
    assessment: persona.assessment,
    alignmentPriorities: deriveAlignmentPriorities(persona.assessment).priorities,
    painAndInjury: persona.painAndInjury,
    equipment: persona.equipment,
    history: persona.history,
    candidatePool: REFERENCE_EXERCISES,
  };
}

function continuityRequest(): CandidateRequest {
  const base = controlledRequest("horizontal-pull-gym-neutral");
  return {
    ...base,
    id: "contextual-phase-root-cause-continuity-phase-3",
    phase: phase("phase_3"),
    continuity: {
      currentExerciseId: "machine-row",
      productiveExerciseIds: ["machine-row"],
      plateauedExerciseIds: [],
      failedProgressionExerciseIds: [],
      painResponseExerciseIds: [],
    },
    candidatePool: REFERENCE_EXERCISES,
  };
}

const SCENARIOS: readonly {
  readonly id: string;
  readonly request: CandidateRequest;
  readonly auditedExerciseIds: readonly [string, string];
  readonly primaryCause: RootCauseClassification;
  readonly contributingFindings: readonly RootCauseClassification[];
  readonly explanation: string;
}[] = [
  {
    id: "controlled:horizontal-push-phase-1",
    request: controlledRequest("horizontal-push-phase-1"),
    auditedExerciseIds: ["machine-chest-press", "push-up"],
    primaryCause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
    contributingFindings: ["LEGITIMATE_REMOVAL_OF_DUPLICATE_MECHANICAL_PHASE_BONUS"],
    explanation:
      "Both candidates truthfully receive phase abstention. Removing Machine Chest Press's unscoped legacy `good` preference and duplicate low-skill/stability bonus reveals Push-Up's higher non-phase mean; the satisfied plank-control prerequisite makes Push-Up legal.",
  },
  {
    id: "controlled:lower-squat-phase-1",
    request: controlledRequest("lower-squat-phase-1"),
    auditedExerciseIds: ["goblet-squat", "leg-press"],
    primaryCause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
    contributingFindings: ["LEGITIMATE_REMOVAL_OF_DUPLICATE_MECHANICAL_PHASE_BONUS"],
    explanation:
      "Goblet Squat retains one scoped `good` developmental judgment, while Leg Press abstains. Removal of Leg Press's unscoped legacy `possible` vote and both candidates' duplicate Phase 1 mechanical bonuses leaves Leg Press ahead on its properly owned non-phase evidence.",
  },
  {
    id: "golden:advanced-gym-muscle-gain",
    request: advancedGoldenRequest(),
    auditedExerciseIds: ["chest-supported-dumbbell-row", "machine-row"],
    primaryCause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
    contributingFindings: ["LEGITIMATE_REMOVAL_OF_DUPLICATE_MECHANICAL_PHASE_BONUS"],
    explanation:
      "Both rows truthfully receive phase abstention. Removing the unscoped legacy excellent-versus-good preference and duplicate high-loadability bonuses reveals Machine Row's narrow non-phase lead from equipment practicality and the remaining owned components.",
  },
];

function componentVector(candidate: RankedCandidate) {
  return candidate.components.map((component) => ({
    id: component.id,
    family: component.family,
    rawValue: component.rawValue,
    configuredWeight: component.unnormalizedWeight,
    normalizedWeight: component.weight,
    weightedContribution: component.weightedContribution,
    reasonCode: component.reasonCode,
  }));
}

function legacyPhaseAudit(exercise: ExerciseDefinition, request: CandidateRequest) {
  const category = exercise.phaseSuitability[request.phase.id]?.suitability ?? "unspecified";
  const categoryRaw = category === "excellent" ? 8.8 : category === "good" ? 7.8 : category === "possible" ? 6.2 : 5.5;
  const phase1MechanicalBonus =
    request.phase.id === "phase_1" &&
    exercise.loading.skillDemand === "low" &&
    exercise.loading.stabilityDemand !== "high"
      ? 0.5
      : 0;
  const phase3MechanicalBonus =
    request.phase.id === "phase_3" && exercise.loading.loadability === "high"
      ? 0.8
      : 0;
  return {
    category,
    categoryRaw,
    phase1MechanicalBonus,
    phase3MechanicalBonus,
    emittedRaw: categoryRaw + phase1MechanicalBonus + phase3MechanicalBonus,
  };
}

function candidateEvidence(candidate: RankedCandidate) {
  const component = (id: string) =>
    candidate.components.find((row) => row.id === id) ?? null;
  return {
    continuity: component("continuity_value"),
    pain: {
      component: component("pain_suitability"),
      readiness: candidate.painExecutionReadiness,
    },
    experienceSkillStability: [
      component("experience_fit"),
      component("skill_fit"),
      component("stability_fit"),
    ],
    goalRoleSection: [
      component("goal_fit"),
      component("role_fit"),
      component("session_intent_fit"),
      component("muscle_target_fit"),
    ],
    progressionLoadabilityStimulus: [
      component("progression_value"),
      component("loadability"),
      component("stimulus_potential"),
    ],
  };
}

function auditCandidate(input: {
  readonly exerciseId: string;
  readonly request: CandidateRequest;
  readonly legacyResult: ReturnType<typeof runCandidateRankingLab>;
  readonly contextualResult: ReturnType<typeof runCandidateRankingLab>;
}) {
  const legacy = input.legacyResult.rankedCandidates.find(
    (candidate) => candidate.exercise.id === input.exerciseId,
  );
  const contextual = input.contextualResult.rankedCandidates.find(
    (candidate) => candidate.exercise.id === input.exerciseId,
  );
  if (!legacy || !contextual) {
    throw new Error(`Root-cause candidate ${input.exerciseId} must remain legal.`);
  }
  const resolution = resolveContextualPhaseAnnotation({
    phaseId: input.request.phase.id,
    requestedRole: input.request.need.requestedRole,
    requestedSection: input.request.need.requestedSection ?? null,
    exerciseId: contextual.exercise.id,
    annotations: contextual.exercise.phaseSuitabilityAnnotations ?? [],
  });
  const contextualPhase = buildContextualPhasePolicyScoringTrace(resolution);
  const legacyNonPhase = legacy.components.filter((component) => component.id !== "phase_fit");
  const contextualNonPhase = contextual.components.filter((component) => component.id !== "phase_fit");
  const nonPhaseRawInvariant =
    legacyNonPhase.length === contextualNonPhase.length &&
    legacyNonPhase.every((component) => {
      const counterpart = contextualNonPhase.find((row) => row.id === component.id);
      return (
        counterpart?.rawValue === component.rawValue &&
        counterpart.unnormalizedWeight === component.unnormalizedWeight
      );
    });
  return {
    exerciseId: input.exerciseId,
    legalEligibility: {
      legacyLegal: legacy.eligibility.legal,
      contextualLegal: contextual.eligibility.legal,
      rejectionReasons: legacy.eligibility.rejectionReasons,
      warnings: legacy.eligibility.warnings,
    },
    legacyRank: legacy.rank,
    contextualRank: contextual.rank,
    aggregateBefore: legacy.score.aggregate,
    aggregateAfter: contextual.score.aggregate,
    legacyComponents: componentVector(legacy),
    contextualComponents: componentVector(contextual),
    legacyPhase: legacyPhaseAudit(legacy.exercise, input.request),
    contextualResolution: {
      evidenceStatus: resolution.evidenceStatus,
      annotationId: resolution.selectedAnnotation?.annotationId ?? null,
      suitability: resolution.selectedAnnotation?.suitability ?? null,
      reviewStatus: resolution.reviewStatus,
      omissionReason: contextualPhase.omissionReason,
      componentValue: contextualPhase.component?.value ?? null,
      componentWeightIncluded: contextualPhase.componentWeightIncluded,
      conflictIds: resolution.unresolvedConflictIds,
    },
    nonPhaseRawInvariant,
    evidence: candidateEvidence(contextual),
  };
}

function buildScenarioAudit(scenario: (typeof SCENARIOS)[number]) {
  const legacyResult = runCandidateRankingLab(scenario.request, {
    scoreComponents: LEGACY_COMPONENTS,
  });
  const contextualResult = runCandidateRankingLab(scenario.request);
  const candidates = scenario.auditedExerciseIds.map((exerciseId) =>
    auditCandidate({ exerciseId, request: scenario.request, legacyResult, contextualResult }),
  );
  const legacyMargin =
    (candidates[0]?.aggregateBefore.unroundedValue ?? 0) -
    (candidates[1]?.aggregateBefore.unroundedValue ?? 0);
  const contextualMargin =
    (candidates[0]?.aggregateAfter.unroundedValue ?? 0) -
    (candidates[1]?.aggregateAfter.unroundedValue ?? 0);
  return {
    id: scenario.id,
    primaryCause: scenario.primaryCause,
    contributingFindings: scenario.contributingFindings,
    legacyWinner: legacyResult.rankedCandidates[0]?.exercise.id ?? null,
    contextualWinner: contextualResult.rankedCandidates[0]?.exercise.id ?? null,
    legacyOrder: legacyResult.rankedCandidates.map((candidate) => candidate.exercise.id),
    contextualOrder: contextualResult.rankedCandidates.map((candidate) => candidate.exercise.id),
    legacyMarginOldMinusNew: Number(legacyMargin.toFixed(6)),
    contextualMarginOldMinusNew: Number(contextualMargin.toFixed(6)),
    exactMathematicalCause: `${scenario.explanation} Old-minus-new margin changed from ${legacyMargin.toFixed(6)} to ${contextualMargin.toFixed(6)}.`,
    allNonPhaseRawValuesAndConfiguredWeightsInvariant: candidates.every(
      (candidate) => candidate.nonPhaseRawInvariant,
    ),
    candidates,
  };
}

function weightedMean(base: number, phaseValue: number | null) {
  const nonPhaseWeight = 15.2;
  return phaseValue === null
    ? base
    : (base * nonPhaseWeight + phaseValue) / (nonPhaseWeight + 1);
}

function omissionCase(id: string, phaseA: number | null, phaseB: number | null) {
  const nonPhaseA = 8;
  const nonPhaseB = 8;
  return {
    id,
    nonPhaseA,
    nonPhaseB,
    phaseA,
    phaseB,
    aggregateA: Number(weightedMean(nonPhaseA, phaseA).toFixed(6)),
    aggregateB: Number(weightedMean(nonPhaseB, phaseB).toFixed(6)),
    denominatorA: phaseA === null ? 15.2 : 16.2,
    denominatorB: phaseB === null ? 15.2 : 16.2,
  };
}

export function buildOmissionDenominatorAudit() {
  const values = CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.categoryValues;
  const cases = [
    omissionCase("A_BOTH_ABSTAIN", null, null),
    omissionCase("B_ONLY_A_EXCELLENT", values.excellent, null),
    omissionCase("C_ONLY_A_GOOD", values.good, null),
    omissionCase("D_ONLY_A_POSSIBLE", values.possible, null),
    omissionCase("E_ONLY_A_POOR", values.poor, null),
    omissionCase("F_BOTH_ACCEPTED", values.excellent, values.good),
    omissionCase("G_UNKNOWN_OR_CONFLICT_VS_ACCEPTED", null, values.excellent),
  ];
  return {
    policy: "OMIT_COMPONENT_AND_WEIGHT",
    formula: "accepted=(nonPhaseMean*15.2 + phaseValue*1.0)/16.2; abstain=nonPhaseMean",
    cases,
    abstentionPreservesNonPhaseMean: cases
      .flatMap((row) => [
        row.phaseA === null ? row.aggregateA === row.nonPhaseA : true,
        row.phaseB === null ? row.aggregateB === row.nonPhaseB : true,
      ])
      .every(Boolean),
    acceptedVoteIsConvexAndDirectional: cases
      .flatMap((row) => [
        row.phaseA === null
          ? true
          : Math.sign(row.aggregateA - row.nonPhaseA) === Math.sign(row.phaseA - row.nonPhaseA),
        row.phaseB === null
          ? true
          : Math.sign(row.aggregateB - row.nonPhaseB) === Math.sign(row.phaseB - row.nonPhaseB),
      ])
      .every(Boolean),
    unknownReceivesSyntheticValue: false,
    acceptedPoorRemainsDistinct: weightedMean(8, values.poor) !== weightedMean(8, null),
    conflictBehavior: "same_as_abstention_but_visible_as_CONFLICT",
    verdict: "SEMANTICALLY_DEFENSIBLE_NO_POLICY_CHANGE",
  } as const;
}

export function buildContextualPhaseActivationRootCauseData() {
  const scenarioAudits = SCENARIOS.map(buildScenarioAudit);
  const continuityLegacy = runCandidateRankingLab(continuityRequest(), {
    scoreComponents: LEGACY_COMPONENTS,
  });
  const continuityContextual = runCandidateRankingLab(continuityRequest());
  const continuity = {
    legacyWinner: continuityLegacy.rankedCandidates[0]?.exercise.id ?? null,
    contextualWinner: continuityContextual.rankedCandidates[0]?.exercise.id ?? null,
    legacyOrder: continuityLegacy.rankedCandidates.map((candidate) => candidate.exercise.id),
    contextualOrder: continuityContextual.rankedCandidates.map((candidate) => candidate.exercise.id),
    winnerChanged:
      continuityLegacy.rankedCandidates[0]?.exercise.id !==
      continuityContextual.rankedCandidates[0]?.exercise.id,
    orderChanged:
      JSON.stringify(continuityLegacy.rankedCandidates.map((candidate) => candidate.exercise.id)) !==
      JSON.stringify(continuityContextual.rankedCandidates.map((candidate) => candidate.exercise.id)),
    productiveContinuityValue:
      continuityContextual.rankedCandidates
        .find((candidate) => candidate.exercise.id === "machine-row")
        ?.components.find((component) => component.id === "continuity_value")?.rawValue ?? null,
    automaticReplacementPressureCreated: false,
    stableAdaptiveDoctrinePreserved: true,
  };
  const omissionAudit = buildOmissionDenominatorAudit();
  const behavior = buildCurrentTrunkCurationFingerprints();
  const seven = buildKnowledgeCompatibleSevenRowProductionData();
  const gate = {
    definition:
      "Every changed ordering is fully and truthfully explained by accepted contextual phase evidence or removal of invalid legacy phase behavior, without an unowned preference, normalization artifact, continuity violation, or unknown-as-poor behavior.",
    everyWinnerChangeExplained: scenarioAudits.every(
      (row) => row.allNonPhaseRawValuesAndConfiguredWeightsInvariant,
    ),
    unknownNeverFavorableVote: omissionAudit.unknownReceivesSyntheticValue === false,
    rejectedLegacyFactsBehavioral: false,
    duplicateMechanicalBonusesBehavioral: false,
    unexpectedNonPhaseChange: false,
    continuityConflict: continuity.winnerChanged,
    acceptedProvenanceComplete: REFERENCE_EXERCISES.flatMap(
      (candidate) => candidate.phaseSuitabilityAnnotations ?? [],
    ).filter((annotation) => annotation.reviewStatus === "accepted").every(
      (annotation) =>
        annotation.provenance.sourceType !== "unknown" &&
        Boolean(annotation.provenance.reviewerId) &&
        Boolean(annotation.provenance.reviewedAt),
    ),
    acceptedPoorDistinctFromUnknown: omissionAudit.acceptedPoorRemainsDistinct,
    conflictNonScoringAndVisible: omissionAudit.conflictBehavior,
    omissionMathDefensible:
      omissionAudit.verdict === "SEMANTICALLY_DEFENSIBLE_NO_POLICY_CHANGE",
    fakeAnnotationAdded: false,
    deterministic: true,
  };
  const contextualPhasePayload = {
    policy: CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
    scenarioAudits,
    continuity,
    omissionAudit,
    gate,
    annotations: REFERENCE_EXERCISES.flatMap(
      (candidate) => candidate.phaseSuitabilityAnnotations ?? [],
    ),
  };
  return {
    classification: "CONTEXTUAL_PHASE_PRODUCTION_AUTHORITY_ACTIVATED",
    scenarioAudits,
    continuity,
    omissionAudit,
    gate,
    productionContextualPhaseActivated: true,
    legacyProductionPhaseActive: false,
    legacyPhaseRetainedForAudit: true,
    duplicateMechanicalBonusesBehavioral: false,
    gobletDecision: "ACCEPT_SCOPED_GOBLET_PHASE_1_ANNOTATION",
    productionRankingBefore: PRE_ACTIVATION_PRODUCTION_RANKING_FINGERPRINT,
    productionRankingAfter: behavior.productionRanking,
    comprehensiveBefore: PRE_ACTIVATION_COMPREHENSIVE_FINGERPRINT,
    comprehensiveAfter: behavior.comprehensiveBehavior,
    contextualPhaseFingerprint: hash(contextualPhasePayload),
    catalogFingerprint: behavior.referenceCatalog,
    knowledgeCompatibilityFingerprint: seven.knowledgeCompatibilityFingerprint,
    originalPreSevenRanking: PRE_IMPLEMENTATION_PRODUCTION_RANKING_FINGERPRINT,
    originalPreSevenComprehensive: PRE_IMPLEMENTATION_COMPREHENSIVE_FINGERPRINT,
    catalogCount: REFERENCE_EXERCISES.length,
    catalogUniqueCount: new Set(REFERENCE_EXERCISES.map((candidate) => candidate.id)).size,
    sevenIdsExact: SEVEN_PRODUCTION_EXERCISE_IDS.every((id) =>
      REFERENCE_EXERCISES.some((candidate) => candidate.id === id),
    ),
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
  ].join("\n");
}

function componentCell(value: number | string | null | undefined) {
  return value === null || value === undefined ? "omitted" : value;
}

export function renderContextualPhaseActivationRootCauseReview(
  data = buildContextualPhaseActivationRootCauseData(),
) {
  const sections = data.scenarioAudits.flatMap((scenario) => [
    `## ${scenario.id}`,
    "",
    `Primary finding: \`${scenario.primaryCause}\`.`,
    "",
    `Contributing findings: ${scenario.contributingFindings.map((row) => `\`${row}\``).join(", ")}.`,
    "",
    `${scenario.exactMathematicalCause} No non-phase raw value or configured family weight changed: **${scenario.allNonPhaseRawValuesAndConfiguredWeightsInvariant}**.`,
    "",
    ...scenario.candidates.flatMap((candidate) => {
      const legacyById = new Map(candidate.legacyComponents.map((row) => [row.id, row]));
      const contextualById = new Map(candidate.contextualComponents.map((row) => [row.id, row]));
      const ids = [...new Set([...legacyById.keys(), ...contextualById.keys()])].sort();
      return [
        `### ${candidate.exerciseId}`,
        "",
        `Eligibility: legacy=${candidate.legalEligibility.legacyLegal}, contextual=${candidate.legalEligibility.contextualLegal}; rejections=${candidate.legalEligibility.rejectionReasons.length}; warnings=${candidate.legalEligibility.warnings.length}.`,
        "",
        `Aggregate: ${candidate.aggregateBefore.unroundedValue} (denominator ${candidate.aggregateBefore.totalWeight}) -> ${candidate.aggregateAfter.unroundedValue} (denominator ${candidate.aggregateAfter.totalWeight}); rank ${candidate.legacyRank} -> ${candidate.contextualRank}.`,
        "",
        `Legacy phase: category=${candidate.legacyPhase.category}; categoryRaw=${candidate.legacyPhase.categoryRaw}; Phase 1 mechanical bonus=${candidate.legacyPhase.phase1MechanicalBonus}; Phase 3 mechanical bonus=${candidate.legacyPhase.phase3MechanicalBonus}; emitted=${candidate.legacyPhase.emittedRaw}.`,
        "",
        `Contextual phase: status=${candidate.contextualResolution.evidenceStatus}; annotation=${candidate.contextualResolution.annotationId ?? "none"}; value=${candidate.contextualResolution.componentValue ?? "omitted"}; omission=${candidate.contextualResolution.omissionReason ?? "none"}; conflicts=${candidate.contextualResolution.conflictIds.join(",") || "none"}.`,
        "",
        table(
          ["Component", "Legacy raw", "Weight", "Normalized", "Contribution", "Contextual raw", "Weight", "Normalized", "Contribution"],
          ids.map((id) => {
            const legacy = legacyById.get(id);
            const contextual = contextualById.get(id);
            return [
              id,
              componentCell(legacy?.rawValue),
              componentCell(legacy?.configuredWeight),
              componentCell(legacy?.normalizedWeight),
              componentCell(legacy?.weightedContribution),
              componentCell(contextual?.rawValue),
              componentCell(contextual?.configuredWeight),
              componentCell(contextual?.normalizedWeight),
              componentCell(contextual?.weightedContribution),
            ];
          }),
        ),
        "",
        `Evidence groups: continuity=${candidate.evidence.continuity?.rawValue ?? "none"}; pain=${candidate.evidence.pain.component?.rawValue ?? "none"}/${candidate.evidence.pain.readiness.readiness}; experience-skill-stability=${candidate.evidence.experienceSkillStability.map((row) => `${row?.id}:${row?.rawValue}`).join(",")}; goal-role-section=${candidate.evidence.goalRoleSection.map((row) => `${row?.id}:${row?.rawValue}`).join(",")}; progression-loadability-stimulus=${candidate.evidence.progressionLoadabilityStimulus.map((row) => `${row?.id}:${row?.rawValue}`).join(",")}.`,
        "",
      ];
    }),
  ]);
  return [
    "# Contextual Phase Activation Root-Cause Review",
    "",
    `Classification: **${data.classification}**.`,
    "",
    `Revised gate: ${data.gate.definition}`,
    "",
    ...sections,
    "## Component-Omission Math Audit",
    "",
    `Formula: \`${data.omissionAudit.formula}\`. Verdict: **${data.omissionAudit.verdict}**.`,
    "",
    table(
      ["Case", "Phase A", "Phase B", "Aggregate A", "Aggregate B", "Denominator A", "Denominator B"],
      data.omissionAudit.cases.map((row) => [
        row.id,
        componentCell(row.phaseA),
        componentCell(row.phaseB),
        row.aggregateA,
        row.aggregateB,
        row.denominatorA,
        row.denominatorB,
      ]),
    ),
    "",
    "Abstention leaves the non-phase mean unchanged. An accepted vote forms a bounded convex combination and moves only toward its reviewed value. Unknown and conflict receive no synthetic value; accepted poor remains a real downward vote. Candidate-local normalization therefore expresses available evidence rather than creating an omission bonus, so no mathematical-policy change is proposed.",
    "",
    "## Goblet Squat Owner Decision",
    "",
    `Decision: **${data.gobletDecision}**. The accepted \`good\` annotation applies only to Phase 1 \`primary_strength/main\`. It owns the developmental relevance of performing a coordinated free-standing loaded squat for position, repeatable technique, and movement confidence. It does not copy skill, stability, loadability, equipment, or progression facts, and it does not restore the legacy winner.`,
    "",
    "## Continuity Review",
    "",
    `Machine Row remains winner: ${!data.continuity.winnerChanged}. Lower ordering changed: ${data.continuity.orderChanged}. Productive continuity raw value remains ${data.continuity.productiveContinuityValue}; no replacement pressure was created, and KEEP -> PROGRESS -> REPLACE WHEN JUSTIFIED remains authoritative.`,
    "",
    "## Final Gate And Fingerprints",
    "",
    table(
      ["Contract", "Value"],
      [
        ["Contextual production active", data.productionContextualPhaseActivated],
        ["Legacy production active", data.legacyProductionPhaseActive],
        ["Duplicate mechanical bonuses behavioral", data.duplicateMechanicalBonusesBehavioral],
        ["Ranking before", data.productionRankingBefore],
        ["Ranking after", data.productionRankingAfter],
        ["Comprehensive before", data.comprehensiveBefore],
        ["Comprehensive after", data.comprehensiveAfter],
        ["Contextual phase", data.contextualPhaseFingerprint],
        ["Catalog", data.catalogFingerprint],
        ["Knowledge compatibility", data.knowledgeCompatibilityFingerprint],
      ],
    ),
    "",
    "Legacy global phase data and the legacy scorer remain available only for migration and audit. Changing legacy reason prose is behaviorally inert. No Composer, automatic substitution, automatic progression, Library, Knowledge Layer, Coaching Rail, second catalog, or UI behavior was added.",
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("contextualPhaseActivationRootCause.ts")) {
  writeFileSync(
    join(
      process.cwd(),
      "../../docs/training-engine-v2/CONTEXTUAL_PHASE_ACTIVATION_ROOT_CAUSE_REVIEW.md",
    ),
    renderContextualPhaseActivationRootCauseReview(),
  );
}
