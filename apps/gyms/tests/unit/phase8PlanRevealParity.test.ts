/**
 * Phase 8 — gyms presentation label parity with shared engine helpers.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  buildPlanRevealModel,
  resolveProgramPresentation,
} from "@/lib/program/presentation";

const root = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

beforeEach(() => {
  clearProgramVariationHistory();
});

describe("Phase 8 gyms plan reveal parity", () => {
  it("matches consumer semantic labels for Gym / Bodyweight / Mixed Home", () => {
    const cases: Array<{ equipment: string[]; identity: RegExp }> = [
      { equipment: ["gym"], identity: /gym/i },
      { equipment: ["none"], identity: /bodyweight/i },
      { equipment: ["dumbbells", "bands"], identity: /mixed/i },
    ];
    for (const c of cases) {
      const questionnaire: QuestionnaireData = {
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: c.equipment,
      };
      const program = generateWeeklyProgram(
        questionnaire,
        `p8-gyms-parity-${c.equipment.join("-")}`,
        { seed: `p8-gyms-parity-${c.equipment.join("-")}` }
      );
      const presentation = resolveProgramPresentation({ program, questionnaire });
      const reveal = buildPlanRevealModel(presentation);
      expect(reveal.equipmentIdentity).toMatch(c.identity);
      expect(reveal.phaseLabel).toBe(presentation.program.phaseLabel);
      expect(reveal.frequencyLabel).toBe(presentation.program.frequencyLabel);
      expect(reveal.primaryCtaLabel).toBe("Start Day 1");
      expect(reveal.secondaryCtaLabel).toBe("See why Praxis chose this");
    }
  });

  it("ResultsRoutine mirrors PlanRevealExperience first-reveal mount", () => {
    const src = read("src/components/ResultsRoutine.tsx");
    expect(src).toContain("PlanRevealExperience");
    expect(src).toContain("dashboardLevel === 1");
  });

  it("settings intentionally omit Interface sectionVisibility UI", () => {
    const account = read("src/app/account/settings/page.tsx");
    expect(account).not.toContain("settings-interface-section");
    expect(account).not.toContain("sectionVisibility");
  });
});
