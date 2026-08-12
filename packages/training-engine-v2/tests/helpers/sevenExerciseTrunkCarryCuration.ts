import type {
  BodyRegion,
  EquipmentCapabilityKey,
  ExerciseDemandAnnotationLevel,
  ExerciseFamily,
  ExerciseFitDependency,
  ExerciseLaterality,
  ExerciseLineOfPullAdjustability,
  ExerciseResistancePathType,
  ExerciseStressAnnotation,
  ExerciseStressExposureScope,
  ExerciseStressSideScope,
  ExerciseTransitionClassification,
  ExerciseTrajectoryFreedom,
  JointStressTag,
  MovementRole,
  MuscleGroup,
  ProgressionAxis,
  SessionSection,
  TrainingRole,
  TrunkFunctionLevel,
  TrunkMechanicsFunction,
} from "../../src";
import {
  CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
  CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
  buildCurrentEquipmentLegalityFingerprint,
  buildExpandedEquipmentFixtureFingerprint,
} from "./trunkCarryEquipmentContract";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";

export const SEVEN_EXERCISE_TRUNK_CARRY_CURATION_CLASSIFICATION =
  "SEVEN_EXERCISE_TRUNK_CARRY_CURATION_READY_FOR_OWNER_APPROVAL";

export const PRODUCTION_CATALOG_IMPLEMENTATION_READINESS =
  "PRODUCTION_CATALOG_IMPLEMENTATION_BLOCKED";

export const PRODUCTION_CATALOG_IMPLEMENTATION_BLOCKERS = [
  "PRODUCTION_CATALOG_IMPLEMENTATION_REQUIRES_PHASE_CONTRACT_FIRST",
  "Owner must approve the exact seven-exercise curation decisions before catalog rows are added.",
  "Production implementation must add isolated behavior-fingerprint tests for the rows and any structured/legacy stress compatibility.",
] as const;

export const CURATED_TRUNK_CARRY_IDS = [
  "forearm-plank",
  "forearm-side-plank",
  "machine-abdominal-crunch",
  "half-kneeling-high-to-low-cable-chop",
  "farmer-carry",
  "suitcase-carry",
  "wall-supported-suitcase-march",
] as const;

export const DEFERRED_TRUNK_CARRY_IDS = [
  "rollout",
  "cable-crunch",
  "reverse-crunch",
  "front-rack-carry",
  "overhead-carry",
  "suitcase-hold",
  "band-chop",
] as const;

export type CuratedTrunkCarryId = (typeof CURATED_TRUNK_CARRY_IDS)[number];
export type PersonaClassification =
  | "good_candidate_possibility"
  | "context_dependent"
  | "unavailable"
  | "prescription_review_required"
  | "likely_unnecessary"
  | "not_appropriate_for_requested_purpose";

export interface IdentityDefinition {
  readonly exactIdentity: string;
  readonly startPosition: string;
  readonly support: string;
  readonly implementResistance: string;
  readonly movementPath: string;
  readonly intendedTrunkAction: string;
  readonly pelvisRibcageRelationship: string;
  readonly laterality: string;
  readonly endCondition: string;
  readonly prescriptionChangesSameIdentity: readonly string[];
  readonly newExerciseIdRequired: readonly string[];
}

export interface GenericDemandProposal {
  readonly dimension:
    | "trunk_control"
    | "scapular_control"
    | "stability"
    | "coordination"
    | "range"
    | "joint_control";
  readonly level: ExerciseDemandAnnotationLevel;
  readonly evidenceBasis: string;
}

export interface TrunkMechanicsFieldProposal {
  readonly functionName: TrunkMechanicsFunction;
  readonly level: TrunkFunctionLevel;
  readonly reviewStatus: "accepted" | "needs_review";
  readonly provenance: readonly string[];
  readonly evidenceCluster: string;
  readonly claim: string;
  readonly uncertainty: string;
  readonly riskOfOverreach: string;
  readonly externalPrimaryEvidenceStatus: "EXTERNAL_REFERENCE_PENDING";
}

export interface StressProposal {
  readonly tag: JointStressTag;
  readonly source: ExerciseStressAnnotation["source"];
  readonly exposureScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly reviewStatus: ExerciseStressAnnotation["reviewStatus"];
  readonly provenance: readonly string[];
  readonly notes: string;
}

export interface LegacyStressRecommendation {
  readonly jointStressTags: readonly JointStressTag[];
  readonly cautionStressTags: readonly JointStressTag[];
  readonly contraindicatedStressTags: readonly JointStressTag[];
  readonly compatibilityPolicy: string;
}

export interface TransitionProposal {
  readonly targetExerciseId: string;
  readonly direction: "progression" | "regression" | "lateral";
  readonly classification: ExerciseTransitionClassification;
  readonly automaticSelectionEffect: "none";
  readonly reason: string;
}

export interface ExecutionCriterionProposal {
  readonly dimension:
    | "position_control"
    | "movement_control"
    | "range_control"
    | "tempo_control"
    | "breathing_pressure_control"
    | "support_control"
    | "side_or_symmetry_control"
    | "gait_load_transfer_control"
    | "exercise_intent_preservation";
  readonly importance: "required_for_progression" | "preferred" | "observational";
  readonly reason: string;
}

export interface PhaseContextAudit {
  readonly currentGlobalPhaseValueTruthful: "no";
  readonly roleSectionScopedEvidenceRequired: "yes";
  readonly acceptedPhaseEvidenceAvailable: "no";
  readonly needsReview: "yes";
  readonly unknown: "yes";
  readonly productionImplementationBlockedByCurrentPhaseSchema:
    "PRODUCTION_CATALOG_IMPLEMENTATION_REQUIRES_PHASE_CONTRACT_FIRST";
}

export interface CandidatePoolEffect {
  readonly requestedMovementRoles: readonly MovementRole[];
  readonly likelyCompetingExistingCandidates: readonly string[];
  readonly createsNewBootstrapRole: boolean;
  readonly genuineDiversity: string;
  readonly redundancyRisk: string;
}

export interface MarginalValueReview {
  readonly uniqueValue: string;
  readonly redundancyRisk: string;
  readonly existingExerciseCouldCoverNeedWhen: string;
  readonly futureLedgerCharacteristics: string;
  readonly newSlotWhen: string;
  readonly doNotAddWhen: string;
}

export interface PersonaRow {
  readonly persona: string;
  readonly classification: PersonaClassification;
  readonly reason: string;
}

