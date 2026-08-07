/**
 * Phase 8 — constraint-aware sequencing variation.
 *
 * Operates after truthful selection and before final quality evaluation.
 * Does not change exercise identity — only order within equivalent-priority groups.
 *
 * Pipeline:
 *   selected exercises → day priorities → sequencing constraints
 *   → equivalent-priority groups → deterministic rotate → revalidate quality
 */

import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";
import { createSeededRng } from "@/lib/seededRng";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { countAnchorHeightChanges } from "@/lib/program/bandSetup";
import { resolveBandExerciseRequirement } from "@/lib/program/bandExerciseRequirements";

export type SequencingStabilityReason =
  | "progression_test_week"
  | "skill_acquisition_priority"
  | "pain_monitoring_hold"
  | "equipment_limitation"
  | "only_one_quality_valid_sequence"
  | "phase_prescribed_stability"
  | "primary_priority_lock"
  | "no_equivalent_group"
  | "anchor_transition_constraint";

export type DaySequencingTrace = {
  dayTitle: string;
  applied: boolean;
  reason: string;
  stabilityReason?: SequencingStabilityReason;
  rotationLane: number;
  equivalentMainGroups: string[][];
  equivalentAccessoryGroups: string[][];
  beforeMainAccessoryOrder: string[];
  afterMainAccessoryOrder: string[];
};

export type SequencingPolicyResult = {
  week: ProgramDay[];
  traces: DaySequencingTrace[];
  templateCompositionChanged: boolean;
};

const SECTION_ORDER = ["warmup", "activation", "main", "accessory", "cooldown"] as const;
type Section = (typeof SECTION_ORDER)[number];
type AnchorHeight = "none" | "high" | "middle" | "low";

const sectionOf = (item: ProgramRoutineItem): Section => {
  const section = item.section;
  if (
    section === "warmup" ||
    section === "activation" ||
    section === "main" ||
    section === "accessory" ||
    section === "cooldown"
  ) {
    return section;
  }
  return "main";
};

const hashLane = (parts: Array<string | number>): number => {
  const seed = parts.map(String).join("|");
  const rng = createSeededRng(`seq:${seed}`);
  return Math.floor(rng() * 1_000_000);
};

const rotateArray = <T,>(items: T[], offset: number): T[] => {
  if (items.length <= 1) return [...items];
  const n = ((offset % items.length) + items.length) % items.length;
  if (n === 0) return [...items];
  return [...items.slice(n), ...items.slice(0, n)];
};

const resolveMainLaneKey = (item: ProgramRoutineItem): string => {
  const lane = item.selectionDebug?.slotLane;
  if (lane) return String(lane);
  const exercise = exerciseById(item.exerciseId);
  if (!exercise) return `id:${item.exerciseId}`;
  const patterns = exercise.movementPattern.map((p) => p.toLowerCase());
  if (patterns.some((p) => p.includes("verticalpush"))) return "verticalPush";
  if (patterns.some((p) => p.includes("push"))) return "push";
  if (patterns.some((p) => p.includes("pull"))) return "pull";
  if (patterns.some((p) => p.includes("squat"))) return "squat";
  if (patterns.some((p) => p.includes("hinge"))) return "hinge";
  return `id:${item.exerciseId}`;
};

const anchorHeightOf = (exercise: Exercise | undefined): AnchorHeight => {
  if (!exercise) return "none";
  if (!exercise.equipment.includes("bands")) return "none";
  const req = resolveBandExerciseRequirement({
    exerciseId: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment,
    variantKey: exercise.variantKey,
    cues: exercise.cues,
  });
  if (!req || req.anchor === "none") return "none";
  if (req.anchor === "high" || req.anchor === "repositionable") return "high";
  if (req.anchor === "middle") return "middle";
  return "low";
};

const workAnchorHeights = (items: ProgramRoutineItem[]): AnchorHeight[] =>
  items.map((item) => anchorHeightOf(exerciseById(item.exerciseId)));

const mainPriorityRank = (item: ProgramRoutineItem, index: number): number => {
  const lane = resolveMainLaneKey(item);
  const exercise = exerciseById(item.exerciseId);
  const difficulty = exercise?.difficulty ?? 3;
  if (index === 0) return 0;
  if (lane === "squat" || lane === "hinge") return 1;
  if (lane === "verticalPush") return 2;
  if (lane === "push" || lane === "pull") return 3;
  return 4 + Math.min(difficulty, 5) * 0.01;
};

