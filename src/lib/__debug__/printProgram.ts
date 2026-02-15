import { generateWeeklyProgram } from "@/lib/program";

const questionnaire = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 4,
} satisfies Parameters<typeof generateWeeklyProgram>[0];

const seed = "determinism-test-seed";
const program = generateWeeklyProgram(questionnaire, "debug-program", {
  seed,
});

const summary = {
  programId: program.id,
  daysPerWeek: program.daysPerWeek,
  seed,
  days: program.week.map((day) => ({
    title: day.title,
    warmup: day.routine
      .filter((item) => item.section === "warmup")
      .map((item) => item.exerciseId),
    activation: day.routine
      .filter((item) => item.section === "activation")
      .map((item) => item.exerciseId),
    main: day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId),
    accessory: day.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId),
    cooldown: day.routine
      .filter((item) => item.section === "cooldown")
      .map((item) => item.exerciseId),
  })),
};

console.log(JSON.stringify(summary, null, 2));
