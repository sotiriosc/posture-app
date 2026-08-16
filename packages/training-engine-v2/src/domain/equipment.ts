export type EquipmentEnvironment = "commercial_gym" | "home" | "travel" | "clinic";
export type BenchType = "flat" | "adjustable" | "incline_fixed";
export type BandType = "loop" | "mini_loop" | "tube_handles" | "therapy_flat";
export type AnchorHeight = "low" | "mid" | "high";
export const MACHINE_IDS = [
  "abdominal_crunch",
  "chest_press",
  "row",
  "lat_pulldown",
  "leg_press",
  "leg_curl",
  "reverse_pec_deck",
  "shoulder_press",
  "leg_extension",
] as const;

export type MachineId = (typeof MACHINE_IDS)[number];

export const EQUIPMENT_CAPABILITY_KEYS = [
  "bodyweight",
  "floor_space",
  "stable_loaded_standing_space",
  "loaded_gait_space",
  "wall",
  "stable_support_surface",
  "flat_bench",
  "adjustable_bench",
  "box",
  "dumbbells",
  "dumbbell_pair",
  "barbell",
  "squat_rack",
  "cable_stack",
  "cable_anchor_low",
  "cable_anchor_mid",
  "cable_anchor_high",
  "selectorized_machine",
  "loop_band",
  "tube_band",
  "band_anchor_low",
  "band_anchor_mid",
  "band_anchor_high",
  "pull_up_bar",
] as const;

export type EquipmentCapabilityKey = (typeof EQUIPMENT_CAPABILITY_KEYS)[number];

export interface DumbbellCapability {
  readonly available: boolean;
  readonly pairAvailable: boolean;
  readonly maxPairWeightKg?: number;
  readonly adjustable: boolean;
}

export interface BarbellCapability {
  readonly available: boolean;
  readonly rackAvailable: boolean;
  readonly maxLoadKg?: number;
}

export interface CableCapability {
  readonly available: boolean;
  readonly adjustableHeight: boolean;
  readonly availableHeights: readonly AnchorHeight[];
}

export interface LoadedGaitCapability {
  readonly available: boolean;
  readonly straightLineMeters?: number;
  readonly turningAvailable?: boolean;
  readonly overheadClearance?: boolean;
}

export interface TrainingSpaceCapability {
  readonly stableLoadedStandingSpace: boolean;
  readonly loadedGait: LoadedGaitCapability;
}

export interface BandAnchorCapability {
  readonly height: AnchorHeight;
  readonly stableFor: "light" | "moderate" | "heavy";
}

export interface BandCapability {
  readonly types: readonly BandType[];
  readonly anchors: readonly BandAnchorCapability[];
}

export interface BenchCapability {
  readonly types: readonly BenchType[];
  readonly stable: boolean;
}

export interface MachineCapability {
  readonly availableMachineIds: readonly MachineId[];
}

export interface BodyweightCapability {
  readonly floorSpace: boolean;
  readonly wallAvailable: boolean;
  readonly pullUpBar: boolean;
}

export interface EquipmentCapabilities {
  readonly environment: EquipmentEnvironment;
  readonly trainingSpace: TrainingSpaceCapability;
  readonly bodyweight: BodyweightCapability;
  readonly bench: BenchCapability;
  readonly dumbbells: DumbbellCapability;
  readonly barbell: BarbellCapability;
  readonly cables: CableCapability;
  readonly bands: BandCapability;
  readonly machines: MachineCapability;
  readonly supportSurfaces: readonly ("box" | "chair" | "stable_table" | "wall")[];
}

export interface EquipmentRequirement {
  readonly id: string;
  readonly label: string;
  readonly allOf?: readonly EquipmentCapabilityKey[];
  readonly oneOf?: readonly EquipmentCapabilityKey[];
  readonly machineIds?: readonly MachineId[];
}

export interface EquipmentRequirementResult {
  readonly satisfied: boolean;
  readonly missingCapabilities: readonly string[];
  readonly trace: EquipmentRequirementTrace;
}

export interface EquipmentCapabilityCheck {
  readonly capability: string;
  readonly requirementKind: "all_of" | "one_of" | "machine_id";
  readonly available: boolean;
}

export interface EquipmentCapabilitySnapshot {
  readonly environment: EquipmentEnvironment;
  readonly stableLoadedStandingSpace: boolean;
  readonly loadedGait: {
    readonly available: boolean;
    readonly straightLineMeters: number | null;
    readonly turningAvailable: boolean | null;
    readonly overheadClearance: boolean | null;
  };
  readonly cable: {
    readonly available: boolean;
    readonly adjustableHeight: boolean;
    readonly availableHeights: readonly AnchorHeight[];
  };
  readonly dumbbells: {
    readonly available: boolean;
    readonly pairAvailable: boolean;
    readonly maxPairWeightKg: number | null;
  };
  readonly availableMachineIds: readonly MachineId[];
}

export interface EquipmentRequirementTrace {
  readonly requirementId: string;
  readonly requestedCapabilities: readonly string[];
  readonly availableCapabilities: readonly string[];
  readonly missingCapabilities: readonly string[];
  readonly checks: readonly EquipmentCapabilityCheck[];
  readonly capabilitySnapshot: EquipmentCapabilitySnapshot;
}

function hasBandAnchor(equipment: EquipmentCapabilities, height: AnchorHeight): boolean {
  return equipment.bands.anchors.some((anchor) => anchor.height === height);
}

