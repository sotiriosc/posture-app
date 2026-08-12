import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BODY_REGIONS,
  MOVEMENT_ROLES,
  MUSCLE_GROUPS,
  REFERENCE_EXERCISES,
  type ExerciseDefinition,
} from "../../src";

export type UsageStatus = "FULLY_USED" | "PARTIALLY_USED" | "UNUSED";
export type TrunkExposureClass =
  | "DIRECT_DEVELOPMENTAL"
  | "MEANINGFUL_SECONDARY"
  | "INCIDENTAL_BRACING"
  | "NO_CURRENT_TRUNK_EVIDENCE";
export type LegacyMigrationClassification =
  | "PRESERVE_AS_DOMAIN_KNOWLEDGE"
  | "PRESERVE_AFTER_REVIEW"
  | "REDUNDANT"
  | "QUESTIONABLE"
  | "DO_NOT_MIGRATE";

export interface InventoryRow {
  readonly input: string;
  readonly giver: string;
  readonly currentReceiver: string;
  readonly output: string;
  readonly behavioralEffect: string;
  readonly traceVisibility: string;
  readonly usage: UsageStatus;
  readonly futureOwner: string;
}

export interface CatalogTrunkDecision {
  readonly exerciseId: string;
  readonly primaryTrunkRole: string;
  readonly secondaryTrunkRole: string;
  readonly exposureClass: TrunkExposureClass;
  readonly movementFunction: string;
  readonly evidence: string;
}

export interface CatalogTrunkRow extends CatalogTrunkDecision {
  readonly exerciseName: string;
  readonly loadingPotential: string;
  readonly progressionAxes: string;
  readonly painStressTags: string;
  readonly sectionRole: string;
  readonly phaseRole: string;
  readonly currentWeeklyCreditPossibility: string;
}

export interface FunctionalCoverageRow {
  readonly function: string;
  readonly currentTypeSupport: string;
  readonly currentExerciseSupport: string;
  readonly legacySupport: string;
  readonly assessmentSupport: string;
  readonly weeklyLedgerSupport: string;
  readonly gap: string;
  readonly recommendedOwner: string;
}

export interface LegacyMigrationDecision {
  readonly concept: string;
  readonly classification: LegacyMigrationClassification;
  readonly evidence: string;
  readonly decision: string;
}

export interface ArchitectureOption {
  readonly option: "A" | "B" | "C";
  readonly architecture: string;
  readonly clarity: string;
  readonly doubleCountRisk: string;
  readonly candidateIntelligence: string;
  readonly assessment: string;
  readonly weeklyVolume: string;
  readonly prescription: string;
  readonly catalogBurden: string;
  readonly extensibility: string;
  readonly verdict: string;
}

export interface TrunkCoreCoverageSnapshot {
  readonly referenceExerciseCount: number;
  readonly dedicatedCoreControlCount: number;
  readonly breathingResetCount: number;
  readonly primaryTrunkCount: number;
  readonly secondaryTrunkCount: number;
  readonly breathingRoleCount: number;
  readonly antiExtensionRoleCount: number;
  readonly antiRotationRoleCount: number;
  readonly carryRoleCount: number;
  readonly capacityTrainingRoleCount: number;
  readonly ribcageRegionCount: number;
  readonly lumbarSpineRegionCount: number;
  readonly pelvisRegionCount: number;
  readonly generalRegionCount: number;
  readonly trunkDemandLowCount: number;
  readonly trunkDemandModerateCount: number;
  readonly trunkDemandHighCount: number;
  readonly trunkDemandUnknownCount: number;
  readonly mechanicsAbsentCount: number;
  readonly trunkProfileCount: number;
  readonly acceptedTrunkFunctionCount: number;
  readonly unknownTrunkFunctionCount: number;
  readonly directDevelopmentalCount: number;
  readonly meaningfulSecondaryCount: number;
  readonly incidentalBracingCount: number;
  readonly noCurrentTrunkEvidenceCount: number;
}

export interface TrunkCoreDomainReviewData {
  readonly goldenAncestor: string;
  readonly snapshot: TrunkCoreCoverageSnapshot;
  readonly inventory: readonly InventoryRow[];
  readonly catalogRows: readonly CatalogTrunkRow[];
  readonly goalCoverage: readonly GoalCoverageRow[];
  readonly legacyDecisions: readonly LegacyMigrationDecision[];
  readonly functionalCoverage: readonly FunctionalCoverageRow[];
  readonly architectureOptions: readonly ArchitectureOption[];
  readonly exposurePolicy: readonly ExposurePolicyRow[];
  readonly decisions: TrunkCoreDecisions;
  readonly implementationOrder: readonly string[];
  readonly uncertainties: readonly string[];
  readonly classification: "TRUNK_CORE_CONTRACT_READY_FOR_OWNER_DECISION";
  readonly implementationStatus: "FIRST_TRUNK_PROFILE_TRANCHE_IMPLEMENTED";
}

interface TrunkCoreDecisions {
  readonly muscleGroup: "KEEP_TRUNK_UMBRELLA";
  readonly bodyRegion: "ABDOMINAL_WALL_USEFUL_LATER";
  readonly movementRolesToAdd: readonly [
    "anti_lateral_flexion_core",
    "trunk_flexion",
    "trunk_rotation",
    "loaded_bracing",
  ];
  readonly architectureOption: "B";
  readonly assessmentTiming: "BEFORE_SESSION_COMPOSER";
  readonly carryDoctrine: "FIRST_CLASS_CAPACITY_TRUNK_GAIT_NOT_MANDATORY_FINISHER";
}

interface GoalCoverageRow {
  readonly surface: string;
  readonly currentSupport: string;
  readonly finding: string;
}

interface ExposurePolicyRow {
  readonly class: string;
  readonly qualification: string;
  readonly ledgerCredit: string;
  readonly targetEffect: string;
}

const GOLDEN_ANCESTOR = "8af4934641c46da9abbe77a62881151cca9cbf34";

