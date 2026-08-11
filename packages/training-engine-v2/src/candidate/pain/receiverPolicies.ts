import type {
  CandidatePainMatchTrace,
  CanonicalPainEvidence,
  ExerciseStressSource,
  PainEligibilityEvidenceTrace,
  PainReceiver,
  PainReceiverCriterionTrace,
  PainReceiverDecisionTrace,
  PainReceiverExcludedMatchUnit,
  PainResponseRequirementTrace,
  PainStressMatchFact,
} from "./types";

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function sourcesIn(
  match: PainStressMatchFact,
  allowed: readonly ExerciseStressSource[],
): readonly ExerciseStressSource[] {
  return match.exerciseSources.filter((source) => allowed.includes(source));
}

function stressCriterion(input: {
  readonly match: PainStressMatchFact;
  readonly qualifyingSources?: readonly ExerciseStressSource[];
  readonly reason: string;
  readonly authoritySource?: PainReceiverCriterionTrace["authoritySource"];
}): PainReceiverCriterionTrace {
  return {
    kind: "stress_match",
    signalId: input.match.signalId,
    signalKind: input.match.signalKind,
    stressTag: input.match.stressTag,
    matchedExerciseSources: input.match.exerciseSources,
    qualifyingExerciseSources: input.qualifyingSources ?? input.match.exerciseSources,
    exerciseId: null,
    trainingRole: null,
    authoritySource: input.authoritySource ?? null,
    reason: input.reason,
  };
}

function decision(input: {
  readonly receiver: PainReceiver;
  readonly counted: readonly PainStressMatchFact[];
  readonly excluded?: readonly PainReceiverExcludedMatchUnit[];
  readonly criteria?: readonly PainReceiverCriterionTrace[];
  readonly affectedSignalIds?: readonly string[];
  readonly reason: string;
  readonly executionStatus: PainReceiverDecisionTrace["executionStatus"];
}): PainReceiverDecisionTrace {
  return {
    receiver: input.receiver,
    countedMatchUnits: input.counted,
    countedMatchUnitCount: input.counted.length,
    excludedMatchUnits: input.excluded ?? [],
    affectedSignalIds:
      input.affectedSignalIds ?? unique(input.counted.map((match) => match.signalId)),
    criteria: input.criteria ?? [],
    reason: input.reason,
    executionStatus: input.executionStatus,
  };
}

function painSuitabilityDecision(evidence: CanonicalPainEvidence): PainReceiverDecisionTrace {
  const ownedKinds = new Set([
    "current_discomfort",
    "moderate_pain",
    "historical_sensitivity",
  ]);
  const counted = evidence.signalMatches.filter((match) => ownedKinds.has(match.signalKind));
  const excluded = evidence.signalMatches
    .filter((match) => !ownedKinds.has(match.signalKind))
    .map((match) => ({
      match,
      reason: "signal_kind_not_owned" as const,
    }));

  return decision({
    receiver: "pain_suitability",
    counted,
    excluded,
    reason:
      "Counts each unique current-discomfort, moderate-pain, or historical-sensitivity signal/tag fact once across all structured stress sources.",
    executionStatus: counted.length > 0 ? "applied" : "not_applicable",
  });
}

function jointCostDecision(evidence: CanonicalPainEvidence): PainReceiverDecisionTrace {
  const ownedKinds = new Set([
    "current_discomfort",
    "moderate_pain",
    "historical_sensitivity",
  ]);
  const ownedMatches = evidence.signalMatches.filter((match) => ownedKinds.has(match.signalKind));
  const counted = ownedMatches.filter(
    (match) =>
      match.exerciseSources.includes("joint_stress") ||
      match.exerciseSources.includes("caution"),
  );
  const excluded: readonly PainReceiverExcludedMatchUnit[] = [
    ...ownedMatches
      .filter(
        (match) =>
          !match.exerciseSources.includes("joint_stress") &&
          !match.exerciseSources.includes("caution"),
      )
      .map((match) => ({
        match,
        reason: "contraindicated_only_not_joint_cost" as const,
      })),
    ...evidence.signalMatches
      .filter((match) => !ownedKinds.has(match.signalKind))
      .map((match) => ({
        match,
        reason: "signal_kind_not_owned" as const,
      })),
  ];

  return decision({
    receiver: "joint_cost",
    counted,
    excluded,
    reason:
      "Counts each owned signal/tag fact once when joint-stress or caution provenance is present; contraindicated-only provenance remains visible but uncharged.",
    executionStatus: counted.length > 0 ? "applied" : "not_applicable",
  });
}

