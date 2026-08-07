import type { ProgramQualityEvaluation } from "@/lib/program/qualityGate/qualityGateTypes";

export type ProgramQualityObservabilityEvent = {
  kind: "program_quality_gate";
  firstPassPassed: boolean;
  hardFailureCodes: string[];
  recoveryAttempted: boolean;
  recoveryAttemptCount: number;
  fallbackUsed: boolean;
  fallbackStrategy?: string;
  finalPassed: boolean;
  deterministicSignature?: string;
  templateVersion?: number;
  elapsedMs?: number;
  mode?: string;
};

export const toProgramQualityObservabilityEvent = (params: {
  firstPassPassed: boolean;
  evaluation: ProgramQualityEvaluation;
  mode?: string;
}): ProgramQualityObservabilityEvent => ({
  kind: "program_quality_gate",
  firstPassPassed: params.firstPassPassed,
  hardFailureCodes: params.evaluation.hardFailures.map((f) => f.code),
  recoveryAttempted: Boolean(params.evaluation.recoveryAttempted),
  recoveryAttemptCount: params.evaluation.recoveryAttemptCount ?? 0,
  fallbackUsed: Boolean(params.evaluation.fallbackUsed),
  fallbackStrategy: params.evaluation.fallbackStrategy,
  finalPassed: params.evaluation.passed,
  deterministicSignature: params.evaluation.deterministicSignature,
  templateVersion: params.evaluation.templateVersion,
  elapsedMs: params.evaluation.elapsedMs,
  mode: params.mode,
});

const buffer: ProgramQualityObservabilityEvent[] = [];

export const recordProgramQualityObservability = (
  event: ProgramQualityObservabilityEvent
) => {
  buffer.push(event);
  const shouldLog =
    !event.firstPassPassed ||
    event.recoveryAttempted ||
    event.fallbackUsed ||
    !event.finalPassed;
  if (
    shouldLog &&
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production" &&
    process.env?.PROGRAM_QUALITY_SILENT !== "1"
  ) {
    // Internal diagnostics only — never user-facing.
    console.info("[program-quality-gate]", JSON.stringify(event));
  }
};

export const getProgramQualityObservabilityBuffer = () => [...buffer];
export const clearProgramQualityObservabilityBuffer = () => {
  buffer.length = 0;
};
