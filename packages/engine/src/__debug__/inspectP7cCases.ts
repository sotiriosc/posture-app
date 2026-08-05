import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  summarizeWeekCoverage,
} from "@/lib/program";
import { exerciseById } from "@/lib/exercises";

const cases = [
  {
    name: "normal beg 4d gym act",
    q: {
      goals: "Improve posture" as const,
      painAreas: [] as string[],
      experience: "Beginner" as const,
      daysPerWeek: 4 as const,
      equipment: ["gym"],
    },
    phase: 1,
    seed: "phase-matrix-normal beginner-4-gym-activation",
  },
  {
    name: "normal beg 4d gym skill",
    q: {
      goals: "Improve posture" as const,
      painAreas: [] as string[],
      experience: "Beginner" as const,
      daysPerWeek: 4 as const,
      equipment: ["gym"],
    },
    phase: 2,
    seed: "phase-matrix-normal beginner-4-gym-skill",
  },
  {
    name: "pain beg 4d none act",
    q: {
      goals: "Reduce pain" as const,
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner" as const,
      daysPerWeek: 4 as const,
      equipment: ["none"],
    },
    phase: 1,
    seed: "phase-matrix-pain beginner-4-none-activation",
  },
];

for (const c of cases) {
  clearProgramVariationHistory();
  const p = generateWeeklyProgram(c.q, c.name, {
    phaseIndex: c.phase,
    seed: c.seed,
    skipQualityGate: true,
  });
  const w = summarizeWeekCoverage(p.week);
  const carryItems = p.week.flatMap((d) =>
    d.routine
      .filter((i) => {
        const ex = exerciseById(i.exerciseId);
        return (
          Boolean(ex) &&
          (ex!.tags.includes("carry") || /carry|suitcase/i.test(ex!.name))
        );
      })
      .map((i) => `${d.title}:${i.exerciseId}`)
  );
  console.log(
    JSON.stringify(
      {
        name: c.name,
        carryDays: w.carryDays,
        bicepsDays: w.bicepsDays,
        tricepsDays: w.tricepsDays,
        pushDays: w.pushDays,
        pullDays: w.pullDays,
        carryItems,
        accessories: p.week.map(
          (d) =>
            `${d.title}=${d.routine
              .filter((i) => i.section === "accessory")
              .map((i) => i.exerciseId)
              .join(",")}`
        ),
      },
      null,
      2
    )
  );
}
