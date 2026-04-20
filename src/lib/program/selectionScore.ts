import type { Exercise } from "@/lib/exercises";
import type {
  WeeklyQuotaAudit,
  WeeklyQuotaCategory,
} from "@/lib/program/quotaRegistry";
import type { ProgramSelectionDecisionTrace } from "@/lib/types";

export type SelectionScoreInput = {
  exercise: Exercise;
  section?: "main" | "accessory";
  phase: "activation" | "skill" | "growth";
  experience: "beginner" | "intermediate" | "advanced";
  trainingContext: "gym" | "home";
  availableEquipment: string[];
  dayTitle: string;
  quotaAudit?: WeeklyQuotaAudit;
  recentExerciseIds?: Set<string>;
  fatigueOverlap?: string[];
  slotLane?: string;
  slotKind?: string;
  slotRole?: string;
};

export type SelectionScoreDelta = {
  score: number;
  reasons: string[];
  decisionTrace: ProgramSelectionDecisionTrace;
};

export type RankedSelectionCandidate = {
  exercise: Exercise;
  score: number;
  reasons: string[];
  decisionTrace: ProgramSelectionDecisionTrace;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const normalizeTokens = (values: string[] | undefined) =>
  new Set((values ?? []).map(normalizeToken).filter(Boolean));

const hasAnyToken = (tokens: Set<string>, values: string[]) =>
  values.some((value) => tokens.has(normalizeToken(value)));

const getQuotaPriorityWeight = (
  priority: WeeklyQuotaAudit["audits"][WeeklyQuotaCategory]["priority"]
) => {
  if (priority === "must") return 2.5;
  if (priority === "should") return 1.5;
  return 0.85;
};

const resolvePhaseLevel = (phase: SelectionScoreInput["phase"]) => {
  if (phase === "growth") return 3;
  if (phase === "skill") return 2;
  return 1;
};

const resolveExercisePhaseLevel = (exercise: Exercise) => {
  if (exercise.phaseMin === "growth") return 3;
  if (exercise.phaseMin === "skill") return 2;
  return 1;
};

const resolveDayIdentityCategories = (dayTitle: string): WeeklyQuotaCategory[] => {
  const normalized = normalizeToken(dayTitle);
  if (normalized === "back_chest") {
    return ["chest", "back", "pushCompound", "horizontalPull", "verticalPull"];
  }
  if (normalized === "shoulders_arms") {
    return ["delts", "arms", "carry", "coreStability", "rearDeltIsolation"];
  }
  if (normalized === "legs_abs") {
    return [
      "quads",
      "posteriorChain",
      "core",
      "squat",
      "hinge",
      "unilateralLower",
      "calves",
      "carry",
      "coreStability",
    ];
  }
  return [];
};

const resolveSlotRoleMatch = (exercise: Exercise, slotRole?: string) => {
  if (!slotRole) return null;
  if (exercise.slotRoles?.includes(slotRole as never)) return slotRole;
  if (exercise.accessoryRoles?.includes(slotRole as never)) return slotRole;
  if (exercise.weeklyCoverageTags?.includes(slotRole as WeeklyQuotaCategory)) {
    return slotRole;
  }

  const roleMap: Record<string, WeeklyQuotaCategory[]> = {
    accessoryBackThickness: ["horizontalPull", "back"],
    accessoryBackWidth: ["verticalPull", "back"],
    accessoryChestIsolation: ["chestIsolation", "chest"],
    accessoryRearDelt: ["rearDeltIsolation", "delts", "back"],
    accessoryShoulderSupport: ["rearDeltIsolation", "delts", "back"],
    accessoryCarry: ["carry", "core"],
    accessoryCoreStability: ["coreStability", "core", "antiRotation"],
    accessoryCalves: ["calves", "lowerRegion"],
    accessoryHamstring: ["posteriorChain", "hinge", "lowerRegion"],
    accessoryGlute: ["posteriorChain", "hinge", "lowerRegion"],
    accessoryBiceps: ["arms", "back"],
    accessoryTriceps: ["arms", "chest"],
    pushCompound: ["pushCompound", "chest"],
    pullHorizontal: ["horizontalPull", "back"],
    pullVertical: ["verticalPull", "back"],
    verticalPush: ["delts", "upperRegion"],
    lateralDeltLoaded: ["delts", "upperRegion"],
    rearDeltLoaded: ["rearDeltIsolation", "delts", "back"],
    secondaryLoadedShoulder: ["delts", "upperRegion"],
    squatPrimary: ["squat", "quads", "lowerRegion"],
    hingePrimary: ["hinge", "posteriorChain", "lowerRegion"],
    unilateralLowerLoaded: ["unilateralLower", "quads", "posteriorChain", "lowerRegion"],
    secondaryLowerLoaded: ["hinge", "squat", "posteriorChain", "lowerRegion"],
  };
  const mappedCategories = roleMap[slotRole] ?? [];
  if (
    mappedCategories.some((category) => exercise.weeklyCoverageTags?.includes(category))
  ) {
    return slotRole;
  }
  return null;
};

const resolveEnvironmentScore = (params: SelectionScoreInput) => {
  const { exercise, availableEquipment, trainingContext } = params;
  const available = new Set(availableEquipment.map(normalizeToken));
  const exerciseEquipment = new Set((exercise.equipment ?? []).map(normalizeToken));
  let score = 0;

  if (trainingContext === "gym") {
    if (
      hasAnyToken(exerciseEquipment, ["machines", "cables", "barbell", "dumbbells"]) &&
      hasAnyToken(available, ["machines", "cables", "barbell", "dumbbells"])
    ) {
      score += 0.75;
    }
    if (
      exerciseEquipment.has("bands") &&
      !hasAnyToken(exerciseEquipment, ["machines", "cables", "barbell", "dumbbells"]) &&
      hasAnyToken(available, ["machines", "cables", "barbell", "dumbbells"])
    ) {
      score -= 0.5;
    }
  }

  if (
    trainingContext === "home" &&
    hasAnyToken(exerciseEquipment, ["machines", "cables", "barbell"])
  ) {
    score -= 0.75;
  }

  return score;
};

const resolveFatiguePenalty = (params: SelectionScoreInput) => {
  const { exercise, fatigueOverlap } = params;
  if (!fatigueOverlap?.length) return 0;
  const coverageTags = new Set(exercise.weeklyCoverageTags ?? []);
  let penalty = 0;

  if (
    fatigueOverlap.includes("pull") &&
    (coverageTags.has("horizontalPull") ||
      coverageTags.has("verticalPull") ||
      coverageTags.has("back"))
  ) {
    penalty -= 0.45;
  }
  if (
    fatigueOverlap.includes("hinge") &&
    (coverageTags.has("hinge") ||
      coverageTags.has("posteriorChain") ||
      coverageTags.has("unilateralLower"))
  ) {
    penalty -= 0.4;
  }
  if (
    fatigueOverlap.includes("verticalPush") &&
    (coverageTags.has("delts") || coverageTags.has("pushCompound"))
  ) {
    penalty -= 0.25;
  }

  return penalty;
};

export const scoreSelectionCandidateDelta = (
  params: SelectionScoreInput
): SelectionScoreDelta => {
  const {
    exercise,
    section,
    phase,
    dayTitle,
    quotaAudit,
    recentExerciseIds,
    slotRole,
  } = params;
  let score = 0;
  const reasons: string[] = [];
  const decisionTrace: ProgramSelectionDecisionTrace = {};
  const selectedForQuota: Array<{ category: string; deficit: number; bonus: number }> = [];
  const coverageTags = exercise.weeklyCoverageTags ?? [];

  if (quotaAudit) {
    coverageTags.forEach((category) => {
      const audit = quotaAudit.audits[category];
      if (!audit || audit.deficit <= 0) return;
      const bonus = Number(
        (audit.deficit * getQuotaPriorityWeight(audit.priority)).toFixed(2)
      );
      score += bonus;
      selectedForQuota.push({
        category,
        deficit: audit.deficit,
        bonus,
      });
    });
  }
  if (selectedForQuota.length) {
    decisionTrace.selectedForQuota = selectedForQuota
      .sort((left, right) => {
        if (right.bonus !== left.bonus) return right.bonus - left.bonus;
        return left.category.localeCompare(right.category);
      })
      .slice(0, 4);
    reasons.push(
      `+${selectedForQuota
        .reduce((total, entry) => total + entry.bonus, 0)
        .toFixed(2)} quota coverage (${decisionTrace.selectedForQuota
        .map((entry) => entry.category)
        .join(", ")})`
    );
  }

  const exercisePhaseLevel = resolveExercisePhaseLevel(exercise);
  const currentPhaseLevel = resolvePhaseLevel(phase);
  const phaseDelta =
    exercisePhaseLevel > currentPhaseLevel
      ? -1.5
      : exercisePhaseLevel === currentPhaseLevel
      ? 0.65
      : 0.2;
  score += phaseDelta;
  decisionTrace.phaseFitBonusOrPenalty = Number(phaseDelta.toFixed(2));
  reasons.push(`${phaseDelta >= 0 ? "+" : ""}${phaseDelta.toFixed(2)} phase fit`);

  const dayIdentityCategories = resolveDayIdentityCategories(dayTitle);
  if (
    dayIdentityCategories.length &&
    dayIdentityCategories.some((category) => coverageTags.includes(category))
  ) {
    score += 0.55;
    decisionTrace.dayIdentityBonusOrPenalty = 0.55;
    reasons.push("+0.55 day identity fit");
  }

  if (recentExerciseIds?.has(exercise.id)) {
    const noveltyPenalty = section === "main" ? -1.25 : -0.75;
    score += noveltyPenalty;
    decisionTrace.noveltyPenaltyApplied = Number(noveltyPenalty.toFixed(2));
    reasons.push(`${noveltyPenalty.toFixed(2)} repeat penalty`);
  }

  const environmentDelta = resolveEnvironmentScore(params);
  if (environmentDelta !== 0) {
    score += environmentDelta;
    decisionTrace.environmentBonusOrPenalty = Number(environmentDelta.toFixed(2));
    reasons.push(
      `${environmentDelta >= 0 ? "+" : ""}${environmentDelta.toFixed(2)} environment fit`
    );
  }

  const matchedSlotRole = resolveSlotRoleMatch(exercise, slotRole);
  if (matchedSlotRole) {
    score += 1.1;
    decisionTrace.slotRoleMatch = matchedSlotRole;
    reasons.push("+1.10 slot role match");
  }

  const fatiguePenalty = resolveFatiguePenalty(params);
  if (fatiguePenalty !== 0) {
    score += fatiguePenalty;
    decisionTrace.fatigueOverlapPenalty = Number(fatiguePenalty.toFixed(2));
    reasons.push(`${fatiguePenalty.toFixed(2)} fatigue overlap`);
  }

  return {
    score,
    reasons,
    decisionTrace,
  };
};

export const compareRankedSelectionCandidates = (
  left: RankedSelectionCandidate,
  right: RankedSelectionCandidate
) => {
  if (right.score !== left.score) return right.score - left.score;
  return left.exercise.id.localeCompare(right.exercise.id);
};

export const rankSelectionCandidatesDeterministically = (
  candidates: RankedSelectionCandidate[]
) =>
  [...candidates]
    .sort(compareRankedSelectionCandidates)
    .map((candidate, index) => ({
      ...candidate,
      decisionTrace: {
        ...candidate.decisionTrace,
        tieBreakRank: index + 1,
      },
    }));
