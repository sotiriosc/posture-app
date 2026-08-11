import type { CandidateScoreComponent } from "../types";
import { component, demandValue } from "../utils";

const EXPERIENCE_TARGET_DEMAND = {
  novice: 1,
  beginner: 1.4,
  intermediate: 2.1,
  advanced: 2.6,
} as const;

export const experienceFitComponent: CandidateScoreComponent = {
  id: "experience_fit",
  score({ request, exercise }) {
    const target = EXPERIENCE_TARGET_DEMAND[request.athlete.experience];
    const demand = (demandValue(exercise.loading.skillDemand) + demandValue(exercise.loading.coordinationDemand)) / 2;
    const value = 8.4 - Math.abs(demand - target) * 1.35;

    return component({
      id: "experience_fit",
      family: "experience_suitability",
      value,
      reasonCode: "EXPERIENCE_APPROPRIATE",
      reason: `${exercise.name} demand ${demand.toFixed(1)} compared with ${request.athlete.experience} target ${target}.`,
      source: "athlete_profile",
    });
  },
};

export const phaseFitComponent: CandidateScoreComponent = {
  id: "phase_fit",
  score({ request, exercise }) {
    const suitability = exercise.phaseSuitability[request.phase.id]?.suitability;
    const base =
      suitability === "excellent"
        ? 8.8
        : suitability === "good"
          ? 7.8
          : suitability === "possible"
            ? 6.2
            : 5.5;
    const phase3Stimulus =
      request.phase.id === "phase_3" && exercise.loading.loadability === "high" ? 0.8 : 0;
    const phase1Control =
      request.phase.id === "phase_1" && exercise.loading.skillDemand === "low" && exercise.loading.stabilityDemand !== "high" ? 0.5 : 0;

    return component({
      id: "phase_fit",
      family: "phase_suitability",
      value: base + phase3Stimulus + phase1Control,
      reasonCode: "PHASE_DEVELOPMENT_FIT",
      reason: `${exercise.name} phase suitability for ${request.phase.id} is ${suitability ?? "unspecified"}.`,
      source: "phase",
    });
  },
};

export const stabilityFitComponent: CandidateScoreComponent = {
  id: "stability_fit",
  score({ request, exercise }) {
    const phaseTarget = demandValue(request.phase.capabilityExpectation.stability);
    const stabilityDemand = demandValue(exercise.loading.stabilityDemand);
    const value = 8.5 - Math.max(0, stabilityDemand - phaseTarget) * 1.3;

    return component({
      id: "stability_fit",
      family: "stability_fit",
      value,
      reasonCode: "STABILITY_APPROPRIATE",
      reason: `${exercise.name} stability demand ${exercise.loading.stabilityDemand}; phase expects ${request.phase.capabilityExpectation.stability}.`,
      source: "exercise_definition",
    });
  },
};

export const skillFitComponent: CandidateScoreComponent = {
  id: "skill_fit",
  score({ request, exercise }) {
    const skillDemand = demandValue(exercise.loading.skillDemand);
    const coordinationDemand = demandValue(exercise.loading.coordinationDemand);
    const unsatisfiedPrereqs = exercise.prerequisites.filter(
      (prerequisite) => !request.satisfiedPrerequisiteIds.includes(prerequisite.id),
    ).length;
    const value = 8.5 - (skillDemand + coordinationDemand - 2) * 0.55 - unsatisfiedPrereqs * 2.5;

    return component({
      id: "skill_fit",
      family: "skill_fit",
      value,
      reasonCode: unsatisfiedPrereqs > 0 ? "CAPABILITY_MISSING" : "SKILL_APPROPRIATE",
      reason: `${exercise.name} skill demand ${exercise.loading.skillDemand}, coordination ${exercise.loading.coordinationDemand}, unsatisfied prerequisites ${unsatisfiedPrereqs}.`,
      source: "exercise_definition",
    });
  },
};
