import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import {
  buildProgramContractSummary,
  CONTRACT_LANES,
  formatProgramContractSummary,
  type ContractFamilyBucket,
  type ContractLane,
  type ProgramContractDaySummary,
} from "@/lib/__debug__/programContractSummary";

type AccessoryContract = number | { min: number; max: number };

type DayIdentityContract = {
  title: string;
  mainCount: number;
  accessoryCount: AccessoryContract;
  lanes: Partial<Record<ContractLane, number>>;
  requiredFamilies: ContractFamilyBucket[][];
  allowedFamilies: ContractFamilyBucket[];
};

type IdentityScenario = {
  label: string;
  phaseIndex: 1 | 2 | 3;
  questionnaire: QuestionnaireData;
  days: DayIdentityContract[];
};

const expectedLaneCounts = (lanes: DayIdentityContract["lanes"]) =>
  CONTRACT_LANES.reduce<Record<ContractLane, number>>(
    (counts, lane) => ({
      ...counts,
      [lane]: lanes[lane] ?? 0,
    }),
    {
      push: 0,
      verticalPush: 0,
      pull: 0,
      squat: 0,
      hinge: 0,
    }
  );

const expectAccessoryCount = (
  actual: number,
  contract: AccessoryContract
) => {
  if (typeof contract === "number") {
    expect(actual).toBe(contract);
    return;
  }

  expect(actual).toBeGreaterThanOrEqual(contract.min);
  expect(actual).toBeLessThanOrEqual(contract.max);
};

const expectDayMatchesContract = (
  day: ProgramContractDaySummary,
  contract: DayIdentityContract
) => {
  expect(day.title).toBe(contract.title);
  expect(day.mainCount).toBe(contract.mainCount);
  expectAccessoryCount(day.accessoryCount, contract.accessoryCount);
  expect(day.lanes).toEqual(expectedLaneCounts(contract.lanes));
  expect(day.mainFamilies.every((family) => contract.allowedFamilies.includes(family))).toBe(true);

  contract.requiredFamilies.forEach((familyGroup) => {
    expect(day.mainFamilies.some((family) => familyGroup.includes(family))).toBe(true);
  });
};

const upperPainQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: ["shoulders", "neck"],
  experience: "Beginner",
  daysPerWeek: 3,
  equipment: ["none"],
};

