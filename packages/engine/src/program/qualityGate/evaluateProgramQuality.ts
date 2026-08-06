import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { getExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingRegistry";
import { resolveExerciseDemoStatus } from "@/lib/coaching/exerciseDemoPolicy";
import {
  containsInternalCodeLeak,
  containsPlaceholderCopy,
} from "@/lib/coaching/synthesizeExerciseCoaching";
import {
  resolvePrimaryProgramEquipmentMode,
  type PrimaryProgramEquipmentMode,
} from "@/lib/program/equipmentMode";
import { validateGymProgramContract } from "@/lib/program/gymProgramContract";
import {
  collectDeferredDumbbellExperienceGaps,
  scoreDumbbellProgramStructuralQuality,
  validateDumbbellProgramContract,
} from "@/lib/program/dumbbellProgramContract";
import {
  collectDeferredBandExperienceGaps,
  scoreBandProgramStructuralQuality,
  validateBandProgramContract,
} from "@/lib/program/bandProgramContract";
import {
  collectDeferredBodyweightExperienceGaps,
  scoreBodyweightProgramStructuralQuality,
  validateBodyweightProgramContract,
} from "@/lib/program/bodyweightProgramContract";
import {
  collectDeferredMixedHomeExperienceGaps,
  scoreMixedHomeProgramStructuralQuality,
  validateMixedHomeProgramContract,
} from "@/lib/program/mixedHomeProgramContract";
import {
  collectDeferredExperienceGaps,
  scoreGymProgramStructuralQuality,
} from "@/lib/program/gymProgramContract";
import type { Program } from "@/lib/types";
import {
  resolveProgramQualitySeverity,
  USER_SAFE_QUALITY_MESSAGE,
} from "@/lib/program/qualityGate/programQualityPolicy";
import { computeProgramQualitySignature } from "@/lib/program/qualityGate/programQualitySignature";
import type {
  ProgramQualityEvaluation,
  ProgramQualityFinding,
} from "@/lib/program/qualityGate/qualityGateTypes";

export type EvaluateProgramQualityInput = {
  program: Program;
  questionnaire: QuestionnaireData;
  persona?: string;
  compareProgram?: Program | null;
  /**
   * Optional personal blocks. When provided, any blocked exercise present in the
   * program is a hard failure (independent of generation-time filtering).
   */
  blockedExerciseIds?: string[] | Set<string> | Record<string, unknown>;
};

const toFinding = (params: {
  code: string;
  mode: PrimaryProgramEquipmentMode;
  internalMessage: string;
  sourceContract: string;
  exerciseId?: string | null;
  dayTitle?: string | null;
  slot?: string | null;
  expected?: unknown;
  actual?: unknown;
  programId?: string;
  phase?: string | number | null;
  frequency?: number;
}): ProgramQualityFinding => {
  const severity = resolveProgramQualitySeverity(params.code);
  return {
    code: params.code,
    severity,
    mode: params.mode,
    programId: params.programId,
    phase: params.phase == null ? undefined : String(params.phase),
    frequency: params.frequency,
    slot: params.slot ?? undefined,
    exerciseId: params.exerciseId ?? undefined,
    expected: params.expected,
    actual: params.actual,
    userActionable: severity === "hardFailure",
    internalMessage: params.internalMessage,
    userSafeMessage:
      severity === "hardFailure" ? USER_SAFE_QUALITY_MESSAGE : undefined,
    sourceContract: params.sourceContract,
  };
};

const collectModeFailures = (
  input: EvaluateProgramQualityInput,
  mode: PrimaryProgramEquipmentMode
): ProgramQualityFinding[] => {
  const { program, questionnaire } = input;
  const persona = input.persona ?? "quality-gate";
  const equipment = questionnaire.equipment ?? [];
  const experience = questionnaire.experience;
  const painAreas = questionnaire.painAreas ?? [];
  const phaseIndex = program.phaseIndex;

  const mapMode = (
    failures: Array<{
      reasonCode: string;
      detail: string;
      exerciseId?: string | null;
      dayTitle?: string | null;
      slot?: string | null;
      expectedRole?: string | null;
      actualRole?: string | null;
    }>,
    source: string
  ) =>
    failures.map((failure) =>
      toFinding({
        code: failure.reasonCode,
        mode,
        internalMessage: failure.detail,
        sourceContract: source,
        exerciseId: failure.exerciseId,
        dayTitle: failure.dayTitle,
        slot: failure.slot,
        expected: failure.expectedRole,
        actual: failure.actualRole,
        programId: program.id,
        phase: phaseIndex,
        frequency: program.daysPerWeek,
      })
    );

  switch (mode) {
    case "gym":
      return mapMode(
        validateGymProgramContract({
          program,
          persona,
          equipment,
          experience,
          painAreas,
        }),
        "gymProgramContract"
      );
    case "dumbbells":
      return mapMode(
        validateDumbbellProgramContract({
          program,
          persona,
          equipment,
          experience,
          painAreas,
          phaseIndex,
        }),
        "dumbbellProgramContract"
      );
    case "bands":
      return mapMode(
        validateBandProgramContract({
          program,
          persona,
          equipment,
          bandSetup: questionnaire.bandSetup,
          experience,
          phaseIndex,
        }),
        "bandProgramContract"
      );
    case "bodyweight":
      return mapMode(
        validateBodyweightProgramContract({
          program,
          persona,
          equipment,
          experience,
          painAreas,
          phaseIndex,
        }),
        "bodyweightProgramContract"
      );
    case "mixedHome":
      return mapMode(
        validateMixedHomeProgramContract({
          program,
          persona,
          equipment,
          bandSetup: questionnaire.bandSetup,
          experience,
          painAreas,
          phaseIndex,
        }),
        "mixedHomeProgramContract"
      );
    default:
      return [
        toFinding({
          code: "QUALITY_UNKNOWN_MODE",
          mode: "gym",
          internalMessage: `Unknown primary equipment mode: ${mode}`,
          sourceContract: "evaluateProgramQuality",
          programId: program.id,
        }),
      ];
  }
};

const collectDeferredFindings = (
  program: Program,
  mode: PrimaryProgramEquipmentMode
): ProgramQualityFinding[] => {
  const findings: ProgramQualityFinding[] = [];
  const pushDeferred = (
    exerciseId: string,
    gap: string,
    source: string
  ) => {
    const code =
      gap === "demo" || gap === "capability_limitation"
        ? gap === "demo"
          ? "DEFERRED_DEMO"
          : "QUALITY_CAPABILITY_LIMITATION_NOTE"
        : `DEFERRED_${gap.toUpperCase()}`;
    findings.push(
      toFinding({
        code,
        mode,
        internalMessage: `${gap} for ${exerciseId}`,
        sourceContract: source,
        exerciseId,
        programId: program.id,
      })
    );
  };

  if (mode === "gym") {
    for (const gap of collectDeferredExperienceGaps(program)) {
      pushDeferred(gap.exerciseId, gap.gap, "gymProgramContract");
    }
  } else if (mode === "dumbbells") {
    for (const gap of collectDeferredDumbbellExperienceGaps(program)) {
      pushDeferred(gap.exerciseId, gap.kind, "dumbbellProgramContract");
    }
  } else if (mode === "bands") {
    for (const gap of collectDeferredBandExperienceGaps(program)) {
      pushDeferred(gap.exerciseId, gap.kind, "bandProgramContract");
    }
  } else if (mode === "bodyweight") {
    for (const gap of collectDeferredBodyweightExperienceGaps(program)) {
      pushDeferred(gap.exerciseId, gap.kind, "bodyweightProgramContract");
    }
  } else if (mode === "mixedHome") {
    for (const gap of collectDeferredMixedHomeExperienceGaps(program)) {
      pushDeferred(gap.exerciseId, gap.kind, "mixedHomeProgramContract");
    }
  }
  return findings;
};

const collectCoachingFindings = (
  program: Program,
  mode: PrimaryProgramEquipmentMode
): ProgramQualityFinding[] => {
  const findings: ProgramQualityFinding[] = [];
  const seen = new Set<string>();
  for (const day of program.week) {
    for (const item of day.routine) {
      if (seen.has(item.exerciseId)) continue;
      seen.add(item.exerciseId);
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) {
        findings.push(
          toFinding({
            code: "QUALITY_UNRESOLVABLE_EXERCISE_ID",
            mode,
            internalMessage: `Unresolvable exercise id ${item.exerciseId}`,
            sourceContract: "coaching",
            exerciseId: item.exerciseId,
            dayTitle: day.title,
            programId: program.id,
          })
        );
        continue;
      }
      const content = getExerciseCoachingContent(item.exerciseId);
      if (!content) {
        findings.push(
          toFinding({
            code: "COACHING_MISSING_CONTENT",
            mode,
            internalMessage: `Missing coaching content for ${item.exerciseId}`,
            sourceContract: "coaching",
            exerciseId: item.exerciseId,
            programId: program.id,
          })
        );
        continue;
      }
      if (
        !content.setupSteps?.length ||
        !content.executionSteps?.length ||
        !content.primaryCue?.trim() ||
        !content.expectedFeel?.length ||
        !content.commonMistake?.trim() ||
        !content.correction?.trim() ||
        !content.stopSignals?.length
      ) {
        findings.push(
          toFinding({
            code: "COACHING_INCOMPLETE_WRITTEN",
            mode,
            internalMessage: `Incomplete written coaching for ${item.exerciseId}`,
            sourceContract: "coaching",
            exerciseId: item.exerciseId,
            programId: program.id,
          })
        );
      }
      const blob = [
        content.shortPurpose,
        content.primaryCue,
        ...content.setupSteps,
        ...content.executionSteps,
        content.commonMistake,
        content.correction,
      ].join(" ");
      if (containsPlaceholderCopy(blob) || containsInternalCodeLeak(blob)) {
        findings.push(
          toFinding({
            code: "COACHING_INVALID_COPY",
            mode,
            internalMessage: `Invalid coaching copy for ${item.exerciseId}`,
            sourceContract: "coaching",
            exerciseId: item.exerciseId,
            programId: program.id,
          })
        );
      }
      const demoStatus = resolveExerciseDemoStatus({
        exercise,
        demoRequirement: content.demoRequirement,
      });
      if (demoStatus === "planned") {
        findings.push(
          toFinding({
            code: "COACHING_DEMO_PLANNED",
            mode,
            internalMessage: `Demo planned for ${item.exerciseId}`,
            sourceContract: "coaching",
            exerciseId: item.exerciseId,
            programId: program.id,
          })
        );
      }
    }
  }
  return findings;
};

