import type { ExerciseDose } from "../dose";
import type {
  PrescriptionDurationInterval,
  PrescriptionDurationUnknownComponent,
  PrescriptionRestInstruction,
} from "./contracts";
import { numericBounds, productionProvenance, uniqueSorted } from "./utilities";

function restBounds(
  instructions: readonly PrescriptionRestInstruction[],
  dose: ExerciseDose,
): { readonly lower: number; readonly upper: number; readonly unknown: boolean } {
  let lower = 0;
  let upper = 0;
  let unknown = false;
  for (const instruction of instructions) {
    const bounds = numericBounds(instruction.target);
    if (!bounds) {
      if (instruction.target.kind === "unknown") unknown = true;
      continue;
    }
    const repetitions = instruction.appliesWithinBlockId
      ? repeatedRestCount(dose, instruction.placement)
      : [1, 1] as const;
    lower += bounds[0] * repetitions[0];
    upper += bounds[1] * repetitions[1];
  }
  return { lower, upper, unknown };
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
}): PrescriptionDurationInterval {
  const unknown: PrescriptionDurationUnknownComponent[] = [];
  let lower = 0;
  let upper: number | null = 0;
  const rests = restBounds(input.restInstructions, input.dose);
  lower += rests.lower;
  upper += rests.upper;
  if (rests.unknown) {
    unknown.push("rest");
    upper = null;
  }

  switch (input.dose.mode) {
    case "repetition_sets": {
      const sets = numericBounds(input.dose.sets);
      const repetitions = numericBounds(input.dose.repetitions);
      const phases = phaseBounds(input.dose);
      if (sets && repetitions && phases) {
        lower += sets[0] * repetitions[0] * phases[0];
        if (upper !== null) upper += sets[1] * repetitions[1] * phases[1];
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
        lower += sets[0] * duration[0];
        if (upper !== null) upper += sets[1] * duration[1];
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
          lower += rounds[0] * cycles[0] * cadenceLower;
          if (upper !== null) upper += rounds[1] * cycles[1] * cadenceUpper;
        } else {
          unknown.push("breathing_cadence");
          upper = null;
        }
      } else {
        unknown.push("breathing_cadence");
        upper = null;
      }
      break;
    }
    case "distance_carry":
      unknown.push("locomotor_pace");
      upper = null;
      break;
    case "timed_carry": {
      const trips = numericBounds(input.dose.trips);
      const duration = numericBounds(input.dose.durationPerTrip);
      if (trips && duration) {
        lower += trips[0] * duration[0];
        if (upper !== null) upper += trips[1] * duration[1];
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
        lower += (sets?.[0] ?? 1) * duration[0];
        if (upper !== null) upper += (sets?.[1] ?? 1) * duration[1];
      } else {
        unknown.push("step_cadence");
        upper = null;
      }
      break;
    }
    case "step_sets":
      unknown.push("step_cadence");
      upper = null;
      break;
  }

  if (
    input.dose.laterality?.kind === "each_side" &&
    !input.restInstructions.some((instruction) => instruction.placement === "between_sides")
  ) {
    unknown.push("side_transition");
    upper = null;
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
    provenance: productionProvenance(
      `prescription-compiler:duration:${input.dose.mode}`,
      "Only explicit work timing and explicitly placed rest contribute numeric bounds.",
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
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    unknownComponents: unknown,
    status,
    provenance: productionProvenance(
      "prescription-compiler:duration:combined",
      input.includeSequencingUnknowns
        ? "Final session duration remains Sequencing-dependent."
        : "Combined from explicit Prescription-owned intervals.",
    ),
  };
}
