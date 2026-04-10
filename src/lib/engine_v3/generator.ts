import { exercises as sourceExercises } from "@/lib/exercises";
import { adaptExercisesToV3Catalog } from "@/lib/engine_v3/adapter";
import { buildPrototypeAuditReport } from "@/lib/engine_v3/audit";
import { rankSlotCandidates } from "@/lib/engine_v3/ranking";
import { buildThreeDayThreeWeekRotation } from "@/lib/engine_v3/schedule";
import type {
  V3CapabilityProfile,
  V3ExperienceLevel,
  V3PrototypeExercise,
  V3PrototypeProgram,
  V3RecentPick,
} from "@/lib/engine_v3/types";
import { normalizeExperienceLevel } from "@/lib/engine_v3/utils";
import type { Exercise } from "@/lib/exercises";

const cloneCapabilityProfile = (
  capabilityProfile: V3CapabilityProfile
): V3CapabilityProfile => ({
  availableEquipment: capabilityProfile.availableEquipment.slice(),
  blockedFamilies: capabilityProfile.blockedFamilies?.slice(),
  avoidExerciseIds: capabilityProfile.avoidExerciseIds?.slice(),
  avoidTags: capabilityProfile.avoidTags?.slice(),
  allowOverheadLoading: capabilityProfile.allowOverheadLoading,
  allowUnsupportedHinge: capabilityProfile.allowUnsupportedHinge,
});

export const generateV3PrototypeProgram = (params: {
  seed: string;
  experienceLevel: string;
  capabilityProfile: V3CapabilityProfile;
  recentPicks?: V3RecentPick[];
  sourceCatalog?: Exercise[];
  adaptedCatalog?: V3PrototypeExercise[];
  daysPerWeek?: number;
  weeks?: number;
  candidateLimit?: number;
}): V3PrototypeProgram => {
  const experienceLevel = normalizeExperienceLevel(params.experienceLevel);
  const catalog =
    params.adaptedCatalog ?? adaptExercisesToV3Catalog(params.sourceCatalog ?? sourceExercises);
  const schedule = buildThreeDayThreeWeekRotation({
    seed: params.seed,
    daysPerWeek: params.daysPerWeek,
    weeks: params.weeks,
  });
  const rollingHistory = [...(params.recentPicks ?? [])];

  const days = schedule.days.map((scheduleDay) => {
    const picks = scheduleDay.slots.map((slot) => {
      const rankedCandidates = rankSlotCandidates({
        slot,
        catalog,
        capabilityProfile: params.capabilityProfile,
        experienceLevel,
        seed: `${params.seed}:${scheduleDay.id}:${slot.id}`,
        recentPicks: rollingHistory,
        limit: params.candidateLimit ?? 5,
      });
      const selected = rankedCandidates[0] ?? null;
      if (selected) {
        rollingHistory.unshift({
          exerciseId: selected.exercise.id,
          family: slot.family,
          slotId: slot.id,
          weekIndex: scheduleDay.weekIndex,
          dayIndex: scheduleDay.dayIndex,
          sessionIndex: scheduleDay.sessionIndex,
        });
      }

      return {
        slot,
        exercise: selected?.exercise ?? null,
        selectedScore: selected?.score ?? null,
        rankedCandidates,
      };
    });

    return {
      scheduleDay,
      picks,
    };
  });

  return {
    version: "engine_v3_slot_family_prototype",
    seed: params.seed,
    experienceLevel: experienceLevel as V3ExperienceLevel,
    capabilityProfile: cloneCapabilityProfile(params.capabilityProfile),
    schedule,
    catalog,
    days,
    audit: buildPrototypeAuditReport({
      schedule,
      days,
    }),
  };
};
