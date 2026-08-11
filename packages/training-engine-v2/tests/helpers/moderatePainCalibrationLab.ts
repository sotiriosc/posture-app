import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  NO_PAIN_OR_INJURY,
  aggregateCandidateScore,
  receiverDecision,
  runCandidateRankingLab,
  type CandidatePainExecutionReadiness,
  type CandidatePainExecutionReadinessTrace,
  type CandidatePainMatchTrace,
  type CandidateRankingResult,
  type CandidateRequest,
  type ModeratePain,
  type ModeratePainReviewUrgency,
  type PainResponseExecutionStatus,
  type PainResponseOwner,
  type PainResponseRequirementTrace,
  type RankedCandidate,
  type ScoreComponent,
} from "../../src";
import {
  buildModeratePainCalibrationScenarios,
  type ModeratePainCalibrationScenario,
} from "./painSemanticsCalibrationReview";

export type ModeratePainCalibrationSeverity = 3 | 4 | 5 | 6;
export type ModeratePainCalibrationResponse = ModeratePain["requiredResponse"];
export type ModeratePainCalibrationFamily = "A" | "B" | "C" | "D";

export type ModeratePainCalibrationClassification =
  | "READY_FOR_OWNER_CALIBRATION_DECISION"
  | "MORE_CALIBRATION_EVIDENCE_REQUIRED"
  | "PAIN_POLICY_ARCHITECTURE_REOPEN_REQUIRED"
  | "RESPONSE_LED_FLAT_POLICY_ADOPTED_NUMERIC_CALIBRATION_DEFERRED";

export interface ModeratePainCalibrationPolicy {
  readonly id: string;
  readonly family: ModeratePainCalibrationFamily;
  readonly label: string;
  readonly severityDeductions: Readonly<Record<ModeratePainCalibrationSeverity, number>>;
  readonly numericShape: "flat" | "two_band" | "four_level";
  readonly description: string;
}

export const MODERATE_PAIN_CALIBRATION_POLICIES: readonly ModeratePainCalibrationPolicy[] = [
  {
    id: "A_CURRENT_FLAT",
    family: "A",
    label: "Current flat moderate policy",
    severityDeductions: { 3: 0, 4: 0, 5: 0, 6: 0 },
    numericShape: "flat",
    description: "Current canonical overlap deductions only; severity is numerically flat.",
  },
  {
    id: "B_UPPER_025",
    family: "B",
    label: "Two-band upper deduction 0.25",
    severityDeductions: { 3: 0, 4: 0, 5: 0.25, 6: 0.25 },
    numericShape: "two_band",
    description: "Severity 5-6 receives one additional 0.25 pain-suitability deduction per matched signal.",
  },
  {
    id: "B_UPPER_050",
    family: "B",
    label: "Two-band upper deduction 0.50",
    severityDeductions: { 3: 0, 4: 0, 5: 0.5, 6: 0.5 },
    numericShape: "two_band",
    description: "Severity 5-6 receives one additional 0.50 pain-suitability deduction per matched signal.",
  },
  {
    id: "B_UPPER_075",
    family: "B",
    label: "Two-band upper deduction 0.75",
    severityDeductions: { 3: 0, 4: 0, 5: 0.75, 6: 0.75 },
    numericShape: "two_band",
    description: "Severity 5-6 receives one additional 0.75 pain-suitability deduction per matched signal.",
  },
  {
    id: "B_UPPER_100",
    family: "B",
    label: "Two-band upper deduction 1.00",
    severityDeductions: { 3: 0, 4: 0, 5: 1, 6: 1 },
    numericShape: "two_band",
    description: "Severity 5-6 receives one additional 1.00 pain-suitability deduction per matched signal.",
  },
  {
    id: "C_GENTLE_0125",
    family: "C",
    label: "Four-level gentle 0/0.125/0.25/0.375",
    severityDeductions: { 3: 0, 4: 0.125, 5: 0.25, 6: 0.375 },
    numericShape: "four_level",
    description: "A gentle ordinal grid with 0.125 raw increments from the severity-3 baseline.",
  },
  {
    id: "C_GRADUAL_025",
    family: "C",
    label: "Four-level gradual 0/0.25/0.50/0.75",
    severityDeductions: { 3: 0, 4: 0.25, 5: 0.5, 6: 0.75 },
    numericShape: "four_level",
    description: "A gradual ordinal grid with 0.25 raw increments from the severity-3 baseline.",
  },
  {
    id: "C_UPPER_WEIGHTED",
    family: "C",
    label: "Four-level upper-weighted 0/0.25/0.75/1.00",
    severityDeductions: { 3: 0, 4: 0.25, 5: 0.75, 6: 1 },
    numericShape: "four_level",
    description: "An upper-weighted ordinal grid that remains bounded at one raw point per matched signal.",
  },
  {
    id: "D_RESPONSE_LED_FLAT",
    family: "D",
    label: "Response-led flat severity",
    severityDeductions: { 3: 0, 4: 0, 5: 0, 6: 0 },
    numericShape: "flat",
    description: "No numeric severity adjustment; response ownership and review urgency carry the distinction.",
  },
];

const SEVERITIES = [3, 4, 5, 6] as const;
const RESPONSES = [
  "avoid_aggravator",
  "reduce_load_and_range",
  "substitute_role",
] as const;
const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
const FINAL_CLASSIFICATION: ModeratePainCalibrationClassification =
  "RESPONSE_LED_FLAT_POLICY_ADOPTED_NUMERIC_CALIBRATION_DEFERRED";

export interface ModeratePainCalibrationMatrixRow {
  readonly policyId: string;
  readonly policyFamily: ModeratePainCalibrationFamily;
  readonly policyLabel: string;
  readonly scenarioId: string;
  readonly scenario: string;
  readonly candidateId: string;
  readonly candidateName: string;
  readonly outcome: "legal" | "rejected";
  readonly rejectionCodes: readonly string[];
  readonly warningCodes: readonly string[];
  readonly severity: ModeratePainCalibrationSeverity;
  readonly severityBand: "lower_moderate_3_4" | "upper_moderate_5_6";
  readonly requiredResponse: ModeratePainCalibrationResponse;
  readonly reviewUrgency: ModeratePainReviewUrgency;
  readonly canonicalMatchedStressFacts: readonly string[];
  readonly painSuitabilityOverlapUnits: number;
  readonly matchedModerateSignalCount: number;
  readonly signalLevelSeverityAdjustment: number | null;
  readonly badPerTagSeverityAdjustment: number | null;
  readonly baselinePainSuitabilityRaw: number | null;
  readonly painSuitabilityRaw: number | null;
  readonly painSuitabilityWeightedContribution: number | null;
  readonly jointCostRaw: number | null;
  readonly jointCostWeightedContribution: number | null;
  readonly baselineTotal: number | null;
  readonly total: number | null;
  readonly baselineRank: number | null;
  readonly rank: number | null;
  readonly rankDeltaFromFlat: number | null;
  readonly responseOwner: PainResponseOwner | null;
  readonly responseExecutionStatus: PainResponseExecutionStatus | null;
  readonly candidateReadiness: CandidatePainExecutionReadiness;
  readonly selectedCandidateId: string | null;
  readonly selectedCandidatePainReadiness: CandidatePainExecutionReadiness | null;
}

