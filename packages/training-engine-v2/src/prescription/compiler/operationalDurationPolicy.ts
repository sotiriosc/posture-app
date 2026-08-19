import type {
  OperationalDurationBound,
  PrescriptionOperationalDurationPolicy,
  PrescriptionOperationalExecutionTimingClass,
} from "./contracts";

export const PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1_REFERENCE = Object.freeze({
  policyId: "PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1",
  version: "1.0.0",
} as const);

const policyRef = `${PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1_REFERENCE.policyId}@${PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1_REFERENCE.version}`;

function doctrine(
  ruleId: string,
  lowerBoundSeconds: number,
  upperBoundSeconds: number,
): OperationalDurationBound {
  return Object.freeze({
    lowerBoundSeconds,
    upperBoundSeconds,
    classification: "praxis_operational_doctrine" as const,
    policyRef: `${policyRef}:${ruleId}`,
    provenance: Object.freeze({
      source: "policy" as const,
      sourceRef: `${policyRef}:${ruleId}`,
      notes: "Conservative planning bound; not a measured or promised execution cadence.",
    }),
  });
}

const repetitionBounds: Readonly<Record<
  PrescriptionOperationalExecutionTimingClass,
  OperationalDurationBound
>> = Object.freeze({
  lift_acclimation: doctrine("execution-per-repetition:lift-acclimation", 2, 8),
  primary_developmental_strength: doctrine("execution-per-repetition:primary-strength", 2, 10),
  supporting_developmental: doctrine("execution-per-repetition:supporting-developmental", 2, 10),
  dependency_preparation: doctrine("execution-per-repetition:dependency-preparation", 2, 8),
  activation_control: doctrine("execution-per-repetition:activation-control", 2, 8),
  accessory_support: doctrine("execution-per-repetition:accessory-support", 2, 10),
  cooldown_recovery: doctrine("execution-per-repetition:cooldown-recovery", 3, 12),
});

export const PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1:
PrescriptionOperationalDurationPolicy = Object.freeze({
  ...PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1_REFERENCE,
  state: "reviewed_controlled_owner",
  reviewer: "PROJECT_OWNER",
  reviewedOn: "2026-08-19",
  scope: "controlled_owner_duration_feasibility_only",
  executionSecondsPerRepetition: repetitionBounds,
  secondsPerBreathCycle: doctrine("execution-per-breath-cycle", 5, 15),
  secondsPerMetre: doctrine("execution-per-metre", 0.5, 2.5),
  secondsPerStep: doctrine("execution-per-step", 0.5, 3),
  sideTransition: doctrine("within-assignment-side-transition", 5, 30),
  loadCalibration: Object.freeze({
    primary_developmental_strength: doctrine("load-calibration:primary-strength", 60, 240),
    supporting_developmental: doctrine("load-calibration:supporting-developmental", 45, 180),
    accessory_support: doctrine("load-calibration:accessory-support", 30, 150),
  }),
  provenance: Object.freeze({
    source: "policy",
    sourceRef: policyRef,
    notes: "Project-owner reviewed controlled-owner feasibility policy. Visible tempo and dose remain unchanged.",
  }),
});