export const CURRENT_INVENTORY: readonly InventoryRow[] = [
  {
    input: "MuscleGroup.trunk on request, assessment signal, or exercise",
    giver: "Session/weekly intent, assessment normalization, reference catalog",
    currentReceiver: "Role eligibility, muscle-target score, assessment specificity/relevance",
    output: "Legal-pool truth, muscle-target contribution, generic trunk-control relevance",
    behavioralEffect: "Can require or prefer trunk candidates, but cannot distinguish abdominal, oblique, or posterior-trunk functions.",
    traceVisibility: "Eligibility reasons, muscle_target_fit, assessment relevance and demand traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence plus Weekly Development Ledger",
  },
  {
    input: "BodyRegion.ribcage",
    giver: "Exercise metadata, assessment or pain input",
    currentReceiver: "Assessment specificity/developmental relationship; pain trace preserves region",
    output: "Candidate-specific contextual evidence when the exercise also lists ribcage",
    behavioralEffect: "Can shape assessment relevance; canonical pain matching still keys on explicit stress tags, not region alone.",
    traceVisibility: "Assessment and canonical pain traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Assessment normalization and pain receiver policy",
  },
  {
    input: "BodyRegion.lumbar_spine",
    giver: "Exercise metadata, assessment, pain input, training need",
    currentReceiver: "Assessment relevance/developmental relationship, row observability, pain trace",
    output: "Lumbar context and candidate differentiation",
    behavioralEffect: "Useful localization, but it does not identify a trunk function and does not itself create a pain stress match.",
    traceVisibility: "Assessment, row-selection, and pain traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Assessment and pain policy",
  },
  {
    input: "BodyRegion.pelvis",
    giver: "Exercise metadata, assessment, pain input, training need",
    currentReceiver: "Assessment specificity/developmental relationship; pain trace",
    output: "Pelvic-region context",
    behavioralEffect: "Can increase assessment specificity but remains distinct from muscle-volume and function tracking.",
    traceVisibility: "Assessment and pain traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Assessment and pain policy",
  },
  {
    input: "BodyRegion.general",
    giver: "Domain input only",
    currentReceiver: "Generic region-capable contracts",
    output: "Broad non-localized region value",
    behavioralEffect: "No current reference exercise uses it and it supplies no trunk-specific meaning.",
    traceVisibility: "Only if supplied by a request or signal",
    usage: "UNUSED",
    futureOwner: "Input normalization",
  },
  {
    input: "Abdomen / abdominal_wall BodyRegion",
    giver: "Not representable in current V2",
    currentReceiver: "None",
    output: "None",
    behavioralEffect: "Anterior abdominal discomfort cannot be localized without misusing ribcage, lumbar_spine, pelvis, or general.",
    traceVisibility: "None",
    usage: "UNUSED",
    futureOwner: "Pain and assessment domain after a concrete intake use case",
  },
  {
    input: "MovementRole.breathing_position",
    giver: "Training need, phase intent, assessment signal, exercise metadata",
    currentReceiver: "Role eligibility/scoring and generic trunk assessment",
    output: "Breathing/position candidate match",
    behavioralEffect: "Truthfully distinguishes 90/90 Breathing, but no weekly receiver aggregates the exposure.",
    traceVisibility: "Eligibility and score reasons; assessment traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence and Weekly Development Ledger",
  },
  {
    input: "MovementRole.anti_extension_core",
    giver: "Training need, phase intent, assessment signal, exercise metadata",
    currentReceiver: "Role eligibility/scoring and generic trunk assessment",
    output: "Anti-extension candidate match",
    behavioralEffect: "Separates the three tagged exercises from unrelated candidates, but direct and secondary use are not distinguished.",
    traceVisibility: "Eligibility and score reasons; assessment traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence, Composer, and ledger",
  },
  {
    input: "MovementRole.anti_rotation_core",
    giver: "Training need, assessment signal, exercise metadata",
    currentReceiver: "Role eligibility/scoring and generic trunk assessment",
    output: "Anti-rotation candidate match",
    behavioralEffect: "Currently identifies only Pallof Press in the reference catalog.",
    traceVisibility: "Eligibility and score reasons; assessment traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence, Composer, and ledger",
  },
  {
    input: "MovementRole.carry",
    giver: "Training need or phase capability contract",
    currentReceiver: "Role eligibility/scoring can consume it",
    output: "No legal reference candidate because the catalog contains no carry",
    behavioralEffect: "The type is present but cannot produce a session or weekly exposure today.",
    traceVisibility: "Rejection traces only when requested",
    usage: "UNUSED",
    futureOwner: "Catalog curation, prescription, Composer, and ledger",
  },
  {
    input: "ExerciseFamily.core_control",
    giver: "Reference exercise metadata",
    currentReceiver: "Personal block eligibility",
    output: "Family-level personal block match",
    behavioralEffect: "Does not itself improve ranking or distinguish core functions.",
    traceVisibility: "Personal-block rejection reason",
    usage: "PARTIALLY_USED",
    futureOwner: "Catalog taxonomy and personal-block policy",
  },
  {
    input: "ExerciseFamily.breathing_reset",
    giver: "Reference exercise metadata",
    currentReceiver: "Personal block eligibility",
    output: "Family-level personal block match",
    behavioralEffect: "Preserves catalog identity; role and section metadata do the candidate-selection work.",
    traceVisibility: "Personal-block rejection reason",
    usage: "PARTIALLY_USED",
    futureOwner: "Catalog taxonomy",
  },
  {
    input: "Exercise mechanics: trunk_control",
    giver: "Reference exercise mechanics profile",
    currentReceiver: "Assessment demand/capability comparison, transition comparison, row observability",
    output: "Generic low/moderate/high trunk-control demand",
    behavioralEffect: "Can influence relevant assessment scoring, but collapses all trunk functions into one dimension.",
    traceVisibility: "Assessment demand traces, transition traces, row-selection trace",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence mechanics contract",
  },
  {
    input: "ExerciseMechanicsProfile.trunkMechanics",
    giver: "Human-reviewed exercise knowledge",
    currentReceiver: "Pure validation and buildTrunkMechanicsTrace",
    output: "Eight field-level trunk-function annotations or explicit profile-unavailable trace evidence",
    behavioralEffect: "Observability only; no legality, score, pain, phase, assessment, or transition effect.",
    traceVisibility: "TrunkMechanicsTrace exposes level, review status, source, provenance, and notes",
    usage: "PARTIALLY_USED",
    futureOwner: "Reference catalog curation before trunk assessment features",
  },
  {
    input: "Exercise mechanics: stability and coordination",
    giver: "Mechanics annotations or loading-profile fallback",
    currentReceiver: "Assessment demand/capability and transition comparison",
    output: "General demand and transition deltas",
    behavioralEffect: "Useful context, but neither field identifies which trunk function creates the demand.",
    traceVisibility: "Assessment and transition traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Candidate Intelligence mechanics contract",
  },
  {
    input: "Exercise mechanics: range and joint_control",
    giver: "Mechanics annotations or temporary skill-demand proxy",
    currentReceiver: "Assessment demand/capability and transition comparison",
    output: "Range/joint-control demand, sometimes review-qualified",
    behavioralEffect: "Cannot substitute for controlled trunk flexion or rotation semantics.",
    traceVisibility: "Assessment and transition traces include source/review status",
    usage: "PARTIALLY_USED",
    futureOwner: "Mechanics review",
  },
  {
    input: "AssessmentSignal movementRole / muscleGroup / region",
    giver: "Assessment adapter or fixture",
    currentReceiver: "signalIsTrunk, specificity, relevance, demand/capability match",
    output: "Generic trunk_control assessment influence",
    behavioralEffect: "Candidate-specific and role-bounded, but cannot express a normalized trunk feature beyond generic control.",
    traceVisibility: "Assessment relevance, interpretation, capability, demand, and relationship traces",
    usage: "PARTIALLY_USED",
    futureOwner: "Assessment semantics",
  },
  {
    input: "AssessmentFeature for trunk function",
    giver: "Not representable; current features are scapular only",
    currentReceiver: "None",
    output: "None",
    behavioralEffect: "No feature-specific anti-extension, rotational, lateral, loaded-bracing, or ribcage-pelvis evidence can be normalized.",
    traceVisibility: "None",
    usage: "UNUSED",
    futureOwner: "Assessment semantics before Session Composer",
  },
  {
    input: "WeeklyIntent.movementExposure",
    giver: "Future week planner",
    currentReceiver: "Week optimizer contract only",
    output: "Requested movement-role counts",
    behavioralEffect: "No current implementation evaluates or fulfills the target.",
    traceVisibility: "WeeklyIntent can be attached to DecisionTrace, but the candidate lab does not produce ledger effects.",
    usage: "UNUSED",
    futureOwner: "Weekly Development Ledger",
  },
  {
    input: "WeeklyIntent.muscleExposure",
    giver: "Future week planner",
    currentReceiver: "Week optimizer contract only",
    output: "Requested muscle-group counts",
    behavioralEffect: "Could name trunk, but has no direct/secondary/capacity distinction or implemented receiver.",
    traceVisibility: "Contract-level only",
    usage: "UNUSED",
    futureOwner: "Weekly Development Ledger",
  },
  {
    input: "WeeklyIntent.volumeIntent",
    giver: "Future week planner",
    currentReceiver: "Week optimizer contract only",
    output: "One global qualitative volume label",
    behavioralEffect: "Cannot express direct trunk hypertrophy volume or function-specific exposure.",
    traceVisibility: "Contract-level only",
    usage: "UNUSED",
    futureOwner: "Weekly Development Ledger and prescription",
  },
  {
    input: "TrainingStimulusSummary movement/muscle/body-region fields",
    giver: "Future week evaluation",
    currentReceiver: "WeekEvaluation contract",
    output: "Potential aggregate exposure and stress summary",
    behavioralEffect: "No implementation computes it; body-region stress must not be repurposed as muscle volume.",
    traceVisibility: "WeekEvaluation/DecisionTrace contract only",
    usage: "UNUSED",
    futureOwner: "Weekly Development Ledger",
  },
] as const;

