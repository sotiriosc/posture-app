/**
 * Presentation resolver: catalog + registry + prescription/rationale + capabilities.
 */

import { exerciseById } from "@/lib/exercises";
import type {
  ExercisePrescription,
  ExerciseRationale,
  ProgramRoutineItem,
} from "@/lib/types";
import type { ExerciseCoachingViewModel } from "@/lib/coaching/exerciseCoachingContract";
import { getExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingRegistry";
import {
  demoStatusLabel,
  resolveExerciseDemoStatus,
} from "@/lib/coaching/exerciseDemoPolicy";
import type { BandSetupLane } from "@/lib/program/bandSetup";

export type ResolveExerciseCoachingInput = {
  exerciseId: string;
  item?: {
    sets?: ProgramRoutineItem["sets"];
    reps?: ProgramRoutineItem["reps"];
    durationSec?: ProgramRoutineItem["durationSec"];
    restSec?: ProgramRoutineItem["restSec"];
    prescription?: ProgramRoutineItem["prescription"];
    rationale?: ProgramRoutineItem["rationale"];
    loadType?: ProgramRoutineItem["loadType"];
    section?: ProgramRoutineItem["section"] | string;
  };
  prescription?: ExercisePrescription;
  rationale?: ExerciseRationale;
  /** Confirmed user capabilities — used to filter unconfirmed support/anchor copy. */
  capabilities?: {
    hasBench?: boolean;
    hasPullupBar?: boolean;
    bandSetupLane?: BandSetupLane | string | null;
    equipment?: string[];
  };
};

const formatSets = (sets: ProgramRoutineItem["sets"] | undefined) => {
  if (sets === null || sets === undefined) return undefined;
  return String(sets);
};

const repsOrDurationFor = (
  item: ResolveExerciseCoachingInput["item"],
  prescription?: ExercisePrescription
) => {
  if (prescription?.reps?.trim()) return prescription.reps.trim();
  if (item?.reps?.trim()) return item.reps.trim();
  if (typeof item?.durationSec === "number") return `${item.durationSec}s`;
  return "As prescribed";
};

const filterSetupForCapabilities = (
  steps: string[],
  capabilities?: ResolveExerciseCoachingInput["capabilities"]
) => {
  if (!capabilities) return steps;
  const lane = String(capabilities.bandSetupLane ?? "");
  const noAnchor =
    lane.includes("no_anchor") ||
    lane === "loop_only" ||
    lane === "legacy_unknown" ||
    lane === "none";
  const loopOnly = lane.includes("loop_only");
  return steps.filter((step) => {
    const lower = step.toLowerCase();
    if (!capabilities.hasBench && lower.includes("bench")) return false;
    if (!capabilities.hasPullupBar && lower.includes("pull-up bar")) return false;
    if (noAnchor && (lower.includes("fixed anchor") || lower.includes("door"))) {
      return false;
    }
    if (loopOnly && lower.includes("long band") && !lower.includes("mini-loop")) {
      return false;
    }
    return true;
  });
};

export const resolveExerciseCoachingViewModel = (
  input: ResolveExerciseCoachingInput
): ExerciseCoachingViewModel | null => {
  const exercise = exerciseById(input.exerciseId);
  const content = getExerciseCoachingContent(input.exerciseId);
  if (!exercise || !content) return null;

  const prescription = input.prescription ?? input.item?.prescription;
  const rationale = input.rationale ?? input.item?.rationale;
  const setupSteps = filterSetupForCapabilities(
    content.setupSteps,
    input.capabilities
  );
  const equipmentNeeded = (exercise.equipment ?? []).filter(
    (item) => item && item !== "none"
  );

  const demoStatus = resolveExerciseDemoStatus({
    exercise,
    demoRequirement: content.demoRequirement,
  });

  const regression =
    content.regressionId && exerciseById(content.regressionId)
      ? {
          id: content.regressionId,
          name: exerciseById(content.regressionId)!.name,
        }
      : rationale?.easierVersion
        ? { id: "", name: rationale.easierVersion }
        : undefined;

  const progressionLabel =
    prescription?.progressionRule?.trim() ||
    (content.progressionId && exerciseById(content.progressionId)
      ? `Progress toward ${exerciseById(content.progressionId)!.name} when form is solid.`
      : rationale?.harderVersion
        ? `Progress toward ${rationale.harderVersion} when form is solid.`
        : "Keep owning clean reps before increasing demand.");

  const progression = {
    id: content.progressionId,
    label: progressionLabel,
    nextTarget: prescription?.progressionRule?.trim() || progressionLabel,
  };

  const setupSummary =
    content.equipmentSetup?.[0] ??
    setupSteps[0] ??
    (equipmentNeeded.length
      ? `Equipment: ${equipmentNeeded.join(", ")}`
      : "Bodyweight — clear floor space");

  let capabilityNote: string | undefined;
  const lane = String(input.capabilities?.bandSetupLane ?? "");
  if (
    content.anchorSetup?.required &&
    (lane.includes("no_anchor") || lane === "loop_only" || lane === "legacy_unknown")
  ) {
    capabilityNote =
      "This variation normally needs a confirmed fixed anchor. Use only when that setup is available, or swap to a no-anchor option.";
  }
  if (!input.capabilities?.hasBench && (exercise.equipment ?? []).includes("bench")) {
    capabilityNote =
      "Bench setup is listed for this exercise — only use it when a bench is confirmed.";
  }

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    prescription: {
      sets: formatSets(prescription?.sets ?? input.item?.sets ?? undefined),
      repsOrDuration: repsOrDurationFor(input.item, prescription),
      restSeconds:
        prescription?.restSeconds ??
        (typeof input.item?.restSec === "number" ? input.item.restSec : undefined),
      tempo: prescription?.tempo,
    },
    equipmentNeeded,
    setupSummary,
    primaryCue: content.primaryCue,
    purpose: content.shortPurpose,
    whySelected: rationale?.whyThisExercise,
    setupSteps,
    executionSteps: content.executionSteps,
    expectedFeel: content.expectedFeel,
    avoidFeeling: content.avoidFeeling,
    commonMistake: content.commonMistake,
    correction: content.correction,
    stopSignals: content.stopSignals,
    regression: regression?.name ? regression : undefined,
    progression,
    demo: {
      status: demoStatus,
      url: demoStatus === "available" ? exercise.videoUrl : undefined,
      label: demoStatusLabel(demoStatus),
    },
    capabilityNote,
    guidanceHref: `/exercise/${exercise.id}`,
  };
};

/** Canonical primary cue for active cards — registry first, then rationale, then catalog. */
export const resolvePrimaryCue = (params: {
  exerciseId: string;
  rationaleCue?: string | null;
  catalogCue?: string | null;
}) => {
  const content = getExerciseCoachingContent(params.exerciseId);
  return (
    content?.primaryCue ||
    params.rationaleCue?.trim() ||
    params.catalogCue?.trim() ||
    "Move with control and keep posture stacked."
  );
};
