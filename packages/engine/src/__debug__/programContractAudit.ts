import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import {
  buildProgramContractSummary,
  formatProgramContractSummary,
} from "@/lib/__debug__/programContractSummary";

type AuditScenario = {
  label: string;
  phaseIndex: 1 | 2 | 3;
  questionnaire: QuestionnaireData;
};

const scenarios: AuditScenario[] = [
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
  },
  {
    label: "3d-none-upper-pain",
    phaseIndex: 1,
    questionnaire: {
      goals: "Improve posture",
      painAreas: ["shoulders", "neck"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["none"],
    },
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
  },
];

const summaries = scenarios.map((scenario) => {
  const program = generateWeeklyProgram(
    scenario.questionnaire,
    `contract-audit-${scenario.label}`,
    {
      phaseIndex: scenario.phaseIndex,
      seed: `identity-${scenario.label}`,
    }
  );

  return formatProgramContractSummary(
    buildProgramContractSummary(program, {
      label: scenario.label,
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      experience: scenario.questionnaire.experience,
      equipment: scenario.questionnaire.equipment,
      painAreas: scenario.questionnaire.painAreas,
    })
  );
});

console.log(summaries.join("\n\n"));
