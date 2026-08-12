import { describe, expect, it } from "vitest";
import {
  EMPTY_TRAINING_RESPONSE_HISTORY,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCanonicalPainEvidence,
  buildTrainingReadinessTrace,
  buildTrainingResponseLedger,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  validateTrainingResponseContext,
  validateTrainingResponseHistory,
  validateTrainingSafetyState,
  type CandidateRequest,
  type ExercisePerformanceRecord,
  type ExercisePrescription,
  type TrainingResponseObservation,
  type TrainingSafetySignal,
} from "../../src";
import { buildTrainingSafetyAndResponseFoundationData } from "../helpers/trainingSafetyAndResponseFoundation";

const AS_OF = "2026-08-12T23:00:00.000Z";

function scenario(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) throw new Error(`Missing controlled scenario ${id}.`);
  return { ...found.request, evaluationContext: { asOf: AS_OF } };
}

function safetySignal(
  overrides: Partial<TrainingSafetySignal> = {},
): TrainingSafetySignal {
  return {
    signalId: "explicit-low-severity-review",
    requestedReviewLevel: "review_required_before_ordinary_training",
    authority: {
      source: "clinician",
      sourceRef: "clinician-message-2026-08-12",
      evidenceBasis: ["Explicit external instruction to obtain review before ordinary training."],
      reportedBy: "clinician-42",
      reportedAt: "2026-08-12T12:00:00.000Z",
    },
    resolution: { state: "unresolved" },
    notes: [],
    ...overrides,
  };
}

function prescription(input: {
  readonly id: string;
  readonly exerciseId: string;
  readonly support?: "none" | "partial";
  readonly side?: "left" | "right";
}): ExercisePrescription {
  return {
    prescriptionId: input.id,
    sourceExposureEventId: `exposure-${input.id}`,
    exerciseId: input.exerciseId,
    phaseId: "phase_2",
    createdAt: "2026-08-12T10:00:00.000Z",
    dose: {
      mode: "repetition_sets",
      sets: { kind: "exact", value: 3, unit: "count" },
      repetitions: { kind: "exact", value: 8, unit: "count" },
      load: {
        kind: "external_load",
        target: { kind: "exact", value: 20, unit: "kg" },
        application: input.side ? "unilateral_side" : "total",
        side: input.side,
      },
      range: { kind: "full_available" },
      support: input.support ? { level: input.support, surface: input.support === "partial" ? "bench" : undefined } : undefined,
      sideBehavior: input.side
        ? {
            movementSide: { kind: "single_side", side: input.side },
            loadSide: input.side,
          }
        : undefined,
    },
    executionStandard: {
      alignmentPriorityIds: [],
      assessmentPriorityIds: [],
      criteria: [],
      exerciseMechanicsIntent: "Synthetic exact-exposure integration fixture.",
      painResponseRequirementIds: [],
      provenance: {
        source: "synthetic_contract_fixture",
        sourceRef: `fixture:${input.id}`,
      },
    },
    rationale: [],
    intendedProgressionAxes: ["load"],
    provenance: {
      source: "synthetic_contract_fixture",
      sourceRef: `fixture:${input.id}`,
    },
  };
}

function response(input: {
  readonly id: string;
  readonly occurredAt: string;
  readonly prescription: ExercisePrescription;
  readonly tolerance: TrainingResponseObservation["tolerance"];
  readonly symptomChange?: TrainingResponseObservation["symptomChange"];
  readonly performanceRecordId?: string;
  readonly region?: TrainingResponseObservation["reportedLocations"][number]["region"];
  readonly side?: TrainingResponseObservation["reportedLocations"][number]["side"];
  readonly notes?: readonly string[];
}): TrainingResponseObservation {
  return {
    observationId: input.id,
    occurredAt: input.occurredAt,
    exposure: input.performanceRecordId
      ? {
          realizationStatus: "linked_to_performance_record",
          exerciseId: input.prescription.exerciseId,
          prescriptionId: input.prescription.prescriptionId,
          performanceRecordId: input.performanceRecordId,
          sourceExposureEventId: input.prescription.sourceExposureEventId,
          realizedStressExposureIds: [`stress-${input.id}`],
        }
      : {
          realizationStatus: "linked_to_prescription_only",
          exerciseId: input.prescription.exerciseId,
          prescriptionId: input.prescription.prescriptionId,
          sourceExposureEventId: input.prescription.sourceExposureEventId,
          realizedStressExposureIds: [`stress-${input.id}`],
        },
    tolerance: input.tolerance,
    symptomChange: input.symptomChange ?? "unchanged",
    onset: input.tolerance === "tolerated" ? "not_applicable" : "during_exposure",
    persistence:
      input.tolerance === "tolerated"
        ? "not_applicable"
        : "resolved_before_next_relevant_exposure",
    consequence: input.tolerance === "tolerated" ? "completed" : "modified",
    reportedLocations: input.region
      ? [{ region: input.region, side: input.side ?? "unknown" }]
      : [],
    provenance: {
      source: "athlete_report",
      sourceRef: `athlete-report:${input.id}`,
      evidenceBasis: ["Structured response supplied for the exact exposure fixture."],
      reportedBy: "athlete-fixture",
      recordedAt: input.occurredAt,
    },
    notes: input.notes ?? [],
  };
}

