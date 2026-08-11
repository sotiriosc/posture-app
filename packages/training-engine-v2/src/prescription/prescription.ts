import type { PhaseId } from "../domain/phase";
import type { ProgressionAxis } from "../domain/progression";
import type { CountTarget, ExerciseDose } from "./dose";
import type { ExecutionStandard } from "./executionStandard";
import type { EvidenceProvenance, ISODateTimeString } from "./types";

export interface SelectionDecision {
  readonly exerciseId: string;
  readonly slotId: string;
  readonly reason: string;
}

export interface ExercisePrescription {
  readonly prescriptionId: string;
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly createdAt: ISODateTimeString;
  readonly dose: ExerciseDose;
  readonly executionStandard: ExecutionStandard;
  readonly rationale: readonly string[];
  readonly intendedProgressionAxes: readonly ProgressionAxis[];
  readonly provenance: EvidenceProvenance;
}

export interface LegacyExercisePrescription {
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly sets?: number;
  readonly reps?: string;
  readonly timeSeconds?: number;
  readonly effortTarget?: string;
  readonly tempo?: string;
  readonly rangeInstruction?: string;
  readonly supportInstruction?: string;
  readonly restSeconds?: number;
  readonly rationale: string;
}

export interface PrescriptionCompilerContract {
  compile(input: {
    readonly selection: SelectionDecision;
    readonly evaluationContext: {
      readonly asOf: ISODateTimeString;
    };
    readonly priorPrescription?: ExercisePrescription;
  }): ExercisePrescription;
}

export function toLegacyExercisePrescription(
  prescription: ExercisePrescription,
): LegacyExercisePrescription {
  const dose = prescription.dose;
  const restSeconds =
    dose.rest?.kind === "exact" && dose.rest.unit === "seconds"
      ? dose.rest.value
      : undefined;

  return {
    exerciseId: prescription.exerciseId,
    phaseId: prescription.phaseId,
    sets: "sets" in dose ? exactCountValue(dose.sets) : undefined,
    reps:
      dose.mode === "repetition_sets"
        ? formatLegacyCountTarget(dose.repetitions)
        : undefined,
    timeSeconds:
      dose.mode === "timed_hold" && dose.duration.kind === "exact"
        ? dose.duration.value
        : undefined,
    effortTarget: dose.effort?.kind,
    tempo: dose.tempo?.description,
    rangeInstruction: dose.range?.kind,
    supportInstruction: dose.support?.description ?? dose.support?.level,
    restSeconds,
    rationale: prescription.rationale.join(" "),
  };
}

function exactCountValue(target: CountTarget): number | undefined {
  return target.kind === "exact" ? target.value : undefined;
}

function formatLegacyCountTarget(target: CountTarget): string | undefined {
  if (target.kind === "exact") {
    return String(target.value);
  }
  if (target.kind === "range") {
    return `${target.min}-${target.max}`;
  }
  return undefined;
}
