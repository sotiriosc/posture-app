import {
  normalizeEquipmentSelection,
  normalizeEquipmentSelectionValues,
  type EquipmentSelection,
} from "@/lib/equipment";

import {
  resolvePrimaryProgramEquipmentMode,
  type PrimaryProgramEquipmentMode,
} from "@/lib/program/equipmentMode";

/**
 * Explicit physical capabilities derived from confirmed questionnaire /
 * normalized equipment selections. Unknown support details stay false.
 *
 * Floor space and a wall are the only bodyweight assumptions allowed without
 * an explicit questionnaire token (see PROGRAM_EQUIPMENT_EXPERIENCE_V2 §4.3).
 */
export type ProgramCapabilities = {
  hasDumbbells: boolean;
  hasBands: boolean;
  hasBench: boolean;
  hasPullupBar: boolean;
  hasFoamRoller: boolean;
  hasBarbell: boolean;
  hasKettlebell: boolean;
  hasCables: boolean;
  hasMachines: boolean;
  /** True only when gym access is selected (expands facility inventory). */
  hasGymAccess: boolean;
  /**
   * Band construction / anchor details are not collected yet.
   * Remain false until the questionnaire confirms them.
   */
  hasLoopBand: boolean;
  hasLongBand: boolean;
  hasDoorAnchor: boolean;
  hasHighAnchor: boolean;
  hasMidAnchor: boolean;
  hasLowAnchor: boolean;
  /** Assumed for all Praxis environments; not a support-equipment claim. */
  hasFloorSpace: boolean;
  /** Assumed for all Praxis environments; not a support-equipment claim. */
  hasWall: boolean;
  /**
   * True when the primary mode is bodyweight (floor/wall environment without
   * meaningful external training load tools).
   */
  isFloorWallBodyweightEnvironment: boolean;
  /**
   * Optional future questionnaire signal. Undefined means unknown — never
   * invent a true value.
   */
  canIncreaseDumbbellLoad?: boolean;
};

export type ProgramEquipmentContext = {
  primaryMode: PrimaryProgramEquipmentMode;
  normalizedSelection: EquipmentSelection[];
  available: EquipmentSelection[];
  hasGym: boolean;
  capabilities: ProgramCapabilities;
};

const hasToken = (
  normalized: ReadonlySet<EquipmentSelection>,
  token: EquipmentSelection
) => normalized.has(token);

/**
 * Derive confirmed capabilities only.
 *
 * - Gym selection expands facility inventory (dumbbells/barbell/kettlebell/
 *   cables/machines/bench) via existing normalizeEquipmentSelection rules.
 * - Band anchor / loop / long-band details stay false (unknown).
 * - Pull-up bar and foam roller require explicit tokens (gym does not imply them).
 * - Floor + wall are the only always-on bodyweight assumptions.
 */
export function deriveProgramCapabilities(
  selection: readonly string[]
): ProgramCapabilities {
  const normalizedValues = normalizeEquipmentSelectionValues([...selection]);
  const { available, hasGym } = normalizeEquipmentSelection([...selection]);
  const selected = new Set(normalizedValues);
  const availableSet = available;

  const hasBands = hasToken(selected, "bands") || availableSet.has("bands");
  const hasDumbbells =
    hasToken(selected, "dumbbells") || availableSet.has("dumbbells");
  const primaryMode = resolvePrimaryProgramEquipmentMode(selection);

  return {
    hasDumbbells,
    hasBands,
    hasBench: availableSet.has("bench") || hasToken(selected, "bench"),
    hasPullupBar:
      availableSet.has("pullup_bar") || hasToken(selected, "pullup_bar"),
    hasFoamRoller:
      availableSet.has("foam_roller") || hasToken(selected, "foam_roller"),
    hasBarbell: availableSet.has("barbell") || hasToken(selected, "barbell"),
    hasKettlebell:
      availableSet.has("kettlebell") || hasToken(selected, "kettlebell"),
    hasCables: availableSet.has("cables") || hasToken(selected, "cables"),
    hasMachines: availableSet.has("machines") || hasToken(selected, "machines"),
    hasGymAccess: hasGym,
    hasLoopBand: false,
    hasLongBand: false,
    hasDoorAnchor: false,
    hasHighAnchor: false,
    hasMidAnchor: false,
    hasLowAnchor: false,
    hasFloorSpace: true,
    hasWall: true,
    isFloorWallBodyweightEnvironment: primaryMode === "bodyweight",
    canIncreaseDumbbellLoad: undefined,
  };
}

