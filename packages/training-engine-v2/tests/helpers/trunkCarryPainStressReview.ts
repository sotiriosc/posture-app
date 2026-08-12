import {
  JOINT_STRESS_TAGS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCandidatePainExecutionReadinessTrace,
  buildCandidatePainMatchTrace,
  receiverDecision,
  type CandidatePainExecutionReadiness,
  type ExerciseDefinition,
  type ExerciseStressSource,
  type JointStressTag,
  type PainAndInjuryState,
  type PainReceiverExecutionStatus,
  type PainResponseOwner,
} from "../../src";
import {
  buildStructuredPrescriptionContractData,
  syntheticExerciseForFixture,
} from "./structuredPrescriptionProgressionContract";
import type { TrunkCarryFutureIdentity } from "./trunkCarryEquipmentContract";

export const TRUNK_CARRY_PAIN_STRESS_CLASSIFICATION =
  "TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY_FOR_OWNER_DECISION";

export const PROPOSED_TRUNK_CARRY_STRESS_TAGS = [
  "sustained_upper_limb_support_loading",
  "loaded_trunk_rotation",
  "lateral_trunk_loading",
  "loaded_gait",
  "loaded_march",
  "grip_loading",
] as const;

export type ProposedTrunkCarryStressTag =
  (typeof PROPOSED_TRUNK_CARRY_STRESS_TAGS)[number];
type SyntheticStressTag = JointStressTag | ProposedTrunkCarryStressTag;

export const REJECTED_VAGUE_STRESS_TAGS = [
  "core_stress",
  "carry_stress",
  "bad_posture",
  "spinal_instability",
  "unsafe_rotation",
  "weak_core",
  "poor_alignment",
  "bracing_stress",
  "hard_exercise",
] as const;

export type StressTagClassification =
  | "WELL_DEFINED"
  | "PLAUSIBLE_NEEDS_REVIEW"
  | "OVERBROAD"
  | "DOSE_DEPENDENT"
  | "VARIANT_DEPENDENT"
  | "WRONG_OWNER"
  | "UNUSED"
  | "CONTRADICTORY";

export type CurrentTagTreatment =
  | "UNCHANGED"
  | "REVIEW_LATER"
  | "MIGRATE_TO_STRUCTURED_SCOPE"
  | "DEPRECATE_AFTER_MIGRATION";

export interface CurrentStressVocabularyRow {
  readonly tag: JointStressTag;
  readonly impliedDefinition: string;
  readonly exercisesUsingIt: readonly string[];
  readonly metadataSources: readonly string[];
  readonly painSignalsUsingIt: readonly string[];
  readonly receiversConsumingIt: readonly string[];
  readonly intrinsicOrDoseDependent: string;
  readonly variantDependentOrGeneral: string;
  readonly sideSpecificPotential: string;
  readonly currentProvenance: string;
  readonly ambiguity: string;
  readonly classifications: readonly StressTagClassification[];
  readonly recommendedTreatment: CurrentTagTreatment;
}

interface CurrentTagDecision {
  readonly impliedDefinition: string;
  readonly intrinsicOrDoseDependent: string;
  readonly variantDependentOrGeneral: string;
  readonly sideSpecificPotential: string;
  readonly ambiguity: string;
  readonly classifications: readonly StressTagClassification[];
  readonly recommendedTreatment: CurrentTagTreatment;
}

const PAIN_SIGNALS_USING_STRESS_TAGS = [
  "HistoricalSensitivity.stressTags",
  "CurrentDiscomfort.stressTags",
  "ModeratePain.stressTags",
  "AcuteSeverePain.stressTags",
  "HardContraindication.stressTags",
] as const;

const RECEIVERS_CONSUMING_STRESS_TAGS = [
  "pain_suitability",
  "joint_cost",
  "moderate_warning",
  "hard_contraindication",
  "acute_severe_eligibility",
  "assessment_demand_reduction",
] as const;

const CURRENT_TAG_DECISIONS: Record<JointStressTag, CurrentTagDecision> = {
  deep_knee_flexion: {
    impliedDefinition:
      "Knee reaches a reviewed deep-flexion range; load may be absent or secondary.",
    intrinsicOrDoseDependent:
      "Range dependent and often prescription modifiable; not inherently dose-created.",
    variantDependentOrGeneral:
      "Variant dependent when box height, support, or depth target changes the range.",
    sideSpecificPotential:
      "Potentially side-specific for unilateral lower-body prescriptions, but current matching has no usable side.",
    ambiguity:
      "Truth depends on reviewed range, not the exercise name or squat family alone.",
    classifications: ["WELL_DEFINED", "VARIANT_DEPENDENT"],
    recommendedTreatment: "UNCHANGED",
  },
  loaded_knee_flexion: {
    impliedDefinition:
      "Knee flexion occurs while meaningful external or bodyweight loading is present.",
    intrinsicOrDoseDependent:
      "Load and range modifiable; heavy-versus-light magnitude belongs to prescription.",
    variantDependentOrGeneral:
      "General for current loaded knee-flexion rows, with variant-specific magnitude.",
    sideSpecificPotential:
      "Potentially side-specific in split, step, and single-side prescriptions.",
    ambiguity:
      "Does not encode depth, load magnitude, or side without prescription evidence.",
    classifications: ["WELL_DEFINED", "DOSE_DEPENDENT"],
    recommendedTreatment: "UNCHANGED",
  },
  loaded_spinal_flexion: {
    impliedDefinition:
      "Spinal or trunk flexion exposure under load, currently also used as conservative lumbar stress on some hinge/row patterns.",
    intrinsicOrDoseDependent:
      "Load and range modifiable; exact flexion direction should be reviewed per exercise.",
    variantDependentOrGeneral:
      "General enough to be useful, but current mappings are broader than controlled crunch work.",
    sideSpecificPotential:
      "Usually bilateral or midline; side may be irrelevant unless a future prescription creates asymmetry.",
    ambiguity:
      "Current hinge/row use and future machine-crunch use are not the same movement exposure.",
    classifications: ["PLAUSIBLE_NEEDS_REVIEW", "OVERBROAD"],
    recommendedTreatment: "REVIEW_LATER",
  },
  loaded_spinal_extension: {
    impliedDefinition:
      "Loaded extension or extension-biased spinal demand in the exercise stress profile.",
    intrinsicOrDoseDependent:
      "Load, range, and setup dependent.",
    variantDependentOrGeneral:
      "General but needs field-level provenance because current uses span shoulder press and glute bridge.",
    sideSpecificPotential:
      "Mostly midline unless future unilateral loading creates asymmetric extension demand.",
    ambiguity:
      "May be a conservative lumbar exposure rather than a precise extension movement fact.",
    classifications: ["PLAUSIBLE_NEEDS_REVIEW"],
    recommendedTreatment: "REVIEW_LATER",
  },
  heavy_axial_loading: {
    impliedDefinition:
      "High-magnitude load transmitted through the body axis; no current reference exercise uses it.",
    intrinsicOrDoseDependent:
      "Dose-created and threshold dependent by definition.",
    variantDependentOrGeneral:
      "Not a truthful static carry tag when the legal prescription may be light.",
    sideSpecificPotential:
      "Usually systemic/axial rather than left-right, though asymmetry can coexist with lateral loading.",
    ambiguity:
      "Without load thresholds it would silently convert ordinary load into heavy load.",
    classifications: ["UNUSED", "DOSE_DEPENDENT"],
    recommendedTreatment: "MIGRATE_TO_STRUCTURED_SCOPE",
  },
  loaded_hinge: {
    impliedDefinition:
      "Hip-hinge pattern performed under load or meaningful posterior-chain resistance.",
    intrinsicOrDoseDependent:
      "Load and range modifiable, but the hinge pattern is stable for current mapped rows.",
    variantDependentOrGeneral:
      "General for current hinge/row exposure, with prescription-level magnitude.",
    sideSpecificPotential:
      "Potentially side-specific for unilateral hinges, not current catalog use.",
    ambiguity:
      "Does not by itself prove spinal flexion, axial loading, or grip intensity.",
    classifications: ["WELL_DEFINED", "DOSE_DEPENDENT"],
    recommendedTreatment: "UNCHANGED",
  },
  overhead_pressing: {
    impliedDefinition:
      "Upper-limb pressing or upward-reaching demand in an overhead path.",
    intrinsicOrDoseDependent:
      "Range, load, and implement path modifiable.",
    variantDependentOrGeneral:
      "General for shoulder-press and wall-slide rows; anchor height alone must not create it.",
    sideSpecificPotential:
      "Potentially side-specific for single-arm prescriptions.",
    ambiguity:
      "A high cable anchor is not overhead pressing without the reviewed movement path.",
    classifications: ["WELL_DEFINED"],
    recommendedTreatment: "UNCHANGED",
  },
  horizontal_pressing: {
    impliedDefinition:
      "Horizontal upper-limb pressing demand.",
    intrinsicOrDoseDependent:
      "Load and range modifiable.",
    variantDependentOrGeneral:
      "General for the current push-up, bench, machine press, and cable fly rows.",
    sideSpecificPotential:
      "Potentially side-specific for unilateral future prescriptions.",
    ambiguity:
      "Does not imply wrist extension or shoulder-abduction/external-rotation exposure.",
    classifications: ["WELL_DEFINED"],
    recommendedTreatment: "UNCHANGED",
  },
  shoulder_abduction_external_rotation: {
    impliedDefinition:
      "Shoulder abduction and external-rotation exposure requiring reviewed shoulder positioning.",
    intrinsicOrDoseDependent:
      "Range, load, and arm path modifiable.",
    variantDependentOrGeneral:
      "General enough for current rows, but exact joint position needs provenance.",
    sideSpecificPotential:
      "Potentially side-specific for single-arm or asymmetrical prescriptions.",
    ambiguity:
      "Needs review before being extended to cable-chop shoulder contribution.",
    classifications: ["PLAUSIBLE_NEEDS_REVIEW"],
    recommendedTreatment: "REVIEW_LATER",
  },
  wrist_extension_loading: {
    impliedDefinition:
      "Hand-supported loading with the wrist extended.",
    intrinsicOrDoseDependent:
      "Support and hand position dependent.",
    variantDependentOrGeneral:
      "Variant dependent; forearm support specifically removes ordinary wrist-extension loading.",
    sideSpecificPotential:
      "Potentially side-specific for one-hand support, not current use.",
    ambiguity:
      "Must not be inferred from any plank-like name when support is through forearms.",
    classifications: ["WELL_DEFINED", "VARIANT_DEPENDENT"],
    recommendedTreatment: "UNCHANGED",
  },
  high_impact: {
    impliedDefinition:
      "Impact exposure from jumping, landing, running, or similar high-impact contact; unused today.",
    intrinsicOrDoseDependent:
      "Often intrinsic to the movement class but magnitude remains dose and surface dependent.",
    variantDependentOrGeneral:
      "Unknown for current catalog because no reference exercise uses it.",
    sideSpecificPotential:
      "Potentially side-specific for unilateral impact but generally bilateral/systemic in simple matching.",
    ambiguity:
      "Unused vocabulary should not be borrowed for loaded gait or marching.",
    classifications: ["UNUSED"],
    recommendedTreatment: "REVIEW_LATER",
  },
  grip_intensive: {
    impliedDefinition:
      "High hand-grip demand, currently assigned statically to rows, pulldown, curl, and RDL.",
    intrinsicOrDoseDependent:
      "Dose-created/intensity dependent; light carries are not automatically intensive.",
    variantDependentOrGeneral:
      "Overbroad as a static tag because implement, load, duration, and straps can change grip demand.",
    sideSpecificPotential:
      "Potentially side-specific for unilateral load prescriptions.",
    ambiguity:
      "The current name conflates any grip loading with high-intensity grip demand.",
    classifications: ["OVERBROAD", "DOSE_DEPENDENT"],
    recommendedTreatment: "MIGRATE_TO_STRUCTURED_SCOPE",
  },
  long_lever_core: {
    impliedDefinition:
      "Long-lever trunk-control exposure in bodyweight or anti-extension contexts.",
    intrinsicOrDoseDependent:
      "Variant and lever dependent rather than universally intrinsic to a base exercise identity.",
    variantDependentOrGeneral:
      "Overbroad for lateral plank and support-regressed plank unless the prescription realizes the lever.",
    sideSpecificPotential:
      "Generally midline for anti-extension; side plank needs a separate lateral-loading truth.",
    ambiguity:
      "Can double count trunk demand if used as a substitute for lateral trunk loading or anti-extension role.",
    classifications: ["OVERBROAD", "VARIANT_DEPENDENT"],
    recommendedTreatment: "MIGRATE_TO_STRUCTURED_SCOPE",
  },
};

