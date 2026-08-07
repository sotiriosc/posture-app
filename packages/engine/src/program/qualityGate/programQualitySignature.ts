import type { Program, ProgramDay } from "@/lib/types";
import type { PrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";

export type ProgramQualitySignatureInput = {
  mode: PrimaryProgramEquipmentMode;
  phaseIndex: number;
  daysPerWeek: number;
  week: ProgramDay[];
  capabilityLimitationCodes?: string[];
};

const daySignature = (day: ProgramDay) => {
  const items = day.routine.map((item) =>
    [
      item.section ?? "",
      item.exerciseId,
      item.selectionDebug?.slotLane ?? "",
      item.selectionDebug?.slotKind ?? "",
      String(item.sets ?? ""),
      item.reps ?? "",
      String(item.durationSec ?? ""),
      item.prescription?.progressionRule ?? "",
    ].join(":")
  );
  return `${day.title}|${items.join(",")}`;
};

export const buildProgramQualitySignaturePayload = (
  input: ProgramQualitySignatureInput
) =>
  [
    input.mode,
    String(input.phaseIndex),
    String(input.daysPerWeek),
    ...(input.capabilityLimitationCodes ?? []).slice().sort(),
    ...input.week.map(daySignature),
  ].join("\n");

/** Browser-safe FNV-1a style hash — no Node crypto dependency. */
export const computeProgramQualitySignature = (
  input: ProgramQualitySignatureInput
) => {
  const payload = buildProgramQualitySignaturePayload(input);
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const signatureFromProgram = (
  program: Program,
  mode: PrimaryProgramEquipmentMode,
  capabilityLimitationCodes: string[] = []
) =>
  computeProgramQualitySignature({
    mode,
    phaseIndex: program.phaseIndex ?? 1,
    daysPerWeek: program.daysPerWeek,
    week: program.week,
    capabilityLimitationCodes,
  });
