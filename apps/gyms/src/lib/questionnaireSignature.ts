import { normalizeEquipmentSelectionValues } from "@/lib/equipment";

type QuestionnaireSignatureInput = {
  goals?: string;
  painAreas?: string[];
  experience?: string;
  equipment?: string[];
  daysPerWeek?: unknown;
};

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

export const buildQuestionnaireSignature = (
  input: QuestionnaireSignatureInput
) => {
  const normalized = {
    goals: input.goals ?? "Improve posture",
    painAreas: [...(input.painAreas ?? [])].map((item) => item.trim()).filter(Boolean).sort(),
    experience: input.experience ?? "Beginner",
    equipment: [...new Set(normalizeEquipmentSelectionValues(input.equipment ?? ["none"]))].sort(),
    daysPerWeek: normalizeDaysPerWeek(input.daysPerWeek),
  };
  return JSON.stringify(normalized);
};
