import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const baseQuestionnaire: Omit<QuestionnaireData, "equipment"> = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  daysPerWeek: 3,
};

const countMainByDay = (questionnaire: QuestionnaireData) => {
  const program = generateWeeklyProgram(questionnaire, `smoke-${Date.now()}`);
  return program.week.map((day) => ({
    title: day.title,
    mainCount: day.routine.filter((item) => item.section === "main").length,
    mains: day.routine
      .filter((item) => item.section === "main")
      .map((item) => {
        const exercise = exerciseById(item.exerciseId);
        return {
          name: exercise?.name ?? item.exerciseId,
          movementPattern: exercise?.movementPattern ?? [],
          notes: item.notes ?? null,
        };
      }),
    extraMainNames: day.routine
      .filter(
        (item) =>
          item.section === "main" &&
          (item.notes ?? "").toLowerCase().includes("3 sec eccentric")
      )
      .map((item) => exerciseById(item.exerciseId)?.name ?? item.exerciseId),
  }));
};

const noneCounts = countMainByDay({
  ...baseQuestionnaire,
  equipment: ["none"],
});
const gymCounts = countMainByDay({
  ...baseQuestionnaire,
  equipment: ["gym"],
});
const bandCounts = countMainByDay({
  ...baseQuestionnaire,
  equipment: ["bands"],
});

console.log("[noEquipmentMainsSmoke] equipment=[none]");
noneCounts.forEach((day) => {
  console.log(
    `- ${day.title}: main=${day.mainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
  );
  day.mains.forEach((main) => {
    console.log(
      `  * ${main.name} | patterns=${JSON.stringify(main.movementPattern)} | notes=${main.notes ?? "--"}`
    );
  });
});

console.log("[noEquipmentMainsSmoke] equipment=[bands]");
bandCounts.forEach((day) => {
  console.log(
    `- ${day.title}: main=${day.mainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
  );
  day.mains.forEach((main) => {
    console.log(
      `  * ${main.name} | patterns=${JSON.stringify(main.movementPattern)} | notes=${main.notes ?? "--"}`
    );
  });
});

console.log("[noEquipmentMainsSmoke] equipment=[gym]");
gymCounts.forEach((day) => {
  console.log(
    `- ${day.title}: main=${day.mainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
  );
  day.mains.forEach((main) => {
    console.log(
      `  * ${main.name} | patterns=${JSON.stringify(main.movementPattern)} | notes=${main.notes ?? "--"}`
    );
  });
});

console.log("[noEquipmentMainsSmoke] delta (none - gym)");
noneCounts.forEach((day, index) => {
  const gymMain = gymCounts[index]?.mainCount ?? 0;
  console.log(`- ${day.title}: delta=${day.mainCount - gymMain}`);
});
