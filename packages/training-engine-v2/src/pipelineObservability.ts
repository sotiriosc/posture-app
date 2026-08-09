import type { ReasonCode } from "./reasonCodes";

export const PIPELINE_STAGES = [
  "normalized_athlete_state",
  "interpreted_assessment",
  "alignment_priorities",
  "phase_intent",
  "weekly_intent",
  "session_intent",
  "hard_rejected_candidates",
  "legal_candidate_pool",
  "candidate_score_breakdowns",
  "session_candidates",
  "session_evaluation",
  "week_candidates",
  "week_evaluation",
  "prescription",
  "progression_decision",
  "validation",
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGES)[number];

export type BugLocalizationStage =
  | "input_interpretation"
  | "assessment_interpretation"
  | "phase_intent"
  | "session_intent"
  | "eligibility"
  | "candidate_scoring"
  | "session_composition"
  | "week_composition"
  | "prescription"
  | "progression"
  | "validation";

export interface PipelineSnapshot<Payload = unknown> {
  readonly stage: PipelineStageId;
  readonly localizationStage: BugLocalizationStage;
  readonly componentId?: string;
  readonly payload: Payload;
  readonly reasonCodes: readonly ReasonCode[];
}

export interface PipelineObservationLog {
  readonly snapshots: readonly PipelineSnapshot[];
}

export function createPipelineSnapshot<Payload>(input: {
  readonly stage: PipelineStageId;
  readonly localizationStage: BugLocalizationStage;
  readonly componentId?: string;
  readonly payload: Payload;
  readonly reasonCodes?: readonly ReasonCode[];
}): PipelineSnapshot<Payload> {
  return {
    stage: input.stage,
    localizationStage: input.localizationStage,
    componentId: input.componentId,
    payload: input.payload,
    reasonCodes: [...(input.reasonCodes ?? [])].sort(),
  };
}

export function appendPipelineSnapshot(
  log: PipelineObservationLog,
  snapshot: PipelineSnapshot,
): PipelineObservationLog {
  return {
    snapshots: [...log.snapshots, snapshot],
  };
}