const buildEquivalentMainGroups = (
  mains: ProgramRoutineItem[]
): Array<{ indices: number[]; ids: string[] }> => {
  if (mains.length < 2) return [];
  const ranks = mains.map((item, index) => mainPriorityRank(item, index));
  const byRank = new Map<number, number[]>();
  ranks.forEach((rank, index) => {
    if (rank === 0) return;
    const list = byRank.get(rank) ?? [];
    list.push(index);
    byRank.set(rank, list);
  });

  const groups: Array<{ indices: number[]; ids: string[] }> = [];
  byRank.forEach((indices) => {
    if (indices.length < 2) return;
    const lanes = indices.map((i) => resolveMainLaneKey(mains[i]!));
    const uniqueLanes = new Set(lanes);
    if (uniqueLanes.size < 2) return;
    const independent =
      (uniqueLanes.has("push") && uniqueLanes.has("pull")) ||
      (uniqueLanes.has("verticalPush") && uniqueLanes.has("pull")) ||
      (uniqueLanes.has("push") && uniqueLanes.has("verticalPush"));
    if (!independent) {
      const hasLower = indices.some((i) => {
        const lane = resolveMainLaneKey(mains[i]!);
        return lane === "squat" || lane === "hinge";
      });
      if (hasLower) return;
    }
    // Do not rotate across different anchor heights (band transition safety).
    const heights = new Set(
      indices.map((i) => anchorHeightOf(exerciseById(mains[i]!.exerciseId)))
    );
    if (heights.size > 1) return;
    groups.push({
      indices,
      ids: indices.map((i) => mains[i]!.exerciseId),
    });
  });
  return groups;
};

/**
 * Accessories may rotate only within the same anchor-height class so band
 * transition budgets are not silently worsened.
 */
const buildEquivalentAccessoryGroups = (
  accessories: ProgramRoutineItem[]
): Array<{ indices: number[]; ids: string[] }> => {
  if (accessories.length < 2) return [];
  const byHeight = new Map<AnchorHeight, number[]>();
  accessories.forEach((item, index) => {
    const height = anchorHeightOf(exerciseById(item.exerciseId));
    const list = byHeight.get(height) ?? [];
    list.push(index);
    byHeight.set(height, list);
  });
  const groups: Array<{ indices: number[]; ids: string[] }> = [];
  byHeight.forEach((indices) => {
    if (indices.length < 2) return;
    const lanes = indices.map(
      (i) => accessories[i]!.selectionDebug?.slotLane ?? accessories[i]!.exerciseId
    );
    if (new Set(lanes).size < 2) return;
    groups.push({
      indices,
      ids: indices.map((i) => accessories[i]!.exerciseId),
    });
  });
  return groups;
};

const applyGroupRotations = (
  items: ProgramRoutineItem[],
  groups: Array<{ indices: number[] }>,
  rotationLane: number
): ProgramRoutineItem[] => {
  if (!groups.length) return [...items];
  const next = [...items];
  groups.forEach((group, groupIndex) => {
    const slice = group.indices.map((i) => next[i]!);
    const rotated = rotateArray(slice, rotationLane + groupIndex);
    group.indices.forEach((itemIndex, pos) => {
      next[itemIndex] = rotated[pos]!;
    });
  });
  return next;
};

const mainAccessoryOrder = (day: ProgramDay): string[] =>
  day.routine
    .filter((item) => item.section === "main" || item.section === "accessory")
    .map((item) => item.exerciseId);

const reassembleDay = (
  day: ProgramDay,
  sections: Record<Section, ProgramRoutineItem[]>
): ProgramDay => ({
  ...day,
  routine: SECTION_ORDER.flatMap((section) => sections[section]),
});

const extractSections = (
  day: ProgramDay
): Record<Section, ProgramRoutineItem[]> => {
  const sections: Record<Section, ProgramRoutineItem[]> = {
    warmup: [],
    activation: [],
    main: [],
    accessory: [],
    cooldown: [],
  };
  day.routine.forEach((item) => {
    sections[sectionOf(item)].push(item);
  });
  return sections;
};

const ordersEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const restorePrimaryFirst = (
  authoredMains: ProgramRoutineItem[],
  nextMains: ProgramRoutineItem[]
): ProgramRoutineItem[] => {
  if (!authoredMains.length) return nextMains;
  const primaryId = authoredMains[0]!.exerciseId;
  const primaryIdx = nextMains.findIndex((item) => item.exerciseId === primaryId);
  if (primaryIdx <= 0) return nextMains;
  const copy = [...nextMains];
  const [primary] = copy.splice(primaryIdx, 1);
  copy.unshift(primary!);
  return copy;
};

const buildCandidateDay = (params: {
  day: ProgramDay;
  sections: Record<Section, ProgramRoutineItem[]>;
  mainGroups: Array<{ indices: number[] }>;
  accessoryGroups: Array<{ indices: number[] }>;
  rotationLane: number;
}): ProgramDay => {
  const nextMains = restorePrimaryFirst(
    params.sections.main,
    applyGroupRotations(params.sections.main, params.mainGroups, params.rotationLane)
  );
  const nextAccessories = applyGroupRotations(
    params.sections.accessory,
    params.accessoryGroups,
    params.rotationLane + 1
  );
  return reassembleDay(params.day, {
    ...params.sections,
    main: nextMains,
    accessory: nextAccessories,
  });
};

const workItems = (day: ProgramDay) =>
  day.routine.filter((item) => item.section === "main" || item.section === "accessory");

