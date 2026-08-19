import { alignmentFitComponent, assessmentFitComponent } from "./assessmentAlignment";
import {
  experienceFitComponent,
  phaseFitComponent,
  skillFitComponent,
  stabilityFitComponent,
} from "./experiencePhaseSkill";
import {
  equipmentPracticalityComponent,
  fatigueCostComponent,
  jointCostComponent,
  loadabilityComponent,
  stimulusPotentialComponent,
} from "./loadStimulusCostEquipment";
import { painSuitabilityComponent } from "./painFit";
import { continuityValueComponent, progressionValueComponent } from "./progressionContinuity";
import {
  goalFitComponent,
  muscleTargetFitComponent,
  roleFitComponent,
  sessionIntentFitComponent,
} from "./roleGoalSession";
import type { CandidateScoreComponent } from "../types";

export const CANDIDATE_SCORE_COMPONENTS: readonly CandidateScoreComponent[] = [
  roleFitComponent,
  goalFitComponent,
  sessionIntentFitComponent,
  muscleTargetFitComponent,
  assessmentFitComponent,
  alignmentFitComponent,
  painSuitabilityComponent,
  experienceFitComponent,
  phaseFitComponent,
  stabilityFitComponent,
  skillFitComponent,
  progressionValueComponent,
  continuityValueComponent,
  loadabilityComponent,
  stimulusPotentialComponent,
  fatigueCostComponent,
  jointCostComponent,
  equipmentPracticalityComponent,
];

export * from "./assessmentAlignment";
export * from "./experiencePhaseSkill";
export * from "./loadStimulusCostEquipment";
export * from "./painFit";
export * from "./progressionContinuity";
export * from "./roleGoalSession";