export const CATALOG_TRUNK_DECISIONS: readonly CatalogTrunkDecision[] = [
  {
    exerciseId: "ninety-ninety-breathing",
    primaryTrunkRole: "Breathing / ribcage-pelvis position",
    secondaryTrunkRole: "Anti-extension position control",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "breathing high; anti-extension low; loaded bracing none; gait transfer none; four functions unknown",
    evidence: "Owner-reviewed profile cites explicit roles, trunk primary, floor/supine support, and low trunk_control.",
  },
  {
    exerciseId: "serratus-wall-slide",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Low positional bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "Generic trunk control only; no trunk movement role",
    evidence: "trunk_control is low and trunk is not a listed muscle.",
  },
  {
    exerciseId: "dead-bug",
    primaryTrunkRole: "Anti-extension control",
    secondaryTrunkRole: "Ribcage-pelvis coordination is plausible but not separately typed",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "anti-extension high; loaded bracing none; gait transfer none; five functions unknown",
    evidence: "Owner-reviewed profile cites core_control, anti_extension_core, trunk primary, floor/supine support, and moderate trunk_control.",
  },
  {
    exerciseId: "push-up",
    primaryTrunkRole: "None; horizontal push is primary",
    secondaryTrunkRole: "Anti-extension plank control",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "anti_extension_core (typed secondary role)",
    evidence: "Trunk is secondary and trunk_control is moderate.",
  },
  {
    exerciseId: "dumbbell-bench-press",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Supported low bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "machine-chest-press",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Machine-supported low bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "cable-chest-fly",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "chest-supported-dumbbell-row",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Support intentionally limits trunk demand",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low and chest support is explicit.",
  },
  {
    exerciseId: "one-arm-dumbbell-row",
    primaryTrunkRole: "None; horizontal pull is primary",
    secondaryTrunkRole: "Loaded bracing / anti-rotation candidate (needs review)",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "High generic trunk control; specific function not typed",
    evidence: "Trunk is secondary and trunk_control is high in an unsupported unilateral setup.",
  },
  {
    exerciseId: "machine-row",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Machine-supported low bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "seated-cable-row",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Stable seated low bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "band-row",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Low stance/posture bracing",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    primaryTrunkRole: "None; vertical push is primary",
    secondaryTrunkRole: "Loaded bracing / extension control candidate (needs review)",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "Moderate generic trunk control; specific function not typed",
    evidence: "Trunk is secondary, trunk_control is moderate, and loaded_spinal_extension is tagged.",
  },
  {
    exerciseId: "lat-pulldown",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "band-lat-pulldown",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "goblet-squat",
    primaryTrunkRole: "None; squat is primary",
    secondaryTrunkRole: "Anterior-load bracing",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "Moderate generic trunk control; loaded bracing not typed",
    evidence: "Trunk is secondary and trunk_control is moderate.",
  },
  {
    exerciseId: "leg-press",
    primaryTrunkRole: "None",
    secondaryTrunkRole: "Seat/back-supported low demand",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk function typed",
    evidence: "trunk_control is low; trunk is not a listed muscle.",
  },
  {
    exerciseId: "bodyweight-box-squat",
    primaryTrunkRole: "None; squat preparation is primary",
    secondaryTrunkRole: "Low unloaded position control",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "Low generic trunk control; specific function not typed",
    evidence: "Trunk is secondary but trunk_control and loading potential are low.",
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    primaryTrunkRole: "None; hinge is primary",
    secondaryTrunkRole: "Loaded bracing and posterior-trunk contribution (needs review)",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "High generic trunk control; loaded bracing not typed",
    evidence: "Trunk is secondary and trunk_control is high under loaded hinge demand.",
  },
  {
    exerciseId: "cable-pull-through",
    primaryTrunkRole: "None; hinge is primary",
    secondaryTrunkRole: "Loaded bracing",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "Moderate generic trunk control; loaded bracing not typed",
    evidence: "Trunk is secondary and trunk_control is moderate.",
  },
  {
    exerciseId: "split-squat",
    primaryTrunkRole: "None; unilateral lower work is primary",
    secondaryTrunkRole: "Lateral/rotational stance control candidate (needs review)",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "Moderate generic trunk control; lateral function not typed",
    evidence: "Trunk is secondary and trunk_control is moderate.",
  },
  {
    exerciseId: "step-up",
    primaryTrunkRole: "None; unilateral lower work is primary",
    secondaryTrunkRole: "Gait/load-transfer and lateral control candidate (needs review)",
    exposureClass: "MEANINGFUL_SECONDARY",
    movementFunction: "Moderate generic trunk control; gait-transfer function not typed",
    evidence: "Trunk is secondary and trunk_control is moderate.",
  },
  {
    exerciseId: "lying-leg-curl",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "glute-bridge",
    primaryTrunkRole: "None; glute development is primary",
    secondaryTrunkRole: "Trunk listed, but demand/function are unknown",
    exposureClass: "INCIDENTAL_BRACING",
    movementFunction: "No trunk mechanics profile",
    evidence: "Trunk is secondary, but mechanics are absent; developmental credit is not justified.",
  },
  {
    exerciseId: "dumbbell-lateral-raise",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "reverse-pec-deck",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "Unknown",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "trunk_control is explicitly unknown",
    evidence: "Unknown is not evidence of contribution.",
  },
  {
    exerciseId: "band-face-pull",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "Unknown",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "trunk_control is explicitly unknown",
    evidence: "Unknown is not evidence of contribution.",
  },
  {
    exerciseId: "dumbbell-curl",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "cable-triceps-pressdown",
    primaryTrunkRole: "None modeled",
    secondaryTrunkRole: "None modeled",
    exposureClass: "NO_CURRENT_TRUNK_EVIDENCE",
    movementFunction: "No trunk mechanics profile",
    evidence: "No trunk muscle, role, region, or mechanics annotation.",
  },
  {
    exerciseId: "pallof-press",
    primaryTrunkRole: "Anti-rotation control",
    secondaryTrunkRole: "Standing position / hip contribution",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "anti-rotation high; controlled rotation none; gait transfer none; five functions unknown",
    evidence: "Owner-reviewed profile cites core_control, anti_rotation_core, trunk primary, standing support, and high trunk_control.",
  },
  {
    exerciseId: "forearm-plank",
    primaryTrunkRole: "Anti-extension control",
    secondaryTrunkRole: "Upper-limb support control",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "anti-extension high; loaded bracing none",
    evidence: "Owner-reviewed anti-extension role, complete trunk profile, and forearm-support identity.",
  },
  {
    exerciseId: "forearm-side-plank",
    primaryTrunkRole: "Anti-lateral-flexion control",
    secondaryTrunkRole: "Side-specific upper-limb support control",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "anti-lateral-flexion high; loaded bracing none",
    evidence: "Owner-reviewed anti-lateral role, side-support mechanics, and intrinsic lateral trunk exposure.",
  },
  {
    exerciseId: "machine-abdominal-crunch",
    primaryTrunkRole: "Controlled trunk flexion",
    secondaryTrunkRole: "None",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "controlled flexion high",
    evidence: "Owner-reviewed trunk-flexion role, machine-guided mechanics, and intrinsic loaded-flexion exposure.",
  },
  {
    exerciseId: "half-kneeling-high-to-low-cable-chop",
    primaryTrunkRole: "Controlled trunk rotation",
    secondaryTrunkRole: "Half-kneeling position control",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "controlled rotation high; anti-rotation none",
    evidence: "Owner-reviewed trunk-rotation role, high-cable path, and intrinsic loaded-rotation exposure.",
  },
  {
    exerciseId: "farmer-carry",
    primaryTrunkRole: "Loaded bracing and gait/load transfer",
    secondaryTrunkRole: "Grip and whole-body capacity",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "loaded bracing high; gait/load transfer high",
    evidence: "Owner-reviewed carry and loaded-bracing roles with intrinsic loaded gait and grip loading.",
  },
  {
    exerciseId: "suitcase-carry",
    primaryTrunkRole: "Loaded bracing and anti-lateral-flexion control",
    secondaryTrunkRole: "Unilateral gait/load transfer and grip capacity",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "anti-lateral-flexion high; loaded bracing high; gait/load transfer high",
    evidence: "Owner-reviewed unilateral carry identity with intrinsic gait, grip, and lateral trunk loading.",
  },
  {
    exerciseId: "wall-supported-suitcase-march",
    primaryTrunkRole: "Support-modified loaded bracing",
    secondaryTrunkRole: "Stationary loaded-march capacity",
    exposureClass: "DIRECT_DEVELOPMENTAL",
    movementFunction: "loaded bracing moderate; no accepted gait/load-transfer claim",
    evidence: "Owner-reviewed loaded-bracing role with intrinsic loaded march and no carry, gait, distance, or anti-lateral role truth.",
  },
] as const;

export const LEGACY_MIGRATION_DECISIONS: readonly LegacyMigrationDecision[] = [
  {
    concept: "Dead Bug as low-complexity anti-extension control",
    classification: "PRESERVE_AS_DOMAIN_KNOWLEDGE",
    evidence: "Golden exercises.ts:235-252; already represented in V2.",
    decision: "Keep the function and scalable range/lever concept; re-review all dosage and phase context.",
  },
  {
    concept: "Plank, hollow-body hold, and rollout anti-extension runway",
    classification: "PRESERVE_AS_DOMAIN_KNOWLEDGE",
    evidence: "Golden exercises.ts:1233-1249, 1366-1382, 4564-4581.",
    decision: "Preserve the need for a progressively overloadable anti-extension runway, not the exact legacy links.",
  },
  {
    concept: "Pallof press as anti-rotation development",
    classification: "PRESERVE_AS_DOMAIN_KNOWLEDGE",
    evidence: "Golden exercises.ts:643-657 and 4338-4355; already represented in V2.",
    decision: "Keep anti-rotation identity and resistance-path variants under one reviewed function family.",
  },
  {
    concept: "Side-plank family as lateral trunk control",
    classification: "PRESERVE_AS_DOMAIN_KNOWLEDGE",
    evidence: "Golden exercises.ts:1252-1267 and 2210-2225.",
    decision: "Preserve anti-lateral-flexion/lateral-control knowledge; do not preserve the anti-rotation-only label.",
  },
  {
    concept: "Bilateral farmer and unilateral suitcase carry distinction",
    classification: "PRESERVE_AS_DOMAIN_KNOWLEDGE",
    evidence: "Golden exercises.ts:2140-2173.",
    decision: "Keep loaded gait, laterality, grip, and trunk-function distinctions as first-class reviewed metadata.",
  },
  {
    concept: "Standing brace march and wall-supported carry-march regressions",
    classification: "PRESERVE_AFTER_REVIEW",
    evidence: "Golden exercises.ts:255-306 and 4661-4717.",
    decision: "Consolidate duplicates, then review support, gait, laterality, load, and prescription units.",
  },
  {
    concept: "Band-offset and dumbbell suitcase march/hold variants",
    classification: "PRESERVE_AFTER_REVIEW",
    evidence: "Golden exercises.ts:291-306, 2176-2207, 4545-4562.",
    decision: "Preserve the regression/equipment ideas only after distinguishing stationary holds, marches, and true carries.",
  },
  {
    concept: "Woodchop / controlled-rotation work",
    classification: "PRESERVE_AFTER_REVIEW",
    evidence: "Golden exercises.ts:1709-1723 and 4358-4375.",
    decision: "Keep controlled rotation as distinct from anti-rotation; review hip, knee, lumbar, and shoulder demands.",
  },
  {
    concept: "Machine abdominal crunch for direct shortening/flexion",
    classification: "PRESERVE_AFTER_REVIEW",
    evidence: "Golden exercises.ts:4378-4395.",
    decision: "Preserve the hypertrophy use case; correct its function, machine-fit, range, and pain metadata before migration.",
  },
  {
    concept: "Hanging knee/leg raise and suspension core families",
    classification: "PRESERVE_AFTER_REVIEW",
    evidence: "Golden exercises.ts:3191-3378.",
    decision: "Retain as catalog candidates only after reviewing shoulder/grip prerequisites, hip-flexor contribution, function, and dosage.",
  },
  {
    concept: "Band and cable Pallof as separate domain functions",
    classification: "REDUNDANT",
    evidence: "Golden exercises.ts:643-657 and 4338-4355.",
    decision: "Treat as resistance-path/equipment variants of anti-rotation, not distinct movement functions.",
  },
  {
    concept: "Multiple near-duplicate unloaded brace/march entries",
    classification: "REDUNDANT",
    evidence: "Golden exercises.ts:255-306 and 4661-4717.",
    decision: "Consolidate to reviewed setup variants instead of multiplying catalog rows.",
  },
  {
    concept: "Dead Bug -> Plank -> Hollow -> Rollout exact progression chain",
    classification: "QUESTIONABLE",
    evidence: "Golden progressionOf/regressionOf fields at exercises.ts:235-240, 1233-1239, 1366-1372, 4564-4571.",
    decision: "The direction is plausible, but transitions require capability, support, shoulder, range, and dosage evidence rather than a universal ladder.",
  },
  {
    concept: "Pallof -> woodchop as a strict progression",
    classification: "QUESTIONABLE",
    evidence: "Golden exercises.ts:643-648 and 4358-4365.",
    decision: "This changes anti-rotation to controlled rotation and is a feature shift, not an automatic progression.",
  },
  {
    concept: "Generic core/obliques strings as sufficient anatomy and function",
    classification: "QUESTIONABLE",
    evidence: "Golden Exercise.muscleGroups and movementPattern are open string arrays.",
    decision: "Retain useful anatomical context during review, but do not split V2 MuscleGroup or infer function from prose.",
  },
  {
    concept: "Name/tag/prose sniffing to infer core family and carry type",
    classification: "DO_NOT_MIGRATE",
    evidence: "Golden exercises.ts:4950-5123 and threeDayCoachPolicy.ts:473-511.",
    decision: "Replace with explicit typed roles and reviewed mechanics provenance.",
  },
  {
    concept: "One-hit generic core quotas for every user",
    classification: "DO_NOT_MIGRATE",
    evidence: "Golden quotaRegistry.ts gives fixed core/coreStability minima before goal-specific trunk semantics.",
    decision: "Use adaptive targets and separate direct, secondary, and capacity channels; no universal flexion or carry quota.",
  },
  {
    concept: "Pain contraindication prose as automatic engine authority",
    classification: "DO_NOT_MIGRATE",
    evidence: "Golden exercise entries mix free-text painContraindications and contraindications.",
    decision: "Preserve concerns only after normalized region/stress review; prose cannot hard-gate V2.",
  },
] as const;

