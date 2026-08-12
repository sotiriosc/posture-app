import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  buildContextualPhasePolicyScoringTrace,
  buildProgressionReadinessTrace,
  buildTrainingResponseReceiverTrace,
  getControlledCandidateScenario,
  resolveContextualPhaseAnnotation,
  runCandidateRankingLab,
  type CandidateRequest,
  type ExercisePhaseSuitabilityAnnotation,
  type ExercisePrescription,
  type ProgressionEvidence,
  type TrainingResponseObservation,
  type TrainingSafetySignal,
} from "../../src";
import {
  buildContextualPhaseProductionCurationData,
  renderContextualPhaseProductionCuration,
} from "../helpers/contextualPhaseProductionCuration";
import {
  buildLowBackRelevantRowStressCurationData,
  renderLowBackRelevantRowStressCuration,
} from "../helpers/lowBackRelevantRowStressCuration";
import {
  buildStableAdaptiveProgrammingPolicyData,
  buildStableAdaptiveResponseFixture,
} from "../helpers/stableAdaptiveProgrammingPolicy";

const AS_OF = "2026-08-12T23:00:00.000Z";

function scenario(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) throw new Error(`Missing scenario ${id}.`);
  return { ...found.request, evaluationContext: { asOf: AS_OF } };
}

function readyEvidence(
  prescription: ExercisePrescription,
): ProgressionEvidence {
  return {
    prescriptionId: prescription.prescriptionId,
    exerciseId: prescription.exerciseId,
    doseEvidence: "target_met",
    executionQualityEvidence: "all_required_criteria_met",
    painResponseEvidence: "prescription_response_unresolved",
    recoveryEvidence: "recovered_as_expected",
    continuityRunwayEvidence: [
      "same_exercise_remains_productive",
      "progression_axes_remain_available",
    ],
    repeatedEvidence: "repeated_success",
    evidenceRecordIds: [],
    notes: [],
  };
}

function acceptedAnnotation(input: {
  readonly id: string;
  readonly suitability: "poor" | "possible" | "good" | "excellent";
}): ExercisePhaseSuitabilityAnnotation {
  return {
    annotationId: input.id,
    exerciseId: "dumbbell-romanian-deadlift",
    phaseId: "phase_2",
    suitability: input.suitability,
    scope: {
      trainingRoles: ["primary_strength"],
      sessionSections: ["main"],
    },
    reason: "Structured contextual phase fixture.",
    reviewStatus: "accepted",
    provenance: {
      sourceType: "owner_decision",
      sourceRef: `owner:${input.id}`,
      evidenceBasis: ["Explicit owner-approved contextual fixture."],
      reviewerId: "owner-fixture",
      reviewedAt: "2026-08-12T12:00:00.000Z",
    },
  };
}

function safetySignal(): TrainingSafetySignal {
  return {
    signalId: "stable-adaptive-review",
    requestedReviewLevel: "review_required_before_ordinary_training",
    authority: {
      source: "coach",
      sourceRef: "coach-review-fixture",
      evidenceBasis: ["Explicit review authority fixture."],
      reportedBy: "coach-fixture",
      reportedAt: "2026-08-12T12:00:00.000Z",
    },
    resolution: { state: "unresolved" },
    notes: [],
  };
}