export const applyConstraintAwareSequencing = (params: {
  week: ProgramDay[];
  seed: string;
  cycleIndex?: number;
  weekIndex?: number;
  phaseIndex?: number;
  previousWeek?: ProgramDay[];
  holdStability?: boolean;
  stabilityReason?: SequencingStabilityReason;
}): SequencingPolicyResult => {
  const cycleIndex = params.cycleIndex ?? 1;
  const weekIndex = params.weekIndex ?? 1;
  const phaseIndex = params.phaseIndex ?? 1;
  const traces: DaySequencingTrace[] = [];
  let templateCompositionChanged = false;

  const nextWeek = params.week.map((day) => {
    const before = mainAccessoryOrder(day);
    const sections = extractSections(day);
    const baselineAnchorChanges = countAnchorHeightChanges(
      workAnchorHeights(workItems(day))
    );

    if (params.holdStability) {
      traces.push({
        dayTitle: day.title,
        applied: false,
        reason: "stability hold",
        stabilityReason: params.stabilityReason ?? "phase_prescribed_stability",
        rotationLane: 0,
        equivalentMainGroups: [],
        equivalentAccessoryGroups: [],
        beforeMainAccessoryOrder: before,
        afterMainAccessoryOrder: before,
      });
      return day;
    }

    const mainGroups = buildEquivalentMainGroups(sections.main);
    const accessoryGroups = buildEquivalentAccessoryGroups(sections.accessory);
    if (!mainGroups.length && !accessoryGroups.length) {
      traces.push({
        dayTitle: day.title,
        applied: false,
        reason: "no equivalent-priority groups",
        stabilityReason: "no_equivalent_group",
        rotationLane: 0,
        equivalentMainGroups: [],
        equivalentAccessoryGroups: [],
        beforeMainAccessoryOrder: before,
        afterMainAccessoryOrder: before,
      });
      return day;
    }

    const baseLane = hashLane([
      params.seed,
      cycleIndex,
      weekIndex,
      phaseIndex,
      day.title,
      day.dayIndex,
    ]);

    const previousDay = params.previousWeek?.find(
      (candidate) => candidate.dayIndex === day.dayIndex || candidate.title === day.title
    );
    const previousOrder = previousDay ? mainAccessoryOrder(previousDay) : null;

    let chosen: ProgramDay | null = null;
    let chosenLane = baseLane;
    let blockedByAnchor = false;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const lane = baseLane + attempt;
      const candidate = buildCandidateDay({
        day,
        sections,
        mainGroups,
        accessoryGroups,
        rotationLane: lane,
      });
      const candidateAnchorChanges = countAnchorHeightChanges(
        workAnchorHeights(workItems(candidate))
      );
      if (candidateAnchorChanges > baselineAnchorChanges) {
        blockedByAnchor = true;
        continue;
      }
      const candidateOrder = mainAccessoryOrder(candidate);
      if (previousOrder && ordersEqual(candidateOrder, previousOrder)) {
        continue;
      }
      if (ordersEqual(candidateOrder, before) && attempt === 0) {
        // Keep searching for a meaningful alternative when groups exist.
        chosen = candidate;
        chosenLane = lane;
        continue;
      }
      chosen = candidate;
      chosenLane = lane;
      break;
    }

    if (!chosen) {
      traces.push({
        dayTitle: day.title,
        applied: false,
        reason: blockedByAnchor
          ? "anchor transition constraint blocked rotation"
          : "no safe alternative sequence",
        stabilityReason: blockedByAnchor
          ? "anchor_transition_constraint"
          : "only_one_quality_valid_sequence",
        rotationLane: baseLane,
        equivalentMainGroups: mainGroups.map((g) => g.ids),
        equivalentAccessoryGroups: accessoryGroups.map((g) => g.ids),
        beforeMainAccessoryOrder: before,
        afterMainAccessoryOrder: before,
      });
      return day;
    }

    const after = mainAccessoryOrder(chosen);
    const applied = !ordersEqual(before, after);
    if (applied) templateCompositionChanged = true;

    traces.push({
      dayTitle: day.title,
      applied,
      reason: applied
        ? "deterministic equivalent-priority rotation"
        : "rotation produced identical order",
      stabilityReason: applied ? undefined : "only_one_quality_valid_sequence",
      rotationLane: chosenLane,
      equivalentMainGroups: mainGroups.map((g) => g.ids),
      equivalentAccessoryGroups: accessoryGroups.map((g) => g.ids),
      beforeMainAccessoryOrder: before,
      afterMainAccessoryOrder: after,
    });
    return chosen;
  });

  return { week: nextWeek, traces, templateCompositionChanged };
};

/** Test helper: section order invariant. */
export const assertSectionOrderInvariant = (day: ProgramDay): boolean => {
  let last = -1;
  for (const item of day.routine) {
    const idx = SECTION_ORDER.indexOf(sectionOf(item));
    if (idx < last) return false;
    last = Math.max(last, idx);
  }
  return true;
};
