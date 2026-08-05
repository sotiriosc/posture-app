import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";

// Re-run generation with verbose console by monkeypatching is hard.
// Instead, dump whether goblet appears when we unblock everything except machines.

const base: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  daysPerWeek: 3,
  equipment: ["gym"],
  trainingIntent: "build",
};

const cases = [
  {
    name: "block-leg-press",
    blocked: {
      "machine-leg-press": {
        reason: "no_equipment" as const,
        blockedAt: { phase: "skill" as const, sessionCount: 6 },
      },
    },
  },
  {
    name: "block-leg-press-and-hack",
    blocked: {
      "machine-leg-press": {
        reason: "no_equipment" as const,
        blockedAt: { phase: "skill" as const, sessionCount: 6 },
      },
      "machine-hack-squat": {
        reason: "no_equipment" as const,
        blockedAt: { phase: "skill" as const, sessionCount: 6 },
      },
    },
  },
  {
    name: "block-goblet",
    blocked: {
      "goblet-squat": {
        reason: "personal_preference" as const,
        blockedAt: { phase: "skill" as const, sessionCount: 6 },
      },
    },
  },
];

for (const c of cases) {
  clearProgramVariationHistory();
  const prog = generateWeeklyProgram(base, c.name, {
    blockedExerciseIds: c.blocked,
    seed: "deterministic-seed-gym",
    skipQualityGate: true,
  });
  const legs = prog.week.find((d) => /leg/i.test(d.title));
  const mains = (legs?.routine ?? [])
    .filter((i) => i.section === "main")
    .map((i) => i.exerciseId);
  console.log(
    c.name,
    mains,
    "gobletMeta",
    (() => {
      const g = exerciseById("goblet-squat");
      return g
        ? { loadedMainEligible: g.loadedMainEligible, load: g.loadType, eq: g.equipment }
        : null;
    })()
  );
}
