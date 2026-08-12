import { describe, expect, it } from "vitest";
import {
  CANDIDATE_SCORE_COMPONENTS,
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  CONTROLLED_CANDIDATE_SCENARIOS,
  REFERENCE_EXERCISES,
  buildContextualPhasePolicyScoringTrace,
  legacyPhaseFitComponent,
  resolveContextualPhaseAnnotation,
  runCandidateRankingLab,
  type ExercisePhaseSuitabilityAnnotation,
} from "../../src";
import {
  buildContextualPhaseActivationRootCauseData,
  buildOmissionDenominatorAudit,
} from "../helpers/contextualPhaseActivationRootCause";

const data = buildContextualPhaseActivationRootCauseData();

function acceptedAnnotation(input: {
  readonly id: string;
  readonly suitability: "poor" | "excellent";
}): ExercisePhaseSuitabilityAnnotation {
  return {
    annotationId: input.id,
    exerciseId: "goblet-squat",
    phaseId: "phase_1",
    suitability: input.suitability,
    scope: { trainingRoles: ["primary_strength"], sessionSections: ["main"] },
    reason: "Synthetic production-semantics regression.",
    reviewStatus: "accepted",
    provenance: {
      sourceType: "owner_decision",
      sourceRef: `test:${input.id}`,
      evidenceBasis: ["Synthetic deterministic test."],
      reviewerId: "test-owner",
      reviewedAt: "2026-08-12T00:00:00-04:00",
    },
  };
}

