import { describe, expect, it } from "vitest";
import {
  buildProgramFocusAreas,
  buildProgramDashboardCopy,
  buildProgramMovementPatternItems,
} from "@/components/results/programDashboardSelectors";
import type { Program } from "@/lib/types";
import type { AssessmentReport } from "@/lib/assessmentEngine";

const minimalProgram = {
  id: "p1",
  week: [
    {
      dayIndex: 0,
      title: "Day 1",
      focusTags: ["balance_and_asymmetry_control", "balance"],
      routine: [],
    },
  ],
  phaseObjective: {
    primaryPatterns: ["breathing_and_ribcage_control", "squat_pattern_control"],
    phaseFocus: "balance_and_asymmetry_control",
    weekIntent: "Balance and asymmetry control",
    coachingPrompts: ["Stack ribs over pelvis"],
    successMarkers: ["Own the pattern"],
  },
  movementProfile: { priorities: ["balance"] },
} as unknown as Program;

describe("programDashboardSelectors (Phase 6i Commit 1)", () => {
  it("lists movement tags without a Plan focus: prefix", () => {
    const items = buildProgramMovementPatternItems({ program: minimalProgram });
    expect(items.every((item) => !item.startsWith("Plan focus:"))).toBe(true);
    expect(items).toContain("Balance and Asymmetry Control");
  });

  it("drops truncated tags covered by a longer sibling", () => {
    const { focusAreas } = buildProgramDashboardCopy({
      program: minimalProgram,
      assessmentReport: null,
      painTrendLabel: "Stable",
    });
    expect(focusAreas).toContain("Balance and Asymmetry Control");
    expect(focusAreas).not.toContain("Balance");
  });

  it("keeps connector words lower-case in generated display tags", () => {
    const program = {
      ...minimalProgram,
      phaseObjective: {
        ...minimalProgram.phaseObjective,
        primaryPatterns: ["week_4_of_8", "balance_and_asymmetry_control"],
      },
      movementProfile: {
        ...minimalProgram.movementProfile,
        priorities: ["RPE_control"],
      },
    } as unknown as Program;

    expect(buildProgramFocusAreas(program, 4)).toEqual(
      expect.arrayContaining([
        "Week 4 of 8",
        "Balance and Asymmetry Control",
        "RPE Control",
      ])
    );
  });

  it("strips Pattern suggests / Goal suggests glue from stability items", () => {
    const report = {
      observations: [
        {
          title: "Trunk alignment bias",
          description:
            "Pattern suggests torso alignment drift, which can reduce efficient force transfer.",
        },
        {
          title: "Posture control focus",
          description: "Goal suggests improving posture; we’ll build endurance.",
        },
      ],
    } as unknown as AssessmentReport;

    const { stabilityPatternItems } = buildProgramDashboardCopy({
      program: minimalProgram,
      assessmentReport: report,
      painTrendLabel: "Stable",
    });

    expect(
      stabilityPatternItems.every(
        (item) =>
          !/Pattern suggests/i.test(item) && !/Goal suggests/i.test(item)
      )
    ).toBe(true);
    expect(stabilityPatternItems[0]).toContain("Trunk alignment bias");
    expect(stabilityPatternItems[0]).toMatch(/torso alignment drift/i);
  });
});
