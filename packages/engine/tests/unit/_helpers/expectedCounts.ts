import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { getDumbbellDayVolumeContract, resolveDumbbellDayIdentity } from "@/lib/program/dumbbellTemplates";
import { getBandDayVolumeContract, resolveBandDayIdentity } from "@/lib/program/bandTemplates";
import {
  getBodyweightDayVolumeContract,
  resolveBodyweightDayIdentity,
} from "@/lib/program/bodyweightTemplates";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";

type ExpectedCountParams = {
  daysPerWeek: QuestionnaireData["daysPerWeek"];
  dayTitle: string;
  experience: QuestionnaireData["experience"];
  equipment?: QuestionnaireData["equipment"];
};

const legacyMainCountByExperience = (experience: QuestionnaireData["experience"]) => {
  if (experience === "Advanced") return 4;
  if (experience === "Intermediate") return 3;
  return 2;
};

const legacyAccessoryCountByExperience = (experience: QuestionnaireData["experience"]) => {
  if (experience === "Advanced") return 3;
  if (experience === "Intermediate") return 2;
  return 2;
};

export const expectedMainCountForDayTitle = ({
  daysPerWeek,
  dayTitle,
  experience,
  equipment = ["gym"],
}: ExpectedCountParams) => {
  const mode = resolvePrimaryProgramEquipmentMode(equipment);
  if (mode === "dumbbells") {
    const identity = resolveDumbbellDayIdentity(dayTitle);
    if (
      identity === "practice_restore" ||
      identity === "upper_pattern_practice" ||
      identity === "lower_core_practice"
    ) {
      return [2, 3];
    }
    const contract = getDumbbellDayVolumeContract(dayTitle, experience);
    if (contract) {
      return [Math.max(2, contract.mainCount - 1), contract.mainCount];
    }
  }
  if (mode === "bands") {
    const identity = resolveBandDayIdentity(dayTitle);
    if (
      identity === "practice_restore" ||
      identity === "upper_pattern_practice" ||
      identity === "lower_core_practice"
    ) {
      return [2, 3];
    }
    const contract = getBandDayVolumeContract(dayTitle, experience);
    if (contract) {
      return [Math.max(2, contract.mainCount - 1), contract.mainCount];
    }
  }
  if (mode === "bodyweight") {
    const identity = resolveBodyweightDayIdentity(dayTitle);
    if (
      identity === "practice_restore" ||
      identity === "upper_pattern_practice" ||
      identity === "lower_core_practice"
    ) {
      return [2, 3];
    }
    const contract = getBodyweightDayVolumeContract(dayTitle, experience);
    if (contract) {
      return [Math.max(2, contract.mainCount - 1), contract.mainCount];
    }
  }
  if (mode === "mixedHome") {
    // Same Full Body volume contract as dumbbells.
    const identity = resolveDumbbellDayIdentity(dayTitle);
    if (
      identity === "practice_restore" ||
      identity === "upper_pattern_practice" ||
      identity === "lower_core_practice"
    ) {
      return [2, 3];
    }
    const contract = getDumbbellDayVolumeContract(dayTitle, experience);
    if (contract) {
      return [Math.max(2, contract.mainCount - 1), contract.mainCount];
    }
  }

  if (daysPerWeek === 3) {
    if (dayTitle === "Back + Chest") {
      if (experience === "Advanced") return 5;
      if (experience === "Intermediate") return 4;
      return 3;
    }
    if (dayTitle === "Shoulders + Arms") {
      if (experience === "Advanced") return 4;
      if (experience === "Intermediate") return 4;
      return 3;
    }
    if (dayTitle === "Legs + Abs") {
      if (experience === "Advanced") return 4;
      if (experience === "Intermediate") return 4;
      return 3;
    }
  }

  if (daysPerWeek === 4) {
    if (experience === "Beginner") return 2;
    if (
      experience === "Advanced" &&
      (dayTitle === "Upper Push + Scapular Control" ||
        dayTitle === "Upper Pull + Thoracic Posture")
    ) {
      return 4;
    }
    return 3;
  }

  if (
    daysPerWeek === 5 &&
    experience === "Advanced" &&
    (dayTitle === "Lower Squat" || dayTitle === "Lower Hinge + Posterior Chain")
  ) {
    return 3;
  }

  return legacyMainCountByExperience(experience);
};

export const expectedAccessoryCountForDayTitle = ({
  daysPerWeek,
  dayTitle,
  experience,
  equipment = ["gym"],
}: ExpectedCountParams) => {
  const accessoryMode = resolvePrimaryProgramEquipmentMode(equipment);
  if (accessoryMode === "dumbbells") {
    const contract = getDumbbellDayVolumeContract(dayTitle, experience);
    if (contract) return contract.accessoryCount;
  }
  if (accessoryMode === "bands") {
    const contract = getBandDayVolumeContract(dayTitle, experience);
    if (contract) return contract.accessoryCount;
  }
  if (accessoryMode === "bodyweight") {
    const contract = getBodyweightDayVolumeContract(dayTitle, experience);
    if (contract) return contract.accessoryCount;
  }
  if (accessoryMode === "mixedHome") {
    const contract = getDumbbellDayVolumeContract(dayTitle, experience);
    if (contract) return contract.accessoryCount;
  }

  if (daysPerWeek === 3) {
    if (dayTitle === "Back + Chest") return 2;
    if (dayTitle === "Shoulders + Arms") {
      if (experience === "Advanced") return 4;
      if (experience === "Intermediate") return 3;
      return 3;
    }
    if (dayTitle === "Legs + Abs") {
      if (experience === "Advanced") return 3;
      return 2;
    }
  }

  return legacyAccessoryCountByExperience(experience);
};
