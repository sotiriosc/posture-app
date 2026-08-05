import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_THREE_DAY_TITLES,
  getDumbbellDayVolumeContract,
  isDumbbellFullBodyDayTitle,
  resolveDumbbellDayIdentity,
} from "@/lib/program/dumbbellTemplates";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { Program } from "@/lib/types";

export {
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_THREE_DAY_TITLES,
  isDumbbellFullBodyDayTitle,
  resolveDumbbellDayIdentity,
};

export const isDumbbellsOnlyEquipment = (equipment: QuestionnaireData["equipment"]) =>
  resolvePrimaryProgramEquipmentMode(equipment) === "dumbbells";

export const isBandsOnlyEquipment = (equipment: QuestionnaireData["equipment"]) =>
  resolvePrimaryProgramEquipmentMode(equipment) === "bands";

/** Dumbbell or band weeks use Full Body A/B/C (+ practice) titles. */
export const isFullBodyTemplateEquipment = (
  equipment: QuestionnaireData["equipment"]
) => isDumbbellsOnlyEquipment(equipment) || isBandsOnlyEquipment(equipment);

export const fullBodyADayTitle = DUMBBELL_THREE_DAY_TITLES[0];
export const fullBodyBDayTitle = DUMBBELL_THREE_DAY_TITLES[1];
export const fullBodyCDayTitle = DUMBBELL_THREE_DAY_TITLES[2];

/** Push + horizontal-pull day: gym Back+Chest or Full Body A. */
export const pushPullDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment) ? fullBodyADayTitle : "Back + Chest";

/** Hinge + overhead day: gym Legs+Abs hinge lives on day 3; Full Body B otherwise. */
export const hingeDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment) ? fullBodyBDayTitle : "Legs + Abs";

/** Shoulder/overhead day for full-body templates; gym Shoulders + Arms otherwise. */
export const shoulderDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment) ? fullBodyBDayTitle : "Shoulders + Arms";

/** Lower-body accessory day: gym Legs + Abs or Full Body C. */
export const lowerAccessoryDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment) ? fullBodyCDayTitle : "Legs + Abs";

export const findProgramDay = (program: Program, title: string) =>
  program.week.find((day) => day.title === title);

export const findProgramDayStartingWith = (program: Program, prefix: string) =>
  program.week.find((day) => day.title.startsWith(prefix));

export const expectedDumbbellMainCount = (
  dayTitle: string,
  experience: QuestionnaireData["experience"]
) => getDumbbellDayVolumeContract(dayTitle, experience)?.mainCount ?? null;

export const fullBodyDayTitles = () => [...DUMBBELL_THREE_DAY_TITLES];

/** Full-body template weeks may reuse one exercise across distinct main slots when the contract allows it. */
export const shouldEnforceRoutineExerciseIdUniqueness = (
  equipment: QuestionnaireData["equipment"]
) => !isFullBodyTemplateEquipment(equipment);

export const routineExerciseIdsAreUnique = (routine: Array<{ exerciseId: string }>) => {
  const ids = routine.map((item) => item.exerciseId);
  return new Set(ids).size === ids.length;
};