const resolveBlockedIdSet = (
  blocked?: EvaluateProgramQualityInput["blockedExerciseIds"]
): Set<string> => {
  if (!blocked) return new Set();
  if (blocked instanceof Set) return blocked;
  if (Array.isArray(blocked)) return new Set(blocked);
  return new Set(Object.keys(blocked));
};

const collectBlockedFindings = (
  input: EvaluateProgramQualityInput,
  mode: PrimaryProgramEquipmentMode
): ProgramQualityFinding[] => {
  const blocked = resolveBlockedIdSet(input.blockedExerciseIds);
  if (!blocked.size) return [];
  const findings: ProgramQualityFinding[] = [];
  for (const day of input.program.week) {
    for (const item of day.routine) {
      if (!blocked.has(item.exerciseId)) continue;
      findings.push(
        toFinding({
          code: "QUALITY_BLOCKED_EXERCISE_PRESENT",
          mode,
          internalMessage: `Personally blocked exercise ${item.exerciseId} present in program`,
          sourceContract: "evaluateProgramQuality",
          exerciseId: item.exerciseId,
          dayTitle: day.title,
          programId: input.program.id,
        })
      );
    }
  }
  return findings;
};

/** Validates explicit progress-to:<exerciseId> refs and catalog progression links. */
const collectProgressionFindings = (
  program: Program,
  mode: PrimaryProgramEquipmentMode
): ProgramQualityFinding[] => {
  const findings: ProgramQualityFinding[] = [];
  for (const day of program.week) {
    for (const item of day.routine) {
      const rule = item.prescription?.progressionRule ?? "";
      const explicit = /^progress-to:(.+)$/.exec(rule.trim());
      if (explicit) {
        const targetId = explicit[1].trim();
        if (!exerciseById(targetId)) {
          findings.push(
            toFinding({
              code: "QUALITY_INVALID_PROGRESSION_REFERENCE",
              mode,
              internalMessage: `Invalid progression reference progress-to:${targetId}`,
              sourceContract: "evaluateProgramQuality",
              exerciseId: item.exerciseId,
              dayTitle: day.title,
              programId: program.id,
              expected: "resolvable exercise id",
              actual: targetId,
            })
          );
        }
      }
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) continue;
      for (const field of ["progressionOf", "regressionOf"] as const) {
        const ref = exercise[field];
        if (ref && !exerciseById(ref)) {
          findings.push(
            toFinding({
              code: "QUALITY_INVALID_PROGRESSION_REFERENCE",
              mode,
              internalMessage: `Catalog ${field}=${ref} does not resolve for ${exercise.id}`,
              sourceContract: "exerciseCatalog",
              exerciseId: exercise.id,
              dayTitle: day.title,
              programId: program.id,
              expected: "resolvable exercise id",
              actual: ref,
            })
          );
        }
      }
    }
  }
  return findings;
};