export const FUNCTIONAL_COVERAGE: readonly FunctionalCoverageRow[] = [
  {
    function: "Breathing / ribcage-pelvis position",
    currentTypeSupport: "breathing_position role plus optional breathingPressureCoordination evidence",
    currentExerciseSupport: "90/90 Breathing has an owner-reviewed high breathing/pressure profile",
    legacySupport: "90/90 Breathing and brace-oriented preparation",
    assessmentSupport: "Generic role/muscle/region signal; no normalized feature",
    weeklyLedgerSupport: "movementExposure can name the role; no receiver",
    gap: "One profiled low-load option and no reviewed breathing progression family",
    recommendedOwner: "Catalog + trunk mechanics + assessment",
  },
  {
    function: "Anti-extension",
    currentTypeSupport: "anti_extension_core role plus optional antiExtensionContribution evidence",
    currentExerciseSupport: "90/90 low and Dead Bug high are profiled; Push-Up remains approved but deferred",
    legacySupport: "Dead Bug, Plank, Hollow, Rollout, hanging/suspension variants",
    assessmentSupport: "Role-specific input collapses to trunk_control",
    weeklyLedgerSupport: "Role target is representable; direct/secondary credit is not",
    gap: "No reviewed direct loading runway beyond Dead Bug; Push-Up is secondary",
    recommendedOwner: "Catalog + mechanics + ledger",
  },
  {
    function: "Anti-rotation",
    currentTypeSupport: "anti_rotation_core role plus optional antiRotationContribution evidence",
    currentExerciseSupport: "Pallof Press has owner-reviewed high anti-rotation expression",
    legacySupport: "Band/cable Pallof, anti-rotation holds, offset marches",
    assessmentSupport: "Role-specific input collapses to trunk_control",
    weeklyLedgerSupport: "Role target is representable; no receiver",
    gap: "Single exercise and no reviewed regression/loading family",
    recommendedOwner: "Catalog + mechanics + ledger",
  },
  {
    function: "Anti-lateral flexion",
    currentTypeSupport: "anti_lateral_flexion_core role plus optional antiLateralFlexionContribution evidence",
    currentExerciseSupport: "No direct exercise; unilateral work has only generic trunk demand",
    legacySupport: "Side Plank, Side Plank Star, Suitcase Carry/Hold/March",
    assessmentSupport: "Only generic trunk muscle/region signals",
    weeklyLedgerSupport: "Movement role is typed; no ledger receiver",
    gap: "No reviewed reference candidate, assessment feature, or exposure-credit receiver",
    recommendedOwner: "Catalog + assessment + ledger",
  },
  {
    function: "Controlled flexion / abdominal shortening",
    currentTypeSupport: "trunk_flexion role plus optional controlledFlexionContribution evidence",
    currentExerciseSupport: "None",
    legacySupport: "Machine Ab Crunch; hanging raises require function review",
    assessmentSupport: "Only generic trunk muscle/region signals",
    weeklyLedgerSupport: "Movement role is typed; no direct-volume lane",
    gap: "No reviewed direct progressively overloadable shortening exercise",
    recommendedOwner: "Catalog + prescription + ledger",
  },
  {
    function: "Controlled rotation",
    currentTypeSupport: "trunk_rotation role plus optional controlledRotationContribution evidence",
    currentExerciseSupport: "No positive expression; Pallof has reviewed none because it resists rotation",
    legacySupport: "Band/Cable Woodchop with metadata caveats",
    assessmentSupport: "Only generic trunk muscle/region signals",
    weeklyLedgerSupport: "Movement role is typed; no ledger receiver",
    gap: "No reviewed rotation candidate or normalized assessment feature",
    recommendedOwner: "Catalog + assessment",
  },
  {
    function: "Loaded bracing",
    currentTypeSupport: "loaded_bracing role plus optional loadedBracingContribution evidence",
    currentExerciseSupport: "Several compounds have moderate/high demand but no loaded_bracing role",
    legacySupport: "Compounds, brace marches, carries",
    assessmentSupport: "Generic trunk_control demand/capability comparison",
    weeklyLedgerSupport: "At most coarse trunk muscle exposure; no secondary lane",
    gap: "No reviewed positive loaded-bracing profile, direct-role candidate, or secondary ledger lane",
    recommendedOwner: "Catalog + ledger; role only when bracing is the selection purpose",
  },
  {
    function: "Loaded gait / carries",
    currentTypeSupport: "carry role, capacity TrainingRole, and optional gaitLoadTransferContribution evidence",
    currentExerciseSupport: "Farmer and suitcase carry plus three capacity-role exercises",
    legacySupport: "Farmer, suitcase, band/dumbbell march and supported regressions",
    assessmentSupport: "carry is not classified as a direct trunk role today",
    weeklyLedgerSupport: "movementExposure can name carry; no receiver or prescription units",
    gap: "No catalog, laterality, gait, grip, shoulder, fatigue, or dose contract",
    recommendedOwner: "Catalog + prescription + Composer + ledger",
  },
  {
    function: "Posterior-trunk contribution",
    currentTypeSupport: "trunk muscle, hinge role, trunk_control and spinal stress tags",
    currentExerciseSupport: "RDL and pull-through provide secondary evidence; no direct posterior-trunk exercise",
    legacySupport: "Hinges/back-extension concepts, often coarsely tagged",
    assessmentSupport: "Generic trunk/lumbar signal only",
    weeklyLedgerSupport: "No direct/secondary distinction",
    gap: "Anatomical contribution and loaded-bracing function are conflated",
    recommendedOwner: "Mechanics + catalog review + ledger",
  },
] as const;

export const ARCHITECTURE_OPTIONS: readonly ArchitectureOption[] = [
  {
    option: "A",
    architecture: "Keep trunk; expand MovementRole only",
    clarity: "Good for explicit selection intent, weak for secondary mechanics",
    doubleCountRisk: "Low",
    candidateIntelligence: "Can rank direct roles, cannot compare how compounds express them",
    assessment: "Role signals improve; feature evidence remains coarse",
    weeklyVolume: "Direct functions possible; secondary/capacity classification remains weak",
    prescription: "Roles do not encode demand, laterality, or gait/load transfer",
    catalogBurden: "Low",
    extensibility: "Moderate; pressure to overload MovementRole later",
    verdict: "Insufficient",
  },
  {
    option: "B",
    architecture: "Keep trunk; expand MovementRole; add compact reviewed TrunkMechanicsProfile",
    clarity: "High: intent and exercise expression remain separate",
    doubleCountRisk: "Low when ledger lanes preserve one source exposure",
    candidateIntelligence: "Supports direct role truth plus candidate-specific demand/function evidence",
    assessment: "Supports normalized feature matching without inventing diagnosis",
    weeklyVolume: "Supports direct, secondary, incidental, and capacity channels",
    prescription: "Can pair function with loading, support, laterality, and dose",
    catalogBurden: "Moderate human review burden",
    extensibility: "High without splitting muscle volume prematurely",
    verdict: "RECOMMENDED",
  },
  {
    option: "C",
    architecture: "Split trunk into several MuscleGroups",
    clarity: "Anatomically tempting but does not by itself describe function",
    doubleCountRisk: "High across compounds and direct work",
    candidateIntelligence: "More target labels, little mechanics truth",
    assessment: "Would imply anatomical precision current inputs do not provide",
    weeklyVolume: "High risk of counting one set in several muscle buckets",
    prescription: "Still needs roles and mechanics",
    catalogBurden: "High",
    extensibility: "Poor until evidence and credit semantics are settled",
    verdict: "DEFER / DO NOT SELECT NOW",
  },
] as const;

export const EXPOSURE_POLICY: readonly ExposurePolicyRow[] = [
  {
    class: "DIRECT DEVELOPMENTAL SET/UNIT",
    qualification: "The exercise is intentionally selected for a reviewed trunk function in the requested role/section.",
    ledgerCredit: "Record completed sets/reps or an explicit non-set dose against direct trunk development and the function.",
    targetEffect: "May satisfy an activated direct-function target; it is not automatically a hypertrophy set unless the prescription is a developmental set.",
  },
  {
    class: "MEANINGFUL SECONDARY EXPOSURE",
    qualification: "Reviewed mechanics show material trunk demand, but another movement/muscle is the primary training purpose.",
    ledgerCredit: "Record in a separate secondary lane with the source exercise and dose; do not convert 1:1 to direct sets.",
    targetEffect: "May support a broad exposure objective when policy allows, but cannot silently close a direct hypertrophy/function target.",
  },
  {
    class: "INCIDENTAL BRACING",
    qualification: "The trunk participates at low or unreviewed demand and is not a meaningful selection purpose.",
    ledgerCredit: "Zero developmental credit; retain only stress/fatigue observability when relevant.",
    targetEffect: "Cannot satisfy a direct or function-specific target.",
  },
  {
    class: "CAPACITY EXPOSURE",
    qualification: "Carry, loaded gait, sustained brace, march, hold, or conditioning work is selected for capacity/trunk/gait purpose.",
    ledgerCredit: "Track time, distance, trips, load, and side as applicable; preserve function and fatigue separately from set volume.",
    targetEffect: "May satisfy an activated capacity/carry target, but is not converted to hypertrophy sets by default.",
  },
] as const;

