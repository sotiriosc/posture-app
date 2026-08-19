import {
  CANDIDATE_PAIN_SCORING_COEFFICIENTS,
  buildCandidatePainMatchTrace,
  receiverDecision,
} from "../../pain";
import type { CandidateScoreComponent } from "../types";
import { component } from "../utils";

export const painSuitabilityComponent: CandidateScoreComponent = {
  id: "pain_suitability",
  score({ request, exercise, painMatchTrace }) {
    const resolvedPainMatchTrace = painMatchTrace ?? buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: request.painAndInjury,
      requestedRole: request.need.requestedRole,
    });
    const receiver = receiverDecision(resolvedPainMatchTrace, "pain_suitability");
    const discomfortOverlap = receiver.countedMatchUnits.filter(
      (match) => match.signalKind === "current_discomfort",
    ).length;
    const moderateOverlap = receiver.countedMatchUnits.filter(
      (match) => match.signalKind === "moderate_pain",
    ).length;
    const sensitivityOverlap = receiver.countedMatchUnits.filter(
      (match) => match.signalKind === "historical_sensitivity",
    ).length;
    const value =
      8.2 -
      discomfortOverlap *
        CANDIDATE_PAIN_SCORING_COEFFICIENTS.painSuitability.currentDiscomfort -
      moderateOverlap * CANDIDATE_PAIN_SCORING_COEFFICIENTS.painSuitability.moderatePain -
      sensitivityOverlap *
        CANDIDATE_PAIN_SCORING_COEFFICIENTS.painSuitability.historicalSensitivity;
    const matchedSignalIds = receiver.affectedSignalIds;

    return component({
      id: "pain_suitability",
      family: "pain_suitability",
      value,
      reasonCode: matchedSignalIds.length === 0 ? "PAIN_SUITABLE" : "PAIN_REQUIRES_REVIEW",
      reason:
        matchedSignalIds.length === 0
          ? `${exercise.name} has no active pain-stressor overlap.`
          : `${exercise.name} overlaps pain/sensitivity signals: ${matchedSignalIds.join(", ")}. Unique units: current=${discomfortOverlap}, moderate=${moderateOverlap}, historical=${sensitivityOverlap}.`,
      source: "pain_injury",
      painMatchTrace: resolvedPainMatchTrace,
      painReceiverDecision: receiver,
    });
  },
};
