import type { OperationalDurationBound } from "../prescription/compiler/contracts";
import type {
  ProductionSequencingSetupRelationship,
  SequencingOperationalDurationPolicy,
} from "./contracts";

export const SESSION_DURATION_FEASIBILITY_POLICY_V1_REFERENCE = Object.freeze({
  policyId: "SESSION_DURATION_FEASIBILITY_POLICY_V1",
  version: "1.0.0",
} as const);

const policyRef = `${SESSION_DURATION_FEASIBILITY_POLICY_V1_REFERENCE.policyId}@${SESSION_DURATION_FEASIBILITY_POLICY_V1_REFERENCE.version}`;

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
      notes: "Conservative planning bound; not measured setup or transition time.",
    }),
  });
}

const exerciseSetupByRelationship: Readonly<Record<
  ProductionSequencingSetupRelationship,
  OperationalDurationBound
>> = Object.freeze({
  same_setup: doctrine("exercise-setup:same", 5, 30),
  compatible_setup: doctrine("exercise-setup:compatible", 10, 60),
  setup_change_required: doctrine("exercise-setup:change", 30, 120),
  equipment_change_required: doctrine("exercise-setup:equipment-change", 20, 90),
  support_change_required: doctrine("exercise-setup:support-change", 20, 90),
  location_change_required: doctrine("exercise-setup:location-change", 30, 180),
  unknown: doctrine("exercise-setup:unknown-broad-bound", 30, 240),
});

export const SESSION_DURATION_FEASIBILITY_POLICY_V1:
SequencingOperationalDurationPolicy = Object.freeze({
  ...SESSION_DURATION_FEASIBILITY_POLICY_V1_REFERENCE,
  state: "reviewed_controlled_owner",
  reviewer: "PROJECT_OWNER",
  reviewedOn: "2026-08-19",
  scope: "controlled_owner_duration_feasibility_only",
  initialSessionSetup: doctrine("initial-session-setup", 30, 120),
  initialExerciseSetup: doctrine("initial-exercise-setup", 30, 120),
  assignmentTransition: doctrine("between-assignment-transition", 10, 60),
  exerciseSetupByRelationship,
  equipmentAdjustment: doctrine("equipment-adjustment", 30, 180),
  sectionTransition: doctrine("section-transition", 10, 60),
  provenance: Object.freeze({
    source: "policy",
    sourceRef: policyRef,
    notes: "Project-owner reviewed controlled-owner Sequencing feasibility policy.",
  }),
});
