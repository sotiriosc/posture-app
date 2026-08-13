import type { ExerciseDefinition } from "../domain/exercise";
import type { ExercisePrescriptionKnowledgeProfile } from "../domain/exercisePrescriptionKnowledge";
import type { PhaseId } from "../domain/phase";
import type { TrainingRole, SessionSection } from "../domain/session";
import type { TrainingOutcomeGoal } from "../domain/sessionPlanningDirective";
import type { SessionPrescriptionAssignmentHandoff } from "../sessionComposer/contracts";
import type { ExerciseDose, ExerciseDoseMode } from "./dose";
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
import type {
  ExercisePerformanceTimingObservation,
  ExecutionQualityObservation,
} from "./performanceOutcome";
import type { ProgressionReadinessTrace } from "./progressionEvidence";
import {
  prescriptionFinding,
  type EvidenceProvenance,
  type ISODateTimeString,
  type PrescriptionSideBehavior,
  type PrescriptionValidationFinding,
  type SourceExposureEventId,
} from "./types";
import { validateDose } from "./validation";

export const SOURCE_EXPOSURE_EVENT_STATUSES = [
  "planned",
  "cancelled",
  "superseded",
  "substituted",
  "completed",
  "unknown",
] as const;

export type SourceExposureEventStatus = (typeof SOURCE_EXPOSURE_EVENT_STATUSES)[number];

export const PRESCRIPTION_REVISION_REASON_CODES = [
  "initial_compilation",
  "policy_revision",
  "pain_response_requirement",
  "equipment_availability_change",
  "coach_review",
  "athlete_reported_constraint",
  "substitution",
  "cancellation",
  "unknown",
] as const;

export type PrescriptionRevisionReasonCode =
  (typeof PRESCRIPTION_REVISION_REASON_CODES)[number];

export const PRESCRIPTION_REVISION_STATES = [
  "draft",
  "superseded",
  "final_for_execution",
  "cancelled",
] as const;

export type PrescriptionRevisionState = (typeof PRESCRIPTION_REVISION_STATES)[number];

export interface PrescriptionRevisionReference {
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
}

export interface PrescriptionSubstitutionReference {
  readonly substitutionId: string;
  readonly originalSelectedExerciseId: string;
  readonly substitutedExerciseId: string;
  readonly pointOfSubstitution:
    | "before_any_block"
    | "between_blocks"
    | "during_block"
    | "after_planned_work"
    | "unknown";
  readonly replacedBlockIds: readonly string[];
  readonly reasonCode: string;
  readonly provenance: EvidenceProvenance;
}

export interface SourceExposureCancellationSupersessionState {
  readonly kind: "none" | "cancelled" | "superseded" | "substituted";
  readonly reasonCode?: string;
  readonly supersededBySourceExposureEventId?: SourceExposureEventId;
}

export interface SourceExposureEventIdentity {
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly sessionIntentId: string;
  readonly sessionAssignmentId: string;
  readonly exerciseId: string;
  readonly originalSelectedExerciseId: string;
  readonly currentPlannedExerciseId: string;
  readonly eventStatus: SourceExposureEventStatus;
  readonly prescriptionRevisionRefs: readonly PrescriptionRevisionReference[];
  readonly substitutionRefs: readonly PrescriptionSubstitutionReference[];
  readonly cancellationSupersessionState: SourceExposureCancellationSupersessionState;
  readonly provenance: EvidenceProvenance;
}

