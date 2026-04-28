// This script is for manual review of 3-day program quality and should not alter generator behavior.

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import {
  buildThreeDayCoachAuditHints,
  canUseUprightRowForThreeDayShoulder,
  getThreeDayCooldownPreferenceIds,
  isBackChestPosteriorSupportFamily,
  isBackChestTruthfulChestIsolation,
  isBackExtensionHingeFamily,
  isUprightRowFamilyExercise,
  resolveBackChestAccessoryCoachFamily,
  resolveCoreCoachFamily,
  resolveLowerUnilateralCoachFamily,
} from "@/lib/program/threeDayCoachPolicy";
import type { Equipment } from "@/lib/equipment";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

type Persona = {
  name: string;
  questionnaire: QuestionnaireData;
};

type ChecklistItem = {
  label: string;
  status: "PASS" | "REVIEW" | "INFO";
  detail: string;
};

const personas: Persona[] = [
  {
    name: "Beginner / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Advanced / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / gym / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / dumbbells / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / dumbbells / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / dumbbells / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / bands / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / bands / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / bands / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / none / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / none / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
  },
];

const phaseIndexes = [1, 2, 3] as const;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const describeExercise = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  return exercise ? `${exercise.name}` : `${exerciseId} (missing catalog entry)`;
};

const getExercise = (item: ProgramRoutineItem) => exerciseById(item.exerciseId) ?? null;

const getSectionItems = (day: ProgramDay, section: NonNullable<ProgramRoutineItem["section"]>) =>
  day.routine.filter((item) => item.section === section);

const getSectionExercises = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) =>
  getSectionItems(day, section)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const compactList = (items: string[]) => (items.length ? items.join(", ") : "none");

const namesForSection = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) => compactList(getSectionItems(day, section).map((item) => describeExercise(item.exerciseId)));

const debugBits = (item: ProgramRoutineItem) => {
  const debug = item.selectionDebug;
  return [
    `slot=${debug?.slotKind ?? "n/a"}`,
    `lane=${debug?.slotLane ?? "n/a"}`,
    `source=${debug?.source ?? "n/a"}`,
  ].join(" ");
};

