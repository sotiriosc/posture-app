import { isExerciseEligible, type Equipment } from "@/lib/equipment";
import type {
  V3CandidateScoreBreakdown,
  V3CapabilityProfile,
  V3DaySlot,
  V3ExperienceLevel,
  V3PrototypeExercise,
  V3RankedCandidate,
  V3RecentPick,
  V3SupportProfile,
} from "@/lib/engine_v3/types";
import {
  clamp,
  experienceLevelRank,
  normalizeExperienceLevel,
  normalizeToken,
  stableHashUnit,
} from "@/lib/engine_v3/utils";

const supportBiasByExperience: Record<
  V3ExperienceLevel,
  Record<V3SupportProfile, number>
> = {
  beginner: {
    machine: 1,
    cable: 0.86,
    supported: 0.94,
    bodyweight: 0.82,
    free: 0.48,
  },
  intermediate: {
    machine: 0.76,
    cable: 0.9,
    supported: 0.85,
    bodyweight: 0.8,
    free: 0.92,
  },
  advanced: {
    machine: 0.62,
    cable: 0.84,
    supported: 0.75,
    bodyweight: 0.78,
    free: 1,
  },
};

const targetComplexityByExperience: Record<V3ExperienceLevel, number> = {
  beginner: 2.1,
  intermediate: 3.1,
  advanced: 4.1,
};

const buildAvailableEquipmentSet = (profile: V3CapabilityProfile) =>
  new Set<Equipment>(
    profile.availableEquipment.length ? profile.availableEquipment : (["none"] as Equipment[])
  );

const isExerciseBlockedByCapability = (params: {
  exercise: V3PrototypeExercise;
  slot: V3DaySlot;
  capabilityProfile: V3CapabilityProfile;
}) => {
  const blockedFamilies = new Set(params.capabilityProfile.blockedFamilies ?? []);
  if (blockedFamilies.has(params.slot.family)) return true;

  const blockedExerciseIds = new Set(params.capabilityProfile.avoidExerciseIds ?? []);
  if (blockedExerciseIds.has(params.exercise.id)) return true;

  const blockedTags = new Set(
    (params.capabilityProfile.avoidTags ?? []).map((tag) => normalizeToken(tag))
  );
  if (blockedTags.size) {
    const hasBlockedTag = params.exercise.tags.some((tag) =>
      blockedTags.has(normalizeToken(tag))
    );
    if (hasBlockedTag) return true;
  }

  if (
    params.capabilityProfile.allowOverheadLoading === false &&
    params.exercise.families.includes("vert_push")
  ) {
    return true;
  }

  if (
    params.capabilityProfile.allowUnsupportedHinge === false &&
    params.slot.family === "hinge" &&
    params.exercise.supportProfile === "free" &&
    params.exercise.complexity >= 4
  ) {
    return true;
  }

  return false;
};

const isEligibleForExperience = (
  experienceLevel: V3ExperienceLevel,
  exercise: V3PrototypeExercise
) =>
  experienceLevelRank(experienceLevel) >= experienceLevelRank(exercise.experienceMin);

export const scoreUniquenessAgainstHistory = (params: {
  candidate: Pick<V3PrototypeExercise, "id" | "familyKey" | "variantKey" | "families">;
  recentPicks?: V3RecentPick[];
}) => {
  const recentPicks = params.recentPicks ?? [];
  if (!recentPicks.length) return 1;

  let penalty = 0;
  recentPicks.forEach((pick, index) => {
    const recencyWeight = 1 - index / (recentPicks.length + 1);
    if (pick.exerciseId === params.candidate.id) {
      penalty += 1.1 * recencyWeight;
      return;
    }
    if (params.candidate.families.includes(pick.family)) {
      penalty += 0.3 * recencyWeight;
    }
  });

  return Number(clamp(1 - penalty, 0, 1).toFixed(4));
};

const resolveExperienceBias = (params: {
  experienceLevel: V3ExperienceLevel;
  exercise: V3PrototypeExercise;
}) => {
  const rankGap =
    experienceLevelRank(params.experienceLevel) - experienceLevelRank(params.exercise.experienceMin);
  if (rankGap <= 0) return 1;
  if (rankGap === 1) return 0.92;
  return 0.85;
};

const resolveDifficultyBias = (params: {
  experienceLevel: V3ExperienceLevel;
  exercise: V3PrototypeExercise;
}) => {
  const target = targetComplexityByExperience[params.experienceLevel];
  return Number(clamp(1 - Math.abs(params.exercise.complexity - target) / 3.25, 0, 1).toFixed(4));
};