export interface ExercisePrescriptionRevision {
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: PrescriptionRevisionReasonCode;
  readonly createdAt: ISODateTimeString;
  readonly revisionState: PrescriptionRevisionState;
  readonly finalForExecution: boolean;
  readonly supersededByRevisionId: string | null;
  readonly policyVersionRefs: readonly string[];
  readonly changedFieldRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export const PRESCRIPTION_DOSE_BLOCK_PURPOSES = [
  "preparatory_acclimation",
  "developmental_work",
  "technique_quality_work",
  "recovery_or_downregulation",
  "unknown",
] as const;

export type PrescriptionDoseBlockPurpose =
  (typeof PRESCRIPTION_DOSE_BLOCK_PURPOSES)[number];

export const PRESCRIPTION_BLOCK_CONTRIBUTION_CLASSIFICATIONS = [
  "not_weekly_developmental_credit",
  "developmental_credit_candidate",
  "technique_quality_observation_only",
  "recovery_observation_only",
  "unknown_requires_review",
] as const;

export type PrescriptionBlockContributionClassification =
  (typeof PRESCRIPTION_BLOCK_CONTRIBUTION_CLASSIFICATIONS)[number];

export interface PrescriptionDoseBlockOrder {
  readonly index: number;
  readonly dependsOnBlockIds: readonly string[];
}

export interface PrescriptionDoseBlock {
  readonly blockId: string;
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly dose: ExerciseDose;
  readonly policyRuleRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly contributionClassification: PrescriptionBlockContributionClassification;
  readonly order: PrescriptionDoseBlockOrder;
  readonly provenance: EvidenceProvenance;
}

export type SingleDoseCompatibilityProjectionStatus =
  | "single_uniform_dose_compatible"
  | "ordered_blocks_required"
  | "legacy_single_dose_projection_available"
  | "no_truthful_single_dose_projection";

export interface SingleDoseCompatibilityProjection {
  readonly status: SingleDoseCompatibilityProjectionStatus;
  readonly projectedDose: ExerciseDose | null;
  readonly reasonCode: string;
}

export interface ExercisePrescriptionPlan {
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEvent: SourceExposureEventIdentity;
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly doseBlocks: readonly PrescriptionDoseBlock[];
  readonly compatibilityProjection: SingleDoseCompatibilityProjection;
  readonly selectedPolicyRuleRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly durationDeterminability: PrescriptionDurationDeterminability;
  readonly rationale: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export const PRESCRIPTION_BLOCK_COMPLETION_STATUSES = [
  "completed_as_planned",
  "partially_completed",
  "omitted",
  "substituted",
  "additional_unplanned",
  "unknown",
] as const;

export type PrescriptionBlockCompletionStatus =
  (typeof PRESCRIPTION_BLOCK_COMPLETION_STATUSES)[number];

export interface PrescriptionBlockPerformanceResult {
  readonly plannedBlockId: string | null;
  readonly performedBlockId: string;
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly completionStatus: PrescriptionBlockCompletionStatus;
  readonly actualDose: ExerciseDose | null;
  readonly actualTiming: ExercisePerformanceTimingObservation | null;
  readonly qualityObservations: readonly ExecutionQualityObservation[];
  readonly substitutionRef: PrescriptionSubstitutionReference | null;
  readonly provenance: EvidenceProvenance;
}

export interface ExercisePerformanceBlockLinkage {
  readonly performanceRecordId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly plannedBlockIds: readonly string[];
  readonly blockResults: readonly PrescriptionBlockPerformanceResult[];
  readonly omittedPlannedBlockIds: readonly string[];
  readonly additionalUnplannedBlockIds: readonly string[];
  readonly actualDoseAssumedFromPlan: false;
  readonly actualTimingAssumedFromPlan: false;
  readonly originalPlanImmutable: true;
  readonly provenance: EvidenceProvenance;
}

export type PrescriptionPolicyEvidenceClassification =
  | "SUPPORTED_FOR_POLICY_REVIEW"
  | "BROAD_FLEXIBILITY_PRIOR"
  | "GOAL_SPECIFIC"
  | "POPULATION_SPECIFIC"
  | "EXERCISE_SPECIFIC"
  | "PRESCRIPTION_DEPENDENT"
  | "RESPONSE_DEPENDENT"
  | "LONGITUDINAL_DEPENDENT"
  | "INSUFFICIENT_FOR_NUMERIC_POLICY"
  | "CONFLICTING_EVIDENCE"
  | "EXTERNAL_REFERENCE_PENDING";

export interface ReviewedPrescriptionPolicySourceReference {
  readonly sourceRef: string;
  readonly url?: string;
  readonly evidenceClassification: PrescriptionPolicyEvidenceClassification;
  readonly notes: string;
}

export interface PrescriptionPolicyApplicabilityScope {
  readonly outcomeGoals?: readonly TrainingOutcomeGoal[];
  readonly programmingContexts?: readonly string[];
  readonly experienceLevels?: readonly ("novice" | "intermediate" | "advanced" | "unknown")[];
  readonly phaseIds?: readonly PhaseId[];
  readonly roles?: readonly TrainingRole[];
  readonly sections?: readonly SessionSection[];
  readonly exerciseFamilies?: readonly string[];
  readonly exerciseIds?: readonly string[];
  readonly doseModes?: readonly ExerciseDoseMode[];
  readonly timingModels?: readonly string[];
  readonly equipmentCapabilities?: readonly string[];
  readonly muscleRelationshipRequirements?: readonly string[];
  readonly painResponseRequirements?: readonly string[];
  readonly continuityStates?: readonly string[];
  readonly progressionStates?: readonly string[];
}

export interface PrescriptionPolicyRuleBase {
  readonly ruleId: string;
  readonly specificity: number;
  readonly authority: "reviewed" | "owner_fixture" | "external_reference_pending";
  readonly applicability: PrescriptionPolicyApplicabilityScope;
  readonly overrideOfRuleIds: readonly string[];
  readonly conflictsWithRuleIds: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export interface DoseModeSelectionPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "dose_mode_selection";
  readonly permittedModes: readonly ExerciseDoseMode[];
  readonly preferredMode?: ExerciseDoseMode;
}

export interface BlockStructurePolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "block_structure";
  readonly blockPurposes: readonly PrescriptionDoseBlockPurpose[];
  readonly allowMultipleBlocks: boolean;
  readonly mixedDoseModesAllowed: boolean;
}

export interface CountTargetPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "count_target";
  readonly targetField:
    | "sets"
    | "rounds"
    | "trips"
    | "repetitions"
    | "breath_cycles"
    | "steps";
  readonly value:
    | { readonly kind: "exact"; readonly value: number }
    | { readonly kind: "range"; readonly min: number; readonly max: number }
    | { readonly kind: "policy_required"; readonly reason: string };
}

