import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_THREE_DAY_TITLES,
  getDumbbellDayVolumeContract,
  isDumbbellFullBodyDayTitle,
  resolveDumbbellDayIdentity,
} from "@/lib/program/dumbbellTemplates";
import {
  BODYWEIGHT_THREE_DAY_TITLES,
  resolveBodyweightDayIdentity,
} from "@/lib/program/bodyweightTemplates";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { Program } from "@/lib/types";

export {
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_THREE_DAY_TITLES,
  isDumbbellFullBodyDayTitle,
  resolveDumbbellDayIdentity,
  BODYWEIGHT_THREE_DAY_TITLES,
  resolveBodyweightDayIdentity,
};

export const isDumbbellsOnlyEquipment = (equipment: QuestionnaireData["equipment"]) =>
  resolvePrimaryProgramEquipmentMode(equipment) === "dumbbells";

export const isBandsOnlyEquipment = (equipment: QuestionnaireData["equipment"]) =>
  resolvePrimaryProgramEquipmentMode(equipment) === "bands";

export const isBodyweightOnlyEquipment = (equipment: QuestionnaireData["equipment"]) =>
  resolvePrimaryProgramEquipmentMode(equipment) === "bodyweight";

/** Dumbbell, band, or bodyweight weeks use Full Body A/B/C (+ practice) titles. */
export const isFullBodyTemplateEquipment = (
  equipment: QuestionnaireData["equipment"]
) =>
  isDumbbellsOnlyEquipment(equipment) ||
  isBandsOnlyEquipment(equipment) ||
  isBodyweightOnlyEquipment(equipment);

/** Dumbbell/band Full Body A title (shared string). */
export const fullBodyADayTitle = DUMBBELL_THREE_DAY_TITLES[0];
export const fullBodyBDayTitle = DUMBBELL_THREE_DAY_TITLES[1];
export const fullBodyCDayTitle = DUMBBELL_THREE_DAY_TITLES[2];

export const bodyweightFullBodyADayTitle = BODYWEIGHT_THREE_DAY_TITLES[0];
export const bodyweightFullBodyBDayTitle = BODYWEIGHT_THREE_DAY_TITLES[1];
export const bodyweightFullBodyCDayTitle = BODYWEIGHT_THREE_DAY_TITLES[2];

const fullBodyTitleForMode = (
  equipment: QuestionnaireData["equipment"],
  day: "a" | "b" | "c"
) => {
  if (isBodyweightOnlyEquipment(equipment)) {
    if (day === "a") return bodyweightFullBodyADayTitle;
    if (day === "b") return bodyweightFullBodyBDayTitle;
    return bodyweightFullBodyCDayTitle;
  }
  if (day === "a") return fullBodyADayTitle;
  if (day === "b") return fullBodyBDayTitle;
  return fullBodyCDayTitle;
};

/** Push + horizontal-pull / trunk day: gym Back+Chest or Full Body A. */
export const pushPullDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment)
    ? fullBodyTitleForMode(equipment, "a")
    : "Back + Chest";

/** Hinge + overhead/shoulder day: gym Legs+Abs hinge lives on day 3; Full Body B otherwise. */
export const hingeDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment)
    ? fullBodyTitleForMode(equipment, "b")
    : "Legs + Abs";

/** Shoulder/overhead day for full-body templates; gym Shoulders + Arms otherwise. */
export const shoulderDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment)
    ? fullBodyTitleForMode(equipment, "b")
    : "Shoulders + Arms";

/** Lower-body accessory day: gym Legs + Abs or Full Body C. */
export const lowerAccessoryDayTitle = (equipment: QuestionnaireData["equipment"]) =>
  isFullBodyTemplateEquipment(equipment)
    ? fullBodyTitleForMode(equipment, "c")
    : "Legs + Abs";

export const findProgramDay = (program: Program, title: string) =>
  program.week.find((day) => day.title === title);

export const findProgramDayStartingWith = (program: Program, prefix: string) =>
  program.week.find((day) => day.title.startsWith(prefix));

export const expectedDumbbellMainCount = (
  dayTitle: string,
  experience: QuestionnaireData["experience"]
) => getDumbbellDayVolumeContract(dayTitle, experience)?.mainCount ?? null;

export const fullBodyDayTitles = (equipment?: QuestionnaireData["equipment"]) =>
  isBodyweightOnlyEquipment(equipment ?? ["dumbbells"])
    ? [...BODYWEIGHT_THREE_DAY_TITLES]
    : [...DUMBBELL_THREE_DAY_TITLES];

/** Full-body template weeks may reuse one exercise across distinct main slots when the contract allows it. */
export const shouldEnforceRoutineExerciseIdUniqueness = (
  equipment: QuestionnaireData["equipment"]
) => !isFullBodyTemplateEquipment(equipment);

export const routineExerciseIdsAreUnique = (routine: Array<{ exerciseId: string }>) => {
  const ids = routine.map((item) => item.exerciseId);
  return new Set(ids).size === ids.length;
};
