/**
 * Phase 7B §10 — Capability notes re-derive after questionnaire+program reload.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { resolveProgramPresentation } from "@/lib/program/presentation";
import type { Program } from "@/lib/types";

beforeEach(() => {
  clearProgramVariationHistory();
});

describe("Phase 7B capability note reload continuity", () => {
  it("re-derives identical capability note texts after questionnaire+program reload", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "long_no_anchor",
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "p7b-capability-reload",
      { seed: "p7b-capability-reload" }
    );

    const first = resolveProgramPresentation({ program, questionnaire });
    expect(first.program.capabilityNotes.length).toBeGreaterThan(0);
    const firstTexts = first.program.capabilityNotes.map((n) => n.text);

    // Simulate storage: serialize/reload questionnaire + program (no ephemeral gate object).
    const reloadedQuestionnaire = JSON.parse(
      JSON.stringify(questionnaire)
    ) as QuestionnaireData;
    const reloadedProgram = JSON.parse(JSON.stringify(program)) as Program;

    const second = resolveProgramPresentation({
      program: reloadedProgram,
      questionnaire: reloadedQuestionnaire,
    });
    const secondTexts = second.program.capabilityNotes.map((n) => n.text);

    expect(secondTexts).toEqual(firstTexts);
    for (const text of secondTexts) {
      expect(text).not.toMatch(/QUALITY_|hardFailure|reasonCode/i);
    }
  });
});