export interface ProposedStressTagDecision {
  readonly concept: string;
  readonly proposedName: ProposedTrunkCarryStressTag | null;
  readonly recommendation:
    | "ACCEPT_FOR_OWNER_DECISION"
    | "REJECT_AS_SHARED_TAG"
    | "REJECT_VAGUE_OR_WRONG_OWNER";
  readonly mechanicalDefinition: string;
  readonly whyCurrentTagsFail: string;
  readonly candidateIds: readonly TrunkCarryFutureIdentity[];
  readonly exposureScope: string;
  readonly receiverNeed: string;
  readonly regionRelevance: string;
  readonly sideRelevance: string;
  readonly alternativeNames: readonly string[];
  readonly doubleCountRisk: string;
  readonly sourcePlacement: "joint_stress" | "none";
  readonly ownerDecisionRequired: string;
}

export const PROPOSED_STRESS_TAG_DECISIONS: readonly ProposedStressTagDecision[] = [
  {
    concept: "sustained upper-limb support loading",
    proposedName: "sustained_upper_limb_support_loading",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "Sustained bodyweight support through the upper limb where shoulder and elbow support tolerance may be a receiver-owned exposure.",
    whyCurrentTagsFail:
      "`wrist_extension_loading` is hand-support specific and `long_lever_core` is trunk-lever demand, not upper-limb support.",
    candidateIds: ["forearm-plank", "forearm-side-plank"],
    exposureScope:
      "Intrinsic to the reviewed forearm-support identities; magnitude is support, lever, duration, and effort modifiable.",
    receiverNeed:
      "Pain matching for shoulder/elbow support sensitivity and explicit hard/acute support restrictions.",
    regionRelevance: "shoulder, elbow, and general upper-limb support context.",
    sideRelevance:
      "Bilateral for forearm plank; side-bearing truth is needed for side plank prescriptions.",
    alternativeNames: ["forearm_support_loading", "upper_limb_support_loading"],
    doubleCountRisk:
      "Do not count it as anti-extension, lateral trunk loading, or long-lever core.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve exact support definition and whether hand-supported variants use this tag or wrist_extension_loading instead.",
  },
  {
    concept: "loaded trunk rotation",
    proposedName: "loaded_trunk_rotation",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "Intentional controlled trunk rotation against external cable, band, or implement resistance.",
    whyCurrentTagsFail:
      "`loaded_spinal_flexion` and `loaded_spinal_extension` are directionally wrong for controlled rotation.",
    candidateIds: ["half-kneeling-high-to-low-cable-chop"],
    exposureScope:
      "Intrinsic to the exact cable-chop identity; load and range remain prescription modifiable.",
    receiverNeed:
      "Pain matching for users who report loaded rotation sensitivity without treating anti-rotation as the same exposure.",
    regionRelevance: "thoracic_spine, lumbar_spine, ribcage, pelvis.",
    sideRelevance:
      "Per-side prescription truth is needed; the tag name must not encode left or right.",
    alternativeNames: ["resisted_trunk_rotation", "loaded_rotational_trunk_work"],
    doubleCountRisk:
      "Do not infer overhead pressing from high cable anchor or spinal flexion from chop path.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve the minimum range/load definition and per-side trace behavior.",
  },
  {
    concept: "lateral trunk loading",
    proposedName: "lateral_trunk_loading",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "Side-bending or anti-lateral-flexion trunk exposure created by unilateral support/load or lateral bodyweight support.",
    whyCurrentTagsFail:
      "`long_lever_core` does not identify lateral direction, unilateral load side, or side-bearing support.",
    candidateIds: [
      "forearm-side-plank",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ],
    exposureScope:
      "Intrinsic to side-plank and suitcase identities, but support/load/lever materially alter magnitude.",
    receiverNeed:
      "Pain matching for side-specific trunk intolerance and prescription response requirements.",
    regionRelevance: "ribcage, lumbar_spine, pelvis, general trunk context.",
    sideRelevance:
      "High; side belongs in pain signal and prescription realization, not in the tag string.",
    alternativeNames: ["unilateral_trunk_loading", "anti_lateral_trunk_loading"],
    doubleCountRisk:
      "Do not also count it as long_lever_core unless a separate lever exposure is reviewed.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve side semantics and how wall support reduces or removes realized exposure.",
  },
  {
    concept: "loaded gait",
    proposedName: "loaded_gait",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "Walking while carrying external load with gait, turns, distance, or time as prescription facts.",
    whyCurrentTagsFail:
      "`high_impact` and `heavy_axial_loading` do not truthfully represent ordinary loaded walking.",
    candidateIds: ["farmer-carry", "suitcase-carry"],
    exposureScope:
      "Intrinsic to distance/timed walking carry identities; distance, turns, load, and duration are prescription modifiable.",
    receiverNeed:
      "Pain/joint-cost matching for users sensitive to loaded walking rather than static standing.",
    regionRelevance: "lumbar_spine, pelvis, hip, knee, ankle, general.",
    sideRelevance:
      "Load side can matter for unilateral carries; walking exposure itself may be bilateral/systemic.",
    alternativeNames: ["loaded_walking", "loaded_locomotion_gait"],
    doubleCountRisk:
      "Do not grant it to stationary wall march or static holds.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve gait-space and prescription-realization requirements.",
  },
  {
    concept: "loaded march",
    proposedName: "loaded_march",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "Stationary stepping or marching while holding external load, without walking distance truth.",
    whyCurrentTagsFail:
      "`loaded_gait` would falsely imply walking/distance exposure, and current tags do not represent stationary loaded stepping.",
    candidateIds: ["wall-supported-suitcase-march"],
    exposureScope:
      "Intrinsic to the proposed stationary march identity; support, steps, time, and load are prescription modifiable.",
    receiverNeed:
      "Pain/joint-cost matching for loaded single-leg support/marching without granting loaded-walking capacity.",
    regionRelevance: "lumbar_spine, pelvis, hip, knee, ankle, general.",
    sideRelevance:
      "High because load side, support side, and alternating step side interact.",
    alternativeNames: ["stationary_loaded_march", "loaded_step_march"],
    doubleCountRisk:
      "Do not also count as loaded_gait or distance carry.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve support-side/load-side interaction and no-distance invariants.",
  },
  {
    concept: "loaded gait or march as one shared exposure",
    proposedName: null,
    recommendation: "REJECT_AS_SHARED_TAG",
    mechanicalDefinition:
      "A broad loaded-locomotion umbrella covering both walking carries and stationary marching.",
    whyCurrentTagsFail:
      "The problem is not lack of an umbrella; it is preserving walking versus stationary truth.",
    candidateIds: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    exposureScope:
      "Too broad for flat canonical matching because one pain signal/tag would match both walking and stationary prescriptions.",
    receiverNeed:
      "No distinct receiver needs the umbrella before it would create false positives.",
    regionRelevance: "Too broad.",
    sideRelevance: "Too broad.",
    alternativeNames: ["loaded_locomotion"],
    doubleCountRisk:
      "Would make wall march look like distance carry and erase the equipment contract distinction.",
    sourcePlacement: "none",
    ownerDecisionRequired:
      "Reject for first tranche unless a future structured parent-child tag system exists.",
  },
  {
    concept: "grip loading distinct from grip_intensive",
    proposedName: "grip_loading",
    recommendation: "ACCEPT_FOR_OWNER_DECISION",
    mechanicalDefinition:
      "External implement held by the hand where grip exposure exists before intensity has been classified.",
    whyCurrentTagsFail:
      "`grip_intensive` overstates light or short prescriptions and should remain a dose-threshold concept.",
    candidateIds: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    exposureScope:
      "Intrinsic to dumbbell carry/march identities; intensity is dose-created from load, duration, handle, and assistance.",
    receiverNeed:
      "Pain matching for hand/wrist/elbow grip exposure without pretending every carry is intensive.",
    regionRelevance: "wrist, elbow, general upper limb.",
    sideRelevance: "High for unilateral load and single-hand prescriptions.",
    alternativeNames: ["implement_grip_loading", "held_load_grip"],
    doubleCountRisk:
      "Do not count both grip_loading and grip_intensive unless intensity threshold is explicitly realized.",
    sourcePlacement: "joint_stress",
    ownerDecisionRequired:
      "Approve neutral grip exposure and later threshold for grip_intensive migration.",
  },
];

