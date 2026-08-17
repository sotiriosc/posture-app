import type { EquipmentEnvironment, MachineId } from "../../domain/equipment";
import type { HomeComfortFamiliarity } from "../homeComfort";

export const STANDARD_GYM_COMFORT_POLICY_CONTRACT = Object.freeze({
  contractId: "STANDARD_GYM_COMFORT_LATE_TIE_POLICY",
  contractVersion: "1.0.0",
} as const);

export interface StandardGymComfortContext {
  readonly environment: EquipmentEnvironment;
  readonly familiarityByExerciseId: Readonly<Record<string, HomeComfortFamiliarity>>;
  readonly productiveContinuityIds: readonly string[];
  readonly availableMachineIds: readonly MachineId[];
}

export interface StandardGymComfortTrace {
  readonly applicable: boolean;
  readonly winnerExerciseId: string | null;
  readonly firstMeaningfulDifference: string | null;
  readonly exactMachineCapabilityConfirmed: boolean;
  readonly productiveAnchorPreserved: boolean;
  readonly weightedScoreApplied: false;
  readonly machineSafetyClaimApplied: false;
  readonly noveltyRewarded: false;
}
