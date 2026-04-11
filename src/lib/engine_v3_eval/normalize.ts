import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { normalizeEquipmentSelection, isExerciseEligible } from "@/lib/equipment";
import { exerciseById } from "@/lib/exercises";
import { adaptExerciseToV3 } from "@/lib/engine_v3";
import { scoreUniquenessAgainstHistory } from "@/lib/engine_v3/ranking";
import type {
  V3MovementFamily,
  V3SlotRole,
  V3SupportProfile,
  V3PrototypeProgram,
} from "@/lib/engine_v3";
import {
  V3_MOVEMENT_FAMILIES,
  V3_SLOT_ROLES,
} from "@/lib/engine_v3/types";
import type {
  NormalizedBlockMetrics,
  NormalizedSelectionEntry,
  V3RepairMetrics,
  ProductionRepairMetrics,
} from "@/lib/engine_v3_eval/types";
import type { Program } from "@/lib/types";

const CORE_FAMILIES = new Set<V3MovementFamily>(["anti_ext", "anti_rot", "core"]);

const emptyRoleDistribution = () =>
  Object.fromEntries(V3_SLOT_ROLES.map((role) => [role, 0])) as Record<V3SlotRole, number>;

const emptySupportDistribution = () =>
  Object.fromEntries(
    (["machine", "cable", "supported", "bodyweight", "free"] as V3SupportProfile[]).map(
      (profile) => [profile, 0]
    )
  ) as Record<V3SupportProfile, number>;

const emptyFamilyCounts = () =>
  Object.fromEntries(V3_MOVEMENT_FAMILIES.map((family) => [family, 0])) as Record<
    V3MovementFamily,
    number
  >;

const normalizeSectionToRole = (
  section: Program["week"][number]["routine"][number]["section"],
  families: V3MovementFamily[]
): V3SlotRole => {
  if (section === "warmup" || section === "activation") return "prep";
  if (section === "cooldown") return "finisher";
  if (families.some((family) => CORE_FAMILIES.has(family))) return "core";
  if (section === "accessory") return "accessory";
  return "main";
};

const toCoverageFamilies = (entry: NormalizedSelectionEntry) => {
  if (entry.scheduledFamily) return [entry.scheduledFamily];
  return entry.coverageFamilies;
};

