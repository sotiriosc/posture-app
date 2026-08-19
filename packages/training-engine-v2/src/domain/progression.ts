export const PROGRESSION_AXES = [
  "load",
  "reps",
  "sets",
  "range",
  "tempo",
  "support_reduction",
  "stability",
  "coordination",
  "complexity",
  "duration",
  "distance",
  "trips",
  "steps",
  "lever",
  "effort",
  "rest_reduction",
  "breath_cycles",
] as const;

export type ProgressionAxis = (typeof PROGRESSION_AXES)[number];

export function isProgressionAxis(value: unknown): value is ProgressionAxis {
  return (
    typeof value === "string" &&
    PROGRESSION_AXES.includes(value as ProgressionAxis)
  );
}
