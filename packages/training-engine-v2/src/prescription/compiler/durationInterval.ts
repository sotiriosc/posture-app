import type { ExerciseDose } from "../dose";
import type {
  OperationalDurationBound,
  OperationalDurationComponent,
  PrescriptionDurationInterval,
  PrescriptionDurationUnknownComponent,
  PrescriptionOperationalDurationPolicy,
  PrescriptionOperationalExecutionTimingClass,
  PrescriptionRestInstruction,
} from "./contracts";
import { numericBounds, productionProvenance, stableId, uniqueSorted } from "./utilities";

const EXPLICIT_DURATION_POLICY_REF = "PRESCRIPTION_EXPLICIT_DURATION_EVIDENCE_POLICY@1.0.0";

function component(input: {
  readonly kind: OperationalDurationComponent["kind"];
  readonly lower: number;
  readonly upper: number;
  readonly policyRef: string;
  readonly classification: OperationalDurationComponent["classification"];
  readonly assignmentId?: string;
  readonly blockId?: string;
  readonly sourceRef: string;
  readonly provenance?: OperationalDurationBound["provenance"];
}): OperationalDurationComponent {
  return Object.freeze({
    componentId: stableId("prescription-duration-component", {
      kind: input.kind,
      assignmentId: input.assignmentId ?? null,
      blockId: input.blockId ?? null,
      sourceRef: input.sourceRef,
    }),
    owner: "prescription",
    kind: input.kind,
    lowerBoundSeconds: input.lower,
    upperBoundSeconds: input.upper,
    policyRef: input.policyRef,
    classification: input.classification,
    sourceAssignmentId: input.assignmentId ?? null,
    sourceDoseBlockId: input.blockId ?? null,
    countedExactlyOnce: true,
    provenance: input.provenance ?? productionProvenance(input.sourceRef),
  });
}

function restBounds(
  instructions: readonly PrescriptionRestInstruction[],
  dose: ExerciseDose,
  context: { readonly assignmentId?: string; readonly blockId?: string },
): { readonly lower: number; readonly upper: number; readonly unknown: boolean;
  readonly components: readonly OperationalDurationComponent[] } {
  let lower = 0;
  let upper = 0;
  let unknown = false;
  const components: OperationalDurationComponent[] = [];
  for (const instruction of instructions) {
    const bounds = numericBounds(instruction.target);
    if (!bounds) {
      if (instruction.target.kind === "unknown") unknown = true;
      continue;
    }
    const repetitions = instruction.appliesWithinBlockId
      ? repeatedRestCount(dose, instruction.placement)
      : [1, 1] as const;
    const componentLower = bounds[0] * repetitions[0];
    const componentUpper = bounds[1] * repetitions[1];
    lower += componentLower;
    upper += componentUpper;
    components.push(component({
      kind: "prescribed_rest",
      lower: componentLower,
      upper: componentUpper,
      policyRef: EXPLICIT_DURATION_POLICY_REF,
      classification: "evidence_backed",
      assignmentId: context.assignmentId,
      blockId: context.blockId,
      sourceRef: instruction.provenance.sourceRef,
      provenance: instruction.provenance,
    }));
  }
  return { lower, upper, unknown, components };
}

function repeatedRestCount(
  dose: ExerciseDose,
  placement: PrescriptionRestInstruction["placement"],
): readonly [number, number] {
  const target = placement === "between_rounds" && dose.mode === "breath_cycles"
    ? dose.rounds
    : placement === "between_trips" && (dose.mode === "distance_carry" || dose.mode === "timed_carry")
      ? dose.trips
      : (placement === "between_sets" || placement === "between_developmental_sets") && "sets" in dose
        ? dose.sets
        : null;
  const bounds = numericBounds(target);
  return bounds
    ? [Math.max(0, bounds[0] - 1), Math.max(0, bounds[1] - 1)]
    : [1, 1];
}

function phaseBounds(
  dose: Extract<ExerciseDose, { readonly mode: "repetition_sets" }>,
): readonly [number, number] | null {
  if (dose.tempo?.kind !== "repetition_phase_tempo") return null;
  let lower = 0;
  let upper = 0;
  for (const target of [
    dose.tempo.eccentric,
    dose.tempo.lengthenedTransition,
    dose.tempo.concentric,
    dose.tempo.shortenedTransition,
  ]) {
    if (target.kind === "exact_seconds") {
      lower += target.seconds;
      upper += target.seconds;
    } else if (target.kind === "seconds_range") {
      lower += target.minSeconds;
      upper += target.maxSeconds;
    } else if (target.kind !== "not_prescribed") {
      return null;
    }
  }
  return [lower, upper];
}

