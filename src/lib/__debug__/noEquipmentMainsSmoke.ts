import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import { generateWeeklyProgram } from "@/lib/program";
import { auditWeeklyProgramSelection } from "@/lib/__debug__/programSelectionAudit";

const baseQuestionnaire: Omit<QuestionnaireData, "equipment"> = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  daysPerWeek: 3,
};

const countMainByDay = (questionnaire: QuestionnaireData) => {
  const program = generateWeeklyProgram(questionnaire, `smoke-${Date.now()}`);
  const capability = computeEquipmentCapability(questionnaire.equipment);
  return program.week.map((day) => ({
    title: day.title,
    mainCount: day.routine.filter((item) => item.section === "main").length,
    weightedMainCount: day.routine.filter(
      (item) => item.section === "main" && item.loadType === "weighted"
    ).length,
    resistedMainCount: day.routine.filter((item) => {
      if (item.section !== "main") return false;
      if (item.loadType === "weighted") return true;
      if (!capability.hasBand) return false;
      const exercise = exerciseById(item.exerciseId);
      return (
        exercise?.equipment.some((equipment) => {
          const token = String(equipment).toLowerCase();
          return token === "bands" || token === "band";
        }) ?? false
      );
    }).length,
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
    `- ${day.title}: main=${day.mainCount}, weightedMain=${day.weightedMainCount}, resistedMain=${day.resistedMainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
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
    `- ${day.title}: main=${day.mainCount}, weightedMain=${day.weightedMainCount}, resistedMain=${day.resistedMainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
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
    `- ${day.title}: main=${day.mainCount}, weightedMain=${day.weightedMainCount}, resistedMain=${day.resistedMainCount}, extraMainCount=${day.extraMainNames.length}, extra=${JSON.stringify(day.extraMainNames)}`
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

const shouldRunAudit =
  process.env.AUDIT_SELECTION === "1" ||
  process.env.AUDIT_SELECTION === "true";

if (shouldRunAudit) {
  const auditCases: Array<{ label: string; questionnaire: QuestionnaireData }> = [
    {
      label: "gym",
      questionnaire: { ...baseQuestionnaire, equipment: ["gym"] },
    },
    {
      label: "bands",
      questionnaire: { ...baseQuestionnaire, equipment: ["bands"] },
    },
  ];

  auditCases.forEach(({ label, questionnaire }) => {
    console.log(`[noEquipmentMainsSmoke:audit] equipment=[${label}]`);
    const audits = auditWeeklyProgramSelection(questionnaire);
    audits.forEach((audit) => {
      console.log(
        `- ${audit.dayTitle} | ${audit.slotKind} | chosen=${audit.chosen.name} (${audit.chosen.score})`
      );
      if (audit.chosen.reasons.length) {
        console.log(`  chosenReasons: ${audit.chosen.reasons.join(" ; ")}`);
      }
      audit.top.forEach((candidate, index) => {
        const reasons = candidate.reasons.length
          ? candidate.reasons.join(" ; ")
          : "--";
        console.log(
          `  [${index + 1}] ${candidate.name} (${candidate.score}) reasons=${reasons}`
        );
      });
    });
  });
}
