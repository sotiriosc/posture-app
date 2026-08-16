import { describe, expect, it } from "vitest";
import {
  CANDIDATE_PAIN_SCORING_COEFFICIENTS,
  DEFAULT_CANDIDATE_SCORING_WEIGHTS,
  NO_PAIN_OR_INJURY,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  buildCandidatePainMatchTrace,
  getControlledCandidateScenario,
  receiverDecision,
  runCandidateRankingLab,
  type CandidatePainMatchTrace,
  type CandidateRequest,
  type ExerciseDefinition,
  type JointStressTag,
  type PainAndInjuryState,
  type RankedCandidate,
} from "../../src";

function request(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing controlled scenario ${id}.`);
  }

  return found.request;
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}.`);
  }

  return found;
}

function stressProbe(input: {
  readonly joint?: readonly JointStressTag[];
  readonly caution?: readonly JointStressTag[];
  readonly contraindicated?: readonly JointStressTag[];
}): ExerciseDefinition {
  const base = exercise("goblet-squat");

  return {
    ...base,
    id: "canonical-pain-stress-probe",
    name: "Canonical Pain Stress Probe",
    loading: {
      ...base.loading,
      axialLoading: "low",
      jointStressTags: input.joint ?? [],
    },
    cautionStressTags: input.caution ?? [],
    contraindicatedStressTags: input.contraindicated ?? [],
  };
}

function painState(
  overrides: Partial<PainAndInjuryState>,
): PainAndInjuryState {
  return {
    ...NO_PAIN_OR_INJURY,
    ...overrides,
  };
}

function currentPain(input: {
  readonly id?: string;
  readonly stressTags: readonly JointStressTag[];
  readonly effect?: "monitor" | "prefer_support" | "reduce_range" | "reduce_load";
}): PainAndInjuryState["currentDiscomforts"][number] {
  return {
    kind: "current_discomfort",
    id: input.id ?? "current-pain-probe",
    region: "knee",
    severity0To10: 2,
    stressTags: input.stressTags,
    effect: input.effect ?? "prefer_support",
    description: "Canonical current-discomfort probe.",
  };
}

function moderatePain(input: {
  readonly id?: string;
  readonly stressTags: readonly JointStressTag[];
  readonly requiredResponse?: "avoid_aggravator" | "reduce_load_and_range" | "substitute_role";
}): PainAndInjuryState["moderatePain"][number] {
  return {
    kind: "moderate_pain",
    id: input.id ?? "moderate-pain-probe",
    region: "knee",
    severity0To10: 4,
    stressTags: input.stressTags,
    requiredResponse: input.requiredResponse ?? "avoid_aggravator",
    description: "Canonical moderate-pain probe.",
  };
}

function candidateRequest(input: {
  readonly candidate: ExerciseDefinition;
  readonly pain: PainAndInjuryState;
  readonly id?: string;
}): CandidateRequest {
  const base = request("lower-squat-phase-1");

  return {
    ...base,
    id: input.id ?? "canonical-pain-contract-probe",
    painAndInjury: input.pain,
    candidatePool: [input.candidate],
  };
}

function rankedCandidate(input: CandidateRequest): RankedCandidate {
  const result = runCandidateRankingLab(input);
  const candidate = result.rankedCandidates[0];
  if (!candidate) {
    throw new Error(`Expected a legal candidate for ${input.id}.`);
  }

  return candidate;
}