const GOAL_COVERAGE: readonly GoalCoverageRow[] = [
  {
    surface: "Health and movement quality",
    currentSupport: "PARTIAL",
    finding: "The function vocabulary is present, but reviewed lateral-control, rotation, gait-transfer, and progression catalog coverage is missing.",
  },
  {
    surface: "Strength",
    currentSupport: "PARTIAL",
    finding: "Loaded bracing is requestable in the domain, but no current exercise carries that role and carries remain absent.",
  },
  {
    surface: "Hypertrophy",
    currentSupport: "INSUFFICIENT",
    finding: "Dead Bug and Pallof are tagged as accessories, but there is no direct flexion/shortening option, direct-volume semantics, or broad loading runway.",
  },
  {
    surface: "Pain-aware return",
    currentSupport: "PARTIAL",
    finding: "Stress tags and lumbar/ribcage/pelvis context exist; anterior abdominal localization and function-specific dose response do not.",
  },
  {
    surface: "General fitness",
    currentSupport: "PARTIAL",
    finding: "The generic goal path can rank legal exercises, but functional balance and weekly trunk development are not evaluated.",
  },
  {
    surface: "Conditioning",
    currentSupport: "INSUFFICIENT",
    finding: "No reference exercise has the capacity role, no carry exists, and goal-fit has no trunk/capacity-specific policy.",
  },
  {
    surface: "All three phases",
    currentSupport: "PARTIAL",
    finding: "Global phase labels exist for the three direct exercises, but accepted role/section-scoped evidence is not implemented or curated.",
  },
  {
    surface: "Session Composer",
    currentSupport: "CONTRACT_ONLY",
    finding: "Slots can ask for the approved roles, but catalog coverage and contextual exposure classification remain incomplete.",
  },
  {
    surface: "Weekly Development Ledger",
    currentSupport: "CONTRACT_ONLY",
    finding: "WeeklyIntent and TrainingStimulusSummary types exist without an evaluator or direct/secondary/capacity semantics.",
  },
  {
    surface: "Longitudinal adaptation",
    currentSupport: "PARTIAL",
    finding: "Exercise/session history and progression evidence exist, but no trunk-function dose/response history can be accumulated.",
  },
] as const;

export const RECOMMENDED_IMPLEMENTATION_ORDER: readonly string[] = [
  "COMPLETED: Owner approved Option B, the four exposure classes, function vocabulary, unknown semantics, and the decision to defer abdominal_wall.",
  "COMPLETED: Added typed MovementRole values for anti_lateral_flexion_core, trunk_flexion, trunk_rotation, and loaded_bracing; carry remains separate as loaded gait/transport.",
  "COMPLETED: Added a compact, review/provenance-bearing TrunkMechanicsProfile, pure validation, and an observability-only trace without scoring or hidden behavior.",
  "COMPLETED: Added owner-reviewed complete profiles for 90/90 Breathing, Dead Bug, and Pallof Press with ten accepted fields and fourteen explicit unknowns.",
  "COMPLETED PROPOSAL: Evaluated 24 direct trunk/carry candidate concepts and selected a seven-candidate minimal tranche; classification TRUNK_CARRY_CONTRACT_FIXES_REQUIRED authorizes no production metadata.",
  "COMPLETED CONTRACT: Added explicit training-space, cable-height, abdominal-machine, dumbbell-pair, and carry-family types; classification TRUNK_CARRY_EQUIPMENT_CONTRACT_READY adds no exercise.",
  "COMPLETED CONTRACT: Added structured dose, prescription identity, execution quality, performance outcome, and same-exercise progression-readiness semantics; classification STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY adds no exercise.",
  "COMPLETED CONTRACT: Resolved trunk/carry pain-stress vocabulary and receiver review as `TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY`; this adds approved generic tags and structured contracts but no production exercise rows or calibrated pain behavior.",
  "COMPLETED CONTRACTS: Exact seven-exercise decisions, compositional support/stance mechanics, response receivers, normalized training-safety wiring, focused row stress curation, and the selected non-default contextual phase scorer are implemented without adding production rows or changing production scoring; final owner annotation/stress decisions and behavior-equivalent row implementation remain required.",
  "Add normalized trunk assessment features and bounded feature-specific relevance before Session Composer consumes assessment priorities.",
  "Apply accepted role/section-scoped phase annotations and re-run cross-goal, pain, phase, history, weekly-coverage, and longitudinal counterfactuals before Session Composer.",
] as const;

export const EXPLICIT_UNCERTAINTIES: readonly string[] = [
  "Whether controlled rotation needs one role or later direction/range qualifiers; the first contract should avoid side/direction proliferation.",
  "Whether abdominal_wall can be truthfully captured by intake without implying internal-organ or diagnostic semantics.",
  "Which compounds merit complete reviewed profiles and meaningful-secondary credit; five individual judgments are approved but deliberately deferred and all qualified values remain unapproved.",
  "How non-set direct work should normalize dosage without pretending seconds, distance, and hypertrophy sets are interchangeable.",
  "Whether posterior-trunk direct development needs a future function or can remain hinge plus loaded-bracing metadata.",
  "Which trunk assessment features can be normalized from movement screens, coach review, or explicit self-report without inventing image findings.",
  "Final phase suitability, ledger targets, and Candidate Intelligence coefficients; none are selected in this review.",
] as const;

export const TRUNK_CORE_DECISIONS: TrunkCoreDecisions = {
  muscleGroup: "KEEP_TRUNK_UMBRELLA",
  bodyRegion: "ABDOMINAL_WALL_USEFUL_LATER",
  movementRolesToAdd: [
    "anti_lateral_flexion_core",
    "trunk_flexion",
    "trunk_rotation",
    "loaded_bracing",
  ],
  architectureOption: "B",
  assessmentTiming: "BEFORE_SESSION_COMPOSER",
  carryDoctrine: "FIRST_CLASS_CAPACITY_TRUNK_GAIT_NOT_MANDATORY_FINISHER",
};

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function assertCurrentPrimitiveContract(): void {
  const muscles = new Set<string>(MUSCLE_GROUPS);
  const regions = new Set<string>(BODY_REGIONS);
  const roles = new Set<string>(MOVEMENT_ROLES);
  const requiredRoles = [
    "breathing_position",
    "anti_extension_core",
    "anti_rotation_core",
    "anti_lateral_flexion_core",
    "trunk_flexion",
    "trunk_rotation",
    "loaded_bracing",
    "carry",
  ];

  if (
    !muscles.has("trunk") ||
    muscles.has("abdominals") ||
    muscles.has("obliques") ||
    muscles.has("spinal_extensors") ||
    regions.has("abdomen") ||
    regions.has("abdominal_wall") ||
    requiredRoles.some((role) => !roles.has(role))
  ) {
    throw new Error("Current trunk/core primitive contract no longer matches the reviewed baseline.");
  }
}

function countExercises(predicate: (exercise: ExerciseDefinition) => boolean): number {
  return REFERENCE_EXERCISES.filter(predicate).length;
}

function weeklyCreditFor(exposureClass: TrunkExposureClass): string {
  switch (exposureClass) {
    case "DIRECT_DEVELOPMENTAL":
      return "Contract can name trunk + current role, but no implemented receiver computes direct credit.";
    case "MEANINGFUL_SECONDARY":
      return "Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent.";
    case "INCIDENTAL_BRACING":
      return "No developmental credit is justified; generic demand is observational and no receiver aggregates it.";
    case "NO_CURRENT_TRUNK_EVIDENCE":
      return "None from current metadata.";
  }
}

function sectionRole(exercise: ExerciseDefinition): string {
  const suitability = Object.entries(exercise.sectionSuitability)
    .map(([section, value]) => `${section}:${value?.suitability ?? "unknown"}`)
    .join(", ");

  return `roles=${exercise.trainingRoles.join(", ")}; sections=${suitability || "none"}`;
}

function phaseRole(exercise: ExerciseDefinition): string {
  return Object.entries(exercise.phaseSuitability)
    .map(([phase, value]) => `${phase}:${value?.suitability ?? "unknown"}`)
    .join(", ");
}

function buildCatalogRows(): readonly CatalogTrunkRow[] {
  const decisions = new Map(
    CATALOG_TRUNK_DECISIONS.map((decision) => [decision.exerciseId, decision] as const),
  );
  const catalogIds = REFERENCE_EXERCISES.map((exercise) => exercise.id);
  const missing = catalogIds.filter((id) => !decisions.has(id));
  const extra = [...decisions.keys()].filter((id) => !catalogIds.includes(id));

  if (missing.length > 0 || extra.length > 0 || decisions.size !== REFERENCE_EXERCISES.length) {
    throw new Error(
      `Trunk catalog audit is incomplete. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}.`,
    );
  }

  return REFERENCE_EXERCISES.map((exercise) => {
    const decision = decisions.get(exercise.id);
    if (!decision) {
      throw new Error(`Missing trunk decision for ${exercise.id}.`);
    }
    const stressTags = unique([
      ...exercise.loading.jointStressTags,
      ...exercise.cautionStressTags,
      ...exercise.contraindicatedStressTags,
    ]);

    return {
      ...decision,
      exerciseName: exercise.name,
      loadingPotential: `${exercise.loading.loadability}/${exercise.loading.loadingPotential}`,
      progressionAxes: exercise.progression.progressionAxes.join(", ") || "none",
      painStressTags: stressTags.join(", ") || "none",
      sectionRole: sectionRole(exercise),
      phaseRole: phaseRole(exercise),
      currentWeeklyCreditPossibility: weeklyCreditFor(decision.exposureClass),
    };
  });
}