export interface CuratedExerciseContract {
  readonly id: CuratedTrunkCarryId;
  readonly displayName: string;
  readonly summary: string;
  readonly finalVerdict: "READY_FOR_OWNER_APPROVAL" | "OWNER_DECISION_REQUIRED";
  readonly identity: IdentityDefinition;
  readonly family: ExerciseFamily;
  readonly movementRoles: readonly MovementRole[];
  readonly movementRoleNotes: string;
  readonly trainingRoles: readonly TrainingRole[];
  readonly sectionSuitability: readonly SessionSection[];
  readonly primaryMuscles: readonly MuscleGroup[];
  readonly keySecondaryMuscles: readonly MuscleGroup[];
  readonly incidentalContributors: readonly string[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly equipment: readonly EquipmentCapabilityKey[];
  readonly optionalEquipment: readonly EquipmentCapabilityKey[];
  readonly prerequisites: readonly string[];
  readonly prerequisiteNotes: string;
  readonly loadingProfile: string;
  readonly supportMechanics: {
    readonly externalSupport:
      | "none"
      | "floor"
      | "wall"
      | "bench"
      | "machine"
      | "box"
      | "cable_or_band_anchor"
      | "unknown";
    readonly bodySupport:
      | "none"
      | "supine"
      | "prone"
      | "chest_supported"
      | "seated_supported"
      | "hands_supported"
      | "standing"
      | "unknown";
    readonly notes: string;
  };
  readonly resistancePathMechanics: {
    readonly resistancePath: ExerciseResistancePathType;
    readonly trajectoryFreedom: ExerciseTrajectoryFreedom;
    readonly lineOfPullAdjustability: ExerciseLineOfPullAdjustability;
    readonly laterality: ExerciseLaterality;
    readonly fitDependency: ExerciseFitDependency;
    readonly notes: string;
  };
  readonly genericDemands: readonly GenericDemandProposal[];
  readonly scapularMechanics: string;
  readonly trunkMechanics: readonly TrunkMechanicsFieldProposal[];
  readonly sharedEvidenceClusters: readonly string[];
  readonly structuredStress: readonly StressProposal[];
  readonly legacyStressRecommendation: LegacyStressRecommendation;
  readonly progressionAxes: readonly ProgressionAxis[];
  readonly progressionRunway: {
    readonly earlyPrescriptionState: string;
    readonly standardState: string;
    readonly laterProgressionOptions: string;
    readonly runsOutOfRunwayWhen: string;
    readonly notProgression: string;
  };
  readonly transitionRelationships: readonly TransitionProposal[];
  readonly coachingPurposeBoundary: string;
  readonly prescriptionModes: readonly (
    | "repetition_sets"
    | "timed_hold"
    | "breath_cycles"
    | "distance_carry"
    | "timed_carry"
    | "step_march"
  )[];
  readonly executionStandardNeeds: readonly ExecutionCriterionProposal[];
  readonly phaseContext: PhaseContextAudit;
  readonly candidatePoolEffect: CandidatePoolEffect;
  readonly marginalValue: MarginalValueReview;
  readonly personaReview: readonly PersonaRow[];
  readonly provenance: readonly string[];
  readonly unresolvedUnknowns: readonly string[];
  readonly contractGaps: readonly string[];
}

const AUTHORITY_PROVENANCE = [
  "docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md",
  "docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md",
  "docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md",
  "docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md",
  "docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md",
  "docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md",
] as const;

const TRUNK_FUNCTIONS: readonly TrunkMechanicsFunction[] = [
  "breathingPressureCoordination",
  "antiExtensionContribution",
  "antiRotationContribution",
  "antiLateralFlexionContribution",
  "controlledFlexionContribution",
  "controlledRotationContribution",
  "loadedBracingContribution",
  "gaitLoadTransferContribution",
];

const PERSONAS = [
  "novice general fitness",
  "beginner home dumbbells",
  "intermediate commercial-gym hypertrophy",
  "advanced strength/hypertrophy user",
  "posture/movement-quality user",
  "pain-aware return user",
  "grip-limited user",
  "shoulder-sensitive user",
  "low-back-sensitive user",
  "user with little walking space",
] as const;

function demand(
  dimension: GenericDemandProposal["dimension"],
  level: ExerciseDemandAnnotationLevel,
  evidenceBasis: string,
): GenericDemandProposal {
  return { dimension, level, evidenceBasis };
}

function criterion(
  dimension: ExecutionCriterionProposal["dimension"],
  importance: ExecutionCriterionProposal["importance"],
  reason: string,
): ExecutionCriterionProposal {
  return { dimension, importance, reason };
}

function stress(
  tag: JointStressTag,
  exposureScope: ExerciseStressExposureScope,
  sideScope: ExerciseStressSideScope,
  notes: string,
): StressProposal {
  return {
    tag,
    source: "joint_stress",
    exposureScope,
    sideScope,
    reviewStatus: "accepted",
    provenance: ["TRUNK-CARRY-PAIN-STRESS-OWNER-2026-08-12"],
    notes,
  };
}

function mechanics(input: Partial<Record<TrunkMechanicsFunction, {
  readonly level: TrunkFunctionLevel;
  readonly evidenceCluster: string;
  readonly claim: string;
  readonly uncertainty?: string;
  readonly riskOfOverreach?: string;
}>>): readonly TrunkMechanicsFieldProposal[] {
  return TRUNK_FUNCTIONS.map((functionName) => {
    const accepted = input[functionName];
    if (!accepted) {
      return {
        functionName,
        level: "unknown",
        reviewStatus: "needs_review",
        provenance: [],
        evidenceCluster: "not-reviewed-for-this-identity",
        claim: "No accepted curation claim.",
        uncertainty: "Unknown remains unknown until field-specific owner/human review exists.",
        riskOfOverreach: "Filling this from the exercise name would create fake certainty.",
        externalPrimaryEvidenceStatus: "EXTERNAL_REFERENCE_PENDING",
      };
    }

    return {
      functionName,
      level: accepted.level,
      reviewStatus: "accepted",
      provenance: [...AUTHORITY_PROVENANCE],
      evidenceCluster: accepted.evidenceCluster,
      claim: accepted.claim,
      uncertainty: accepted.uncertainty ?? "Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.",
      riskOfOverreach: accepted.riskOfOverreach ?? "Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.",
      externalPrimaryEvidenceStatus: "EXTERNAL_REFERENCE_PENDING",
    };
  });
}

function phaseAudit(): PhaseContextAudit {
  return {
    currentGlobalPhaseValueTruthful: "no",
    roleSectionScopedEvidenceRequired: "yes",
    acceptedPhaseEvidenceAvailable: "no",
    needsReview: "yes",
    unknown: "yes",
    productionImplementationBlockedByCurrentPhaseSchema:
      "PRODUCTION_CATALOG_IMPLEMENTATION_REQUIRES_PHASE_CONTRACT_FIRST",
  };
}

function personas(overrides: Partial<Record<(typeof PERSONAS)[number], PersonaClassification>>): readonly PersonaRow[] {
  return PERSONAS.map((persona) => ({
    persona,
    classification: overrides[persona] ?? "context_dependent",
    reason:
      overrides[persona] === "unavailable"
        ? "Equipment, space, or setup makes this concept unavailable."
        : overrides[persona] === "likely_unnecessary"
          ? "Could be redundant unless the request specifically needs this function."
          : overrides[persona] === "prescription_review_required"
            ? "Potentially useful only after side, load, support, or pain-response prescription review."
            : overrides[persona] === "not_appropriate_for_requested_purpose"
              ? "Does not match the persona's likely requested purpose."
              : "May be useful when the requested role, equipment, dose, and response make the identity appropriate.",
  }));
}

const plankDemands = [
  demand("trunk_control", "high", "Straight-body forearm support requires anti-extension trunk control."),
  demand("scapular_control", "moderate", "Forearm support requires shoulder/scapular support without wrist extension truth."),
  demand("stability", "moderate", "Stationary bodyweight support has a stable base but full-body tension demand."),
  demand("coordination", "low", "No locomotion or external implement path."),
  demand("range", "low", "Static hold with limited joint excursion."),
  demand("joint_control", "moderate", "Upper-limb support tolerance matters."),
] as const;

const carryDemands = [
  demand("trunk_control", "high", "Loaded transport requires trunk control under external load."),
  demand("scapular_control", "moderate", "Loaded hands require upper-quarter position control without becoming a scapular exercise."),
  demand("stability", "moderate", "Walking under load has dynamic stability demand."),
  demand("coordination", "moderate", "Gait, load, and posture must remain coordinated."),
  demand("range", "low", "No large-range joint target is intrinsic."),
  demand("joint_control", "moderate", "Load and gait create stress/pain relevance without being inherently heavy."),
] as const;

export const CURATED_TRUNK_CARRY_EXERCISES: readonly CuratedExerciseContract[] = [
  {
    id: "forearm-plank",
    displayName: "Forearm Plank",
    summary: "Stationary bodyweight forearm-supported anti-extension trunk-control exercise.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Ordinary straight-body forearm plank, stationary, bodyweight, full-lever unless prescription states a reviewed lever variant.",
      startPosition: "Prone forearm support with feet on floor and body organized as a straight-body support.",
      support: "Forearms and feet on floor.",
      implementResistance: "Bodyweight only.",
      movementPath: "Static timed hold; no travel or repeated flexion/extension path.",
      intendedTrunkAction: "Anti-extension trunk control.",
      pelvisRibcageRelationship: "Maintain controlled ribcage-pelvis relationship without sagging into extension.",
      laterality: "Bilateral/midline.",
      endCondition: "Time, quality loss, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["duration", "effort", "standard lever", "shortened lever", "knee-supported variant pending owner approval", "support changes"],
      newExerciseIdRequired: ["high plank/wrist-supported plank", "dynamic body saw", "long-lever plank if owner wants separate row", "loaded plank"],
    },
    family: "core_control",
    movementRoles: ["anti_extension_core"],
    movementRoleNotes: "Do not grant loaded_bracing merely because the trunk braces.",
    trainingRoles: ["activation", "hypertrophy_accessory"],
    sectionSuitability: ["activation", "accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: ["serratus", "front_delts"],
    incidentalContributors: ["glutes", "quads", "calves"],
    bodyRegions: ["shoulder", "ribcage", "lumbar_spine", "pelvis"],
    equipment: ["bodyweight", "floor_space"],
    optionalEquipment: [],
    prerequisites: ["basic forearm-supported upper-limb tolerance"],
    prerequisiteNotes: "Minimum trunk-control competency should usually be handled by prescription/support rather than a hard gate.",
    loadingProfile: "Bodyweight, limited loadability, moderate local fatigue, low systemic fatigue, no external axial loading.",
    supportMechanics: {
      externalSupport: "floor",
      bodySupport: "prone",
      notes: "Current bodySupport enum cannot say forearm-supported exactly; hands_supported would be misleading, so production should document this support taxonomy gap.",
    },
    resistancePathMechanics: {
      resistancePath: "bodyweight",
      trajectoryFreedom: "low",
      lineOfPullAdjustability: "low",
      laterality: "bilateral_linked",
      fitDependency: "low",
      notes: "Bodyweight support path; lever changes are prescription/variant facts.",
    },
    genericDemands: plankDemands,
    scapularMechanics: "Loaded scapular support is relevant but this is not a scapular-control selection row.",
    trunkMechanics: mechanics({
      antiExtensionContribution: {
        level: "high",
        evidenceCluster: "straight-body-forearm-support",
        claim: "The identity is intentionally selected for anti-extension trunk control.",
      },
      loadedBracingContribution: {
        level: "none",
        evidenceCluster: "bodyweight-static-support",
        claim: "No external load or loaded transport is present.",
      },
    }),
    sharedEvidenceClusters: ["straight-body forearm support supplies anti-extension evidence and upper-limb support stress; it is one cluster, not independent proof of several functions."],
    structuredStress: [
      stress("upper_limb_support_loading", "intrinsic", "bilateral_or_systemic", "Forearm support loads the upper-limb support chain."),
      stress("long_lever_core", "variant_dependent", "side_neutral", "Only realized when the prescription selects a reviewed long/full lever state."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["upper_limb_support_loading"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "If structured and legacy intrinsic tags both exist, current profile building deduplicates same tag/source; production tests must prove no double-count before row merge.",
    },
    progressionAxes: ["duration", "lever", "support_reduction", "effort"],
    progressionRunway: {
      earlyPrescriptionState: "Short duration or support/lever regression if accepted.",
      standardState: "Standard full-lever timed hold.",
      laterProgressionOptions: "Longer duration, harder effort target, lever change, or reduced support.",
      runsOutOfRunwayWhen: "Further challenge would require loading/dynamic variants or another anti-extension exercise.",
      notProgression: "Dead Bug to Forearm Plank is not automatic progression; high plank is a different support identity.",
    },
    transitionRelationships: [
      { targetExerciseId: "dead-bug", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Both can train anti-extension, but supine control and prone support are different contexts." },
    ],
    coachingPurposeBoundary: "Coaching cues preserve alignment and breathing; they are not metadata evidence.",
    prescriptionModes: ["timed_hold"],
    executionStandardNeeds: [
      criterion("position_control", "required_for_progression", "Ribcage-pelvis position preserves anti-extension purpose."),
      criterion("breathing_pressure_control", "preferred", "Useful quality cue, not always a progression blocker."),
      criterion("exercise_intent_preservation", "required_for_progression", "Sagging/position loss changes the intended task."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["anti_extension_core"],
      likelyCompetingExistingCandidates: ["dead-bug"],
      createsNewBootstrapRole: false,
      genuineDiversity: "Adds prone support anti-extension exposure distinct from supine Dead Bug.",
      redundancyRisk: "Can duplicate anti-extension work already covered by Dead Bug or Pallof context.",
    },
    marginalValue: {
      uniqueValue: "Simple full-body support anti-extension exposure.",
      redundancyRisk: "Do not add automatically when anti-extension exposure is already adequate.",
      existingExerciseCouldCoverNeedWhen: "Dead Bug or Pallof Press already satisfies the user's current control need.",
      futureLedgerCharacteristics: "Direct anti-extension trunk exposure, one event.",
      newSlotWhen: "A legal slot specifically needs supported anti-extension control.",
      doNotAddWhen: "The session already has sufficient anti-extension/control work or upper-limb support is the limiter.",
    },
    personaReview: personas({
      "novice general fitness": "good_candidate_possibility",
      "beginner home dumbbells": "good_candidate_possibility",
      "posture/movement-quality user": "good_candidate_possibility",
      "shoulder-sensitive user": "prescription_review_required",
      "low-back-sensitive user": "prescription_review_required",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Whether knee-supported plank remains same identity or a narrower variant mechanism is required.", "Forearm support cannot be represented exactly by bodySupport enum."],
    contractGaps: ["Support taxonomy lacks forearm-supported body support."],
  },
  {
    id: "forearm-side-plank",
    displayName: "Forearm Side Plank",
    summary: "Forearm-supported side plank for anti-lateral-flexion trunk control.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Bodyweight side-oriented forearm plank with pelvis facing sideways and support through one forearm plus feet or accepted bent-knee variant.",
      startPosition: "Side-lying setup lifted into forearm-supported side support.",
      support: "One forearm and lateral foot/feet contact, with bent-knee support as a proposed same-exercise regression.",
      implementResistance: "Bodyweight only unless a future external-load variant is explicitly retained.",
      movementPath: "Static timed side support.",
      intendedTrunkAction: "Anti-lateral-flexion trunk control.",
      pelvisRibcageRelationship: "Maintain lateral trunk line without sagging or rotating away from the side-support task.",
      laterality: "Prescription side matters; each side may be prescribed.",
      endCondition: "Time, side completion, quality loss, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["duration", "support level", "bent-knee support", "lever length", "side", "future external load only if owner accepts same identity"],
      newExerciseIdRequired: ["high side plank", "Copenhagen plank", "dynamic side plank dips", "weighted side plank if owner wants a separate identity"],
    },
    family: "core_control",
    movementRoles: ["anti_lateral_flexion_core"],
    movementRoleNotes: "Do not grant carry. Foot stacking versus staggered stance should be prescription detail if side-plank task remains unchanged.",
    trainingRoles: ["activation", "hypertrophy_accessory"],
    sectionSuitability: ["activation", "accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: ["serratus", "front_delts", "hip_abductors"],
    incidentalContributors: ["glutes", "quads"],
    bodyRegions: ["shoulder", "ribcage", "lumbar_spine", "pelvis", "hip"],
    equipment: ["bodyweight", "floor_space"],
    optionalEquipment: [],
    prerequisites: ["side-bearing forearm support tolerance"],
    prerequisiteNotes: "Side support tolerance is hard-capability relevant; lever/support difficulty should be prescription-controlled.",
    loadingProfile: "Bodyweight lateral support, limited loadability unless future external loading is retained.",
    supportMechanics: {
      externalSupport: "floor",
      bodySupport: "unknown",
      notes: "Current enum cannot cleanly represent lateral forearm/foot side support.",
    },
    resistancePathMechanics: {
      resistancePath: "bodyweight",
      trajectoryFreedom: "low",
      lineOfPullAdjustability: "low",
      laterality: "unilateral",
      fitDependency: "low",
      notes: "Side prescription and lever are realization facts.",
    },
    genericDemands: [
      demand("trunk_control", "high", "Side support directly challenges anti-lateral trunk control."),
      demand("scapular_control", "moderate", "Support shoulder/scapula must tolerate side support."),
      demand("stability", "moderate", "Narrow side base and lever alter stability."),
      demand("coordination", "low", "Static hold with limited movement path."),
      demand("range", "low", "Static support position."),
      demand("joint_control", "moderate", "Shoulder/hip support position matters."),
    ],
    scapularMechanics: "Support scapular control is meaningful context, not a scapular-preparation row.",
    trunkMechanics: mechanics({
      antiLateralFlexionContribution: {
        level: "high",
        evidenceCluster: "side-forearm-support",
        claim: "The identity is intentionally selected for anti-lateral-flexion control.",
      },
      loadedBracingContribution: {
        level: "none",
        evidenceCluster: "bodyweight-static-support",
        claim: "No external load or loaded transport is present.",
      },
    }),
    sharedEvidenceClusters: ["side forearm support supplies lateral-control role evidence, lateral trunk mechanics, and upper-limb support stress as one cluster."],
    structuredStress: [
      stress("upper_limb_support_loading", "intrinsic", "prescription_side", "Support side loads the upper-limb support chain."),
      stress("lateral_trunk_loading", "intrinsic", "prescription_side", "Side support creates lateral trunk loading."),
      stress("long_lever_core", "variant_dependent", "prescription_side", "Only realized when lever choice is reviewed as long-lever exposure."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["upper_limb_support_loading", "lateral_trunk_loading"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Same tag/source dedupe must be retained; long_lever_core should not go in legacy arrays unless realized by reviewed variant.",
    },
    progressionAxes: ["duration", "lever", "support_reduction", "load", "effort"],
    progressionRunway: {
      earlyPrescriptionState: "Bent-knee or short-duration side support.",
      standardState: "Full side support timed hold.",
      laterProgressionOptions: "Duration, lever, reduced support, or carefully reviewed external load.",
      runsOutOfRunwayWhen: "Further challenge becomes a different side-plank variation or a carry/lateral-control exercise.",
      notProgression: "Side Plank to Suitcase Carry is not same-exercise progression.",
    },
    transitionRelationships: [
      { targetExerciseId: "suitcase-carry", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Both can express lateral trunk control, but one is static side support and one is loaded gait." },
    ],
    coachingPurposeBoundary: "Cues about stacking or pelvis position preserve identity; they do not expand the row to every side-plank variation.",
    prescriptionModes: ["timed_hold"],
    executionStandardNeeds: [
      criterion("position_control", "required_for_progression", "Pelvis/ribcage side orientation preserves purpose."),
      criterion("side_or_symmetry_control", "required_for_progression", "Each-side completion matters."),
      criterion("support_control", "preferred", "Support quality can guide but may be adapted by prescription."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["anti_lateral_flexion_core"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Bootstraps direct side-support anti-lateral-flexion candidate pool.",
      redundancyRisk: "Can overlap later with suitcase carry when the session already has lateral trunk exposure.",
    },
    marginalValue: {
      uniqueValue: "Direct static anti-lateral trunk control without walking or implement grip.",
      redundancyRisk: "May duplicate lateral trunk work in a carry-focused session.",
      existingExerciseCouldCoverNeedWhen: "Suitcase carry is already selected for appropriate lateral trunk exposure and support tolerance is not the goal.",
      futureLedgerCharacteristics: "Direct anti-lateral trunk exposure; side-specific.",
      newSlotWhen: "A legal slot needs direct anti-lateral control without loaded gait.",
      doNotAddWhen: "The user needs carry capacity rather than static side support, or shoulder side support is limiting.",
    },
    personaReview: personas({
      "novice general fitness": "context_dependent",
      "beginner home dumbbells": "good_candidate_possibility",
      "posture/movement-quality user": "good_candidate_possibility",
      "shoulder-sensitive user": "prescription_review_required",
      "low-back-sensitive user": "prescription_review_required",
      "grip-limited user": "good_candidate_possibility",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Whether foot stacking/staggered stance should be prescribed or separate variants.", "Whether external loading remains same identity."],
    contractGaps: ["Support taxonomy lacks lateral forearm/foot support."],
  },
  {
    id: "machine-abdominal-crunch",
    displayName: "Machine Abdominal Crunch",
    summary: "Selectorized guided trunk-flexion exercise for direct trunk/abdominal development.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Selectorized abdominal-crunch machine where pads/seat guide intentional controlled trunk flexion.",
      startPosition: "Seated or machine-supported setup with pads adjusted to the user's body.",
      support: "Machine seat and pads.",
      implementResistance: "Selectorized machine stack or equivalent guided machine resistance.",
      movementPath: "Controlled trunk flexion through machine-guided path, then controlled return.",
      intendedTrunkAction: "Controlled trunk flexion for direct trunk development.",
      pelvisRibcageRelationship: "Ribcage moves toward pelvis through intended spinal/trunk flexion while setup limits hip-dominant substitution.",
      laterality: "Bilateral/midline.",
      endCondition: "Repetition target, quality loss, range loss, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["load", "range", "tempo", "sets", "reps", "machine setup"],
      newExerciseIdRequired: ["cable crunch", "floor crunch", "reverse crunch", "non-guided ab machine with materially different mechanics"],
    },
    family: "core_control",
    movementRoles: ["trunk_flexion"],
    movementRoleNotes: "Direct flexion role, not a generic ab-machine bucket.",
    trainingRoles: ["hypertrophy_accessory", "secondary_strength"],
    sectionSuitability: ["accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: [],
    incidentalContributors: ["hip flexors if setup allows substitution"],
    bodyRegions: ["ribcage", "lumbar_spine", "pelvis"],
    equipment: ["selectorized_machine"],
    optionalEquipment: [],
    prerequisites: ["ability to set up and exit the specific machine safely"],
    prerequisiteNotes: "Machine quality is not assumed; geometry may make a row unsuitable for some users.",
    loadingProfile: "External guided load, high loadability, local trunk fatigue, low gait/systemic demand.",
    supportMechanics: {
      externalSupport: "machine",
      bodySupport: "seated_supported",
      notes: "Machine geometry and pads materially define the identity.",
    },
    resistancePathMechanics: {
      resistancePath: "machine_guided",
      trajectoryFreedom: "low",
      lineOfPullAdjustability: "low",
      laterality: "bilateral_linked",
      fitDependency: "machine_geometry",
      notes: "Machine design may materially change path and suitability.",
    },
    genericDemands: [
      demand("trunk_control", "high", "Intentional controlled flexion is the task."),
      demand("scapular_control", "low", "Scapula are not a selection purpose."),
      demand("stability", "low", "Machine support constrains path."),
      demand("coordination", "low", "Guided single-path repetition."),
      demand("range", "moderate", "Range target is meaningful and prescription controlled."),
      demand("joint_control", "moderate", "Spinal/trunk flexion tolerance matters."),
    ],
    scapularMechanics: "Not relevant beyond setup contact.",
    trunkMechanics: mechanics({
      controlledFlexionContribution: {
        level: "high",
        evidenceCluster: "guided-trunk-flexion-machine-path",
        claim: "The identity is intentionally selected for controlled trunk flexion.",
      },
    }),
    sharedEvidenceClusters: ["machine-guided trunk flexion supplies both movement-role truth and loaded_spinal_flexion stress; not independent evidence."],
    structuredStress: [
      stress("loaded_spinal_flexion", "intrinsic", "side_neutral", "Controlled loaded trunk/spinal flexion is intrinsic to this identity."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["loaded_spinal_flexion"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Structured/legacy same tag/source dedupe must be tested; no caution/contra placement without reviewed reason.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo"],
    progressionRunway: {
      earlyPrescriptionState: "Low load, controlled partial range if tolerated.",
      standardState: "Reviewed machine setup, controlled range, repetition sets.",
      laterProgressionOptions: "Load, reps, sets, range, or tempo.",
      runsOutOfRunwayWhen: "Machine stack/setup no longer fits productive stimulus or tolerance.",
      notProgression: "Cable crunch or reverse crunch is a different exercise identity.",
    },
    transitionRelationships: [],
    coachingPurposeBoundary: "Cues ensure controlled trunk flexion rather than hip-dominant pad movement.",
    prescriptionModes: ["repetition_sets"],
    executionStandardNeeds: [
      criterion("range_control", "required_for_progression", "Range must preserve controlled flexion purpose."),
      criterion("tempo_control", "preferred", "Tempo can refine stimulus without always blocking progression."),
      criterion("exercise_intent_preservation", "required_for_progression", "Hip substitution or uncontrolled motion changes the task."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["trunk_flexion"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Bootstraps direct controlled trunk-flexion candidate pool.",
      redundancyRisk: "Can be unnecessary when direct flexion is not a current goal or tolerance is unclear.",
    },
    marginalValue: {
      uniqueValue: "Guided loadable trunk flexion for direct development.",
      redundancyRisk: "Should not be added merely because user has abs.",
      existingExerciseCouldCoverNeedWhen: "A direct trunk-flexion slot is not requested or current trunk work already meets the plan.",
      futureLedgerCharacteristics: "Direct trunk-flexion developmental exposure; machine-specific setup provenance.",
      newSlotWhen: "A program needs direct controlled flexion and machine access/tolerance is present.",
      doNotAddWhen: "Pain/tolerance, phase context, or session goal does not call for direct flexion.",
    },
    personaReview: personas({
      "intermediate commercial-gym hypertrophy": "good_candidate_possibility",
      "advanced strength/hypertrophy user": "context_dependent",
      "beginner home dumbbells": "unavailable",
      "user with little walking space": "good_candidate_possibility",
      "low-back-sensitive user": "prescription_review_required",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Specific machine geometry can change exercise truth.", "Phase context cannot be globally fixed."],
    contractGaps: ["Equipment requirement can name abdominal_crunch machine via machineIds, but capability key itself is selectorized_machine."],
  },
  {
    id: "half-kneeling-high-to-low-cable-chop",
    displayName: "Half-Kneeling High-to-Low Cable Chop",
    summary: "Half-kneeling high-anchor cable rotation pattern for controlled trunk rotation.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Half-kneeling stance, high cable anchor, high-to-low resisted chop with intentional controlled trunk rotation.",
      startPosition: "Half-kneeling facing/angled to high cable with per-side setup.",
      support: "Half-kneeling body support on floor with cable anchor resistance.",
      implementResistance: "Cable stack at high anchor.",
      movementPath: "High-to-low diagonal path driven by controlled trunk rotation with arms transmitting cable resistance.",
      intendedTrunkAction: "Controlled trunk rotation, not anti-rotation.",
      pelvisRibcageRelationship: "Pelvis/stance managed; some controlled pelvis contribution may occur but arm-only diagonal pulling is outside identity.",
      laterality: "Per-side prescription.",
      endCondition: "Repetitions, side completion, quality loss, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["load", "range", "tempo", "reps", "sets", "side", "stance details"],
      newExerciseIdRequired: ["Pallof press", "standing chop", "low-to-high cable lift", "band chop", "arm-only diagonal cable pull"],
    },
    family: "core_control",
    movementRoles: ["trunk_rotation"],
    movementRoleNotes: "Do not grant anti_rotation_core; the identity produces controlled rotation.",
    trainingRoles: ["activation", "hypertrophy_accessory", "secondary_strength"],
    sectionSuitability: ["activation", "accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: ["glutes"],
    incidentalContributors: ["shoulders", "arms", "hip adductors"],
    bodyRegions: ["thoracic_spine", "ribcage", "lumbar_spine", "pelvis", "hip", "shoulder"],
    equipment: ["cable_stack", "cable_anchor_high", "floor_space"],
    optionalEquipment: [],
    prerequisites: ["ability to understand cable setup and half-kneeling side setup"],
    prerequisiteNotes: "Cable setup skill is a setup prerequisite; load/range tolerance belongs to prescription.",
    loadingProfile: "Cable-guided external load, moderate loadability, controlled rotational range.",
    supportMechanics: {
      externalSupport: "cable_or_band_anchor",
      bodySupport: "standing",
      notes: "Current bodySupport enum cannot represent half-kneeling; production should flag taxonomy gap rather than misuse standing.",
    },
    resistancePathMechanics: {
      resistancePath: "cable_anchored",
      trajectoryFreedom: "moderate",
      lineOfPullAdjustability: "high",
      laterality: "unilateral",
      fitDependency: "setup_geometry",
      notes: "High-anchor setup and user position determine path.",
    },
    genericDemands: [
      demand("trunk_control", "high", "Controlled rotation is the selected task."),
      demand("scapular_control", "low", "Arms transmit resistance but scapula are not the target."),
      demand("stability", "moderate", "Half-kneeling stance and cable pull require position control."),
      demand("coordination", "moderate", "Trunk rotation and cable path must coordinate."),
      demand("range", "moderate", "Rotation range is meaningful and prescription controlled."),
      demand("joint_control", "moderate", "Rotation tolerance and cable setup matter."),
    ],
    scapularMechanics: "Shoulder/scapular participation is contextual, not a scapular-control row.",
    trunkMechanics: mechanics({
      controlledRotationContribution: {
        level: "high",
        evidenceCluster: "high-to-low-cable-rotation",
        claim: "The identity is intentionally selected for controlled trunk rotation.",
      },
    }),
    sharedEvidenceClusters: ["high-to-low resisted rotation supplies controlled-rotation mechanics and loaded_trunk_rotation stress as one evidence cluster."],
    structuredStress: [
      stress("loaded_trunk_rotation", "intrinsic", "prescription_side", "Controlled resisted rotation is intrinsic; load/range/side are prescription facts."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["loaded_trunk_rotation"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Do not add flexion, extension, or overhead tags from path/anchor alone.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo"],
    progressionRunway: {
      earlyPrescriptionState: "Light load and controlled partial range.",
      standardState: "Per-side repetition sets through reviewed range.",
      laterProgressionOptions: "Load, reps, sets, range, or tempo.",
      runsOutOfRunwayWhen: "Further challenge becomes another rotational exercise or different anchor/stance identity.",
      notProgression: "Pallof Press to Cable Chop is not same-exercise progression.",
    },
    transitionRelationships: [
      { targetExerciseId: "pallof-press", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Anti-rotation and controlled rotation are related but not interchangeable." },
    ],
    coachingPurposeBoundary: "Cues prevent arm-only diagonal pulling; they do not turn the row into anti-rotation.",
    prescriptionModes: ["repetition_sets"],
    executionStandardNeeds: [
      criterion("movement_control", "required_for_progression", "Rotation must be intentional and controlled."),
      criterion("side_or_symmetry_control", "required_for_progression", "Per-side prescription must be completed truthfully."),
      criterion("range_control", "preferred", "Range can be adjusted by prescription."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["trunk_rotation"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Bootstraps controlled trunk-rotation candidate pool.",
      redundancyRisk: "Can be redundant if no current rotation need exists or anti-rotation already satisfies the request.",
    },
    marginalValue: {
      uniqueValue: "Controlled resisted rotation with adjustable cable line.",
      redundancyRisk: "Should not appear merely because controlled rotation exists in vocabulary.",
      existingExerciseCouldCoverNeedWhen: "Pallof/Dead Bug/trunk work already addresses the actual current role.",
      futureLedgerCharacteristics: "Direct controlled-rotation exposure, side-specific.",
      newSlotWhen: "A legal slot needs controlled rotation and cable setup is available.",
      doNotAddWhen: "The session needs anti-rotation or no direct rotation exposure.",
    },
    personaReview: personas({
      "intermediate commercial-gym hypertrophy": "context_dependent",
      "advanced strength/hypertrophy user": "context_dependent",
      "beginner home dumbbells": "unavailable",
      "posture/movement-quality user": "good_candidate_possibility",
      "low-back-sensitive user": "prescription_review_required",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Allowed pelvis rotation amount needs owner confirmation.", "Half-kneeling support is not represented exactly."],
    contractGaps: ["bodySupport lacks half-kneeling."],
  },
  {
    id: "farmer-carry",
    displayName: "Farmer Carry",
    summary: "Bilateral one-implement-per-hand loaded walking carry.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Upright loaded walking with one external implement in each hand and symmetrical load unless prescription states otherwise.",
      startPosition: "Standing with one implement per hand before walking.",
      support: "Unsupported loaded gait.",
      implementResistance: "Usually dumbbell pair for first production row.",
      movementPath: "Walk for distance or time, including managed turns if prescribed.",
      intendedTrunkAction: "Loaded bracing and gait/load transfer for carry capacity.",
      pelvisRibcageRelationship: "Maintain upright trunk position while walking under load.",
      laterality: "Bilateral linked implements.",
      endCondition: "Trip distance/time, turn/set-down rule, quality loss, grip stop, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["load", "distance", "duration", "trips", "turns", "effort", "set-down rules"],
      newExerciseIdRequired: ["suitcase carry", "front-rack carry", "overhead carry", "static farmer hold", "yoke carry"],
    },
    family: "carry_load",
    movementRoles: ["carry", "loaded_bracing"],
    movementRoleNotes: "Carry and loaded_bracing are reviewed independently; the row is not mandatory conditioning.",
    trainingRoles: ["capacity", "hypertrophy_accessory", "secondary_strength"],
    sectionSuitability: ["main", "accessory"],
    primaryMuscles: ["trunk", "upper_back"],
    keySecondaryMuscles: ["glutes", "quads", "hamstrings"],
    incidentalContributors: ["forearms are not represented in MuscleGroup", "calves", "shoulder stabilizers"],
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "pelvis", "hip", "knee", "ankle"],
    equipment: ["dumbbell_pair", "loaded_gait_space", "stable_loaded_standing_space"],
    optionalEquipment: [],
    prerequisites: ["ability to walk while holding two implements", "ability to grip two implements"],
    prerequisiteNotes: "Not inherently heavy; grip/load limits should usually be prescription facts.",
    loadingProfile: "External bilateral implement load, loadable, systemic and local grip/trunk contribution, not inherently maximal.",
    supportMechanics: {
      externalSupport: "none",
      bodySupport: "standing",
      notes: "Unsupported loaded gait; loaded_gait_space implies standing-space truth but requirement should include stable_loaded_standing_space explicitly for review clarity.",
    },
    resistancePathMechanics: {
      resistancePath: "free_implement",
      trajectoryFreedom: "high",
      lineOfPullAdjustability: "low",
      laterality: "bilateral_independent",
      fitDependency: "low",
      notes: "Free implements in each hand; load symmetry is identity truth.",
    },
    genericDemands: carryDemands,
    scapularMechanics: "Upper-quarter support of implements is meaningful but not a scapular-control selection row.",
    trunkMechanics: mechanics({
      loadedBracingContribution: {
        level: "high",
        evidenceCluster: "bilateral-loaded-gait-event",
        claim: "Loaded walking with bilateral implements materially expresses loaded bracing.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceCluster: "bilateral-loaded-gait-event",
        claim: "Walking under external load materially expresses gait/load transfer.",
      },
    }),
    sharedEvidenceClusters: ["one bilateral loaded-gait event supplies loaded bracing, gait transfer, grip loading, and loaded_gait stress; do not ledger as independent full events."],
    structuredStress: [
      stress("loaded_gait", "intrinsic", "bilateral_or_systemic", "Walking under load is intrinsic."),
      stress("grip_loading", "intrinsic", "bilateral_or_systemic", "Holding two implements loads grip."),
      stress("grip_intensive", "dose_created", "bilateral_or_systemic", "Only if future dose thresholds classify grip intensity."),
      stress("heavy_axial_loading", "dose_created", "bilateral_or_systemic", "Only if future dose thresholds classify heavy axial exposure."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["loaded_gait", "grip_loading"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Do not place grip_intensive or heavy_axial_loading statically; future thresholds must create realized exposure from the same source event.",
    },
    progressionAxes: ["load", "distance", "trips", "duration", "effort"],
    progressionRunway: {
      earlyPrescriptionState: "Light implements and short distance/time.",
      standardState: "Reviewed loaded walking distance or timed carry.",
      laterProgressionOptions: "Load, distance, trips, duration, or effort.",
      runsOutOfRunwayWhen: "Gait space, grip, recovery, or carry goal no longer supports more carry exposure.",
      notProgression: "Making it maximal strongman loading or a mandatory finisher is not progression.",
    },
    transitionRelationships: [
      { targetExerciseId: "suitcase-carry", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Bilateral and unilateral carries serve related but distinct tasks." },
    ],
    coachingPurposeBoundary: "Posture and gait cues preserve loaded transport; they are not posture diagnosis.",
    prescriptionModes: ["distance_carry", "timed_carry"],
    executionStandardNeeds: [
      criterion("gait_load_transfer_control", "required_for_progression", "Loaded walking quality preserves carry identity."),
      criterion("position_control", "required_for_progression", "Upright trunk position preserves loaded bracing purpose."),
      criterion("side_or_symmetry_control", "observational", "Load symmetry matters but can be prescribed."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["carry", "loaded_bracing"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Bootstraps bilateral loaded gait/carry capacity.",
      redundancyRisk: "Can crowd sessions if treated as universal finisher.",
    },
    marginalValue: {
      uniqueValue: "Simple loaded gait and grip/trunk capacity exposure.",
      redundancyRisk: "Should not finish every workout by default.",
      existingExerciseCouldCoverNeedWhen: "Loaded bracing or grip/capacity exposure is already sufficient from other work.",
      futureLedgerCharacteristics: "One bilateral loaded-gait source event with grip and bracing descriptors.",
      newSlotWhen: "Carry/capacity or loaded-gait exposure is a real session need.",
      doNotAddWhen: "Walking space, grip, fatigue, or recovery makes marginal value poor.",
    },
    personaReview: personas({
      "beginner home dumbbells": "context_dependent",
      "intermediate commercial-gym hypertrophy": "context_dependent",
      "advanced strength/hypertrophy user": "good_candidate_possibility",
      "grip-limited user": "prescription_review_required",
      "user with little walking space": "unavailable",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Exact turn/set-down representation needs prescription standards.", "Forearm muscle target cannot be represented."],
    contractGaps: ["No forearm/grip MuscleGroup; loaded gait trip/set-down standards remain prescription-detail only."],
  },
  {
    id: "suitcase-carry",
    displayName: "Suitcase Carry",
    summary: "Unilateral one-implement loaded walking carry with side-specific prescription.",
    finalVerdict: "READY_FOR_OWNER_APPROVAL",
    identity: {
      exactIdentity: "Upright loaded walking with one external implement held on one side.",
      startPosition: "Standing with a single implement in one hand.",
      support: "Unsupported loaded gait.",
      implementResistance: "One dumbbell or similar implement.",
      movementPath: "Walk for distance or time while managing unilateral load.",
      intendedTrunkAction: "Carry capacity with anti-lateral-flexion and loaded-bracing expression.",
      pelvisRibcageRelationship: "Maintain upright trunk/pelvis relationship without collapsing toward or away from load.",
      laterality: "Side-specific; single-side or each-side prescription.",
      endCondition: "Trip distance/time, side completion, quality loss, grip stop, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["load side", "each-side prescription", "load", "distance", "duration", "trips", "turns", "effort"],
      newExerciseIdRequired: ["farmer carry", "suitcase hold", "front-rack carry", "overhead carry"],
    },
    family: "carry_load",
    movementRoles: ["carry", "anti_lateral_flexion_core", "loaded_bracing"],
    movementRoleNotes: "Anti-rotation expression is mechanics context, not a separate legal movement role in this row.",
    trainingRoles: ["capacity", "hypertrophy_accessory", "secondary_strength"],
    sectionSuitability: ["main", "accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: ["upper_back", "glutes", "quads", "hamstrings"],
    incidentalContributors: ["forearms are not represented in MuscleGroup", "calves", "shoulder stabilizers"],
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "ribcage", "pelvis", "hip", "knee", "ankle"],
    equipment: ["dumbbells", "loaded_gait_space", "stable_loaded_standing_space"],
    optionalEquipment: [],
    prerequisites: ["ability to walk while holding one implement", "side-specific load tolerance"],
    prerequisiteNotes: "Side selection and load are prescription facts; do not encode left/right in ID.",
    loadingProfile: "Unilateral external implement, loaded gait, high side relevance, not inherently heavy.",
    supportMechanics: {
      externalSupport: "none",
      bodySupport: "standing",
      notes: "Unsupported loaded gait with unilateral load side.",
    },
    resistancePathMechanics: {
      resistancePath: "free_implement",
      trajectoryFreedom: "high",
      lineOfPullAdjustability: "low",
      laterality: "unilateral",
      fitDependency: "low",
      notes: "One implement side is prescription-realized.",
    },
    genericDemands: carryDemands,
    scapularMechanics: "Loaded upper-quarter position is context; not a scapular row.",
    trunkMechanics: mechanics({
      antiLateralFlexionContribution: {
        level: "high",
        evidenceCluster: "unilateral-loaded-gait-event",
        claim: "Unilateral loaded walking materially expresses anti-lateral trunk control.",
      },
      antiRotationContribution: {
        level: "moderate",
        evidenceCluster: "unilateral-loaded-gait-event",
        claim: "Unilateral load may require resisting unwanted rotation while walking.",
        uncertainty: "Magnitude depends on load side, gait, and strategy.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceCluster: "unilateral-loaded-gait-event",
        claim: "External load during gait materially expresses loaded bracing.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceCluster: "unilateral-loaded-gait-event",
        claim: "Walking under unilateral load materially expresses gait/load transfer.",
      },
    }),
    sharedEvidenceClusters: ["one unilateral load + gait event contributes to anti-lateral, anti-rotation, loaded bracing, gait transfer, grip loading, loaded_gait, and lateral_trunk_loading."],
    structuredStress: [
      stress("loaded_gait", "intrinsic", "bilateral_or_systemic", "Walking under load is intrinsic."),
      stress("grip_loading", "intrinsic", "prescription_side", "Holding one implement loads the prescribed side."),
      stress("lateral_trunk_loading", "intrinsic", "prescription_side", "Unilateral load creates lateral trunk loading."),
      stress("grip_intensive", "dose_created", "prescription_side", "Only if future dose thresholds classify grip intensity."),
      stress("heavy_axial_loading", "dose_created", "bilateral_or_systemic", "Only if future dose thresholds classify heavy axial exposure."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["loaded_gait", "grip_loading", "lateral_trunk_loading"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Do not statically add grip_intensive/heavy_axial_loading; one source event must not become multiple full grip events.",
    },
    progressionAxes: ["load", "distance", "trips", "duration", "effort"],
    progressionRunway: {
      earlyPrescriptionState: "Light implement, short distance/time, reviewed side plan.",
      standardState: "Single-side or each-side distance/timed carry.",
      laterProgressionOptions: "Load, distance, trips, duration, or effort.",
      runsOutOfRunwayWhen: "Side tolerance, grip, gait space, or fatigue makes added carry exposure low value.",
      notProgression: "Side plank to suitcase carry is not same-exercise progression.",
    },
    transitionRelationships: [
      { targetExerciseId: "forearm-side-plank", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Both can express lateral trunk control but static support and loaded gait differ." },
      { targetExerciseId: "farmer-carry", direction: "lateral", classification: "context_dependent", automaticSelectionEffect: "none", reason: "Bilateral and unilateral carry variants answer different needs." },
    ],
    coachingPurposeBoundary: "Do not infer safer/harder side; side response must be observed.",
    prescriptionModes: ["distance_carry", "timed_carry"],
    executionStandardNeeds: [
      criterion("side_or_symmetry_control", "required_for_progression", "Side prescription and each-side completion preserve identity."),
      criterion("gait_load_transfer_control", "required_for_progression", "Walking under load is the task."),
      criterion("position_control", "required_for_progression", "Avoiding uncontrolled trunk collapse preserves purpose."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["carry", "anti_lateral_flexion_core", "loaded_bracing"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Bootstraps unilateral carry and anti-lateral loaded-gait exposure.",
      redundancyRisk: "Can overlap side plank or farmer carry depending on goal.",
    },
    marginalValue: {
      uniqueValue: "One source event can provide unilateral carry, lateral trunk, grip, and loaded-gait evidence.",
      redundancyRisk: "Should not be added just because it touches several future ledger descriptors.",
      existingExerciseCouldCoverNeedWhen: "Side plank covers lateral control or farmer carry covers loaded gait adequately.",
      futureLedgerCharacteristics: "One unilateral loaded-gait event with side-specific descriptors.",
      newSlotWhen: "A real side-specific carry/lateral-control capacity need exists.",
      doNotAddWhen: "The session already has enough carry/lateral/grip exposure or walking space is absent.",
    },
    personaReview: personas({
      "advanced strength/hypertrophy user": "good_candidate_possibility",
      "posture/movement-quality user": "context_dependent",
      "pain-aware return user": "prescription_review_required",
      "grip-limited user": "prescription_review_required",
      "user with little walking space": "unavailable",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Anti-rotation magnitude is likely but not independently proven from lateral/gait cluster.", "Forearm muscle target cannot be represented."],
    contractGaps: ["No forearm/grip MuscleGroup."],
  },
  {
    id: "wall-supported-suitcase-march",
    displayName: "Wall-Supported Suitcase March",
    summary: "Stationary alternating loaded march with one dumbbell and opposite-hand wall support.",
    finalVerdict: "OWNER_DECISION_REQUIRED",
    identity: {
      exactIdentity: "One dumbbell in one hand, opposite hand supported on wall, stationary alternating march, both load sides trained across sets, no walking distance.",
      startPosition: "Standing near wall with one hand on wall and opposite hand holding dumbbell.",
      support: "Opposite hand on wall; support level explicitly prescribed.",
      implementResistance: "One dumbbell.",
      movementPath: "Stationary alternating march; no travel/distance.",
      intendedTrunkAction: "Loaded bracing with support-aware lateral-control/capacity question.",
      pelvisRibcageRelationship: "Maintain controlled trunk/pelvis position while alternating march steps under supported unilateral load.",
      laterality: "Load side and support side are opposite; both load sides across sets.",
      endCondition: "Steps, time, side completion, support-quality loss, symptom response, or prescribed stop.",
      prescriptionChangesSameIdentity: ["load", "steps", "duration", "support level", "load side", "support side", "effort", "march height"],
      newExerciseIdRequired: ["walking suitcase carry", "unsupported suitcase march", "same-side wall support", "two-dumbbell march", "static suitcase hold"],
    },
    family: "carry_load",
    movementRoles: ["anti_lateral_flexion_core", "loaded_bracing"],
    movementRoleNotes: "Do not grant carry until owner confirms stationary supported march legally satisfies carry.",
    trainingRoles: ["activation", "capacity"],
    sectionSuitability: ["activation", "accessory"],
    primaryMuscles: ["trunk"],
    keySecondaryMuscles: ["glutes", "quads"],
    incidentalContributors: ["hip flexors are not represented in MuscleGroup", "forearms are not represented in MuscleGroup", "calves", "shoulder support side"],
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "ribcage", "pelvis", "hip", "knee", "ankle"],
    equipment: ["dumbbells", "wall", "stable_loaded_standing_space"],
    optionalEquipment: [],
    prerequisites: ["ability to march while supported", "ability to grip one dumbbell"],
    prerequisiteNotes: "Support solves much of the balance problem; do not hard-gate ordinary coaching needs.",
    loadingProfile: "Stationary unilateral dumbbell march, support-modified, no distance, not inherently heavy.",
    supportMechanics: {
      externalSupport: "wall",
      bodySupport: "standing",
      notes: "Wall support force and side relationship must be prescription-realized.",
    },
    resistancePathMechanics: {
      resistancePath: "free_implement",
      trajectoryFreedom: "moderate",
      lineOfPullAdjustability: "low",
      laterality: "alternating",
      fitDependency: "setup_geometry",
      notes: "Free implement plus wall support; side relationship is essential.",
    },
    genericDemands: [
      demand("trunk_control", "moderate", "Support-modified unilateral loaded march requires trunk position control."),
      demand("scapular_control", "low", "Wall hand/support and load arm require position but are not target."),
      demand("stability", "moderate", "Stationary alternating march under support has balance/stability demand."),
      demand("coordination", "moderate", "Alternating march, load side, and support side must coordinate."),
      demand("range", "low", "March height is prescribed but no large range target."),
      demand("joint_control", "moderate", "Loaded march and support side matter for pain/stress context."),
    ],
    scapularMechanics: "Wall support is support mechanics, not scapular preparation.",
    trunkMechanics: mechanics({
      loadedBracingContribution: {
        level: "moderate",
        evidenceCluster: "supported-unilateral-loaded-march",
        claim: "Holding load while marching expresses support-modified loaded bracing.",
        uncertainty: "Magnitude depends heavily on wall support force and load.",
      },
    }),
    sharedEvidenceClusters: ["supported unilateral load + alternating march is one cluster; lateral control and gait/load-transfer remain support-dependent rather than independently accepted."],
    structuredStress: [
      stress("loaded_march", "intrinsic", "bilateral_or_systemic", "Stationary loaded march is intrinsic."),
      stress("grip_loading", "intrinsic", "prescription_side", "One dumbbell creates load-side grip exposure."),
      stress("lateral_trunk_loading", "prescription_modifiable", "prescription_side", "Wall support/load/support-force relationship must realize or remove lateral trunk loading."),
    ],
    legacyStressRecommendation: {
      jointStressTags: ["loaded_march", "grip_loading"],
      cautionStressTags: [],
      contraindicatedStressTags: [],
      compatibilityPolicy: "Do not add loaded_gait or distance truth. lateral_trunk_loading should remain structured prescription-realized until reviewed support behavior is implemented.",
    },
    progressionAxes: ["load", "steps", "duration", "support_reduction", "effort"],
    progressionRunway: {
      earlyPrescriptionState: "Light load, high support, low step count or short duration.",
      standardState: "Opposite wall support, alternating stationary march, both load sides across sets.",
      laterProgressionOptions: "Load, steps, duration, reduced support, or effort.",
      runsOutOfRunwayWhen: "Reduced support or walking starts changing identity toward suitcase carry or unsupported march.",
      notProgression: "Wall march to suitcase carry is not same-exercise progression; adding walking distance changes identity.",
    },
    transitionRelationships: [
      { targetExerciseId: "suitcase-carry", direction: "progression", classification: "context_dependent", automaticSelectionEffect: "none", reason: "May prepare for walking suitcase carry, but walking and support removal change identity." },
    ],
    coachingPurposeBoundary: "Wall support is a prescription fact, not a cue to hide loaded-gait absence.",
    prescriptionModes: ["step_march"],
    executionStandardNeeds: [
      criterion("support_control", "required_for_progression", "Support force/side relationship preserves identity."),
      criterion("side_or_symmetry_control", "required_for_progression", "Both load sides across sets must be represented."),
      criterion("movement_control", "preferred", "March height/control guides dose."),
    ],
    phaseContext: phaseAudit(),
    candidatePoolEffect: {
      requestedMovementRoles: ["anti_lateral_flexion_core", "loaded_bracing"],
      likelyCompetingExistingCandidates: [],
      createsNewBootstrapRole: true,
      genuineDiversity: "Adds stationary supported loaded-march option for limited walking space.",
      redundancyRisk: "Could overlap suitcase carry if walking space and tolerance are already available.",
    },
    marginalValue: {
      uniqueValue: "Supported stationary loaded march with no gait-space requirement.",
      redundancyRisk: "Should not be added if suitcase carry or simpler marching already covers the need.",
      existingExerciseCouldCoverNeedWhen: "Forearm side plank covers lateral control or suitcase carry covers loaded gait/carry need.",
      futureLedgerCharacteristics: "One supported loaded-march event with side/support descriptors, no distance.",
      newSlotWhen: "A user needs supported loaded marching or has little walking space.",
      doNotAddWhen: "The goal is loaded walking gait or support-free carry capacity.",
    },
    personaReview: personas({
      "novice general fitness": "context_dependent",
      "beginner home dumbbells": "good_candidate_possibility",
      "posture/movement-quality user": "good_candidate_possibility",
      "pain-aware return user": "prescription_review_required",
      "user with little walking space": "good_candidate_possibility",
      "grip-limited user": "prescription_review_required",
    }),
    provenance: [...AUTHORITY_PROVENANCE],
    unresolvedUnknowns: ["Whether stationary supported march should legally satisfy carry.", "Lateral trunk and gait/load-transfer mechanics are support-force dependent."],
    contractGaps: ["Current carry role may be semantically awkward for stationary supported march; support-force magnitude has no current typed prescription field."],
  },
];

export const OWNER_DECISION_QUESTIONS = [
  {
    question: "Should knee-supported forearm plank remain a same-exercise prescription variant of `forearm-plank`?",
    recommendedOption: "Yes, but only as a reviewed lever/support variant under the ordinary forearm-plank identity.",
    consequences: "Allows one row to cover early support/lever regression without adding a duplicate plank row.",
    alternatives: "Create a separate knee-forearm-plank row, or exclude knee support until variant semantics are narrower.",
  },
  {
    question: "Should bent-knee forearm side plank remain a same-exercise variant of `forearm-side-plank`?",
    recommendedOption: "Yes, with side, support, and lever explicitly prescribed.",
    consequences: "Keeps the first tranche compact while preserving lateral side-support identity.",
    alternatives: "Create a separate bent-knee side-plank row or defer bent-knee support.",
  },
  {
    question: "Should `wall-supported-suitcase-march` legally satisfy the `carry` movement role?",
    recommendedOption: "No for the first production row; use `anti_lateral_flexion_core` and `loaded_bracing` until owner approves stationary supported carry semantics.",
    consequences: "Avoids granting loaded walking/carry truth to a no-distance supported march.",
    alternatives: "Grant `carry` as stationary capacity carry, or create a new movement role for supported loaded march later.",
  },
  {
    question: "Should production catalog implementation wait for the contextual phase contract?",
    recommendedOption: "Yes; do not invent global phase suitability values for these rows.",
    consequences: "Keeps unknown/contextual phase evidence honest and prevents false phase scoring certainty.",
    alternatives: "Add conservative global phase values now, accepting known false certainty and future churn.",
  },
] as const;

export interface SevenExerciseCurationData {
  readonly classification: typeof SEVEN_EXERCISE_TRUNK_CARRY_CURATION_CLASSIFICATION;
  readonly productionReadiness: typeof PRODUCTION_CATALOG_IMPLEMENTATION_READINESS;
  readonly productionBlockers: readonly string[];
  readonly exercises: readonly CuratedExerciseContract[];
  readonly ownerQuestions: typeof OWNER_DECISION_QUESTIONS;
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
  readonly wholeBodyRoadmapHandoff: string;
}

export function buildSevenExerciseTrunkCarryCurationData(): SevenExerciseCurationData {
  const fingerprints = buildCurrentTrunkCurationFingerprints();
  const equipmentLegalityFingerprint = buildCurrentEquipmentLegalityFingerprint();
  const expandedEquipmentFixtureFingerprint = buildExpandedEquipmentFixtureFingerprint();

  return {
    classification: SEVEN_EXERCISE_TRUNK_CARRY_CURATION_CLASSIFICATION,
    productionReadiness: PRODUCTION_CATALOG_IMPLEMENTATION_READINESS,
    productionBlockers: PRODUCTION_CATALOG_IMPLEMENTATION_BLOCKERS,
    exercises: CURATED_TRUNK_CARRY_EXERCISES,
    ownerQuestions: OWNER_DECISION_QUESTIONS,
    behaviorFingerprints: {
      productionRankingFingerprint: fingerprints.productionRanking,
      productionRankingMatches:
        fingerprints.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      comprehensiveBehaviorFingerprint: fingerprints.comprehensiveBehavior,
      comprehensiveBehaviorMatches:
        fingerprints.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      referenceCatalogFingerprint: fingerprints.referenceCatalog,
      referenceCatalogMatches:
        fingerprints.referenceCatalog === FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
      equipmentLegalityFingerprint,
      equipmentLegalityMatches:
        equipmentLegalityFingerprint === CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
      expandedEquipmentFixtureFingerprint,
      expandedEquipmentFixtureMatches:
        expandedEquipmentFixtureFingerprint === CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
    },
    wholeBodyRoadmapHandoff:
      "After seven-exercise owner approval and truthful production catalog implementation, the next major candidate-knowledge milestone is WHOLE_BODY_EXERCISE_KNOWLEDGE_AND_CANDIDATE_POOL_AUDIT.",
  };
}

function list(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "none";
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function identitySection(exercise: CuratedExerciseContract): readonly string[] {
  return [
    `### ${exercise.displayName} (${exercise.id})`,
    "",
    `Verdict: \`${exercise.finalVerdict}\``,
    "",
    table(["Field", "Review"], [
      ["EXACT IDENTITY", exercise.identity.exactIdentity],
      ["START POSITION", exercise.identity.startPosition],
      ["SUPPORT", exercise.identity.support],
      ["IMPLEMENT / RESISTANCE", exercise.identity.implementResistance],
      ["MOVEMENT PATH", exercise.identity.movementPath],
      ["INTENDED TRUNK ACTION", exercise.identity.intendedTrunkAction],
      ["PELVIS / RIBCAGE RELATIONSHIP", exercise.identity.pelvisRibcageRelationship],
      ["LATERALITY", exercise.identity.laterality],
      ["END CONDITION", exercise.identity.endCondition],
      ["SAME IDENTITY PRESCRIPTION CHANGES", list(exercise.identity.prescriptionChangesSameIdentity)],
      ["NEW EXERCISE ID REQUIRED", list(exercise.identity.newExerciseIdRequired)],
    ]),
    "",
  ];
}

function contractSection(exercise: CuratedExerciseContract): readonly string[] {
  return [
    `#### Proposed Production Contract: ${exercise.id}`,
    "",
    table(["Field", "Proposal"], [
      ["Family", exercise.family],
      ["Movement roles", list(exercise.movementRoles)],
      ["Movement-role notes", exercise.movementRoleNotes],
      ["Training roles", list(exercise.trainingRoles)],
      ["Sections", list(exercise.sectionSuitability)],
      ["Primary muscles", list(exercise.primaryMuscles)],
      ["Key secondary muscles", list(exercise.keySecondaryMuscles)],
      ["Incidental contributors", list(exercise.incidentalContributors)],
      ["Body regions", list(exercise.bodyRegions)],
      ["Equipment", list(exercise.equipment)],
      ["Optional equipment", list(exercise.optionalEquipment)],
      ["Prerequisites", list(exercise.prerequisites)],
      ["Prerequisite notes", exercise.prerequisiteNotes],
      ["Loading profile", exercise.loadingProfile],
      ["Support mechanics", `${exercise.supportMechanics.externalSupport} / ${exercise.supportMechanics.bodySupport}: ${exercise.supportMechanics.notes}`],
      ["Resistance/path", `${exercise.resistancePathMechanics.resistancePath}; trajectory=${exercise.resistancePathMechanics.trajectoryFreedom}; line=${exercise.resistancePathMechanics.lineOfPullAdjustability}; laterality=${exercise.resistancePathMechanics.laterality}; fit=${exercise.resistancePathMechanics.fitDependency}. ${exercise.resistancePathMechanics.notes}`],
      ["Scapular mechanics", exercise.scapularMechanics],
      ["Prescription modes", list(exercise.prescriptionModes)],
      ["Progression axes", list(exercise.progressionAxes)],
      ["Phase blocker", exercise.phaseContext.productionImplementationBlockedByCurrentPhaseSchema],
      ["Unresolved unknowns", list(exercise.unresolvedUnknowns)],
      ["Contract gaps", list(exercise.contractGaps)],
    ]),
    "",
    "Generic demands:",
    "",
    table(["Dimension", "Level", "Evidence"], exercise.genericDemands.map((row) => [
      row.dimension,
      row.level,
      row.evidenceBasis,
    ])),
    "",
    "Trunk mechanics:",
    "",
    table(["Function", "Level", "Status", "Evidence cluster", "Claim / uncertainty"], exercise.trunkMechanics.map((row) => [
      row.functionName,
      row.level,
      row.reviewStatus,
      row.evidenceCluster,
      `${row.claim} Uncertainty: ${row.uncertainty}`,
    ])),
    "",
    "Structured stress:",
    "",
    table(["Tag", "Source", "Scope", "Side", "Status", "Notes"], exercise.structuredStress.map((row) => [
      row.tag,
      row.source,
      row.exposureScope,
      row.sideScope,
      row.reviewStatus,
      row.notes,
    ])),
    "",
    `Legacy stress recommendation: jointStressTags=${list(exercise.legacyStressRecommendation.jointStressTags)}, cautionStressTags=${list(exercise.legacyStressRecommendation.cautionStressTags)}, contraindicatedStressTags=${list(exercise.legacyStressRecommendation.contraindicatedStressTags)}. ${exercise.legacyStressRecommendation.compatibilityPolicy}`,
    "",
    `Progression runway: early=${exercise.progressionRunway.earlyPrescriptionState}; standard=${exercise.progressionRunway.standardState}; later=${exercise.progressionRunway.laterProgressionOptions}; runs out=${exercise.progressionRunway.runsOutOfRunwayWhen}; not progression=${exercise.progressionRunway.notProgression}.`,
    "",
    "Transition proposals:",
    "",
    table(["Target", "Direction", "Class", "Effect", "Reason"], exercise.transitionRelationships.map((row) => [
      row.targetExerciseId,
      row.direction,
      row.classification,
      row.automaticSelectionEffect,
      row.reason,
    ])),
    "",
    "Execution-standard needs:",
    "",
    table(["Dimension", "Importance", "Reason"], exercise.executionStandardNeeds.map((row) => [
      row.dimension,
      row.importance,
      row.reason,
    ])),
    "",
    "Phase-context audit:",
    "",
    table(["Question", "Answer"], [
      ["CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL?", exercise.phaseContext.currentGlobalPhaseValueTruthful],
      ["ROLE/SECTION-SCOPED EVIDENCE REQUIRED?", exercise.phaseContext.roleSectionScopedEvidenceRequired],
      ["ACCEPTED PHASE EVIDENCE AVAILABLE?", exercise.phaseContext.acceptedPhaseEvidenceAvailable],
      ["NEEDS_REVIEW?", exercise.phaseContext.needsReview],
      ["UNKNOWN?", exercise.phaseContext.unknown],
      ["PRODUCTION IMPLEMENTATION BLOCKED?", exercise.phaseContext.productionImplementationBlockedByCurrentPhaseSchema],
    ]),
    "",
    "Candidate-pool effect:",
    "",
    table(["Requested roles", "Competes with", "Bootstrap?", "Diversity", "Redundancy risk"], [[
      list(exercise.candidatePoolEffect.requestedMovementRoles),
      list(exercise.candidatePoolEffect.likelyCompetingExistingCandidates),
      String(exercise.candidatePoolEffect.createsNewBootstrapRole),
      exercise.candidatePoolEffect.genuineDiversity,
      exercise.candidatePoolEffect.redundancyRisk,
    ]]),
    "",
    "Marginal-value / workout-length review:",
    "",
    table(["Unique value", "Redundancy risk", "Existing coverage", "Ledger", "New slot when", "Do not add when"], [[
      exercise.marginalValue.uniqueValue,
      exercise.marginalValue.redundancyRisk,
      exercise.marginalValue.existingExerciseCouldCoverNeedWhen,
      exercise.marginalValue.futureLedgerCharacteristics,
      exercise.marginalValue.newSlotWhen,
      exercise.marginalValue.doNotAddWhen,
    ]]),
    "",
    "Persona review:",
    "",
    table(["Persona", "Classification", "Reason"], exercise.personaReview.map((row) => [
      row.persona,
      row.classification,
      row.reason,
    ])),
    "",
  ];
}

export function renderSevenExerciseTrunkCarryCurationReport(
  data = buildSevenExerciseTrunkCarryCurationData(),
): string {
  return [
    "# Seven Exercise Trunk / Carry Curation",
    "",
    `Overall classification: \`${data.classification}\``,
    "",
    `Production implementation readiness: \`${data.productionReadiness}\``,
    "",
    "Production blockers:",
    "",
    ...data.productionBlockers.map((blocker) => `- ${blocker}`),
    "",
    "## Boundary",
    "",
    "This is a review-only owner curation artifact. It does not add production exercises, reference-catalog rows, stress arrays, scoring behavior, phase behavior, prescription doses, Session Composer, Weekly Composer, or ledger behavior.",
    "",
    "Doctrine: task-appropriate alignment -> repeatable form -> appropriate dose -> observed response -> earned progression -> adaptation. More knowledge must improve selection, not inflate workout length.",
    "",
    "## Complete Curation Matrix",
    "",
    table([
      "ID",
      "Identity",
      "Family",
      "Movement roles",
      "Training roles",
      "Primary muscles",
      "Key secondary",
      "Equipment",
      "Prerequisites",
      "Principal mechanics",
      "Accepted trunk mechanics",
      "Unresolved trunk mechanics",
      "Intrinsic stress",
      "Potential/modifiable stress",
      "Progression axes",
      "Prescription modes",
      "Phase status",
      "Production blocker",
      "Verdict",
    ], data.exercises.map((exercise) => [
      exercise.id,
      exercise.identity.exactIdentity,
      exercise.family,
      list(exercise.movementRoles),
      list(exercise.trainingRoles),
      list(exercise.primaryMuscles),
      list(exercise.keySecondaryMuscles),
      list(exercise.equipment),
      list(exercise.prerequisites),
      exercise.resistancePathMechanics.resistancePath,
      list(exercise.trunkMechanics.filter((row) => row.reviewStatus === "accepted" && row.level !== "unknown").map((row) => `${row.functionName}:${row.level}`)),
      list(exercise.trunkMechanics.filter((row) => row.level === "unknown").map((row) => row.functionName)),
      list(exercise.structuredStress.filter((row) => row.exposureScope === "intrinsic").map((row) => row.tag)),
      list(exercise.structuredStress.filter((row) => row.exposureScope !== "intrinsic").map((row) => `${row.tag}:${row.exposureScope}`)),
      list(exercise.progressionAxes),
      list(exercise.prescriptionModes),
      exercise.phaseContext.productionImplementationBlockedByCurrentPhaseSchema,
      list(exercise.contractGaps),
      exercise.finalVerdict,
    ])),
    "",
    "## Exact Identity Definitions",
    "",
    ...data.exercises.flatMap(identitySection),
    "## Complete Metadata Proposals",
    "",
    ...data.exercises.flatMap(contractSection),
    "## Shared Evidence And Science Review",
    "",
    "Every accepted non-unknown trunk-mechanics field includes curation provenance. External primary evidence remains `EXTERNAL_REFERENCE_PENDING`; no empirical activation percentages or threshold claims are made. Mechanically definitional claims are accepted as identity review, while physiological magnitude remains uncalibrated.",
    "",
    ...data.exercises.flatMap((exercise) => [
      `### ${exercise.displayName}`,
      "",
      ...exercise.sharedEvidenceClusters.map((cluster) => `- Shared evidence cluster: ${cluster}`),
      ...exercise.trunkMechanics
        .filter((row) => row.reviewStatus === "accepted" && row.level !== "unknown")
        .map((row) => `- Claim: ${row.claim} Structured support: ${row.evidenceCluster}. Owner/human basis: ${list(row.provenance)}. External primary evidence status: ${row.externalPrimaryEvidenceStatus}. Uncertainty: ${row.uncertainty}. Risk of overreach: ${row.riskOfOverreach}`),
      "",
    ]),
    "## Owner Decision Questions",
    "",
    ...data.ownerQuestions.flatMap((question, index) => [
      `${index + 1}. ${question.question}`,
      `   Recommended option: ${question.recommendedOption}`,
      `   Consequences: ${question.consequences}`,
      `   Alternatives: ${question.alternatives}`,
      "",
    ]),
    "## Current-Behavior Invariance",
    "",
    table(["Artifact", "Current", "Matches"], [
      ["Production ranking fingerprint", data.behaviorFingerprints.productionRankingFingerprint, String(data.behaviorFingerprints.productionRankingMatches)],
      ["Comprehensive behavior fingerprint", data.behaviorFingerprints.comprehensiveBehaviorFingerprint, String(data.behaviorFingerprints.comprehensiveBehaviorMatches)],
      ["Reference catalog fingerprint", data.behaviorFingerprints.referenceCatalogFingerprint, String(data.behaviorFingerprints.referenceCatalogMatches)],
      ["Equipment legality fingerprint", data.behaviorFingerprints.equipmentLegalityFingerprint, String(data.behaviorFingerprints.equipmentLegalityMatches)],
      ["Expanded equipment fixture fingerprint", data.behaviorFingerprints.expandedEquipmentFixtureFingerprint, String(data.behaviorFingerprints.expandedEquipmentFixtureMatches)],
    ]),
    "",
    "## Whole-Body Roadmap Handoff",
    "",
    data.wholeBodyRoadmapHandoff,
    "",
    "The later audit must cover chest, lats, mid/upper back, shoulders, arms, legs, glutes, calves, hip adductors/abductors, trunk, serratus/cuff/scapular work, and carries/capacity. The goal is meaningfully distinct, well-understood candidates, not a huge exercise count.",
    "",
  ].join("\n");
}
