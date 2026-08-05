/**
 * Phase 7B — Presentation contract inventory + resolver parity.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  PROGRAM_TEMPLATE_VERSION,
} from "@/lib/program";
import {
  FEEDBACK_CONTRACT_ACTION_LABELS,
  containsForbiddenInternalUiLanguage,
  getProgramPresentationInventory,
  resolveProgramPresentation,
  validateProgramPresentationInventory,
  validateResolvedPresentationModel,
} from "@/lib/program/presentation";

const MODE_CASES: Array<{ id: string; questionnaire: QuestionnaireData }> = [
  {
    id: "gym",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    },
  },
  {
    id: "dumbbells",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    },
  },
  {
    id: "bands-anchored",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "long_with_anchor",
    },
  },
  {
    id: "bands-no-anchor",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "long_no_anchor",
    },
  },
  {
    id: "bands-loop-only",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
      bandSetup: "loop_only",
    },
  },
  {
    id: "bodyweight",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["none"],
    },
  },
  {
    id: "mixedHome",
    questionnaire: {
      goals: "Improve posture",
      painAreas: ["Shoulders", "Lower back"],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["bands", "dumbbells"],
      bandSetup: "long_with_anchor",
    },
  },
];

beforeEach(() => {
  clearProgramVariationHistory();
});

describe("Phase 7B presentation contract inventory", () => {
  it("covers required surfaces with zero uncategorized / receiver gaps", () => {
    const inventory = getProgramPresentationInventory();
    expect(inventory.length).toBeGreaterThanOrEqual(30);

    const ids = new Set(inventory.map((r) => r.id));
    expect(ids.has("program.primaryEquipmentMode")).toBe(true);
    expect(ids.has("session.purpose")).toBe(true);
    expect(ids.has("adaptation.sessionDiscomfort")).toBe(true);
    expect(ids.has("exercise.coachingGuidance")).toBe(true);

    const validation = validateProgramPresentationInventory(inventory);
    expect(validation.passed).toBe(true);
    expect(validation.countsByStatus.unused ?? 0).toBe(0);
    expect(validation.outputsWithoutReceivers).toBe(0);
    expect(validation.relationshipsWithoutGivers).toBe(0);
    expect(validation.rawInternalLanguageLeaks).toBe(0);
  });

  it("uses plain-language feedback-contract labels", () => {
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label).toBe("Skip for now");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.test.label).toBe("Keep and retest");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label).toBe("Make it easier");
    for (const label of Object.values(FEEDBACK_CONTRACT_ACTION_LABELS)) {
      expect(containsForbiddenInternalUiLanguage(label.label)).toBe(false);
      expect(label.label.toLowerCase()).not.toBe(label.action);
    }
  });
});

describe("Phase 7B presentation resolver equipment-mode parity", () => {
  it.each(MODE_CASES)(
    "resolves clean presentation for $id without internal language",
    ({ id, questionnaire }) => {
      const program = generateWeeklyProgram(
        questionnaire,
        `p7b-presentation-${id}`,
        { seed: `p7b-presentation-${id}` }
      );
      expect(program.templateVersion ?? PROGRAM_TEMPLATE_VERSION).toBe(18);

      const model = resolveProgramPresentation({
        program,
        questionnaire,
        assessmentFocusTags:
          id === "mixedHome" ? ["scapular control", "hip hinge"] : [],
        assessmentFocusHighConfidence: id === "mixedHome",
      });

      expect(model.program.equipmentIdentity.trim().length).toBeGreaterThan(0);
      expect(model.sessions.length).toBe(program.week.length);
      expect(model.program.frequencyLabel).toMatch(/days?\s*\/\s*week/i);
      expect(model.program.phaseLabel.toLowerCase()).toContain("phase");

      for (const session of model.sessions) {
        expect(session.purpose.trim().length).toBeGreaterThan(0);
        expect(session.expectedDuration).toMatch(/about \d+ minutes/i);
        expect(session.equipmentNeeded.length).toBeGreaterThan(0);
      }

      const findings = validateResolvedPresentationModel(model);
      expect(findings).toEqual([]);
    }
  );
});
