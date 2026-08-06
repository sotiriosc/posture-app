/**
 * Phase 8 — consumer presentation labels + wiring parity checks.
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

describe("Phase 8 consumer plan reveal parity", () => {
  it("presentation labels match reveal model for Gym / Bodyweight / Mixed Home", () => {
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
        `p8-parity-${c.equipment.join("-")}`,
        { seed: `p8-parity-${c.equipment.join("-")}` }
      );
      const presentation = resolveProgramPresentation({ program, questionnaire });
      const reveal = buildPlanRevealModel(presentation);
      expect(reveal.equipmentIdentity).toBe(presentation.program.equipmentIdentity);
      expect(reveal.phaseLabel).toBe(presentation.program.phaseLabel);
      expect(reveal.phasePurpose).toBeTruthy();
      expect(reveal.equipmentIdentity).toMatch(c.identity);
      expect(reveal.primaryCtaLabel).toBe("Start Day 1");
    }
  });

  it("ResultsRoutine mounts PlanRevealExperience for first reveal", () => {
    const src = read("src/components/ResultsRoutine.tsx");
    expect(src).toContain("PlanRevealExperience");
    expect(src).toContain("dashboardLevel === 1");
    expect(src).toContain("DashboardHero");
  });

  it("session start summary and begin action are wired", () => {
    const header = read("src/components/session/SessionProgressHeader.tsx");
    const summary = read("src/components/session/SessionStartSummary.tsx");
    const client = read("src/app/session/SessionClient.tsx");
    expect(header).toContain("SessionStartSummary");
    expect(summary).toContain("Begin session");
    expect(summary).toContain("session-begin-action");
    expect(client).toContain("onBeginSession");
    expect(client).toContain("sessionCapabilityNote");
  });

  it("plan reveal components avoid a second presentation truth source", () => {
    const hero = read("src/components/plan-reveal/PlanRevealExperience.tsx");
    expect(hero).toContain("buildPlanRevealModel");
    expect(hero).not.toContain("generateWeeklyProgram");
    expect(hero).not.toContain("equipmentIdentity:");
  });
});