export interface CandidateStressAuditRow {
  readonly candidateId: TrunkCarryFutureIdentity;
  readonly intrinsicExposures: readonly string[];
  readonly prescriptionModifiableExposures: readonly string[];
  readonly variantDependentExposures: readonly string[];
  readonly doseCreatedExposures: readonly string[];
  readonly currentTagsThatFit: readonly string[];
  readonly currentTagsThatDoNotFit: readonly string[];
  readonly potentialNewTags: readonly string[];
  readonly sourcePlacement: string;
  readonly receiverEffect: string;
  readonly sideRequirement: string;
  readonly provenanceNeed: string;
  readonly remainingUncertainty: string;
}

export const CANDIDATE_STRESS_AUDIT: readonly CandidateStressAuditRow[] = [
  {
    candidateId: "forearm-plank",
    intrinsicExposures: [
      "sustained forearm-supported upper-limb loading",
      "bodyweight support",
      "anti-extension function as movement purpose, not a stress tag",
    ],
    prescriptionModifiableExposures: ["duration", "effort", "support level"],
    variantDependentExposures: ["long_lever_core under ordinary or lengthened lever"],
    doseCreatedExposures: [],
    currentTagsThatFit: ["long_lever_core only when the prescription realizes ordinary/full lever"],
    currentTagsThatDoNotFit: ["wrist_extension_loading", "heavy_axial_loading"],
    potentialNewTags: ["sustained_upper_limb_support_loading"],
    sourcePlacement:
      "sustained_upper_limb_support_loading in joint_stress after owner curation; long_lever_core only through prescription realization.",
    receiverEffect:
      "Support tag can affect pain_suitability, joint_cost, moderate_warning, and intrinsic hard/acute criteria.",
    sideRequirement: "No side for ordinary bilateral plank; side remains null.",
    provenanceNeed:
      "Reviewed forearm support definition, legal lever variants, duration/effort modifiers.",
    remainingUncertainty:
      "Whether hand-supported plank variants share the tag or use wrist_extension_loading separately.",
  },
  {
    candidateId: "forearm-side-plank",
    intrinsicExposures: [
      "unilateral forearm support",
      "lateral trunk loading",
      "anti-lateral-flexion purpose as movement role, not tag",
    ],
    prescriptionModifiableExposures: ["duration", "support level", "lever"],
    variantDependentExposures: ["long-lever contribution if full lever is selected"],
    doseCreatedExposures: ["future external load"],
    currentTagsThatFit: [],
    currentTagsThatDoNotFit: ["long_lever_core as a substitute for lateral loading", "wrist_extension_loading"],
    potentialNewTags: [
      "sustained_upper_limb_support_loading",
      "lateral_trunk_loading",
    ],
    sourcePlacement:
      "Both proposed tags need joint_stress placement, with side truth deferred to prescription realization.",
    receiverEffect:
      "One canonical fact per tag; lateral and support exposures must not clone the same fact.",
    sideRequirement:
      "Required for side-bearing support and lateral trunk exposure before prescription validation.",
    provenanceNeed:
      "Reviewed side-plank support side, load side if future load exists, and lever/support variants.",
    remainingUncertainty:
      "Whether bent-knee support reduces lateral loading enough to classify it as removed or merely reduced.",
  },
  {
    candidateId: "machine-abdominal-crunch",
    intrinsicExposures: ["controlled loaded trunk flexion"],
    prescriptionModifiableExposures: ["machine load", "range", "tempo", "repetition dose"],
    variantDependentExposures: [],
    doseCreatedExposures: ["high-load or high-volume flexion intensity"],
    currentTagsThatFit: ["loaded_spinal_flexion"],
    currentTagsThatDoNotFit: ["loaded_spinal_extension", "loaded_trunk_rotation"],
    potentialNewTags: [],
    sourcePlacement:
      "loaded_spinal_flexion in joint_stress is sufficient; caution/contraindicated placement requires owner-specific reason.",
    receiverEffect:
      "Existing tag gives normal canonical pain receiver behavior without anatomy duplicate.",
    sideRequirement: "Generally not side-specific.",
    provenanceNeed:
      "Reviewed machine identity, fit/setup assumptions, load/range prescription contract.",
    remainingUncertainty:
      "Whether current loaded_spinal_flexion mappings should later split hinge-context stress from controlled flexion.",
  },
  {
    candidateId: "half-kneeling-high-to-low-cable-chop",
    intrinsicExposures: ["controlled loaded trunk rotation", "half-kneeling setup"],
    prescriptionModifiableExposures: ["load", "range", "tempo", "per-side dose"],
    variantDependentExposures: ["stance/setup adjustments"],
    doseCreatedExposures: [],
    currentTagsThatFit: [],
    currentTagsThatDoNotFit: [
      "loaded_spinal_flexion",
      "loaded_spinal_extension",
      "overhead_pressing from anchor height alone",
    ],
    potentialNewTags: ["loaded_trunk_rotation"],
    sourcePlacement: "loaded_trunk_rotation in joint_stress after owner curation.",
    receiverEffect:
      "Allows rotation-specific pain matching without confusing anti-rotation, flexion, extension, or overhead pressing.",
    sideRequirement: "Required for per-side chop direction and pain response validation.",
    provenanceNeed:
      "Reviewed cable path, stance, pelvis control, shoulder contribution, and per-side dose.",
    remainingUncertainty:
      "Whether band chop/lift variants share the same tag or need range/path qualifiers later.",
  },
  {
    candidateId: "farmer-carry",
    intrinsicExposures: ["bilateral external load", "loaded gait", "grip loading"],
    prescriptionModifiableExposures: ["load", "distance", "duration", "trips", "turns", "set-downs"],
    variantDependentExposures: [],
    doseCreatedExposures: ["grip_intensive", "heavy_axial_loading"],
    currentTagsThatFit: [],
    currentTagsThatDoNotFit: ["heavy_axial_loading as static tag", "grip_intensive at every legal load"],
    potentialNewTags: ["loaded_gait", "grip_loading"],
    sourcePlacement:
      "loaded_gait and grip_loading in joint_stress; grip_intensive/heavy_axial_loading only if future dose thresholds are realized.",
    receiverEffect:
      "Loaded-walking and neutral grip facts support pain/joint receivers without making carries inherently heavy.",
    sideRequirement:
      "Grip can be per-hand; gait is generally bilateral/systemic for bilateral farmer carry.",
    provenanceNeed:
      "Reviewed load application, walkway, turns, carry dose, and grip-intensity threshold.",
    remainingUncertainty:
      "Whether axial exposure needs a neutral non-heavy tag or remains represented by dose/load context only.",
  },
  {
    candidateId: "suitcase-carry",
    intrinsicExposures: [
      "unilateral external load",
      "loaded gait",
      "grip loading",
      "lateral trunk loading",
    ],
    prescriptionModifiableExposures: ["load side", "distance", "duration", "trips", "load magnitude"],
    variantDependentExposures: [],
    doseCreatedExposures: ["grip_intensive", "heavy_axial_loading"],
    currentTagsThatFit: [],
    currentTagsThatDoNotFit: ["grip_intensive at every legal load", "heavy_axial_loading as static tag"],
    potentialNewTags: ["loaded_gait", "lateral_trunk_loading", "grip_loading"],
    sourcePlacement:
      "All three proposed exposure tags in joint_stress, with side compatibility deferred until prescription side is known.",
    receiverEffect:
      "Farmer carry differs by lateral trunk loading and unilateral grip/load side, not by a side-encoded tag name.",
    sideRequirement:
      "Required for single-side or each-side prescriptions; tag remains side-neutral.",
    provenanceNeed:
      "Reviewed side behavior, load application, gait dose, and lateral-loading interaction.",
    remainingUncertainty:
      "How contralateral symptoms should be handled must be owner-reviewed, not assumed harmless.",
  },
  {
    candidateId: "wall-supported-suitcase-march",
    intrinsicExposures: [
      "stationary loaded march",
      "unilateral load",
      "wall support",
      "grip loading",
      "lateral trunk loading unless reviewed support removes it",
    ],
    prescriptionModifiableExposures: ["support side", "load side", "support level", "steps", "duration", "load"],
    variantDependentExposures: ["lateral trunk loading under high support"],
    doseCreatedExposures: ["grip_intensive", "heavy_axial_loading"],
    currentTagsThatFit: [],
    currentTagsThatDoNotFit: ["loaded_gait", "high_impact", "grip_intensive at every legal load"],
    potentialNewTags: ["loaded_march", "lateral_trunk_loading", "grip_loading"],
    sourcePlacement:
      "loaded_march and grip_loading in joint_stress; lateral_trunk_loading requires prescription-realized support/load-side truth.",
    receiverEffect:
      "Stationary march is visible to pain/joint receivers without granting walking distance or loaded-gait exposure.",
    sideRequirement:
      "Required for load side, support side, and alternating step side.",
    provenanceNeed:
      "Reviewed wall support, no-distance truth, side behavior, and march dose.",
    remainingUncertainty:
      "Whether high wall support removes lateral trunk loading or only reduces magnitude.",
  },
];

