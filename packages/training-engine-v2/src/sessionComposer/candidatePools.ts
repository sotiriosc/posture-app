import type { AlignmentPriority } from "../alignment";
import {
  candidateNeedFromSessionNeed,
  rankCandidateRequest,
  type CandidateRankingResult,
} from "../candidate";
import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { SessionIntent, SessionNeed } from "../domain/session";
import type { TrainingSafetyState } from "../domain/trainingSafety";
import { REFERENCE_EXERCISES } from "../data/referenceExercises";
import type { SessionCandidateResultConsistency } from "./contracts";

export const SESSION_COMPOSER_CATALOG_FINGERPRINT =
  "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91";

export interface SessionCandidateBuildContext {
  readonly athlete: AthleteProfile;
  readonly assessment: AssessmentState;
  readonly alignmentPriorities: readonly AlignmentPriority[];
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety?: TrainingSafetyState;
  readonly equipment: EquipmentCapabilities;
  readonly history: TrainingHistory;
  readonly satisfiedPrerequisiteIds: readonly string[];
  readonly evaluationAsOf: string;
}

export class SessionComposerInputError extends Error {
  readonly codes: readonly string[];

  constructor(codes: readonly string[]) {
    super(`Invalid Session Composer input: ${codes.join(", ")}.`);
    this.name = "SessionComposerInputError";
    this.codes = codes;
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonical).sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function painIds(pain: PainAndInjuryState): readonly string[] {
  return [
    ...pain.historicalSensitivities,
    ...pain.currentDiscomforts,
    ...pain.moderatePain,
    ...pain.acuteSeverePain,
    ...pain.hardContraindications,
  ].map((entry) => entry.id).sort();
}

function continuityForNeed(intent: SessionIntent, need: SessionNeed) {
  const relevant = intent.continuityEvidence.identities.filter((identity) =>
    identity.previouslyServedNeedIds.includes(need.id),
  );
  return {
    currentExerciseId: relevant.find((entry) => entry.productive)?.exerciseId,
    previousExerciseId: relevant[0]?.exerciseId,
    productiveExerciseIds: relevant.filter((entry) => entry.productive).map((entry) => entry.exerciseId),
    plateauedExerciseIds: relevant.filter((entry) => entry.plateaued).map((entry) => entry.exerciseId),
    failedProgressionExerciseIds: relevant.filter((entry) => entry.failedProgression).map((entry) => entry.exerciseId),
    painResponseExerciseIds: relevant.filter((entry) => entry.repeatedAdverseEvidence).map((entry) => entry.exerciseId),
  };
}

export function validateSessionIntent(intent: SessionIntent): readonly string[] {
  const errors: string[] = [];
  if (!intent.id.trim()) errors.push("missing_session_intent_id");
  if (!intent.athleteId.trim()) errors.push("missing_session_athlete_id");
  if (!Number.isFinite(intent.availableMinutes) || intent.availableMinutes < 0) {
    errors.push("invalid_available_minutes");
  }
  const ids = new Set<string>();
  const tierOrders = new Set<string>();
  for (const need of intent.needs) {
    if (ids.has(need.id)) errors.push(`duplicate_need_id:${need.id}`);
    ids.add(need.id);
    if (!Number.isInteger(need.priorityOrder) || need.priorityOrder < 0) {
      errors.push(`invalid_priority_order:${need.id}`);
    }
    const tierOrder = `${need.priority}:${need.priorityOrder}`;
    if (tierOrders.has(tierOrder)) errors.push(`duplicate_priority_order:${tierOrder}`);
    tierOrders.add(tierOrder);
    if (need.selection.requestedRole.length === 0) errors.push(`missing_need_role:${need.id}`);
  }
  if (
    intent.kind === "ordinary_training" &&
    !intent.needs.some((need) => need.priority === "required" && need.section === "main")
  ) {
    errors.push("ordinary_session_requires_dominant_main_need");
  }
  return [...new Set(errors)].sort();
}

export function buildSessionCandidateResults(
  intent: SessionIntent,
  context: SessionCandidateBuildContext,
): Readonly<Record<string, CandidateRankingResult>> {
  const errors = [...validateSessionIntent(intent)];
  if (context.athlete.id !== intent.athleteId) errors.push("cross_athlete_build_context");
  if (context.athlete.primaryGoal !== intent.primaryGoal) {
    // Athlete and session goals may differ; SessionIntent remains session authority.
  }
  if (errors.length > 0) throw new SessionComposerInputError([...new Set(errors)].sort());

  return Object.freeze(Object.fromEntries(
    [...intent.needs]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((need) => {
        const result = rankCandidateRequest({
          id: `${intent.id}:${need.id}:candidate-request`,
          evaluationContext: { asOf: context.evaluationAsOf },
          athlete: context.athlete,
          goal: intent.outcomeGoal ?? intent.primaryGoal,
          phase: intent.phaseIntent,
          need: candidateNeedFromSessionNeed(need, intent.outcomeGoal ?? intent.primaryGoal),
          sessionIntent: intent,
          assessment: context.assessment,
          alignmentPriorities: context.alignmentPriorities,
          painAndInjury: context.painAndInjury,
          trainingSafety: context.trainingSafety,
          equipment: context.equipment,
          history: context.history,
          continuity: continuityForNeed(intent, need),
          candidatePool: REFERENCE_EXERCISES,
          satisfiedPrerequisiteIds: context.satisfiedPrerequisiteIds,
          fatigueSignals: intent.fatigueContext,
        });
        return [need.id, result] as const;
      }),
  ));
}

function requestContext(result: CandidateRankingResult) {
  const request = result.request;
  return {
    athlete: request.athlete,
    goal: request.goal,
    phase: request.phase,
    assessment: request.assessment,
    alignmentPriorities: request.alignmentPriorities,
    painAndInjury: request.painAndInjury,
    trainingSafety: request.trainingSafety ?? { signals: [] },
    equipment: request.equipment,
    history: request.history,
    fatigueSignals: request.fatigueSignals,
    evaluationAsOf: request.evaluationContext?.asOf ?? null,
    candidatePoolIds: request.candidatePool.map((entry) => entry.id).sort(),
  };
}

export function validateSessionCandidateResults(
  intent: SessionIntent,
  candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>>,
): SessionCandidateResultConsistency {
  const errors = [...validateSessionIntent(intent)];
  const expectedCatalogIds = REFERENCE_EXERCISES.map((entry) => entry.id).sort();
  const results = Object.entries(candidateResultsByNeed).sort(([left], [right]) => left.localeCompare(right));
  const baseline = results[0]?.[1];
  const baselineContext = baseline ? requestContext(baseline) : null;

  if (results.length !== intent.needs.length) errors.push("candidate_result_count_mismatch");
  for (const need of intent.needs) {
    const result = candidateResultsByNeed[need.id];
    if (!result) {
      errors.push(`missing_candidate_result:${need.id}`);
      continue;
    }
    const expectedNeed = candidateNeedFromSessionNeed(need, intent.primaryGoal);
    if (result.request.need.id !== need.id) errors.push(`candidate_need_id_mismatch:${need.id}`);
    if (!same(result.request.need, expectedNeed)) errors.push(`candidate_need_truth_mismatch:${need.id}`);
    if (result.request.athlete.id !== intent.athleteId) errors.push(`candidate_athlete_mismatch:${need.id}`);
    if (result.request.goal !== intent.primaryGoal) errors.push(`candidate_goal_mismatch:${need.id}`);
    if (result.request.phase.id !== intent.phaseIntent.id) errors.push(`candidate_phase_mismatch:${need.id}`);
    if (result.request.sessionIntent?.id !== intent.id) errors.push(`candidate_session_intent_mismatch:${need.id}`);
    if (!same(result.request.assessment.signals.map((entry) => entry.id), intent.assessmentContextRefs)) {
      errors.push(`candidate_assessment_context_mismatch:${need.id}`);
    }
    if (!same(painIds(result.request.painAndInjury), intent.painResponseContextRefs)) {
      errors.push(`candidate_pain_context_mismatch:${need.id}`);
    }
    if (!same(result.request.fatigueSignals, intent.fatigueContext)) {
      errors.push(`candidate_fatigue_context_mismatch:${need.id}`);
    }
    if (!same(result.request.candidatePool.map((entry) => entry.id), expectedCatalogIds)) {
      errors.push(`candidate_catalog_mismatch:${need.id}`);
    }
    if (baselineContext && !same(requestContext(result), baselineContext)) {
      errors.push(`cross_result_context_mismatch:${need.id}`);
    }
  }
  for (const key of Object.keys(candidateResultsByNeed)) {
    if (!intent.needs.some((need) => need.id === key)) errors.push(`unexpected_candidate_result:${key}`);
  }
  return {
    valid: errors.length === 0,
    errorCodes: [...new Set(errors)].sort(),
    catalogFingerprint: SESSION_COMPOSER_CATALOG_FINGERPRINT,
  };
}
