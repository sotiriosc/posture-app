import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
} from "@/lib/program";

const q2: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  daysPerWeek: 3,
  equipment: ["dumbbells", "bands", "gym", "barbell", "cables"],
};
clearProgramVariationHistory();
const prog = generateWeeklyProgram(q2, "prog-block-filter", {
  blockedExerciseIds: {
    "db-rdl": {
      reason: "personal_preference",
      blockedAt: { phase: "skill", sessionCount: 5 },
    },
  },
  skipQualityGate: true,
});
const legs = prog.week.find((d) => /leg/i.test(d.title));
console.log(
  "mains",
  legs?.routine.filter((i) => i.section === "main").map((i) => i.exerciseId)
);
const ev = evaluateProgramQuality({
  program: prog,
  questionnaire: q2,
  persona: "x",
});
console.log(
  JSON.stringify(
    {
      passed: ev.passed,
      hard: ev.hardFailures.map((f) => ({
        code: f.code,
        msg: f.internalMessage,
        ex: f.exerciseId,
        slot: f.slot,
      })),
      hasBand: prog.week.some((d) =>
        d.routine.some((i) => i.exerciseId === "band-rdl")
      ),
    },
    null,
    2
  )
);
