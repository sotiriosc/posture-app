import { createHash } from "node:crypto";
import type { MachineId } from "../../src/domain/equipment";

export const packageSFingerprint = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value, (_key, nested) => {
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return Object.fromEntries(Object.entries(nested).sort(([left], [right]) =>
        left.localeCompare(right)));
    }
    return nested;
  }, 2)).digest("hex");

export const PACKAGE_S_ID = "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_V1" as const;

export const PACKAGE_S_SELECTED_IDS = Object.freeze([
  "pull-up",
  "hack-squat",
  "seated-leg-curl",
  "machine-chest-fly",
  "machine-hip-adduction",
  "machine-hip-abduction",
  "seated-calf-raise",
  "machine-hip-thrust",
  "cable-lateral-raise",
  "overhead-cable-triceps-extension",
  "straight-arm-cable-pulldown",
] as const);

export const PRE_PACKAGE_S_MACHINE_IDS = Object.freeze([
  "abdominal_crunch",
  "chest_press",
  "row",
  "lat_pulldown",
  "leg_press",
  "leg_curl",
  "reverse_pec_deck",
  "shoulder_press",
  "leg_extension",
] as const satisfies readonly MachineId[]);

export const PACKAGE_S_NEW_MACHINE_IDS = Object.freeze([
  "assisted_pull_up",
  "incline_chest_press",
  "hack_squat",
  "seated_leg_curl",
  "chest_fly",
  "hip_adduction",
  "hip_abduction",
  "seated_calf_raise",
  "hip_thrust",
] as const satisfies readonly MachineId[]);

export const PACKAGE_S_MACHINE_MECHANISM_POLICY = Object.freeze({
  assisted_pull_up: Object.freeze(["selectorized"]),
  incline_chest_press: Object.freeze(["selectorized", "plate_loaded"]),
  hack_squat: Object.freeze(["selectorized", "plate_loaded"]),
  seated_leg_curl: Object.freeze(["selectorized", "plate_loaded"]),
  chest_fly: Object.freeze(["selectorized"]),
  hip_adduction: Object.freeze(["selectorized"]),
  hip_abduction: Object.freeze(["selectorized"]),
  seated_calf_raise: Object.freeze(["selectorized", "plate_loaded"]),
  hip_thrust: Object.freeze(["selectorized", "plate_loaded"]),
} as const);

export const STANDARD_GYM_ONTOLOGY_ANSWERS = Object.freeze([
  "Yes. adjustable-bench-incline is an accepted dumbbell-bench-press Knowledge realization.",
  "Before Pre-G2L it is Knowledge-only; Pre-G2L adds typed engine realization truth.",
  "angleClass, exactDegrees, and an exact bench or machine capability reference carry angle truth.",
  "Yes. Flat and incline remain one dumbbell-bench-press identity.",
  "Yes. Flat and incline machine presses remain one machine-chest-press identity.",
  "Incline machine geometry requires the exact incline_chest_press machine capability, not another exercise ID.",
  "No current scoring rule changes for angle.",
  "Yes. An explicit realization request can select an available incline realization without another identity.",
  "No structured upper-chest specialization receiver exists in this tranche.",
  "Yes. Incline remains available as mechanical realization truth without an upper-chest guarantee.",
  "Yes. Pull-Up assistance remains one identity.",
  "Assistance uses a dedicated magnitude and apparatus record while externalLoad remains null.",
  "Assistance reduction is recorded as future-authority progression availability, never automatic progression.",
  "Yes. Both realizations emit one pull-up identity and one source event.",
  "Yes. Hack Squat truthfully owns squat and knee_dominant roles.",
  "Yes. Seated Leg Curl is distinct from Lying Leg Curl because support and hip position materially differ.",
  "Yes. Machine hip adduction and abduction are distinct machine-supported identities.",
  "Yes. Seated Calf Raise is distinct from Standing Calf Raise.",
  "Yes. Machine Hip Thrust is distinct from floor Glute Bridge.",
  "Yes. Machine Chest Fly is distinct from Cable Chest Fly and Reverse Pec Deck.",
  "Yes. Cable Lateral Raise is distinct from Dumbbell Lateral Raise.",
  "Yes. Overhead Cable Triceps Extension is distinct from pressdown and dumbbell extension paths.",
  "Yes. Straight-Arm Cable Pulldown requires the shoulder_extension action.",
  "Yes. It remains an accessory and never satisfies vertical_pull ownership.",
  "No. Package S changes no unsupported home-pull limitation.",
  "No. Capability IDs are mechanism classes without brand or model identities.",
  "Yes. Barbell identities are not required for truthful owner delivery with the selected 64-row catalog.",
  "Barbells, Smith patterns, back extension, cable hip work, machine arm/delt rows, dips, and power remain audited future work.",
  "Mechanism policy admits only exact reviewed selectorized or plate-loaded realizations per machine capability.",
  "Yes. All 11 selected identities can enter with complete Knowledge in this tranche.",
]);

export const foundationFingerprints = Object.freeze({
  selectedIds: packageSFingerprint(PACKAGE_S_SELECTED_IDS),
  machineIdsBefore: packageSFingerprint(PRE_PACKAGE_S_MACHINE_IDS),
  machineIdsAdded: packageSFingerprint(PACKAGE_S_NEW_MACHINE_IDS),
  machineMechanisms: packageSFingerprint(PACKAGE_S_MACHINE_MECHANISM_POLICY),
  ontologyAnswers: packageSFingerprint(STANDARD_GYM_ONTOLOGY_ANSWERS),
});
