import type {
  V3AuditReport,
  V3FamilyCoverageEntry,
  V3FamilyPickHistoryEntry,
  V3GeneratedDay,
  V3MovementFamily,
  V3ScheduleBlock,
  V3SlotRole,
} from "@/lib/engine_v3/types";
import { V3_MOVEMENT_FAMILIES, V3_SLOT_ROLES } from "@/lib/engine_v3/types";

const createCoverageEntry = (family: V3MovementFamily): V3FamilyCoverageEntry => ({
  family,
  scheduledSlotCount: 0,
  pickedSlotCount: 0,
  slotIds: [],
  weeks: [],
});

const createRoleCounter = () =>
  Object.fromEntries(V3_SLOT_ROLES.map((role) => [role, 0])) as Record<V3SlotRole, number>;

const createFamilyCounter = () =>
  Object.fromEntries(V3_MOVEMENT_FAMILIES.map((family) => [family, 0])) as Record<
    V3MovementFamily,
    number
  >;

export const buildPrototypeAuditReport = (params: {
  schedule: V3ScheduleBlock;
  days: V3GeneratedDay[];
}): V3AuditReport => {
  const coverageMatrix = Object.fromEntries(
    V3_MOVEMENT_FAMILIES.map((family) => [family, createCoverageEntry(family)])
  ) as Record<V3MovementFamily, V3FamilyCoverageEntry>;

  const pickHistoryByFamily = V3_MOVEMENT_FAMILIES.reduce<
    Record<V3MovementFamily, V3FamilyPickHistoryEntry[]>
  >((acc, family) => {
    acc[family] = [];
    return acc;
  }, {} as Record<V3MovementFamily, V3FamilyPickHistoryEntry[]>);

  const uniquenessBySlot: Record<string, number> = {};
  const byRole = createRoleCounter();
  const byFamily = createFamilyCounter();
  const uniqueExercises = new Set<string>();
  const missingSlots: V3AuditReport["missingSlots"] = [];

  params.schedule.days.forEach((day) => {
    day.slots.forEach((slot) => {
      const familyCoverage = coverageMatrix[slot.family];
      familyCoverage.scheduledSlotCount += 1;
      familyCoverage.slotIds.push(slot.id);

      let weekEntry = familyCoverage.weeks.find((entry) => entry.weekIndex === day.weekIndex);
      if (!weekEntry) {
        weekEntry = {
          weekIndex: day.weekIndex,
          scheduledSlotCount: 0,
          pickedSlotCount: 0,
        };
        familyCoverage.weeks.push(weekEntry);
      }
      weekEntry.scheduledSlotCount += 1;
    });
  });

  params.days.forEach((day) => {
    day.picks.forEach((pick) => {
      uniquenessBySlot[pick.slot.id] = pick.selectedScore?.uniquenessScore ?? 0;

      if (!pick.exercise || !pick.selectedScore) {
        missingSlots.push({
          slotId: pick.slot.id,
          role: pick.slot.role,
          family: pick.slot.family,
          weekIndex: day.scheduleDay.weekIndex,
          dayIndex: day.scheduleDay.dayIndex,
          sessionIndex: day.scheduleDay.sessionIndex,
        });
        return;
      }

      uniqueExercises.add(pick.exercise.id);
      byRole[pick.slot.role] += 1;
      byFamily[pick.slot.family] += 1;

      const familyCoverage = coverageMatrix[pick.slot.family];
      familyCoverage.pickedSlotCount += 1;
      const weekEntry = familyCoverage.weeks.find(
        (entry) => entry.weekIndex === day.scheduleDay.weekIndex
      );
      if (weekEntry) {
        weekEntry.pickedSlotCount += 1;
      }

      pickHistoryByFamily[pick.slot.family].push({
        family: pick.slot.family,
        exerciseId: pick.exercise.id,
        exerciseName: pick.exercise.name,
        slotId: pick.slot.id,
        role: pick.slot.role,
        weekIndex: day.scheduleDay.weekIndex,
        dayIndex: day.scheduleDay.dayIndex,
        sessionIndex: day.scheduleDay.sessionIndex,
        uniquenessScore: pick.selectedScore.uniquenessScore,
        totalScore: pick.selectedScore.total,
      });
    });
  });

  return {
    coverageMatrix,
    pickHistoryByFamily,
    uniquenessBySlot,
    volumeSummary: {
      scheduledSlots: params.schedule.days.reduce((sum, day) => sum + day.slots.length, 0),
      pickedSlots: params.days.reduce(
        (sum, day) => sum + day.picks.filter((pick) => Boolean(pick.exercise)).length,
        0
      ),
      uniqueExercises: uniqueExercises.size,
      byRole,
      byFamily,
    },
    missingSlots,
  };
};
