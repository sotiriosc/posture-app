/**
 * Phase 8 — plan reveal view-model helpers (React-free).
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { QuestionnaireData } from "../../src/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  PROGRAM_TEMPLATE_VERSION,
} from "../../src/program";
import {
  PHASE8_CRITICAL_CONTROL_LABELS,
  buildPlanRevealModel,
  containsForbiddenInternalUiLanguage,
  resolveProgramPresentation,
} from "../../src/program/presentation";
import { SECTION_REGISTRY } from "../../src/ui/sectionVisibility";

beforeEach(() => {
  clearProgramVariationHistory();
});

const MODE_CASES: Array<{
  name: string;
  equipment: string[];
  bandSetup?: QuestionnaireData["bandSetup"];
  expectedIdentity: RegExp;
}> = [
  { name: "Gym", equipment: ["gym"], expectedIdentity: /gym/i },
  { name: "Dumbbells", equipment: ["dumbbells"], expectedIdentity: /dumbbell/i },
  {
    name: "Anchored bands",
    equipment: ["bands"],
    bandSetup: "long_with_anchor",
    expectedIdentity: /band/i,
  },
  {
    name: "No-anchor bands",
    equipment: ["bands"],
    bandSetup: "long_no_anchor",
    expectedIdentity: /band/i,
  },
  {
    name: "Loop-only bands",
    equipment: ["bands"],
    bandSetup: "loop_only",
    expectedIdentity: /band/i,
  },
  { name: "Bodyweight", equipment: ["none"], expectedIdentity: /bodyweight/i },
  {
    name: "Mixed Home",
    equipment: ["dumbbells", "bands"],
    expectedIdentity: /mixed/i,
  },
];

const baseQ = (
  partial: Partial<QuestionnaireData> & { equipment: string[] }
): QuestionnaireData => ({
  goals: "Improve posture",
  painAreas: ["Shoulders"],
  experience: "Beginner",
  daysPerWeek: 3,
  ...partial,
});

describe("Phase 8 buildPlanRevealModel", () => {
  it("keeps PROGRAM_TEMPLATE_VERSION at 18", () => {
    expect(PROGRAM_TEMPLATE_VERSION).toBe(18);
  });

  it.each(MODE_CASES)(
    "first-viewport fields for $name",
    ({ equipment, bandSetup, expectedIdentity }) => {
      const questionnaire = baseQ({ equipment, bandSetup });
      const program = generateWeeklyProgram(questionnaire, `p8-${equipment.join("-")}`, {
        seed: `p8-${equipment.join("-")}`,
      });
      const presentation = resolveProgramPresentation({ program, questionnaire });
      const reveal = buildPlanRevealModel(presentation);

      expect(reveal.phaseLabel).toMatch(/phase/i);
      expect(reveal.phasePurpose.length).toBeGreaterThan(8);
      expect(reveal.frequencyLabel).toMatch(/days/i);
      expect(reveal.expectedDuration).toMatch(/about \d+ minutes/i);
      expect(reveal.equipmentIdentity).toMatch(expectedIdentity);
      expect(reveal.primaryCtaLabel).toBe("Start Day 1");
      expect(reveal.secondaryCtaLabel).toBe("See why Praxis chose this");
      expect(reveal.days.length).toBeGreaterThanOrEqual(3);
      expect(reveal.influencePoints.length).toBeGreaterThan(0);
      expect(reveal.influencePoints.length).toBeLessThanOrEqual(3);
      expect(reveal.progressionPreview.headline).toMatch(/what comes next/i);
      expect(reveal.templateVersion).toBe(18);

      const texts = [
        reveal.phasePurpose,
        ...reveal.influencePoints.map((p) => p.detail),
        reveal.progressionPreview.summary,
        ...reveal.progressionPreview.conditions,
      ];
      for (const text of texts) {
        expect(containsForbiddenInternalUiLanguage(text)).toBe(false);
      }
    }
  );

  it("marks critical controls as never hideable via SECTION_REGISTRY", () => {
    const registryBlob = JSON.stringify(SECTION_REGISTRY).toLowerCase();
    for (const label of PHASE8_CRITICAL_CONTROL_LABELS) {
      expect(registryBlob).not.toContain(label.toLowerCase());
    }
    const ids = SECTION_REGISTRY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("supports 3/4/5 day pathway lengths", () => {
    for (const daysPerWeek of [3, 4, 5] as const) {
      const questionnaire = baseQ({ equipment: ["gym"], daysPerWeek });
      const program = generateWeeklyProgram(questionnaire, `p8-days-${daysPerWeek}`, {
        seed: `p8-days-${daysPerWeek}`,
      });
      const reveal = buildPlanRevealModel(
        resolveProgramPresentation({ program, questionnaire })
      );
      expect(reveal.days.length).toBe(program.week.length);
      expect(reveal.frequencyLabel).toContain(String(daysPerWeek));
    }
  });
});
