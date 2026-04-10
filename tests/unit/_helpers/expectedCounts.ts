import type { QuestionnaireData } from "@/components/QuestionnaireForm";

type ExpectedCountParams = {
  daysPerWeek: QuestionnaireData["daysPerWeek"];
  dayTitle: string;
  experience: QuestionnaireData["experience"];
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
}: ExpectedCountParams) => {
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

  return legacyMainCountByExperience(experience);
};

export const expectedAccessoryCountForDayTitle = ({
  daysPerWeek,
  dayTitle,
  experience,
}: ExpectedCountParams) => {
  if (daysPerWeek === 3) {
    if (dayTitle === "Back + Chest") return 2;
    if (dayTitle === "Shoulders + Arms") {
      if (experience === "Advanced") return 5;
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