function component(candidate: RankedCandidate, id: string): number {
  const found = candidate.components.find((score) => score.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}.`);
  }

  return found.rawValue;
}

function traceFor(input: {
  readonly candidate: ExerciseDefinition;
  readonly pain: PainAndInjuryState;
  readonly requestedRole?: string;
}): CandidatePainMatchTrace {
  return buildCandidatePainMatchTrace({
    exercise: input.candidate,
    painAndInjury: input.pain,
    requestedRole: input.requestedRole ?? "primary_strength",
  });
}

describe("canonical pain match contract", () => {
  it("deduplicates one signal/tag across joint and caution sources without losing provenance", () => {
    const candidate = stressProbe({
      joint: ["loaded_knee_flexion"],
      caution: ["loaded_knee_flexion"],
    });
    const trace = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [
          currentPain({
            stressTags: ["loaded_knee_flexion", "loaded_knee_flexion"],
          }),
        ],
      }),
    });

    expect(trace.exerciseStressFacts).toEqual([
      {
        tag: "loaded_knee_flexion",
        sources: ["joint_stress", "caution"],
      },
    ]);
    expect(trace.signalMatches).toHaveLength(1);
    expect(trace.signalMatches[0]).toEqual(
      expect.objectContaining({
        signalId: "current-pain-probe",
        stressTag: "loaded_knee_flexion",
        exerciseSources: ["joint_stress", "caution"],
      }),
    );
    expect(receiverDecision(trace, "pain_suitability").countedMatchUnitCount).toBe(1);
    expect(receiverDecision(trace, "joint_cost").countedMatchUnitCount).toBe(1);
  });

  it("counts two tags from one signal and one shared tag from two signal IDs as distinct facts", () => {
    const candidate = stressProbe({
      joint: ["deep_knee_flexion", "loaded_knee_flexion"],
    });
    const twoTags = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [
          currentPain({ stressTags: ["deep_knee_flexion", "loaded_knee_flexion"] }),
        ],
      }),
    });
    const twoSignals = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [
          currentPain({ id: "signal-a", stressTags: ["loaded_knee_flexion"] }),
          currentPain({ id: "signal-b", stressTags: ["loaded_knee_flexion"] }),
        ],
      }),
    });

    expect(twoTags.signalMatches.map((match) => match.matchId)).toEqual([
      "current-pain-probe:deep_knee_flexion",
      "current-pain-probe:loaded_knee_flexion",
    ]);
    expect(receiverDecision(twoTags, "pain_suitability").countedMatchUnitCount).toBe(2);
    expect(twoSignals.signalMatches.map((match) => match.signalId)).toEqual([
      "signal-a",
      "signal-b",
    ]);
    expect(receiverDecision(twoSignals, "joint_cost").countedMatchUnitCount).toBe(2);
  });

  it("keeps contraindicated-only facts visible without automatically charging joint cost or rejecting", () => {
    const candidate = stressProbe({ contraindicated: ["high_impact"] });
    const trace = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [currentPain({ stressTags: ["high_impact"] })],
        moderatePain: [moderatePain({ stressTags: ["high_impact"] })],
      }),
    });

    expect(trace.signalMatches).toHaveLength(2);
    expect(receiverDecision(trace, "pain_suitability").countedMatchUnitCount).toBe(2);
    expect(receiverDecision(trace, "joint_cost").countedMatchUnitCount).toBe(0);
    expect(receiverDecision(trace, "moderate_warning").affectedSignalIds).toEqual([
      "moderate-pain-probe",
    ]);
    expect(receiverDecision(trace, "hard_contraindication").executionStatus).toBe("legal");
    expect(receiverDecision(trace, "acute_severe_eligibility").executionStatus).toBe("legal");
  });

  it.each([
    ["joint-only", { joint: ["loaded_knee_flexion"] }],
    ["caution-only", { caution: ["loaded_knee_flexion"] }],
    ["contraindicated-only", { contraindicated: ["loaded_knee_flexion"] }],
  ] as const)("emits one non-hard moderate warning for %s metadata", (_label, sources) => {
    const candidate = stressProbe(sources);
    const result = runCandidateRankingLab(candidateRequest({
      candidate,
      pain: painState({
        moderatePain: [moderatePain({
          stressTags: ["loaded_knee_flexion", "loaded_knee_flexion"],
          requiredResponse: "reduce_load_and_range",
        })],
      }),
    }));

    expect(result.hardRejectedCandidates).toHaveLength(0);
    expect(result.rankedCandidates).toHaveLength(1);
    expect(result.rankedCandidates[0]?.eligibility.warnings).toHaveLength(1);
    expect(result.rankedCandidates[0]?.eligibility.warnings[0]?.painEvidence).toEqual(
      expect.objectContaining({
        receiver: "moderate_warning",
        signalId: "moderate-pain-probe",
        severity: 4,
        requestedAction: "reduce_load_and_range",
      }),
    );
    expect(result.rankedCandidates[0]?.painMatchTrace.signalMatches).toHaveLength(1);
    expect(result.rankedCandidates[0]?.painMatchTrace.receiverDecisions.find(
      (decision) => decision.receiver === "moderate_warning",
    )?.affectedSignalIds).toEqual(["moderate-pain-probe"]);
    expect(result.rankedCandidates[0]?.painMatchTrace.responseRequirements[0]).toEqual(
      expect.objectContaining({
        requestedAction: "reduce_load_and_range",
        primaryFutureOwner: "prescription",
        executionStatus: "deferred_unexecutable_at_candidate_layer",
      }),
    );
    expect(result.decisionTrace.hardRejections).toHaveLength(0);
  });

  it("preserves exact-exercise hard authority and its source", () => {
    const candidate = stressProbe({ caution: ["loaded_knee_flexion"] });
    const result = runCandidateRankingLab(candidateRequest({
      candidate,
      pain: painState({
        hardContraindications: [{
          kind: "hard_contraindication",
          id: "hard-exercise-probe",
          exerciseIds: [candidate.id],
          reason: "Explicit exercise restriction.",
          source: "clinician",
        }],
      }),
    }));
    const reason = result.hardRejectedCandidates[0]?.eligibility.rejectionReasons.find(
      (candidateReason) => candidateReason.code === "HARD_CONTRAINDICATION",
    );

    expect(result.rankedCandidates).toHaveLength(0);
    expect(reason?.painEvidence).toEqual(
      expect.objectContaining({
        receiver: "hard_contraindication",
        signalId: "hard-exercise-probe",
        authoritySource: "clinician",
      }),
    );
    expect(reason?.painEvidence?.criteria).toEqual([
      expect.objectContaining({
        kind: "exercise_id",
        exerciseId: candidate.id,
        authoritySource: "clinician",
      }),
    ]);
  });

  it.each([
    ["joint_stress", { joint: ["loaded_knee_flexion"] }, true],
    ["contraindicated", { contraindicated: ["loaded_knee_flexion"] }, true],
    ["caution", { caution: ["loaded_knee_flexion"] }, false],
  ] as const)(
    "applies explicit hard stress authority for %s provenance only when allowed",
    (_source, sources, rejects) => {
      const candidate = stressProbe(sources);
      const result = runCandidateRankingLab(candidateRequest({
        candidate,
        pain: painState({
          hardContraindications: [{
            kind: "hard_contraindication",
            id: "hard-stress-probe",
            stressTags: ["loaded_knee_flexion"],
            reason: "Explicit stress restriction.",
            source: "safety_rule",
          }],
        }),
      }));

      expect(result.hardRejectedCandidates).toHaveLength(rejects ? 1 : 0);
      expect(result.rankedCandidates).toHaveLength(rejects ? 0 : 1);
      const trace = rejects
        ? result.hardRejectedCandidates[0]?.eligibility.painMatchTrace
        : result.rankedCandidates[0]?.painMatchTrace;
      expect(receiverDecision(trace!, "hard_contraindication").executionStatus).toBe(
        rejects ? "hard_rejected" : "legal",
      );
    },
  );

  it("keeps acute role invalidation hard and preserves urgent review even without a stress rejection", () => {
    const candidate = stressProbe({ contraindicated: ["high_impact"] });
    const roleResult = runCandidateRankingLab(candidateRequest({
      candidate,
      pain: painState({
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "acute-role-probe",
          region: "knee",
          severity0To10: 8,
          stressTags: [],
          invalidatesTrainingRoles: ["primary_strength"],
          urgentReviewRecommended: true,
          description: "Acute role invalidation probe.",
        }],
      }),
    }));
    const nonBlockingResult = runCandidateRankingLab(candidateRequest({
      candidate,
      pain: painState({
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "acute-urgency-probe",
          region: "knee",
          severity0To10: 8,
          stressTags: ["high_impact"],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: true,
          description: "Acute urgency probe.",
        }],
      }),
    }));

    expect(roleResult.hardRejectedCandidates).toHaveLength(1);
    expect(roleResult.hardRejectedCandidates[0]?.eligibility.rejectionReasons[0]?.painEvidence)
      .toEqual(expect.objectContaining({
        receiver: "acute_severe_eligibility",
        severity: 8,
        urgentReviewRecommended: true,
      }));
    expect(roleResult.hardRejectedCandidates[0]?.eligibility.painMatchTrace.responseRequirements)
      .toEqual([
        expect.objectContaining({
          signalId: "acute-role-probe",
          executionStatus: "unresolved_urgent_review_required",
        }),
      ]);
    expect(nonBlockingResult.hardRejectedCandidates).toHaveLength(0);
    expect(nonBlockingResult.rankedCandidates[0]?.painMatchTrace.responseRequirements).toEqual([
      expect.objectContaining({
        signalId: "acute-urgency-probe",
        requestedAction: "urgent_review",
        primaryFutureOwner: "external_urgent_review",
        executionStatus: "unresolved_urgent_review_required",
      }),
    ]);
    expect(nonBlockingResult.decisionTrace.candidatePainSummaries[0]?.urgentReviewSignalIds).toEqual([
      "acute-urgency-probe",
    ]);
  });

  it.each([
    ["joint_stress", { joint: ["loaded_knee_flexion"] }, true],
    ["caution", { caution: ["loaded_knee_flexion"] }, false],
    ["contraindicated", { contraindicated: ["loaded_knee_flexion"] }, false],
  ] as const)("keeps the explicit acute stress filter for %s provenance", (_source, sources, rejects) => {
    const candidate = stressProbe(sources);
    const result = runCandidateRankingLab(candidateRequest({
      candidate,
      pain: painState({
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "acute-source-probe",
          region: "knee",
          severity0To10: 7,
          stressTags: ["loaded_knee_flexion"],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: true,
          description: "Acute source-filter probe.",
        }],
      }),
    }));

    expect(result.hardRejectedCandidates).toHaveLength(rejects ? 1 : 0);
    expect(result.rankedCandidates).toHaveLength(rejects ? 0 : 1);
  });

  it("exposes distinct moderate response ownership without changing numeric candidate scores", () => {
    const candidate = stressProbe({
      joint: ["loaded_knee_flexion"],
      caution: ["loaded_knee_flexion"],
    });
    const actions = [
      "avoid_aggravator",
      "reduce_load_and_range",
      "substitute_role",
    ] as const;
    const results = actions.map((requiredResponse) =>
      rankedCandidate(candidateRequest({
        candidate,
        pain: painState({
          moderatePain: [moderatePain({
            stressTags: ["loaded_knee_flexion"],
            requiredResponse,
          })],
        }),
        id: `moderate-response-${requiredResponse}`,
      })),
    );

    expect(results.map((result) => ({
      total: result.total,
      pain: component(result, "pain_suitability"),
      joint: component(result, "joint_cost"),
    }))).toEqual([
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
    ]);
    expect(new Set(results.map((result) => result.total))).toHaveLength(1);
    expect(results.map((result) => result.painMatchTrace.responseRequirements[0])).toEqual([
      expect.objectContaining({
        requestedAction: "avoid_aggravator",
        primaryFutureOwner: "candidate_review",
        executionStatus: "policy_unresolved_candidate_review_required",
      }),
      expect.objectContaining({
        requestedAction: "reduce_load_and_range",
        primaryFutureOwner: "prescription",
        executionStatus: "deferred_unexecutable_at_candidate_layer",
      }),
      expect.objectContaining({
        requestedAction: "substitute_role",
        primaryFutureOwner: "session_intent_or_session_composer",
        executionStatus: "deferred_unexecutable_at_candidate_layer",
      }),
    ]);
    expect(results[2]?.exercise.trainingRoles).toContain("primary_strength");

    const substituteRequest = candidateRequest({
      candidate,
      pain: painState({
        moderatePain: [moderatePain({
          stressTags: ["loaded_knee_flexion"],
          requiredResponse: "substitute_role",
        })],
      }),
      id: "substitute-role-does-not-bypass-truth",
    });
    const substituteResult = runCandidateRankingLab({
      ...substituteRequest,
      candidatePool: [candidate, exercise("machine-row")],
    });
    expect(substituteResult.rankedCandidates.map((ranked) => ranked.exercise.id)).toEqual([
      candidate.id,
    ]);
    expect(substituteResult.hardRejectedCandidates.find(
      (rejected) => rejected.exercise.id === "machine-row",
    )?.eligibility.rejectionReasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining(["MOVEMENT_ROLE_MISMATCH"]),
    );
  });

  it("preserves current effects and historical modifications without claiming execution", () => {
    const candidate = stressProbe({ joint: ["loaded_knee_flexion"] });
    const currentTrace = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [
          currentPain({ id: "monitor", stressTags: ["loaded_knee_flexion"], effect: "monitor" }),
          currentPain({ id: "support", stressTags: ["loaded_knee_flexion"], effect: "prefer_support" }),
          currentPain({ id: "range", stressTags: ["loaded_knee_flexion"], effect: "reduce_range" }),
          currentPain({ id: "load", stressTags: ["loaded_knee_flexion"], effect: "reduce_load" }),
        ],
      }),
    });
    const historicalTrace = traceFor({
      candidate,
      pain: painState({
        historicalSensitivities: [
          {
            kind: "historical_sensitivity",
            id: "historical-monitor",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            preferredModification: "monitor",
            description: "Monitor historical response.",
          },
          {
            kind: "historical_sensitivity",
            id: "historical-support",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            preferredModification: "increase_support",
            description: "Increase support.",
          },
          {
            kind: "historical_sensitivity",
            id: "historical-range",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            preferredModification: "reduce_range",
            description: "Reduce range.",
          },
          {
            kind: "historical_sensitivity",
            id: "historical-load",
            region: "knee",
            stressTags: ["loaded_knee_flexion"],
            preferredModification: "reduce_load",
            description: "Reduce load.",
          },
        ],
      }),
    });

    expect(currentTrace.responseRequirements.map((requirement) => ({
      action: requirement.requestedAction,
      owner: requirement.primaryFutureOwner,
      status: requirement.executionStatus,
    }))).toEqual([
      {
        action: "reduce_load",
        owner: "prescription",
        status: "deferred_unexecutable_at_candidate_layer",
      },
      {
        action: "monitor",
        owner: "observation",
        status: "observed_no_modification_applied",
      },
      {
        action: "reduce_range",
        owner: "prescription",
        status: "deferred_unexecutable_at_candidate_layer",
      },
      {
        action: "prefer_support",
        owner: "future_candidate_prescription_or_session",
        status: "deferred_unexecutable_at_candidate_layer",
      },
    ]);
    expect(historicalTrace.responseRequirements.map((requirement) => ({
      action: requirement.requestedAction,
      owner: requirement.primaryFutureOwner,
      status: requirement.executionStatus,
    }))).toEqual([
      {
        action: "reduce_load",
        owner: "prescription",
        status: "deferred_unexecutable_at_candidate_layer",
      },
      {
        action: "monitor",
        owner: "observation",
        status: "observed_no_modification_applied",
      },
      {
        action: "reduce_range",
        owner: "prescription",
        status: "deferred_unexecutable_at_candidate_layer",
      },
      {
        action: "increase_support",
        owner: "future_candidate_prescription_or_session",
        status: "deferred_unexecutable_at_candidate_layer",
      },
    ]);
  });

  it("keeps monitor observable without requiring a candidate stress match", () => {
    const candidate = stressProbe({ joint: ["loaded_knee_flexion"] });
    const trace = traceFor({
      candidate,
      pain: painState({
        currentDiscomforts: [
          currentPain({
            id: "unmatched-monitor",
            stressTags: ["horizontal_pressing"],
            effect: "monitor",
          }),
        ],
      }),
    });

    expect(trace.signalMatches).toHaveLength(0);
    expect(trace.responseRequirements).toEqual([
      expect.objectContaining({
        signalId: "unmatched-monitor",
        requestedAction: "monitor",
        primaryFutureOwner: "observation",
        executionStatus: "observed_no_modification_applied",
      }),
    ]);
  });

  it("exposes the exact moderate action in assessment demand-reduction context", () => {
    const base = request("lower-hinge-moderate-low-back-pain");
    const responses = [
      "avoid_aggravator",
      "reduce_load_and_range",
      "substitute_role",
    ] as const;

    for (const requiredResponse of responses) {
      const result = runCandidateRankingLab({
        ...base,
        id: `assessment-action-${requiredResponse}`,
        painAndInjury: painState({
          moderatePain: [{
            ...base.painAndInjury.moderatePain[0]!,
            requiredResponse,
          }],
        }),
      });
      const candidate = result.rankedCandidates.find(
        (ranked) => ranked.exercise.id === "dumbbell-romanian-deadlift",
      );
      const assessmentTrace = candidate?.components
        .find((score) => score.id === "assessment_fit")
        ?.assessmentRelevance?.[0];

      expect(assessmentTrace?.demandReductionContext.painContextMatches[0])
        .toEqual(expect.objectContaining({
          signalId: "moderate-low-back-loaded-hinge-pain",
          requestedAction: requiredResponse,
          matchedBy: expect.arrayContaining(["stress_fact"]),
        }));
    }
  });

  it.each([
    ["unrelated wrist during squat", "lower-squat-phase-1", "wrist", "wrist_extension_loading"],
    ["unrelated knee during pull", "horizontal-pull-gym-neutral", "knee", "loaded_knee_flexion"],
    ["unrelated shoulder during hinge", "lower-hinge-moderate-low-back-pain", "shoulder", "horizontal_pressing"],
  ] as const)("keeps all scores unchanged for %s", (_label, scenarioId, region, stressTag) => {
    const base = request(scenarioId);
    const noPainRequest = {
      ...base,
      id: `${scenarioId}-no-pain-stability-baseline`,
      painAndInjury: NO_PAIN_OR_INJURY,
    };
    const unrelatedRequest = {
      ...noPainRequest,
      id: `${scenarioId}-unrelated-pain`,
      painAndInjury: painState({
        currentDiscomforts: [{
          kind: "current_discomfort",
          id: `${scenarioId}-unrelated-pain-signal`,
          region,
          severity0To10: 2,
          stressTags: [stressTag],
          effect: "prefer_support",
          description: "Unrelated pain ownership probe.",
        }],
      }),
    };
    const baseline = runCandidateRankingLab(noPainRequest);
    const unrelated = runCandidateRankingLab(unrelatedRequest);

    expect(unrelated.rankedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components.map((score) => [score.id, score.rawValue]),
    }))).toEqual(baseline.rankedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components.map((score) => [score.id, score.rawValue]),
    })));
  });

  it("freezes pain, joint, axial, accumulation, and score-family coefficients", () => {
    expect(CANDIDATE_PAIN_SCORING_COEFFICIENTS).toEqual({
      painSuitability: {
        currentDiscomfort: 0.9,
        moderatePain: 1.8,
        historicalSensitivity: 0.4,
      },
      jointCost: {
        currentDiscomfort: 0.8,
        moderatePain: 1.4,
        historicalSensitivity: 0.35,
        axial: 0.35,
        accumulation: 0.7,
      },
    });
    expect(DEFAULT_CANDIDATE_SCORING_WEIGHTS.pain_suitability).toBe(1.2);
    expect(DEFAULT_CANDIDATE_SCORING_WEIGHTS.joint_cost).toBe(0.8);
    expect(DEFAULT_CANDIDATE_SCORING_WEIGHTS.stability_fit).toBe(0.7);
  });

  it("keeps HistoricalInjury documented but behaviorally unconsumed", () => {
    const candidate = stressProbe({ joint: ["loaded_knee_flexion"] });
    const baseline = rankedCandidate(candidateRequest({
      candidate,
      pain: NO_PAIN_OR_INJURY,
      id: "historical-injury-baseline",
    }));
    const withHistoricalInjury = rankedCandidate(candidateRequest({
      candidate,
      pain: painState({
        historicalInjuries: [{
          kind: "historical_injury",
          id: "historical-injury-probe",
          region: "knee",
          side: "left",
          status: "recurring",
          relevantStressTags: ["loaded_knee_flexion"],
          description: "Out-of-scope historical injury probe.",
        }],
      }),
      id: "historical-injury-unconsumed",
    }));

    expect(withHistoricalInjury.painMatchTrace.signalTraces).toHaveLength(0);
    expect(withHistoricalInjury.total).toBe(baseline.total);
    expect(withHistoricalInjury.components.map((score) => score.rawValue)).toEqual(
      baseline.components.map((score) => score.rawValue),
    );
  });
});