function moderateWarningDecision(evidence: CanonicalPainEvidence): PainReceiverDecisionTrace {
  const counted = evidence.signalMatches.filter((match) => match.signalKind === "moderate_pain");
  const affectedSignalIds = unique(counted.map((match) => match.signalId));
  const criteria = counted.map((match) =>
    stressCriterion({
      match,
      reason: "Any structured stress source establishes moderate-pain warning evidence.",
    }),
  );

  return decision({
    receiver: "moderate_warning",
    counted,
    criteria,
    affectedSignalIds,
    reason:
      "Emits at most one warning per moderate-pain signal/candidate while preserving every unique matched stress fact and its source provenance.",
    executionStatus: affectedSignalIds.length > 0 ? "warning_emitted" : "not_applicable",
  });
}

function hardContraindicationDecision(
  evidence: CanonicalPainEvidence,
): PainReceiverDecisionTrace {
  const allowedSources = ["joint_stress", "contraindicated"] as const;
  const criteria: PainReceiverCriterionTrace[] = [];
  const counted: PainStressMatchFact[] = [];
  const excluded: PainReceiverExcludedMatchUnit[] = [];

  for (const signal of evidence.signalTraces.filter(
    (candidate) => candidate.signalKind === "hard_contraindication",
  )) {
    if (signal.hardExerciseIds.includes(evidence.candidateExerciseId)) {
      criteria.push({
        kind: "exercise_id",
        signalId: signal.signalId,
        signalKind: signal.signalKind,
        stressTag: null,
        matchedExerciseSources: [],
        qualifyingExerciseSources: [],
        exerciseId: evidence.candidateExerciseId,
        trainingRole: null,
        authoritySource: signal.hardContraindicationSource,
        reason: "Explicit hard-contraindication exercise ID matches this candidate.",
      });
    }

    for (const match of signal.matchedStressFacts) {
      const qualifyingSources = sourcesIn(match, allowedSources);
      if (qualifyingSources.length === 0) {
        excluded.push({
          match,
          reason: "caution_only_not_hard_authority",
        });
        continue;
      }

      counted.push(match);
      criteria.push(
        stressCriterion({
          match,
          qualifyingSources,
          authoritySource: signal.hardContraindicationSource,
          reason:
            "Explicit hard-contraindication stress tag matches an allowed joint-stress or contraindicated source.",
        }),
      );
    }
  }

  const affectedSignalIds = unique(criteria.map((criterion) => criterion.signalId));
  return decision({
    receiver: "hard_contraindication",
    counted,
    excluded,
    criteria,
    affectedSignalIds,
    reason:
      "Hard authority is limited to explicit exercise IDs and explicit stress tags matched through joint-stress or contraindicated metadata; caution-only metadata is not hard authority.",
    executionStatus: criteria.length > 0 ? "hard_rejected" : "legal",
  });
}

function acuteSevereDecision(input: {
  readonly evidence: CanonicalPainEvidence;
  readonly requestedRole?: string;
}): PainReceiverDecisionTrace {
  const criteria: PainReceiverCriterionTrace[] = [];
  const counted: PainStressMatchFact[] = [];
  const excluded: PainReceiverExcludedMatchUnit[] = [];

  for (const signal of input.evidence.signalTraces.filter(
    (candidate) => candidate.signalKind === "acute_severe_pain",
  )) {
    if (input.requestedRole && signal.invalidatedTrainingRoles.includes(input.requestedRole)) {
      criteria.push({
        kind: "training_role",
        signalId: signal.signalId,
        signalKind: signal.signalKind,
        stressTag: null,
        matchedExerciseSources: [],
        qualifyingExerciseSources: [],
        exerciseId: null,
        trainingRole: input.requestedRole,
        authoritySource: null,
        reason: "Acute/severe pain explicitly invalidates the requested training role.",
      });
    }

    for (const match of signal.matchedStressFacts) {
      const qualifyingSources = sourcesIn(match, ["joint_stress"]);
      if (qualifyingSources.length === 0) {
        excluded.push({
          match,
          reason: "caution_or_contraindicated_only_not_acute_authority",
        });
        continue;
      }

      counted.push(match);
      criteria.push(
        stressCriterion({
          match,
          qualifyingSources,
          reason:
            "Current acute/severe stress policy rejects only a matching joint-stress source.",
        }),
      );
    }
  }

  const affectedSignalIds = unique(criteria.map((criterion) => criterion.signalId));
  return decision({
    receiver: "acute_severe_eligibility",
    counted,
    excluded,
    criteria,
    affectedSignalIds,
    reason:
      "Preserves current acute authority: explicit requested-role invalidation or matching joint-stress metadata; caution-only and contraindicated-only matches remain non-blocking.",
    executionStatus: criteria.length > 0 ? "hard_rejected" : "legal",
  });
}

