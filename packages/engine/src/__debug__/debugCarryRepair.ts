import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
  clearProgramConstraintWarningBuffer,
} from "@/lib/program";

clearProgramVariationHistory();
clearProgramConstraintWarningBuffer();
const program = generateWeeklyProgram(
  {
    goals: "Improve posture",
    painAreas: [],
    experience: "Beginner",
    daysPerWeek: 4,
    equipment: ["gym"],
  },
  "debug-carry-act",
  {
    phaseIndex: 1,
    seed: "phase-matrix-normal beginner-4-gym-activation",
    skipQualityGate: true,
  }
);
const warnings = getProgramConstraintWarningBuffer().filter(
  (w) => w.programId === program.id
);
console.log(
  JSON.stringify(
    {
      titles: program.week.map((d) => d.title),
      accessories: program.week.map((d) =>
        d.routine
          .filter((i) => i.section === "accessory")
          .map((i) => ({
            id: i.exerciseId,
            source: i.selectionDebug?.source,
            lane: i.selectionDebug?.slotLane,
          }))
      ),
      carryWarnings: warnings.filter((w) => /carry/i.test(w.message) || /Carry/.test(w.kind)),
      allCoverageWarnings: warnings.filter((w) => w.kind === "coverage").slice(0, 20),
      legalityWarnings: warnings
        .filter((w) => /legality|replaced/i.test(w.message))
        .map((w) => w.message)
        .slice(0, 40),
      allMessages: warnings.map((w) => w.message).slice(0, 60),
    },
    null,
    2
  )
);
