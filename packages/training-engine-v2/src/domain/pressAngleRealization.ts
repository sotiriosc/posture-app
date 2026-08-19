import type { BenchType, EquipmentCapabilities, MachineId } from "./equipment";

export const PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT = Object.freeze({
  contractId: "PRESS_SUPPORT_ANGLE_REALIZATION",
  contractVersion: "1.0.0",
} as const);

export const PRESS_SUPPORT_ANGLE_CLASSES = Object.freeze([
  "flat",
  "incline",
  "fixed_machine_incline",
  "unknown",
] as const);

export type PressSupportAngleClass = (typeof PRESS_SUPPORT_ANGLE_CLASSES)[number];

export type PressSupportCapabilityReference =
  | Readonly<{ kind: "bench"; benchType: BenchType }>
  | Readonly<{ kind: "machine"; machineId: MachineId }>;

export interface PressSupportAngleRealization {
  readonly contract: typeof PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT;
  readonly exerciseId: "dumbbell-bench-press" | "machine-chest-press";
  readonly realizationId: string;
  readonly angleClass: PressSupportAngleClass;
  readonly exactDegrees: number | null;
  readonly supportEquipmentId: string;
  readonly capabilityReference: PressSupportCapabilityReference;
  readonly compatibleSections: readonly ("main" | "accessory")[];
  readonly compatibleRoles: readonly ("primary_strength" | "secondary_strength")[];
  readonly compatiblePurposes: readonly string[];
  readonly source: "owner_decision";
  readonly reviewState: "accepted";
  readonly provenance: readonly {
    readonly sourceRef: string;
    readonly evidenceBasis: readonly string[];
  }[];
}

const OWNER_REF =
  "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md";

function realization(
  input: Omit<PressSupportAngleRealization, "contract" | "source" | "reviewState" | "provenance">,
): PressSupportAngleRealization {
  return Object.freeze({
    contract: PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT,
    ...input,
    source: "owner_decision",
    reviewState: "accepted",
    provenance: Object.freeze([{
      sourceRef: OWNER_REF,
      evidenceBasis: Object.freeze([
        `${input.realizationId} is owner-authorized typed press-support angle truth for ${input.exerciseId}.`,
        "Angle class does not create a second exercise identity, scoring bonus, or automatic rotation axis.",
      ]),
    }]),
  });
}

const commonPurposes = Object.freeze([
  "horizontal_press_strength",
  "horizontal_press_hypertrophy",
]);

export const DUMBBELL_BENCH_PRESS_ANGLE_REALIZATIONS = Object.freeze([
  realization({
    exerciseId: "dumbbell-bench-press",
    realizationId: "flat-bench",
    angleClass: "flat",
    exactDegrees: null,
    supportEquipmentId: "stable-flat-bench",
    capabilityReference: Object.freeze({ kind: "bench", benchType: "flat" }),
    compatibleSections: Object.freeze(["main", "accessory"]),
    compatibleRoles: Object.freeze(["primary_strength", "secondary_strength"]),
    compatiblePurposes: commonPurposes,
  }),
  realization({
    exerciseId: "dumbbell-bench-press",
    realizationId: "adjustable-bench-incline",
    angleClass: "incline",
    exactDegrees: null,
    supportEquipmentId: "stable-adjustable-bench",
    capabilityReference: Object.freeze({ kind: "bench", benchType: "adjustable" }),
    compatibleSections: Object.freeze(["main", "accessory"]),
    compatibleRoles: Object.freeze(["primary_strength", "secondary_strength"]),
    compatiblePurposes: commonPurposes,
  }),
  realization({
    exerciseId: "dumbbell-bench-press",
    realizationId: "fixed-incline-bench",
    angleClass: "incline",
    exactDegrees: null,
    supportEquipmentId: "stable-fixed-incline-bench",
    capabilityReference: Object.freeze({ kind: "bench", benchType: "incline_fixed" }),
    compatibleSections: Object.freeze(["main", "accessory"]),
    compatibleRoles: Object.freeze(["primary_strength", "secondary_strength"]),
    compatiblePurposes: commonPurposes,
  }),
]);

export const MACHINE_CHEST_PRESS_ANGLE_REALIZATIONS = Object.freeze([
  realization({
    exerciseId: "machine-chest-press",
    realizationId: "flat-machine",
    angleClass: "flat",
    exactDegrees: null,
    supportEquipmentId: "machine:chest_press",
    capabilityReference: Object.freeze({ kind: "machine", machineId: "chest_press" }),
    compatibleSections: Object.freeze(["main", "accessory"]),
    compatibleRoles: Object.freeze(["primary_strength", "secondary_strength"]),
    compatiblePurposes: commonPurposes,
  }),
  realization({
    exerciseId: "machine-chest-press",
    realizationId: "fixed-machine-incline",
    angleClass: "fixed_machine_incline",
    exactDegrees: null,
    supportEquipmentId: "machine:incline_chest_press",
    capabilityReference: Object.freeze({ kind: "machine", machineId: "incline_chest_press" }),
    compatibleSections: Object.freeze(["main", "accessory"]),
    compatibleRoles: Object.freeze(["primary_strength", "secondary_strength"]),
    compatiblePurposes: commonPurposes,
  }),
]);