const resolveCapabilityBias = (params: {
  slot: V3DaySlot;
  exercise: V3PrototypeExercise;
  capabilityProfile: V3CapabilityProfile;
}) => {
  if (
    params.capabilityProfile.allowUnsupportedHinge === false &&
    params.slot.family === "hinge" &&
    params.exercise.supportProfile !== "free"
  ) {
    return 1;
  }
  if (
    params.capabilityProfile.allowOverheadLoading === false &&
    params.slot.family !== "vert_push"
  ) {
    return 1;
  }
  return 0.9;
};

const buildScoreBreakdown = (params: {
  seed: string;
  slot: V3DaySlot;
  exercise: V3PrototypeExercise;
  experienceLevel: V3ExperienceLevel;
  capabilityProfile: V3CapabilityProfile;
  recentPicks?: V3RecentPick[];
}): V3CandidateScoreBreakdown => {
  const experienceBias = resolveExperienceBias({
    experienceLevel: params.experienceLevel,
    exercise: params.exercise,
  });
  const supportBias =
    supportBiasByExperience[params.experienceLevel][params.exercise.supportProfile];
  const difficultyBias = resolveDifficultyBias({
    experienceLevel: params.experienceLevel,
    exercise: params.exercise,
  });
  const uniquenessScore = scoreUniquenessAgainstHistory({
    candidate: params.exercise,
    recentPicks: params.recentPicks,
  });
  const capabilityBias = resolveCapabilityBias({
    slot: params.slot,
    exercise: params.exercise,
    capabilityProfile: params.capabilityProfile,
  });
  const tieBreaker = stableHashUnit(`${params.seed}:${params.slot.id}:${params.exercise.id}`);
  const total =
    experienceBias * 0.18 +
    supportBias * 0.28 +
    difficultyBias * 0.22 +
    uniquenessScore * 0.28 +
    capabilityBias * 0.04 +
    tieBreaker * 0.001;

  const reasons = [
    `support=${params.exercise.supportProfile}`,
    `complexity=${params.exercise.complexity}`,
    `uniqueness=${uniquenessScore.toFixed(2)}`,
  ];
  if (params.exercise.experienceMin !== "beginner") {
    reasons.push(`minExperience=${params.exercise.experienceMin}`);
  }

  return {
    eligibilityScore: 1,
    experienceBias: Number(experienceBias.toFixed(4)),
    supportBias: Number(supportBias.toFixed(4)),
    difficultyBias,
    uniquenessScore,
    capabilityBias: Number(capabilityBias.toFixed(4)),
    tieBreaker: Number(tieBreaker.toFixed(4)),
    total: Number(total.toFixed(6)),
    reasons,
  };
};

export const rankSlotCandidates = (params: {
  slot: V3DaySlot;
  catalog: V3PrototypeExercise[];
  capabilityProfile: V3CapabilityProfile;
  experienceLevel: string;
  seed: string;
  recentPicks?: V3RecentPick[];
  limit?: number;
}): V3RankedCandidate[] => {
  const experienceLevel = normalizeExperienceLevel(params.experienceLevel);
  const availableEquipment = buildAvailableEquipmentSet(params.capabilityProfile);
  const candidates = params.catalog
    .filter((exercise) => exercise.families.includes(params.slot.family))
    .filter((exercise) => exercise.roles.includes(params.slot.role))
    .filter((exercise) => isExerciseEligible(exercise.rawExercise, availableEquipment))
    .filter((exercise) => !isExerciseBlockedByCapability({
      exercise,
      slot: params.slot,
      capabilityProfile: params.capabilityProfile,
    }))
    .filter((exercise) => isEligibleForExperience(experienceLevel, exercise))
    .map((exercise) => ({
      exercise,
      score: buildScoreBreakdown({
        seed: params.seed,
        slot: params.slot,
        exercise,
        experienceLevel,
        capabilityProfile: params.capabilityProfile,
        recentPicks: params.recentPicks,
      }),
    }))
    .sort((left, right) => {
      if (right.score.total !== left.score.total) {
        return right.score.total - left.score.total;
      }
      if (right.score.uniquenessScore !== left.score.uniquenessScore) {
        return right.score.uniquenessScore - left.score.uniquenessScore;
      }
      if (right.score.tieBreaker !== left.score.tieBreaker) {
        return right.score.tieBreaker - left.score.tieBreaker;
      }
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  return candidates.slice(0, params.limit ?? 5);
};