export interface ScalarTargetPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "scalar_target";
  readonly targetField: "duration_seconds" | "distance_metres" | "rest_seconds";
  readonly value:
    | { readonly kind: "exact"; readonly value: number }
    | { readonly kind: "range"; readonly min: number; readonly max: number }
    | { readonly kind: "policy_required"; readonly reason: string };
}

export interface LoadSelectionPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "load_selection";
  readonly load: LoadTarget;
}

export interface EffortPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "effort";
  readonly effort: EffortTarget;
}

export interface ExecutionModifierPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "execution_modifier";
  readonly targetField: "range" | "support" | "lever" | "laterality" | "side";
  readonly range?: RangePrescription;
  readonly support?: SupportPrescription;
  readonly lever?: LeverPrescription;
  readonly sideBehavior?: PrescriptionSideBehavior;
}

export interface TimingPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "timing";
  readonly targetField: "repetition_tempo" | "breathing_cadence" | "locomotor_cadence";
  readonly tempo?: TempoPrescription;
  readonly breathingCadence?: BreathingCadencePrescription;
  readonly locomotorCadence?: LocomotorCadencePrescription;
}

export interface ContextAdjustmentPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "context_adjustment";
  readonly adjustmentField:
    | "goal"
    | "role_section"
    | "phase"
    | "pain_response"
    | "progression_review"
    | "conflict_resolution";
  readonly requirementRefs: readonly string[];
  readonly behavior:
    | "select_applicable_rule"
    | "hold_current"
    | "modify_selected_dimension"
    | "return_policy_required"
    | "return_policy_conflict"
    | "permit_progression_review";
}

export interface AcclimationBlockPolicyRule extends PrescriptionPolicyRuleBase {
  readonly kind: "acclimation_block";
  readonly purpose: "preparatory_acclimation";
  readonly creditBehavior: "no_developmental_weekly_credit";
  readonly requiredBeforePurpose: "developmental_work";
}