export interface ModeratePainReadinessCorrection {
  readonly requiredResponse: ModeratePainCalibrationResponse;
  readonly before: CandidatePainExecutionReadiness;
  readonly after: "EXECUTABLE_AT_CANDIDATE_SCOPE";
  readonly scenarioIds: readonly string[];
  readonly candidateIds: readonly string[];
  readonly candidateMatrixRowsChanged: number;
  readonly selectedProductionCasesChanged: number;
  readonly selectedMatrixCellsChanged: number;
}

export interface ModeratePainPolicySummary {
  readonly policyId: string;
  readonly family: ModeratePainCalibrationFamily;
  readonly adjustedRows: number;
  readonly maximumRawAdjustment: number;
  readonly maximumAggregateChange: number;
  readonly rankChanges: number;
  readonly winnerChanges: number;
}

export interface ModeratePainNearTie {
  readonly scenario: string;
  readonly higherCandidate: string;
  readonly lowerCandidate: string;
  readonly scoreGap: number;
  readonly matchTopology: string;
}

export interface ModeratePainWinnerChange {
  readonly policyId: string;
  readonly scenario: string;
  readonly severity: ModeratePainCalibrationSeverity;
  readonly requiredResponse: ModeratePainCalibrationResponse;
  readonly currentWinner: string;
  readonly experimentalWinner: string;
  readonly whyItChanged: string;
  readonly matchedPainFacts: readonly string[];
  readonly severityEffect: number;
  readonly plausibility: "GOOD" | "PLAUSIBLE_NEEDS_REVIEW" | "QUESTIONABLE" | "WRONG";
}

export interface ModeratePainSignalCountingProof {
  readonly scenario: string;
  readonly candidateId: string;
  readonly severity: ModeratePainCalibrationSeverity;
  readonly policyId: string;
  readonly canonicalOverlapUnits: number;
  readonly matchedSignalCount: number;
  readonly preferredSignalLevelAdjustment: number;
  readonly badPerTagAdjustment: number;
}

export interface ModeratePainCalibrationData {
  readonly classification: ModeratePainCalibrationClassification;
  readonly fixedAsOf: string;
  readonly policies: readonly ModeratePainCalibrationPolicy[];
  readonly scenarios: readonly ModeratePainCalibrationScenario[];
  readonly matrix: readonly ModeratePainCalibrationMatrixRow[];
  readonly productionCaseCount: number;
  readonly matrixFingerprint: string;
  readonly productionFingerprint: string;
  readonly productionParityViolations: readonly string[];
  readonly jointCostInvariantViolations: readonly string[];
  readonly policySummaries: readonly ModeratePainPolicySummary[];
  readonly nearTies: readonly ModeratePainNearTie[];
  readonly winnerChanges: readonly ModeratePainWinnerChange[];
  readonly signalCountingProof: ModeratePainSignalCountingProof;
  readonly applicableReadinessByResponse: Readonly<
    Record<ModeratePainCalibrationResponse, CandidatePainExecutionReadiness>
  >;
  readonly readinessCorrections: readonly ModeratePainReadinessCorrection[];
  readonly resultTraceExposesSubstituteRole: boolean;
}

interface BaselineCandidateEvidence {
  readonly candidateId: string;
  readonly candidateName: string;
  readonly trace: CandidatePainMatchTrace;
  readonly ranked: RankedCandidate | null;
  readonly outcome: "legal" | "rejected";
  readonly rejectionCodes: readonly string[];
  readonly warningCodes: readonly string[];
  readonly canonicalFacts: readonly string[];
  readonly painOverlapUnits: number;
  readonly matchedSignalCount: number;
  readonly responseRequirement: PainResponseRequirementTrace | null;
  readonly painExecutionReadiness: CandidatePainExecutionReadinessTrace;
}

