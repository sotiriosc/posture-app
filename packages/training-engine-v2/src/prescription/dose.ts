import type {
  BreathingCadencePrescription,
  EffortTarget,
  LeverPrescription,
  LocomotorCadencePrescription,
  RangePrescription,
  SupportPrescription,
  TempoPrescription,
} from "./executionStandard";
import type { LoadTarget } from "./load";
import type { PrescriptionLaterality, PrescriptionSideBehavior } from "./types";

export const EXERCISE_DOSE_MODES = [
  "repetition_sets",
  "timed_hold",
  "breath_cycles",
  "distance_carry",
  "timed_carry",
  "step_march",
  "step_sets",
] as const;

export type ExerciseDoseMode = (typeof EXERCISE_DOSE_MODES)[number];

export type TargetKind = "exact" | "range" | "unknown" | "not_prescribed";

export type NumericTarget<Unit extends string> =
  | {
      readonly kind: "exact";
      readonly value: number;
      readonly unit: Unit;
    }
  | {
      readonly kind: "range";
      readonly min: number;
      readonly max: number;
      readonly unit: Unit;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly unit?: Unit;
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason?: string;
      readonly unit?: Unit;
    };

export type CountTarget = NumericTarget<"count">;
export type TimeTarget = NumericTarget<"seconds">;
export type DistanceTarget = NumericTarget<"metres">;
export type RestTarget = NumericTarget<"seconds">;
export type BreathCycleTarget = NumericTarget<"breath_cycles">;
export type StepTarget = NumericTarget<"steps">;

export interface DoseBase {
  readonly load?: LoadTarget;
  readonly effort?: EffortTarget;
  readonly rest?: RestTarget;
  readonly range?: RangePrescription;
  readonly support?: SupportPrescription;
  readonly lever?: LeverPrescription;
  readonly laterality?: PrescriptionLaterality;
  readonly sideBehavior?: PrescriptionSideBehavior;
}

export interface RepetitionSetsDose extends DoseBase {
  readonly mode: "repetition_sets";
  readonly sets: CountTarget;
  readonly repetitions: CountTarget;
  readonly perSide?: boolean;
  readonly tempo?: TempoPrescription;
}

export interface TimedHoldDose extends DoseBase {
  readonly mode: "timed_hold";
  readonly sets: CountTarget;
  readonly duration: TimeTarget;
}

export interface BreathCyclesDose extends DoseBase {
  readonly mode: "breath_cycles";
  readonly rounds: CountTarget;
  readonly breathCycles: BreathCycleTarget;
  readonly breathingCadence?: BreathingCadencePrescription;
  /** Legacy inert prose. Not parsed for behavior. */
  readonly breathingPhaseStandard?: string;
}

export interface DistanceCarryDose extends DoseBase {
  readonly mode: "distance_carry";
  readonly trips: CountTarget;
  readonly distancePerTrip: DistanceTarget;
  readonly locomotorCadence?: LocomotorCadencePrescription;
  /** Legacy inert prose. Not parsed for behavior. */
  readonly gaitControlStandard: string;
}

export interface TimedCarryDose extends DoseBase {
  readonly mode: "timed_carry";
  readonly trips: CountTarget;
  readonly durationPerTrip: TimeTarget;
  readonly locomotorCadence?: LocomotorCadencePrescription;
  /** Legacy inert prose. Not parsed for behavior. */
  readonly gaitControlStandard: string;
}

export interface StepMarchDose extends DoseBase {
  readonly mode: "step_march";
  readonly stationary: true;
  /** Production stationary-march prescriptions require an explicit set count. */
  readonly sets?: CountTarget;
  readonly steps?: StepTarget;
  readonly duration?: TimeTarget;
  readonly alternation?: "alternating" | "same_side_repeated" | "not_applicable";
  readonly marchCadence?: LocomotorCadencePrescription;
  /** Legacy inert prose. Not parsed for behavior. */
  readonly marchControlStandard: string;
}

export interface StepSetsDose extends DoseBase {
  readonly mode: "step_sets";
  readonly sets: CountTarget;
  readonly steps: StepTarget;
  readonly stepCountInterpretation: string;
  readonly alternation?: "alternating" | "same_side_repeated" | "not_applicable";
  readonly stepCadence?: LocomotorCadencePrescription;
  readonly tempo?: TempoPrescription;
}

export type ExerciseDose =
  | RepetitionSetsDose
  | TimedHoldDose
  | BreathCyclesDose
  | DistanceCarryDose
  | TimedCarryDose
  | StepMarchDose
  | StepSetsDose;

export function exactCount(value: number): CountTarget {
  return { kind: "exact", value, unit: "count" };
}

export function exactSeconds(value: number): TimeTarget {
  return { kind: "exact", value, unit: "seconds" };
}

export function exactMetres(value: number): DistanceTarget {
  return { kind: "exact", value, unit: "metres" };
}

export function exactBreathCycles(value: number): BreathCycleTarget {
  return { kind: "exact", value, unit: "breath_cycles" };
}

export function exactSteps(value: number): StepTarget {
  return { kind: "exact", value, unit: "steps" };
}
