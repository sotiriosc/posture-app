import type { ExerciseDefinition } from "../../domain/exercise";
import type { JointStressTag } from "../../domain/primitives";
import type { ExerciseStressFact, ExerciseStressSource } from "./types";

const SOURCE_ORDER: readonly ExerciseStressSource[] = [
  "joint_stress",
  "caution",
  "contraindicated",
];

export function buildExerciseStressProfile(
  exercise: ExerciseDefinition,
): readonly ExerciseStressFact[] {
  const sourcesByTag = new Map<JointStressTag, Set<ExerciseStressSource>>();
  const add = (tags: readonly JointStressTag[], source: ExerciseStressSource): void => {
    for (const tag of tags) {
      const sources = sourcesByTag.get(tag) ?? new Set<ExerciseStressSource>();
      sources.add(source);
      sourcesByTag.set(tag, sources);
    }
  };

  add(exercise.loading.jointStressTags, "joint_stress");
  add(exercise.cautionStressTags, "caution");
  add(exercise.contraindicatedStressTags, "contraindicated");

  return [...sourcesByTag.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tag, sources]) => ({
      tag,
      sources: SOURCE_ORDER.filter((source) => sources.has(source)),
    }));
}