export function buildPrescriptionDurationInterval(input: {
  readonly dose: ExerciseDose;
  readonly restInstructions: readonly PrescriptionRestInstruction[];
  readonly availableSeconds?: number;
  readonly includeSequencingUnknowns?: boolean;
  readonly operationalPolicy?: PrescriptionOperationalDurationPolicy | null;
  readonly executionTimingClass?: PrescriptionOperationalExecutionTimingClass | null;
  readonly assignmentId?: string;
  readonly blockId?: string;
}): PrescriptionDurationInterval {
  const unknown: PrescriptionDurationUnknownComponent[] = [];
  const includedComponents: OperationalDurationComponent[] = [];
  let lower = 0;
  let upper: number | null = 0;
  const rests = restBounds(input.restInstructions, input.dose, {
    assignmentId: input.assignmentId,
    blockId: input.blockId,
  });
  lower += rests.lower;
  upper += rests.upper;
  includedComponents.push(...rests.components);
  if (rests.unknown) {
    unknown.push("rest");
    upper = null;
  }

  const addWork = (inputComponent: {
    readonly lower: number;
    readonly upper: number;
    readonly bound?: OperationalDurationBound;
    readonly sourceRef: string;
  }) => {
    lower += inputComponent.lower;
    if (upper !== null) upper += inputComponent.upper;
    includedComponents.push(component({
      kind: "dose_execution",
      lower: inputComponent.lower,
      upper: inputComponent.upper,
      policyRef: inputComponent.bound?.policyRef ?? EXPLICIT_DURATION_POLICY_REF,
      classification: inputComponent.bound?.classification ?? "evidence_backed",
      assignmentId: input.assignmentId,
      blockId: input.blockId,
      sourceRef: inputComponent.sourceRef,
      provenance: inputComponent.bound?.provenance,
    }));
  };
  const sideMultiplier = input.dose.laterality?.kind === "each_side" ||
    ("perSide" in input.dose && input.dose.perSide) ? 2 : 1;
  const operationalRepetitionBound = input.operationalPolicy && input.executionTimingClass
    ? input.operationalPolicy.executionSecondsPerRepetition[input.executionTimingClass]
    : null;

  switch (input.dose.mode) {
    case "repetition_sets": {
      const sets = numericBounds(input.dose.sets);
      const repetitions = numericBounds(input.dose.repetitions);
      const phases = phaseBounds(input.dose);
      if (sets && repetitions && phases) {
        addWork({
          lower: sets[0] * repetitions[0] * phases[0] * sideMultiplier,
          upper: sets[1] * repetitions[1] * phases[1] * sideMultiplier,
          sourceRef: `${EXPLICIT_DURATION_POLICY_REF}:repetition-phase-tempo`,
        });
      } else if (sets && repetitions && operationalRepetitionBound) {
        addWork({
          lower: sets[0] * repetitions[0] * operationalRepetitionBound.lowerBoundSeconds * sideMultiplier,
          upper: sets[1] * repetitions[1] * operationalRepetitionBound.upperBoundSeconds * sideMultiplier,
          bound: operationalRepetitionBound,
          sourceRef: operationalRepetitionBound.provenance.sourceRef,
        });
      } else {
        unknown.push("repetition_tempo");
        upper = null;
      }
      break;
    }
    case "timed_hold": {
      const sets = numericBounds(input.dose.sets);
      const duration = numericBounds(input.dose.duration);
      if (sets && duration) {
        addWork({
          lower: sets[0] * duration[0] * sideMultiplier,
          upper: sets[1] * duration[1] * sideMultiplier,
          sourceRef: `${EXPLICIT_DURATION_POLICY_REF}:timed-hold`,
        });
      } else {
        unknown.push("rest");
        upper = null;
      }
      break;
    }
    case "breath_cycles": {
      const rounds = numericBounds(input.dose.rounds);
      const cycles = numericBounds(input.dose.breathCycles);
      const cadence = input.dose.breathingCadence;
      if (rounds && cycles && cadence?.kind === "structured_breathing_cadence") {
        const phases = [cadence.inhale, cadence.exhale, cadence.postInhalePause, cadence.postExhalePause]
          .filter((target) => target !== undefined);
        let cadenceLower = 0;
        let cadenceUpper = 0;
        let cadenceKnown = true;
        for (const target of phases) {
          if (target.kind === "exact_seconds") {
            cadenceLower += target.seconds;
            cadenceUpper += target.seconds;
          } else if (target.kind === "seconds_range") {
            cadenceLower += target.minSeconds;
            cadenceUpper += target.maxSeconds;
          } else if (target.kind !== "not_prescribed") {
            cadenceKnown = false;
          }
        }
        if (cadenceKnown && phases.length >= 2) {
          addWork({
            lower: rounds[0] * cycles[0] * cadenceLower,
            upper: rounds[1] * cycles[1] * cadenceUpper,
            sourceRef: `${EXPLICIT_DURATION_POLICY_REF}:structured-breathing-cadence`,
          });
        } else if (input.operationalPolicy) {
          const bound = input.operationalPolicy.secondsPerBreathCycle;
          addWork({
            lower: rounds[0] * cycles[0] * bound.lowerBoundSeconds,
            upper: rounds[1] * cycles[1] * bound.upperBoundSeconds,
            bound,
            sourceRef: bound.provenance.sourceRef,
          });
        } else {
          unknown.push("breathing_cadence");
          upper = null;
        }
      } else if (rounds && cycles && input.operationalPolicy) {
        const bound = input.operationalPolicy.secondsPerBreathCycle;
        addWork({
          lower: rounds[0] * cycles[0] * bound.lowerBoundSeconds,
          upper: rounds[1] * cycles[1] * bound.upperBoundSeconds,
          bound,
          sourceRef: bound.provenance.sourceRef,
        });
      } else {
        unknown.push("breathing_cadence");
        upper = null;
      }
      break;
    }
    case "distance_carry": {
      const trips = numericBounds(input.dose.trips);
      const distance = numericBounds(input.dose.distancePerTrip);
      if (trips && distance && input.operationalPolicy) {
        const bound = input.operationalPolicy.secondsPerMetre;
        addWork({
          lower: trips[0] * distance[0] * bound.lowerBoundSeconds,
          upper: trips[1] * distance[1] * bound.upperBoundSeconds,
          bound,
          sourceRef: bound.provenance.sourceRef,
        });
      } else {
        unknown.push("locomotor_pace");
        upper = null;
      }
      break;
    }
    case "timed_carry": {
      const trips = numericBounds(input.dose.trips);
      const duration = numericBounds(input.dose.durationPerTrip);
      if (trips && duration) {
        addWork({
          lower: trips[0] * duration[0],
          upper: trips[1] * duration[1],
          sourceRef: `${EXPLICIT_DURATION_POLICY_REF}:timed-carry`,
        });
      } else {
        unknown.push("rest");
        upper = null;
      }
      break;
    }
    case "step_march": {
      const duration = numericBounds(input.dose.duration);
      const sets = numericBounds(input.dose.sets);
      if (duration) {
        addWork({
          lower: (sets?.[0] ?? 1) * duration[0],
          upper: (sets?.[1] ?? 1) * duration[1],
          sourceRef: `${EXPLICIT_DURATION_POLICY_REF}:timed-step-march`,
        });
      } else if (input.dose.steps && input.operationalPolicy) {
        const steps = numericBounds(input.dose.steps);
        const bound = input.operationalPolicy.secondsPerStep;
        if (steps) addWork({
          lower: (sets?.[0] ?? 1) * steps[0] * bound.lowerBoundSeconds,
          upper: (sets?.[1] ?? 1) * steps[1] * bound.upperBoundSeconds,
          bound,
          sourceRef: bound.provenance.sourceRef,
        });
        else {
          unknown.push("step_cadence");
          upper = null;
        }
      } else {
        unknown.push("step_cadence");
        upper = null;
      }
      break;
    }
    case "step_sets": {
      const sets = numericBounds(input.dose.sets);
      const steps = numericBounds(input.dose.steps);
      if (sets && steps && input.operationalPolicy) {
        const bound = input.operationalPolicy.secondsPerStep;
        addWork({
          lower: sets[0] * steps[0] * bound.lowerBoundSeconds * sideMultiplier,
          upper: sets[1] * steps[1] * bound.upperBoundSeconds * sideMultiplier,
          bound,
          sourceRef: bound.provenance.sourceRef,
        });
      } else {
        unknown.push("step_cadence");
        upper = null;
      }
      break;
    }
  }

  if (
    sideMultiplier === 2 &&
    !input.restInstructions.some((instruction) => instruction.placement === "between_sides")
  ) {
    if (input.operationalPolicy) {
      const bound = input.operationalPolicy.sideTransition;
      lower += bound.lowerBoundSeconds;
      if (upper !== null) upper += bound.upperBoundSeconds;
      includedComponents.push(component({
        kind: "side_transition",
        lower: bound.lowerBoundSeconds,
        upper: bound.upperBoundSeconds,
        policyRef: bound.policyRef,
        classification: bound.classification,
        assignmentId: input.assignmentId,
        blockId: input.blockId,
        sourceRef: bound.provenance.sourceRef,
        provenance: bound.provenance,
      }));
    } else {
      unknown.push("side_transition");
      upper = null;
    }
  }
  if (input.includeSequencingUnknowns) {
    unknown.push("sequencing_setup", "sequencing_transition", "sequencing_recovery");
    upper = null;
  }
  const unknownComponents = uniqueSorted(unknown) as readonly PrescriptionDurationUnknownComponent[];
  let status: PrescriptionDurationInterval["status"];
  if (input.availableSeconds !== undefined && lower > input.availableSeconds) {
    status = "definitely_over_budget";
  } else if (
    input.availableSeconds !== undefined &&
    upper !== null &&
    upper > input.availableSeconds
  ) {
    status = "possibly_over_budget";
  } else if (input.includeSequencingUnknowns) {
    status = "unknown_due_to_sequencing";
  } else if (unknownComponents.includes("repetition_tempo")) {
    status = "unknown_due_to_repetition_tempo";
  } else if (unknownComponents.includes("breathing_cadence")) {
    status = "unknown_due_to_breathing_cadence";
  } else if (unknownComponents.includes("locomotor_pace")) {
    status = "unknown_due_to_locomotor_pace";
  } else if (unknownComponents.includes("step_cadence")) {
    status = "unknown_due_to_step_cadence";
  } else if (unknownComponents.includes("rest")) {
    status = "unknown_due_to_rest";
  } else if (unknownComponents.includes("side_transition")) {
    status = "unknown_due_to_side_transition";
  } else if (upper === lower) {
    status = "fully_determinable_before_sequencing";
  } else if (upper !== null) {
    status = input.availableSeconds !== undefined && upper <= input.availableSeconds
      ? "fits_known_prescription_bound"
      : "bounded_before_sequencing";
  } else {
    status = "bounded_before_sequencing";
  }
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    unknownComponents,
    status,
    ...(input.operationalPolicy ? {
      includedComponents: Object.freeze(includedComponents),
      operationalPolicyRefs: uniqueSorted(includedComponents.map((entry) => entry.policyRef)),
    } : {}),
    provenance: productionProvenance(
      `prescription-compiler:duration:${input.dose.mode}`,
      input.operationalPolicy
        ? "Prescribed work/rest plus reviewed operational feasibility bounds; visible coaching tempo is unchanged."
        : "Only explicit work timing and explicitly placed rest contribute numeric bounds.",
    ),
  };
}

