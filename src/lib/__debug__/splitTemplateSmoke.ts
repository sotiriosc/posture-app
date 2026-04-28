import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  clearProgramConstraintWarningBuffer,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
  previewSplitTemplates,
} from "@/lib/program";

const BASE: Omit<QuestionnaireData, "daysPerWeek" | "equipment"> = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
};

const EQUIPMENT_CASES: QuestionnaireData["equipment"][] = [
  ["none"],
  ["bands"],
  ["gym"],
];
const DAY_CASES: Array<QuestionnaireData["daysPerWeek"]> = [3, 4, 5];

const resolveCapabilityMode = (
  equipment: QuestionnaireData["equipment"]
): "noneOnly" | "bandOnly" | "hasLoad" => {
  const capability = computeEquipmentCapability(equipment);
  if (capability.hasLoad) return "hasLoad";
  if (capability.hasBand) return "bandOnly";
  return "noneOnly";
};

EQUIPMENT_CASES.forEach((equipment) => {
  const capabilityMode = resolveCapabilityMode(equipment);
  console.log(
    `[splitTemplateSmoke] equipment=[${equipment.join(",")}] capabilityMode=${capabilityMode}`
  );
  DAY_CASES.forEach((daysPerWeek) => {
    const questionnaire: QuestionnaireData = {
      ...BASE,
      daysPerWeek,
      equipment,
    };
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      questionnaire,
      `split-template-smoke-${equipment.join("-")}-${daysPerWeek}`,
      { seed: "split-template-smoke-seed" }
    );
    const warnings = getProgramConstraintWarningBuffer();
    const templatePreview = previewSplitTemplates(daysPerWeek, capabilityMode);

    console.log(`- daysPerWeek=${daysPerWeek} warnings=${warnings.length}`);
    templatePreview.forEach((templateDay, index) => {
      const mainCount =
        program.week[index]?.routine.filter((item) => item.section === "main").length ?? 0;
      console.log(
        `  * ${templateDay.title} | lanes=${JSON.stringify(templateDay.lanes)} | focusTags=${JSON.stringify(
          templateDay.focusTags
        )} | mainCount=${mainCount}`
      );
    });
    warnings.slice(0, 5).forEach((warning) => {
      console.log(`    ! [${warning.kind}] ${warning.dayTitle}: ${warning.message}`);
    });
  });
});
