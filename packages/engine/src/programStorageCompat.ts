/**
 * Live-main continuity helpers for the v19 engine transplant.
 *
 * Existing stored programs (templateVersion &lt; 19, pre-bandSetup signatures)
 * must remain usable on Results open / Session resume / refresh. Replacement
 * with a freshly generated v19 program is reserved for explicit user-driven
 * regeneration (questionnaire confirm, rebuild), not silent mid-cycle rewrite.
 */

import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";

/** Keep in sync with PROGRAM_TEMPLATE_VERSION in program.ts (avoid circular import). */
const CURRENT_TEMPLATE_VERSION_CEILING = 19;

type QuestionnaireSignatureInput = {
  goals?: string;
  painAreas?: string[];
  experience?: string;
  equipment?: string[];
  daysPerWeek?: unknown;
  bandSetup?: unknown;
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

/** Pre-v19 signature shape (no bandSetup key). */
export const buildLegacyQuestionnaireSignature = (
  input: QuestionnaireSignatureInput
) => {
  const normalized = {
    goals: input.goals ?? "Improve posture",
    painAreas: [...(input.painAreas ?? [])]
      .map((item) => item.trim())
      .filter(Boolean)
      .sort(),
    experience: input.experience ?? "Beginner",
    equipment: [
      ...new Set(normalizeEquipmentSelectionValues(input.equipment ?? ["none"])),
    ].sort(),
    daysPerWeek: normalizeDaysPerWeek(input.daysPerWeek),
  };
  return JSON.stringify(normalized);
};

export const isQuestionnaireSignatureCompatible = (
  persisted: string | null | undefined,
  input: QuestionnaireSignatureInput
) => {
  if (!persisted) return true;
  if (persisted === buildQuestionnaireSignature(input)) return true;
  if (persisted === buildLegacyQuestionnaireSignature(input)) return true;
  return false;
};

/**
 * Stored programs at or below the current template version remain loadable.
 * Future/unknown newer versions are rejected.
 */
export const isStoredProgramTemplateCompatible = (
  templateVersion: number | null | undefined
) => {
  if (typeof templateVersion !== "number" || !Number.isFinite(templateVersion)) {
    return true;
  }
  return templateVersion <= CURRENT_TEMPLATE_VERSION_CEILING;
};
