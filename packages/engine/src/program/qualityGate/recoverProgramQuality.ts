import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program, ProgramDay } from "@/lib/types";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { evaluateProgramQuality } from "@/lib/program/qualityGate/evaluateProgramQuality";
import { resolveModeQualityFallbackSeed } from "@/lib/program/qualityGate/modeQualityFallback";
import {
  MAX_QUALITY_RECOVERY_ATTEMPTS,
  type ProgramQualityEvaluation,
} from "@/lib/program/qualityGate/qualityGateTypes";
import {
  recordProgramQualityObservability,
  toProgramQualityObservabilityEvent,
} from "@/lib/program/qualityGate/programQualityObservability";

export type QualityGuardedProgramResult =
  | { ok: true; program: Program; evaluation: ProgramQualityEvaluation }
  | { ok: false; evaluation: ProgramQualityEvaluation; message: string };

type GenerateFn = (
  questionnaire: QuestionnaireData,
  programId: string,
  options: { phaseIndex?: number; seed?: string; weekIndex?: number }
) => Program;

/**
 * Bounded deterministic recovery: re-generate with stable seed offsets, then
 * mode-identity-preserving template-seed fallback. Does not invent a second generator.
 */
export const recoverAndEvaluateProgramQuality = (params: {
  questionnaire: QuestionnaireData;
  programId: string;
  phaseIndex: number;
  baseSeed: string;
  initialProgram: Program;
  generate: GenerateFn;
}): QualityGuardedProgramResult => {
  const mode = resolvePrimaryProgramEquipmentMode(
    params.questionnaire.equipment ?? []
  );
  let evaluation = evaluateProgramQuality({
    program: params.initialProgram,
    questionnaire: params.questionnaire,
    persona: `quality-gate:${mode}`,
  });
  const firstPassPassed = evaluation.passed;
  let program = params.initialProgram;
  let recoveryAttemptCount = 0;
  let fallbackUsed = false;
  let fallbackStrategy: string | undefined;

  if (!evaluation.passed) {
    for (let attempt = 1; attempt <= MAX_QUALITY_RECOVERY_ATTEMPTS; attempt += 1) {
      recoveryAttemptCount = attempt;
      const seed = `${params.baseSeed}:quality-recovery:${attempt}`;
      program = params.generate(params.questionnaire, `${params.programId}-r${attempt}`, {
        phaseIndex: params.phaseIndex,
        seed,
      });
      evaluation = evaluateProgramQuality({
        program,
        questionnaire: params.questionnaire,
        persona: `quality-gate:${mode}:recovery-${attempt}`,
      });
      if (evaluation.passed) break;
    }
  }

  if (!evaluation.passed) {
    const fallback = resolveModeQualityFallbackSeed({
      baseSeed: params.baseSeed,
      questionnaire: params.questionnaire,
    });
    fallbackUsed = true;
    fallbackStrategy = fallback.strategy;
    program = params.generate(
      params.questionnaire,
      `${params.programId}-fallback`,
      {
        phaseIndex: params.phaseIndex,
        seed: fallback.seed,
      }
    );
    evaluation = evaluateProgramQuality({
      program,
      questionnaire: params.questionnaire,
      persona: `quality-gate:${mode}:fallback`,
    });
  }

  evaluation = {
    ...evaluation,
    recoveryAttempted: recoveryAttemptCount > 0 || fallbackUsed,
    recoveryAttemptCount,
    fallbackUsed,
    fallbackStrategy,
  };

  recordProgramQualityObservability(
    toProgramQualityObservabilityEvent({
      firstPassPassed,
      evaluation,
      mode,
    })
  );

  if (!evaluation.passed) {
    return {
      ok: false,
      evaluation,
      message:
        "We could not build a safe plan for your current equipment and preferences. Please adjust your equipment or pain answers and try again.",
    };
  }

  return { ok: true, program, evaluation };
};

/** Attach non-enumerable evaluation metadata for internal consumers. */
export const attachProgramQualityEvaluation = (
  program: Program,
  evaluation: ProgramQualityEvaluation
): Program => {
  const next = { ...program };
  const { elapsedMs: _elapsedMs, ...stableEvaluation } = evaluation;
  Object.defineProperty(next, "qualityEvaluation", {
    value: stableEvaluation,
    enumerable: false,
    writable: false,
    configurable: true,
  });
  return next;
};

export const weekExerciseIds = (week: ProgramDay[]) =>
  week.flatMap((day) => day.routine.map((item) => item.exerciseId));
