import type {
  FinalSequencedSessionDurationInterval,
  ProductionInterExerciseTransitionInstruction,
  SequencingOperationalDurationPolicy,
} from "./contracts";
import type { OperationalDurationComponent } from "../prescription/compiler/contracts";
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
  readonly prescriptionComponents?: readonly OperationalDurationComponent[];
  readonly transitionInstructions: readonly ProductionInterExerciseTransitionInstruction[];
  readonly operationalDurationPolicy?: SequencingOperationalDurationPolicy | null;
  readonly firstAssignmentId?: string | null;
  readonly availableMinutes: number;
  readonly availableCapacityStatus?: "known" | "unknown";
}): FinalSequencedSessionDurationInterval {
  let lower = input.prescriptionLowerBoundSeconds;
  let upper = input.prescriptionUpperBoundSeconds;
  const unknowns = new Set(input.prescriptionUnknownComponents);
  const includedComponents: OperationalDurationComponent[] = [
    ...(input.prescriptionComponents ?? []),
  ];
  if (input.operationalDurationPolicy && input.firstAssignmentId) {
    const initialComponent = (
      kind: "initial_session_setup" | "exercise_setup",
      bound: typeof input.operationalDurationPolicy.initialSessionSetup,
    ): OperationalDurationComponent => Object.freeze({
      componentId: `sequencing-duration:${kind}:${input.firstAssignmentId}`,
      owner: "sequencing" as const,
      kind,
      lowerBoundSeconds: bound.lowerBoundSeconds,
      upperBoundSeconds: bound.upperBoundSeconds,
      policyRef: bound.policyRef,
      classification: bound.classification,
      sourceAssignmentId: input.firstAssignmentId ?? null,
      sourceDoseBlockId: null,
      countedExactlyOnce: true as const,
      provenance: bound.provenance,
    });
    const initial = [
      initialComponent("initial_session_setup", input.operationalDurationPolicy.initialSessionSetup),
      initialComponent("exercise_setup", input.operationalDurationPolicy.initialExerciseSetup),
    ];
    includedComponents.push(...initial);
    lower += initial.reduce((total, entry) => total + entry.lowerBoundSeconds, 0);
    if (upper !== null) {
      upper += initial.reduce((total, entry) => total + entry.upperBoundSeconds, 0);
    }
  }
  const countedTimingFactIds = new Set<string>();
  let timingFactReuseCount = 0;
  for (const instruction of input.transitionInstructions) {
    if (instruction.sourceTransitionFactId && countedTimingFactIds.has(instruction.sourceTransitionFactId)) {
      timingFactReuseCount += 1;
      continue;
    }
    if (instruction.sourceTransitionFactId) countedTimingFactIds.add(instruction.sourceTransitionFactId);
    includedComponents.push(...(instruction.operationalComponents ?? []));
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
  if (input.availableCapacityStatus === "unknown") {
    unknowns.add("available_session_capacity:AVAILABLE_SESSION_CAPACITY_NOT_CONFIRMED");
  }
  const unknownComponents = [...unknowns].sort();
  const capacityKnown = input.availableCapacityStatus !== "unknown";
  const status: FinalSequencedSessionDurationInterval["status"] = capacityKnown && lower > availableSeconds
    ? "definitely_over_budget"
    : upper === null
      ? input.prescriptionUpperBoundSeconds === null
        ? "unknown_due_to_prescription"
        : unknownComponents.some((entry) => entry.startsWith("setup:"))
          ? "unknown_due_to_setup_transition"
          : unknownComponents.some((entry) => entry.startsWith("recovery:"))
            ? "unknown_due_to_interexercise_recovery"
            : "unknown_due_to_section_transition"
      : !capacityKnown
        ? "unknown_due_to_available_capacity"
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
    ...(input.availableCapacityStatus ? {
      availableCapacityStatus: input.availableCapacityStatus,
    } : {}),
    status,
    unknownComponents,
    prescriptionIntervalRefs: [...new Set(input.prescriptionIntervalRefs)].sort(),
    transitionInstructionIds: input.transitionInstructions.map((instruction) => instruction.instructionId),
    ...(input.operationalDurationPolicy ? {
      lowerBoundSeconds: lower,
      upperBoundSeconds: upper,
      completeness: upper === null || unknownComponents.length > 0 ? "unknown" as const : "complete" as const,
      includedComponents: Object.freeze(includedComponents),
      operationalPolicyRefs: [...new Set(includedComponents.map((entry) => entry.policyRef))].sort(),
    } : {}),
    timingFactReuseCount,
    noInventedTime: true,
    provenance: [
      { source: "prescription_contract", sourceRef: "production-prescription-session-duration" },
      { source: "policy", sourceRef: "SESSION_SEQUENCING_POLICY_V1:NO_INVENTED_TIME" },
      ...(input.operationalDurationPolicy ? [input.operationalDurationPolicy.provenance] : []),
    ],
  };
}
