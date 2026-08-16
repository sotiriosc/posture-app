import type { ExperienceLevel, Side } from "../domain/primitives";
import type { ProgressionAxis } from "../domain/progression";
import type { SessionSection, TrainingRole } from "../domain/session";
import type { ExerciseDoseMode } from "../prescription/dose";
import type {
  EffortTarget,
  RangePrescription,
  SupportPrescription,
} from "../prescription/executionStandard";
import type { LoadTarget, LoadUnit } from "../prescription/load";
import type { PrescriptionLocalPurpose } from "../prescription/purposeResolution";
import type {
  EvidenceProvenance,
  ISODateTimeString,
  PrescriptionLaterality,
  PrescriptionSideBehavior,
} from "../prescription/types";

export interface VersionedContractReference<
  Id extends string = string,
  Version extends string = string,
> {
  readonly contractId: Id;
  readonly contractVersion: Version;
}

function reference<Id extends string, Version extends string>(
  contractId: Id,
  contractVersion: Version,
): Readonly<VersionedContractReference<Id, Version>> {
  return Object.freeze({ contractId, contractVersion });
}

export const ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE = reference(
  "ATHLETE_TRAINING_EXPERIENCE_PROFILE",
  "1.0.0",
);
export const EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE = reference(
  "EXERCISE_IDENTITY_FAMILIARITY_PROFILE",
  "1.0.0",
);
export const EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE = reference(
  "EXERCISE_REALIZATION_FAMILIARITY_PROFILE",
  "1.0.0",
);
export const ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE = reference(
  "ATHLETE_AUTHORED_PROGRAMMING_BRIEF",
  "1.0.0",
);
export const ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE = reference(
  "ATHLETE_SPECIALIZATION_PRIORITY_PROFILE",
  "1.0.0",
);
export const HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE = reference(
  "HABITUAL_TRAINING_EXPOSURE_PROFILE",
  "1.0.0",
);
export const EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE = reference(
  "EQUIPMENT_LOAD_REALIZATION_PROFILE",
  "1.0.0",
);
export const PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE = reference(
  "PROGRESSION_STARTING_POINT_POLICY_V1_EVIDENCE_LED",
  "1.0.0",
);
export const EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE = reference(
  "EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1",
  "1.0.0",
);
export const RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE = reference(
  "RETURN_OR_REBUILD_REALIZATION_POLICY_V1",
  "1.0.0",
);
export const PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE = reference(
  "PROGRESSION_AXIS_REALIZATION_OPTIONS",
  "1.0.0",
);
export const PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE = reference(
  "PRESCRIPTION_RAMP_UP_POLICY_V1_CONTEXT_SPECIFIC",
  "1.0.0",
);
export const ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE = reference(
  "ADVANCED_INTENSITY_TECHNIQUE_REQUEST",
  "1.0.0",
);

export const RECENT_TRAINING_CONSISTENCY_STATES = Object.freeze([
  "continuously_training",
  "mostly_consistent",
  "intermittent",
  "return_after_short_absence",
  "return_after_extended_absence",
  "currently_detrained",
  "unknown",
] as const);
export type RecentTrainingConsistencyState =
  (typeof RECENT_TRAINING_CONSISTENCY_STATES)[number];

export const RECENT_INTERRUPTION_STATES = Object.freeze([
  "none",
  "short_absence",
  "extended_absence",
  "currently_interrupted",
  "unknown",
] as const);
export type RecentInterruptionState = (typeof RECENT_INTERRUPTION_STATES)[number];

export interface YearRange {
  readonly min: number;
  readonly max: number | null;
}