export type ReviewedPrescriptionPolicyRule =
  | DoseModeSelectionPolicyRule
  | BlockStructurePolicyRule
  | CountTargetPolicyRule
  | ScalarTargetPolicyRule
  | LoadSelectionPolicyRule
  | EffortPolicyRule
  | ExecutionModifierPolicyRule
  | TimingPolicyRule
  | ContextAdjustmentPolicyRule
  | AcclimationBlockPolicyRule;

export const REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS = [
  "dose_mode_selection",
  "block_structure",
  "count_target",
  "scalar_target",
  "load_selection",
  "effort",
  "execution_modifier",
  "timing",
  "context_adjustment",
  "acclimation_block",
] as const;

export interface ReviewedPrescriptionPolicyConflict {
  readonly conflictId: string;
  readonly ruleIds: readonly string[];
  readonly resolution: "explicit_override" | "return_policy_conflict";
  readonly provenance: EvidenceProvenance;
}

export interface ReviewedPrescriptionPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly sourceType: "reviewed_evidence" | "owner_fixture" | "external_reference_pending";
  readonly sourceReferences: readonly ReviewedPrescriptionPolicySourceReference[];
  readonly evidenceBasis: readonly string[];
  readonly reviewer: string;
  readonly reviewedAt: ISODateTimeString;
  readonly applicabilityScope: PrescriptionPolicyApplicabilityScope;
  readonly rules: readonly ReviewedPrescriptionPolicyRule[];
  readonly overrides: readonly { readonly overridingRuleId: string; readonly overriddenRuleId: string }[];
  readonly conflicts: readonly ReviewedPrescriptionPolicyConflict[];
  readonly unknowns: readonly string[];
}

export interface PrescriptionCompilerInput {
  readonly handoffAssignment: SessionPrescriptionAssignmentHandoff;
  readonly exercise: ExerciseDefinition;
  readonly exercisePrescriptionKnowledge: ExercisePrescriptionKnowledgeProfile;
  readonly sessionOutcomeGoal: TrainingOutcomeGoal;
  readonly programmingContext: readonly string[];
  readonly phaseId: PhaseId;
  readonly assignedRole: TrainingRole;
  readonly assignedSection: SessionSection;
  readonly satisfiedNeedIds: readonly string[];
  readonly currentEquipment: readonly string[];
  readonly availabilityContextRefs: readonly string[];
  readonly assessmentContextRefs: readonly string[];
  readonly painResponseRequirementRefs: readonly string[];
  readonly continuityEvidenceRefs: readonly string[];
  readonly progressionReadinessTrace: ProgressionReadinessTrace | null;
  readonly priorPrescriptionRevision: ExercisePrescriptionRevision | null;
  readonly completedPerformanceHistoryRefs: readonly string[];
  readonly reviewedPolicy: ReviewedPrescriptionPolicy;
  readonly evaluationTime: ISODateTimeString;
}

export const PRESCRIPTION_COMPILATION_STATUSES = [
  "compiled_non_production_fixture",
  "prescription_policy_required",
  "prescription_policy_conflict",
  "unresolved_execution_requirement",
  "unsupported_dose_mode",
  "invalid_source_exposure_context",
  "contradictory_prescription_requirements",
  "insufficient_progression_evidence",
  "blocked_by_training_readiness",
] as const;

export type PrescriptionCompilationStatus =
  (typeof PRESCRIPTION_COMPILATION_STATUSES)[number];

export const PRESCRIPTION_DURATION_DETERMINABILITY_STATUSES = [
  "fully_determinable",
  "partially_determinable",
  "unknown_due_to_prescription",
  "unknown_due_to_sequencing",
  "over_budget",
  "fits",
] as const;

export type PrescriptionDurationDeterminability =
  (typeof PRESCRIPTION_DURATION_DETERMINABILITY_STATUSES)[number];

