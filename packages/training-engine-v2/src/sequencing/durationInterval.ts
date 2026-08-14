import type {
  FinalSequencedSessionDurationInterval,
  ProductionInterExerciseTransitionInstruction,
} from "./contracts";
import { PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE } from "./contracts";

function targetBounds(
  target: ProductionInterExerciseTransitionInstruction["target"],
): readonly [number, number | null, string | null] {
  if (target.kind === "exact") return [target.seconds, target.seconds, null];
  if (target.kind === "range") return [target.minimumSeconds, target.maximumSeconds, null];
  if (target.kind === "unknown") return [0, null, target.reasonCode];
  return [0, 0, null];
}

export function buildSequencedSessionDurationInterval(input: {
  readonly prescriptionLowerBoundSeconds: number;
  readonly prescriptionUpperBoundSeconds: number | null;
  readonly prescriptionUnknownComponents: readonly string[];
  readonly prescriptionIntervalRefs: readonly string[];
  readonly transitionInstructions: readonly ProductionInterExerciseTransitionInstruction[];
  readonly availableMinutes: number;
}): FinalSequencedSessionDurationInterval {
  let lower = input.prescriptionLowerBoundSeconds;
  let upper = input.prescriptionUpperBoundSeconds;
  const unknowns = new Set(input.prescriptionUnknownComponents);
  const countedTimingFactIds = new Set<string>();
  let timingFactReuseCount = 0;
  for (const instruction of input.transitionInstructions) {
    if (instruction.sourceTransitionFactId && countedTimingFactIds.has(instruction.sourceTransitionFactId)) {
      timingFactReuseCount += 1;
      continue;
    }
    if (instruction.sourceTransitionFactId) countedTimingFactIds.add(instruction.sourceTransitionFactId);
    const [instructionLower, rawInstructionUpper, rawUnknown] = targetBounds(instruction.target);
    const physicalDurationStillUnknown = instruction.target.kind === "not_prescribed" &&
      instruction.type !== "recovery";
    const instructionUpper = physicalDurationStillUnknown ? null : rawInstructionUpper;
    const unknown = physicalDurationStillUnknown
      ? `${instruction.type.toUpperCase()}_DURATION_NOT_EXPLICIT`
      : rawUnknown;
    lower += instructionLower;
    if (upper !== null && instructionUpper !== null) upper += instructionUpper;
    else if (instructionUpper === null) upper = null;
    if (unknown) unknowns.add(`${instruction.type}:${unknown}`);
  }
  const availableSeconds = input.availableMinutes * 60;
  const unknownComponents = [...unknowns].sort();
  const status: FinalSequencedSessionDurationInterval["status"] = lower > availableSeconds
    ? "definitely_over_budget"
    : upper === null
      ? input.prescriptionUpperBoundSeconds === null
        ? "unknown_due_to_prescription"
        : unknownComponents.some((entry) => entry.startsWith("setup:"))
          ? "unknown_due_to_setup_transition"
          : unknownComponents.some((entry) => entry.startsWith("recovery:"))
            ? "unknown_due_to_interexercise_recovery"
            : "unknown_due_to_section_transition"
      : upper > availableSeconds
        ? "possibly_over_budget"
        : lower === upper
          ? "fully_determinable"
          : "fits_known_bound";
  return {
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    availableSeconds,
    status,
    unknownComponents,
    prescriptionIntervalRefs: [...new Set(input.prescriptionIntervalRefs)].sort(),
    transitionInstructionIds: input.transitionInstructions.map((instruction) => instruction.instructionId),
    timingFactReuseCount,
    noInventedTime: true,
    provenance: [
      { source: "prescription_contract", sourceRef: "production-prescription-session-duration" },
      { source: "policy", sourceRef: "SESSION_SEQUENCING_POLICY_V1:NO_INVENTED_TIME" },
    ],
  };
}
