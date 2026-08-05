/**
 * Machine-readable coaching completeness validation (Phase 6 §18).
 */

import { exerciseById } from "@/lib/exercises";
import type {
  CoachingValidationFailure,
  ExerciseCoachingContent,
} from "@/lib/coaching/exerciseCoachingContract";
import { resolveExerciseDemoStatus } from "@/lib/coaching/exerciseDemoPolicy";
import { getExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingRegistry";
import { collectReleaseCriticalExerciseIds } from "@/lib/coaching/releaseCriticalExercises";
import {
  containsInternalCodeLeak,
  containsPlaceholderCopy,
} from "@/lib/coaching/synthesizeExerciseCoaching";

const collectText = (content: ExerciseCoachingContent): string[] => [
  content.shortPurpose,
  content.primaryCue,
  content.commonMistake,
  content.correction,
  ...content.setupSteps,
  ...content.executionSteps,
  ...content.expectedFeel,
  ...(content.avoidFeeling ?? []),
  ...content.stopSignals,
  ...(content.secondaryCues ?? []),
  ...(content.equipmentSetup ?? []),
  ...(content.supportSetup ?? []),
  content.anchorSetup?.safetyNote ?? "",
];

export const validateExerciseCoachingContent = (
  content: ExerciseCoachingContent
): CoachingValidationFailure[] => {
  const failures: CoachingValidationFailure[] = [];
  const exercise = exerciseById(content.exerciseId);
  if (!exercise) {
    failures.push({
      code: "UNKNOWN_EXERCISE_ID",
      exerciseId: content.exerciseId,
      detail: "Registry entry does not resolve to a catalog exercise.",
    });
    return failures;
  }
  if (exercise.deprecated) {
    failures.push({
      code: "DEPRECATED_PROMOTED",
      exerciseId: content.exerciseId,
      detail: "Deprecated exercise should not be newly promoted as release-critical.",
    });
  }
  if (!content.setupSteps?.length) {
    failures.push({
      code: "EMPTY_SETUP",
      exerciseId: content.exerciseId,
      detail: "setupSteps must be non-empty.",
    });
  }
  if (!content.executionSteps?.length) {
    failures.push({
      code: "EMPTY_EXECUTION",
      exerciseId: content.exerciseId,
      detail: "executionSteps must be non-empty.",
    });
  }
  if (!content.primaryCue?.trim()) {
    failures.push({
      code: "MISSING_PRIMARY_CUE",
      exerciseId: content.exerciseId,
      detail: "primaryCue is required.",
    });
  } else if (content.primaryCue.trim().length > 120) {
    failures.push({
      code: "MISSING_PRIMARY_CUE",
      exerciseId: content.exerciseId,
      detail: "primaryCue should stay concise (≤120 chars).",
    });
  }
  if (!content.expectedFeel?.length) {
    failures.push({
      code: "MISSING_EXPECTED_FEEL",
      exerciseId: content.exerciseId,
      detail: "expectedFeel is required.",
    });
  }
  if (!content.commonMistake?.trim() || !content.correction?.trim()) {
    failures.push({
      code: "MISSING_MISTAKE_OR_CORRECTION",
      exerciseId: content.exerciseId,
      detail: "commonMistake and correction are both required.",
    });
  }
  if (!content.stopSignals?.length) {
    failures.push({
      code: "MISSING_STOP_SIGNALS",
      exerciseId: content.exerciseId,
      detail: "stopSignals are required.",
    });
  }
  if (content.progressionId) {
    const prog = exerciseById(content.progressionId);
    if (!prog || prog.deprecated) {
      failures.push({
        code: "INVALID_PROGRESSION_REF",
        exerciseId: content.exerciseId,
        detail: `progressionId ${content.progressionId} is missing or deprecated.`,
      });
    }
  }
  if (content.regressionId) {
    const reg = exerciseById(content.regressionId);
    if (!reg || reg.deprecated) {
      failures.push({
        code: "INVALID_REGRESSION_REF",
        exerciseId: content.exerciseId,
        detail: `regressionId ${content.regressionId} is missing or deprecated.`,
      });
    }
  }

  const demoStatus = resolveExerciseDemoStatus({
    exercise,
    demoRequirement: content.demoRequirement,
  });
  if (demoStatus === "available" && !exercise.videoUrl?.trim()) {
    failures.push({
      code: "DEMO_STATUS_URL_MISMATCH",
      exerciseId: content.exerciseId,
      detail: "Demo status available requires a videoUrl.",
    });
  }
  if (exercise.videoUrl?.trim() && exercise.demoStatus === "none") {
    failures.push({
      code: "DEMO_STATUS_URL_MISMATCH",
      exerciseId: content.exerciseId,
      detail: "Catalog demoStatus none conflicts with a present videoUrl.",
    });
  }

  for (const text of collectText(content)) {
    if (!text) continue;
    if (containsPlaceholderCopy(text)) {
      failures.push({
        code: "PLACEHOLDER_COPY",
        exerciseId: content.exerciseId,
        detail: `Placeholder copy found: ${text.slice(0, 80)}`,
      });
      break;
    }
    if (containsInternalCodeLeak(text)) {
      failures.push({
        code: "INTERNAL_CODE_LEAK",
        exerciseId: content.exerciseId,
        detail: `Internal code language found: ${text.slice(0, 80)}`,
      });
      break;
    }
  }

  return failures;
};

export type ReleaseCriticalCoachingAudit = {
  releaseCriticalCount: number;
  completeCount: number;
  completenessPct: number;
  failures: CoachingValidationFailure[];
  missingRegistry: string[];
  byCode: Record<string, number>;
};

export const auditReleaseCriticalCoaching = (): ReleaseCriticalCoachingAudit => {
  const { releaseCritical } = collectReleaseCriticalExerciseIds();
  const failures: CoachingValidationFailure[] = [];
  const missingRegistry: string[] = [];
  let completeCount = 0;

  for (const id of releaseCritical) {
    const content = getExerciseCoachingContent(id);
    if (!content) {
      missingRegistry.push(id);
      failures.push({
        code: "MISSING_REGISTRY_ENTRY",
        exerciseId: id,
        detail: "No coaching content resolved.",
      });
      continue;
    }
    const itemFailures = validateExerciseCoachingContent(content).filter(
      (failure) => failure.code !== "DEPRECATED_PROMOTED"
    );
    if (itemFailures.length === 0) completeCount += 1;
    failures.push(...itemFailures);
  }

  const byCode: Record<string, number> = {};
  for (const failure of failures) {
    byCode[failure.code] = (byCode[failure.code] ?? 0) + 1;
  }

  return {
    releaseCriticalCount: releaseCritical.length,
    completeCount,
    completenessPct:
      releaseCritical.length === 0
        ? 100
        : Math.round((completeCount / releaseCritical.length) * 1000) / 10,
    failures,
    missingRegistry,
    byCode,
  };
};
