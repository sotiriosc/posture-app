import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
} from "@/lib/program";
// Probe eligibility internals via a tiny harness in this file after generation.

const q: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  daysPerWeek: 3,
  equipment: ["gym"],
  trainingIntent: "build",
};

clearProgramVariationHistory();
const blocked = {
  "machine-leg-press": {
    reason: "no_equipment" as const,
    blockedAt: { phase: "skill" as const, sessionCount: 6 },
  },
};

const prog = generateWeeklyProgram(q, "prog-gym-blocked", {
  blockedExerciseIds: blocked,
  seed: "deterministic-seed-gym",
  skipQualityGate: true,
});
const ids = prog.week.flatMap((d) => d.routine.map((i) => i.exerciseId));
console.log("has leg press", ids.includes("machine-leg-press"));
console.log("ids", ids.join(","));
const ev = evaluateProgramQuality({
  program: prog,
  questionnaire: q,
  persona: "debug",
});
console.log(
  JSON.stringify(
    {
      passed: ev.passed,
      hard: ev.hardFailures.map((f) => ({
        code: f.code,
        msg: f.internalMessage,
        ex: f.exerciseId,
        day: f.dayIndex,
        slot: f.slot,
      })),
      warn: ev.warnings.slice(0, 10).map((f) => f.code),
    },
    null,
    2
  )
);

clearProgramVariationHistory();
const unblocked = generateWeeklyProgram(q, "prog-gym-reset", {
  blockedExerciseIds: {},
  seed: "deterministic-seed-gym",
  skipQualityGate: true,
});
const uIds = unblocked.week.flatMap((d) => d.routine.map((i) => i.exerciseId));
const uEv = evaluateProgramQuality({
  program: unblocked,
  questionnaire: q,
  persona: "unblocked",
});
console.log(
  "unblocked",
  JSON.stringify({
    passed: uEv.passed,
    hasLegPress: uIds.includes("machine-leg-press"),
    lowerDay: unblocked.week[2]?.routine.map((i) => `${i.section}:${i.exerciseId}`),
    hard: uEv.hardFailures.map((f) => f.code + ":" + f.internalMessage),
  })
);

console.log(
  "blocked lower",
  prog.week[2]?.routine.map((i) => `${i.section}:${i.exerciseId}`)
);

// Also try recovery seeds with blocks preserved
for (const attempt of [1, 2] as const) {
  clearProgramVariationHistory();
  const recovered = generateWeeklyProgram(q, `prog-gym-blocked-r${attempt}`, {
    blockedExerciseIds: blocked,
    seed: `deterministic-seed-gym:quality-recovery:${attempt}`,
    skipQualityGate: true,
  });
  const rIds = recovered.week.flatMap((d) => d.routine.map((i) => i.exerciseId));
  const rEv = evaluateProgramQuality({
    program: recovered,
    questionnaire: q,
    persona: `recovery-${attempt}`,
  });
  console.log(
    `recovery-${attempt}`,
    JSON.stringify({
      passed: rEv.passed,
      hasLegPress: rIds.includes("machine-leg-press"),
      hard: rEv.hardFailures.map((f) => f.code + ":" + (f.internalMessage ?? "")),
    })
  );
}