export interface PrescriptionCompilationTrace {
  readonly sourceExposureTrace: readonly string[];
  readonly selectedRuleTrace: readonly string[];
  readonly rejectedRuleTrace: readonly string[];
  readonly unresolvedRequirementTrace: readonly string[];
  readonly legalModeTrace: readonly string[];
  readonly blockStructureTrace: readonly string[];
  readonly doseTrace: readonly string[];
  readonly executionStandardTrace: readonly string[];
  readonly durationDeterminabilityTrace: readonly string[];
  readonly decisionTrace: readonly string[];
}

export interface PrescriptionCompilationResult {
  readonly status: PrescriptionCompilationStatus;
  readonly plan: ExercisePrescriptionPlan | null;
  readonly sourceExposureEvent: SourceExposureEventIdentity | null;
  readonly revisionTrace: readonly ExercisePrescriptionRevision[];
  readonly selectedRuleTraces: readonly string[];
  readonly rejectedRuleTraces: readonly string[];
  readonly unresolvedRequirementTraces: readonly string[];
  readonly legalModeTrace: readonly string[];
  readonly blockStructureTrace: readonly string[];
  readonly doseTrace: readonly string[];
  readonly executionStandardTrace: readonly string[];
  readonly durationDeterminability: PrescriptionDurationDeterminability;
  readonly decisionTrace: readonly string[];
  readonly authority: "DESIGN_ONLY_COMPILER_EVIDENCE";
}

export const PRESCRIPTION_COMPILATION_ORDER = [
  "validate_source_exposure_and_assignment_context",
  "validate_training_readiness",
  "resolve_legal_dose_modes",
  "resolve_block_structure",
  "resolve_block_purposes",
  "resolve_count_time_distance_step_breath_targets",
  "resolve_load_and_effort",
  "resolve_range_support_lever_laterality",
  "resolve_timing_and_cadence",
  "resolve_rest",
  "build_execution_standards",
  "validate_duration_determinability",
  "validate_unresolved_pain_response_requirements",
  "validate_progression_compatibility",
  "emit_plan_or_explicit_unresolved_state",
] as const;

export type PrescriptionCompilationOrderStep =
  (typeof PRESCRIPTION_COMPILATION_ORDER)[number];

export function validateSourceExposureEventIdentity(
  event: SourceExposureEventIdentity,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(event);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_source_exposure_event_object",
        "Source exposure event identity must be a structured object.",
      ),
    ];
  }
  const targetId = stringOrUndefined(record.sourceExposureEventId);
  for (const field of [
    "sourceExposureEventId",
    "sessionIntentId",
    "sessionAssignmentId",
    "exerciseId",
    "originalSelectedExerciseId",
    "currentPlannedExerciseId",
  ]) {
    if (!isNonEmptyString(record[field])) {
      findings.push(
        prescriptionFinding(
          "error",
          `missing_source_exposure_${toSnake(field)}`,
          `Source exposure event requires ${field}.`,
          targetId,
        ),
      );
    }
  }
  if (!isOneOf(record.eventStatus, SOURCE_EXPOSURE_EVENT_STATUSES)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_source_exposure_event_status",
        "Source exposure event status must use the canonical vocabulary.",
        targetId,
      ),
    );
  }
  if (
    stringOrUndefined(record.sourceExposureEventId) ===
    stringOrUndefined(asRecord(record.prescriptionRevisionRefs)?.prescriptionId)
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_source_exposure_event_id_prescription_coupling",
        "Source exposure event ID must not be derived from prescription ID alone.",
        targetId,
      ),
    );
  }
  if (!Array.isArray(record.prescriptionRevisionRefs)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_source_exposure_revision_refs",
        "Source exposure event revision refs must be an array.",
        targetId,
      ),
    );
  }
  if (!Array.isArray(record.substitutionRefs)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_source_exposure_substitution_refs",
        "Source exposure event substitution refs must be an array.",
        targetId,
      ),
    );
  }
  return findings;
}