export interface VariantDoseCounterfactual {
  readonly candidateId: TrunkCarryFutureIdentity;
  readonly variant: string;
  readonly remains: readonly string[];
  readonly changesMagnitude: readonly string[];
  readonly appears: readonly string[];
  readonly disappears: readonly string[];
  readonly remainsUnknown: readonly string[];
}

export const VARIANT_DOSE_COUNTERFACTUALS: readonly VariantDoseCounterfactual[] = [
  {
    candidateId: "forearm-plank",
    variant: "shortened/support-regressed",
    remains: ["sustained_upper_limb_support_loading"],
    changesMagnitude: ["duration", "effort", "support"],
    appears: [],
    disappears: ["long_lever_core"],
    remainsUnknown: [],
  },
  {
    candidateId: "forearm-plank",
    variant: "ordinary full lever",
    remains: ["sustained_upper_limb_support_loading"],
    changesMagnitude: ["duration", "effort"],
    appears: ["long_lever_core"],
    disappears: [],
    remainsUnknown: [],
  },
  {
    candidateId: "forearm-plank",
    variant: "lengthened lever",
    remains: ["sustained_upper_limb_support_loading", "long_lever_core"],
    changesMagnitude: ["lever", "duration", "effort"],
    appears: [],
    disappears: [],
    remainsUnknown: ["whether a longer-lever tag split is needed later"],
  },
  {
    candidateId: "forearm-side-plank",
    variant: "bent-knee/support-regressed",
    remains: ["sustained_upper_limb_support_loading"],
    changesMagnitude: ["lateral_trunk_loading", "duration", "support"],
    appears: [],
    disappears: [],
    remainsUnknown: ["whether lateral_trunk_loading can be removed under high support"],
  },
  {
    candidateId: "forearm-side-plank",
    variant: "full lever",
    remains: ["sustained_upper_limb_support_loading", "lateral_trunk_loading"],
    changesMagnitude: ["lever", "duration"],
    appears: [],
    disappears: [],
    remainsUnknown: ["long_lever_core double-count policy"],
  },
  {
    candidateId: "forearm-side-plank",
    variant: "externally loaded future state",
    remains: ["sustained_upper_limb_support_loading", "lateral_trunk_loading"],
    changesMagnitude: ["load", "lever", "duration"],
    appears: ["possible grip_loading if held implement is introduced"],
    disappears: [],
    remainsUnknown: ["whether external loading belongs in same exercise identity"],
  },
  {
    candidateId: "half-kneeling-high-to-low-cable-chop",
    variant: "reduced range/light load",
    remains: ["loaded_trunk_rotation"],
    changesMagnitude: ["range", "load"],
    appears: [],
    disappears: [],
    remainsUnknown: [],
  },
  {
    candidateId: "half-kneeling-high-to-low-cable-chop",
    variant: "ordinary reviewed dose",
    remains: ["loaded_trunk_rotation"],
    changesMagnitude: ["per-side dose"],
    appears: [],
    disappears: [],
    remainsUnknown: ["exact shoulder contribution"],
  },
  {
    candidateId: "half-kneeling-high-to-low-cable-chop",
    variant: "greater range/load",
    remains: ["loaded_trunk_rotation"],
    changesMagnitude: ["range", "load", "tempo"],
    appears: [],
    disappears: [],
    remainsUnknown: ["whether any high-load threshold creates additional stress truth"],
  },
  {
    candidateId: "farmer-carry",
    variant: "light short carry",
    remains: ["loaded_gait", "grip_loading"],
    changesMagnitude: ["load", "distance"],
    appears: [],
    disappears: ["grip_intensive", "heavy_axial_loading"],
    remainsUnknown: [],
  },
  {
    candidateId: "farmer-carry",
    variant: "moderate ordinary carry",
    remains: ["loaded_gait", "grip_loading"],
    changesMagnitude: ["load", "distance", "trips"],
    appears: [],
    disappears: [],
    remainsUnknown: ["heavy_axial_loading threshold"],
  },
  {
    candidateId: "farmer-carry",
    variant: "high-load long-distance future state",
    remains: ["loaded_gait", "grip_loading"],
    changesMagnitude: ["load", "distance", "turns"],
    appears: ["grip_intensive", "possible heavy_axial_loading after threshold approval"],
    disappears: [],
    remainsUnknown: ["exact heavy threshold"],
  },
  {
    candidateId: "suitcase-carry",
    variant: "left only",
    remains: ["loaded_gait", "grip_loading", "lateral_trunk_loading"],
    changesMagnitude: ["load side"],
    appears: [],
    disappears: [],
    remainsUnknown: ["side-specific pain compatibility until prescription validation"],
  },
  {
    candidateId: "suitcase-carry",
    variant: "right only",
    remains: ["loaded_gait", "grip_loading", "lateral_trunk_loading"],
    changesMagnitude: ["load side"],
    appears: [],
    disappears: [],
    remainsUnknown: ["side-specific pain compatibility until prescription validation"],
  },
  {
    candidateId: "suitcase-carry",
    variant: "each side",
    remains: ["loaded_gait", "grip_loading", "lateral_trunk_loading"],
    changesMagnitude: ["per-side exposure accounting"],
    appears: [],
    disappears: [],
    remainsUnknown: ["whether each side creates one or two prescription-side checks"],
  },
  {
    candidateId: "suitcase-carry",
    variant: "reduced load",
    remains: ["loaded_gait", "grip_loading"],
    changesMagnitude: ["load", "lateral_trunk_loading"],
    appears: [],
    disappears: ["grip_intensive", "heavy_axial_loading"],
    remainsUnknown: [],
  },
  {
    candidateId: "suitcase-carry",
    variant: "greater load/distance",
    remains: ["loaded_gait", "grip_loading", "lateral_trunk_loading"],
    changesMagnitude: ["load", "distance"],
    appears: ["possible grip_intensive after threshold approval"],
    disappears: [],
    remainsUnknown: ["heavy_axial_loading threshold"],
  },
  {
    candidateId: "wall-supported-suitcase-march",
    variant: "high support/light load",
    remains: ["loaded_march", "grip_loading"],
    changesMagnitude: ["support", "load", "steps"],
    appears: [],
    disappears: ["loaded_gait", "grip_intensive", "heavy_axial_loading"],
    remainsUnknown: ["whether lateral_trunk_loading is removed or reduced"],
  },
  {
    candidateId: "wall-supported-suitcase-march",
    variant: "reduced support/moderate load",
    remains: ["loaded_march", "grip_loading"],
    changesMagnitude: ["support", "load", "lateral_trunk_loading"],
    appears: ["lateral_trunk_loading if owner confirms support does not remove it"],
    disappears: ["loaded_gait"],
    remainsUnknown: [],
  },
  {
    candidateId: "wall-supported-suitcase-march",
    variant: "no walking distance",
    remains: ["loaded_march"],
    changesMagnitude: ["steps", "duration"],
    appears: [],
    disappears: ["loaded_gait"],
    remainsUnknown: [],
  },
];

