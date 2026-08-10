import type { AssessmentInfluence } from "../../../alignment";
import type {
  AssessmentCandidateRelationship,
  AssessmentDemandCapabilityTrace,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import type { ReasonCode } from "../../../reasonCodes";

function hasDemandReductionContext(request: CandidateRequest): boolean {
  return (
    request.goal === "pain_aware_return" ||
    request.fatigueSignals.some((signal) => signal !== "fresh") ||
    request.painAndInjury.currentDiscomforts.length > 0 ||
    request.painAndInjury.moderatePain.length > 0 ||
    request.painAndInjury.historicalSensitivities.some((sensitivity) =>
      sensitivity.preferredModification === "increase_support" ||
      sensitivity.preferredModification === "reduce_load" ||
      sensitivity.preferredModification === "reduce_range"
    )
  );
}

function isPreparationContext(request: CandidateRequest): boolean {
  return (
    request.need.requestedSection === "activation" ||
    request.need.requestedSection === "warmup" ||
    request.need.requestedRole === "activation" ||
    request.need.requestedRole === "preparation" ||
    request.need.requestedRole === "recovery"
  );
}

function isDevelopmentalLoadingContext(request: CandidateRequest): boolean {
  return (
    request.need.requestedSection === "main" ||
    request.need.requestedRole === "primary_strength" ||
    request.need.requestedRole === "secondary_strength" ||
    request.need.requestedRole === "hypertrophy_accessory"
  );
}

export function relationshipFromDemand(input: {
  readonly influence: AssessmentInfluence;
  readonly demandCapability: AssessmentDemandCapabilityTrace;
  readonly request: CandidateRequest;
}): AssessmentCandidateRelationship {
  if (input.influence.direction === "neutral" || input.demandCapability.match === "not_applicable") {
    return "neutral";
  }

  if (input.influence.direction === "conflicts") {
    return "conflicts_with_priority";
  }

  switch (input.demandCapability.match) {
    case "exceeds_current_capability":
      return "exceeds_current_capability";
    case "appropriate_challenge":
      return isDevelopmentalLoadingContext(input.request)
        ? "develops_priority"
        : "provides_appropriate_exposure";
    case "matches_current_capability":
      return "provides_appropriate_exposure";
    case "below_current_capability":
      if (hasDemandReductionContext(input.request)) {
        return "reduces_excess_demand";
      }

      if (isPreparationContext(input.request)) {
        return "supports_control";
      }

      if (isDevelopmentalLoadingContext(input.request)) {
        return "under_challenges_development";
      }

      return "neutral";
  }
}

export function relationshipScalar(relationship: AssessmentCandidateRelationship): number {
  switch (relationship) {
    case "supports_control":
      return 0.8;
    case "reduces_excess_demand":
      return 0.45;
    case "provides_appropriate_exposure":
      return 1;
    case "develops_priority":
      return 0.9;
    case "under_challenges_development":
      return -0.35;
    case "neutral":
      return 0;
    case "conflicts_with_priority":
      return -0.75;
    case "exceeds_current_capability":
      return -0.85;
  }
}

export function relationshipReasonCode(relationship: AssessmentCandidateRelationship): ReasonCode {
  switch (relationship) {
    case "supports_control":
      return "ASSESSMENT_SUPPORTS_CONTROL";
    case "reduces_excess_demand":
      return "ASSESSMENT_REDUCES_EXCESS_DEMAND";
    case "provides_appropriate_exposure":
      return "ASSESSMENT_APPROPRIATE_EXPOSURE";
    case "develops_priority":
      return "ASSESSMENT_DEVELOPS_PRIORITY";
    case "under_challenges_development":
      return "ASSESSMENT_UNDER_CHALLENGES_DEVELOPMENT";
    case "conflicts_with_priority":
      return "ASSESSMENT_PRIORITY_CONFLICT";
    case "exceeds_current_capability":
      return "ASSESSMENT_EXCEEDS_CAPABILITY";
    case "neutral":
      return "ASSESSMENT_NEUTRAL_RELATIONSHIP";
  }
}

export function relationshipReason(
  relationship: AssessmentCandidateRelationship,
  trace: AssessmentDemandCapabilityTrace,
): string {
  switch (relationship) {
    case "supports_control":
      return `${trace.dimension} demand is below current capability and fits a preparation/control context.`;
    case "reduces_excess_demand":
      return `${trace.dimension} demand is below current capability and a pain, fatigue, recovery, or regression context justifies reducing demand.`;
    case "provides_appropriate_exposure":
      return `${trace.dimension} demand matches current capability or is an appropriate exposure.`;
    case "develops_priority":
      return `${trace.dimension} demand can develop the priority within the requested training role.`;
    case "under_challenges_development":
      return `${trace.dimension} demand is below current capability without a demand-reduction reason for this training role.`;
    case "conflicts_with_priority":
      return `${trace.dimension} relationship conflicts with a blocking assessment priority.`;
    case "exceeds_current_capability":
      return `${trace.dimension} demand exceeds estimated current capability for this finding.`;
    case "neutral":
      return `${trace.dimension} relationship is neutral for this candidate and request.`;
  }
}