export function validatePrescriptionRevisionSet(
  revisions: readonly ExercisePrescriptionRevision[],
  sourceExposureEventId: SourceExposureEventId,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const ids = new Set<string>();
  let finalCount = 0;
  for (const revision of revisions) {
    const record = asRecord(revision);
    if (!record) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_prescription_revision_object",
          "Prescription revision must be a structured object.",
          sourceExposureEventId,
        ),
      );
      continue;
    }
    const revisionId = stringOrUndefined(record.prescriptionRevisionId);
    if (!isNonEmptyString(record.prescriptionId)) {
      findings.push(prescriptionFinding("error", "missing_prescription_id", "Revision requires prescriptionId.", revisionId));
    }
    if (!revisionId) {
      findings.push(prescriptionFinding("error", "missing_prescription_revision_id", "Revision requires prescriptionRevisionId.", sourceExposureEventId));
    } else if (ids.has(revisionId)) {
      findings.push(prescriptionFinding("error", "duplicate_prescription_revision_id", "Prescription revision IDs must be unique.", revisionId));
    } else {
      ids.add(revisionId);
    }
    if (record.sourceExposureEventId !== sourceExposureEventId) {
      findings.push(
        prescriptionFinding(
          "error",
          "revision_source_exposure_mismatch",
          "Prescription revision must reference the same source exposure event.",
          revisionId,
        ),
      );
    }
    if (!isExplicitIsoWithTimezone(record.createdAt)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_revision_created_at",
          "Prescription revision createdAt must be supplied explicitly with timezone.",
          revisionId,
        ),
      );
    }
    if (!isOneOf(record.reasonCode, PRESCRIPTION_REVISION_REASON_CODES)) {
      findings.push(prescriptionFinding("error", "invalid_revision_reason_code", "Revision reason code is not canonical.", revisionId));
    }
    if (!isOneOf(record.revisionState, PRESCRIPTION_REVISION_STATES)) {
      findings.push(prescriptionFinding("error", "invalid_revision_state", "Revision state is not canonical.", revisionId));
    }
    if (record.finalForExecution === true) {
      finalCount += 1;
    }
    if (record.finalForExecution === true && record.revisionState !== "final_for_execution") {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_final_revision_state",
          "A final-for-execution revision must use final_for_execution state.",
          revisionId,
        ),
      );
    }
    if (record.revisionState === "superseded" && !isNonEmptyString(record.supersededByRevisionId)) {
      findings.push(
        prescriptionFinding(
          "error",
          "missing_superseded_revision_target",
          "A superseded revision must identify the revision that superseded it.",
          revisionId,
        ),
      );
    }
  }
  if (revisions.length > 0 && finalCount !== 1) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_final_prescription_revision_count",
        "Exactly one prescription revision may be final for one execution attempt.",
        sourceExposureEventId,
      ),
    );
  }
  return findings;
}

export function validatePrescriptionDoseBlocks(input: {
  readonly blocks: readonly PrescriptionDoseBlock[];
  readonly sourceExposureEventId: SourceExposureEventId;
  readonly legalDoseModes: readonly ExerciseDoseMode[];
}): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const ids = new Set<string>();
  for (const block of input.blocks) {
    const record = asRecord(block);
    if (!record) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_prescription_dose_block_object",
          "Prescription dose block must be a structured object.",
          input.sourceExposureEventId,
        ),
      );
      continue;
    }
    const blockId = stringOrUndefined(record.blockId);
    if (!blockId) {
      findings.push(
        prescriptionFinding(
          "error",
          "missing_prescription_dose_block_id",
          "Prescription dose blocks require stable block IDs.",
          input.sourceExposureEventId,
        ),
      );
    } else if (ids.has(blockId)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_prescription_dose_block_id",
          "Prescription dose block IDs must be unique within one source event.",
          blockId,
        ),
      );
    } else {
      ids.add(blockId);
    }
    if (record.sourceExposureEventId !== input.sourceExposureEventId) {
      findings.push(
        prescriptionFinding(
          "error",
          "dose_block_source_exposure_mismatch",
          "Dose block must remain inside its source exposure event.",
          blockId,
        ),
      );
    }
    if (!isOneOf(record.purpose, PRESCRIPTION_DOSE_BLOCK_PURPOSES)) {
      findings.push(prescriptionFinding("error", "invalid_dose_block_purpose", "Dose block purpose is not canonical.", blockId));
    }
    if (
      !isOneOf(
        record.contributionClassification,
        PRESCRIPTION_BLOCK_CONTRIBUTION_CLASSIFICATIONS,
      )
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_dose_block_contribution_classification",
          "Dose block contribution classification is not canonical.",
          blockId,
        ),
      );
    }
    if (
      record.purpose === "preparatory_acclimation" &&
      record.contributionClassification !== "not_weekly_developmental_credit"
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "preparatory_block_miscredited",
          "Preparatory acclimation blocks must not be counted as developmental weekly credit.",
          blockId,
        ),
      );
    }
    const doseRecord = asRecord(record.dose);
    const mode = doseRecord?.mode;
    if (!isOneOf(mode, input.legalDoseModes)) {
      findings.push(
        prescriptionFinding(
          "error",
          "unsupported_dose_mode_for_exercise",
          "Dose block mode must be legal for the selected exercise identity.",
          blockId,
        ),
      );
    }
    findings.push(...validateDose(record.dose as ExerciseDose, undefined, blockId));
  }
  findings.push(...validateBlockOrder(input.blocks, input.sourceExposureEventId));
  return findings;
}

