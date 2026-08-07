import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { auditCoverageContract } from "@/lib/__debug__/coverageContractAudit";

clearProgramVariationHistory();
const questionnaire = {
  goals: "Reduce pain",
  painAreas: ["low_back", "neck"],
  experience: "Advanced",
  daysPerWeek: 5 as const,
  equipment: ["gym"],
};
const program = generateWeeklyProgram(
  questionnaire,
  "repro-gym-5d-pain-baselines",
  {
    phaseIndex: 3,
    seed: "phase-matrix-pain advanced-5-gym-growth",
    skipQualityGate: true,
  }
);
const audit = auditCoverageContract({
  profile: "pain advanced",
  phase: "growth",
  daysPerWeek: 5,
  equipment: ["gym"],
  questionnaire,
  program,
});
console.log(
  JSON.stringify(
    {
      ok: audit.ok,
      weeklyFailures: audit.weeklyFailures,
      dayFailures: audit.dayFailures,
      intelligenceFailures: audit.intelligenceFailures,
      days: program.week.map((d) => ({
        title: d.title,
        mains: d.routine
          .filter((i) => i.section === "main")
          .map((i) => i.exerciseId),
        accessories: d.routine
          .filter((i) => i.section === "accessory")
          .map((i) => i.exerciseId),
      })),
    },
    null,
    2
  )
);
