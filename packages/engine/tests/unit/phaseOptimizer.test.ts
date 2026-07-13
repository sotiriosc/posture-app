import { describe, expect, test } from "vitest";
import { optimizePhaseWeek } from "@/lib/phaseOptimizer";
import { generateWeeklyProgram } from "@/lib/program";
import { normalizeEquipmentSelection } from "@/lib/equipment";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const baseData: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: ["Upper back"],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("phase optimizer", () => {
  test("changes meaningful portion of slots for next cycle", () => {
    const previous = generateWeeklyProgram(baseData, "prev", {
      phaseIndex: 1,
      cycleIndex: 1,
      weekIndex: 1,
    });
    const proposed = generateWeeklyProgram(baseData, "next", {
      phaseIndex: 1,
      cycleIndex: 2,
      weekIndex: 2,
    });
    const equipment = normalizeEquipmentSelection(baseData.equipment);

    const result = optimizePhaseWeek({
      proposedWeek: proposed.week,
      previousWeek: previous.week,
      questionnaire: baseData,
      availableEquipment: equipment.available,
      phaseIndex: 1,
      cycleIndex: 2,
    });

    expect(result.totalSlots).toBeGreaterThan(0);
    expect(result.changedSlots).toBeGreaterThanOrEqual(4);
    expect(result.summary.toLowerCase()).toContain("changed");
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(Object.keys(result.exerciseReasons).length).toBeGreaterThan(0);
  });
});
