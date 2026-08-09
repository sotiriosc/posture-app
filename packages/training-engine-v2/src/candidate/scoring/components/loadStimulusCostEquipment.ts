import type { JointStressTag } from "../../../domain/primitives";
import type { CandidateScoreComponent } from "../types";
import { component, demandValue, loadabilityValue, overlapCount } from "../utils";

function phaseLoadingTarget(loading: "low" | "moderate" | "high"): number {
  return loading === "low" ? 1 : loading === "moderate" ? 2 : 3;
}

function stressOverlapCount(left: readonly JointStressTag[], right: readonly JointStressTag[]): number {
  return overlapCount(left, right);
}

export const loadabilityComponent: CandidateScoreComponent = {
  id: "loadability",
  score({ request, exercise }) {
    const actual = loadabilityValue(exercise.loading.loadability);
    const target = phaseLoadingTarget(request.phase.progressionIntent.loading);
    const goalBonus =
      (request.goal === "strength" || request.goal === "hypertrophy") && actual >= 2 ? 0.8 : 0;
    const controlBonus =
      request.goal === "posture_and_movement_quality" && actual <= 1 ? 0.6 : 0;
    const value = 8.2 - Math.abs(actual - target) * 0.85 + goalBonus + controlBonus;

    return component({
      id: "loadability",
      family: "loadability",
      value,
      reasonCode: "LOADABILITY_MATCH",
      reason: `${exercise.name} loadability is ${exercise.loading.loadability}; phase target is ${request.phase.progressionIntent.loading}.`,
      source: "exercise_definition",
    });
  },
};

export const stimulusPotentialComponent: CandidateScoreComponent = {
  id: "stimulus_potential",
  score({ request, exercise }) {
    const potential = demandValue(exercise.loading.loadingPotential);
    const roleBonus =
      exercise.trainingRoles.includes(request.need.requestedRole) ? 0.8 : 0;
    const goalBonus =
      request.goal === "strength" || request.goal === "hypertrophy"
        ? potential * 0.35
        : request.goal === "pain_aware_return"
          ? -Math.max(0, potential - 2) * 0.45
          : 0;
    const value = 5.6 + potential * 0.75 + roleBonus + goalBonus;

    return component({
      id: "stimulus_potential",
      family: "stimulus_potential",
      value,
      reasonCode: "STIMULUS_MATCH",
      reason: `${exercise.name} stimulus potential is ${exercise.loading.loadingPotential} for ${request.goal}.`,
      source: "exercise_definition",
    });
  },
};

export const fatigueCostComponent: CandidateScoreComponent = {
  id: "fatigue_cost",
  score({ request, exercise }) {
    const local = demandValue(exercise.loading.localFatigue);
    const systemic = demandValue(exercise.loading.systemicFatigue);
    const historyFatigue = Math.max(
      0,
      ...request.need.targetMovementRoles.map((role) => {
        const state = request.history.fatigueState.byMovementRole[role];
        return state === "high" ? 1.4 : state === "moderate" ? 0.7 : 0;
      }),
    );
    const systemicSignal = request.fatigueSignals.includes("systemic_fatigue") ? 1.2 : 0;
    const localSignal = request.fatigueSignals.includes("local_fatigue") ? 0.7 : 0;
    const value =
      9 -
      (local - 1) * 0.55 -
      (systemic - 1) * 0.8 -
      historyFatigue -
      systemicSignal -
      localSignal;

    return component({
      id: "fatigue_cost",
      family: "fatigue_cost",
      value,
      reasonCode: "FATIGUE_COST_ACCEPTABLE",
      reason: `${exercise.name} local fatigue ${exercise.loading.localFatigue}, systemic fatigue ${exercise.loading.systemicFatigue}.`,
      source: "history",
    });
  },
};

export const jointCostComponent: CandidateScoreComponent = {
  id: "joint_cost",
  score({ request, exercise }) {
    const discomfortTags = request.painAndInjury.currentDiscomforts.flatMap((pain) => pain.stressTags);
    const moderateTags = request.painAndInjury.moderatePain.flatMap((pain) => pain.stressTags);
    const historicalTags = request.painAndInjury.historicalSensitivities.flatMap((pain) => pain.stressTags);
    const activeOverlap =
      stressOverlapCount(exercise.loading.jointStressTags, discomfortTags) +
      stressOverlapCount(exercise.cautionStressTags, discomfortTags);
    const moderateOverlap =
      stressOverlapCount(exercise.loading.jointStressTags, moderateTags) +
      stressOverlapCount(exercise.cautionStressTags, moderateTags);
    const historicalOverlap =
      stressOverlapCount(exercise.loading.jointStressTags, historicalTags) +
      stressOverlapCount(exercise.cautionStressTags, historicalTags);
    const axialCost = demandValue(exercise.loading.axialLoading) - 1;
    const jointAccumulation = request.fatigueSignals.includes("joint_stress_accumulated") ? 0.7 : 0;
    const value =
      8.8 -
      activeOverlap * 0.8 -
      moderateOverlap * 1.4 -
      historicalOverlap * 0.35 -
      axialCost * 0.35 -
      jointAccumulation;

    return component({
      id: "joint_cost",
      family: "joint_cost",
      value,
      reasonCode: activeOverlap + moderateOverlap > 0 ? "PAIN_REQUIRES_REVIEW" : "JOINT_COST_ACCEPTABLE",
      reason: `${exercise.name} joint stress overlap: active=${activeOverlap}, moderate=${moderateOverlap}, historical=${historicalOverlap}.`,
      source: "pain_injury",
    });
  },
};

export const equipmentPracticalityComponent: CandidateScoreComponent = {
  id: "equipment_practicality",
  score({ request, exercise }) {
    const requirementCount = exercise.equipmentRequirements.length;
    const machineOrCableCount = exercise.equipmentRequirements.filter((requirement) =>
      (requirement.allOf ?? []).some((capability) => capability === "selectorized_machine" || capability === "cable_stack"),
    ).length;
    const travelComplexity =
      request.equipment.environment === "home" || request.equipment.environment === "travel"
        ? machineOrCableCount * 1.1
        : machineOrCableCount * 0.35;
    const value = 8.7 - Math.max(0, requirementCount - 1) * 0.45 - travelComplexity;

    return component({
      id: "equipment_practicality",
      family: "equipment_practicality",
      value,
      reasonCode: "EQUIPMENT_PRACTICAL",
      reason: `${exercise.name} uses ${requirementCount} required setup item(s) in a ${request.equipment.environment} environment.`,
      source: "equipment",
    });
  },
};
