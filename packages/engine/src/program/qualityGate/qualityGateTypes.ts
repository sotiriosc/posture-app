import type { PrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";

export type ProgramQualitySeverity =
  | "hardFailure"
  | "warning"
  | "capabilityLimitation"
  | "deferredContent";

export type ProgramQualityFinding = {
  code: string;
  severity: ProgramQualitySeverity;
  mode: PrimaryProgramEquipmentMode;
  programId?: string;
  phase?: string;
  frequency?: number;
  dayIndex?: number;
  slot?: string;
  exerciseId?: string;
  expected?: unknown;
  actual?: unknown;
  userActionable: boolean;
  internalMessage: string;
  userSafeMessage?: string;
  sourceContract: string;
};

export type ProgramQualityEvaluation = {
  passed: boolean;
  hardFailures: ProgramQualityFinding[];
  warnings: ProgramQualityFinding[];
  capabilityLimitations: ProgramQualityFinding[];
  deferredContent: ProgramQualityFinding[];
  structuralScore?: number;
  coachingComplete: boolean;
  deterministicSignature?: string;
  recoveryAttempted?: boolean;
  recoveryAttemptCount?: number;
  fallbackUsed?: boolean;
  fallbackStrategy?: string;
  elapsedMs?: number;
  templateVersion?: number;
};

export type ProgramQualityGenerationFailure = {
  status: "quality_failed";
  evaluation: ProgramQualityEvaluation;
  message: string;
};

export const MAX_QUALITY_RECOVERY_ATTEMPTS = 2;