function hasCableAnchor(equipment: EquipmentCapabilities, height: AnchorHeight): boolean {
  return equipment.cables.available && equipment.cables.availableHeights.includes(height);
}

export function buildEquipmentCapabilitySnapshot(
  equipment: EquipmentCapabilities,
): EquipmentCapabilitySnapshot {
  return {
    environment: equipment.environment,
    stableLoadedStandingSpace: equipment.trainingSpace.stableLoadedStandingSpace,
    loadedGait: {
      available: equipment.trainingSpace.loadedGait.available,
      straightLineMeters:
        equipment.trainingSpace.loadedGait.straightLineMeters ?? null,
      turningAvailable:
        equipment.trainingSpace.loadedGait.turningAvailable ?? null,
      overheadClearance:
        equipment.trainingSpace.loadedGait.overheadClearance ?? null,
    },
    cable: {
      available: equipment.cables.available,
      adjustableHeight: equipment.cables.adjustableHeight,
      availableHeights: equipment.cables.availableHeights,
    },
    dumbbells: {
      available: equipment.dumbbells.available,
      pairAvailable: equipment.dumbbells.pairAvailable,
      maxPairWeightKg: equipment.dumbbells.maxPairWeightKg ?? null,
    },
    availableMachineIds: equipment.machines.availableMachineIds,
  };
}

export function hasEquipmentCapability(
  equipment: EquipmentCapabilities,
  capability: EquipmentCapabilityKey,
): boolean {
  switch (capability) {
    case "bodyweight":
      return true;
    case "floor_space":
      return equipment.bodyweight.floorSpace;
    case "stable_loaded_standing_space":
      return equipment.trainingSpace.stableLoadedStandingSpace;
    case "loaded_gait_space":
      return equipment.trainingSpace.loadedGait.available;
    case "wall":
      return equipment.bodyweight.wallAvailable || equipment.supportSurfaces.includes("wall");
    case "stable_support_surface":
      return equipment.supportSurfaces.some((surface) =>
        ["wall", "box", "chair", "stable_table"].includes(surface),
      );
    case "flat_bench":
      return equipment.bench.stable && equipment.bench.types.includes("flat");
    case "adjustable_bench":
      return equipment.bench.stable && equipment.bench.types.includes("adjustable");
    case "box":
      return equipment.supportSurfaces.includes("box");
    case "dumbbells":
      return equipment.dumbbells.available;
    case "dumbbell_pair":
      return equipment.dumbbells.available && equipment.dumbbells.pairAvailable;
    case "barbell":
      return equipment.barbell.available;
    case "squat_rack":
      return equipment.barbell.rackAvailable;
    case "cable_stack":
      return equipment.cables.available;
    case "cable_anchor_low":
      return hasCableAnchor(equipment, "low");
    case "cable_anchor_mid":
      return hasCableAnchor(equipment, "mid");
    case "cable_anchor_high":
      return hasCableAnchor(equipment, "high");
    case "selectorized_machine":
      return equipment.machines.availableMachineIds.length > 0;
    case "loop_band":
      return equipment.bands.types.includes("loop") || equipment.bands.types.includes("mini_loop");
    case "tube_band":
      return equipment.bands.types.includes("tube_handles");
    case "band_anchor_low":
      return hasBandAnchor(equipment, "low");
    case "band_anchor_mid":
      return hasBandAnchor(equipment, "mid");
    case "band_anchor_high":
      return hasBandAnchor(equipment, "high");
    case "pull_up_bar":
      return equipment.bodyweight.pullUpBar;
  }
}

export function evaluateEquipmentRequirement(
  equipment: EquipmentCapabilities,
  requirement: EquipmentRequirement,
): EquipmentRequirementResult {
  const missingAllOf = (requirement.allOf ?? []).filter(
    (capability) => !hasEquipmentCapability(equipment, capability),
  );
  const oneOf = requirement.oneOf ?? [];
  const oneOfSatisfied =
    oneOf.length === 0 || oneOf.some((capability) => hasEquipmentCapability(equipment, capability));
  const missingMachines = (requirement.machineIds ?? []).filter(
    (machineId) => !equipment.machines.availableMachineIds.includes(machineId),
  );
  const capabilityChecks: readonly EquipmentCapabilityCheck[] = [
    ...(requirement.allOf ?? []).map((capability) => ({
      capability,
      requirementKind: "all_of" as const,
      available: hasEquipmentCapability(equipment, capability),
    })),
    ...oneOf.map((capability) => ({
      capability,
      requirementKind: "one_of" as const,
      available: hasEquipmentCapability(equipment, capability),
    })),
    ...(requirement.machineIds ?? []).map((machineId) => ({
      capability: `machine:${machineId}`,
      requirementKind: "machine_id" as const,
      available: equipment.machines.availableMachineIds.includes(machineId),
    })),
  ];
  const missingCapabilities = [
    ...missingAllOf,
    ...(oneOfSatisfied ? [] : [`one of: ${oneOf.join(", ")}`]),
    ...missingMachines.map((machineId) => `machine:${machineId}`),
  ];

  return {
    satisfied: missingAllOf.length === 0 && oneOfSatisfied && missingMachines.length === 0,
    missingCapabilities,
    trace: {
      requirementId: requirement.id,
      requestedCapabilities: capabilityChecks.map((check) => check.capability),
      availableCapabilities: capabilityChecks
        .filter((check) => check.available)
        .map((check) => check.capability),
      missingCapabilities,
      checks: capabilityChecks,
      capabilitySnapshot: buildEquipmentCapabilitySnapshot(equipment),
    },
  };
}