interface BaselineCase {
  readonly scenario: ModeratePainCalibrationScenario;
  readonly severity: ModeratePainCalibrationSeverity;
  readonly requiredResponse: ModeratePainCalibrationResponse;
  readonly signalId: string;
  readonly request: CandidateRequest;
  readonly result: CandidateRankingResult;
  readonly selectedCandidateId: string | null;
  readonly selectedCandidatePainReadiness: CandidatePainExecutionReadiness | null;
  readonly candidates: readonly BaselineCandidateEvidence[];
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function component(candidate: RankedCandidate, id: string): ScoreComponent {
  const found = candidate.components.find((candidateComponent) => candidateComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}.`);
  }

  return found;
}

function scoreComponent(
  components: readonly ScoreComponent[],
  id: string,
): ScoreComponent {
  const found = components.find((candidateComponent) => candidateComponent.id === id);
  if (!found) {
    throw new Error(`Missing experimental ${id}.`);
  }

  return found;
}

function severityBand(
  severity: ModeratePainCalibrationSeverity,
): ModeratePainCalibrationMatrixRow["severityBand"] {
  return severity <= 4 ? "lower_moderate_3_4" : "upper_moderate_5_6";
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function formatCanonicalFact(
  match: CandidatePainMatchTrace["signalMatches"][number],
): string {
  return `${match.matchId}[${match.exerciseSources.join("+")}]`;
}

function moderatePainSignal(input: {
  readonly scenario: ModeratePainCalibrationScenario;
  readonly severity: ModeratePainCalibrationSeverity;
  readonly requiredResponse: ModeratePainCalibrationResponse;
}): ModeratePain {
  return {
    kind: "moderate_pain",
    id: `${input.scenario.id}-calibration-moderate-signal`,
    region: input.scenario.region,
    severity0To10: input.severity,
    stressTags: input.scenario.stressTags,
    requiredResponse: input.requiredResponse,
    description: "Controlled moderate-pain signal for the non-production calibration laboratory.",
  };
}

function buildBaselineCase(input: {
  readonly scenario: ModeratePainCalibrationScenario;
  readonly severity: ModeratePainCalibrationSeverity;
  readonly requiredResponse: ModeratePainCalibrationResponse;
}): BaselineCase {
  const signal = moderatePainSignal(input);
  const request: CandidateRequest = {
    ...input.scenario.request,
    id: `${input.scenario.id}-calibration-${input.severity}-${input.requiredResponse}`,
    evaluationContext: { asOf: FIXED_AS_OF },
    painAndInjury: {
      ...NO_PAIN_OR_INJURY,
      moderatePain: [signal],
    },
  };
  const result = runCandidateRankingLab(request);

  const candidates = input.scenario.exerciseIds.map((candidateId): BaselineCandidateEvidence => {
    const ranked = result.rankedCandidates.find(
      (candidate) => candidate.exercise.id === candidateId,
    ) ?? null;
    const rejected = result.hardRejectedCandidates.find(
      (candidate) => candidate.exercise.id === candidateId,
    );
    const eligibility = ranked?.eligibility ?? rejected?.eligibility;
    const exercise = request.candidatePool.find((candidate) => candidate.id === candidateId);
    if (!eligibility || !exercise) {
      throw new Error(`Missing calibration candidate ${candidateId} in ${request.id}.`);
    }

    const trace = eligibility.painMatchTrace;
    const canonicalMatches = trace.signalMatches.filter(
      (match) => match.signalId === signal.id && match.signalKind === "moderate_pain",
    );
    const painMatches = receiverDecision(trace, "pain_suitability").countedMatchUnits.filter(
      (match) => match.signalId === signal.id && match.signalKind === "moderate_pain",
    );

    return {
      candidateId,
      candidateName: exercise.name,
      trace,
      ranked,
      outcome: eligibility.legal ? "legal" : "rejected",
      rejectionCodes: eligibility.rejectionReasons.map((reason) => reason.code),
      warningCodes: eligibility.warnings.map((warning) => warning.code),
      canonicalFacts: canonicalMatches.map(formatCanonicalFact),
      painOverlapUnits: painMatches.length,
      matchedSignalCount: unique(painMatches.map((match) => match.signalId)).length,
      responseRequirement:
        trace.responseRequirements.find((requirement) => requirement.signalId === signal.id) ?? null,
      painExecutionReadiness:
        ranked?.painExecutionReadiness ??
        result.decisionTrace.candidatePainSummaries.find(
          (summary) => summary.candidateExerciseId === candidateId,
        )?.executionReadiness ??
        (() => {
          throw new Error(`Missing pain readiness for ${candidateId} in ${request.id}.`);
        })(),
    };
  });

  return {
    scenario: input.scenario,
    severity: input.severity,
    requiredResponse: input.requiredResponse,
    signalId: signal.id,
    request,
    result,
    selectedCandidateId: result.painExecutionReadiness.selectedCandidateId,
    selectedCandidatePainReadiness:
      result.painExecutionReadiness.selectedCandidatePainReadiness,
    candidates,
  };
}

function experimentalRowsFor(
  baseline: BaselineCase,
  policy: ModeratePainCalibrationPolicy,
): readonly ModeratePainCalibrationMatrixRow[] {
  const deductionPerSignal = policy.severityDeductions[baseline.severity];
  const scored = baseline.candidates.flatMap((candidate) => {
    if (!candidate.ranked) {
      return [];
    }

    const baselinePain = component(candidate.ranked, "pain_suitability");
    const severityAdjustment = deductionPerSignal * candidate.matchedSignalCount;
    const painValue = clampScore(baselinePain.rawValue - severityAdjustment);
    const components = candidate.ranked.components.map((candidateComponent) =>
      candidateComponent.id === "pain_suitability"
        ? {
            ...candidateComponent,
            value: painValue,
            rawValue: painValue,
            reason: `${candidateComponent.reason} Laboratory-only signal-level severity adjustment: ${severityAdjustment.toFixed(3)}.`,
          }
        : candidateComponent,
    );
    const score = aggregateCandidateScore({
      exerciseId: candidate.candidateId,
      components,
    });

    return [{
      candidateId: candidate.candidateId,
      score,
      severityAdjustment,
    }];
  });
  const ranks = new Map(
    [...scored]
      .sort(
        (left, right) =>
          right.score.aggregate.value - left.score.aggregate.value ||
          left.candidateId.localeCompare(right.candidateId),
      )
      .map((candidate, index) => [candidate.candidateId, index + 1] as const),
  );

  return baseline.candidates.map((candidate): ModeratePainCalibrationMatrixRow => {
    const experimental = scored.find((scoredCandidate) => scoredCandidate.candidateId === candidate.candidateId);
    const pain = experimental
      ? scoreComponent(experimental.score.components, "pain_suitability")
      : null;
    const joint = experimental
      ? scoreComponent(experimental.score.components, "joint_cost")
      : null;
    const baselinePain = candidate.ranked
      ? component(candidate.ranked, "pain_suitability")
      : null;
    const rank = ranks.get(candidate.candidateId) ?? null;
    const baselineRank = candidate.ranked?.rank ?? null;

    return {
      policyId: policy.id,
      policyFamily: policy.family,
      policyLabel: policy.label,
      scenarioId: baseline.scenario.id,
      scenario: baseline.scenario.label,
      candidateId: candidate.candidateId,
      candidateName: candidate.candidateName,
      outcome: candidate.outcome,
      rejectionCodes: candidate.rejectionCodes,
      warningCodes: candidate.warningCodes,
      severity: baseline.severity,
      severityBand: severityBand(baseline.severity),
      requiredResponse: baseline.requiredResponse,
      reviewUrgency:
        candidate.trace.signalTraces.find((signal) => signal.signalId === baseline.signalId)
          ?.moderateReviewUrgency ??
        (() => {
          throw new Error(
            `Missing moderate review urgency for ${baseline.signalId}/${candidate.candidateId}.`,
          );
        })(),
      canonicalMatchedStressFacts: candidate.canonicalFacts,
      painSuitabilityOverlapUnits: candidate.painOverlapUnits,
      matchedModerateSignalCount: candidate.matchedSignalCount,
      signalLevelSeverityAdjustment: experimental?.severityAdjustment ?? null,
      badPerTagSeverityAdjustment:
        candidate.ranked ? deductionPerSignal * candidate.painOverlapUnits : null,
      baselinePainSuitabilityRaw: baselinePain?.rawValue ?? null,
      painSuitabilityRaw: pain?.rawValue ?? null,
      painSuitabilityWeightedContribution: pain?.weightedContribution ?? null,
      jointCostRaw: joint?.rawValue ?? null,
      jointCostWeightedContribution: joint?.weightedContribution ?? null,
      baselineTotal: candidate.ranked?.total ?? null,
      total: experimental?.score.aggregate.value ?? null,
      baselineRank,
      rank,
      rankDeltaFromFlat:
        rank !== null && baselineRank !== null ? rank - baselineRank : null,
      responseOwner: candidate.responseRequirement?.primaryFutureOwner ?? null,
      responseExecutionStatus: candidate.responseRequirement?.executionStatus ?? null,
      candidateReadiness: candidate.painExecutionReadiness.readiness,
      selectedCandidateId: baseline.selectedCandidateId,
      selectedCandidatePainReadiness: baseline.selectedCandidatePainReadiness,
    };
  });
}

function caseKey(row: ModeratePainCalibrationMatrixRow): string {
  return [
    row.policyId,
    row.scenarioId,
    row.severity,
    row.requiredResponse,
  ].join("|");
}

function jointInvariantViolations(
  rows: readonly ModeratePainCalibrationMatrixRow[],
): readonly string[] {
  const grouped = new Map<string, ModeratePainCalibrationMatrixRow[]>();
  for (const row of rows) {
    const key = [
      row.policyId,
      row.scenarioId,
      row.candidateId,
      row.requiredResponse,
    ].join("|");
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  return [...grouped.entries()].flatMap(([key, candidates]) => {
    const values = unique(
      candidates.map((candidate) =>
        `${candidate.jointCostRaw}:${candidate.jointCostWeightedContribution}`,
      ),
    );
    return values.length > 1 ? [`${key} -> ${values.join(", ")}`] : [];
  });
}

function productionParityViolations(
  rows: readonly ModeratePainCalibrationMatrixRow[],
): readonly string[] {
  return rows
    .filter((row) => row.policyId === "A_CURRENT_FLAT")
    .flatMap((row) => {
      const violations = [];
      if (row.total !== row.baselineTotal) {
        violations.push("total");
      }
      if (row.rank !== row.baselineRank) {
        violations.push("rank");
      }
      if (row.painSuitabilityRaw !== row.baselinePainSuitabilityRaw) {
        violations.push("pain_suitability");
      }

      return violations.length > 0
        ? [`${row.scenarioId}/${row.severity}/${row.requiredResponse}/${row.candidateId}: ${violations.join(",")}`]
        : [];
    });
}

function winnerChanges(
  rows: readonly ModeratePainCalibrationMatrixRow[],
): readonly ModeratePainWinnerChange[] {
  const grouped = new Map<string, ModeratePainCalibrationMatrixRow[]>();
  for (const row of rows) {
    const key = caseKey(row);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  return [...grouped.values()].flatMap((candidates) => {
    const current = candidates.find((candidate) => candidate.baselineRank === 1);
    const experimental = candidates.find((candidate) => candidate.rank === 1);
    if (!current || !experimental || current.candidateId === experimental.candidateId) {
      return [];
    }

    return [{
      policyId: experimental.policyId,
      scenario: experimental.scenario,
      severity: experimental.severity,
      requiredResponse: experimental.requiredResponse,
      currentWinner: current.candidateId,
      experimentalWinner: experimental.candidateId,
      whyItChanged:
        `${current.candidateId} received a ${current.signalLevelSeverityAdjustment?.toFixed(3)} signal-level deduction while ${experimental.candidateId} received ${experimental.signalLevelSeverityAdjustment?.toFixed(3)}.`,
      matchedPainFacts: current.canonicalMatchedStressFacts,
      severityEffect: current.signalLevelSeverityAdjustment ?? 0,
      plausibility: "PLAUSIBLE_NEEDS_REVIEW" as const,
    }];
  });
}

function policySummaries(
  rows: readonly ModeratePainCalibrationMatrixRow[],
  changes: readonly ModeratePainWinnerChange[],
): readonly ModeratePainPolicySummary[] {
  return MODERATE_PAIN_CALIBRATION_POLICIES.map((policy) => {
    const policyRows = rows.filter((row) => row.policyId === policy.id);
    return {
      policyId: policy.id,
      family: policy.family,
      adjustedRows: policyRows.filter(
        (row) => (row.signalLevelSeverityAdjustment ?? 0) > 0,
      ).length,
      maximumRawAdjustment: Math.max(
        0,
        ...policyRows.map((row) => row.signalLevelSeverityAdjustment ?? 0),
      ),
      maximumAggregateChange: Math.max(
        0,
        ...policyRows.map((row) =>
          row.total !== null && row.baselineTotal !== null
            ? Number((row.baselineTotal - row.total).toFixed(3))
            : 0,
        ),
      ),
      rankChanges: policyRows.filter(
        (row) => row.rankDeltaFromFlat !== null && row.rankDeltaFromFlat !== 0,
      ).length,
      winnerChanges: changes.filter((change) => change.policyId === policy.id).length,
    };
  });
}

function nearTies(rows: readonly ModeratePainCalibrationMatrixRow[]): readonly ModeratePainNearTie[] {
  const baseline = rows.filter(
    (row) =>
      row.policyId === "A_CURRENT_FLAT" &&
      row.severity === 3 &&
      row.requiredResponse === "avoid_aggravator" &&
      row.rank !== null,
  );
  const scenarioIds = unique(baseline.map((row) => row.scenarioId));

  return scenarioIds.flatMap((scenarioId) => {
    const candidates = baseline
      .filter((row) => row.scenarioId === scenarioId)
      .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0));

    return candidates.slice(0, -1).flatMap((candidate, index) => {
      const next = candidates[index + 1];
      if (!next || candidate.total === null || next.total === null) {
        return [];
      }
      const gap = Number((candidate.total - next.total).toFixed(3));
      if (gap > 0.1) {
        return [];
      }

      return [{
        scenario: candidate.scenario,
        higherCandidate: candidate.candidateId,
        lowerCandidate: next.candidateId,
        scoreGap: gap,
        matchTopology:
          `${candidate.painSuitabilityOverlapUnits} overlap unit(s), ${candidate.matchedModerateSignalCount} matched signal(s) vs ` +
          `${next.painSuitabilityOverlapUnits} overlap unit(s), ${next.matchedModerateSignalCount} matched signal(s)`,
      }];
    });
  });
}

function signalCountingProof(
  rows: readonly ModeratePainCalibrationMatrixRow[],
): ModeratePainSignalCountingProof {
  const row = rows.find(
    (candidate) =>
      candidate.policyId === "B_UPPER_100" &&
      candidate.scenarioId === "low-back-hinge" &&
      candidate.candidateId === "dumbbell-romanian-deadlift" &&
      candidate.severity === 6 &&
      candidate.requiredResponse === "avoid_aggravator",
  );
  if (!row) {
    throw new Error("Missing two-tag signal-level calibration proof row.");
  }

  return {
    scenario: row.scenario,
    candidateId: row.candidateId,
    severity: row.severity,
    policyId: row.policyId,
    canonicalOverlapUnits: row.painSuitabilityOverlapUnits,
    matchedSignalCount: row.matchedModerateSignalCount,
    preferredSignalLevelAdjustment: row.signalLevelSeverityAdjustment ?? 0,
    badPerTagAdjustment: row.badPerTagSeverityAdjustment ?? 0,
  };
}

function applicableReadinessByResponse(
  cases: readonly BaselineCase[],
): Readonly<Record<ModeratePainCalibrationResponse, CandidatePainExecutionReadiness>> {
  return Object.fromEntries(
    RESPONSES.map((response) => {
      const matchedCandidate = cases
        .filter((candidate) => candidate.requiredResponse === response)
        .flatMap((candidate) => candidate.candidates)
        .find((candidate) => candidate.painOverlapUnits > 0);

      if (!matchedCandidate) {
        throw new Error(`Missing applicable ${response} calibration candidate.`);
      }

      return [response, matchedCandidate.painExecutionReadiness.readiness] as const;
    }),
  ) as Readonly<Record<ModeratePainCalibrationResponse, CandidatePainExecutionReadiness>>;
}

function readinessCorrections(input: {
  readonly cases: readonly BaselineCase[];
  readonly matrix: readonly ModeratePainCalibrationMatrixRow[];
  readonly applicableByResponse: Readonly<
    Record<ModeratePainCalibrationResponse, CandidatePainExecutionReadiness>
  >;
}): readonly ModeratePainReadinessCorrection[] {
  return RESPONSES.map((requiredResponse) => {
    const changedCandidateRows = input.matrix.filter(
      (row) =>
        row.requiredResponse === requiredResponse &&
        row.responseExecutionStatus === "not_applicable_no_candidate_stress_match" &&
        row.candidateReadiness === "EXECUTABLE_AT_CANDIDATE_SCOPE",
    );
    const changedCases = input.cases.filter((candidateCase) => {
      if (
        candidateCase.requiredResponse !== requiredResponse ||
        candidateCase.selectedCandidatePainReadiness !== "EXECUTABLE_AT_CANDIDATE_SCOPE"
      ) {
        return false;
      }

      return candidateCase.candidates.some(
        (candidate) =>
          candidate.painExecutionReadiness.readiness ===
          input.applicableByResponse[requiredResponse],
      );
    });
    const changedCaseKeys = new Set(
      changedCases.map((candidateCase) =>
        [
          candidateCase.scenario.id,
          candidateCase.severity,
          candidateCase.requiredResponse,
        ].join("|"),
      ),
    );
    const selectedMatrixCellsChanged = input.matrix.filter((row) =>
      changedCaseKeys.has(
        [row.scenarioId, row.severity, row.requiredResponse].join("|"),
      ),
    ).length;

    return {
      requiredResponse,
      before: input.applicableByResponse[requiredResponse],
      after: "EXECUTABLE_AT_CANDIDATE_SCOPE" as const,
      scenarioIds: [...unique(changedCandidateRows.map((row) => row.scenarioId))].sort(),
      candidateIds: [...unique(changedCandidateRows.map((row) => row.candidateId))].sort(),
      candidateMatrixRowsChanged: changedCandidateRows.length,
      selectedProductionCasesChanged: changedCases.length,
      selectedMatrixCellsChanged,
    };
  });
}

export function buildModeratePainCalibrationData(): ModeratePainCalibrationData {
  const scenarios = buildModeratePainCalibrationScenarios();
  const baselineCases = scenarios.flatMap((scenario) =>
    SEVERITIES.flatMap((severity) =>
      RESPONSES.map((requiredResponse) =>
        buildBaselineCase({ scenario, severity, requiredResponse }),
      ),
    ),
  );
  const matrix = MODERATE_PAIN_CALIBRATION_POLICIES.flatMap((policy) =>
    baselineCases.flatMap((baseline) => experimentalRowsFor(baseline, policy)),
  );
  const changes = winnerChanges(matrix);
  const applicableByResponse = applicableReadinessByResponse(baselineCases);
  const substituteCase = baselineCases.find(
    (candidate) => candidate.requiredResponse === "substitute_role",
  );
  const resultTraceExposesSubstituteRole = substituteCase
    ? substituteCase.result.decisionTrace.candidatePainSummaries.some((summary) =>
        summary.responseRequirements.some(
          (requirement) =>
            requirement.requestedAction === "substitute_role" &&
            requirement.primaryFutureOwner === "session_intent_or_session_composer" &&
            requirement.executionStatus === "deferred_unexecutable_at_candidate_layer",
        ),
      )
    : false;

  const productionSummary = baselineCases.map((baseline) => ({
    requestId: baseline.request.id,
    rankings: baseline.result.rankedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      pain: component(candidate, "pain_suitability").rawValue,
      joint: component(candidate, "joint_cost").rawValue,
    })),
    rejected: baseline.result.hardRejectedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      reasons: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
    })),
  }));

  return {
    classification: FINAL_CLASSIFICATION,
    fixedAsOf: FIXED_AS_OF,
    policies: MODERATE_PAIN_CALIBRATION_POLICIES,
    scenarios,
    matrix,
    productionCaseCount: baselineCases.length,
    matrixFingerprint: hash(matrix),
    productionFingerprint: hash(productionSummary),
    productionParityViolations: productionParityViolations(matrix),
    jointCostInvariantViolations: jointInvariantViolations(matrix),
    policySummaries: policySummaries(matrix, changes),
    nearTies: nearTies(matrix),
    winnerChanges: changes,
    signalCountingProof: signalCountingProof(matrix),
    applicableReadinessByResponse: applicableByResponse,
    readinessCorrections: readinessCorrections({
      cases: baselineCases,
      matrix,
      applicableByResponse,
    }),
    resultTraceExposesSubstituteRole,
  };
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => escapeCell(String(value))).join(" | ")} |`),
  ].join("\n");
}

