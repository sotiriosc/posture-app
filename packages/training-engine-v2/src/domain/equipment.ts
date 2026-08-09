export type EquipmentEnvironment = "commercial_gym" | "home" | "travel" | "clinic";
export type BenchType = "flat" | "adjustable" | "incline_fixed";
export type BandType = "loop" | "mini_loop" | "tube_handles" | "therapy_flat";
export type AnchorHeight = "low" | "mid" | "high";
export type MachineId =
  | "chest_press"
  | "row"
  | "lat_pulldown"
  | "leg_press"
  | "leg_curl"
  | "reverse_pec_deck"
  | "shoulder_press";

export const EQUIPMENT_CAPABILITY_KEYS = [
  "bodyweight",
  "floor_space",
  "wall",
  "flat_bench",
  "adjustable_bench",
  "box",
  "dumbbells",
  "barbell",
  "squat_rack",
  "cable_stack",
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
}

function hasBandAnchor(equipment: EquipmentCapabilities, height: AnchorHeight): boolean {
  return equipment.bands.anchors.some((anchor) => anchor.height === height);
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
    case "wall":
      return equipment.bodyweight.wallAvailable || equipment.supportSurfaces.includes("wall");
    case "flat_bench":
      return equipment.bench.stable && equipment.bench.types.includes("flat");
    case "adjustable_bench":
      return equipment.bench.stable && equipment.bench.types.includes("adjustable");
    case "box":
      return equipment.supportSurfaces.includes("box");
    case "dumbbells":
      return equipment.dumbbells.available;
    case "barbell":
      return equipment.barbell.available;
    case "squat_rack":
      return equipment.barbell.rackAvailable;
    case "cable_stack":
      return equipment.cables.available;
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

  return {
    satisfied: missingAllOf.length === 0 && oneOfSatisfied && missingMachines.length === 0,
    missingCapabilities: [
      ...missingAllOf,
      ...(oneOfSatisfied ? [] : [`one of: ${oneOf.join(", ")}`]),
      ...missingMachines.map((machineId) => `machine:${machineId}`),
    ],
  };
}
