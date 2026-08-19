import type { ExerciseDose, NumericTarget } from "../prescription/dose";
import type { EffortTarget, TempoPrescription } from "../prescription/executionStandard";
import type { LoadTarget } from "../prescription/load";
import type {
  ProductionExercisePrescriptionPlan,
  ProductionPrescriptionDoseBlock,
  PrescriptionRestInstruction,
} from "../prescription/compiler/contracts";
import type {
  ControlledOwnerV2ProgramPreview,
  OwnerProgramDoseBlockProjection,
  OwnerProgramExerciseProjection,
} from "./contracts";

function targetText(target: NumericTarget<string> | undefined, unit: string): string {
  if (!target || target.kind === "not_prescribed") return `No ${unit} prescribed`;
  if (target.kind === "unknown") return `${unit} requires calibration`;
  const value = target.kind === "exact" ? String(target.value) : `${target.min}-${target.max}`;
  return `${value} ${unit}`;
}

function volumeText(dose: ExerciseDose): string {
  if ("sets" in dose && dose.sets) {
    return dose.sets.kind === "exact" && dose.sets.value === 1 ? "1 set" : targetText(dose.sets, "sets");
  }
  if ("rounds" in dose) return targetText(dose.rounds, "rounds");
  if ("trips" in dose) return targetText(dose.trips, "trips");
  return "Volume requires calibration";
}

function workTargetText(dose: ExerciseDose): string {
  if (dose.mode === "repetition_sets") return targetText(dose.repetitions, "reps");
  if (dose.mode === "timed_hold") return targetText(dose.duration, "seconds");
  if (dose.mode === "breath_cycles") return targetText(dose.breathCycles, "breath cycles");
  if (dose.mode === "distance_carry") return targetText(dose.distancePerTrip, "metres per trip");
  if (dose.mode === "timed_carry") return targetText(dose.durationPerTrip, "seconds per trip");
  if (dose.mode === "step_sets") return targetText(dose.steps, "steps");
  if (dose.steps) return targetText(dose.steps, "steps");
  if (dose.duration) return targetText(dose.duration, "seconds");
  return "Work target requires calibration";
}

function effortText(effort: EffortTarget | undefined): string {
  if (!effort) return "Effort not prescribed";
  if (effort.kind === "rir" || effort.kind === "rpe") {
    const target = effort.target.kind === "exact" ? String(effort.target.value) :
      `${effort.target.min}-${effort.target.max}`;
    return effort.kind === "rir" ? `${target} reps in reserve` : `RPE ${target}`;
  }
  if (effort.kind === "phase_qualitative_band") return `${effort.band} effort`;
  if (effort.kind === "quality_limited") return effort.description || "Quality-limited effort";
  if (effort.kind === "self_selected_by_reviewed_standard") return effort.description;
  return effort.description ?? "Effort requires calibration";
}

function tempoText(tempo: TempoPrescription | undefined): string {
  if (!tempo) return "Tempo not prescribed";
  if (tempo.description) return tempo.description;
  if (tempo.kind === "intent_only") return `${tempo.intent.replaceAll("_", " ")} tempo`;
  if (tempo.kind === "legacy_compatibility") {
    return tempo.legacy.description ?? `${tempo.legacy.concentricIntent.replaceAll("_", " ")} tempo`;
  }
  if (tempo.kind === "repetition_phase_tempo") return "Phase-specific tempo";
  return tempo.kind === "not_applicable" ? "Tempo not applicable" :
    tempo.kind === "not_prescribed" ? "Tempo not prescribed" : "Tempo requires calibration";
}

function loadText(load: LoadTarget | undefined): string {
  if (!load || load.kind === "not_prescribed") return "Load not prescribed";
  if (load.kind === "bodyweight") return "Bodyweight";
  if (load.kind === "user_selected_by_effort") return "Choose load to match the effort target";
  if (load.kind === "unknown") return "Load requires calibration";
  if (load.kind === "band_tension") {
    return load.target.kind === "band_level" ? `${load.target.level.replaceAll("_", " ")} band tension` :
      load.target.description;
  }
  const target = load.target;
  if ("value" in target) return `${target.value} ${target.unit}`;
  if ("min" in target) return `${target.min}-${target.max} ${target.unit}`;
  if ("setting" in target) return `Machine setting ${target.setting}`;
  return `Machine setting ${target.minSetting}-${target.maxSetting}`;
}

function restInstructionText(instruction: PrescriptionRestInstruction): string {
  const placement: Readonly<Record<PrescriptionRestInstruction["placement"], string>> = {
    between_sets: "between sets",
    between_preparatory_blocks: "between preparation blocks",
    before_developmental_block: "before strength work",
    between_developmental_sets: "between strength sets",
    between_rounds: "between rounds",
    between_trips: "between trips",
    between_sides: "between sides",
    after_block: "after this block",
  };
  return `${targetText(instruction.target, "seconds")} ${placement[instruction.placement]}`;
}

function restText(block: ProductionPrescriptionDoseBlock): string {
  if (block.restInstructions.length) return block.restInstructions.map(restInstructionText).join("; ");
  return block.dose.rest ? targetText(block.dose.rest, "seconds rest") : "No rest prescribed";
}

export function projectOwnerPrescriptionDoseBlocks(
  plan: ProductionExercisePrescriptionPlan,
): readonly OwnerProgramDoseBlockProjection[] {
  return Object.freeze([...plan.doseBlocks]
    .sort((left, right) => left.order.index - right.order.index)
    .map((block) => Object.freeze({
      blockId: block.blockId,
      order: block.order.index,
      purpose: block.purpose,
      volume: volumeText(block.dose),
      target: workTargetText(block.dose),
      rest: restText(block),
      effort: effortText(block.dose.effort),
      tempo: tempoText("tempo" in block.dose ? block.dose.tempo : undefined),
      load: loadText(block.dose.load),
      calibrationRequired: block.dose.load?.kind === "user_selected_by_effort" ||
        block.dose.load?.kind === "unknown",
    })));
}

function prescriptionPlans(payload: unknown): readonly ProductionExercisePrescriptionPlan[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const plans = (entry as { readonly plans?: unknown }).plans;
    if (!Array.isArray(plans)) return [];
    return plans.filter((plan): plan is ProductionExercisePrescriptionPlan => Boolean(
      plan && typeof plan === "object" &&
      typeof (plan as { readonly prescriptionRevisionId?: unknown }).prescriptionRevisionId === "string" &&
      Array.isArray((plan as { readonly doseBlocks?: unknown }).doseBlocks),
    ));
  });
}

export function resolveOwnerExerciseDoseBlocks(
  preview: ControlledOwnerV2ProgramPreview,
  exercise: OwnerProgramExerciseProjection,
): readonly OwnerProgramDoseBlockProjection[] {
  if (exercise.doseBlocks?.length) return exercise.doseBlocks;
  if (!exercise.prescriptionRevisionId) return Object.freeze([]);
  const stage = preview.completeProgramSnapshot.find((entry) => entry.stage === "prescription_compiler");
  const plan = prescriptionPlans(stage?.payload).find((entry) =>
    entry.prescriptionRevisionId === exercise.prescriptionRevisionId);
  return plan ? projectOwnerPrescriptionDoseBlocks(plan) : Object.freeze([]);
}
