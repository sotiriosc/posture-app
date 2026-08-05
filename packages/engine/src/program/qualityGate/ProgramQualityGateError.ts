import type { ProgramQualityEvaluation } from "@/lib/program/qualityGate/qualityGateTypes";

export class ProgramQualityGateError extends Error {
  readonly evaluation: ProgramQualityEvaluation;
  readonly status = "quality_failed" as const;

  constructor(message: string, evaluation: ProgramQualityEvaluation) {
    super(message);
    this.name = "ProgramQualityGateError";
    this.evaluation = evaluation;
  }
}