export function validateExercisePrescriptionPlan(
  plan: ExercisePrescriptionPlan,
  knowledge: ExercisePrescriptionKnowledgeProfile,
): readonly PrescriptionValidationFinding[] {
  const sourceExposureEventId = plan.sourceExposureEvent.sourceExposureEventId;
  return [
    ...validateSourceExposureEventIdentity(plan.sourceExposureEvent),
    ...validatePrescriptionRevisionSet(
      [
        {
          prescriptionId: plan.prescriptionId,
          prescriptionRevisionId: plan.prescriptionRevisionId,
          sourceExposureEventId,
          basedOnRevisionId: null,
          reasonCode: "initial_compilation",
          createdAt: plan.provenance.sourceRef.includes("created-at:")
            ? plan.provenance.sourceRef.replace(/^.*created-at:/, "")
            : "1970-01-01T00:00:00Z",
          revisionState: "final_for_execution",
          finalForExecution: true,
          supersededByRevisionId: null,
          policyVersionRefs: [],
          changedFieldRefs: [],
          unresolvedRequirementRefs: plan.unresolvedRequirementRefs,
          provenance: plan.provenance,
        },
      ],
      sourceExposureEventId,
    ),
    ...validatePrescriptionDoseBlocks({
      blocks: plan.doseBlocks,
      sourceExposureEventId,
      legalDoseModes: [knowledge.primaryDoseMode, ...knowledge.legalAlternateDoseModes],
    }),
  ];
}

export function validatePerformanceBlockLinkage(
  linkage: ExercisePerformanceBlockLinkage,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  if (linkage.actualDoseAssumedFromPlan !== false) {
    findings.push(
      prescriptionFinding(
        "error",
        "actual_dose_assumed_from_plan",
        "Block performance must not assume actual dose from the planned dose.",
        linkage.sourceExposureEventId,
      ),
    );
  }
  if (linkage.actualTimingAssumedFromPlan !== false) {
    findings.push(
      prescriptionFinding(
        "error",
        "actual_timing_assumed_from_plan",
        "Block performance must not assume actual timing from planned timing.",
        linkage.sourceExposureEventId,
      ),
    );
  }
  const planned = new Set(linkage.plannedBlockIds);
  for (const result of linkage.blockResults) {
    if (
      result.plannedBlockId !== null &&
      !planned.has(result.plannedBlockId) &&
      result.completionStatus !== "additional_unplanned"
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "performance_block_unknown_planned_block",
          "Block performance result must link to a planned block or be explicit additional work.",
          result.performedBlockId,
        ),
      );
    }
    if (result.actualDose !== null) {
      findings.push(...validateDose(result.actualDose, undefined, result.performedBlockId));
    }
  }
  return findings;
}