const detailedExerciseLine = (item: ProgramRoutineItem) => {
  const exercise = exerciseById(item.exerciseId);
  const name = exercise?.name ?? "missing catalog entry";
  return `  - \`${item.exerciseId}\` ${name} (${debugBits(item)})`;
};

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === normalizeToken(pattern));

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""}`.toLowerCase();

const isHorizontalPush = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    (hasPattern(exercise, "push") || hasPattern(exercise, "horizontalPush")) &&
    !hasPattern(exercise, "verticalPush") &&
    !descriptor.includes("lateral raise")
  );
};

const isHorizontalPull = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.slotRoles?.includes("pullHorizontal") ||
    hasPattern(exercise, "horizontalPull") ||
    descriptor.includes("row")
  );
};

const isVerticalPull = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.slotRoles?.includes("pullVertical") ||
    hasPattern(exercise, "verticalPull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup")
  );
};

const isVerticalPullSurrogate = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.weeklyCoverageTags?.includes("verticalPullSurrogate") ||
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("supine lat") ||
    descriptor.includes("supine-lat")
  );
};

const isRearOrScapSupport = (exercise: Exercise) =>
  isBackChestPosteriorSupportFamily(resolveBackChestAccessoryCoachFamily(exercise));

const isRearDeltFamily = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck")
  );
};

const isSidePlankFamily = (exercise: Exercise) =>
  resolveCoreCoachFamily(exercise) === "lateral_stability";

const isCoreExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  const coreFamily = resolveCoreCoachFamily(exercise);
  return (
    coreFamily !== "other" ||
    exercise.tags.some((tag) => normalizeToken(tag) === "core") ||
    exercise.movementPattern.some((pattern) => normalizeToken(pattern) === "core") ||
    descriptor.includes("plank") ||
    descriptor.includes("pallof") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("dead-bug") ||
    descriptor.includes("hollow") ||
    descriptor.includes("brace")
  );
};

const hasLowBackPain = (questionnaire: QuestionnaireData) =>
  questionnaire.painAreas.some((area) => {
    const token = normalizeToken(area);
    return token === "lower_back" || token === "low_back" || token === "back";
  });

const legalChestIsolationExists = (
  available: Set<Equipment>,
  selectedIds: Set<string>
) =>
  exercises.some((exercise) => {
    if (selectedIds.has(exercise.id)) return false;
    if (!isBackChestTruthfulChestIsolation(exercise)) return false;
    return isExerciseEligible(exercise, available);
  });

const allProgramExercises = (program: Program) =>
  program.week
    .flatMap((day) => day.routine)
    .map((item) => ({ item, exercise: exerciseById(item.exerciseId) }))
    .filter((entry): entry is { item: ProgramRoutineItem; exercise: Exercise } =>
      Boolean(entry.exercise)
    );

const resolveFocusForDay = (day: ProgramDay): "upper" | "lower" | "core" => {
  const title = day.title.toLowerCase();
  if (title.includes("legs") || title.includes("lower")) return "lower";
  if (title.includes("abs") || title.includes("core")) return "core";
  return "upper";
};

const buildMainLayoutSignature = (program: Program) =>
  program.week
    .map((day) => {
      const slotSignature = getSectionItems(day, "main")
        .map((item) => `${item.selectionDebug?.slotKind ?? item.selectionDebug?.slotLane ?? "main"}:${item.exerciseId}`)
        .join(">");
      return `${day.title}=[${slotSignature}]`;
    })
    .join(" | ");

const formatWarningsAndHints = (
  warnings: ReturnType<typeof getProgramConstraintWarningBuffer>,
  hints: string[]
) => {
  const lines = [
    ...warnings.map(
      (warning) => `[${warning.kind}] ${warning.dayTitle}: ${warning.message}`
    ),
    ...hints.map((hint) => `[coach] ${hint}`),
  ];
  return lines.length ? lines.map((line) => `  - ${line}`).join("\n") : "  - none";
};

const buildChecklist = (
  program: Program,
  questionnaire: QuestionnaireData,
  available: Set<Equipment>
): ChecklistItem[] => {
  const backChestDay = program.week.find((day) => day.title === "Back + Chest");
  const shouldersDay = program.week.find((day) => day.title === "Shoulders + Arms");
  const legsDay = program.week.find((day) => day.title === "Legs + Abs");
  const selectedIds = new Set(program.week.flatMap((day) => day.routine.map((item) => item.exerciseId)));

  const dayOneMains = backChestDay ? getSectionExercises(backChestDay, "main") : [];
  const dayOneAccessories = backChestDay ? getSectionExercises(backChestDay, "accessory") : [];
  const dayTwoMains = shouldersDay ? getSectionExercises(shouldersDay, "main") : [];
  const dayThreeMains = legsDay ? getSectionExercises(legsDay, "main") : [];
  const dayThreeAccessories = legsDay ? getSectionExercises(legsDay, "accessory") : [];

  const dayOneHasPush = dayOneMains.some(isHorizontalPush);
  const dayOneHasHorizontalPull = dayOneMains.some(isHorizontalPull);
  const dayOneHasVerticalOrSurrogate = dayOneMains.some(
    (exercise) => isVerticalPull(exercise) || isVerticalPullSurrogate(exercise)
  );

  const dayOneAccessorySupportCount = dayOneAccessories.filter(isRearOrScapSupport).length;
  const dayOneAccessoryAllSupport =
    dayOneAccessories.length > 1 && dayOneAccessorySupportCount === dayOneAccessories.length;
  const dayOneHasChestIsolationAccessory = dayOneAccessories.some(
    isBackChestTruthfulChestIsolation
  );
  const chestExposureLow =
    dayOneMains.filter(
      (exercise) =>
        isHorizontalPush(exercise) ||
        isBackChestTruthfulChestIsolation(exercise) ||
        exercise.weeklyCoverageTags?.includes("chest")
    ).length <= 1;
  const chestIsolationContextJustified =
    Boolean(backChestDay) &&
    dayOneHasHorizontalPull &&
    dayOneHasVerticalOrSurrogate &&
    chestExposureLow &&
    legalChestIsolationExists(available, selectedIds);

  const rearDeltMainCount = dayTwoMains.filter(isRearDeltFamily).length;
  const uprightRows = allProgramExercises(program).filter(({ exercise }) =>
    isUprightRowFamilyExercise(exercise)
  );
  const uprightRowSafeProfile = canUseUprightRowForThreeDayShoulder({
    experience:
      questionnaire.experience === "Advanced"
        ? "advanced"
        : questionnaire.experience === "Intermediate"
        ? "intermediate"
        : "beginner",
    painSeverity: questionnaire.painAreas.length ? "medium" : "low",
    painAreas: questionnaire.painAreas,
    trainingContext: questionnaire.equipment.includes("gym") ? "gym" : "home",
    availableEquipment: available,
  });

  const unilateralFamilies = dayThreeMains
    .map(resolveLowerUnilateralCoachFamily)
    .filter((family) => family !== "other");
  const coreAccessories = dayThreeAccessories.filter(isCoreExercise);
  const lowerBackPain = hasLowBackPain(questionnaire);
  const backExtensionMains = dayThreeMains.filter(isBackExtensionHingeFamily);

  const equipmentViolations = allProgramExercises(program).filter(
    ({ exercise }) => !isExerciseEligible(exercise, available)
  );

  const fakeChestIsolationItems = program.week.flatMap((day) =>
    day.routine.filter((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const debugSlotRole = (item.selectionDebug as { slotRole?: string } | undefined)?.slotRole;
      const chestSlot =
        item.selectionDebug?.slotLane === "chest" ||
        debugSlotRole === "accessoryChestIsolation" ||
        item.selectionDebug?.slotKind?.toLowerCase().includes("chest");
      return chestSlot && !isBackChestTruthfulChestIsolation(exercise) && isRearDeltFamily(exercise);
    })
  );

  const cooldownMismatches = program.week.flatMap((day) => {
    const selectedExercises = [
      ...getSectionExercises(day, "main"),
      ...getSectionExercises(day, "accessory"),
    ];
    const preferred = getThreeDayCooldownPreferenceIds({
      dayTitle: day.title,
      focus: resolveFocusForDay(day),
      selectedExercises,
    });
    return getSectionItems(day, "cooldown")
      .filter((item) => !preferred.includes(item.exerciseId))
      .map((item) => `${day.title}:${item.exerciseId}`);
  });

  return [
    {
      label: "Day 1 has push + horizontal pull + vertical pull or surrogate",
      status: dayOneHasPush && dayOneHasHorizontalPull && dayOneHasVerticalOrSurrogate ? "PASS" : "REVIEW",
      detail: `push=${dayOneHasPush}, horizontalPull=${dayOneHasHorizontalPull}, verticalOrSurrogate=${dayOneHasVerticalOrSurrogate}`,
    },
    {
      label: "Day 1 accessories are not both rear/scap support unless justified",
      status: !dayOneAccessoryAllSupport ? "PASS" : legalChestIsolationExists(available, selectedIds) ? "REVIEW" : "INFO",
      detail: dayOneAccessories.map((exercise) => `${exercise.id}:${resolveBackChestAccessoryCoachFamily(exercise)}`).join(", ") || "none",
    },
    {
      label: "Day 1 has truthful chest isolation when chest deficit and context justify it",
      status: !chestIsolationContextJustified ? "INFO" : dayOneHasChestIsolationAccessory ? "PASS" : "REVIEW",
      detail: `contextJustified=${chestIsolationContextJustified}, accessoryChestIsolation=${dayOneHasChestIsolationAccessory}`,
    },
    {
      label: "Day 2 does not over-stack rear-delt family",
      status: rearDeltMainCount <= 1 ? "PASS" : "REVIEW",
      detail: `rearDeltMains=${rearDeltMainCount}`,
    },
    {
      label: "Upright row appears only in safe profiles",
      status: uprightRows.length === 0 || uprightRowSafeProfile ? "PASS" : "REVIEW",
      detail: uprightRows.length ? uprightRows.map(({ exercise }) => exercise.id).join(", ") : "none",
    },
    {
      label: "Day 3 unilateral lower is not always step-up family",
      status: unilateralFamilies.includes("step_up") ? "REVIEW" : unilateralFamilies.length ? "PASS" : "INFO",
      detail: unilateralFamilies.join(", ") || "none",
    },
    {
      label: "Core does not always pick side-plank family",
      status:
        coreAccessories.length === 0
          ? "INFO"
          : coreAccessories.every(isSidePlankFamily)
          ? "REVIEW"
          : "PASS",
      detail: coreAccessories.map((exercise) => `${exercise.id}:${resolveCoreCoachFamily(exercise)}`).join(", ") || "none",
    },
    {
      label: "Lower-back pain does not use back-extension/back-extension-hold as main hinge",
      status: !lowerBackPain ? "INFO" : backExtensionMains.length ? "REVIEW" : "PASS",
      detail: lowerBackPain ? backExtensionMains.map((exercise) => exercise.id).join(", ") || "none" : "not a lower-back pain profile",
    },
    {
      label: "Equipment requirements are respected",
      status: equipmentViolations.length ? "REVIEW" : "PASS",
      detail: equipmentViolations.map(({ exercise }) => exercise.id).join(", ") || "all selected exercises eligible",
    },
    {
      label: "No fake chest isolation from rear-delt movements",
      status: fakeChestIsolationItems.length ? "REVIEW" : "PASS",
      detail: fakeChestIsolationItems.map((item) => item.exerciseId).join(", ") || "none",
    },
    {
      label: "Cooldown matches day identity",
      status: cooldownMismatches.length ? "REVIEW" : "PASS",
      detail: cooldownMismatches.join(", ") || "all cooldowns are in day-aware preference lists",
    },
  ];
};

const renderProgram = (
  persona: Persona,
  phaseIndex: 1 | 2 | 3,
  program: Program,
  warnings: ReturnType<typeof getProgramConstraintWarningBuffer>
) => {
  const available = normalizeEquipmentSelection(persona.questionnaire.equipment).available;
  const hints = buildThreeDayCoachAuditHints(program.week);
  const checklist = buildChecklist(program, persona.questionnaire, available);
  const lines: string[] = [];

  lines.push(`## ${persona.name} - Phase ${phaseIndex}`);
  lines.push("");
  lines.push(`- Goal: ${persona.questionnaire.goals}`);
  lines.push(`- Experience: ${persona.questionnaire.experience}`);
  lines.push(`- Equipment: ${persona.questionnaire.equipment.join(", ")}`);
  lines.push(`- Pain areas: ${persona.questionnaire.painAreas.join(", ") || "none"}`);
  lines.push(`- Phase: ${program.phaseName ?? `phase ${phaseIndex}`}`);
  lines.push(`- Main layout signature: ${buildMainLayoutSignature(program)}`);
  lines.push("- Coverage warnings / audit hints:");
  lines.push(formatWarningsAndHints(warnings, hints));
  lines.push("");

  program.week.forEach((day) => {
    lines.push(`### ${day.title}`);
    lines.push(`- Warm-up: ${namesForSection(day, "warmup")}`);
    lines.push(`- Corrective: ${namesForSection(day, "activation")}`);
    lines.push("- Main:");
    const mainItems = getSectionItems(day, "main");
    lines.push(...(mainItems.length ? mainItems.map(detailedExerciseLine) : ["  - none"]));
    lines.push("- Accessory:");
    const accessoryItems = getSectionItems(day, "accessory");
    lines.push(
      ...(accessoryItems.length ? accessoryItems.map(detailedExerciseLine) : ["  - none"])
    );
    lines.push(`- Cooldown: ${namesForSection(day, "cooldown")}`);
    lines.push("");
  });

  lines.push("### Issue Checklist");
  checklist.forEach((item) => {
    lines.push(`- ${item.status}: ${item.label} - ${item.detail}`);
  });
  lines.push("");

  return lines.join("\n");
};

const reports: string[] = [
  "# 3-Day Persona Review",
  "",
  "Deterministic manual-review output for key 3-day profiles.",
  "",
];

personas.forEach((persona, personaIndex) => {
  phaseIndexes.forEach((phaseIndex) => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const seed = `three-day-persona-review-${personaIndex + 1}-phase-${phaseIndex}`;
    const program = generateWeeklyProgram(
      persona.questionnaire,
      `persona-review-${personaIndex + 1}-phase-${phaseIndex}`,
      {
        phaseIndex,
        seed,
      }
    );
    const warnings = getProgramConstraintWarningBuffer().filter(
      (warning) => warning.programId === program.id
    );

    reports.push(renderProgram(persona, phaseIndex, program, warnings));
  });
});

console.log(reports.join("\n"));
