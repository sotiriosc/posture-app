import type { Exercise } from "@/lib/exercises";

export const EQUIPMENT_ENUM = [
  "none",
  "bands",
  "dumbbells",
  "barbell",
  "kettlebell",
  "cables",
  "machines",
  "bench",
  "pullup_bar",
  "foam_roller",
] as const;

export type Equipment = (typeof EQUIPMENT_ENUM)[number];
export type EquipmentSelection = Equipment | "gym";

const selectionMap: Record<string, EquipmentSelection> = {
  none: "none",
  "no equipment": "none",
  bands: "bands",
  "resistance band": "bands",
  "resistance bands": "bands",
  dumbbells: "dumbbells",
  dumbbell: "dumbbells",
  "foam roller": "foam_roller",
  "foam_roller": "foam_roller",
  barbell: "barbell",
  kettlebell: "kettlebell",
  cables: "cables",
  machines: "machines",
  bench: "bench",
  "pullup bar": "pullup_bar",
  "pullup_bar": "pullup_bar",
  gym: "gym",
};

export const normalizeEquipmentSelectionValues = (
  selection: string[]
): EquipmentSelection[] => {
  const next: EquipmentSelection[] = [];
  selection.forEach((value) => {
    const mapped = selectionMap[value.trim().toLowerCase()];
    if (mapped && !next.includes(mapped)) {
      next.push(mapped);
    }
  });
  if (next.length === 0) return ["none"];
  if (next.includes("none") && next.length > 1) {
    return next.filter((item) => item !== "none");
  }
  return next;
};

export const normalizeEquipmentSelection = (selection: string[]) => {
  const normalized = new Set<Equipment>();
  const normalizedValues = normalizeEquipmentSelectionValues(selection);
  const hasGym = normalizedValues.includes("gym");

  normalizedValues.forEach((value) => {
    if (value !== "gym") {
      normalized.add(value);
    }
  });

  if (hasGym) {
    ["dumbbells", "barbell", "cables", "machines", "bench"].forEach((item) =>
      normalized.add(item as Equipment)
    );
  }

  if (normalized.size === 0) {
    normalized.add("none");
  }

  return { available: normalized, hasGym };
};

export const isExerciseEligible = (
  exercise: Exercise,
  available: Set<Equipment>
) => {
  if (exercise.equipment.includes("none")) return true;
  return exercise.equipment.every((item) => available.has(item));
};

export const describeEquipmentMatch = (
  exercise: Exercise,
  available: Set<Equipment>
) => {
  const required = exercise.equipment;
  const eligible = isExerciseEligible(exercise, available);
  return { required, available: Array.from(available), eligible };
};
