/**
 * Mode-specific canonical fallback seed suffixes for Phase 7 recovery.
 * Prefer re-entering the existing template authorship path with a stable seed
 * rather than inventing a second generator.
 */

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  resolvePrimaryProgramEquipmentMode,
  type PrimaryProgramEquipmentMode,
} from "@/lib/program/equipmentMode";

const MODE_FALLBACK_SUFFIX: Record<PrimaryProgramEquipmentMode, string> = {
  gym: "canonical-gym-template",
  dumbbells: "canonical-dumbbell-abc",
  bands: "canonical-band-lane",
  bodyweight: "canonical-bodyweight-support",
  mixedHome: "canonical-mixed-home-lane",
};

export const resolveModeQualityFallbackSeed = (params: {
  baseSeed: string;
  questionnaire: QuestionnaireData;
}): { mode: PrimaryProgramEquipmentMode; seed: string; strategy: string } => {
  const mode = resolvePrimaryProgramEquipmentMode(
    params.questionnaire.equipment ?? []
  );
  const days = params.questionnaire.daysPerWeek ?? 3;
  const experience = params.questionnaire.experience ?? "Beginner";
  const bandLane = params.questionnaire.bandSetup
    ? JSON.stringify(params.questionnaire.bandSetup)
    : "default";
  const strategy = `mode-template-fallback:${mode}:${MODE_FALLBACK_SUFFIX[mode]}`;
  const seed = [
    params.baseSeed,
    "quality-fallback",
    mode,
    MODE_FALLBACK_SUFFIX[mode],
    `d${days}`,
    experience,
    bandLane,
  ].join(":");
  return { mode, seed, strategy };
};
