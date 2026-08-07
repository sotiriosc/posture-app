import { describe, expect, test } from "vitest";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import {
  buildLegacyQuestionnaireSignature,
  isQuestionnaireSignatureCompatible,
  isStoredProgramTemplateCompatible,
} from "@/lib/programStorageCompat";

const sample = {
  goals: "Improve posture",
  painAreas: ["Shoulders"],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3 as const,
};

describe("programStorageCompat", () => {
  test("accepts stored template versions at or below current (v13/v18/v19)", () => {
    expect(isStoredProgramTemplateCompatible(undefined)).toBe(true);
    expect(isStoredProgramTemplateCompatible(13)).toBe(true);
    expect(isStoredProgramTemplateCompatible(18)).toBe(true);
    expect(isStoredProgramTemplateCompatible(19)).toBe(true);
    expect(isStoredProgramTemplateCompatible(20)).toBe(false);
  });

  test("legacy pre-bandSetup signatures remain compatible on open/resume", () => {
    const legacy = buildLegacyQuestionnaireSignature(sample);
    const current = buildQuestionnaireSignature(sample);
    expect(legacy).not.toBe(current);
    expect(isQuestionnaireSignatureCompatible(legacy, sample)).toBe(true);
    expect(isQuestionnaireSignatureCompatible(current, sample)).toBe(true);
    expect(isQuestionnaireSignatureCompatible(null, sample)).toBe(true);
  });

  test("confirmed bandSetup changes signature and is not legacy-compatible", () => {
    const withBands = {
      ...sample,
      equipment: ["bands"],
      bandSetup: "long_with_anchor" as const,
    };
    const legacy = buildLegacyQuestionnaireSignature(withBands);
    const current = buildQuestionnaireSignature(withBands);
    expect(isQuestionnaireSignatureCompatible(legacy, withBands)).toBe(true);
    expect(isQuestionnaireSignatureCompatible(current, sample)).toBe(false);
  });
});
