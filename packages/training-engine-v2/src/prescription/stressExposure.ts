import type { ExerciseStressAnnotationProvenance, ExerciseStressExposureScope } from "../domain/exercise";
import type { JointStressTag, Side } from "../domain/primitives";
import type { ExerciseDose, TimeTarget, DistanceTarget, StepTarget } from "./dose";
import type {
  EffortTarget,
  LeverPrescription,
  RangePrescription,
  SupportPrescription,
  TempoPrescription,
} from "./executionStandard";
import type { LoadTarget } from "./load";
import type { ExercisePrescription } from "./prescription";
import type { ExerciseId, PrescriptionId, SourceExposureEventId } from "./types";

export type PrescriptionStressRealizationStatus =
  | "intrinsic_present"
  | "present_under_prescription"
  | "removed_by_reviewed_variant"
  | "dose_not_yet_classified"
  | "unknown";

export type PrescriptionStressReceiverEligibility =
  | "receiver_eligible"
  | "not_receiver_eligible_removed"
  | "not_receiver_eligible_unresolved"
  | "not_receiver_eligible_unknown";

export interface PrescriptionStressExposureTrace {
  readonly prescriptionId: PrescriptionId;
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly exerciseId: ExerciseId;
  readonly stressTag: JointStressTag;
  readonly exercisePotentialScope: ExerciseStressExposureScope;
  readonly realizationStatus: PrescriptionStressRealizationStatus;
  readonly side: Side | null;
  readonly load: LoadTarget | null;
  readonly range: RangePrescription | null;
  readonly support: SupportPrescription | null;
  readonly lever: LeverPrescription | null;
  readonly duration: TimeTarget | null;
  readonly distance: DistanceTarget | null;
  readonly steps: StepTarget | null;
  readonly tempo: TempoPrescription | null;
  readonly effort: EffortTarget | null;
  readonly provenance: readonly ExerciseStressAnnotationProvenance[];
  readonly receiverEligibility: PrescriptionStressReceiverEligibility;
  readonly reason: string;
}

function durationFor(dose: ExerciseDose): TimeTarget | null {
  switch (dose.mode) {
    case "timed_hold":
      return dose.duration;
    case "timed_carry":
      return dose.durationPerTrip;
    case "step_march":
      return dose.duration ?? null;
    case "step_sets":
    case "repetition_sets":
    case "breath_cycles":
    case "distance_carry":
      return null;
  }
}

function distanceFor(dose: ExerciseDose): DistanceTarget | null {
  return dose.mode === "distance_carry" ? dose.distancePerTrip : null;
}

function stepsFor(dose: ExerciseDose): StepTarget | null {
  return dose.mode === "step_march" || dose.mode === "step_sets"
    ? dose.steps ?? null
    : null;
}

function tempoFor(dose: ExerciseDose): TempoPrescription | null {
  return "tempo" in dose ? dose.tempo ?? null : null;
}

function defaultEligibility(
  realizationStatus: PrescriptionStressRealizationStatus,
): PrescriptionStressReceiverEligibility {
  switch (realizationStatus) {
    case "intrinsic_present":
    case "present_under_prescription":
      return "receiver_eligible";
    case "removed_by_reviewed_variant":
      return "not_receiver_eligible_removed";
    case "dose_not_yet_classified":
      return "not_receiver_eligible_unresolved";
    case "unknown":
      return "not_receiver_eligible_unknown";
  }
}

export function buildPrescriptionStressExposureTrace(input: {
  readonly prescription: ExercisePrescription;
  readonly stressTag: JointStressTag;
  readonly exercisePotentialScope: ExerciseStressExposureScope;
  readonly realizationStatus: PrescriptionStressRealizationStatus;
  readonly side?: Side | null;
  readonly provenance: readonly ExerciseStressAnnotationProvenance[];
  readonly receiverEligibility?: PrescriptionStressReceiverEligibility;
  readonly reason: string;
}): PrescriptionStressExposureTrace {
  const dose = input.prescription.dose;

  return {
    prescriptionId: input.prescription.prescriptionId,
    sourceExposureEventId: input.prescription.sourceExposureEventId,
    exerciseId: input.prescription.exerciseId,
    stressTag: input.stressTag,
    exercisePotentialScope: input.exercisePotentialScope,
    realizationStatus: input.realizationStatus,
    side: input.side ?? null,
    load: dose.load ?? null,
    range: dose.range ?? null,
    support: dose.support ?? null,
    lever: dose.lever ?? null,
    duration: durationFor(dose),
    distance: distanceFor(dose),
    steps: stepsFor(dose),
    tempo: tempoFor(dose),
    effort: dose.effort ?? null,
    provenance: input.provenance,
    receiverEligibility:
      input.receiverEligibility ?? defaultEligibility(input.realizationStatus),
    reason: input.reason,
  };
}