export const PRESS_SUPPORT_ANGLE_REALIZATIONS = Object.freeze([
  ...DUMBBELL_BENCH_PRESS_ANGLE_REALIZATIONS,
  ...MACHINE_CHEST_PRESS_ANGLE_REALIZATIONS,
]);

export function validatePressSupportAngleRealization(
  value: PressSupportAngleRealization,
): readonly string[] {
  const findings: string[] = [];
  if (value.contract.contractId !== PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT.contractId ||
      value.contract.contractVersion !== PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT.contractVersion) {
    findings.push("PRESS_ANGLE_CONTRACT_INVALID");
  }
  if (!PRESS_SUPPORT_ANGLE_CLASSES.includes(value.angleClass)) {
    findings.push("PRESS_ANGLE_CLASS_INVALID");
  }
  if (value.exactDegrees !== null &&
      (!Number.isFinite(value.exactDegrees) || value.exactDegrees < 0)) {
    findings.push("PRESS_ANGLE_EXACT_DEGREES_INVALID");
  }
  if (value.angleClass === "fixed_machine_incline" &&
      value.capabilityReference.kind !== "machine") {
    findings.push("FIXED_MACHINE_INCLINE_REQUIRES_MACHINE_CAPABILITY");
  }
  if (value.exerciseId === "dumbbell-bench-press" &&
      value.capabilityReference.kind !== "bench") {
    findings.push("DUMBBELL_PRESS_REQUIRES_BENCH_CAPABILITY");
  }
  if (value.exerciseId === "machine-chest-press" &&
      value.capabilityReference.kind !== "machine") {
    findings.push("MACHINE_PRESS_REQUIRES_MACHINE_CAPABILITY");
  }
  if (value.provenance.length === 0 || !value.realizationId.trim()) {
    findings.push("PRESS_ANGLE_PROVENANCE_AND_ID_REQUIRED");
  }
  return Object.freeze([...new Set(findings)].sort());
}

export function pressSupportAngleRealizationAvailable(
  value: PressSupportAngleRealization,
  equipment: EquipmentCapabilities,
): boolean {
  if (value.capabilityReference.kind === "bench") {
    return equipment.bench.stable &&
      equipment.bench.types.includes(value.capabilityReference.benchType);
  }
  return equipment.machines.availableMachineIds.includes(
    value.capabilityReference.machineId,
  );
}

export interface PressSupportAngleResolution {
  readonly exerciseId: PressSupportAngleRealization["exerciseId"];
  readonly selected: PressSupportAngleRealization | null;
  readonly selectionSource: "explicit_preference" | "productive_continuity" | "none";
  readonly automaticRotationApplied: false;
  readonly upperChestGuaranteeApplied: false;
  readonly reasonCodes: readonly string[];
}

export function resolvePressSupportAngleRealization(input: {
  readonly exerciseId: PressSupportAngleRealization["exerciseId"];
  readonly explicitRealizationId: string | null;
  readonly currentProductiveRealizationId: string | null;
  readonly equipment: EquipmentCapabilities;
}): PressSupportAngleResolution {
  const available = PRESS_SUPPORT_ANGLE_REALIZATIONS.filter(
    (value) => value.exerciseId === input.exerciseId &&
      pressSupportAngleRealizationAvailable(value, input.equipment),
  );
  const requested = input.explicitRealizationId
    ? available.find((value) => value.realizationId === input.explicitRealizationId) ?? null
    : null;
  const current = input.currentProductiveRealizationId
    ? available.find((value) => value.realizationId === input.currentProductiveRealizationId) ?? null
    : null;
  const selected = requested ?? current;
  return Object.freeze({
    exerciseId: input.exerciseId,
    selected,
    selectionSource: requested
      ? "explicit_preference"
      : current
        ? "productive_continuity"
        : "none",
    automaticRotationApplied: false,
    upperChestGuaranteeApplied: false,
    reasonCodes: Object.freeze(selected
      ? [requested ? "EXPLICIT_REALIZATION_AVAILABLE" : "PRODUCTIVE_CONTINUITY_PRESERVED"]
      : [input.explicitRealizationId
          ? "EXPLICIT_REALIZATION_CAPABILITY_UNAVAILABLE"
          : "NO_EXPLICIT_OR_CONTINUITY_REALIZATION"]),
  });
}