describe("stable adaptive programming and response receivers", () => {
  it("classifies exact, related, and identity-only response evidence without collapsing realizations", () => {
    const fixture = buildStableAdaptiveResponseFixture();
    const trace = buildTrainingResponseReceiverTrace({
      history: fixture.history,
      asOf: AS_OF,
      currentPrescription: fixture.supportedReducedDose,
      prescriptions: [fixture.unsupportedHighDose, fixture.supportedReducedDose],
    });
    expect(trace.exactRealizationEvidence.map((entry) => entry.observationId))
      .toEqual([fixture.supportedTolerated.observationId]);
    expect(trace.relatedRealizationEvidence).toHaveLength(2);
    expect(trace.relatedRealizationEvidence[0]?.structuredDifferences).toEqual(
      expect.arrayContaining(["prescription_id", "load", "range", "support"]),
    );
    expect(trace.classifications).toEqual(expect.arrayContaining([
      "CONTINUITY_SUPPORTED",
      "CURRENT_PRESCRIPTION_MAY_CONTINUE",
      "PROGRESSION_REVIEW_PERMITTED",
    ]));

    const identityOnly: TrainingResponseObservation = {
      ...fixture.adverse,
      observationId: "identity-only-history",
      exposure: {
        realizationStatus: "partial_historical_report",
        exerciseId: fixture.adverse.exposure.exerciseId,
        realizedStressExposureIds: [],
      },
    };
    const identityTrace = buildTrainingResponseReceiverTrace({
      history: { observations: [identityOnly] },
      asOf: AS_OF,
      currentPrescription: fixture.supportedReducedDose,
      prescriptions: [fixture.supportedReducedDose],
    });
    expect(identityTrace.exerciseIdentityHistory[0]?.structuredDifferences)
      .toEqual(["realization_detail_unknown"]);
    expect(identityTrace.classifications).toEqual(["INSUFFICIENT_OR_MIXED_EVIDENCE"]);
  });

  it("routes poor current response through prescription review before replacement", () => {
    const fixture = buildStableAdaptiveResponseFixture();
    const trace = buildTrainingResponseReceiverTrace({
      history: { observations: [fixture.adverse] },
      asOf: AS_OF,
      currentPrescription: fixture.unsupportedHighDose,
      prescriptions: [fixture.unsupportedHighDose, fixture.supportedReducedDose],
    });
    expect(trace.classifications).toEqual([
      "HOLD_MONITOR_CURRENT_PRESCRIPTION",
      "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
    ]);
    expect(trace.classifications).not.toContain(
      "EXERCISE_REPLACEMENT_CONSIDERATION_EVIDENCE",
    );
    expect(trace.nextOwner).toBe("PRESCRIPTION_REVIEW_OWNER");
    expect(trace.prescriptionReviewPrecedesReplacement).toBe(true);
    expect(trace.automaticExerciseReplacement).toBe(false);
  });

  it("preserves mixed history and successful later re-exposure without permanent failure", () => {
    const fixture = buildStableAdaptiveResponseFixture();
    const trace = buildTrainingResponseReceiverTrace({
      history: fixture.history,
      asOf: AS_OF,
      currentPrescription: fixture.unsupportedHighDose,
      prescriptions: [fixture.unsupportedHighDose, fixture.supportedReducedDose],
    });
    expect(trace.mixedOrConflictingExactEvidence).toBe(true);
    expect(trace.successfulReExposure).toBe(true);
    expect(trace.adverseHistory.laterToleratedObservationIds)
      .toContain(fixture.laterUnsupportedTolerated.observationId);
    expect(trace.classifications).toContain("INSUFFICIENT_OR_MIXED_EVIDENCE");
    expect(trace.classifications).not.toContain(
      "EXERCISE_REPLACEMENT_CONSIDERATION_EVIDENCE",
    );
    expect(trace.continuityRecommendation).toBe("KEEP_UNLESS_OTHER_PROGRAMMING_REASON");
  });

  it("integrates current response with progression readiness without automatic progression", () => {
    const fixture = buildStableAdaptiveResponseFixture();
    const tolerated = buildTrainingResponseReceiverTrace({
      history: { observations: [fixture.supportedTolerated] },
      asOf: AS_OF,
      currentPrescription: fixture.supportedReducedDose,
      prescriptions: [fixture.supportedReducedDose],
    });
    const ready = buildProgressionReadinessTrace(
      readyEvidence(fixture.supportedReducedDose),
      tolerated,
    );
    expect(ready.classification).toBe("READY_FOR_PROGRESSION_REVIEW");
    expect(ready.blockers).not.toContain("pain_response_prescription_response_unresolved");
    expect(ready.automaticProgressionDecision).toBe(false);

    const aggravated = buildTrainingResponseReceiverTrace({
      history: { observations: [fixture.adverse] },
      asOf: AS_OF,
      currentPrescription: fixture.unsupportedHighDose,
      prescriptions: [fixture.unsupportedHighDose],
    });
    expect(buildProgressionReadinessTrace(
      readyEvidence(fixture.unsupportedHighDose),
      aggravated,
    ).classification).toBe("REGRESSION_OR_REVIEW_REQUIRED");

    const limitedObservation: TrainingResponseObservation = {
      ...fixture.adverse,
      observationId: "rdl-limited-current",
      tolerance: "limited",
      symptomChange: "unchanged",
      consequence: "modified",
    };
    const limited = buildTrainingResponseReceiverTrace({
      history: { observations: [limitedObservation] },
      asOf: AS_OF,
      currentPrescription: fixture.unsupportedHighDose,
      prescriptions: [fixture.unsupportedHighDose],
    });
    expect(buildProgressionReadinessTrace(
      readyEvidence(fixture.unsupportedHighDose),
      limited,
    ).classification).toBe("HOLD_CURRENT_PRESCRIPTION");
  });

  it("keeps side, support, and prose context from collapsing response truth", () => {
    const fixture = buildStableAdaptiveResponseFixture();
    const left: ExercisePrescription = {
      ...fixture.unsupportedHighDose,
      prescriptionId: "rdl-left",
      dose: {
        ...fixture.unsupportedHighDose.dose,
        load: {
          kind: "external_load",
          target: { kind: "exact", value: 20, unit: "kg" },
          application: "unilateral_side",
          side: "left",
        },
        sideBehavior: {
          movementSide: { kind: "single_side", side: "left" },
          loadSide: "left",
        },
      },
    };
    const right: ExercisePrescription = {
      ...left,
      prescriptionId: "rdl-right",
      dose: {
        ...left.dose,
        load: {
          kind: "external_load",
          target: { kind: "exact", value: 20, unit: "kg" },
          application: "unilateral_side",
          side: "right",
        },
        sideBehavior: {
          movementSide: { kind: "single_side", side: "right" },
          loadSide: "right",
        },
      },
    };
    const leftResponse: TrainingResponseObservation = {
      ...fixture.adverse,
      observationId: "rdl-left-response",
      exposure: {
        realizationStatus: "linked_to_prescription_only",
        exerciseId: left.exerciseId,
        prescriptionId: left.prescriptionId,
        realizedStressExposureIds: [],
      },
    };
    expect(buildTrainingResponseReceiverTrace({
      history: { observations: [leftResponse] },
      asOf: AS_OF,
      currentPrescription: right,
      prescriptions: [left, right],
      side: "right",
    }).classifications).toEqual(["NO_APPLICABLE_RESPONSE_EVIDENCE"]);

    const plain = buildTrainingResponseReceiverTrace({
      history: { observations: [fixture.supportedTolerated] },
      asOf: AS_OF,
      currentPrescription: fixture.supportedReducedDose,
      prescriptions: [fixture.supportedReducedDose],
    });
    const proseChanged = buildTrainingResponseReceiverTrace({
      history: { observations: [{
        ...fixture.supportedTolerated,
        notes: ["replace ban dangerous diagnostic prose"],
      }] },
      asOf: AS_OF,
      currentPrescription: fixture.supportedReducedDose,
      prescriptions: [fixture.supportedReducedDose],
    });
    expect(proseChanged.classifications).toEqual(plain.classifications);
    expect(proseChanged.nextOwner).toBe(plain.nextOwner);
  });

  it("implements the selected contextual scorer as explicit non-default omission semantics", () => {
    expect(CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY).toEqual(expect.objectContaining({
      categoryValues: { excellent: 8.8, good: 7.8, possible: 6.2, poor: 5.5 },
      phaseFamilyWeight: 1,
      unknownBehavior: "OMIT_COMPONENT_AND_WEIGHT",
    }));
    const poor = resolveContextualPhaseAnnotation({
      phaseId: "phase_2",
      requestedRole: "primary_strength",
      requestedSection: "main",
      exerciseId: "dumbbell-romanian-deadlift",
      annotations: [acceptedAnnotation({ id: "accepted-poor", suitability: "poor" })],
    });
    const poorScore = buildContextualPhasePolicyScoringTrace(poor);
    expect(poorScore.component?.value).toBe(5.5);
    expect(poorScore.componentWeightIncluded).toBe(true);
    expect(poorScore.phase1MechanicalControlBonusApplied).toBe(false);
    expect(poorScore.phase3LoadabilityBonusApplied).toBe(false);
    expect(poorScore.activeByDefault).toBe(false);

    const noMatch = resolveContextualPhaseAnnotation({
      phaseId: "phase_2",
      requestedRole: "primary_strength",
      requestedSection: "main",
      exerciseId: "dumbbell-romanian-deadlift",
      annotations: [],
    });
    expect(buildContextualPhasePolicyScoringTrace(noMatch)).toEqual(
      expect.objectContaining({
        component: null,
        componentWeightIncluded: false,
        omissionReason: "NO_CONTEXTUAL_MATCH",
      }),
    );

    const conflict = resolveContextualPhaseAnnotation({
      phaseId: "phase_2",
      requestedRole: "primary_strength",
      requestedSection: "main",
      exerciseId: "dumbbell-romanian-deadlift",
      annotations: [
        acceptedAnnotation({ id: "conflict-good", suitability: "good" }),
        acceptedAnnotation({ id: "conflict-poor", suitability: "poor" }),
      ],
    });
    expect(buildContextualPhasePolicyScoringTrace(conflict)).toEqual(
      expect.objectContaining({ component: null, omissionReason: "CONFLICT" }),
    );
  });

  it("keeps explicit TrainingSafety authority byte-neutral to candidate ranking", () => {
    const request = scenario("horizontal-pull-gym-neutral");
    const off = runCandidateRankingLab(request);
    const on = runCandidateRankingLab({
      ...request,
      trainingSafety: { signals: [safetySignal()] },
    });
    expect(JSON.stringify(on.rankedCandidates)).toBe(JSON.stringify(off.rankedCandidates));
    expect(JSON.stringify(on.hardRejectedCandidates)).toBe(JSON.stringify(off.hardRejectedCandidates));
    expect(on.trainingReadiness.downstreamTrainingAllowed).toBe(false);
    expect(off.trainingReadiness.downstreamTrainingAllowed).toBe(true);
  });

  it("keeps curation documents deterministic and records all current annotation decisions", () => {
    const phase = buildContextualPhaseProductionCurationData();
    expect(phase.currentRows).toHaveLength(90);
    expect(phase.currentCounts).toEqual({
      PROPOSE_ACCEPT: 16,
      KEEP_NEEDS_REVIEW: 5,
      KEEP_UNKNOWN: 6,
      REJECT_AS_WRONG_OWNER: 63,
    });
    expect(phase.sevenRows).toHaveLength(21);
    expect(readFileSync(join(
      __dirname,
      "../../../../docs/training-engine-v2/CONTEXTUAL_PHASE_PRODUCTION_CURATION.md",
    ), "utf8")).toBe(renderContextualPhaseProductionCuration(phase));

    const stress = buildLowBackRelevantRowStressCurationData();
    expect(stress.productionBehavior).toBe("UNCHANGED");
    expect(stress.facts.filter((fact) => fact.decision === "PROPOSE_ACCEPT_STRUCTURED"))
      .toHaveLength(2);
    expect(readFileSync(join(
      __dirname,
      "../../../../docs/training-engine-v2/LOW_BACK_RELEVANT_ROW_STRESS_CURATION.md",
    ), "utf8")).toBe(renderLowBackRelevantRowStressCuration(stress));
  });

  it("freezes deterministic response, policy, stress, and combined contracts", () => {
    const data = buildStableAdaptiveProgrammingPolicyData();
    expect(buildStableAdaptiveProgrammingPolicyData()).toEqual(data);
    expect(data.responseReceiverFingerprint).toBe(
      "26fe112e7c0fced67912e38e9118fed1808c973d74172d78af64f2ae4b6bb7d2",
    );
    expect(data.policyFingerprint).toBe(
      "97e6bd7ecabbbaf899e364ed779855be8b825351e5bbdea8e0b9cc84b774b7d4",
    );
    expect(data.stressFingerprint).toBe(
      "00d77d57851e2b8fec361a06ae48de85d6506d1818f87c8f0c85351f18bd56d3",
    );
    expect(data.combinedFingerprint).toBe(
      "5b236d5a64acccafa79b34ea2c0025898f316a0856763d6c25772a78f7e48fe4",
    );
  });

  it("records future anti-churn doctrine without implementing composers", () => {
    const blueprint = readFileSync(join(
      __dirname,
      "../../../../docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
    ), "utf8");
    expect(blueprint).toContain("Praxis is not a continuously regenerating workout system");
    expect(blueprint).toContain("less time -> less redundancy");
    expect(blueprint).toContain("Future Session/Week Composer acceptance tests");
    expect(blueprint).toContain("This order remains authoritative across phase boundaries");
  });
});