export interface ReceiverSourceConsequenceRow {
  readonly sourcePlacement: readonly ExerciseStressSource[];
  readonly signalKind:
    | "current_discomfort"
    | "moderate_pain"
    | "hard_contraindication"
    | "acute_severe_pain";
  readonly canonicalMatchCount: number;
  readonly painSuitabilityUnits: number;
  readonly jointCostUnits: number;
  readonly warning: boolean;
  readonly hardCriteria: number;
  readonly acuteCriteria: number;
  readonly legal: boolean;
  readonly responseOwner: PainResponseOwner | "none";
}

export interface SyntheticReceiverLabRow {
  readonly candidateId: TrunkCarryFutureIdentity;
  readonly scenario: string;
  readonly stressTags: readonly string[];
  readonly sourcePlacement: readonly ExerciseStressSource[];
  readonly legal: "LEGAL" | "REJECTED";
  readonly warning: boolean;
  readonly canonicalMatchCount: number;
  readonly painSuitabilityUnits: number;
  readonly jointCostUnits: number;
  readonly hardCriteria: number;
  readonly acuteCriteria: number;
  readonly responseRequirement: string;
  readonly candidateExecutionReadiness: CandidatePainExecutionReadiness;
  readonly prescriptionDeferralNeed: string;
  readonly sourceProvenance: string;
}

const PRIMARY_SYNTHETIC_FACTS: Record<
  TrunkCarryFutureIdentity,
  {
    readonly stressTag: SyntheticStressTag;
    readonly prescriptionDeferralNeed: string;
    readonly sourceProvenance: string;
  }
> = {
  "forearm-plank": {
    stressTag: "sustained_upper_limb_support_loading",
    prescriptionDeferralNeed:
      "lever/duration/support can change magnitude; long_lever_core remains prescription-realized.",
    sourceProvenance: "proposal:forearm-plank:upper-limb-support",
  },
  "forearm-side-plank": {
    stressTag: "lateral_trunk_loading",
    prescriptionDeferralNeed:
      "side/support/lever must be realized before side-specific pain compatibility.",
    sourceProvenance: "proposal:forearm-side-plank:lateral-trunk-loading",
  },
  "machine-abdominal-crunch": {
    stressTag: "loaded_spinal_flexion",
    prescriptionDeferralNeed: "load/range/repetition dose must be realized.",
    sourceProvenance: "proposal:machine-abdominal-crunch:loaded-spinal-flexion",
  },
  "half-kneeling-high-to-low-cable-chop": {
    stressTag: "loaded_trunk_rotation",
    prescriptionDeferralNeed: "range/load/per-side direction must be realized.",
    sourceProvenance: "proposal:cable-chop:loaded-trunk-rotation",
  },
  "farmer-carry": {
    stressTag: "loaded_gait",
    prescriptionDeferralNeed: "load/distance/trips/turns must be realized.",
    sourceProvenance: "proposal:farmer-carry:loaded-gait",
  },
  "suitcase-carry": {
    stressTag: "lateral_trunk_loading",
    prescriptionDeferralNeed:
      "load side and each-side/single-side prescription must be realized.",
    sourceProvenance: "proposal:suitcase-carry:lateral-trunk-loading",
  },
  "wall-supported-suitcase-march": {
    stressTag: "loaded_march",
    prescriptionDeferralNeed:
      "support side, load side, steps, and no-distance truth must be realized.",
    sourceProvenance: "proposal:wall-supported-suitcase-march:loaded-march",
  },
};

const SECONDARY_SYNTHETIC_FACTS: Partial<
  Record<TrunkCarryFutureIdentity, SyntheticStressTag>
> = {
  "forearm-plank": "long_lever_core",
  "forearm-side-plank": "sustained_upper_limb_support_loading",
  "farmer-carry": "grip_loading",
  "suitcase-carry": "loaded_gait",
  "wall-supported-suitcase-march": "grip_loading",
};

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function list(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

function asJointStressTags(
  tags: readonly SyntheticStressTag[],
): readonly JointStressTag[] {
  return tags as unknown as readonly JointStressTag[];
}

function tagsForSource(
  facts: readonly {
    readonly tag: SyntheticStressTag;
    readonly sources: readonly ExerciseStressSource[];
  }[],
  source: ExerciseStressSource,
): readonly JointStressTag[] {
  return asJointStressTags(
    facts.filter((fact) => fact.sources.includes(source)).map((fact) => fact.tag),
  );
}

function syntheticExercise(input: {
  readonly exerciseId: TrunkCarryFutureIdentity;
  readonly facts: readonly {
    readonly tag: SyntheticStressTag;
    readonly sources: readonly ExerciseStressSource[];
  }[];
}): ExerciseDefinition {
  const base = syntheticExerciseForFixture(input.exerciseId);

  return {
    ...base,
    loading: {
      ...base.loading,
      jointStressTags: tagsForSource(input.facts, "joint_stress"),
    },
    cautionStressTags: tagsForSource(input.facts, "caution"),
    contraindicatedStressTags: tagsForSource(input.facts, "contraindicated"),
  };
}

function painState(input: {
  readonly kind:
    | "no_pain"
    | "current_discomfort"
    | "moderate_pain"
    | "acute_severe_pain"
    | "hard_contraindication"
    | "two_distinct_current_signals";
  readonly stressTags: readonly SyntheticStressTag[];
  readonly response?: "avoid_aggravator" | "reduce_load_and_range" | "substitute_role";
}): PainAndInjuryState {
  const stressTags = asJointStressTags(input.stressTags);

  switch (input.kind) {
    case "no_pain":
      return NO_PAIN_OR_INJURY;
    case "current_discomfort":
      return {
        ...NO_PAIN_OR_INJURY,
        currentDiscomforts: [{
          kind: "current_discomfort",
          id: "synthetic-current",
          region: "lumbar_spine",
          severity0To10: 2,
          stressTags,
          effect: "reduce_load",
          description: "Synthetic current-discomfort receiver probe.",
        }],
      };
    case "moderate_pain":
      return {
        ...NO_PAIN_OR_INJURY,
        moderatePain: [{
          kind: "moderate_pain",
          id: `synthetic-moderate-${input.response ?? "avoid_aggravator"}`,
          region: "lumbar_spine",
          severity0To10: 4,
          stressTags,
          requiredResponse: input.response ?? "avoid_aggravator",
          description: "Synthetic moderate-pain receiver probe.",
        }],
      };
    case "acute_severe_pain":
      return {
        ...NO_PAIN_OR_INJURY,
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "synthetic-acute",
          region: "lumbar_spine",
          severity0To10: 8,
          stressTags,
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: false,
          description: "Synthetic acute/severe receiver probe.",
        }],
      };
    case "hard_contraindication":
      return {
        ...NO_PAIN_OR_INJURY,
        hardContraindications: [{
          kind: "hard_contraindication",
          id: "synthetic-hard",
          stressTags,
          reason: "Synthetic hard-contraindication receiver probe.",
          source: "safety_rule",
        }],
      };
    case "two_distinct_current_signals":
      return {
        ...NO_PAIN_OR_INJURY,
        currentDiscomforts: [
          {
            kind: "current_discomfort",
            id: "synthetic-current-a",
            region: "lumbar_spine",
            severity0To10: 2,
            stressTags,
            effect: "reduce_load",
            description: "Synthetic current-discomfort receiver probe A.",
          },
          {
            kind: "current_discomfort",
            id: "synthetic-current-b",
            region: "lumbar_spine",
            severity0To10: 2,
            stressTags,
            effect: "reduce_load",
            description: "Synthetic current-discomfort receiver probe B.",
          },
        ],
      };
  }
}

