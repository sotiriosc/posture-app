import type { AssessmentSignal } from "../../../domain/assessment";
import type {
  AssessmentDemandCapabilityTrace,
  AssessmentDemandDimension,
  AssessmentRelevanceLevel,
  AssessmentSignalInterpretationTrace,
  DemandCapabilityMatch,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { candidateDemandForDimension } from "./candidateDemand";
import { estimateAthleteCapability, phaseIntentDemandForDimension } from "./athleteCapability";
import type { ExerciseDefinition } from "../../../domain/exercise";

function clampDevelopmentalValue(value: number): number {
  return Number(Math.max(0, Math.min(3, value)).toFixed(3));
}

function relevanceValue(relevance: AssessmentRelevanceLevel): number {
  switch (relevance) {
    case "high":
      return 1;
    case "moderate":
      return 0.65;
    case "low":
      return 0.35;
    case "none":
      return 0;
  }
}

function developmentalValue(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly dimension: AssessmentDemandDimension;
  readonly relevance: AssessmentRelevanceLevel;
  readonly candidateDemand: number;
  readonly phaseIntentDemand: number;
}): number {
  const sectionSuitability = input.request.need.requestedSection
    ? input.exercise.sectionSuitability[input.request.need.requestedSection]?.suitability
    : undefined;
  const sectionValue =
    sectionSuitability === "excellent"
      ? 0.25
      : sectionSuitability === "good"
        ? 0.15
        : sectionSuitability === "possible"
          ? 0.05
          : 0;

  return clampDevelopmentalValue(
    1 +
      sectionValue +
      relevanceValue(input.relevance) * 0.35 -
      Math.abs(input.candidateDemand - input.phaseIntentDemand) * 0.2,
  );
}

function demandCapabilityMatch(input: {
  readonly candidateDemand: number;
  readonly currentCapability: number;
  readonly phaseIntentDemand: number;
}): DemandCapabilityMatch {
  const capabilityGap = input.candidateDemand - input.currentCapability;
  const phaseDevelopmentGap = input.phaseIntentDemand - input.candidateDemand;

  if (capabilityGap > 1) {
    return "exceeds_current_capability";
  }

  if (capabilityGap > 0.2) {
    return "appropriate_challenge";
  }

  if (capabilityGap < -0.7 || phaseDevelopmentGap > 0.9) {
    return "below_current_capability";
  }

  return "matches_current_capability";
}

export function calculateDemandCapabilityTrace(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signal: AssessmentSignal;
  readonly dimension: AssessmentDemandDimension;
  readonly relevance: AssessmentRelevanceLevel;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
}): AssessmentDemandCapabilityTrace {
  const candidateDemand = candidateDemandForDimension({
    exercise: input.exercise,
    dimension: input.dimension,
  });
  const capabilityEstimate = estimateAthleteCapability({
    request: input.request,
    signal: input.signal,
    dimension: input.dimension,
    signalInterpretation: input.signalInterpretation,
  });
  const phaseIntent = phaseIntentDemandForDimension(input.request, input.dimension);

  if (input.relevance === "none" || candidateDemand.value === null) {
    return {
      dimension: input.dimension,
      candidateDemand: candidateDemand.value,
      candidateDemandSource: candidateDemand,
      currentCapability: capabilityEstimate.value,
      capabilityEstimate,
      phaseIntentDemand: phaseIntent.value,
      phaseIntentSource: phaseIntent.evidence,
      developmentalValue: 0,
      match: "not_applicable",
      evidence: [
        input.relevance === "none"
          ? "Assessment signal is not relevant to this candidate in the requested role."
          : "Candidate demand is unknown, so demand-capability match is not asserted.",
      ],
    };
  }

  const candidateDemandValue = candidateDemand.value;
  const match = demandCapabilityMatch({
    candidateDemand: candidateDemandValue,
    currentCapability: capabilityEstimate.value,
    phaseIntentDemand: phaseIntent.value,
  });

  return {
    dimension: input.dimension,
    candidateDemand: candidateDemandValue,
    candidateDemandSource: candidateDemand,
    currentCapability: capabilityEstimate.value,
    capabilityEstimate,
    phaseIntentDemand: phaseIntent.value,
    phaseIntentSource: phaseIntent.evidence,
    developmentalValue: developmentalValue({
      request: input.request,
      exercise: input.exercise,
      dimension: input.dimension,
      relevance: input.relevance,
      candidateDemand: candidateDemandValue,
      phaseIntentDemand: phaseIntent.value,
    }),
    match,
    evidence: [
      ...candidateDemand.evidence,
      ...capabilityEstimate.evidence,
      ...phaseIntent.evidence,
    ],
  };
}