export function validateReviewedPrescriptionPolicy(
  policy: ReviewedPrescriptionPolicy,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  if (!isNonEmptyString(policy.policyId)) {
    findings.push(prescriptionFinding("error", "missing_reviewed_policy_id", "Reviewed policy requires policyId."));
  }
  if (!isNonEmptyString(policy.version)) {
    findings.push(prescriptionFinding("error", "missing_reviewed_policy_version", "Reviewed policy requires version."));
  }
  if (!isExplicitIsoWithTimezone(policy.reviewedAt)) {
    findings.push(prescriptionFinding("error", "invalid_reviewed_policy_reviewed_at", "reviewedAt must be explicit ISO time with timezone."));
  }
  const ruleIds = new Set<string>();
  for (const rule of policy.rules) {
    if (!isNonEmptyString(rule.ruleId)) {
      findings.push(prescriptionFinding("error", "missing_reviewed_policy_rule_id", "Policy rule requires ruleId."));
    } else if (ruleIds.has(rule.ruleId)) {
      findings.push(prescriptionFinding("error", "duplicate_reviewed_policy_rule_id", "Policy rule IDs must be unique.", rule.ruleId));
    } else {
      ruleIds.add(rule.ruleId);
    }
    if (!isOneOf(rule.kind, REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS)) {
      findings.push(prescriptionFinding("error", "invalid_reviewed_policy_rule_kind", "Policy rule kind is not canonical.", rule.ruleId));
    }
  }
  for (const conflict of policy.conflicts) {
    if (conflict.resolution === "explicit_override") {
      for (const ruleId of conflict.ruleIds) {
        if (!policy.overrides.some((override) => (
          override.overridingRuleId === ruleId || override.overriddenRuleId === ruleId
        ))) {
          findings.push(
            prescriptionFinding(
              "error",
              "policy_conflict_missing_explicit_override",
              "A conflict marked explicit_override must reference explicit override relationships.",
              conflict.conflictId,
            ),
          );
        }
      }
    }
  }
  return findings;
}

function validateBlockOrder(
  blocks: readonly PrescriptionDoseBlock[],
  sourceExposureEventId: SourceExposureEventId,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const ids = new Set(blocks.map((block) => block.blockId));
  const byId = new Map(blocks.map((block) => [block.blockId, block]));
  for (const block of blocks) {
    if (!Number.isInteger(block.order.index) || block.order.index < 0) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_dose_block_order_index",
          "Dose block order index must be a non-negative integer.",
          block.blockId,
        ),
      );
    }
    for (const dependencyId of block.order.dependsOnBlockIds) {
      if (!ids.has(dependencyId)) {
        findings.push(
          prescriptionFinding(
            "error",
            "dose_block_missing_dependency",
            "Dose block dependency must reference another block in the same source event.",
            block.blockId,
          ),
        );
      }
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (blockId: string): boolean => {
    if (visiting.has(blockId)) {
      return false;
    }
    if (visited.has(blockId)) {
      return true;
    }
    visiting.add(blockId);
    const block = byId.get(blockId);
    for (const dependencyId of block?.order.dependsOnBlockIds ?? []) {
      if (!visit(dependencyId)) {
        return false;
      }
    }
    visiting.delete(blockId);
    visited.add(blockId);
    return true;
  };
  if (!blocks.every((block) => visit(block.blockId))) {
    findings.push(
      prescriptionFinding(
        "error",
        "dose_block_order_cycle",
        "Dose block dependencies must be acyclic.",
        sourceExposureEventId,
      ),
    );
  }
  const sorted = [...blocks].sort((left, right) => left.order.index - right.order.index);
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index]?.order.index !== index) {
      findings.push(
        prescriptionFinding(
          "error",
          "dose_block_order_gap",
          "Dose block order indexes must form a compact sequence.",
          sourceExposureEventId,
        ),
      );
      break;
    }
  }
  return findings;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stringOrUndefined(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}

function isOneOf<const T extends readonly unknown[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return values.includes(value);
}

function isExplicitIsoWithTimezone(value: unknown): value is ISODateTimeString {
  return isNonEmptyString(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function toSnake(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