describe("contextual phase activation root cause", () => {
  it("classifies all three winner changes and freezes complete non-phase invariance", () => {
    expect(data.scenarioAudits.map((row) => ({
      id: row.id,
      cause: row.primaryCause,
      legacyWinner: row.legacyWinner,
      contextualWinner: row.contextualWinner,
    }))).toEqual([
      {
        id: "controlled:horizontal-push-phase-1",
        cause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
        legacyWinner: "machine-chest-press",
        contextualWinner: "push-up",
      },
      {
        id: "controlled:lower-squat-phase-1",
        cause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
        legacyWinner: "goblet-squat",
        contextualWinner: "leg-press",
      },
      {
        id: "golden:advanced-gym-muscle-gain",
        cause: "LEGITIMATE_REMOVAL_OF_WRONG_OWNER_LEGACY_PHASE_BIAS",
        legacyWinner: "chest-supported-dumbbell-row",
        contextualWinner: "machine-row",
      },
    ]);
    for (const scenario of data.scenarioAudits) {
      expect(scenario.allNonPhaseRawValuesAndConfiguredWeightsInvariant).toBe(true);
      expect(scenario.candidates).toHaveLength(2);
      for (const candidate of scenario.candidates) {
        expect(candidate.legalEligibility).toEqual(expect.objectContaining({
          legacyLegal: true,
          contextualLegal: true,
          rejectionReasons: [],
        }));
        expect(candidate.legacyComponents).toHaveLength(18);
        expect(candidate.contextualComponents.length).toBeGreaterThanOrEqual(17);
        expect(candidate.aggregateBefore.totalWeight).toBe(16.2);
      }
    }
  });

  it("accepts the scoped Goblet judgment without manufacturing the old winner", () => {
    const squat = data.scenarioAudits.find(
      (row) => row.id === "controlled:lower-squat-phase-1",
    );
    const goblet = squat?.candidates.find((candidate) => candidate.exerciseId === "goblet-squat");
    const legPress = squat?.candidates.find((candidate) => candidate.exerciseId === "leg-press");
    expect(data.gobletDecision).toBe("ACCEPT_SCOPED_GOBLET_PHASE_1_ANNOTATION");
    expect(goblet?.contextualResolution).toEqual(expect.objectContaining({
      evidenceStatus: "ACCEPTED_ANNOTATION",
      annotationId: "goblet-squat-phase-1-main-owner-approved",
      suitability: "good",
      componentValue: 7.8,
      omissionReason: null,
    }));
    expect(goblet?.aggregateAfter.totalWeight).toBe(16.2);
    expect(legPress?.contextualResolution).toEqual(expect.objectContaining({
      evidenceStatus: "UNKNOWN_NO_MATCH",
      componentValue: null,
      omissionReason: "NO_CONTEXTUAL_MATCH",
    }));
    expect(squat?.contextualWinner).toBe("leg-press");
  });

  it("proves omission math is neutral on abstention and directional on accepted evidence", () => {
    const audit = buildOmissionDenominatorAudit();
    expect(audit.cases.map((row) => row.id)).toEqual([
      "A_BOTH_ABSTAIN",
      "B_ONLY_A_EXCELLENT",
      "C_ONLY_A_GOOD",
      "D_ONLY_A_POSSIBLE",
      "E_ONLY_A_POOR",
      "F_BOTH_ACCEPTED",
      "G_UNKNOWN_OR_CONFLICT_VS_ACCEPTED",
    ]);
    expect(audit.abstentionPreservesNonPhaseMean).toBe(true);
    expect(audit.acceptedVoteIsConvexAndDirectional).toBe(true);
    expect(audit.unknownReceivesSyntheticValue).toBe(false);
    expect(audit.acceptedPoorRemainsDistinct).toBe(true);
    expect(audit.verdict).toBe("SEMANTICALLY_DEFENSIBLE_NO_POLICY_CHANGE");
  });

  it("keeps accepted poor real while unknown and conflict remain visible abstentions", () => {
    const resolve = (annotations: readonly ExercisePhaseSuitabilityAnnotation[]) =>
      buildContextualPhasePolicyScoringTrace(resolveContextualPhaseAnnotation({
        phaseId: "phase_1",
        requestedRole: "primary_strength",
        requestedSection: "main",
        exerciseId: "goblet-squat",
        annotations,
      }));
    expect(resolve([acceptedAnnotation({ id: "poor", suitability: "poor" })]))
      .toEqual(expect.objectContaining({
        component: expect.objectContaining({ value: 5.5 }),
        componentWeightIncluded: true,
        omissionReason: null,
      }));
    expect(resolve([])).toEqual(expect.objectContaining({
      component: null,
      componentWeightIncluded: false,
      omissionReason: "NO_CONTEXTUAL_MATCH",
    }));
    expect(resolve([
      acceptedAnnotation({ id: "conflict-poor", suitability: "poor" }),
      acceptedAnnotation({ id: "conflict-excellent", suitability: "excellent" }),
    ])).toEqual(expect.objectContaining({
      component: null,
      componentWeightIncluded: false,
      omissionReason: "CONFLICT",
    }));
  });

  it("activates contextual authority and leaves legacy categories and bonuses audit-only", () => {
    expect(CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.activation)
      .toBe("PRODUCTION_AUTHORITY_REVISED_SEMANTIC_GATE_PASSED");
    expect(data.productionContextualPhaseActivated).toBe(true);
    expect(data.legacyProductionPhaseActive).toBe(false);
    expect(data.legacyPhaseRetainedForAudit).toBe(true);
    expect(data.duplicateMechanicalBonusesBehavioral).toBe(false);
    expect(CANDIDATE_SCORE_COMPONENTS).not.toContain(legacyPhaseFitComponent);
  });

  it("preserves productive continuity without replacement or progression pressure", () => {
    expect(data.continuity).toEqual(expect.objectContaining({
      legacyWinner: "machine-row",
      contextualWinner: "machine-row",
      winnerChanged: false,
      orderChanged: true,
      productiveContinuityValue: 8,
      automaticReplacementPressureCreated: false,
      stableAdaptiveDoctrinePreserved: true,
    }));
  });

  it("makes legacy reason prose behaviorally inert under contextual production", () => {
    const scenario = CONTROLLED_CANDIDATE_SCENARIOS.find(
      (candidate) => candidate.id === "horizontal-push-phase-1",
    );
    if (!scenario) throw new Error("Missing horizontal push scenario.");
    const changedCatalog = scenario.request.candidatePool.map((exercise) => ({
      ...exercise,
      phaseSuitability: Object.fromEntries(
        Object.entries(exercise.phaseSuitability).map(([phaseId, suitability]) => [
          phaseId,
          { ...suitability, reason: "Completely different legacy prose." },
        ]),
      ),
    }));
    const before = runCandidateRankingLab(scenario.request);
    const after = runCandidateRankingLab({ ...scenario.request, candidatePool: changedCatalog });
    const compact = (result: ReturnType<typeof runCandidateRankingLab>) =>
      result.rankedCandidates.map((candidate) => ({
        id: candidate.exercise.id,
        total: candidate.total,
        components: candidate.components.map((component) => ({
          id: component.id,
          rawValue: component.rawValue,
        })),
      }));
    expect(compact(after)).toEqual(compact(before));
  });

  it("keeps Knowledge compatibility non-behavioral and the catalog exact", () => {
    expect(data.catalogCount).toBe(45);
    expect(data.catalogUniqueCount).toBe(45);
    expect(data.sevenIdsExact).toBe(true);
    expect(REFERENCE_EXERCISES).toHaveLength(45);
    expect(data.knowledgeCompatibilityFingerprint)
      .toBe("1f31ff87378887f56349fec7a9a130144496cee974e40adbd0117eaf77af37e6");
  });

  it("is deterministic across repeated final-policy evaluations", () => {
    const first = buildContextualPhaseActivationRootCauseData();
    const second = buildContextualPhaseActivationRootCauseData();
    expect(second.contextualPhaseFingerprint).toBe(first.contextualPhaseFingerprint);
    expect(second.productionRankingAfter).toBe(first.productionRankingAfter);
    expect(second.comprehensiveAfter).toBe(first.comprehensiveAfter);
  });
});