function fixed(value: number | null, digits = 3): string {
  return value === null ? "-" : value.toFixed(digits);
}

function rankDelta(value: number | null): string {
  if (value === null) {
    return "-";
  }
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

function matrixTable(rows: readonly ModeratePainCalibrationMatrixRow[]): string {
  return table(
    [
      "Severity",
      "Band",
      "Response",
      "Candidate",
      "Outcome",
      "Warning",
      "Canonical stress facts",
      "Pain units",
      "Signal severity adj",
      "Pain raw / weighted",
      "Joint raw / weighted",
      "Total",
      "Rank",
      "Rank delta",
      "Review urgency",
      "Response owner / status",
      "Candidate readiness",
      "Selected candidate / readiness",
    ],
    rows.map((row) => [
      row.severity,
      row.severityBand,
      row.requiredResponse,
      row.candidateId,
      row.outcome === "legal"
        ? "legal"
        : `rejected:${row.rejectionCodes.join(",") || "unknown"}`,
      row.warningCodes.join(",") || "-",
      row.canonicalMatchedStressFacts.join("; ") || "-",
      row.painSuitabilityOverlapUnits,
      fixed(row.signalLevelSeverityAdjustment),
      `${fixed(row.painSuitabilityRaw)} / ${fixed(row.painSuitabilityWeightedContribution, 6)}`,
      `${fixed(row.jointCostRaw)} / ${fixed(row.jointCostWeightedContribution, 6)}`,
      fixed(row.total),
      row.rank ?? "-",
      rankDelta(row.rankDeltaFromFlat),
      row.reviewUrgency,
      `${row.responseOwner ?? "-"} / ${row.responseExecutionStatus ?? "-"}`,
      row.candidateReadiness,
      `${row.selectedCandidateId ?? "-"} / ${row.selectedCandidatePainReadiness ?? "-"}`,
    ]),
  );
}

function completeMatrixSections(data: ModeratePainCalibrationData): readonly string[] {
  return data.policies.flatMap((policy) => [
    `### ${policy.id}: ${policy.label}`,
    "",
    `Raw deductions by severity: 3=${policy.severityDeductions[3].toFixed(3)}, 4=${policy.severityDeductions[4].toFixed(3)}, 5=${policy.severityDeductions[5].toFixed(3)}, 6=${policy.severityDeductions[6].toFixed(3)}.`,
    "",
    ...data.scenarios.flatMap((scenario) => [
      `#### ${scenario.label}`,
      "",
      matrixTable(
        data.matrix.filter(
          (row) => row.policyId === policy.id && row.scenarioId === scenario.id,
        ),
      ),
      "",
    ]),
  ]);
}

export function renderModeratePainCalibrationDecision(
  data: ModeratePainCalibrationData,
): string {
  const proof = data.signalCountingProof;
  const changedRankRows = data.matrix.filter(
    (row) => row.rankDeltaFromFlat !== null && row.rankDeltaFromFlat !== 0,
  );
  const stableCandidateCount = unique(
    data.matrix
      .filter((row) => row.outcome === "legal")
      .map((row) => `${row.scenarioId}:${row.candidateId}`),
  ).length;
  const maximumAggregateChange = Math.max(
    0,
    ...data.policySummaries.map((summary) => summary.maximumAggregateChange),
  );

  return [
    "# Moderate Pain Calibration Decision Laboratory",
    "",
    "Authority: `ENGINE_V2_BLUEPRINT.md`. This is deterministic non-production calibration evidence. It does not alter Candidate Intelligence defaults, diagnose pain, prescribe dosage, substitute a role, or authorize Session Composer.",
    "",
    "## Laboratory Decision",
    "",
    `Classification: **${data.classification}**`,
    "",
    "The project owner adopts **RESPONSE-LED FLAT MODERATE SEVERITY** at Candidate Intelligence scope. Severity 3-6 remains structured evidence and changes review urgency, but adds no numeric pain-suitability adjustment beyond canonical stress overlap. Numeric calibration is deferred because every tested grid leaves all controlled ranks and winners unchanged and no longitudinal symptom/function evidence currently supports a coefficient.",
    "",
    "PAIN_CONTRACT: **READY**",
    "",
    "MODERATE_PAIN_CANDIDATE_POLICY: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**",
    "",
    "NUMERIC_MODERATE_SEVERITY_CALIBRATION: **DEFERRED_TO_LONGITUDINAL_ADAPTATION**",
    "",
    "Overall Candidate Intelligence remains **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**.",
    "",
    "## Scope And Reproducibility",
    "",
    `The laboratory ran ${data.productionCaseCount} fixed-time production requests and derived ${data.matrix.length} policy/candidate rows across ${data.policies.length} policy variants. All requests use \`evaluationContext.asOf=${data.fixedAsOf}\`.`,
    "",
    `Production fingerprint: \`${data.productionFingerprint}\`. Experimental matrix fingerprint: \`${data.matrixFingerprint}\`.`,
    "",
    `Current-flat parity violations: ${data.productionParityViolations.length}. Joint-cost severity-invariance violations: ${data.jointCostInvariantViolations.length}.`,
    "",
    "Production numeric behavior remains unchanged: the laboratory reads production results, creates new experimental component arrays, changes only copied pain-suitability values for non-production probes, and reuses the unchanged aggregate weights. Production traces now add review urgency and candidate-aware execution readiness; no score component, coefficient, eligibility authority, exercise, or phase record is mutated.",
    "",
    "## Calibration Doctrine",
    "",
    "- Pain intensity is a reported experience, not a direct measurement of tissue damage.",
    "- No numeric severity threshold is universally appropriate across conditions, regions, exercises, athletes, and contexts.",
    "- At Candidate Intelligence scope, moderate severity 3-6 is numerically flat and affects review urgency only; severity alone is never hard authority.",
    "- Canonical stress overlap measures modeled breadth. Severity measures reported intensity. They remain separate quantities.",
    "- Any severity adjustment is applied once per distinct matched moderate-pain signal, not once per matched stress fact.",
    "- `pain_suitability` owns current intensity/tolerance compatibility. `joint_cost` owns modeled exposure and is not severity-scaled.",
    "- `requiredResponse` owns an execution requirement, not another score penalty.",
    "- Pre-session severity alone cannot validate exercise dosage; longitudinal symptom and function response is required.",
    "",
    "## Policy Families",
    "",
    table(
      ["Policy", "Family", "Shape", "Severity 3", "Severity 4", "Severity 5", "Severity 6", "Purpose"],
      data.policies.map((policy) => [
        policy.id,
        policy.family,
        policy.numericShape,
        policy.severityDeductions[3].toFixed(3),
        policy.severityDeductions[4].toFixed(3),
        policy.severityDeductions[5].toFixed(3),
        policy.severityDeductions[6].toFixed(3),
        policy.description,
      ]),
    ),
    "",
    "Policy A was the production baseline when the sensitivity matrix was built. Policy B tested four upper-moderate bands, and Policy C tested three explicit ordinal grids. The owner adopts Policy D: response-led flat severity with structured urgency and unresolved execution ownership. Policies B and C remain historical sensitivity probes, not production candidates.",
    "",
    "## Experimental Math",
    "",
    "```text",
    "canonical pain suitability = current production pain_suitability",
    "matched moderate signals = distinct matched moderate pain signal IDs",
    "experimental pain suitability = clamp(canonical pain suitability",
    "  - policy severity deduction * matched moderate signals, 0, 10)",
    "experimental joint cost = current production joint_cost",
    "experimental aggregate = unchanged weighted_mean_candidate_intelligence_v0",
    "```",
    "",
    "The response value never enters this arithmetic. It is reported beside the score as an unresolved execution contract.",
    "",
    "## Signal-Level Counting Proof",
    "",
    table(
      ["Scenario", "Candidate", "Policy / Severity", "Canonical overlap units", "Matched signals", "Preferred signal adjustment", "Bad per-tag adjustment"],
      [[
        proof.scenario,
        proof.candidateId,
        `${proof.policyId} / ${proof.severity}`,
        proof.canonicalOverlapUnits,
        proof.matchedSignalCount,
        proof.preferredSignalLevelAdjustment.toFixed(3),
        proof.badPerTagAdjustment.toFixed(3),
      ]],
    ),
    "",
    `The Romanian deadlift has ${proof.canonicalOverlapUnits} canonical overlap units from one moderate signal. Under the 1.00 upper-band probe, the preferred model applies one 1.000 adjustment. The rejected per-tag model would apply ${proof.badPerTagAdjustment.toFixed(3)}, conflating overlap breadth with intensity and double-counting the same reported signal.`,
    "",
    "## Joint-Cost Invariance",
    "",
    `All policy/scenario/candidate/response groups preserve one joint-cost raw and weighted value across severities 3-6; violations=${data.jointCostInvariantViolations.length}. Joint cost owns modeled stress exposure. Pain suitability owns reported intensity/tolerance. Scaling severity in both components would route one signal through two numeric score channels without a second independent quantity.`,
    "",
    "No current production behavior violates this severity invariant. The canonical overlap itself may legitimately affect both receivers under their distinct source policies, but severity adds no second joint-cost deduction.",
    "",
    "## Required Response And Candidate Readiness",
    "",
    table(
      ["Required response", "Numeric effect", "Primary owner", "Applicable candidate status", "Applicable candidate readiness"],
      [
        ["avoid_aggravator", "canonical overlap only; no response penalty", "candidate_review", "policy_unresolved_candidate_review_required", data.applicableReadinessByResponse.avoid_aggravator],
        ["reduce_load_and_range", "canonical overlap only; no response penalty", "prescription", "deferred_unexecutable_at_candidate_layer", data.applicableReadinessByResponse.reduce_load_and_range],
        ["substitute_role", "canonical overlap only; no response penalty", "session_intent_or_session_composer", "deferred_unexecutable_at_candidate_layer", data.applicableReadinessByResponse.substitute_role],
      ],
    ),
    "",
    `CandidateRankingResult observability audit: substitute-role evidence is ${data.resultTraceExposesSubstituteRole ? "present" : "MISSING"} in \`decisionTrace.candidatePainSummaries[].responseRequirements\`, including the exact action, future owner, execution status, and matched facts. Each ranked candidate now also exposes \`painExecutionReadiness\`. Candidate Intelligence still ranks the truthful requested-role pool for evidence; it does not perform the substitution.`,
    "",
    "`CandidateRankingResult.painExecutionReadiness` reports rank 1 through `selectedCandidateId` and `selectedCandidatePainReadiness`, lists every legal candidate with no unresolved candidate-scope pain action in `executableCandidateIds`, exposes the first such ranked option in `bestExecutableCandidateId`, and preserves explicit acute urgency in `urgentReviewSignalIds`. It never reranks or silently replaces the selected candidate.",
    "",
    "`EXECUTABLE_AT_CANDIDATE_SCOPE` means only that Candidate Intelligence has no unresolved pain-response action for that candidate. It does not claim a full session, dosage, weekly stress, finished workout, or medical safety. Prescription, Session Composer, and final validation remain separate future gates.",
    "",
    "`URGENT_EXTERNAL_REVIEW` remains reserved for explicit acute/severe urgent-review input and remains globally visible without a candidate stress match. Severity 5-6 produces `elevated_moderate_review_non_hard`; it never manufactures acute authority.",
    "",
    "### Corrected Readiness Classifications",
    "",
    "The retired helper flattened every candidate requirement, including non-applicable and hard-rejected candidates, into one whole-result status. Production classification now ignores `not_applicable_no_candidate_stress_match` for non-urgent actions, classifies each candidate independently, and derives selected-result readiness from rank 1 among legal candidates only.",
    "",
    table(
      ["Response", "Before", "After", "Scenarios", "Candidates", "Candidate matrix rows", "Selected production cases", "Selected matrix cells"],
      data.readinessCorrections.map((correction) => [
        correction.requiredResponse,
        correction.before,
        correction.after,
        correction.scenarioIds.join(", ") || "none",
        correction.candidateIds.join(", ") || "none",
        correction.candidateMatrixRowsChanged,
        correction.selectedProductionCasesChanged,
        correction.selectedMatrixCellsChanged,
      ]),
    ),
    "",
    "Every changed calibration row is in `low-back-horizontal-row`: `machine-row`, `seated-cable-row`, and `chest-supported-dumbbell-row` have no matched low-back stress fact and are now `EXECUTABLE_AT_CANDIDATE_SCOPE`; `one-arm-dumbbell-row` retains the applicable response readiness. The selected machine row is executable in those cases, so the lower one-arm requirement no longer poisons the result. Scores, ranks, and winners are unchanged.",
    "",
    "## Policy Sensitivity Summary",
    "",
    table(
      ["Policy", "Adjusted rows", "Max raw adjustment", "Max aggregate change", "Rank changes", "Winner changes"],
      data.policySummaries.map((summary) => [
        summary.policyId,
        summary.adjustedRows,
        summary.maximumRawAdjustment.toFixed(3),
        summary.maximumAggregateChange.toFixed(3),
        summary.rankChanges,
        summary.winnerChanges,
      ]),
    ),
    "",
    `Smallest tested positive signal-level adjustment: 0.125 raw. Largest: 1.000 raw. No tested adjustment changed a rank or winner (${changedRankRows.length} changed rank rows; ${data.winnerChanges.length} winner changes). Within this bounded range, there is therefore no observed winner-change threshold. The maximum aggregate effect from one matched signal was ${maximumAggregateChange.toFixed(3)}.`,
    "",
    `All ${stableCandidateCount} scenario/candidate identities remain rank-stable. Four pools give every legal candidate the same matched-signal count, so a signal-level adjustment moves them together. In the low-back row pool, the one-arm row is the only stress-matched candidate and already ranks last; a nonnegative deduction moves it farther from the winner.`,
    "",
    "### Existing Near Ties",
    "",
    table(
      ["Scenario", "Higher candidate", "Lower candidate", "Flat-policy gap", "Match topology"],
      data.nearTies.map((row) => [
        row.scenario,
        row.higherCandidate,
        row.lowerCandidate,
        row.scoreGap.toFixed(3),
        row.matchTopology,
      ]),
    ),
    "",
    "The near ties do not change because the tied candidates share the same matched-signal topology. No candidate changes rank merely because it was nearly tied. Rank stability is not proof that the policies are equally good; it shows that this matrix cannot identify a coefficient from winner movement.",
    "",
    "None of the tested additions dominates role, goal, stimulus, phase, or canonical overlap evidence. Conversely, every tested grid is too weak or too topologically uniform to produce a meaningful rank distinction in this matrix. The 0.25 probes move one-signal aggregate totals by only about 0.019; the 1.00 probe moves them by 0.075 after aggregate rounding (0.074074 before rounding).",
    "",
    "Body-region behavior is driven more by stress-match topology than by the region label: shoulder push, hinge, knee squat, and single-leg candidates move together, while the low-back row pool contains matched and unmatched candidates. That is evidence against inferring one universal coefficient from this matrix alone.",
    "",
    "## Coaching-Logic Review",
    "",
    data.winnerChanges.length === 0
      ? "No policy produced a meaningful winner change, so there is no coaching plausibility verdict to assign. This is an evidence result, not a failed experiment: manufacturing a winner change would violate the signal-level doctrine."
      : table(
          ["Scenario", "Current winner", "Experimental winner", "Why", "Matched facts", "Severity effect", "Required response", "Plausibility"],
          data.winnerChanges.map((change) => [
            change.scenario,
            change.currentWinner,
            change.experimentalWinner,
            change.whyItChanged,
            change.matchedPainFacts.join("; "),
            change.severityEffect.toFixed(3),
            change.requiredResponse,
            change.plausibility,
          ]),
        ),
    "",
    "A future matrix that does produce changes must be reviewed relationship by relationship. Rank movement alone is not evidence that the changed winner is clinically or programmatically better.",
    "",
    "## Complete Controlled Matrix",
    "",
    "Every row below reports production legality/warning truth, canonical facts and overlap units, the laboratory-only signal adjustment, recomputed pain and unchanged joint contributions, aggregate/rank delta, response execution status, candidate readiness, and selected-result readiness. Rank delta is experimental rank minus current-flat rank; a positive value means the candidate moved lower.",
    "",
    ...completeMatrixSections(data),
    "## Longitudinal Pain-Response Requirement",
    "",
    "A mature policy must distinguish pain before exercise, during exercise, immediately after, after a defined recovery interval, the following morning, and at the next session. It must also capture whether function or performance improved or worsened and whether the response was isolated or repeated.",
    "",
    "The future ownership chain is:",
    "",
    "```text",
    "session feedback",
    "  -> longitudinal adaptation",
    "  -> next prescription/progression decision",
    "```",
    "",
    "This contract is intentionally not implemented here. A pre-session severity number alone cannot validate range, load, effort, volume, exercise choice, or recovery response. Longitudinal evidence should inform the next prescription and same-exercise progression decision before pain response can safely drive adaptation.",
    "",
    "## No Universal Hard Stop",
    "",
    "No laboratory policy turns severity 5 or 6 into hard rejection. Hard authority remains acute/severe requested-role invalidation, explicit hard contraindication, and other genuinely defined safety truth. Moderate severity can support bounded suitability or non-hard review attention only.",
    "",
    "## Human Exercise-Science Questions",
    "",
    "- What future longitudinal evidence would be sufficient to reopen the response-led flat Candidate Intelligence policy?",
    "- If reviewed evidence later supports a numeric effect, should it use a two-band or four-level shape, and what evidence justifies the boundary or increments?",
    "- What bounded maximum prevents intensity from overpowering training-purpose evidence while still creating a useful distinction?",
    "- Should review urgency vary by severity, response, symptom trajectory, body region, exercise, athlete context, or a combination?",
    "- How should `avoid_aggravator` be resolved without converting broad self-report into hard contraindication authority?",
    "- Which prescription capabilities prove that `reduce_load_and_range` is executable for a selected exercise?",
    "- Which Session Intent invariants must be preserved before `substitute_role` can be executed?",
    "- Which longitudinal time points, functional measures, and repeated-response rules should govern next-session adaptation?",
    "- Are the existing canonical moderate overlap coefficients for pain suitability and joint exposure appropriate once real longitudinal outcomes are available?",
    "",
    "## Recommended Shape And Coefficient Evidence",
    "",
    "Adopted Candidate Intelligence shape: retain canonical overlap breadth, add no numeric moderate-severity adjustment, keep joint exposure severity-invariant, keep required response out of score arithmetic, expose severity through standard/elevated non-hard review urgency, and require candidate-aware result readiness. If longitudinal evidence later reopens numeric calibration, any reviewed adjustment remains bounded, signal-level, and owned only by pain suitability.",
    "",
    "Recommended production coefficient range: **none supported by this laboratory**. The explored raw range was 0.125-1.000 per matched signal, with 0.25-1.00 used for the required two-band grid. Those are sensitivity probes, not calibration recommendations. No rank threshold, outcome data, or longitudinal response supports selecting a value from that interval.",
    "",
    "Numeric calibration is deferred until structured history can connect actual prescription with during-session, immediate post-session, recovery-interval, next-morning, next-session, function/performance, and repeated-versus-isolated response. Future evidence may support prescription adjustment, progression/regression, candidate-policy refinement, or a bounded numeric severity channel; it does not retroactively rewrite this checkpoint without review.",
    "",
    "## Blueprint Maintenance",
    "",
    "The blueprint records only the enduring principles established here: pre-session moderate severity is non-numeric at Candidate Intelligence scope until reviewed longitudinal evidence supports calibration; any future intensity calibration remains signal-level rather than per stress fact; pain suitability owns intensity/tolerance while joint cost owns exposure. Temporary grids and candidate coefficients remain outside the blueprint.",
    "",
    "## Remaining P1",
    "",
    "- Phase suitability still requires human exercise-science calibration across full session context.",
    "",
    `Final calibration-lab classification: **${data.classification}**`,
    "",
  ].join("\n");
}

export function writeModeratePainCalibrationDecision(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: ModeratePainCalibrationData;
} {
  const data = buildModeratePainCalibrationData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/MODERATE_PAIN_CALIBRATION_DECISION.md",
  );
  writeFileSync(outputPath, renderModeratePainCalibrationDecision(data));

  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeModeratePainCalibrationDecision();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        productionCases: result.data.productionCaseCount,
        matrixRows: result.data.matrix.length,
        policyVariants: result.data.policies.length,
        rankChanges: result.data.matrix.filter(
          (row) => row.rankDeltaFromFlat !== null && row.rankDeltaFromFlat !== 0,
        ).length,
        winnerChanges: result.data.winnerChanges.length,
        finalClassification: result.data.classification,
      },
      null,
      2,
    ),
  );
}