function rowFor(input: {
  readonly candidateId: TrunkCarryFutureIdentity;
  readonly scenario: string;
  readonly facts: readonly {
    readonly tag: SyntheticStressTag;
    readonly sources: readonly ExerciseStressSource[];
  }[];
  readonly pain: PainAndInjuryState;
  readonly prescriptionDeferralNeed: string;
  readonly sourceProvenance: string;
}): SyntheticReceiverLabRow {
  const trace = buildCandidatePainMatchTrace({
    exercise: syntheticExercise({
      exerciseId: input.candidateId,
      facts: input.facts,
    }),
    painAndInjury: input.pain,
    requestedRole: "activation",
  });
  const painSuitability = receiverDecision(trace, "pain_suitability");
  const jointCost = receiverDecision(trace, "joint_cost");
  const warning = receiverDecision(trace, "moderate_warning");
  const hard = receiverDecision(trace, "hard_contraindication");
  const acute = receiverDecision(trace, "acute_severe_eligibility");
  const readiness = buildCandidatePainExecutionReadinessTrace(trace);
  const responseRequirement = trace.responseRequirements
    .map(
      (requirement) =>
        `${requirement.requestedAction}:${requirement.primaryFutureOwner}:${requirement.executionStatus}`,
    )
    .join("; ");

  return {
    candidateId: input.candidateId,
    scenario: input.scenario,
    stressTags: uniqueSorted(input.facts.map((fact) => fact.tag)),
    sourcePlacement: uniqueSorted(
      input.facts.flatMap((fact) => fact.sources),
    ) as readonly ExerciseStressSource[],
    legal:
      hard.executionStatus === "hard_rejected" ||
      acute.executionStatus === "hard_rejected"
        ? "REJECTED"
        : "LEGAL",
    warning: warning.executionStatus === "warning_emitted",
    canonicalMatchCount: trace.uniqueMatchCount,
    painSuitabilityUnits: painSuitability.countedMatchUnitCount,
    jointCostUnits: jointCost.countedMatchUnitCount,
    hardCriteria: hard.criteria.length,
    acuteCriteria: acute.criteria.length,
    responseRequirement: responseRequirement || "none",
    candidateExecutionReadiness: readiness.readiness,
    prescriptionDeferralNeed: input.prescriptionDeferralNeed,
    sourceProvenance: input.sourceProvenance,
  };
}

function defaultFacts(
  candidateId: TrunkCarryFutureIdentity,
  sources: readonly ExerciseStressSource[] = ["joint_stress"],
): readonly {
  readonly tag: SyntheticStressTag;
  readonly sources: readonly ExerciseStressSource[];
}[] {
  const primary = PRIMARY_SYNTHETIC_FACTS[candidateId];
  return [{ tag: primary.stressTag, sources }];
}

