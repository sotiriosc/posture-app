import { exercises, type Exercise } from "@/lib/exercises";
import type {
  V3ExperienceLevel,
  V3MovementFamily,
  V3PrototypeExercise,
  V3SlotRole,
  V3SupportProfile,
} from "@/lib/engine_v3/types";
import { normalizeExperienceLevel, normalizeToken, clamp } from "@/lib/engine_v3/utils";

const CORE_FAMILIES = new Set<V3MovementFamily>(["anti_ext", "anti_rot", "core"]);

const collectExerciseTokens = (exercise: Exercise) => {
  const tokenSet = new Set<string>();
  const addToken = (value?: string | null) => {
    const normalized = normalizeToken(value ?? "");
    if (!normalized) return;
    tokenSet.add(normalized);
    normalized.split("_").forEach((part) => {
      if (part) tokenSet.add(part);
    });
  };

  addToken(exercise.id);
  addToken(exercise.name);
  addToken(exercise.pattern);
  addToken(exercise.familyKey);
  addToken(exercise.variantKey);
  addToken(exercise.loadType);
  exercise.equipment.forEach(addToken);
  exercise.movementPattern.forEach(addToken);
  exercise.muscleGroups.forEach(addToken);
  exercise.tags.forEach(addToken);

  return tokenSet;
};

const hasAnyToken = (tokens: Set<string>, values: string[]) =>
  values.some((value) => tokens.has(normalizeToken(value)));

const inferFamilies = (exercise: Exercise): V3MovementFamily[] => {
  const tokens = collectExerciseTokens(exercise);
  const families = new Set<V3MovementFamily>();

  if (
    hasAnyToken(tokens, [
      "horizontalpush",
      "horizontal_push",
      "bench_press",
      "chest_press",
      "pushup",
      "floor_press",
      "fly",
    ])
  ) {
    families.add("horiz_push");
  }

  if (
    hasAnyToken(tokens, [
      "verticalpush",
      "vertical_push",
      "overhead",
      "shoulder_press",
      "arnold_press",
      "pike",
      "landmine_press",
    ])
  ) {
    families.add("vert_push");
  }

  if (
    hasAnyToken(tokens, [
      "horizontalpull",
      "horizontal_pull",
      "row",
      "face_pull",
      "rear_delt_row",
      "reverse_pec_deck",
    ])
  ) {
    families.add("horiz_pull");
  }

  if (
    hasAnyToken(tokens, [
      "verticalpull",
      "vertical_pull",
      "pulldown",
      "pullup",
      "chinup",
      "lat",
      "pullover",
    ])
  ) {
    families.add("vert_pull");
  }

  if (
    hasAnyToken(tokens, [
      "squat",
      "kneedominant",
      "knee_dominant",
      "split_squat",
      "lunge",
      "step_up",
      "cossack",
      "single_leg",
    ])
  ) {
    families.add("squat");
  }

  if (
    hasAnyToken(tokens, [
      "hinge",
      "deadlift",
      "romanian",
      "good_morning",
      "hip_hinge",
      "bridge",
      "hip_thrust",
      "posterior",
      "hamstring",
    ])
  ) {
    families.add("hinge");
  }

  if (
    hasAnyToken(tokens, [
      "anti_extension",
      "antiextension",
      "dead_bug",
      "deadbug",
      "plank",
      "hollow",
      "rollout",
      "body_saw",
    ])
  ) {
    families.add("anti_ext");
    families.add("core");
  }

  if (
    hasAnyToken(tokens, [
      "anti_rotation",
      "antirotation",
      "pallof",
      "woodchop",
      "carry",
      "suitcase",
      "march",
    ])
  ) {
    families.add("anti_rot");
    families.add("core");
  }

  if (
    exercise.pattern === "core_stability" ||
    hasAnyToken(tokens, ["core", "tva", "trunk", "breath"])
  ) {
    families.add("core");
  }

  return Array.from(families);
};

const resolveSupportProfile = (exercise: Exercise): V3SupportProfile => {
  const tokens = collectExerciseTokens(exercise);

  if (exercise.equipment.includes("machines")) return "machine";
  if (exercise.equipment.includes("cables")) return "cable";
  if (
    exercise.loadType === "assisted" ||
    hasAnyToken(tokens, [
      "supported",
      "support",
      "seated",
      "chest_supported",
      "floor_press",
      "pad",
      "guided",
    ])
  ) {
    return "supported";
  }
  if (
    exercise.loadType === "bodyweight" &&
    exercise.equipment.every((item) => item === "none" || item === "bands" || item === "bench")
  ) {
    return "bodyweight";
  }
  return "free";
};