export interface AthleteTrainingExperienceProfile {
  readonly contractReference: typeof ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly coarseExperienceLevel: ExperienceLevel;
  readonly lifetimeResistanceTrainingYears: YearRange | null;
  readonly consistentTrainingYears: YearRange | null;
  readonly recentConsistencyState: RecentTrainingConsistencyState;
  readonly recentInterruptionState: RecentInterruptionState;
  readonly lastConsistentTrainingDate: ISODateTimeString | null;
  readonly primaryTrainingDomains: readonly string[];
  readonly coachReviewed: boolean;
  readonly athleteReported: boolean;
  readonly evidenceRefs: readonly string[];
  readonly explicitUnknowns: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
  readonly evaluationTime: ISODateTimeString;
}

export const EXPERIENCE_AUTHORITY_ORDER = Object.freeze([
  "exact_completed_performance_current_realization",
  "repeated_completed_performance_related_realizations",
  "coach_reviewed_current_realization_history",
  "authenticated_athlete_current_realization_report",
  "identity_familiarity",
  "recent_training_consistency",
  "coarse_experience_level",
  "lifetime_training_years",
  "unknown",
] as const);
export type ExperienceAuthority = (typeof EXPERIENCE_AUTHORITY_ORDER)[number];

export const EXERCISE_IDENTITY_FAMILIARITY_STATES = Object.freeze([
  "never_exposed",
  "newly_introduced",
  "limited_exposure",
  "familiar",
  "highly_practiced",
  "historically_productive",
  "currently_productive",
  "historically_adverse",
  "stale_history",
  "unknown",
] as const);
export type ExerciseIdentityFamiliarityState =
  (typeof EXERCISE_IDENTITY_FAMILIARITY_STATES)[number];

export interface ExerciseIdentityFamiliarityProfile {
  readonly contractReference: typeof EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly exerciseId: string;
  readonly state: ExerciseIdentityFamiliarityState;
  readonly completedExposureCount: number | null;
  readonly lastExposureAt: ISODateTimeString | null;
  readonly evidenceRefs: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
  readonly evaluationTime: ISODateTimeString;
}

export const EXERCISE_REALIZATION_FAMILIARITY_STATES = Object.freeze([
  "exact_current_productive",
  "exact_current_tolerated",
  "exact_current_limited",
  "exact_current_adverse",
  "exact_historical_stale",
  "related_productive",
  "related_tolerated",
  "related_limited",
  "identity_only",
  "unknown",
] as const);
export type ExerciseRealizationFamiliarityState =
  (typeof EXERCISE_REALIZATION_FAMILIARITY_STATES)[number];

export const REALIZATION_FAMILIARITY_FRESHNESS_STATES = Object.freeze([
  "exact_current",
  "recent_policy_dependent",
  "historical_stale",
  "unknown",
] as const);
export type RealizationFamiliarityFreshnessState =
  (typeof REALIZATION_FAMILIARITY_FRESHNESS_STATES)[number];

export const REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED =
  "REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED" as const;

export interface ExerciseRealizationDimensions {
  readonly exerciseId: string;
  readonly doseMode: ExerciseDoseMode;
  readonly equipmentImplementId: string;
  readonly machineId: string | null;
  readonly support: SupportPrescription | null;
  readonly range: RangePrescription | null;
  readonly leverId: string | null;
  readonly laterality: PrescriptionLaterality | null;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly loadContextId: string | null;
  readonly effortContextId: string | null;
  readonly tempoContextId: string | null;
  readonly blockStructureId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly purpose: PrescriptionLocalPurpose;
  readonly sourceExposureEventId: string | null;
  readonly prescriptionRevisionId: string | null;
  readonly sequenceRevisionId: string | null;
}

export interface ExerciseRealizationFamiliarityProfile {
  readonly contractReference: typeof EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly realization: ExerciseRealizationDimensions;
  readonly state: ExerciseRealizationFamiliarityState;
  readonly freshness: RealizationFamiliarityFreshnessState;
  readonly relatedDifferenceDimensions: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
  readonly evaluatedAt: ISODateTimeString;
}

export type ProgrammingBriefReviewState =
  | "athlete_authored_unreviewed"
  | "coach_reviewed"
  | "owner_reviewed"
  | "rejected"
  | "unknown";