function assessmentDemandReductionDecision(
  evidence: CanonicalPainEvidence,
): PainReceiverDecisionTrace {
  const eligible = evidence.signalMatches.filter((match) => {
    if (match.signalKind === "moderate_pain") {
      return true;
    }

    if (match.signalKind === "current_discomfort") {
      return match.requestedAction !== "monitor";
    }

    if (match.signalKind === "historical_sensitivity") {
      return match.requestedAction !== null && match.requestedAction !== "monitor";
    }

    return false;
  });
  const excluded = evidence.signalMatches.reduce<PainReceiverExcludedMatchUnit[]>((matches, match) => {
    if (
      (match.signalKind === "current_discomfort" ||
        match.signalKind === "historical_sensitivity") &&
      match.requestedAction === "monitor"
    ) {
      matches.push({
        match,
        reason: "monitor_does_not_request_demand_reduction" as const,
      });
      return matches;
    }

    if (
      match.signalKind === "historical_sensitivity" &&
      match.requestedAction === null
    ) {
      matches.push({
        match,
        reason: "no_actionable_modification" as const,
      });
      return matches;
    }

    if (
      match.signalKind === "acute_severe_pain" ||
      match.signalKind === "hard_contraindication"
    ) {
      matches.push({
        match,
        reason: "signal_kind_not_owned" as const,
      });
      return matches;
    }

    return matches;
  }, []);

  return decision({
    receiver: "assessment_demand_reduction",
    counted: eligible,
    excluded,
    reason:
      "Provides canonical stress evidence for contextual assessment reasoning; region and movement-role relevance remain separate structured context facts.",
    executionStatus: "available_for_contextual_evaluation",
  });
}

export function buildPainReceiverDecisions(input: {
  readonly evidence: CanonicalPainEvidence;
  readonly requestedRole?: string;
}): readonly PainReceiverDecisionTrace[] {
  return [
    painSuitabilityDecision(input.evidence),
    jointCostDecision(input.evidence),
    moderateWarningDecision(input.evidence),
    hardContraindicationDecision(input.evidence),
    acuteSevereDecision(input),
    assessmentDemandReductionDecision(input.evidence),
  ];
}

export function receiverDecision(
  trace: CandidatePainMatchTrace,
  receiver: PainReceiver,
): PainReceiverDecisionTrace {
  const found = trace.receiverDecisions.find((decisionTrace) => decisionTrace.receiver === receiver);
  if (!found) {
    throw new Error(`Missing pain receiver decision ${receiver} for ${trace.candidateExerciseId}.`);
  }

  return found;
}

export function painEligibilityEvidence(input: {
  readonly trace: CandidatePainMatchTrace;
  readonly receiver: PainEligibilityEvidenceTrace["receiver"];
  readonly signalId: string;
}): PainEligibilityEvidenceTrace {
  const signal = input.trace.signalTraces.find((candidate) => candidate.signalId === input.signalId);
  if (!signal) {
    throw new Error(`Missing pain signal ${input.signalId} for ${input.trace.candidateExerciseId}.`);
  }
  const receiver = receiverDecision(input.trace, input.receiver);
  const responseRequirement: PainResponseRequirementTrace | null =
    input.trace.responseRequirements.find(
      (requirement) => requirement.signalId === input.signalId,
    ) ?? null;

  return {
    receiver: input.receiver,
    signalId: input.signalId,
    signalKind: signal.signalKind,
    severity: signal.severity,
    moderateReviewUrgency: signal.moderateReviewUrgency,
    requestedAction: signal.requestedAction,
    urgentReviewRecommended: signal.urgentReviewRecommended,
    authoritySource: signal.hardContraindicationSource,
    matchedStressFacts: signal.matchedStressFacts,
    criteria: receiver.criteria.filter((criterion) => criterion.signalId === input.signalId),
    responseRequirement,
  };
}