export function buildCurrentCoverageSnapshot(
  catalogRows = buildCatalogRows(),
): TrunkCoreCoverageSnapshot {
  return {
    referenceExerciseCount: REFERENCE_EXERCISES.length,
    dedicatedCoreControlCount: countExercises((exercise) => exercise.family === "core_control"),
    breathingResetCount: countExercises((exercise) => exercise.family === "breathing_reset"),
    primaryTrunkCount: countExercises((exercise) => exercise.primaryMuscles.includes("trunk")),
    secondaryTrunkCount: countExercises((exercise) => exercise.secondaryMuscles.includes("trunk")),
    breathingRoleCount: countExercises((exercise) =>
      exercise.movementRoles.includes("breathing_position"),
    ),
    antiExtensionRoleCount: countExercises((exercise) =>
      exercise.movementRoles.includes("anti_extension_core"),
    ),
    antiRotationRoleCount: countExercises((exercise) =>
      exercise.movementRoles.includes("anti_rotation_core"),
    ),
    carryRoleCount: countExercises((exercise) => exercise.movementRoles.includes("carry")),
    capacityTrainingRoleCount: countExercises((exercise) =>
      exercise.trainingRoles.includes("capacity"),
    ),
    ribcageRegionCount: countExercises((exercise) => exercise.bodyRegions.includes("ribcage")),
    lumbarSpineRegionCount: countExercises((exercise) =>
      exercise.bodyRegions.includes("lumbar_spine"),
    ),
    pelvisRegionCount: countExercises((exercise) => exercise.bodyRegions.includes("pelvis")),
    generalRegionCount: countExercises((exercise) => exercise.bodyRegions.includes("general")),
    trunkDemandLowCount: countExercises(
      (exercise) => exercise.mechanics?.demands.trunk_control.level === "low",
    ),
    trunkDemandModerateCount: countExercises(
      (exercise) => exercise.mechanics?.demands.trunk_control.level === "moderate",
    ),
    trunkDemandHighCount: countExercises(
      (exercise) => exercise.mechanics?.demands.trunk_control.level === "high",
    ),
    trunkDemandUnknownCount: countExercises(
      (exercise) => exercise.mechanics?.demands.trunk_control.level === "unknown",
    ),
    mechanicsAbsentCount: countExercises((exercise) => exercise.mechanics === undefined),
    trunkProfileCount: countExercises(
      (exercise) => exercise.mechanics?.trunkMechanics !== undefined,
    ),
    acceptedTrunkFunctionCount: REFERENCE_EXERCISES.reduce(
      (count, exercise) =>
        count +
        (exercise.mechanics?.trunkMechanics
          ? Object.values(exercise.mechanics.trunkMechanics).filter(
              (annotation) => annotation.reviewStatus === "accepted",
            ).length
          : 0),
      0,
    ),
    unknownTrunkFunctionCount: REFERENCE_EXERCISES.reduce(
      (count, exercise) =>
        count +
        (exercise.mechanics?.trunkMechanics
          ? Object.values(exercise.mechanics.trunkMechanics).filter(
              (annotation) => annotation.level === "unknown",
            ).length
          : 0),
      0,
    ),
    directDevelopmentalCount: catalogRows.filter(
      (row) => row.exposureClass === "DIRECT_DEVELOPMENTAL",
    ).length,
    meaningfulSecondaryCount: catalogRows.filter(
      (row) => row.exposureClass === "MEANINGFUL_SECONDARY",
    ).length,
    incidentalBracingCount: catalogRows.filter(
      (row) => row.exposureClass === "INCIDENTAL_BRACING",
    ).length,
    noCurrentTrunkEvidenceCount: catalogRows.filter(
      (row) => row.exposureClass === "NO_CURRENT_TRUNK_EVIDENCE",
    ).length,
  };
}

export function buildTrunkCoreDomainReviewData(): TrunkCoreDomainReviewData {
  assertCurrentPrimitiveContract();
  const catalogRows = buildCatalogRows();

  return {
    goldenAncestor: GOLDEN_ANCESTOR,
    snapshot: buildCurrentCoverageSnapshot(catalogRows),
    inventory: CURRENT_INVENTORY,
    catalogRows,
    goalCoverage: GOAL_COVERAGE,
    legacyDecisions: LEGACY_MIGRATION_DECISIONS,
    functionalCoverage: FUNCTIONAL_COVERAGE,
    architectureOptions: ARCHITECTURE_OPTIONS,
    exposurePolicy: EXPOSURE_POLICY,
    decisions: TRUNK_CORE_DECISIONS,
    implementationOrder: RECOMMENDED_IMPLEMENTATION_ORDER,
    uncertainties: EXPLICIT_UNCERTAINTIES,
    classification: "TRUNK_CORE_CONTRACT_READY_FOR_OWNER_DECISION",
    implementationStatus: "FIRST_TRUNK_PROFILE_TRANCHE_IMPLEMENTED",
  };
}

function markdownCell(value: string | number): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers: readonly string[], rows: readonly (readonly (string | number)[])[]): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function bullets(values: readonly string[]): string {
  return values.map((value) => `- ${value}`).join("\n");
}

