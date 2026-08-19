import type { MachineId } from "../../domain/equipment";

export interface StandardGymComfortProfile {
  readonly exerciseId: string;
  readonly exactMachineId: MachineId;
  readonly setupClarity: "clear" | "machine_specific_review";
  readonly machineMandatory: false;
  readonly machineSaferClaim: false;
  readonly provenance: readonly string[];
}

function profile(
  exerciseId: string,
  exactMachineId: MachineId,
  setupClarity: StandardGymComfortProfile["setupClarity"] = "clear",
): StandardGymComfortProfile {
  return Object.freeze({
    exerciseId,
    exactMachineId,
    setupClarity,
    machineMandatory: false,
    machineSaferClaim: false,
    provenance: Object.freeze([
      "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_OWNER_DECISION",
      "STANDARD_GYM_COMFORT_LATE_TIE_POLICY",
    ]),
  });
}

export const STANDARD_GYM_COMFORT_PROFILES: Readonly<Record<string, StandardGymComfortProfile>> =
  Object.freeze({
    "pull-up": profile("pull-up", "assisted_pull_up", "machine_specific_review"),
    "hack-squat": profile("hack-squat", "hack_squat"),
    "seated-leg-curl": profile("seated-leg-curl", "seated_leg_curl"),
    "machine-chest-fly": profile("machine-chest-fly", "chest_fly"),
    "machine-hip-adduction": profile("machine-hip-adduction", "hip_adduction"),
    "machine-hip-abduction": profile("machine-hip-abduction", "hip_abduction"),
    "seated-calf-raise": profile("seated-calf-raise", "seated_calf_raise"),
    "machine-hip-thrust": profile("machine-hip-thrust", "hip_thrust", "machine_specific_review"),
  });