const resolveExperienceMin = (exercise: Exercise): V3ExperienceLevel =>
  normalizeExperienceLevel(exercise.experienceMin ?? "Beginner");

const resolveBaseDifficulty = (exercise: Exercise) => {
  if (typeof exercise.difficulty === "number") return exercise.difficulty;
  if (exercise.difficultyTier === "hard") return 4;
  if (exercise.difficultyTier === "moderate") return 3;
  return 2;
};

const resolveComplexity = (
  exercise: Exercise,
  supportProfile: V3SupportProfile,
  experienceMin: V3ExperienceLevel
) => {
  let complexity = resolveBaseDifficulty(exercise);
  if (supportProfile === "machine") complexity -= 1;
  if (supportProfile === "cable" || supportProfile === "supported") complexity -= 0.5;
  if (supportProfile === "bodyweight") complexity -= 0.25;
  if (experienceMin === "intermediate") complexity += 0.5;
  if (experienceMin === "advanced") complexity += 1;

  const tokens = collectExerciseTokens(exercise);
  if (hasAnyToken(tokens, ["single_leg", "unilateral", "pendlay", "unsupported", "hinge"])) {
    complexity += 0.25;
  }

  return Number(clamp(complexity, 1, 5).toFixed(2));
};

const resolveRoles = (params: {
  exercise: Exercise;
  families: V3MovementFamily[];
  supportProfile: V3SupportProfile;
  complexity: number;
}): V3SlotRole[] => {
  const roles = new Set<V3SlotRole>();
  const hasCoreFamily = params.families.some((family) => CORE_FAMILIES.has(family));

  if (params.exercise.category === "warmup" || params.exercise.category === "activation") {
    roles.add("prep");
  }

  if (params.exercise.category === "cooldown" && hasCoreFamily) {
    roles.add("prep");
  }

  if (params.exercise.category === "main") {
    if (hasCoreFamily) {
      roles.add("core");
      roles.add("finisher");
      roles.add("accessory");
    } else {
      roles.add("main");
      roles.add("accessory");
    }

    const prepCompatible =
      params.complexity <= 2.5 ||
      (params.supportProfile !== "free" &&
        (params.exercise.loadType === "bodyweight" || params.exercise.loadType === "assisted"));
    if (prepCompatible) {
      roles.add("prep");
    }
  }

  return Array.from(roles);
};

const resolveVariantKey = (exercise: Exercise) =>
  exercise.variantKey ??
  `${exercise.loadType}:${exercise.equipment.slice().sort().join("_") || "none"}`;

const resolveFamilyKey = (exercise: Exercise) => exercise.familyKey ?? exercise.id;

export const adaptExerciseToV3 = (exercise: Exercise): V3PrototypeExercise | null => {
  const families = inferFamilies(exercise);
  if (!families.length) return null;

  const supportProfile = resolveSupportProfile(exercise);
  const experienceMin = resolveExperienceMin(exercise);
  const complexity = resolveComplexity(exercise, supportProfile, experienceMin);
  const roles = resolveRoles({
    exercise,
    families,
    supportProfile,
    complexity,
  });
  if (!roles.length) return null;

  return {
    id: exercise.id,
    name: exercise.name,
    sourceExerciseId: exercise.id,
    category: exercise.category,
    pattern: exercise.pattern,
    familyKey: resolveFamilyKey(exercise),
    variantKey: resolveVariantKey(exercise),
    families,
    primaryFamily: families[0],
    roles,
    supportProfile,
    complexity,
    experienceMin,
    equipment: exercise.equipment,
    loadType: exercise.loadType,
    tags: exercise.tags,
    rawExercise: exercise,
  };
};

export const adaptExercisesToV3Catalog = (
  sourceExercises: Exercise[] = exercises
): V3PrototypeExercise[] =>
  sourceExercises
    .map(adaptExerciseToV3)
    .filter((exercise): exercise is V3PrototypeExercise => Boolean(exercise));
