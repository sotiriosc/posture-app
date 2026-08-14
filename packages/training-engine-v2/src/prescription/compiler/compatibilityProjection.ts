import type {
  ProductionPrescriptionCompatibilityProjection,
  ProductionPrescriptionDoseBlock,
  PrescriptionRestInstruction,
} from "./contracts";

export function buildPrescriptionCompatibilityProjection(input: {
  readonly blocks: readonly ProductionPrescriptionDoseBlock[];
  readonly restInstructions: readonly PrescriptionRestInstruction[];
  readonly unresolvedRequirementRefs: readonly string[];
}): ProductionPrescriptionCompatibilityProjection {
  if (input.unresolvedRequirementRefs.length > 0 || input.blocks.length === 0) {
    return {
      status: "no_truthful_single_dose_projection",
      projectedDose: null,
      preservedRestInstructionIds: [],
      unresolvedRequirementRefs: [...input.unresolvedRequirementRefs].sort(),
      reasonCode: input.blocks.length === 0
        ? "NO_EXECUTABLE_BLOCK"
        : "UNRESOLVED_REQUIREMENTS_MUST_REMAIN_VISIBLE",
    };
  }
  if (input.blocks.length > 1) {
    return {
      status: "ordered_blocks_required",
      projectedDose: null,
      preservedRestInstructionIds: [],
      unresolvedRequirementRefs: [],
      reasonCode: "MULTI_BLOCK_PLAN_MAY_NOT_BE_FLATTENED",
    };
  }
  const block = input.blocks[0];
  const crossBlockRest = input.restInstructions.some((instruction) =>
    instruction.appliesBeforeBlockId !== undefined ||
    instruction.appliesAfterBlockId !== undefined
  );
  if (crossBlockRest) {
    return {
      status: "legacy_single_dose_projection_available",
      projectedDose: block.dose,
      preservedRestInstructionIds: block.restInstructions.map((entry) => entry.restInstructionId),
      unresolvedRequirementRefs: [],
      reasonCode: "SINGLE_DOSE_AVAILABLE_BUT_EVENT_LEVEL_REST_REMAINS_AUTHORITATIVE",
    };
  }
  return {
    status: "single_uniform_dose_compatible",
    projectedDose: block.dose,
    preservedRestInstructionIds: block.restInstructions.map((entry) => entry.restInstructionId),
    unresolvedRequirementRefs: [],
    reasonCode: "ONE_UNIFORM_BLOCK_TRUTHFULLY_PROJECTS_TO_LEGACY_DOSE",
  };
}