const structuralScoreFor = (
  mode: PrimaryProgramEquipmentMode,
  hardFailureCount: number,
  deferredGapCount: number
) => {
  const failures = Array.from({ length: hardFailureCount }, () => ({
    reasonCode: "QUALITY_SCORE_PLACEHOLDER",
  })) as never[];
  if (mode === "gym") {
    return scoreGymProgramStructuralQuality({
      failures,
      deferredGapCount,
    }).structuralScore;
  }
  if (mode === "dumbbells") {
    return scoreDumbbellProgramStructuralQuality({
      failures,
      deferredGapCount,
    }).structuralScore;
  }
  if (mode === "bands") {
    return scoreBandProgramStructuralQuality({
      failures,
      deferredGapCount,
    }).structuralScore;
  }
  if (mode === "bodyweight") {
    return scoreBodyweightProgramStructuralQuality({
      failures,
      deferredGapCount,
    }).structuralScore;
  }
  return scoreMixedHomeProgramStructuralQuality({
    failures,
    deferredGapCount,
  }).structuralScore;
};

export const evaluateProgramQuality = (
  input: EvaluateProgramQualityInput
): ProgramQualityEvaluation => {
  const started = Date.now();
  const mode = resolvePrimaryProgramEquipmentMode(
    input.questionnaire.equipment ?? []
  );
  const findings = [
    ...collectModeFailures(input, mode),
    ...collectDeferredFindings(input.program, mode),
    ...collectCoachingFindings(input.program, mode),
    ...collectBlockedFindings(input, mode),
    ...collectProgressionFindings(input.program, mode),
  ];

  if (input.compareProgram) {
    const a = computeProgramQualitySignature({
      mode,
      phaseIndex: input.program.phaseIndex ?? 1,
      daysPerWeek: input.program.daysPerWeek,
      week: input.program.week,
    });
    const b = computeProgramQualitySignature({
      mode,
      phaseIndex: input.compareProgram.phaseIndex ?? 1,
      daysPerWeek: input.compareProgram.daysPerWeek,
      week: input.compareProgram.week,
    });
    if (a !== b) {
      findings.push(
        toFinding({
          code: "QUALITY_NONDETERMINISTIC_REPEAT",
          mode,
          internalMessage: `Deterministic signature mismatch ${a} vs ${b}`,
          sourceContract: "programQualitySignature",
          programId: input.program.id,
        })
      );
    }
  }

  const hardFailures = findings.filter((f) => f.severity === "hardFailure");
  const warnings = findings.filter((f) => f.severity === "warning");
  const capabilityLimitations = findings.filter(
    (f) => f.severity === "capabilityLimitation"
  );
  const deferredContent = findings.filter((f) => f.severity === "deferredContent");
  const coachingHard = hardFailures.some((f) => f.code.startsWith("COACHING_"));
  const signature = computeProgramQualitySignature({
    mode,
    phaseIndex: input.program.phaseIndex ?? 1,
    daysPerWeek: input.program.daysPerWeek,
    week: input.program.week,
    capabilityLimitationCodes: capabilityLimitations.map((f) => f.code),
  });

  return {
    passed: hardFailures.length === 0,
    hardFailures,
    warnings,
    capabilityLimitations,
    deferredContent,
    structuralScore: structuralScoreFor(
      mode,
      hardFailures.length,
      deferredContent.length
    ),
    coachingComplete: !coachingHard,
    deterministicSignature: signature,
    elapsedMs: Date.now() - started,
    templateVersion: input.program.templateVersion ?? 18,
  };
};