export interface AthleteAuthoredProgrammingBrief {
  readonly contractReference: typeof ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE;
  readonly briefId: string;
  readonly athleteId: string;
  readonly preferredStableExerciseIds: readonly string[];
  readonly dislikedExerciseIds: readonly string[];
  readonly specializationPriorityIds: readonly string[];
  readonly preferredSessionCount: number | null;
  readonly preferredFramework: string | null;
  readonly preferredSequenceAnchorIds: readonly string[];
  readonly recurringRitualPreferenceIds: readonly string[];
  readonly intensityTechniqueRequestIds: readonly string[];
  readonly exerciseSubstitutionRequests: readonly {
    readonly fromExerciseId: string;
    readonly toExerciseId: string;
  }[];
  readonly displayOnlyNotes: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
  readonly reviewState: ProgrammingBriefReviewState;
  readonly completedPerformanceClaimed: false;
  readonly equipmentCapabilityClaimed: false;
  readonly exactDoseAuthorityClaimed: false;
}

export type SpecializationTargetKind = "muscle" | "movement" | "action" | "skill";
export type SpecializationPriority = "primary" | "secondary" | "supporting";

export interface AthleteSpecializationPriority {
  readonly priorityId: string;
  readonly targetKind: SpecializationTargetKind;
  readonly targetId: string;
  readonly priority: SpecializationPriority;
  readonly goalRelationship: "primary_goal" | "secondary_goal" | "cross_goal_support";
  readonly plannedHorizon: string | null;
  readonly currentBaseline: string | null;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly reviewState: ProgrammingBriefReviewState;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface AthleteSpecializationPriorityProfile {
  readonly contractReference: typeof ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly priorities: readonly AthleteSpecializationPriority[];
  readonly unlimitedVolumeAuthorized: false;
  readonly exerciseSelectionAuthorized: false;
  readonly safetyOverrideAuthorized: false;
  readonly evaluatedAt: ISODateTimeString;
}

export const HABITUAL_EXPOSURE_STATES = Object.freeze([
  "established_stable_range",
  "established_high_but_tolerated",
  "established_low_but_productive",
  "recently_increased",
  "recently_decreased",
  "inconsistent",
  "stale",
  "restricted_legacy_context",
  "unknown",
] as const);
export type HabitualExposureState = (typeof HABITUAL_EXPOSURE_STATES)[number];

export type HabitualExposureView =
  | "local_purpose"
  | "weekly_objective"
  | "movement"
  | "muscle_contribution_relationship"
  | "direct_action"
  | "exercise_identity"
  | "dose_mode"
  | "section"
  | "session"
  | "week_horizon";

export interface HabitualExposureLane {
  readonly laneId: string;
  readonly view: HabitualExposureView;
  readonly targetId: string;
  readonly doseMode: ExerciseDoseMode;
  readonly completedSourceExposureEventIds: readonly string[];
  readonly completedDevelopmentalBlockCount: number;
  readonly completedSessionCount: number;
  readonly completedWeekCount: number;
  readonly state: HabitualExposureState;
  readonly materialAuthority: "completed_source_events" | "restricted_context_only";
  readonly fractionalSetEquivalent: null;
}

export interface HabitualTrainingExposureProfile {
  readonly contractReference: typeof HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly lanes: readonly HabitualExposureLane[];
  readonly userAuthoredDraftEventCount: 0;
  readonly incompatibleModesSummed: false;
  readonly provenance: readonly EvidenceProvenance[];
  readonly evaluationTime: ISODateTimeString;
}

export const PROPOSED_HABITUAL_EXPOSURE_COMPARISONS = Object.freeze([
  "below_habitual",
  "within_habitual",
  "modestly_above_habitual",
  "materially_above_habitual_review_required",
  "materially_below_habitual_review_required",
  "incomparable_modes",
  "unknown",
] as const);
export type ProposedHabitualExposureComparison =
  (typeof PROPOSED_HABITUAL_EXPOSURE_COMPARISONS)[number];

export interface HabitualExposureComparisonResult {
  readonly laneId: string | null;
  readonly comparison: ProposedHabitualExposureComparison;
  readonly habitualCompletedBlockCount: number | null;
  readonly proposedDevelopmentalBlockCount: number;
  readonly thresholdPolicyApplied: false;
  readonly universalPercentageApplied: false;
  readonly reviewRequired: boolean;
  readonly reasonCodes: readonly string[];
}

export const EQUIPMENT_IMPLEMENT_KINDS = Object.freeze([
  "dumbbell",
  "barbell",
  "smith_machine",
  "selectorized_machine",
  "plate_loaded_machine",
  "cable",
  "band",
  "bodyweight",
  "loaded_gait",
  "other",
] as const);
export type EquipmentImplementKind = (typeof EQUIPMENT_IMPLEMENT_KINDS)[number];

export interface EquipmentLoadMagnitudeCapability {
  readonly unit: LoadUnit | "machine_setting" | "band_level" | "not_applicable";
  readonly minimum: number | null;
  readonly maximum: number | null;
  readonly smallestIncrement: number | null;
  readonly exactAvailableValues: readonly number[] | null;
}

export interface EquipmentLoadRealizationProfile {
  readonly contractReference: typeof EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE;
  readonly profileId: string;
  readonly athleteId: string;
  readonly implementId: string;
  readonly implementKind: EquipmentImplementKind;
  readonly paired: boolean | null;
  readonly fixedOrAdjustable: "fixed" | "adjustable" | "mixed" | "not_applicable" | "unknown";
  readonly loadMagnitude: EquipmentLoadMagnitudeCapability;
  readonly asymmetricLoadingAvailable: boolean | null;
  readonly assistanceAvailable: boolean | null;
  readonly assistanceMagnitude: EquipmentLoadMagnitudeCapability | null;
  readonly externalLoadingAvailable: boolean | null;
  readonly counterweight: number | null;
  readonly machineId: string | null;
  readonly machineMechanism: "selectorized" | "plate_loaded" | "smith" | "not_applicable" | "unknown";
  readonly cableRatio: string | null;
  readonly resistanceCurveDescriptor: string | null;
  readonly bandType: string | null;
  readonly bandAnchor: string | null;
  readonly bandConfiguration: "single" | "doubled" | "not_applicable" | "unknown";
  readonly bandResistanceMeasured: boolean | null;
  readonly supportSetting: string | null;
  readonly rangeConstraints: readonly string[];
  readonly leverageOptions: readonly string[];
  readonly lateralityOptions: readonly PrescriptionLaterality[];
  readonly exactUnknowns: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
  readonly effectiveAt: ISODateTimeString;
}

export type EquipmentLoadRealizationStatus =
  | "exact_capability_available"
  | "effort_calibration_available"
  | "load_ceiling_reached"
  | "load_increment_unavailable"
  | "assistance_realization_available"
  | "external_load_realization_available"
  | "recomposition_required"
  | "equipment_realization_incomplete"
  | "load_not_applicable";

export interface EquipmentLoadRealizationResult {
  readonly profileId: string;
  readonly status: EquipmentLoadRealizationStatus;
  readonly selectedLoad: LoadTarget | null;
  readonly nextExactLoad: number | null;
  readonly loadCeilingVisible: boolean;
  readonly exactLoadGuessed: false;
  readonly bandKilogramInferenceApplied: false;
  readonly smithBarbellEquivalenceApplied: false;
  readonly candidateRecompositionRequired: boolean;
  readonly reasonCodes: readonly string[];
}

export type StartingPointEvidenceKind =
  | "exact_current_productive_realization"
  | "exact_current_tolerated_realization"
  | "related_productive_realization"
  | "coach_reviewed_current_load_context"
  | "athlete_reported_current_load_context"
  | "self_selected_effort_calibration"
  | "unknown";

export interface ProgressionStartingPointEvidence {
  readonly evidenceId: string;
  readonly kind: StartingPointEvidenceKind;
  readonly exerciseId: string;
  readonly exactRealizationMatch: boolean;
  readonly relatedDifferenceDimensions: readonly string[];
  readonly load: LoadTarget | null;
  readonly completedPerformanceRef: string | null;
  readonly productivelyTolerated: boolean;
  readonly stale: boolean;
  readonly sourceRef: string;
  readonly provenance: EvidenceProvenance;
}

export type ProgressionStartingPointStatus =
  | "exact_prior_load_retained"
  | "reviewed_load_requirement_applied"
  | "bodyweight_realization"
  | "self_selected_effort_calibration"
  | "load_ceiling_reached"
  | "load_increment_unavailable"
  | "load_not_applicable"
  | "load_unknown_review_required"
  | "candidate_composer_recomposition_required";

export interface SelfSelectedCalibrationPrescription {
  readonly targetDoseMode: ExerciseDoseMode;
  readonly targetRangeDescription: string;
  readonly targetEffort: EffortTarget;
  readonly legalSupport: SupportPrescription | null;
  readonly legalRange: RangePrescription | null;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly failureRequired: false;
  readonly stopConditions: readonly string[];
  readonly evidenceToRecord: readonly string[];
  readonly confirmationOnly: boolean;
  readonly automaticProgression: false;
}

export interface ProgressionStartingPointResult {
  readonly policyReference: typeof PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE;
  readonly status: ProgressionStartingPointStatus;
  readonly authorityUsed: ExperienceAuthority;
  readonly evidenceId: string | null;
  readonly selectedLoad: LoadTarget | null;
  readonly calibration: SelfSelectedCalibrationPrescription | null;
  readonly automaticProgressionApplied: false;
  readonly exactLoadGuessed: false;
  readonly reasonCodes: readonly string[];
}

export const EXPERIENCE_CONTEXT_REALIZATION_VARIANTS = Object.freeze([
  "exact_productive_continuity",
  "familiar_stable",
  "first_exposure_calibration",
  "identity_familiar_realization_new",
  "return_after_short_absence",
  "return_after_extended_absence",
  "pain_aware_regression",
  "equipment_changed",
  "support_or_range_changed",
  "side_specific_realization",
  "load_ceiling_recomposition",
  "time_constrained_preserve_purpose",
  "unknown_review_required",
] as const);
export type ExperienceContextRealizationVariant =
  (typeof EXPERIENCE_CONTEXT_REALIZATION_VARIANTS)[number];

export interface ExperienceContextRealizationResult {
  readonly policyReference: typeof EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE;
  readonly variant: ExperienceContextRealizationVariant;
  readonly selectedExistingVariant: "standard" | "regression" | "default" | null;
  readonly preserveExerciseIdentity: boolean;
  readonly calibrationRequired: boolean;
  readonly recompositionRequired: boolean;
  readonly purposeChanged: false;
  readonly exerciseIdentitySelected: false;
  readonly progressionAuthorized: false;
  readonly reasonCodes: readonly string[];
}

export type ReturnOrRebuildAbsenceState = "short" | "extended" | "detrained" | "unknown";

export interface ReturnOrRebuildRealizationResult {
  readonly policyReference: typeof RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE;
  readonly status:
    | "identity_preserved_calibration_required"
    | "regression_variant_calibration_required"
    | "confirmation_exposures_required"
    | "review_required";
  readonly preserveExerciseIdentity: boolean;
  readonly selectedExistingVariant: "regression" | null;
  readonly calibrationRequired: boolean;
  readonly boundedAcclimationPermitted: boolean;
  readonly progressionHeld: true;
  readonly confirmationExposureCount: number | null;
  readonly universalPercentageReductionApplied: false;
  readonly universalSetReductionApplied: false;
  readonly deloadApplied: false;
  readonly outcomeGoalChanged: false;
  readonly reasonCodes: readonly string[];
}

export type ProgressionAxisRealizationState =
  | "currently_realizable"
  | "blocked"
  | "equipment_dependent"
  | "policy_dependent";

export interface ProgressionAxisRealizationOption {
  readonly axis: ProgressionAxis;
  readonly state: ProgressionAxisRealizationState;
  readonly nextExactLoad: number | null;
  readonly reasonCodes: readonly string[];
}

export interface ProgressionAxisRealizationOptions {
  readonly contractReference: typeof PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE;
  readonly exerciseId: string;
  readonly doseMode: ExerciseDoseMode;
  readonly legalAxes: readonly ProgressionAxis[];
  readonly options: readonly ProgressionAxisRealizationOption[];
  readonly selectedAxis: null;
  readonly progressionAuthorized: false;
  readonly numericActionApplied: false;
  readonly longitudinalActionOwnerRequired: true;
}

export type RampLoadDelta = "none" | "small" | "moderate" | "large" | "unknown";

export interface PrescriptionRampUpBlock {
  readonly rampBlockId: string;
  readonly sourceExposureEventId: string;
  readonly ordinal: 1 | 2 | 3 | 4;
  readonly loadInstruction:
    | "exact_reviewed_load"
    | "self_selected_progressive_effort"
    | "bodyweight_leverage_rehearsal";
  readonly exactLoad: LoadTarget | null;
  readonly targetEffortDescription: string;
  readonly developmentalCredit: false;
  readonly completedPerformanceClaimed: false;
}

export interface PrescriptionRampUpResult {
  readonly policyReference: typeof PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE;
  readonly status: "not_required" | "resolved" | "policy_required" | "time_review_required";
  readonly blocks: readonly PrescriptionRampUpBlock[];
  readonly sameSourceExposureEvent: true;
  readonly developmentalCreditCount: 0;
  readonly exactLoadGuessed: false;
  readonly durationIncluded: boolean;
  readonly reasonCodes: readonly string[];
}

export const ADVANCED_INTENSITY_TECHNIQUES = Object.freeze([
  "drop_set",
  "rest_pause",
  "post_failure_partials",
  "lengthened_partials",
  "shortened_partials",
  "isometric_finish",
  "mechanical_drop",
  "cluster_set",
  "forced_repetitions",
  "unknown",
] as const);
export type AdvancedIntensityTechnique = (typeof ADVANCED_INTENSITY_TECHNIQUES)[number];

export interface AdvancedIntensityTechniqueRequest {
  readonly contractReference: typeof ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE;
  readonly requestId: string;
  readonly exerciseId: string;
  readonly targetBlockId: string;
  readonly technique: AdvancedIntensityTechnique;
  readonly intendedPurpose: PrescriptionLocalPurpose;
  readonly exactTrigger: string | null;
  readonly loadRepetitionTransition: string | null;
  readonly failureRelationship: string | null;
  readonly volumeRelationship: string | null;
  readonly source: "athlete" | "coach";
  readonly reviewStatus: ProgrammingBriefReviewState;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface AdvancedIntensityTechniqueBoundaryResult {
  readonly status: "ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED" | "NO_TECHNIQUE_REQUESTED";
  readonly requestIds: readonly string[];
  readonly productionPolicyCount: 0;
  readonly compiledTechniqueCount: 0;
  readonly flattenedTechniqueCount: 0;
  readonly advancedStatusAuthorizedTechnique: false;
}

export interface PainAwareRealizationContext {
  readonly relevant: boolean;
  readonly region: string | null;
  readonly side: Side | null;
  readonly explicitRestrictionIds: readonly string[];
  readonly diagnosisClaimed: false;
  readonly causalPostureClaimed: false;
  readonly successfulReExposure: boolean;
}