export function renderTrunkCoreDomainReview(data: TrunkCoreDomainReviewData): string {
  const { snapshot } = data;
  const meaningfulRows = data.catalogRows.filter(
    (row) =>
      row.exposureClass === "DIRECT_DEVELOPMENTAL" ||
      row.exposureClass === "MEANINGFUL_SECONDARY",
  );
  const remainingRows = data.catalogRows.filter(
    (row) =>
      row.exposureClass === "INCIDENTAL_BRACING" ||
      row.exposureClass === "NO_CURRENT_TRUNK_EVIDENCE",
  );
  const legacyCounts = new Map<LegacyMigrationClassification, number>();
  for (const decision of data.legacyDecisions) {
    legacyCounts.set(decision.classification, (legacyCounts.get(decision.classification) ?? 0) + 1);
  }

  return [
    "# Training Engine V2 Trunk / Core Domain and Coverage Review",
    "",
    "## Decision Summary",
    "",
    "The project owner accepted the review finding that `trunk` is a useful umbrella but was not a complete core-programming contract. The production domain can now represent anti-lateral flexion, controlled flexion, controlled rotation, and loaded bracing as selection purposes while keeping carry distinct.",
    "",
    "**Option B is accepted and implemented through the first metadata tranche**: keep `trunk` as the single umbrella `MuscleGroup`, use explicit selection-purpose `MovementRole` values, and keep function expression in an optional review/provenance-bearing `TrunkMechanicsProfile`. Exactly three reference exercises now carry profiles; no score, weight, eligibility rule, phase behavior, pain behavior, assessment behavior, or ranking changed.",
    "",
    "## Owner-Accepted Contract Implementation",
    "",
    "- Production roles now include `anti_lateral_flexion_core`, `trunk_flexion`, `trunk_rotation`, and `loaded_bracing`; `carry` remains distinct.",
    "- `ExerciseMechanicsProfile.trunkMechanics` is optional and contains eight field-level function annotations.",
    "- Each annotation exposes `unknown | none | low | moderate | high`, field-level review status, source, structured provenance, and notes. Reviewed `none` remains distinct from unavailable `unknown`.",
    "- `buildTrunkMechanicsTrace` is observability-only. An absent profile yields explicit `profile_unavailable` / `unknown` evidence rather than fabricated `none` values.",
    "- Pure validation requires all eight valid annotations, structured provenance for known levels, and a reviewed basis for accepted unknown evidence.",
    "- Existing reference exercises retain their exact roles. Only 90/90 Breathing, Dead Bug, and Pallof Press carry complete owner-reviewed trunk profiles.",
    "",
    "## First Tranche Owner Approval and Implementation",
    "",
    "The project owner accepted all 15 `PROPOSE_ACCEPTED` judgments and authorized complete production profiles only for 90/90 Breathing, Dead Bug, and Pallof Press. The genuine review artifact is `TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche`.",
    "",
    "Those profiles contain ten accepted fields and fourteen explicit unknowns. Every accepted annotation uses `human_exercise_science_review`; no qualified proposal was promoted. Five accepted secondary/support judgments are approved but deferred, all 17 needs-review proposals remain unresolved, and secondary/support exercises remain unprofiled.",
    "",
    "## Minimal Direct Trunk / Carry Catalog Proposal Status",
    "",
    "A separate deterministic review evaluated 24 new direct trunk/core and carry concepts and selected a seven-candidate minimal tranche: Forearm Plank, Forearm Side Plank, Machine Abdominal Crunch, Half-Kneeling High-to-Low Cable Chop, Bilateral Farmer Carry, Suitcase Carry, and Wall-Supported Suitcase March.",
    "",
    "The proposal authorizes no production exercise. Equipment, structured prescription/progression, response receivers, normalized training-safety wiring, compositional support/stance, focused stress curation, and the selected non-default contextual phase scorer now exist. Production metadata remains blocked by final owner approval of phase/stress proposals and behavior-equivalent implementation tests. The 17 qualified secondary-mechanics proposals remain independently unresolved.",
    "",
    "## Scope and Evidence",
    "",
    `- Current branch reference catalog: ${snapshot.referenceExerciseCount}/${snapshot.referenceExerciseCount} exercises audited.` ,
    `- Protected legacy source: golden ancestor \`${data.goldenAncestor}\`; inspected without checking it out or modifying it.`,
    "- Current receiver inspection: role eligibility/scoring, assessment relevance/demand, pain evidence, transition comparison, row observability, optimizer contracts, and DecisionTrace.",
    "- This is a contract review. Inferred biomechanical functions are labeled `needs review`; they are not silently promoted into exercise facts.",
    "- The accepted phase-context decision remains separate: role/section-scoped phase evidence is not implemented or calibrated here.",
    "",
    "## Current Coverage at a Glance",
    "",
    table(
      ["Measure", "Current count", "Meaning"],
      [
        ["Reference exercises", snapshot.referenceExerciseCount, "Small architecture-test catalog, not a complete catalog"],
        ["Dedicated `core_control` exercises", snapshot.dedicatedCoreControlCount, "Dead Bug and Pallof Press"],
        ["Additional trunk-primary breathing resets", snapshot.breathingResetCount, "90/90 Breathing"],
        ["Primary `trunk` exercises", snapshot.primaryTrunkCount, "90/90 Breathing, Dead Bug, Pallof Press"],
        ["Secondary `trunk` exercises", snapshot.secondaryTrunkCount, "Coarse anatomy; not automatic direct credit"],
        ["Direct developmental trunk exercises", snapshot.directDevelopmentalCount, "Three, including one preparation/recovery drill"],
        ["Meaningful secondary trunk exercises", snapshot.meaningfulSecondaryCount, "Eight catalog-supported generic-demand rows; specific functions still need human review"],
        ["Incidental/unreviewed bracing rows", snapshot.incidentalBracingCount, "No direct developmental credit"],
        ["Rows with no current trunk evidence", snapshot.noCurrentTrunkEvidenceCount, "Unknown/absent must remain unknown"],
        ["Trunk profiles / accepted fields / explicit unknown fields", `${snapshot.trunkProfileCount} / ${snapshot.acceptedTrunkFunctionCount} / ${snapshot.unknownTrunkFunctionCount}`, "First authorized tranche only; remaining exercises stay profile-unavailable"],
        ["breathing_position / anti-extension / anti-rotation / carry", `${snapshot.breathingRoleCount} / ${snapshot.antiExtensionRoleCount} / ${snapshot.antiRotationRoleCount} / ${snapshot.carryRoleCount}`, "Carry is typed but has no reference exercise"],
        ["capacity training-role exercises", snapshot.capacityTrainingRoleCount, "Conditioning/carry composition cannot be exercised"],
        ["ribcage / lumbar_spine / pelvis / general exercises", `${snapshot.ribcageRegionCount} / ${snapshot.lumbarSpineRegionCount} / ${snapshot.pelvisRegionCount} / ${snapshot.generalRegionCount}`, "No abdomen or abdominal_wall region exists"],
        ["trunk_control low / moderate / high / unknown / mechanics absent", `${snapshot.trunkDemandLowCount} / ${snapshot.trunkDemandModerateCount} / ${snapshot.trunkDemandHighCount} / ${snapshot.trunkDemandUnknownCount} / ${snapshot.mechanicsAbsentCount}`, "Generic demand coverage is broader than function-specific truth"],
      ],
    ),
    "",
    "**Dedicated core-control count: 2.** `90/90 Breathing` is trunk-primary and directly develops breathing/position, but its family and training roles correctly identify preparation/recovery rather than a third generic core-control accessory. Its owner-reviewed profile captures high breathing/pressure and low anti-extension expression without changing that role truth. Heavy compounds provide useful bracing exposure; they do not increase the dedicated count.",
    "",
    "## Current Inventory and Receivers",
    "",
    table(
      ["Input", "Giver", "Current receiver", "Output", "Behavioral effect", "Trace visibility", "Use", "Future owner"],
      data.inventory.map((row) => [
        row.input,
        row.giver,
        row.currentReceiver,
        row.output,
        row.behavioralEffect,
        row.traceVisibility,
        row.usage,
        row.futureOwner,
      ]),
    ),
    "",
    "### Receiver Truth",
    "",
    "- `MovementRole` and `MuscleGroup` participate in hard candidate truth and scoring. Adding a role later is therefore behavioral work and requires explicit catalog and test coverage.",
    "- `BodyRegion` contributes assessment context and trace localization. Canonical pain overlap is driven by explicit stress tags; a matching region alone does not currently create a pain match.",
    "- `ExerciseFamily` currently matters to personal blocks, not ordinary candidate ranking.",
    "- `trunk_control` can affect a relevant assessment comparison and transition evidence. It is not a weekly-credit field and it does not reveal which trunk function is challenged.",
    "- `WeeklyIntent` and `TrainingStimulusSummary` are contracts without an implemented week evaluator. Current weekly credit is therefore **possible to describe but impossible to execute**.",
    "",
    "## Goal, Phase, and Longitudinal Coverage",
    "",
    table(
      ["Surface", "Current support", "Finding"],
      data.goalCoverage.map((row) => [row.surface, row.currentSupport, row.finding]),
    ),
    "",
    "Current V2 still cannot support *excellent, coherent* trunk/core programming across every requested surface. The compact type contract closes the representation gap without pretending the catalog, assessment evidence, ledger, and calibration are already complete.",
    "",
    "## Current Catalog: Direct and Meaningful Secondary Exposure",
    "",
    table(
      [
        "Exercise",
        "Primary trunk role",
        "Secondary trunk role",
        "Exposure",
        "Movement function",
        "Loading potential",
        "Progression axes",
        "Pain/stress tags",
        "Section role",
        "Phase role",
        "Current weekly credit possibility",
      ],
      meaningfulRows.map((row) => [
        row.exerciseName,
        row.primaryTrunkRole,
        row.secondaryTrunkRole,
        row.exposureClass,
        `${row.movementFunction}; evidence: ${row.evidence}`,
        row.loadingPotential,
        row.progressionAxes,
        row.painStressTags,
        row.sectionRole,
        row.phaseRole,
        row.currentWeeklyCreditPossibility,
      ]),
    ),
    "",
    "## Current Catalog: Incidental or No Current Evidence",
    "",
    table(
      [
        "Exercise",
        "Primary trunk role",
        "Secondary trunk role",
        "Exposure",
        "Movement function / evidence",
        "Loading potential",
        "Progression axes",
        "Pain/stress tags",
        "Section role",
        "Phase role",
        "Current weekly credit possibility",
      ],
      remainingRows.map((row) => [
        row.exerciseName,
        row.primaryTrunkRole,
        row.secondaryTrunkRole,
        row.exposureClass,
        `${row.movementFunction}; ${row.evidence}`,
        row.loadingPotential,
        row.progressionAxes,
        row.painStressTags,
        row.sectionRole,
        row.phaseRole,
        row.currentWeeklyCreditPossibility,
      ]),
    ),
    "",
    "The phase column reports the current global catalog labels for inventory only. Per the accepted phase-context review, those labels are not accepted contextual evidence and cannot leak between activation, accessory, capacity, recovery, or other role/section uses.",
    "",
    "## Protected Legacy Knowledge Review",
    "",
    `The legacy inspection produced ${data.legacyDecisions.length} explicit migration decisions: ${[...legacyCounts.entries()].map(([classification, count]) => `${classification}=${count}`).join(", ")}. Legacy breadth is evidence that the domain matters; it is not evidence that its old metadata or policies are correct.`,
    "",
    table(
      ["Legacy concept", "Classification", "Evidence", "V2 decision"],
      data.legacyDecisions.map((row) => [
        row.concept,
        row.classification,
        row.evidence,
        row.decision,
      ]),
    ),
    "",
    "### Legacy Conclusions",
    "",
    "Preserve the functional families: breathing/position, anti-extension, anti-rotation, lateral control, controlled rotation, direct shortening, loaded bracing, and loaded gait/carries. Defer specific exercise rows whose shoulder, grip, lumbar, hip-flexor, machine-fit, laterality, or prescription semantics are not reviewed. Reject legacy name sniffing, free-text authority, generic quota hits, and automatic progression across a function shift.",
    "",
    "## Muscle-System Decision",
    "",
    "**Keep `trunk` as the umbrella `MuscleGroup`. Do not add `abdominals`, `obliques`, or `spinal_extensors` to `MuscleGroup` in the first contract.**",
    "",
    "The current inputs do not justify anatomical set precision, and a split would let one exercise satisfy several muscle buckets without a settled credit rule. Function belongs in `MovementRole` and `TrunkMechanicsProfile`; direct/secondary/capacity accounting belongs in the ledger. Anatomical emphasis can be reconsidered later as optional reviewed metadata if hypertrophy programming, assessment evidence, and set-credit ownership establish a real receiver.",
    "",
    "Double-count rule: one completed prescription is one source exposure. It may carry several function descriptors, but a ledger must not clone it into multiple full muscle-set credits. `trunk` volume remains one umbrella lane unless a future owner approves validated subdivision semantics.",
    "",
    "## Body-Region Decision",
    "",
    "**`abdominal_wall`: USEFUL_LATER, not needed now.**",
    "",
    "It could truthfully localize user-reported anterior abdominal-wall discomfort that is neither ribcage, lumbar spine, nor pelvis. It must be added only with a concrete intake/adaptor use case, a plain non-diagnostic definition, reviewed exercise stress mappings, and explicit receiver behavior. It must not imply a diagnosis, hard-gate all trunk work, replace existing regions, create a hidden score, or solve muscle-volume tracking. Until then, unknown localization must remain unknown rather than being forced into `general` or a neighboring region.",
    "",
    "## Movement / Function Decision",
    "",
    "The production domain keeps `breathing_position`, `anti_extension_core`, `anti_rotation_core`, and `carry` and now includes these additional selection-purpose roles:",
    "",
    "- `anti_lateral_flexion_core`",
    "- `trunk_flexion` (or owner-approved `controlled_trunk_flexion` naming)",
    "- `trunk_rotation` (controlled rotation, not uncontrolled lumbar twisting)",
    "- `loaded_bracing`",
    "",
    "`carry` remains the loaded transport/gait purpose. It is not sufficient for all lateral-control work: a side plank has lateral-control purpose without gait, while a bilateral farmer carry has loaded gait and grip demands without the same unilateral anti-lateral challenge as a suitcase carry. Use role combinations and mechanics rather than redefining every lateral drill as a carry.",
    "",
    "Do not add a role merely because a function contributes secondarily. A goblet squat can carry reviewed `loadedBracingContribution` without becoming a `loaded_bracing` candidate unless bracing is actually the requested training purpose.",
    "",
    "## Compact Trunk Mechanics Contract",
    "",
    "The production domain now includes one optional `TrunkMechanicsProfile` with these compact function annotations:",
    "",
    "1. `breathingPressureCoordination`",
    "2. `antiExtensionContribution`",
    "3. `antiRotationContribution`",
    "4. `antiLateralFlexionContribution`",
    "5. `controlledFlexionContribution`",
    "6. `controlledRotationContribution`",
    "7. `loadedBracingContribution`",
    "8. `gaitLoadTransferContribution`",
    "",
    "Each annotation should carry `level = unknown | none | low | moderate | high`, `reviewStatus`, `sourceRef/provenance`, and a concise evidence note. Reviewed `none` means the exercise does not meaningfully express that function; `unknown` means evidence is unavailable and must omit the function from behavioral comparison. Unknown must not become numeric poor, reviewed absence, or zero capability. Profile-level review cannot conceal an unknown field. Posterior-trunk contribution should initially remain evidence attached to loaded bracing/hinge context, not a ninth function or a new muscle bucket; reconsider only after catalog review shows a separate receiver.",
    "",
    "This profile is smaller than a taxonomy of muscles, tissues, planes, directions, and diagnoses. It answers one engine question: **which trunk function does this exercise meaningfully express, at what reviewed level, in addition to its selection role?**",
    "",
    "## Compact Contract Options",
    "",
    table(
      ["Option", "Architecture", "Clarity", "Double-count risk", "Candidate Intelligence", "Assessment", "Weekly volume", "Prescription", "Catalog burden", "Extensibility", "Verdict"],
      data.architectureOptions.map((row) => [
        row.option,
        row.architecture,
        row.clarity,
        row.doubleCountRisk,
        row.candidateIntelligence,
        row.assessment,
        row.weeklyVolume,
        row.prescription,
        row.catalogBurden,
        row.extensibility,
        row.verdict,
      ]),
    ),
    "",
    "**Recommendation: Option B.** It separates intent (`MovementRole`), exercise expression (`TrunkMechanicsProfile`), anatomy (`MuscleGroup.trunk`), location (`BodyRegion`), dose (`ExercisePrescription`), and adaptation accounting (Weekly Development Ledger). That separation is the smallest architecture that supports the required use cases without premature anatomical precision.",
    "",
    "## Direct vs Indirect Weekly Exposure",
    "",
    table(
      ["Class", "Qualification", "Ledger credit", "Effect on targets"],
      data.exposurePolicy.map((row) => [
        row.class,
        row.qualification,
        row.ledgerCredit,
        row.targetEffect,
      ]),
    ),
    "",
    "A heavy squat, hinge, row, or press can impose substantial trunk demand while its progressive overload, local fatigue, and technique are organized around another training purpose. Treating every compound set as a direct abdominal set would overstate local developmental volume, erase function, and let a week with no intentionally selected trunk work appear complete. Compounds can still reduce the need for additional direct work when a goal-aware weekly policy explicitly accepts meaningful secondary exposure.",
    "",
    "The reverse claim is also false: every user does not need isolated abdominal flexion every week. Direct flexion should be activated by hypertrophy intent, a reviewed assessment/development need, exercise history, available time, and pain/tolerance context. Movement-quality, general-fitness, pain-aware, or low-time weeks may be coherent with breathing, anti-extension, anti-rotation, lateral control, carries, and secondary bracing instead. No function is a universal quota.",
    "",
    "## Functional Coverage Matrix",
    "",
    table(
      ["Function", "Current V2 type support", "Current V2 exercise support", "Legacy support", "Assessment support", "Weekly ledger support", "Gap", "Recommended owner"],
      data.functionalCoverage.map((row) => [
        row.function,
        row.currentTypeSupport,
        row.currentExerciseSupport,
        row.legacySupport,
        row.assessmentSupport,
        row.weeklyLedgerSupport,
        row.gap,
        row.recommendedOwner,
      ]),
    ),
    "",
    "## Health and Hypertrophy Are Separate",
    "",
    "Health/movement-quality core work should be selected for breathing/pressure coordination, position, anti-extension, anti-rotation, lateral control, gait/load transfer, tolerance, and progressive confidence. The appropriate dose may be breaths, controlled reps, holds, steps, time, or distance. A low-load drill can be highly useful without being a hypertrophy set.",
    "",
    "Hypertrophy-focused trunk work requires direct intent, a sufficiently loadable exercise, appropriate range where tolerated, recoverable direct volume, and a progression runway. Stability drills alone do not prove maximal abdominal hypertrophy stimulus. Direct flexion/shortening is a valid future tool, not a universal mandate; pain, goals, preference, training age, and existing compound demand still govern whether it belongs.",
    "",
    "## Assessment Semantics",
    "",
    "Current generic `movementRole`, `muscleGroup`, and `region` inputs are sufficient only for coarse trunk influence. `signalIsTrunk` maps lumbar_spine, ribcage, pelvis, trunk, breathing_position, anti_extension_core, and anti_rotation_core into the single `trunk_control` dimension. Candidate-specific demand prevents unrelated influence, but the engine cannot distinguish ribcage-pelvis control from lateral, rotational, or loaded-bracing evidence.",
    "",
    "**Timing decision: BEFORE_SESSION_COMPOSER.** With the function/mechanics vocabulary and first profile tranche implemented, the next separately approved boundary is normalized features such as `ribcage_pelvis_control`, `anti_extension_control`, `anti_rotation_control`, `controlled_rotation_control`, `lateral_trunk_control`, and `loaded_bracing_control`. A broad `rotational_control` input must remain broad/unknown unless its source distinguishes resisting rotation from producing controlled rotation. Only explicit or reviewed normalization from movement screens, coach review, training history, or sufficiently specific self-report may populate these features. Do not infer them from descriptions, photos without a validated signal, or diagnosis-like assumptions.",
    "",
    "Feature evidence should remain bounded exactly as the existing assessment doctrine requires: feature-specific evidence can influence only a truthful candidate with reviewed matching mechanics; missing feature evidence remains unknown; assessment cannot legalize a wrong role; severity, confidence, capability, challenge, and developmental relationship stay separate.",
    "",
    "## Pain and Localization",
    "",
    "The future region decision and the trunk mechanics decision are independent. `abdominal_wall` would describe *where* discomfort is reported; mechanics describe *what an exercise demands*. A region must never be used as a proxy for abdominal set volume or a diagnosis. Any future receiver should preserve the canonical rule that pain matching requires reviewed stress overlap or explicit exercise authority, not region coincidence alone, and moderate discomfort should continue to produce the accepted review/readiness semantics rather than an automatic blanket gate.",
    "",
    "## Carry Integration",
    "",
    "Carries remain first-class capacity/trunk/gait tools, not mandatory finishers. A future carry contract must represent:",
    "",
    "- bilateral farmer carry: bilateral load, high grip/load transport, loaded gait and bracing;",
    "- unilateral suitcase carry: unilateral load, anti-lateral/anti-rotation demand, grip and loaded gait;",
    "- front-rack carry: anterior/rack position, trunk and upper-quarter demand;",
    "- overhead carry: overhead shoulder/scapular demand plus trunk and gait, with stronger prerequisites;",
    "- march/hold regressions: stationary or supported gait-transfer/brace options that are not mislabeled as distance carries.",
    "",
    "Required metadata: grip demand, trunk function profile, laterality, loaded-gait status, shoulder demand, equipment/anchor/support, local/systemic fatigue, stress tags, and prescription units (`time`, `distance`, `trips`, `load`, `side`). A carry can serve capacity, conditioning, accessory, activation, or preparation only when its role/section metadata and phase evidence support that use. The catalog should start with a minimal bilateral/unilateral/regression set after the contract is approved; this review adds no exercise.",
    "",
    "## Weekly Development Ledger Handoff",
    "",
    "The future trunk ledger should be event-based: each completed prescription is one source event with role, section, phase, function, exposure class, dose, response, and provenance. Aggregate views may show:",
    "",
    "- direct trunk developmental volume;",
    "- anti-extension, anti-rotation, lateral-control, flexion/shortening, rotation, and loaded-bracing exposure;",
    "- carry/loaded-gait capacity by time, distance, trips, load, and side;",
    "- meaningful secondary bracing as a separate lane;",
    "- assessment-priority exposure;",
    "- stress, pain/tolerance response, fatigue, recovery, and progression history.",
    "",
    "Targets are activated and sized by goal, experience, phase, assessment, pain/readiness, exercise history, available days/time, total weekly fatigue, and recent response. They should be ranges or priorities with explicit reasons, not fixed quotas copied from legacy. A user may have no direct flexion target, no carry target, or no additional direct trunk target in a given week. The ledger may explain that compounds supplied meaningful secondary exposure; it may not relabel those compounds as direct abdominal sets.",
    "",
    "Longitudinal adaptation requires preserving dose and response by function: productive progression, plateau, symptom response, recovery cost, and exposure recency. Exercise-ID continuity alone cannot tell whether a trunk function is developing across exercise substitutions.",
    "",
    "## Phase-Context Interaction",
    "",
    "Every future core/carry exercise must use the accepted role/section-scoped phase annotation contract. Exact role+section evidence takes precedence over section-only, role-only, and general evidence; equal-specificity conflict remains explicit; no matching evidence remains unknown and contributes no phase term.",
    "",
    "Examples:",
    "",
    "- Dead Bug as Phase 1 activation is not the same evidence claim as Dead Bug as Phase 3 hypertrophy accessory.",
    "- Pallof Press as activation cannot inherit an accessory-volume rationale.",
    "- A suitcase march as supported preparation cannot inherit the phase evidence of a loaded capacity carry.",
    "- A machine abdominal crunch accessory rationale cannot leak into activation or pain-aware recovery.",
    "- A carry used for conditioning needs capacity/conditioning evidence, not a generic finisher assumption.",
    "",
    "No phase coefficient or final suitability value is selected here. Catalog curation must supply provenance for each actual use context before phase behavior changes.",
    "",
    "## Recommended Implementation Order",
    "",
    data.implementationOrder.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "## Explicit Uncertainties",
    "",
    bullets(data.uncertainties),
    "",
    "## Final Classification",
    "",
    `**${data.classification}**`,
    "",
    `Implementation status: **${data.implementationStatus}**.`,
    "",
    "The owner accepted Option B, the production type/validation/trace contracts, and the first three complete profiles. Remaining profile curation, catalog breadth, assessment feature evidence, body-region intake, weekly targets, prescription normalization, phase annotations, and scoring calibration remain separate reviewed follow-ons.",
    "",
  ].join("\n");
}

export function writeTrunkCoreDomainReview(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: TrunkCoreDomainReviewData;
} {
  const data = buildTrunkCoreDomainReviewData();
  const outputPath = join(rootDir, "docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md");

  writeFileSync(outputPath, renderTrunkCoreDomainReview(data));

  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeTrunkCoreDomainReview();
  console.log(`Wrote ${result.outputPath}`);
  console.log(JSON.stringify({
    referenceExercises: result.data.snapshot.referenceExerciseCount,
    dedicatedCoreControlExercises: result.data.snapshot.dedicatedCoreControlCount,
    directDevelopmental: result.data.snapshot.directDevelopmentalCount,
    meaningfulSecondary: result.data.snapshot.meaningfulSecondaryCount,
    classification: result.data.classification,
  }, null, 2));
}
