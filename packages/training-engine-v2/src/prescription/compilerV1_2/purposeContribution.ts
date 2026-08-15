import type { PrescriptionLocalPurpose } from "../purposeResolution";
import { PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE,
  type PrescriptionPurposeContribution, type PrescriptionPurposeContributionLane } from "./contracts";

function lane(purpose: PrescriptionLocalPurpose | null,
  blockPurpose: string): PrescriptionPurposeContributionLane {
  if (blockPurpose === "preparatory_acclimation") return "preparation_support_only";
  if (blockPurpose === "recovery_or_downregulation") return "recovery_support_only";
  if (purpose === "strength_development") return "strength_development_candidate";
  if (purpose === "hypertrophy_development") return "hypertrophy_development_candidate";
  if (purpose === "direct_development") return "direct_development_candidate";
  if (purpose === "movement_quality_development") return "movement_quality_practice_candidate";
  if (purpose === "muscular_endurance_development") return "muscular_endurance_development_candidate";
  if (purpose === "capacity_development") return "local_capacity_development_candidate";
  if (purpose === "preparation") return "preparation_support_only";
  if (purpose === "activation") return "activation_support_only";
  if (purpose === "technique_or_control") return "technique_control_observation_only";
  if (purpose === "recovery") return "recovery_support_only";
  return "unknown_requires_review";
}

export function buildPrescriptionPurposeContributions(input: {
  readonly blocks: readonly { readonly blockId: string; readonly sourceExposureEventId: string;
    readonly purpose: string }[];
  readonly localPurpose: PrescriptionLocalPurpose | null;
  readonly sourceObjectiveIds: readonly string[];
  readonly crossGoalTrace: readonly string[];
}): readonly PrescriptionPurposeContribution[] {
  return Object.freeze(input.blocks.map((block) => {
    const primaryLane = lane(input.localPurpose, block.purpose);
    return Object.freeze({
      contractReference: PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE,
      blockId: block.blockId,
      sourceExposureEventId: block.sourceExposureEventId,
      primaryLane,
      localPurpose: input.localPurpose,
      sourceObjectiveIds: input.sourceObjectiveIds,
      crossGoalTrace: input.crossGoalTrace,
      weeklyCreditCandidate: primaryLane.endsWith("_candidate"),
      systemicConditioningCredit: false,
      completedAdaptationClaimed: false,
      fractionalCoefficient: null,
    });
  }));
}
