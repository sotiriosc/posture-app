/**
 * Program Quality V2 — Phase 6 canonical coaching content contract.
 * Registry is presentation-canonical; catalog cues/mistakes remain for integrity.
 */

export type ExerciseDemoStatus = "available" | "planned" | "notRequired";

export type ExerciseDemoRequirement =
  | "required"
  | "recommended"
  | "textSufficient";

export type ExerciseContentComplexity = "simple" | "moderate" | "complex";

export type ExerciseCoachingContent = {
  exerciseId: string;
  shortPurpose: string;
  setupSteps: string[];
  executionSteps: string[];
  primaryCue: string;
  secondaryCues?: string[];
  expectedFeel: string[];
  avoidFeeling?: string[];
  commonMistake: string;
  correction: string;
  stopSignals: string[];
  regressionId?: string;
  progressionId?: string;
  equipmentSetup?: string[];
  anchorSetup?: {
    required: boolean;
    height?: "high" | "middle" | "low";
    safetyNote?: string;
  };
  supportSetup?: string[];
  demoRequirement: ExerciseDemoRequirement;
  contentComplexity: ExerciseContentComplexity;
};

export type ExerciseCoachingViewModel = {
  exerciseId: string;
  name: string;
  prescription: {
    sets?: string;
    repsOrDuration: string;
    restSeconds?: number;
    tempo?: string;
  };
  equipmentNeeded: string[];
  setupSummary?: string;
  primaryCue: string;
  purpose: string;
  whySelected?: string;
  setupSteps: string[];
  executionSteps: string[];
  expectedFeel: string[];
  avoidFeeling?: string[];
  commonMistake: string;
  correction: string;
  stopSignals: string[];
  regression?: { id: string; name: string };
  progression?: { id?: string; label: string; nextTarget?: string };
  demo: {
    status: ExerciseDemoStatus;
    url?: string;
    label?: string;
  };
  capabilityNote?: string;
  guidanceHref: string;
};

export type CoachingValidationCode =
  | "MISSING_REGISTRY_ENTRY"
  | "UNKNOWN_EXERCISE_ID"
  | "EMPTY_SETUP"
  | "EMPTY_EXECUTION"
  | "MISSING_PRIMARY_CUE"
  | "MISSING_EXPECTED_FEEL"
  | "MISSING_MISTAKE_OR_CORRECTION"
  | "MISSING_STOP_SIGNALS"
  | "INVALID_PROGRESSION_REF"
  | "INVALID_REGRESSION_REF"
  | "DEMO_STATUS_URL_MISMATCH"
  | "PLACEHOLDER_COPY"
  | "INTERNAL_CODE_LEAK"
  | "EQUIPMENT_CLAIM_MISMATCH"
  | "DEPRECATED_PROMOTED";

export type CoachingValidationFailure = {
  code: CoachingValidationCode;
  exerciseId: string;
  detail: string;
};