export function combinePrescriptionDurationIntervals(input: {
  readonly intervals: readonly PrescriptionDurationInterval[];
  readonly availableSeconds?: number;
  readonly includeSequencingUnknowns: boolean;
}): PrescriptionDurationInterval {
  const lower = input.intervals.reduce(
    (total, interval) => total + interval.knownLowerBoundSeconds,
    0,
  );
  const sourceUpperKnown = input.intervals.every(
    (interval) => interval.knownUpperBoundSeconds !== null,
  );
  const sourceUpper = sourceUpperKnown
    ? input.intervals.reduce(
      (total, interval) => total + (interval.knownUpperBoundSeconds ?? 0),
      0,
    )
    : null;
  const unknown = uniqueSorted([
    ...input.intervals.flatMap((interval) => interval.unknownComponents),
    ...(input.includeSequencingUnknowns
      ? ["sequencing_setup", "sequencing_transition", "sequencing_recovery"]
      : []),
  ]) as readonly PrescriptionDurationUnknownComponent[];
  const upper = input.includeSequencingUnknowns ? null : sourceUpper;
  const status = input.availableSeconds !== undefined && lower > input.availableSeconds
    ? "definitely_over_budget" as const
    : input.availableSeconds !== undefined && upper !== null && upper > input.availableSeconds
      ? "possibly_over_budget" as const
      : input.includeSequencingUnknowns
        ? "unknown_due_to_sequencing" as const
        : unknown.length === 0 && upper === lower
          ? "fully_determinable_before_sequencing" as const
          : unknown.length === 0
            ? "bounded_before_sequencing" as const
          : input.intervals[0]?.status ?? "bounded_before_sequencing";
  const includedComponents = input.intervals.flatMap((interval) => interval.includedComponents ?? []);
  const hasOperationalComponents = input.intervals.some((interval) =>
    interval.includedComponents !== undefined);
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    unknownComponents: unknown,
    status,
    ...(hasOperationalComponents ? {
      includedComponents: Object.freeze(includedComponents),
      operationalPolicyRefs: uniqueSorted([
        ...input.intervals.flatMap((interval) => interval.operationalPolicyRefs ?? []),
        ...includedComponents.map((component) => component.policyRef),
      ]),
    } : {}),
    provenance: productionProvenance(
      "prescription-compiler:duration:combined",
      input.includeSequencingUnknowns
        ? "Final session duration remains Sequencing-dependent."
        : "Combined from explicit Prescription-owned intervals.",
    ),
  };
}