const round = (value: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? Number(value.toFixed(4)) : null;

export const normalizeProductionPrograms = (params: {
  programs: Program[];
  questionnaire: QuestionnaireData;
}): NormalizedSelectionEntry[] => {
  const available = normalizeEquipmentSelection(params.questionnaire.equipment).available;

  return params.programs.flatMap((program, weekOffset) =>
    program.week.flatMap((day, dayIndex) =>
      day.routine.map((item, itemIndex) => {
        const exercise = exerciseById(item.exerciseId);
        const adapted = exercise ? adaptExerciseToV3(exercise) : null;

        return {
          weekIndex: weekOffset,
          dayIndex,
          sessionIndex: weekOffset * program.daysPerWeek + dayIndex,
          entryId: `w${weekOffset + 1}d${dayIndex + 1}i${itemIndex + 1}`,
          role: normalizeSectionToRole(item.section, adapted?.families ?? []),
          scheduledFamily: null,
          coverageFamilies: adapted?.families ?? [],
          primaryFamily: adapted?.primaryFamily ?? null,
          exerciseId: exercise?.id ?? item.exerciseId ?? null,
          exerciseName: exercise?.name ?? null,
          supportProfile: adapted?.supportProfile ?? null,
          complexity: adapted?.complexity ?? null,
          equipmentValid: exercise ? isExerciseEligible(exercise, available) : null,
          mapped: Boolean(adapted),
          filled: Boolean(item.exerciseId),
        };
      })
    )
  );
};

export const normalizeV3Program = (
  program: V3PrototypeProgram
): NormalizedSelectionEntry[] =>
  program.days.flatMap((day) =>
    day.picks.map((pick) => ({
      weekIndex: day.scheduleDay.weekIndex,
      dayIndex: day.scheduleDay.dayIndex,
      sessionIndex: day.scheduleDay.sessionIndex,
      entryId: pick.slot.id,
      role: pick.slot.role,
      scheduledFamily: pick.slot.family,
      coverageFamilies: pick.exercise?.families ?? [],
      primaryFamily: pick.slot.family,
      exerciseId: pick.exercise?.id ?? null,
      exerciseName: pick.exercise?.name ?? null,
      supportProfile: pick.exercise?.supportProfile ?? null,
      complexity: pick.exercise?.complexity ?? null,
      equipmentValid: pick.exercise
        ? isExerciseEligible(
            pick.exercise.rawExercise,
            normalizeEquipmentSelection(program.capabilityProfile.availableEquipment).available
          )
        : null,
      mapped: Boolean(pick.exercise),
      filled: Boolean(pick.exercise),
    }))
  );

export const buildNormalizedMetrics = (
  entries: NormalizedSelectionEntry[]
): NormalizedBlockMetrics => {
  const filledEntries = entries.filter((entry) => entry.filled);
  const mappedEntries = entries.filter((entry) => entry.mapped);
  const familyCounts = emptyFamilyCounts();
  const roleDistribution = emptyRoleDistribution();
  const supportProfileDistribution = emptySupportDistribution();
  const workingSupportProfileDistribution = emptySupportDistribution();
  const coverageSet = new Set<V3MovementFamily>();
  const invalidEquipmentExerciseIds = new Set<string>();
  const uniqueExercises = new Set<string>();
  const seenExercises = new Set<string>();
  const seenFamilies = new Set<V3MovementFamily>();
  let repeatedExerciseCount = 0;
  let repeatedFamilyCount = 0;
  let complexityTotal = 0;
  let complexityCount = 0;
  let workingComplexityTotal = 0;
  let workingComplexityCount = 0;
  let equipmentChecks = 0;
  let equipmentPasses = 0;
  let uniquenessTotal = 0;
  let uniquenessCount = 0;
  const rollingHistory: Array<{
    exerciseId: string;
    family: V3MovementFamily;
  }> = [];

  filledEntries
    .slice()
    .sort((left, right) => {
      if (left.sessionIndex !== right.sessionIndex) {
        return left.sessionIndex - right.sessionIndex;
      }
      return left.entryId.localeCompare(right.entryId);
    })
    .forEach((entry) => {
      roleDistribution[entry.role] += 1;
      toCoverageFamilies(entry).forEach((family) => coverageSet.add(family));
      if (entry.primaryFamily) {
        familyCounts[entry.primaryFamily] += 1;
      }
      if (entry.supportProfile) {
        supportProfileDistribution[entry.supportProfile] += 1;
        if (entry.role === "main" || entry.role === "accessory" || entry.role === "core") {
          workingSupportProfileDistribution[entry.supportProfile] += 1;
        }
      }
      if (typeof entry.complexity === "number") {
        complexityTotal += entry.complexity;
        complexityCount += 1;
        if (entry.role === "main" || entry.role === "accessory" || entry.role === "core") {
          workingComplexityTotal += entry.complexity;
          workingComplexityCount += 1;
        }
      }
      if (typeof entry.equipmentValid === "boolean") {
        equipmentChecks += 1;
        if (entry.equipmentValid) {
          equipmentPasses += 1;
        } else if (entry.exerciseId) {
          invalidEquipmentExerciseIds.add(entry.exerciseId);
        }
      }
      if (entry.exerciseId) {
        uniqueExercises.add(entry.exerciseId);
        if (seenExercises.has(entry.exerciseId)) {
          repeatedExerciseCount += 1;
        }
        seenExercises.add(entry.exerciseId);
      }
      if (entry.primaryFamily) {
        if (seenFamilies.has(entry.primaryFamily)) {
          repeatedFamilyCount += 1;
        }
        seenFamilies.add(entry.primaryFamily);
      }
      if (entry.exerciseId && entry.primaryFamily) {
        const uniquenessScore = scoreUniquenessAgainstHistory({
          candidate: {
            id: entry.exerciseId,
            familyKey: entry.exerciseId,
            variantKey: entry.exerciseId,
            families: [entry.primaryFamily],
          },
          recentPicks: rollingHistory,
        });
        uniquenessTotal += uniquenessScore;
        uniquenessCount += 1;
        rollingHistory.unshift({
          exerciseId: entry.exerciseId,
          family: entry.primaryFamily,
        });
      }
    });

  return {
    totalEntries: entries.length,
    filledEntries: filledEntries.length,
    fillRate: round(entries.length ? filledEntries.length / entries.length : 0) ?? 0,
    mappedEntries: mappedEntries.length,
    mappedRate: round(entries.length ? mappedEntries.length / entries.length : 0) ?? 0,
    familyCoverageCount: coverageSet.size,
    missingFamilies: V3_MOVEMENT_FAMILIES.filter((family) => !coverageSet.has(family)),
    familyCounts,
    patternBalance: {
      upperPush: familyCounts.horiz_push + familyCounts.vert_push,
      upperPull: familyCounts.horiz_pull + familyCounts.vert_pull,
      lower: familyCounts.squat + familyCounts.hinge,
      trunk: familyCounts.anti_ext + familyCounts.anti_rot + familyCounts.core,
    },
    roleDistribution,
    supportProfileDistribution,
    workingSupportProfileDistribution,
    averageComplexity: round(complexityCount ? complexityTotal / complexityCount : null),
    averageWorkingComplexity: round(
      workingComplexityCount ? workingComplexityTotal / workingComplexityCount : null
    ),
    equipmentValidityRate: round(equipmentChecks ? equipmentPasses / equipmentChecks : null),
    invalidEquipmentExerciseIds: Array.from(invalidEquipmentExerciseIds).sort(),
    uniqueExerciseRatio: round(
      filledEntries.length ? uniqueExercises.size / filledEntries.length : 0
    ) ?? 0,
    repeatedExerciseCount,
    repeatedFamilyCount,
    averageUniquenessScore: round(uniquenessCount ? uniquenessTotal / uniquenessCount : null),
    unmappedExerciseIds: Array.from(
      new Set(entries.filter((entry) => entry.filled && !entry.mapped).flatMap((entry) => entry.exerciseId ?? []))
    ).sort(),
  };
};

export const splitWeekOneMetrics = (entries: NormalizedSelectionEntry[]) =>
  buildNormalizedMetrics(entries.filter((entry) => entry.weekIndex === 0));

export const buildProductionRepairMetrics = (
  programs: Program[]
): ProductionRepairMetrics => ({
  measurable: true,
  changedSlots: programs.reduce(
    (sum, program) => sum + (program.phaseOptimizerReport?.changedSlots ?? 0),
    0
  ),
  totalSlots: programs.reduce(
    (sum, program) => sum + (program.phaseOptimizerReport?.totalSlots ?? 0),
    0
  ),
  weeksWithOptimizerReport: programs.filter((program) => Boolean(program.phaseOptimizerReport))
    .length,
});

export const buildV3RepairMetrics = (program: V3PrototypeProgram): V3RepairMetrics => ({
  measurable: true,
  missingSlots: program.audit.missingSlots.length,
});