const IDENTITY_SCENARIOS: IdentityScenario[] = [
  {
    label: "3d-bands-beginner",
    phaseIndex: 1,
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    },
    days: [
      {
        title: "Back + Chest",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { push: 1, pull: 2 },
        requiredFamilies: [["horizontal_press"], ["horizontal_row"], ["vertical_pull"]],
        allowedFamilies: ["horizontal_press", "horizontal_row", "vertical_pull", "scapular_pull"],
      },
      {
        title: "Shoulders + Arms",
        mainCount: 3,
        accessoryCount: 3,
        lanes: { verticalPush: 1, push: 1, pull: 1 },
        requiredFamilies: [
          ["vertical_press"],
          ["lateral_delt", "rear_delt", "upright_row", "shoulder_support", "scapular_pull"],
          ["rear_delt", "upright_row", "shoulder_support", "scapular_pull"],
        ],
        allowedFamilies: [
          "vertical_press",
          "lateral_delt",
          "rear_delt",
          "upright_row",
          "shoulder_support",
          "scapular_pull",
        ],
      },
      {
        title: "Legs + Abs",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { squat: 2, hinge: 1 },
        requiredFamilies: [["squat", "single_leg_squat"], ["hinge"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
    ],
  },
  {
    label: "3d-gym-advanced",
    phaseIndex: 3,
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym"],
    },
    days: [
      {
        title: "Back + Chest",
        mainCount: 5,
        accessoryCount: 2,
        lanes: { push: 2, pull: 3 },
        requiredFamilies: [["horizontal_press"], ["chest_fly"], ["horizontal_row"], ["vertical_pull"]],
        allowedFamilies: [
          "horizontal_press",
          "chest_fly",
          "horizontal_row",
          "vertical_pull",
          "scapular_pull",
        ],
      },
      {
        title: "Shoulders + Arms",
        mainCount: 4,
        accessoryCount: 4,
        lanes: { verticalPush: 1, push: 1, pull: 2 },
        requiredFamilies: [
          ["vertical_press"],
          ["lateral_delt", "rear_delt", "upright_row", "shoulder_support", "scapular_pull"],
          ["rear_delt", "upright_row", "shoulder_support", "scapular_pull"],
        ],
        allowedFamilies: [
          "vertical_press",
          "lateral_delt",
          "rear_delt",
          "upright_row",
          "shoulder_support",
          "scapular_pull",
        ],
      },
      {
        title: "Legs + Abs",
        mainCount: 4,
        accessoryCount: 3,
        lanes: { squat: 2, hinge: 2 },
        requiredFamilies: [["squat", "single_leg_squat"], ["hinge"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
    ],
  },
  {
    label: "3d-none-upper-pain",
    phaseIndex: 1,
    questionnaire: upperPainQuestionnaire,
    days: [
      {
        title: "Back + Chest",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { push: 1, pull: 2 },
        requiredFamilies: [
          ["horizontal_press"],
          ["horizontal_row", "scapular_pull"],
          ["vertical_pull"],
        ],
        allowedFamilies: [
          "horizontal_press",
          "horizontal_row",
          "vertical_pull",
          "scapular_pull",
        ],
      },
      {
        title: "Shoulders + Arms",
        mainCount: 3,
        accessoryCount: 3,
        lanes: { verticalPush: 1, push: 1, pull: 1 },
        requiredFamilies: [
          ["vertical_press"],
          ["lateral_delt", "shoulder_support"],
          ["rear_delt", "shoulder_support", "scapular_pull"],
        ],
        allowedFamilies: [
          "vertical_press",
          "lateral_delt",
          "rear_delt",
          "shoulder_support",
          "scapular_pull",
        ],
      },
      {
        title: "Legs + Abs",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { squat: 2, hinge: 1 },
        requiredFamilies: [["squat", "single_leg_squat"], ["hinge"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
    ],
  },
  {
    label: "4d-gym-intermediate-upper-pain",
    phaseIndex: 2,
    questionnaire: {
      goals: "Improve posture",
      painAreas: ["shoulders", "neck"],
      experience: "Intermediate",
      daysPerWeek: 4,
      equipment: ["gym"],
    },
    days: [
      {
        title: "Upper Push + Scapular Control",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { push: 2, verticalPush: 1 },
        requiredFamilies: [["horizontal_press"]],
        allowedFamilies: ["horizontal_press", "chest_fly", "vertical_press"],
      },
      {
        title: "Lower (Squat Emphasis) + Core",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { squat: 2, hinge: 1 },
        requiredFamilies: [["squat", "single_leg_squat"], ["hinge"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
      {
        title: "Upper Pull + Thoracic Posture",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { pull: 3 },
        requiredFamilies: [["horizontal_row", "vertical_pull", "scapular_pull"]],
        allowedFamilies: ["horizontal_row", "vertical_pull", "rear_delt", "scapular_pull"],
      },
      {
        title: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
        mainCount: 3,
        accessoryCount: 2,
        lanes: { squat: 1, hinge: 2 },
        requiredFamilies: [["hinge"], ["squat", "single_leg_squat"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
    ],
  },
  {
    label: "5d-gym-advanced-pain",
    phaseIndex: 3,
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["low_back", "neck"],
      experience: "Advanced",
      daysPerWeek: 5,
      equipment: ["gym"],
    },
    days: [
      {
        title: "Upper Push",
        mainCount: 4,
        accessoryCount: { min: 2, max: 3 },
        lanes: { push: 2, verticalPush: 2 },
        requiredFamilies: [["horizontal_press"], ["vertical_press"]],
        allowedFamilies: ["horizontal_press", "chest_fly", "vertical_press"],
      },
      {
        title: "Lower Squat",
        mainCount: 3,
        accessoryCount: 3,
        lanes: { squat: 2, hinge: 1 },
        requiredFamilies: [["squat", "single_leg_squat"], ["hinge"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
      {
        title: "Upper Pull",
        mainCount: 4,
        accessoryCount: { min: 2, max: 3 },
        lanes: { pull: 4 },
        requiredFamilies: [["horizontal_row", "vertical_pull", "scapular_pull"]],
        allowedFamilies: ["horizontal_row", "vertical_pull", "rear_delt", "scapular_pull"],
      },
      {
        title: "Lower Hinge + Posterior Chain",
        mainCount: 3,
        accessoryCount: 3,
        lanes: { squat: 1, hinge: 2 },
        requiredFamilies: [["hinge"], ["squat", "single_leg_squat"]],
        allowedFamilies: ["squat", "single_leg_squat", "hinge"],
      },
      {
        title: "Arms + Posture + Conditioning",
        mainCount: 4,
        accessoryCount: { min: 2, max: 3 },
        lanes: { pull: 2, verticalPush: 2 },
        requiredFamilies: [["horizontal_row", "vertical_pull", "scapular_pull"], ["vertical_press"]],
        allowedFamilies: [
          "horizontal_row",
          "vertical_pull",
          "rear_delt",
          "shoulder_support",
          "scapular_pull",
          "vertical_press",
        ],
      },
    ],
  },
];

describe("program identity anchors", () => {
  test.each(IDENTITY_SCENARIOS)("$label preserves title, count, lane, and family contract", (scenario) => {
    const program = generateWeeklyProgram(
      scenario.questionnaire,
      `identity-anchor-${scenario.label}`,
      {
        phaseIndex: scenario.phaseIndex,
        seed: `identity-${scenario.label}`,
      }
    );
    const summary = buildProgramContractSummary(program, {
      label: scenario.label,
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      experience: scenario.questionnaire.experience,
      equipment: scenario.questionnaire.equipment,
      painAreas: scenario.questionnaire.painAreas,
    });

    expect(summary.days.map((day) => day.title)).toEqual(
      scenario.days.map((day) => day.title)
    );
    expect(summary.days).toHaveLength(scenario.days.length);

    try {
      summary.days.forEach((day, index) => {
        const contract = scenario.days[index];
        expect(contract).toBeDefined();
        if (!contract) return;
        expectDayMatchesContract(day, contract);
      });
    } catch (error) {
      throw new Error(`${formatProgramContractSummary(summary)}\n\n${String(error)}`);
    }
  });
});