export function buildSyntheticReceiverLabRows(): readonly SyntheticReceiverLabRow[] {
  const rows: SyntheticReceiverLabRow[] = [];

  for (const candidateId of Object.keys(PRIMARY_SYNTHETIC_FACTS) as TrunkCarryFutureIdentity[]) {
    const primary = PRIMARY_SYNTHETIC_FACTS[candidateId];
    const tag = primary.stressTag;

    rows.push(
      rowFor({
        candidateId,
        scenario: "no pain",
        facts: defaultFacts(candidateId),
        pain: painState({ kind: "no_pain", stressTags: [] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "unrelated current discomfort",
        facts: defaultFacts(candidateId),
        pain: painState({
          kind: "current_discomfort",
          stressTags: ["overhead_pressing"],
        }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "matching current discomfort",
        facts: defaultFacts(candidateId),
        pain: painState({ kind: "current_discomfort", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      ...(["avoid_aggravator", "reduce_load_and_range", "substitute_role"] as const)
        .map((response) =>
          rowFor({
            candidateId,
            scenario: `matching moderate pain: ${response}`,
            facts: defaultFacts(candidateId),
            pain: painState({
              kind: "moderate_pain",
              stressTags: [tag],
              response,
            }),
            prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
            sourceProvenance: primary.sourceProvenance,
          }),
        ),
      rowFor({
        candidateId,
        scenario: "matching acute/severe pain",
        facts: defaultFacts(candidateId),
        pain: painState({ kind: "acute_severe_pain", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "matching hard contraindication",
        facts: defaultFacts(candidateId),
        pain: painState({ kind: "hard_contraindication", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "caution-only source",
        facts: defaultFacts(candidateId, ["caution"]),
        pain: painState({ kind: "current_discomfort", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "joint-source placement",
        facts: defaultFacts(candidateId, ["joint_stress"]),
        pain: painState({ kind: "current_discomfort", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "contraindicated-only placement",
        facts: defaultFacts(candidateId, ["contraindicated"]),
        pain: painState({ kind: "current_discomfort", stressTags: [tag] }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "duplicate source placement",
        facts: defaultFacts(candidateId, ["joint_stress", "caution"]),
        pain: painState({
          kind: "current_discomfort",
          stressTags: [tag, tag],
        }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
      rowFor({
        candidateId,
        scenario: "two distinct signals sharing one tag",
        facts: defaultFacts(candidateId),
        pain: painState({
          kind: "two_distinct_current_signals",
          stressTags: [tag],
        }),
        prescriptionDeferralNeed: primary.prescriptionDeferralNeed,
        sourceProvenance: primary.sourceProvenance,
      }),
    );

    const secondaryTag = SECONDARY_SYNTHETIC_FACTS[candidateId];
    rows.push(
      rowFor({
        candidateId,
        scenario: "multiple tags from one signal",
        facts: secondaryTag
          ? [
              { tag, sources: ["joint_stress"] },
              { tag: secondaryTag, sources: ["joint_stress"] },
            ]
          : [{ tag, sources: ["joint_stress"] }],
        pain: painState({
          kind: "current_discomfort",
          stressTags: secondaryTag ? [tag, secondaryTag] : [tag],
        }),
        prescriptionDeferralNeed: secondaryTag
          ? primary.prescriptionDeferralNeed
          : "No second truthful proposal tag is attached to this candidate; invariant is represented as a single matched fact.",
        sourceProvenance: primary.sourceProvenance,
      }),
    );
  }

  return rows;
}

export function buildReceiverSourceConsequences(): readonly ReceiverSourceConsequenceRow[] {
  const placements: readonly (readonly ExerciseStressSource[])[] = [
    ["joint_stress"],
    ["caution"],
    ["contraindicated"],
    ["joint_stress", "caution"],
  ];
  const signalKinds: readonly ReceiverSourceConsequenceRow["signalKind"][] = [
    "current_discomfort",
    "moderate_pain",
    "hard_contraindication",
    "acute_severe_pain",
  ];

  return placements.flatMap((sourcePlacement) =>
    signalKinds.map((signalKind) => {
      const trace = buildCandidatePainMatchTrace({
        exercise: syntheticExercise({
          exerciseId: "forearm-plank",
          facts: [{
            tag: "sustained_upper_limb_support_loading",
            sources: sourcePlacement,
          }],
        }),
        painAndInjury: painState({
          kind: signalKind,
          stressTags: ["sustained_upper_limb_support_loading"],
          response: "reduce_load_and_range",
        }),
        requestedRole: "activation",
      });
      const hard = receiverDecision(trace, "hard_contraindication");
      const acute = receiverDecision(trace, "acute_severe_eligibility");
      const requirement = trace.responseRequirements[0] ?? null;

      return {
        sourcePlacement,
        signalKind,
        canonicalMatchCount: trace.uniqueMatchCount,
        painSuitabilityUnits: receiverDecision(trace, "pain_suitability")
          .countedMatchUnitCount,
        jointCostUnits: receiverDecision(trace, "joint_cost").countedMatchUnitCount,
        warning:
          receiverDecision(trace, "moderate_warning").executionStatus ===
          "warning_emitted",
        hardCriteria: hard.criteria.length,
        acuteCriteria: acute.criteria.length,
        legal:
          hard.executionStatus !== "hard_rejected" &&
          acute.executionStatus !== "hard_rejected",
        responseOwner: requirement?.primaryFutureOwner ?? "none",
      };
    }),
  );
}

function currentMetadataRows(tag: JointStressTag): {
  readonly exercisesUsingIt: readonly string[];
  readonly metadataSources: readonly string[];
} {
  const rows = REFERENCE_EXERCISES.flatMap((exercise) => {
    const sources: string[] = [];
    if (exercise.loading.jointStressTags.includes(tag)) {
      sources.push("loading.jointStressTags");
    }
    if (exercise.cautionStressTags.includes(tag)) {
      sources.push("cautionStressTags");
    }
    if (exercise.contraindicatedStressTags.includes(tag)) {
      sources.push("contraindicatedStressTags");
    }
    return sources.length > 0
      ? [{
          exercise: `${exercise.id} [${sources.join(" + ")}]`,
          sources,
        }]
      : [];
  });

  return {
    exercisesUsingIt: rows.map((row) => row.exercise),
    metadataSources: uniqueSorted(rows.flatMap((row) => row.sources)),
  };
}

export function buildCurrentStressVocabularyInventory(): readonly CurrentStressVocabularyRow[] {
  return JOINT_STRESS_TAGS.map((tag) => {
    const metadata = currentMetadataRows(tag);
    const decision = CURRENT_TAG_DECISIONS[tag];

    return {
      tag,
      ...decision,
      exercisesUsingIt: metadata.exercisesUsingIt,
      metadataSources: metadata.metadataSources,
      painSignalsUsingIt: PAIN_SIGNALS_USING_STRESS_TAGS,
      receiversConsumingIt: RECEIVERS_CONSUMING_STRESS_TAGS,
      currentProvenance:
        "Static reference exercise metadata and the accepted canonical pain contract; no field-level exercise-science provenance exists for these tags.",
    };
  });
}

export interface TrunkCarryPainStressReviewData {
  readonly classification: typeof TRUNK_CARRY_PAIN_STRESS_CLASSIFICATION;
  readonly currentVocabulary: readonly CurrentStressVocabularyRow[];
  readonly proposedTagDecisions: readonly ProposedStressTagDecision[];
  readonly rejectedVagueTags: readonly string[];
  readonly candidateAudit: readonly CandidateStressAuditRow[];
  readonly receiverSourceConsequences: readonly ReceiverSourceConsequenceRow[];
  readonly syntheticReceiverRows: readonly SyntheticReceiverLabRow[];
  readonly variantDoseCounterfactuals: readonly VariantDoseCounterfactual[];
  readonly sideSpecificPainFinding: string;
  readonly hardAuthorityRecommendation: string;
  readonly prescriptionStressTraceRecommendation: string;
  readonly ownerDecisionsRequired: readonly string[];
  readonly implementationBoundary: readonly string[];
  readonly behaviorFingerprints: {
    readonly productionRankingFingerprint: string;
    readonly productionRankingMatches: boolean;
    readonly comprehensiveBehaviorFingerprint: string;
    readonly comprehensiveBehaviorMatches: boolean;
    readonly referenceCatalogFingerprint: string;
    readonly referenceCatalogMatches: boolean;
    readonly equipmentLegalityFingerprint: string;
    readonly equipmentLegalityMatches: boolean;
    readonly expandedEquipmentFixtureFingerprint: string;
    readonly expandedEquipmentFixtureMatches: boolean;
  };
}

export function buildTrunkCarryPainStressReviewData(): TrunkCarryPainStressReviewData {
  const structured = buildStructuredPrescriptionContractData();

  return {
    classification: TRUNK_CARRY_PAIN_STRESS_CLASSIFICATION,
    currentVocabulary: buildCurrentStressVocabularyInventory(),
    proposedTagDecisions: PROPOSED_STRESS_TAG_DECISIONS,
    rejectedVagueTags: [...REJECTED_VAGUE_STRESS_TAGS],
    candidateAudit: CANDIDATE_STRESS_AUDIT,
    receiverSourceConsequences: buildReceiverSourceConsequences(),
    syntheticReceiverRows: buildSyntheticReceiverLabRows(),
    variantDoseCounterfactuals: VARIANT_DOSE_COUNTERFACTUALS,
    sideSpecificPainFinding:
      "Current matchable pain signals have no usable side and the canonical matcher emits side null; unilateral trunk/carry compatibility must remain deferred to prescription-realized side truth until optional side is added to HistoricalSensitivity, CurrentDiscomfort, ModeratePain, AcuteSeverePain, and HardContraindication.",
    hardAuthorityRecommendation:
      "Adopt Policy C: intrinsic candidate stress remains eligible for candidate hard/acute authority, while variant-, dose-, or prescription-removable exposure is deferred to prescription realization with traceable unresolved requirements.",
    prescriptionStressTraceRecommendation:
      "Add a future PrescriptionStressExposureTrace only after owner approval; it should expose prescriptionId, sourceExposureEventId, exerciseId, stressTag, exercisePotential, realizationStatus, side, load, range, support, lever, duration/distance/steps, provenance, and receiverEligibility.",
    ownerDecisionsRequired: [
      "Approve or rename each proposed stress tag before it enters JOINT_STRESS_TAGS.",
      "Approve source placement and exposureScope for every candidate/tag pair.",
      "Decide whether modifiable exposure uses Policy C trace semantics before hard/acute matching changes.",
      "Approve optional side fields for matchable pain signals and prescription-side compatibility rules.",
      "Approve grip_intensive and heavy_axial_loading dose thresholds before migration.",
      "Approve whether wall-supported suitcase march remains provisional or becomes a production identity.",
      "Curate exact seven-exercise metadata only after the above decisions are made.",
    ],
    implementationBoundary: [
      "No production JointStressTag additions in this task.",
      "No current exercise stress metadata changes in this task.",
      "No pain coefficients, receiver policies, hard gates, rankings, phase, assessment, prescription generation, transitions, apps, packages/engine, Session Composer, or Weekly Composer changes.",
      "Tests and docs validate the proposal-only laboratory and current-behavior fingerprints.",
    ],
    behaviorFingerprints: {
      productionRankingFingerprint: structured.productionRankingFingerprint,
      productionRankingMatches: structured.productionRankingMatches,
      comprehensiveBehaviorFingerprint: structured.comprehensiveBehaviorFingerprint,
      comprehensiveBehaviorMatches: structured.comprehensiveBehaviorMatches,
      referenceCatalogFingerprint: structured.referenceCatalogFingerprint,
      referenceCatalogMatches: structured.referenceCatalogMatches,
      equipmentLegalityFingerprint: structured.equipmentLegalityFingerprint,
      equipmentLegalityMatches: structured.equipmentLegalityMatches,
      expandedEquipmentFixtureFingerprint:
        structured.expandedEquipmentFixtureFingerprint,
      expandedEquipmentFixtureMatches: structured.expandedEquipmentFixtureMatches,
    },
  };
}

function sourceStatus(status: PainReceiverExecutionStatus): string {
  return status === "hard_rejected" ? "rejected" : status;
}

function currentVocabularyTable(
  rows: readonly CurrentStressVocabularyRow[],
): string {
  return table(
    [
      "Tag",
      "Classes",
      "Exercises",
      "Sources",
      "Intrinsic / dose",
      "Variant / side",
      "Treatment",
    ],
    rows.map((row) => [
      row.tag,
      row.classifications.join(", "),
      list(row.exercisesUsingIt),
      list(row.metadataSources),
      row.intrinsicOrDoseDependent,
      `${row.variantDependentOrGeneral} Side: ${row.sideSpecificPotential}`,
      row.recommendedTreatment,
    ]),
  );
}

function table(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function bullets(rows: readonly string[]): string {
  return rows.map((row) => `- ${row}`).join("\n");
}

export function renderTrunkCarryPainStressReviewReport(
  data = buildTrunkCarryPainStressReviewData(),
): string {
  const sourceRows = data.receiverSourceConsequences.map((row) => [
    row.sourcePlacement.join(" + "),
    row.signalKind,
    row.legal ? "LEGAL" : "REJECTED",
    row.warning ? "yes" : "no",
    String(row.canonicalMatchCount),
    String(row.painSuitabilityUnits),
    String(row.jointCostUnits),
    String(row.hardCriteria),
    String(row.acuteCriteria),
    row.responseOwner,
  ]);
  const syntheticSummaryRows = data.syntheticReceiverRows.map((row) => [
    row.candidateId,
    row.scenario,
    row.legal,
    row.warning ? "yes" : "no",
    String(row.canonicalMatchCount),
    String(row.painSuitabilityUnits),
    String(row.jointCostUnits),
    String(row.hardCriteria),
    String(row.acuteCriteria),
    row.candidateExecutionReadiness,
  ]);

  return [
    "# Trunk / Carry Pain-Stress Vocabulary and Receiver Review",
    "",
    "## Boundary",
    "",
    "This is a deterministic review and proposal-only laboratory. It adds no production exercise, production stress tag, pain signal field, stress metadata, coefficient, hard gate, ranking behavior, phase behavior, assessment behavior, prescription generation, transition behavior, Session Composer, Weekly Composer, apps/**, or packages/engine/** change.",
    "",
    "Pain-stress metadata describes a modeled training exposure. It does not describe a diagnosis, tissue damage, universal danger, exercise quality, exercise difficulty, progression, or a reason every athlete should avoid an exercise. A mechanical function is not automatically a pain-stress fact.",
    "",
    "## Current Vocabulary Inventory",
    "",
    currentVocabularyTable(data.currentVocabulary),
    "",
    "Pain signals that can currently supply stress tags: " +
      list([...PAIN_SIGNALS_USING_STRESS_TAGS]) +
      ". Receivers consuming canonical stress facts: " +
      list([...RECEIVERS_CONSUMING_STRESS_TAGS]) +
      ".",
    "",
    "## Static Versus Prescription-Realized Exposure",
    "",
    "Exercise-level stress metadata can truthfully identify intrinsic exposure and reviewed possible exposure channels. The accepted structured prescription contract can represent load, lever, support, side, range, duration, distance, trips, steps, tempo, effort, and one source exposure event. Therefore dose-created, side-specific, and variant-removable facts should not be converted into unconditional static candidate tags.",
    "",
    "Minimum architecture recommendation: use structured exercise stress annotation before production metadata, then add prescription-realized stress evidence before hard/acute matching consumes modifiable exposure. Raw arrays remain sufficient only for today's simple intrinsic facts.",
    "",
    "## Candidate Audit",
    "",
    table(
      [
        "Candidate",
        "Intrinsic exposures",
        "Modifiable / variant / dose",
        "Current tags",
        "Potential tags",
        "Source / receiver / side",
      ],
      data.candidateAudit.map((row) => [
        row.candidateId,
        list(row.intrinsicExposures),
        `M: ${list(row.prescriptionModifiableExposures)} V: ${list(row.variantDependentExposures)} D: ${list(row.doseCreatedExposures)}`,
        `fit: ${list(row.currentTagsThatFit)}; no: ${list(row.currentTagsThatDoNotFit)}`,
        list(row.potentialNewTags),
        `${row.sourcePlacement} ${row.receiverEffect} Side: ${row.sideRequirement}`,
      ]),
    ),
    "",
    "## Potential New-Tag Analysis",
    "",
    table(
      [
        "Concept",
        "Proposed name",
        "Recommendation",
        "Candidates",
        "Scope",
        "Receiver need",
        "Double-count risk",
      ],
      data.proposedTagDecisions.map((row) => [
        row.concept,
        row.proposedName ?? "none",
        row.recommendation,
        list(row.candidateIds),
        row.exposureScope,
        row.receiverNeed,
        row.doubleCountRisk,
      ]),
    ),
    "",
    "Rejected vague tags: " + list(data.rejectedVagueTags) + ".",
    "",
    "## Source / Receiver Matrix",
    "",
    table(
      [
        "Source",
        "Signal",
        "Legal",
        "Warning",
        "Canonical",
        "Pain units",
        "Joint units",
        "Hard criteria",
        "Acute criteria",
        "Owner",
      ],
      sourceRows,
    ),
    "",
    "Receiver-source summary: joint_stress feeds pain suitability, joint cost, moderate warning, hard criteria, and acute criteria. Caution feeds pain suitability, joint cost, and moderate warning, but is not hard/acute authority. Contraindicated-only feeds pain suitability, moderate warning, and explicit hard criteria, but not joint cost or acute criteria.",
    "",
    "## Side-Specific Pain Gap",
    "",
    data.sideSpecificPainFinding,
    "",
    "Minimum future contract: add optional side to the matchable pain signals, keep tags side-neutral, and evaluate bilateral, single-side, each-side, and alternating prescriptions only when prescription side behavior is known. Candidate Intelligence cannot decide load-side compatibility before prescription side is compiled.",
    "",
    "## Intrinsic Versus Modifiable Hard Authority",
    "",
    data.hardAuthorityRecommendation,
    "",
    "Risk: Policy A over-rejects removable variants, while Policy B can hide unresolved prescription work. Policy C preserves intrinsic candidate truth and forces modifiable exposure into an explicit prescription requirement trace.",
    "",
    "## Prescription-Realized Stress Concept",
    "",
    data.prescriptionStressTraceRecommendation,
    "",
    "Integration: validateStructuredPrescriptionContext should confirm whether a possible exposure is present, removed by reviewed variant, dose-not-yet-classified, or unknown. PainResponseRequirementTrace should point to unresolved prescription exposure. ExercisePerformanceRecord should record actual realized exposure and response. ProgressionEvidence should use completed performance and unresolved pain-response evidence. The Weekly Development Ledger should aggregate one completed source exposure event rather than cloned facts.",
    "",
    "## Synthetic Receiver Matrix",
    "",
    table(
      [
        "Candidate",
        "Scenario",
        "Legal",
        "Warn",
        "Canonical",
        "Pain",
        "Joint",
        "Hard",
        "Acute",
        "Readiness",
      ],
      syntheticSummaryRows,
    ),
    "",
    "The synthetic rows use proposal-only strings in synthetic exercises and never add them to REFERENCE_EXERCISES. Representative receiver status values remain: hard=" +
      sourceStatus(
        receiverDecision(
          buildCandidatePainMatchTrace({
            exercise: syntheticExercise({
              exerciseId: "forearm-plank",
              facts: [{
                tag: "sustained_upper_limb_support_loading",
                sources: ["joint_stress"],
              }],
            }),
            painAndInjury: painState({
              kind: "hard_contraindication",
              stressTags: ["sustained_upper_limb_support_loading"],
            }),
          }),
          "hard_contraindication",
        ).executionStatus,
      ) +
      ", acute=" +
      sourceStatus(
        receiverDecision(
          buildCandidatePainMatchTrace({
            exercise: syntheticExercise({
              exerciseId: "forearm-plank",
              facts: [{
                tag: "sustained_upper_limb_support_loading",
                sources: ["caution"],
              }],
            }),
            painAndInjury: painState({
              kind: "acute_severe_pain",
              stressTags: ["sustained_upper_limb_support_loading"],
            }),
          }),
          "acute_severe_eligibility",
        ).executionStatus,
      ) +
      ".",
    "",
    "## Variant And Dose Counterfactuals",
    "",
    table(
      ["Candidate", "Variant", "Remain", "Magnitude changes", "Appear", "Disappear", "Unknown"],
      data.variantDoseCounterfactuals.map((row) => [
        row.candidateId,
        row.variant,
        list(row.remains),
        list(row.changesMagnitude),
        list(row.appears),
        list(row.disappears),
        list(row.remainsUnknown),
      ]),
    ),
    "",
    "## Current-Tag Migration Risks",
    "",
    table(
      ["Tag", "Treatment", "Risk"],
      data.currentVocabulary
        .filter((row) =>
          [
            "long_lever_core",
            "grip_intensive",
            "heavy_axial_loading",
            "loaded_spinal_flexion",
            "loaded_spinal_extension",
          ].includes(row.tag),
        )
        .map((row) => [row.tag, row.recommendedTreatment, row.ambiguity]),
    ),
    "",
    "No migration is performed. Current production behavior remains unchanged.",
    "",
    "## Owner Decisions Required",
    "",
    bullets(data.ownerDecisionsRequired),
    "",
    "## Recommended Minimum Implementation Boundary",
    "",
    bullets(data.implementationBoundary),
    "",
    "## Behavior Fingerprints",
    "",
    table(
      ["Artifact", "Current fingerprint", "Unchanged"],
      [
        [
          "22-scenario production ranking",
          data.behaviorFingerprints.productionRankingFingerprint,
          String(data.behaviorFingerprints.productionRankingMatches),
        ],
        [
          "Comprehensive behavior",
          data.behaviorFingerprints.comprehensiveBehaviorFingerprint,
          String(data.behaviorFingerprints.comprehensiveBehaviorMatches),
        ],
        [
          "Reference catalog",
          data.behaviorFingerprints.referenceCatalogFingerprint,
          String(data.behaviorFingerprints.referenceCatalogMatches),
        ],
        [
          "Equipment legality",
          data.behaviorFingerprints.equipmentLegalityFingerprint,
          String(data.behaviorFingerprints.equipmentLegalityMatches),
        ],
        [
          "Expanded equipment fixtures",
          data.behaviorFingerprints.expandedEquipmentFixtureFingerprint,
          String(data.behaviorFingerprints.expandedEquipmentFixtureMatches),
        ],
      ],
    ),
    "",
    "## Explicit Uncertainty",
    "",
    "Every proposed tag and source assignment still requires project-owner exercise-science review. The laboratory proves receiver consequences and invariants; it does not prove clinical safety, tissue state, or universal training risk. External primary references are recommended before production curation for upper-limb support loading, resisted trunk rotation, lateral trunk loading, loaded gait/march, and grip-loading thresholds.",
    "",
    "## Final Classification",
    "",
    `**${data.classification}**`,
    "",
    "The contract is ready for owner decision because the smallest truthful vocabulary, source consequences, side gap, hard-authority boundary, prescription-realized stress concept, and no-production-change invariants are now explicit. Production metadata remains blocked until owner decisions and exact seven-exercise curation are complete.",
  ].join("\n") + "\n";
}
