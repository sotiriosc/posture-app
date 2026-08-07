/**
 * Phase 7B — Input continuity: questionnaire / photo / feedback → presentation → prefs shape.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program } from "@/lib/types";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  PROGRAM_TEMPLATE_VERSION,
} from "@/lib/program";
import {
  FEEDBACK_CONTRACT_ACTION_LABELS,
  resolveAssessmentFocusSummary,
  resolveFeedbackContractActionLabel,
  resolveProgramPresentation,
} from "@/lib/program/presentation";

beforeEach(() => {
  clearProgramVariationHistory();
});

const baseQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: ["Shoulders"],
  experience: "Beginner",
  daysPerWeek: 3,
  equipment: ["dumbbells"],
};

describe("Phase 7B input continuity", () => {
  it("omits low-confidence photo focus and includes high-confidence focus", () => {
    const low = resolveAssessmentFocusSummary({
      focusTags: ["forward head"],
      highConfidence: false,
    });
    expect(low).toBeNull();

    const high = resolveAssessmentFocusSummary({
      focusTags: ["scapular control", "thoracic mobility"],
      highConfidence: true,
    });
    expect(high).toBeTruthy();
    expect(high!.text.toLowerCase()).toContain("scapular control");
    expect(high!.reason).toBe("assessmentFocus");
  });

  it("includes questionnaire pain adaptation summary on resolved program presentation", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire,
      "p7b-continuity-pain",
      { seed: "p7b-continuity-pain" }
    );
    const model = resolveProgramPresentation({
      program,
      questionnaire: baseQuestionnaire,
    });
    expect(
      model.program.adaptationSummary.some((m) => m.reason === "reportedPain")
    ).toBe(true);
    expect(model.sessions.every((s) => s.painAdaptation?.reason === "reportedPain")).toBe(
      true
    );
  });

  it("maps feedback-contract actions to future-adaptation plain labels", () => {
    const sacrifice = resolveFeedbackContractActionLabel("sacrifice");
    const test = resolveFeedbackContractActionLabel("test");
    const modify = resolveFeedbackContractActionLabel("modify");
    expect(sacrifice.label).toBe(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label);
    expect(test.label).toBe(FEEDBACK_CONTRACT_ACTION_LABELS.test.label);
    expect(modify.label).toBe(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label);
    // Internal enums stay stable for persistence / engine paths.
    expect(sacrifice.action).toBe("sacrifice");
    expect(test.action).toBe("test");
    expect(modify.action).toBe("modify");
  });

  it("end-to-end: input → generate → resolver presentation (persistence covered in round-trip suite)", () => {
    const questionnaire: QuestionnaireData = {
      ...baseQuestionnaire,
      painAreas: ["Lower back", "Knees"],
      equipment: ["bands", "dumbbells"],
      bandSetup: "long_with_anchor",
    };
    const program: Program = generateWeeklyProgram(
      questionnaire,
      "p7b-continuity-e2e",
      { seed: "p7b-continuity-e2e" }
    );
    expect(program.templateVersion ?? PROGRAM_TEMPLATE_VERSION).toBe(19);
    expect(program.week.length).toBeGreaterThan(0);

    const model = resolveProgramPresentation({
      program,
      questionnaire,
      assessmentFocusTags: ["hip hinge"],
      assessmentFocusHighConfidence: true,
    });
    expect(model.program.equipmentIdentityMode).toBe("mixedHome");
    expect(model.program.adaptationSummary.length).toBeGreaterThanOrEqual(2);
    expect(model.sessions[0]?.purpose).toBeTruthy();
    // Presentation layer never exposes the raw action as the UI label.
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label).toBe("Skip for now");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.test.label).toBe("Try again");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label).toBe("Make it easier");
  });
});