export function buildProgramEquipmentContext(
  selection: readonly string[]
): ProgramEquipmentContext {
  const normalizedSelection = normalizeEquipmentSelectionValues([...selection]);
  const { available, hasGym } = normalizeEquipmentSelection([...selection]);
  return {
    primaryMode: resolvePrimaryProgramEquipmentMode(selection),
    normalizedSelection,
    available: Array.from(available).sort() as EquipmentSelection[],
    hasGym,
    capabilities: deriveProgramCapabilities(selection),
  };
}

/**
 * Supports that an exercise appears to require, for audit/comparison only.
 * Never used to invent questionnaire capabilities.
 */
export function inferExerciseSupportRequirements(input: {
  exerciseId: string;
  name: string;
  equipment: readonly string[];
  cues?: readonly string[];
  mistakes?: readonly string[];
  tags?: readonly string[];
  variantKey?: string | null;
}): string[] {
  const supports = new Set<string>();
  const blob = [
    input.exerciseId,
    input.name,
    ...(input.cues ?? []),
    ...(input.mistakes ?? []),
    ...(input.tags ?? []),
    input.variantKey ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const equipment = new Set(input.equipment.map((item) => item.toLowerCase()));

  if (equipment.has("bench")) supports.add("bench");
  if (equipment.has("pullup_bar")) supports.add("pullup_bar");
  if (equipment.has("foam_roller")) supports.add("foam_roller");
  if (equipment.has("cables")) supports.add("cable_stack");
  if (equipment.has("machines")) supports.add("machine");
  if (blob.includes("high anchor") || blob.includes("high_anchor") || blob.includes("above eye")) {
    supports.add("high_band_anchor");
  }
  if (blob.includes("door anchor") || blob.includes("door_anchor") || blob.includes("doorway")) {
    supports.add("door_anchor_or_doorway");
  }
  if (equipment.has("bands") && blob.includes("anchor")) {
    supports.add("band_anchor");
  }
  if (
    equipment.has("bands") &&
    (blob.includes("pulldown") ||
      blob.includes("face pull") ||
      blob.includes("face-pull") ||
      blob.includes("woodchop") ||
      blob.includes("pallof"))
  ) {
    supports.add("band_anchor");
  }
  if (
    equipment.has("bands") &&
    (blob.includes("lat pulldown") ||
      blob.includes("lat-pulldown") ||
      blob.includes("pulldown"))
  ) {
    supports.add("high_band_anchor");
  }
  return Array.from(supports).sort();
}

export function isSupportConfirmedByCapabilities(
  support: string,
  capabilities: ProgramCapabilities
): boolean {
  switch (support) {
    case "bench":
      return capabilities.hasBench;
    case "pullup_bar":
      return capabilities.hasPullupBar;
    case "foam_roller":
      return capabilities.hasFoamRoller;
    case "cable_stack":
      return capabilities.hasCables;
    case "machine":
      return capabilities.hasMachines;
    case "high_band_anchor":
      return capabilities.hasHighAnchor;
    case "band_anchor":
      return (
        capabilities.hasHighAnchor ||
        capabilities.hasMidAnchor ||
        capabilities.hasLowAnchor ||
        capabilities.hasDoorAnchor
      );
    case "door_anchor_or_doorway":
      return capabilities.hasDoorAnchor;
    default:
      return false;
  }
}