function performance(
  observation: TrainingResponseObservation,
  linkedPrescription: ExercisePrescription,
): ExercisePerformanceRecord {
  const performanceRecordId = "performance-rdl-1";
  return {
    performanceRecordId,
    prescriptionId: linkedPrescription.prescriptionId,
    exerciseId: linkedPrescription.exerciseId,
    occurredAt: observation.occurredAt,
    completionStatus: "completed_as_planned",
    actualDose: linkedPrescription.dose,
    realizedStressExposureIds: observation.exposure.realizedStressExposureIds,
    qualityObservations: [],
    unresolvedPainResponseEvidenceIds: [],
    trainingResponseObservationIds: [observation.observationId],
    recoveryEvidenceIds: [],
    substitutions: [],
    notes: [],
    provenance: linkedPrescription.provenance,
  };
}

describe("training safety and response intelligence foundation", () => {
  it("keeps deterministic safety, response, and phase consequence contracts", () => {
    const data = buildTrainingSafetyAndResponseFoundationData();
    expect(buildTrainingSafetyAndResponseFoundationData()).toEqual(data);
    expect(data.phaseCalibrationConsequences.map((row) => [
      row.policyId,
      row.winnerChanges,
      row.closeOrderChanges,
    ])).toEqual([
      ["A_CURRENT", 0, 0],
      ["B_ANNOTATION_ONLY", 0, 0],
      ["C_NO_PHASE_COMPONENT", 5, 13],
      ["D_WEIGHT_05", 3, 6],
      ["E_GENTLE_GAP", 3, 6],
      ["E_MODERATE_GAP", 0, 0],
    ]);
    expect(data.safetyFingerprint).toBe(
      "0a0805117529073887fe7aca94a1bc2f097e53e1de14d320b1e37093a8825048",
    );
    expect(data.responseFingerprint).toBe(
      "33aec8bb8433d0bf27f63b3fe76e0c6349708e4da47608a5d6957687818453ec",
    );
    expect(data.combinedFingerprint).toBe(
      "539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562",
    );
  });

  it("keeps lumbar region alone separate from every mechanical intolerance", () => {
    const regionOnly = {
      kind: "current_discomfort" as const,
      id: "lumbar-region-only",
      region: "lumbar_spine" as const,
      severity0To10: 2 as const,
      stressTags: [],
      effect: "monitor" as const,
      description: "Description is non-executable.",
    };
    for (const exercise of REFERENCE_EXERCISES) {
      const evidence = buildCanonicalPainEvidence({
        exercise,
        painAndInjury: { ...NO_PAIN_OR_INJURY, currentDiscomforts: [regionOnly] },
      });
      expect(evidence.signalMatches, exercise.id).toEqual([]);
    }
  });

  it("uses explicit safety authority, never pain severity, for the independent gate", () => {
    const base = scenario("horizontal-pull-gym-neutral");
    const severityTwo = {
      ...base,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        currentDiscomforts: [{
          kind: "current_discomfort" as const,
          id: "severity-two",
          region: "lumbar_spine" as const,
          severity0To10: 2 as const,
          stressTags: [],
          effect: "monitor" as const,
          description: "Low severity does not prove safety or danger.",
        }],
      },
    };
    const baseline = runCandidateRankingLab(severityTwo);
    const explicitlyBlocked = runCandidateRankingLab({
      ...severityTwo,
      trainingSafety: { signals: [safetySignal()] },
    });

    expect(baseline.trainingReadiness.status).toBe("TRAINING_ALLOWED");
    expect(explicitlyBlocked.trainingReadiness).toEqual(expect.objectContaining({
      status: "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING",
      downstreamTrainingAllowed: false,
      unresolvedSignalIds: ["explicit-low-severity-review"],
    }));
    expect(explicitlyBlocked.rankedCandidates.map((item) => [item.exercise.id, item.total]))
      .toEqual(baseline.rankedCandidates.map((item) => [item.exercise.id, item.total]));
    expect(explicitlyBlocked.hardRejectedCandidates).toEqual(baseline.hardRejectedCandidates);
  });

  it("bridges only explicit legacy urgent authority and not high severity itself", () => {
    const highWithoutUrgency = buildTrainingReadinessTrace({
      acuteSeverePain: [{
        kind: "acute_severe_pain",
        id: "high-no-urgent-authority",
        region: "lumbar_spine",
        severity0To10: 9,
        stressTags: [],
        invalidatesTrainingRoles: [],
        urgentReviewRecommended: false,
        description: "Severity and prose do not create the bridge.",
      }],
    });
    const explicitLegacyUrgency = buildTrainingReadinessTrace({
      acuteSeverePain: [{
        kind: "acute_severe_pain",
        id: "legacy-explicit-urgent",
        region: "lumbar_spine",
        severity0To10: 7,
        stressTags: [],
        invalidatesTrainingRoles: [],
        urgentReviewRecommended: true,
        description: "Explicit legacy flag is preserved.",
      }],
    });

    expect(highWithoutUrgency.status).toBe("TRAINING_ALLOWED");
    expect(explicitLegacyUrgency.status).toBe("URGENT_EXTERNAL_REVIEW_REQUIRED");
    expect(explicitLegacyUrgency.evidence[0]?.source).toBe(
      "legacy_acute_severe_pain_explicit_urgent_bridge",
    );
  });

  it("requires external resolution and never self-resolves with time", () => {
    const unresolved = safetySignal();
    expect(buildTrainingReadinessTrace({
      trainingSafety: { signals: [unresolved] },
    }).downstreamTrainingAllowed).toBe(false);
    const resolved = safetySignal({
      resolution: {
        state: "externally_resolved",
        resolvedAt: "2026-08-12T18:00:00.000Z",
        resolvedBy: "clinician-42",
        sourceRef: "clinician-clearance-2026-08-19",
        evidenceBasis: ["Explicit external resolution supplied to the engine."],
      },
    });
    expect(buildTrainingReadinessTrace({
      trainingSafety: { signals: [resolved] },
    })).toEqual(expect.objectContaining({
      downstreamTrainingAllowed: true,
      externallyResolvedSignalIds: [resolved.signalId],
    }));
    expect(validateTrainingSafetyState({ signals: [resolved] })).toEqual([]);
  });

  it("keeps one RDL realization distinct from identity and later realizations", () => {
    const first = prescription({ id: "rdl-dose-1", exerciseId: "dumbbell-romanian-deadlift" });
    const second = prescription({ id: "rdl-dose-2", exerciseId: "dumbbell-romanian-deadlift" });
    const tolerated = response({ id: "rdl-tolerated-1", occurredAt: "2026-08-01T12:00:00.000Z", prescription: first, tolerance: "tolerated" });
    const history = { observations: [tolerated] };

    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: first.exerciseId, prescriptionId: first.prescriptionId }).observationIds)
      .toEqual([tolerated.observationId]);
    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: second.exerciseId, prescriptionId: second.prescriptionId }).observationIds)
      .toEqual([]);
  });

  it("does not turn one adverse suitcase-carry realization into a permanent hard block", () => {
    const base = scenario("horizontal-pull-gym-neutral");
    const request: CandidateRequest = {
      ...base,
      id: "suitcase-response-ranking-neutrality",
      need: {
        ...base.need,
        requestedRole: "capacity",
        requestedSection: "main",
        targetMovementRoles: ["carry"],
        targetMuscles: ["trunk"],
      },
      candidatePool: REFERENCE_EXERCISES.filter((candidate) =>
        candidate.id === "farmer-carry" || candidate.id === "suitcase-carry"
      ),
    };
    const baseline = runCandidateRankingLab(request);
    const suitcase = prescription({ id: "suitcase-limited", exerciseId: "suitcase-carry", side: "left" });
    const aggravated = response({ id: "suitcase-aggravated", occurredAt: "2026-08-01T12:00:00.000Z", prescription: suitcase, tolerance: "not_tolerated", symptomChange: "worsened", side: "left", region: "lumbar_spine" });
    const withHistory = runCandidateRankingLab({
      ...request,
      history: {
        ...request.history,
        trainingResponseHistory: { observations: [aggravated] },
      },
    });

    expect(withHistory.rankedCandidates.map((item) => [item.exercise.id, item.total]))
      .toEqual(baseline.rankedCandidates.map((item) => [item.exercise.id, item.total]));
    expect(withHistory.hardRejectedCandidates.map((item) => item.exercise.id))
      .toEqual(baseline.hardRejectedCandidates.map((item) => item.exercise.id));
  });

  it("preserves later tolerated suitcase re-exposure and mixed history without thresholds", () => {
    const first = prescription({ id: "suitcase-first", exerciseId: "suitcase-carry", side: "left" });
    const later = prescription({ id: "suitcase-later", exerciseId: "suitcase-carry", side: "left" });
    const limited = response({ id: "suitcase-limited-first", occurredAt: "2026-08-01T12:00:00.000Z", prescription: first, tolerance: "limited", symptomChange: "worsened", side: "left" });
    const tolerated = response({ id: "suitcase-tolerated-later", occurredAt: "2026-08-10T12:00:00.000Z", prescription: later, tolerance: "tolerated", side: "left" });
    const ledger = buildTrainingResponseLedger({
      history: { observations: [tolerated, limited] },
      asOf: AS_OF,
      exerciseId: first.exerciseId,
      prescriptions: [first, later],
    });

    expect(ledger.observationIds).toEqual([limited.observationId, tolerated.observationId]);
    expect(ledger.latestApplicableResponse?.observationId).toBe(tolerated.observationId);
    expect(ledger.hasLaterToleratedExposureAfterLimitedOrNotTolerated).toBe(true);
    expect(ledger.earlierAdverseObservationIdsWithLaterToleratedExposure).toEqual([limited.observationId]);
    expect(ledger.evidenceStatus).toBe("MIXED_OR_CONFLICTING_HISTORY");
  });

  it("does not let tolerated wall-supported march prove unsupported carry tolerance", () => {
    const unsupported = prescription({ id: "suitcase-unsupported", exerciseId: "suitcase-carry", support: "none", side: "left" });
    const supported = prescription({ id: "wall-march-supported", exerciseId: "wall-supported-suitcase-march", support: "partial", side: "left" });
    const limited = response({ id: "unsupported-limited", occurredAt: "2026-08-01T12:00:00.000Z", prescription: unsupported, tolerance: "limited" });
    const tolerated = response({ id: "supported-tolerated", occurredAt: "2026-08-02T12:00:00.000Z", prescription: supported, tolerance: "tolerated" });
    const laterUnsupported = response({ id: "unsupported-later-tolerated", occurredAt: "2026-08-10T12:00:00.000Z", prescription: unsupported, tolerance: "tolerated" });
    const history = { observations: [limited, tolerated, laterUnsupported] };

    expect(buildTrainingResponseLedger({ history, asOf: "2026-08-05T00:00:00.000Z", exerciseId: unsupported.exerciseId }).latestApplicableResponse?.classification)
      .toBe("LIMITED_EXPOSURE");
    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: supported.exerciseId }).latestApplicableResponse?.classification)
      .toBe("UNCHANGED_RESPONSE");
    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: unsupported.exerciseId }).hasLaterToleratedExposureAfterLimitedOrNotTolerated)
      .toBe(true);
  });

  it("does not apply left-side suitcase response evidence to right-side realization", () => {
    const left = prescription({ id: "suitcase-left", exerciseId: "suitcase-carry", side: "left" });
    const right = prescription({ id: "suitcase-right", exerciseId: "suitcase-carry", side: "right" });
    const leftResponse = response({ id: "left-response", occurredAt: "2026-08-01T12:00:00.000Z", prescription: left, tolerance: "limited", region: "lumbar_spine", side: "left" });
    const history = { observations: [leftResponse] };

    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: left.exerciseId, side: "left", prescriptions: [left, right] }).observationIds)
      .toEqual([leftResponse.observationId]);
    expect(buildTrainingResponseLedger({ history, asOf: AS_OF, exerciseId: right.exerciseId, side: "right", prescriptions: [left, right] }).observationIds)
      .toEqual([]);
  });

  it("keeps resolved injury observational while hard restriction retains authority", () => {
    const request = scenario("lower-hinge-capability-missing");
    const baseline = runCandidateRankingLab(request);
    const historical = runCandidateRankingLab({
      ...request,
      painAndInjury: {
        ...request.painAndInjury,
        historicalInjuries: [{
          kind: "historical_injury",
          id: "resolved-low-back-history",
          region: "lumbar_spine",
          status: "resolved",
          relevantStressTags: ["loaded_hinge"],
          description: "Resolved history remains observational.",
        }],
      },
    });
    expect(historical.rankedCandidates.map((item) => [item.exercise.id, item.total]))
      .toEqual(baseline.rankedCandidates.map((item) => [item.exercise.id, item.total]));

    const restricted = runCandidateRankingLab({
      ...request,
      painAndInjury: {
        ...request.painAndInjury,
        hardContraindications: [{
          kind: "hard_contraindication",
          id: "explicit-rdl-restriction",
          exerciseIds: ["dumbbell-romanian-deadlift"],
          reason: "Explicit athlete restriction fixture.",
          source: "athlete_report",
        }],
      },
    });
    expect(restricted.hardRejectedCandidates.map((item) => item.exercise.id))
      .toContain("dumbbell-romanian-deadlift");
  });

  it("integrates response IDs with performance records and validates provenance", () => {
    const linkedPrescription = prescription({ id: "rdl-performance", exerciseId: "dumbbell-romanian-deadlift" });
    const linkedResponse = response({
      id: "rdl-performance-response",
      occurredAt: "2026-08-12T12:00:00.000Z",
      prescription: linkedPrescription,
      tolerance: "tolerated",
      performanceRecordId: "performance-rdl-1",
    });
    const linkedPerformance = performance(linkedResponse, linkedPrescription);

    expect(validateTrainingResponseHistory({ observations: [linkedResponse] })).toEqual([]);
    expect(validateTrainingResponseContext({
      history: { observations: [linkedResponse] },
      prescriptions: [linkedPrescription],
      performanceRecords: [linkedPerformance],
    })).toEqual([]);
  });

  it("never parses notes or descriptions into safety or response behavior", () => {
    const plain = safetySignal({ notes: ["ordinary note"] });
    const alarming = safetySignal({ notes: ["urgent dangerous diagnosis stop everything"] });
    expect(buildTrainingReadinessTrace({ trainingSafety: { signals: [plain] } }).status)
      .toBe(buildTrainingReadinessTrace({ trainingSafety: { signals: [alarming] } }).status);

    const linkedPrescription = prescription({ id: "notes-response", exerciseId: "dumbbell-romanian-deadlift" });
    const first = response({ id: "notes-first", occurredAt: "2026-08-12T12:00:00.000Z", prescription: linkedPrescription, tolerance: "tolerated", notes: ["fine"] });
    const second = { ...first, notes: ["diagnostic sounding prose must remain inert"] };
    const firstLedger = buildTrainingResponseLedger({ history: { observations: [first] }, asOf: AS_OF, exerciseId: linkedPrescription.exerciseId });
    const secondLedger = buildTrainingResponseLedger({ history: { observations: [second] }, asOf: AS_OF, exerciseId: linkedPrescription.exerciseId });
    expect(secondLedger.latestApplicableResponse?.classification)
      .toBe(firstLedger.latestApplicableResponse?.classification);
  });

  it("preserves explicit unknown for incomplete historical observations", () => {
    expect(buildTrainingResponseLedger({
      history: EMPTY_TRAINING_RESPONSE_HISTORY,
      asOf: AS_OF,
      exerciseId: "dumbbell-romanian-deadlift",
    }).evidenceStatus).toBe("NO_APPLICABLE_EVIDENCE");
  });
});
