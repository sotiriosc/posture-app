import type {
  V3DaySlot,
  V3MovementFamily,
  V3ScheduleBlock,
  V3ScheduleDay,
  V3SlotRole,
} from "@/lib/engine_v3/types";
import { rotateArray, stableHashUint32 } from "@/lib/engine_v3/utils";

type V3TemplateId = "A" | "B" | "C";

type SlotBlueprint = {
  label: string;
  role: V3SlotRole;
  family: V3MovementFamily;
};

const BASE_LATIN_SQUARE: V3TemplateId[][] = [
  ["A", "B", "C"],
  ["B", "C", "A"],
  ["C", "A", "B"],
];

const TEMPLATE_TITLES: Record<V3TemplateId, string> = {
  A: "Template A: Push + Squat",
  B: "Template B: Pull + Hinge",
  C: "Template C: Mixed Upper + Core",
};

const buildTemplateSlots = (params: {
  templateId: V3TemplateId;
  occurrenceIndex: number;
  seed: string;
}): SlotBlueprint[] => {
  if (params.templateId === "A") {
    return [
      { label: "Prep horiz push", role: "prep", family: "horiz_push" },
      { label: "Main horiz push", role: "main", family: "horiz_push" },
      { label: "Accessory horiz pull", role: "accessory", family: "horiz_pull" },
      { label: "Main squat", role: "main", family: "squat" },
      { label: "Accessory hinge", role: "accessory", family: "hinge" },
      { label: "Core anti extension", role: "core", family: "anti_ext" },
      { label: "Finisher core", role: "finisher", family: "core" },
    ];
  }

  if (params.templateId === "B") {
    return [
      { label: "Prep vert pull", role: "prep", family: "vert_pull" },
      { label: "Main vert pull", role: "main", family: "vert_pull" },
      { label: "Accessory vert push", role: "accessory", family: "vert_push" },
      { label: "Main hinge", role: "main", family: "hinge" },
      { label: "Accessory squat", role: "accessory", family: "squat" },
      { label: "Core anti rotation", role: "core", family: "anti_rot" },
      { label: "Finisher core", role: "finisher", family: "core" },
    ];
  }

  const cSeed = stableHashUint32(`${params.seed}:template-c`);
  const variantIndex = (params.occurrenceIndex + cSeed) % 2;
  if (variantIndex === 0) {
    return [
      { label: "Prep horiz pull", role: "prep", family: "horiz_pull" },
      { label: "Main horiz pull", role: "main", family: "horiz_pull" },
      { label: "Accessory vert push", role: "accessory", family: "vert_push" },
      { label: "Main squat", role: "main", family: "squat" },
      { label: "Accessory hinge", role: "accessory", family: "hinge" },
      { label: "Core integrated trunk", role: "core", family: "core" },
      { label: "Finisher anti rotation", role: "finisher", family: "anti_rot" },
    ];
  }

  return [
    { label: "Prep vert push", role: "prep", family: "vert_push" },
    { label: "Main vert push", role: "main", family: "vert_push" },
    { label: "Accessory horiz pull", role: "accessory", family: "horiz_pull" },
    { label: "Main hinge", role: "main", family: "hinge" },
    { label: "Accessory squat", role: "accessory", family: "squat" },
    { label: "Core integrated trunk", role: "core", family: "core" },
    { label: "Finisher anti extension", role: "finisher", family: "anti_ext" },
  ];
};

const buildDaySlots = (params: {
  templateId: V3TemplateId;
  weekIndex: number;
  dayIndex: number;
  occurrenceIndex: number;
  seed: string;
}): V3DaySlot[] =>
  buildTemplateSlots({
    templateId: params.templateId,
    occurrenceIndex: params.occurrenceIndex,
    seed: params.seed,
  }).map((slot, order) => ({
    id: `w${params.weekIndex + 1}d${params.dayIndex + 1}-${params.templateId.toLowerCase()}-${order + 1}`,
    label: slot.label,
    role: slot.role,
    family: slot.family,
    templateId: params.templateId,
    order,
    required: true,
  }));

export const buildThreeDayThreeWeekRotation = (params: {
  seed: string;
  daysPerWeek?: number;
  weeks?: number;
}): V3ScheduleBlock => {
  const daysPerWeek = params.daysPerWeek ?? 3;
  const weeks = params.weeks ?? 3;
  if (daysPerWeek !== 3 || weeks !== 3) {
    throw new Error(
      `[engine_v3] Only the 3-day / 3-week prototype schedule is implemented right now (received ${daysPerWeek} days x ${weeks} weeks).`
    );
  }

  const templateOffset = stableHashUint32(`${params.seed}:latin-square`) % 3;
  const templateOrder = rotateArray<V3TemplateId>(["A", "B", "C"], templateOffset);
  const templateRemap = new Map<V3TemplateId, V3TemplateId>([
    ["A", templateOrder[0]],
    ["B", templateOrder[1]],
    ["C", templateOrder[2]],
  ]);

  const occurrences = new Map<V3TemplateId, number>();
  const days: V3ScheduleDay[] = [];

  BASE_LATIN_SQUARE.forEach((weekTemplates, weekIndex) => {
    weekTemplates.forEach((baseTemplateId, dayIndex) => {
      const templateId = templateRemap.get(baseTemplateId) ?? baseTemplateId;
      const occurrenceIndex = occurrences.get(templateId) ?? 0;
      occurrences.set(templateId, occurrenceIndex + 1);
      const sessionIndex = weekIndex * daysPerWeek + dayIndex;

      days.push({
        id: `week-${weekIndex + 1}-day-${dayIndex + 1}`,
        weekIndex,
        dayIndex,
        sessionIndex,
        templateId,
        title: TEMPLATE_TITLES[templateId],
        slots: buildDaySlots({
          templateId,
          weekIndex,
          dayIndex,
          occurrenceIndex,
          seed: params.seed,
        }),
      });
    });
  });

  return {
    seed: params.seed,
    daysPerWeek,
    weeks,
    days,
  };
};
