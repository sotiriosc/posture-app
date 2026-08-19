import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import {
  CURATION_REFERENCE,
  HOME_COMFORT_PROFILE_REFERENCE,
  HOME_COMFORT_SELECTION_POLICY_REFERENCE,
  type CandidateConcept,
  type ComfortProfile,
  type CoverageCell,
  type GuardModel,
  type RealizationDecision,
} from "./contracts";

export const expectedCanonicalIds = Object.freeze([
  "ninety-ninety-breathing",
  "serratus-wall-slide",
  "dead-bug",
  "push-up",
  "dumbbell-bench-press",
  "machine-chest-press",
  "cable-chest-fly",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
  "machine-row",
  "seated-cable-row",
  "band-row",
  "dumbbell-shoulder-press",
  "lat-pulldown",
  "band-lat-pulldown",
  "goblet-squat",
  "leg-press",
  "bodyweight-box-squat",
  "dumbbell-romanian-deadlift",
  "cable-pull-through",
  "split-squat",
  "step-up",
  "lying-leg-curl",
  "glute-bridge",
  "dumbbell-lateral-raise",
  "reverse-pec-deck",
  "band-face-pull",
  "dumbbell-curl",
  "cable-triceps-pressdown",
  "pallof-press",
  "forearm-plank",
  "forearm-side-plank",
  "machine-abdominal-crunch",
  "half-kneeling-high-to-low-cable-chop",
  "farmer-carry",
  "suitcase-carry",
  "wall-supported-suitcase-march",
  "standing-calf-raise",
  "side-lying-hip-adduction",
  "loop-band-lateral-walk",
  "side-lying-dumbbell-external-rotation",
  "supine-hamstring-walkout",
  "wall-ankle-dorsiflexion-rock",
  "bodyweight-hip-hinge-rehearsal",
  "single-leg-balance-rehearsal",
] as const);

export const currentCatalogInventory = Object.freeze({
  contract: CURATION_REFERENCE,
  source: "packages/training-engine-v2/src/data/referenceExercises.ts",
  frozenAtCommit: "cc2438248debef43ee829283ff08ab661300b63e",
  rowCount: REFERENCE_EXERCISES.length,
  uniqueIdCount: new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  rows: REFERENCE_EXERCISES.map((row) => ({
    id: row.id,
    name: row.name,
    family: row.family,
    movementRoles: row.movementRoles,
    actionFunctions: row.actionFunctions.map((entry) => entry.action),
    muscleContributions: row.muscleContributions.map((entry) => ({
      muscle: entry.muscle,
      relationship: entry.relationship,
    })),
    equipmentRequirements: row.equipmentRequirements.map((entry) => ({
      id: entry.id,
      allOf: entry.allOf ?? [],
      oneOf: entry.oneOf ?? [],
      machineIds: entry.machineIds ?? [],
    })),
    optionalEquipment: row.optionalEquipment.map((entry) => entry.id),
    trainingRoles: row.trainingRoles,
    sections: Object.keys(row.sectionSuitability).sort(),
    prescriptionDoseModes: row.prescriptionKnowledge.doseModeAnnotations.map((entry) => entry.mode),
    progressionAxes: row.progression.progressionAxes,
  })),
  changes: { additions: 0, modifications: 0, deletions: 0 },
});

export const legacyProductCatalogComparison = Object.freeze({
  source: "packages/engine/src/exercises.ts",
  sourceSha256: "c3a557c1bb0b50e1f531c6bd762ba608a7665ac2adb3daa42f50a0d04f7721b6",
  currentRowCount: 225,
  currentUniqueIdCount: 225,
  screenshotReference: "packages/training-engine-v2/docs/training-engine-v2/Screenshot (1027).png",
  screenshotBinariesCommitted: 0,
  authority: "legacy_product_context_only_not_v2_identity_or_equipment_authority",
  exactMappingPolicy: "exact reviewed mapping only; no fuzzy aliases or second V2 catalog",
  rows: [
    {
      legacyId: "band-pull-aparts",
      displayName: "Band Pull-Aparts",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "band-pull-apart candidate",
      finding: "Legacy horizontal_pull classification cannot promote pull-apart to a full horizontal-pull receiver; rear-delt/preparation review remains.",
      disposition: "receiver_policy_required",
    },
    {
      legacyId: "split-stance-row",
      displayName: "Split Stance Row",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "possible band-row realization",
      finding: "Split stance is a realization fact, but the exact band anchor/path is not proven by the legacy equipment label.",
      disposition: "equipment_contract_required",
    },
    {
      legacyId: "split-stance-band-chest-press",
      displayName: "Split Stance Band Chest Press",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "band chest-press concept outside first package",
      finding: "The legacy row does not prove anchor, routing, or body-contact truth; stance alone does not create identity.",
      disposition: "support_or_safety_review_required",
    },
    {
      legacyId: "band-overhead-press",
      displayName: "Band Overhead Press",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "vertical-press resistance-path candidate",
      finding: "Potentially familiar, but self-anchor/routing, load ceiling, and overhead stress require exact review before V2 admission.",
      disposition: "support_or_safety_review_required",
    },
    {
      legacyId: "band-biceps-curl",
      displayName: "Band Biceps Curl",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "band-biceps-curl candidate",
      finding: "Supports recognizability and receiver value, not automatic production readiness; foot retention and band path remain explicit.",
      disposition: "ready_after_targeted_metadata_curation",
    },
    {
      legacyId: "bodyweight-triceps-extension",
      displayName: "Bodyweight Triceps Extension",
      screenshotObserved: true,
      legacyEquipment: ["none"],
      v2Relationship: "additional direct-home-triceps candidate",
      finding: "Legacy none does not prove the hand-support surface, height, wrist tolerance, or exit path. Compare against dumbbell triceps extension in Pre-G2.",
      disposition: "support_or_safety_review_required",
    },
    {
      legacyId: "prone-t-raise",
      displayName: "Prone T Raise",
      screenshotObserved: true,
      legacyEquipment: ["none"],
      v2Relationship: "bodyweight rear-delt/scapular candidate",
      finding: "Floor space and prone/shoulder tolerance are hidden by none; receiver must avoid generic corrective filler.",
      disposition: "receiver_policy_required",
    },
    {
      legacyId: "band-rear-delt-fly",
      displayName: "Band Rear Delt Fly",
      screenshotObserved: true,
      legacyEquipment: ["bands"],
      v2Relationship: "band rear-delt candidate",
      finding: "Exact anchor or self-held path is missing; it may improve rear-delt coverage but cannot be counted as horizontal pulling by label.",
      disposition: "equipment_contract_required",
    },
    {
      legacyId: "marching-brace-hold",
      displayName: "Marching Brace Hold",
      screenshotObserved: true,
      legacyEquipment: ["none"],
      v2Relationship: "standing trunk-control candidate",
      finding: "Standing space, balance, cadence, and anti-rotation receiver require review; it is not a generic core filler.",
      disposition: "receiver_policy_required",
    },
  ],
});

export const homeComfortProfileSchema = Object.freeze({
  reference: HOME_COMFORT_PROFILE_REFERENCE,
  separateFrom: [
    "exercise_difficulty",
    "phase",
    "experience_level",
    "skill_demand",
    "Safety",
    "exercise_score",
    "Product_preference",
  ],
  dimensions: [
    "recognizability",
    "setupComplexity",
    "instructionBurden",
    "balanceDemand",
    "coordinationDemand",
    "supportClarity",
    "equipmentAmbiguity",
    "anchorComplexity",
    "floorTransitionDemand",
    "spaceRequirement",
    "failureConsequenceClarity",
    "unilateralComplexity",
    "externalLoadHandlingComplexity",
    "firstSessionConfidenceSuitability",
    "homeEnvironmentFit",
    "unknowns",
    "reviewState",
    "provenance",
  ],
  closedLevels: ["low", "moderate", "high", "unknown"],
  closedFits: ["poor", "possible", "good", "excellent", "unknown"],
  weightedScore: null,
  rankingAuthority: "none",
});

const comfortProfile = (input: Partial<ComfortProfile>): ComfortProfile => ({
  recognizability: "unknown",
  setupComplexity: "unknown",
  instructionBurden: "unknown",
  balanceDemand: "unknown",
  coordinationDemand: "unknown",
  supportClarity: "unknown",
  equipmentAmbiguity: "unknown",
  anchorComplexity: "unknown",
  floorTransitionDemand: "unknown",
  spaceRequirement: "unknown",
  failureConsequenceClarity: "unknown",
  unilateralComplexity: "unknown",
  externalLoadHandlingComplexity: "unknown",
  firstSessionConfidenceSuitability: "unknown",
  homeEnvironmentFit: "unknown",
  unknowns: [],
  reviewState: "owner_review_required",
  provenance: ["owner_home_comfort_principle"],
  ...input,
});

export const illustrativeComfortProfiles = Object.freeze({
  recognizableStableFloor: comfortProfile({
    recognizability: "high",
    setupComplexity: "low",
    instructionBurden: "low",
    balanceDemand: "low",
    coordinationDemand: "low",
    supportClarity: "high",
    equipmentAmbiguity: "low",
    anchorComplexity: "low",
    floorTransitionDemand: "moderate",
    spaceRequirement: "low",
    failureConsequenceClarity: "high",
    unilateralComplexity: "low",
    externalLoadHandlingComplexity: "low",
    firstSessionConfidenceSuitability: "excellent",
    homeEnvironmentFit: "excellent",
  }),
  explicitAdvancedHome: comfortProfile({
    recognizability: "high",
    setupComplexity: "moderate",
    instructionBurden: "moderate",
    balanceDemand: "moderate",
    coordinationDemand: "moderate",
    supportClarity: "high",
    equipmentAmbiguity: "low",
    anchorComplexity: "moderate",
    floorTransitionDemand: "low",
    spaceRequirement: "moderate",
    failureConsequenceClarity: "high",
    unilateralComplexity: "moderate",
    externalLoadHandlingComplexity: "moderate",
    firstSessionConfidenceSuitability: "good",
    homeEnvironmentFit: "excellent",
    reviewState: "accepted_for_curation",
    provenance: ["authenticated_exact_familiarity", "exact_equipment_capability"],
  }),
});

export const homeComfortSemantics = Object.freeze({
  comfortable:
    "The user can understand, set up, begin, stop, and repeat the legal exercise with reasonable confidence given known facts.",
  comfortableDoesNotMean: [
    "effortless",
    "low stimulus",
    "low progression potential",
    "no coaching",
    "no fatigue",
    "no learning",
  ],
  familiarSources: [
    "exact_identity_familiarity",
    "related_realization_familiarity",
    "authenticated_athlete_report",
    "weak_recognizable_simple_default_when_exact_familiarity_unknown",
  ],
  simpleSignals: [
    "few_setup_steps",
    "clear_support",
    "common_equipment",
    "low_balance_demand",
    "low_coordination_demand",
    "easy_exit_or_stop",
    "obvious_start_and_finish",
  ],
  nonOverrides: ["Safety", "equipment_legality", "purpose", "pain_or_restriction"],
});

export const homeComfortSelectionPolicy = Object.freeze({
  reference: HOME_COMFORT_SELECTION_POLICY_REFERENCE,
  precedence: [
    "Safety_and_explicit_contraindication",
    "exact_equipment_legality",
    "required_purpose_and_coverage",
    "pain_restriction_and_response",
    "exact_familiarity_and_productive_continuity",
    "recognizable_simple_setup_when_familiarity_unknown",
    "progression_runway",
    "setup_efficiency",
    "novelty_only_when_requested_or_justified",
    "deterministic_tie",
  ],
  additiveScore: null,
  activation: "not_active",
  homePreferenceRequires: [
    "experience_or_familiarity_unknown_or_limited",
    "several_otherwise_truthful_candidates",
    "no_productive_anchor",
    "no_higher_priority_purpose_lost",
  ],
  advancedOverride:
    "Authenticated experience, exact familiarity, equipment, preference, performance, and response may justify demanding home realizations.",
});

export const comfortFirstProgression = Object.freeze({
  sequence: [
    "preserve_productive_familiar_identity",
    "progress_one_legal_axis",
    "confirm_repeated_success",
    "retain_identity_while_purpose_and_runway_remain",
  ],
  legalAxes: ["load", "repetitions", "sets", "range", "support", "leverage", "tempo", "stability"],
  transitionReasons: [
    "load_ceiling",
    "purpose_no_longer_realizable",
    "plateau_or_failure_evidence",
    "equipment_change",
    "explicit_preference",
    "response_or_tolerance",
    "phase_or_programming_reason",
  ],
  prohibitedAutomaticMoves: [
    "novelty_as_progression",
    "added_instability",
    "bilateral_to_unilateral",
    "support_removal",
    "complicated_band_setup",
  ],
});

export const realizationAudit: readonly RealizationDecision[] = Object.freeze([
  {
    identity: "push-up",
    variants: ["wall", "elevated_or_incline", "knee_supported", "standard_floor", "future_external_load"],
    decision: "same_identity",
    reason: "Support, lever, and load can vary while the bodyweight horizontal-press identity remains recognizable.",
    requiredMetadata: ["support_source", "lever", "range", "load", "floor_or_wall_truth"],
  },
  {
    identity: "one-arm-dumbbell-row",
    variants: ["bench_supported", "chair_or_table_supported", "unsupported", "split_stance", "side_specific"],
    decision: "same_identity",
    reason: "Support and side are realization facts; the unilateral free-implement horizontal-row path remains stable.",
    requiredMetadata: ["support_surface", "support_amount", "stance", "side", "range"],
  },
  {
    identity: "goblet-squat",
    variants: ["supported", "box_target", "free_standing", "dumbbell_loaded"],
    decision: "same_identity",
    reason: "Support and a box target do not alone create a new loaded goblet-squat identity.",
    requiredMetadata: ["load", "support", "box_target", "range"],
  },
  {
    identity: "bodyweight-box-squat_vs_bodyweight-squat",
    variants: ["box_contact", "free_bodyweight"],
    decision: "unresolved",
    reason: "The box may be a bounded target realization or a meaningful support/path boundary; owner identity review is required.",
    requiredMetadata: ["box_contact_intent", "support_amount", "range", "receiver"],
  },
  {
    identity: "split-squat",
    variants: ["bodyweight", "supported", "loaded", "reduced_range"],
    decision: "same_identity",
    reason: "Load, support, and range preserve the stationary split-stance identity.",
    requiredMetadata: ["load", "support", "range", "side"],
  },
  {
    identity: "split-squat_vs_reverse-lunge",
    variants: ["stationary_split_stance", "dynamic_backward_step"],
    decision: "unresolved",
    reason: "The dynamic step and return may materially change movement path, balance, and coaching burden.",
    requiredMetadata: ["movement_path", "balance_demand", "receiver", "transition_boundary"],
  },
  {
    identity: "glute-bridge",
    variants: ["bodyweight", "loop_band", "dumbbell_loaded", "bilateral"],
    decision: "same_identity",
    reason: "Legal external resistance does not replace the bilateral floor-supported hip-extension identity.",
    requiredMetadata: ["load_source", "load_placement", "band_path", "range"],
  },
  {
    identity: "glute-bridge_unilateral_boundary",
    variants: ["bilateral", "single_leg"],
    decision: "unresolved",
    reason: "A future unilateral realization changes support, balance, and side ownership enough to require review.",
    requiredMetadata: ["side", "support", "pelvic_control", "receiver"],
  },
  {
    identity: "standing-calf-raise",
    variants: ["bilateral", "supported", "unilateral", "bodyweight", "dumbbell_loaded"],
    decision: "same_identity",
    reason: "Support, laterality, and load remain explicit realization dimensions of standing plantar flexion.",
    requiredMetadata: ["support", "side", "load", "range"],
  },
  {
    identity: "forearm-plank",
    variants: ["knee_supported", "standard", "lever_change"],
    decision: "same_identity",
    reason: "Support and lever scale the same anti-extension hold.",
    requiredMetadata: ["support", "lever", "duration"],
  },
  {
    identity: "forearm-side-plank",
    variants: ["knee_supported", "standard", "lever_change"],
    decision: "same_identity",
    reason: "Support and lever scale the same side-plank bracing identity.",
    requiredMetadata: ["support", "lever", "side", "duration"],
  },
  {
    identity: "single-leg-balance-rehearsal",
    variants: ["substantial_support", "light_touch", "unsupported"],
    decision: "same_identity",
    reason: "Support amount is an explicit progression axis for the same low-load balance rehearsal.",
    requiredMetadata: ["support_source", "support_amount", "side", "duration"],
  },
]);

const candidate = (input: CandidateConcept): CandidateConcept => Object.freeze(input);

export const homeCandidates: readonly CandidateConcept[] = Object.freeze([
  candidate({ id: "dumbbell-floor-press", group: "home", identityBoundary: "Floor-supported dumbbell horizontal press with bounded floor range; not a bench-angle variant.", equipmentTruth: "dumbbells + floor_space; no bench", support: "supine floor support", risk: "dumbbell handling and floor entry/exit require review", familiarity: "high recognizability", setupComplexity: "low", homeComfort: "excellent", movementRole: "horizontal_push", actionFunctions: ["shoulder_horizontal_adduction", "elbow_extension"], purpose: ["strength", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["load", "reps", "sets", "tempo", "range"], loadCeiling: "bounded by available dumbbells and floor range", receiver: "no-bench horizontal-push main/accessory pool", redundancy: "unique no-bench external-load path", coachingBurden: "low", evidence: "mechanics, stress, and handling metadata require owner review", disposition: "ready_for_owner_selection", firstTrancheEligible: true }),
  candidate({ id: "dumbbell-triceps-extension", group: "home", identityBoundary: "Direct dumbbell elbow extension; overhead and lying setup belong to reviewed realizations.", equipmentTruth: "one or two dumbbells; support/floor depends on realization", support: "standing, seated, or supine must be explicit", risk: "overhead range and load handling are realization-sensitive", familiarity: "recognizable direct arm work", setupComplexity: "low", homeComfort: "good", movementRole: "direct_elbow_extension", actionFunctions: ["elbow_extension"], purpose: ["direct_development", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["load", "reps", "sets", "range", "tempo"], loadCeiling: "dumbbell ceiling", receiver: "home direct-triceps accessory pool", redundancy: "current direct triceps row requires cable", coachingBurden: "moderate", evidence: "realization and shoulder/elbow stress curation required", disposition: "ready_after_targeted_metadata_curation", firstTrancheEligible: true }),
  candidate({ id: "bent-over-dumbbell-reverse-fly", group: "home", identityBoundary: "Free-implement shoulder horizontal-abduction identity; not a row or machine reverse fly realization.", equipmentTruth: "dumbbells + stable standing space; optional explicit support", support: "unsupported hinge or explicit support", risk: "hinge/support tolerance and load control require review", familiarity: "recognizable rear-delt exercise", setupComplexity: "low", homeComfort: "good", movementRole: "direct_rear_delt", actionFunctions: ["shoulder_horizontal_abduction"], purpose: ["direct_development", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["load", "reps", "sets", "range", "support"], loadCeiling: "light-dumbbell and position constrained", receiver: "home rear-delt accessory pool", redundancy: "adds anchorless path absent from reverse pec deck and face pull", coachingBurden: "moderate", evidence: "support and scapular mechanics curation required", disposition: "ready_after_targeted_metadata_curation", firstTrancheEligible: true }),
  candidate({ id: "side-lying-hip-abduction", group: "home", identityBoundary: "Floor-supported direct hip abduction; distinct from standing lateral stepping.", equipmentTruth: "bodyweight + floor_space; optional reviewed loop band", support: "substantial side-lying floor support", risk: "floor tolerance and exact side setup", familiarity: "recognizable simple floor movement", setupComplexity: "low", homeComfort: "excellent", movementRole: "direct_hip_abduction", actionFunctions: ["hip_abduction"], purpose: ["direct_development", "activation"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "range", "tempo", "load"], loadCeiling: "limited without reviewed external load", receiver: "home direct-abductor accessory/activation pool", redundancy: "distinct task and support from loop-band lateral walk", coachingBurden: "low", evidence: "identity is supported by current P0 side-lying adduction boundary", disposition: "ready_for_owner_selection", firstTrancheEligible: true }),
  candidate({ id: "bird-dog", group: "home", identityBoundary: "Quadruped contralateral trunk-control task; not a plank lever or generic corrective drill.", equipmentTruth: "bodyweight + floor_space", support: "four-point floor support changing by prescription", risk: "wrist/knee/floor tolerance and quality stop", familiarity: "widely recognizable", setupComplexity: "low", homeComfort: "excellent", movementRole: "anti_extension_core", actionFunctions: [], purpose: ["movement_quality", "local_capacity", "preparation"], doseMode: "repetition_sets", progressionAxes: ["reps", "range", "tempo", "lever"], loadCeiling: "not a heavy strength identity", receiver: "familiar quadruped trunk-control pool", redundancy: "different support/coordination task from dead bug and plank", coachingBurden: "low", evidence: "trunk mechanics and non-corrective receiver review required", disposition: "ready_for_owner_selection", firstTrancheEligible: true }),
  candidate({ id: "reverse-lunge", group: "home", identityBoundary: "Dynamic backward step-and-return single-leg pattern; boundary from split squat unresolved.", equipmentTruth: "stable standing space; optional legal load/support", support: "unsupported or explicit stable support", risk: "dynamic balance and step space", familiarity: "recognizable but more coordinated than split squat", setupComplexity: "low", homeComfort: "possible", movementRole: "single_leg", actionFunctions: ["hip_extension"], purpose: ["strength", "hypertrophy", "movement_quality"], doseMode: "repetition_sets", progressionAxes: ["load", "reps", "range", "support"], loadCeiling: "environment dependent", receiver: "single-leg strength pool only if identity is distinct", redundancy: "may duplicate split-squat realization", coachingBurden: "moderate", evidence: "owner identity decision required", disposition: "catalog_identity_gap_confirmed", firstTrancheEligible: false }),
  candidate({ id: "bodyweight-squat", group: "home", identityBoundary: "Free bodyweight squat without mandatory box contact; boundary from bodyweight box squat unresolved.", equipmentTruth: "bodyweight + stable standing space", support: "free or explicit support", risk: "range and balance response", familiarity: "very high", setupComplexity: "low", homeComfort: "excellent", movementRole: "squat", actionFunctions: ["hip_extension"], purpose: ["movement_quality", "local_endurance", "preparation"], doseMode: "repetition_sets", progressionAxes: ["reps", "range", "tempo", "support"], loadCeiling: "bodyweight-limited", receiver: "squat rehearsal/development only if distinct", redundancy: "may be a no-box realization of current box squat or rehearsal of goblet squat", coachingBurden: "low", evidence: "owner identity boundary required", disposition: "catalog_identity_gap_confirmed", firstTrancheEligible: false }),
  candidate({ id: "band-biceps-curl", group: "home", identityBoundary: "Foot-anchored or self-anchored elastic elbow flexion with no environmental anchor.", equipmentTruth: "tube or flat band with explicit under-foot path", support: "standing or seated feet-supported", risk: "band condition, foot retention, and face path require setup review", familiarity: "high", setupComplexity: "low", homeComfort: "good", movementRole: "direct_elbow_flexion", actionFunctions: ["elbow_flexion"], purpose: ["direct_development", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range"], loadCeiling: "band force is not kilograms and remains bounded/unknown", receiver: "anchorless home biceps pool", redundancy: "current direct biceps row requires dumbbells", coachingBurden: "low", evidence: "band path and inspection coaching required", disposition: "ready_after_targeted_metadata_curation", firstTrancheEligible: true }),
  candidate({ id: "band-pull-apart", group: "home", identityBoundary: "Anchorless shoulder horizontal-abduction/scapular task; not a full horizontal pull.", equipmentTruth: "tube or flat band held in both hands; no anchor", support: "standing or seated", risk: "band condition and face path", familiarity: "moderate", setupComplexity: "low", homeComfort: "good", movementRole: "direct_rear_delt_or_preparation", actionFunctions: ["shoulder_horizontal_abduction", "scapular_retraction"], purpose: ["direct_development", "preparation"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range"], loadCeiling: "limited and not equivalent to row loading", receiver: "rear-delt/preparation only", redundancy: "must not rescue horizontal-pull coverage", coachingBurden: "low", evidence: "receiver and shoulder/scapular boundary review required", disposition: "receiver_policy_required", firstTrancheEligible: false }),
  candidate({ id: "band-squat", group: "home", identityBoundary: "Band-loaded squat realization unless reviewed resistance path creates unique receiver value.", equipmentTruth: "self-anchored band path must be explicit", support: "standing", risk: "band routing and release", familiarity: "moderate", setupComplexity: "moderate", homeComfort: "possible", movementRole: "squat", actionFunctions: ["hip_extension"], purpose: ["strength", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range"], loadCeiling: "limited/unknown band force", receiver: "already served by squat identities", redundancy: "resistance implement alone does not justify identity", coachingBurden: "moderate", evidence: "no unique receiver established", disposition: "duplicate_low_value", firstTrancheEligible: false }),
  candidate({ id: "band-romanian-deadlift", group: "home", identityBoundary: "Band-resisted hinge may be realization or distinct resistance-path identity; unresolved.", equipmentTruth: "band under feet with explicit hand path", support: "standing", risk: "foot retention, band condition, release path", familiarity: "moderate", setupComplexity: "moderate", homeComfort: "possible", movementRole: "hinge", actionFunctions: ["hip_extension"], purpose: ["strength", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range", "tempo"], loadCeiling: "band force unknown", receiver: "home loaded hinge when dumbbells absent", redundancy: "identity boundary from dumbbell RDL/bodyweight hinge unresolved", coachingBurden: "moderate", evidence: "identity and band safety review required", disposition: "support_or_safety_review_required", firstTrancheEligible: false }),
  candidate({ id: "foot-anchored-seated-band-row", group: "home", identityBoundary: "Seated self-anchored band row, distinct setup from environmental-anchor band row.", equipmentTruth: "tube or flat band around feet; no environmental anchor", support: "seated floor or chair must be explicit", risk: "foot slip, band snapback toward face, and floor/chair assumptions", familiarity: "moderate", setupComplexity: "moderate", homeComfort: "poor", movementRole: "horizontal_pull", actionFunctions: ["scapular_retraction", "elbow_flexion"], purpose: ["strength", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range"], loadCeiling: "limited/unknown", receiver: "anchorless horizontal-pull gap", redundancy: "unique capability but adverse setup boundary", coachingBurden: "high", evidence: "support/safety review required before owner selection", disposition: "home_comfort_rejected", firstTrancheEligible: false }),
  candidate({ id: "body-wrapped-band-chest-press", group: "home", identityBoundary: "Body-wrapped elastic horizontal press with no fixed anchor.", equipmentTruth: "band routed around torso; exact band type and condition required", support: "standing or seated must be explicit", risk: "body contact, skin/clothing pinch, routing, and release", familiarity: "low", setupComplexity: "high", homeComfort: "poor", movementRole: "horizontal_push", actionFunctions: ["shoulder_horizontal_adduction", "elbow_extension"], purpose: ["strength", "hypertrophy"], doseMode: "repetition_sets", progressionAxes: ["reps", "sets", "band_resistance", "range"], loadCeiling: "limited/unknown", receiver: "anchorless external-resistance horizontal push", redundancy: "push-up already offers anchorless horizontal push", coachingBurden: "high", evidence: "body-contact and release review required", disposition: "home_comfort_rejected", firstTrancheEligible: false }),
]);

const historical = (
  id: string,
  identityBoundary: string,
  equipmentTruth: string,
  receiver: string,
  disposition: CandidateConcept["disposition"],
  eligible: boolean,
): CandidateConcept => candidate({
  id,
  group: "historical_p1",
  identityBoundary,
  equipmentTruth,
  support: "candidate-specific support must remain explicit",
  risk: "historical proposal is not owner approval; mechanics/stress review remains",
  familiarity: "common concept, exact realization familiarity unknown",
  setupComplexity: "moderate",
  homeComfort: "possible",
  movementRole: "candidate_specific",
  actionFunctions: [],
  purpose: ["candidate_specific_review"],
  doseMode: "repetition_sets_or_review_required",
  progressionAxes: ["load", "reps", "sets", "range"],
  loadCeiling: "equipment-specific",
  receiver,
  redundancy: "reviewed against current 45 rows",
  coachingBurden: "moderate",
  evidence: "historical P1 proposal re-audited against current catalog",
  disposition,
  firstTrancheEligible: eligible,
});

export const historicalP1Candidates: readonly CandidateConcept[] = Object.freeze([
  historical("machine-shoulder-press", "Selectorized guided vertical press; geometry remains setup-specific.", "existing shoulder_press machine capability", "supported vertical-push path diversity", "ready_for_owner_selection", true),
  historical("assisted-pull-up", "Vertical body pull with explicit assistance, distinct from pulldown and unassisted pull-up.", "pull_up_bar plus explicit assistance capability", "vertical-pull progression/path diversity", "equipment_contract_required", true),
  historical("machine-leg-extension", "Selectorized open-chain knee extension, not squat exposure.", "new generic knee_extension machine capability", "direct quad accessory", "equipment_contract_required", true),
  historical("incline-dumbbell-bench-press", "Bench angle is a bounded dumbbell-bench-press realization until a unique receiver is approved.", "dumbbells plus adjustable_bench", "no current unique receiver", "same_identity_realization", false),
  historical("suspension-row", "Body-angle horizontal pull using a rated suspension system.", "new suspension_trainer plus rated_anchor capabilities", "home horizontal pull with explicit rated equipment", "equipment_contract_required", false),
  historical("half-kneeling-hip-flexor-mobility", "Half-kneeling hip-range preparation, not direct strengthening.", "floor_space plus kneeling tolerance", "dependency-owned hip preparation only", "receiver_policy_required", false),
  historical("side-lying-thoracic-rotation", "Supported thoracic rotation mobility, not loaded trunk rotation.", "floor_space", "dependency-owned thoracic preparation only", "receiver_policy_required", false),
  historical("cable-hip-adduction", "Standing cable hip adduction distinct from floor-supported side-lying adduction.", "low cable, ankle cuff, standing space", "loadable direct adductor path", "ready_after_targeted_metadata_curation", true),
  historical("cable-hip-abduction", "Standing cable hip abduction distinct from lateral stepping.", "low cable, ankle cuff, standing space", "loadable direct abductor path", "ready_after_targeted_metadata_curation", true),
]);

const common = (
  id: string,
  boundary: string,
  equipment: string,
  receiver: string,
  disposition: CandidateConcept["disposition"],
  eligible = false,
): CandidateConcept => candidate({
  id,
  group: "common_strength",
  identityBoundary: boundary,
  equipmentTruth: equipment,
  support: "exact setup/support required",
  risk: "familiarity does not remove technical, stress, or setup review",
  familiarity: "widely recognized but exact familiarity unknown",
  setupComplexity: "moderate",
  homeComfort: "possible",
  movementRole: "strength_or_accessory_review",
  actionFunctions: [],
  purpose: ["strength", "hypertrophy"],
  doseMode: "repetition_sets",
  progressionAxes: ["load", "reps", "sets", "range", "tempo"],
  loadCeiling: "equipment and skill dependent",
  receiver,
  redundancy: "current alternatives assessed before admission",
  coachingBurden: "moderate",
  evidence: "common status is not production readiness",
  disposition,
  firstTrancheEligible: eligible,
});

export const commonStrengthCandidates: readonly CandidateConcept[] = Object.freeze([
  common("barbell-bench-press", "Barbell horizontal press with rack/bench/unrack path, distinct from dumbbell press.", "barbell + flat_bench + rack safety capability not fully modeled", "specific barbell-strength path; not required for initial delivery", "equipment_contract_required"),
  common("barbell-back-squat", "Rack-unracked axial barbell squat identity.", "barbell + squat_rack + safeties/clearance review", "specific barbell squat strength; current squat alternatives sufficient initially", "equipment_contract_required"),
  common("conventional-or-trap-bar-deadlift", "Floor-start loaded pull; conventional and trap-bar boundary itself requires review.", "barbell/plates or trap_bar capability absent", "specific heavy pull; hinge alternatives sufficient initially", "equipment_contract_required"),
  common("unassisted-pull-up", "Unassisted suspended vertical body pull, distinct from assisted and pulldown paths.", "pull_up_bar + hanging/grip truth", "advanced vertical-pull specificity", "ready_after_targeted_metadata_curation"),
  common("seated-calf-raise", "Knee-flexed loaded plantar flexion, distinct path from standing calf raise.", "machine or stable seated external-load setup", "direct calf path diversity", "ready_after_targeted_metadata_curation", true),
  common("slider-leg-curl", "Supine sliding knee-flexion curl, distinct from walkout and machine curl.", "slider plus compatible floor capability absent", "home knee-flexion path diversity", "equipment_contract_required"),
  common("landmine-press", "Angled barbell press with secured landmine pivot.", "landmine attachment/corner safety capability absent", "angled press path", "equipment_contract_required"),
  common("hanging-knee-raise", "Suspended trunk/hip-flexion task, not machine abdominal crunch.", "pull_up_bar + hanging/grip truth", "advanced trunk accessory", "exercise_science_review_required"),
]);

export const deferredCategories = Object.freeze([
  "olympic_lifts",
  "jumps",
  "throws",
  "ballistic_push_ups",
  "kettlebell_swings_as_power_or_conditioning",
  "sprints",
  "rowing_air_bike_treadmill_conditioning",
  "loaded_complexes",
  "advanced_intensity_technique_identities",
  "unstable_surface_novelty",
  "sport_specific_drills",
  "clinical_rehabilitation_identities",
  "equipment_brand_specific_machines",
].map((id) => ({
  id,
  reason: id === "clinical_rehabilitation_identities"
    ? "Requires future accessibility/clinical ownership outside the catalog curation scope."
    : id.includes("conditioning") || ["olympic_lifts", "jumps", "throws", "ballistic_push_ups", "sprints", "loaded_complexes"].includes(id)
      ? "Requires future power or systemic-conditioning legality, receiver, dose, and safety policy."
      : "No first-tranche receiver justifies the complexity, novelty, or brand-specific identity.",
  disposition: id === "clinical_rehabilitation_identities"
    ? "deferred_accessibility_owner"
    : id.includes("conditioning") || ["olympic_lifts", "jumps", "throws", "ballistic_push_ups", "sprints", "loaded_complexes"].includes(id)
      ? "deferred_power_or_conditioning"
      : "rejected",
})));

export const allCandidateConcepts = Object.freeze([
  ...homeCandidates,
  ...historicalP1Candidates,
  ...commonStrengthCandidates,
]);

type EnvironmentFixture = {
  readonly id: string;
  readonly capabilities: readonly string[];
  readonly machineIds: readonly string[];
};

export const environments: readonly EnvironmentFixture[] = Object.freeze([
  { id: "bodyweight_no_equipment", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space"], machineIds: [] },
  { id: "dumbbells_without_bench", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "dumbbells", "dumbbell_pair"], machineIds: [] },
  { id: "dumbbells_with_bench", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "dumbbells", "dumbbell_pair", "flat_bench", "adjustable_bench"], machineIds: [] },
  { id: "loop_band_only", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "loop_band"], machineIds: [] },
  { id: "tube_band_without_anchor", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "tube_band"], machineIds: [] },
  { id: "tube_band_low_anchor", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "tube_band", "band_anchor_low"], machineIds: [] },
  { id: "tube_band_mid_anchor", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "tube_band", "band_anchor_mid"], machineIds: [] },
  { id: "tube_band_high_anchor", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "tube_band", "band_anchor_high"], machineIds: [] },
  { id: "full_gym", capabilities: ["bodyweight", "floor_space", "stable_loaded_standing_space", "loaded_gait_space", "wall", "stable_support_surface", "flat_bench", "adjustable_bench", "box", "dumbbells", "dumbbell_pair", "barbell", "squat_rack", "cable_stack", "cable_anchor_low", "cable_anchor_mid", "cable_anchor_high", "selectorized_machine", "loop_band", "tube_band", "band_anchor_low", "band_anchor_mid", "band_anchor_high", "pull_up_bar"], machineIds: ["abdominal_crunch", "chest_press", "row", "lat_pulldown", "leg_press", "leg_curl", "reverse_pec_deck", "shoulder_press"] },
  { id: "selected_machine_capabilities", capabilities: ["bodyweight", "stable_loaded_standing_space", "selectorized_machine"], machineIds: ["abdominal_crunch", "chest_press", "row", "lat_pulldown", "leg_press", "leg_curl", "reverse_pec_deck", "shoulder_press"] },
]);

const patternCurrentIds = Object.freeze({
  horizontal_push: ["push-up", "dumbbell-bench-press", "machine-chest-press"],
  horizontal_pull: ["chest-supported-dumbbell-row", "one-arm-dumbbell-row", "machine-row", "seated-cable-row", "band-row"],
  vertical_push: ["dumbbell-shoulder-press"],
  vertical_pull: ["lat-pulldown", "band-lat-pulldown"],
  knee_dominant: ["goblet-squat", "leg-press", "bodyweight-box-squat", "split-squat", "step-up"],
  squat: ["goblet-squat", "leg-press", "bodyweight-box-squat"],
  hinge: ["dumbbell-romanian-deadlift", "cable-pull-through", "bodyweight-hip-hinge-rehearsal"],
  single_leg: ["split-squat", "step-up", "single-leg-balance-rehearsal"],
  hip_extension: ["dumbbell-romanian-deadlift", "cable-pull-through", "glute-bridge"],
  knee_flexion: ["lying-leg-curl", "supine-hamstring-walkout"],
  calf: ["standing-calf-raise"],
  hip_abduction: ["loop-band-lateral-walk"],
  hip_adduction: ["side-lying-hip-adduction"],
  shoulder_abduction: ["dumbbell-lateral-raise"],
  shoulder_horizontal_abduction: ["reverse-pec-deck", "band-face-pull"],
  shoulder_external_rotation: ["side-lying-dumbbell-external-rotation", "band-face-pull"],
  elbow_flexion: ["dumbbell-curl"],
  elbow_extension: ["cable-triceps-pressdown"],
  anti_extension: ["dead-bug", "forearm-plank"],
  anti_rotation: ["pallof-press"],
  anti_lateral_flexion: ["forearm-side-plank", "suitcase-carry", "wall-supported-suitcase-march"],
  controlled_flexion: ["machine-abdominal-crunch"],
  controlled_rotation: ["half-kneeling-high-to-low-cable-chop"],
  carry_bracing: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
  mobility_preparation: ["ninety-ninety-breathing", "serratus-wall-slide", "wall-ankle-dorsiflexion-rock", "bodyweight-hip-hinge-rehearsal", "single-leg-balance-rehearsal"],
});

const patternCandidateIds: Readonly<Record<keyof typeof patternCurrentIds, readonly string[]>> = Object.freeze({
  horizontal_push: ["dumbbell-floor-press"],
  horizontal_pull: ["suspension-row"],
  vertical_push: ["machine-shoulder-press", "landmine-press"],
  vertical_pull: ["assisted-pull-up", "unassisted-pull-up"],
  knee_dominant: ["reverse-lunge", "bodyweight-squat", "machine-leg-extension"],
  squat: ["bodyweight-squat"],
  hinge: ["band-romanian-deadlift", "conventional-or-trap-bar-deadlift"],
  single_leg: ["reverse-lunge"],
  hip_extension: ["conventional-or-trap-bar-deadlift"],
  knee_flexion: ["slider-leg-curl"],
  calf: ["seated-calf-raise"],
  hip_abduction: ["side-lying-hip-abduction", "cable-hip-abduction"],
  hip_adduction: ["cable-hip-adduction"],
  shoulder_abduction: [],
  shoulder_horizontal_abduction: ["bent-over-dumbbell-reverse-fly", "band-pull-apart"],
  shoulder_external_rotation: [],
  elbow_flexion: ["band-biceps-curl"],
  elbow_extension: ["dumbbell-triceps-extension"],
  anti_extension: ["bird-dog"],
  anti_rotation: [],
  anti_lateral_flexion: [],
  controlled_flexion: ["hanging-knee-raise"],
  controlled_rotation: ["side-lying-thoracic-rotation"],
  carry_bracing: [],
  mobility_preparation: ["half-kneeling-hip-flexor-mobility", "side-lying-thoracic-rotation"],
});

export const coverageExperienceAndFamiliarityStates = Object.freeze([
  "Beginner",
  "Intermediate",
  "Advanced",
  "unknown",
  "identity_familiar",
  "exact_realization_familiar",
  "home_advanced",
  "gym_beginner",
]);

export const coveragePurposes = Object.freeze([
  "strength",
  "hypertrophy",
  "movement_quality",
  "local_muscular_endurance",
  "direct_development",
  "capacity",
  "preparation",
  "activation",
  "recovery",
]);

const developmentPurposes = ["strength", "hypertrophy", "movement_quality", "local_muscular_endurance", "capacity"];
const directPurposes = ["hypertrophy", "local_muscular_endurance", "direct_development", "capacity", "activation"];
const trunkPurposes = ["movement_quality", "local_muscular_endurance", "capacity", "preparation", "activation"];
const patternPurposes: Readonly<Record<keyof typeof patternCurrentIds, readonly string[]>> = Object.freeze({
  horizontal_push: developmentPurposes,
  horizontal_pull: developmentPurposes,
  vertical_push: developmentPurposes,
  vertical_pull: developmentPurposes,
  knee_dominant: developmentPurposes,
  squat: developmentPurposes,
  hinge: developmentPurposes,
  single_leg: developmentPurposes,
  hip_extension: developmentPurposes,
  knee_flexion: [...developmentPurposes, "direct_development"],
  calf: directPurposes,
  hip_abduction: directPurposes,
  hip_adduction: directPurposes,
  shoulder_abduction: directPurposes,
  shoulder_horizontal_abduction: directPurposes,
  shoulder_external_rotation: [...directPurposes, "preparation"],
  elbow_flexion: directPurposes,
  elbow_extension: directPurposes,
  anti_extension: trunkPurposes,
  anti_rotation: trunkPurposes,
  anti_lateral_flexion: trunkPurposes,
  controlled_flexion: trunkPurposes,
  controlled_rotation: trunkPurposes,
  carry_bracing: [...developmentPurposes, "direct_development"],
  mobility_preparation: ["movement_quality", "preparation", "activation", "recovery"],
});

function requirementSatisfied(
  requirement: (typeof REFERENCE_EXERCISES)[number]["equipmentRequirements"][number],
  environment: EnvironmentFixture,
) {
  const capabilities = new Set(environment.capabilities);
  return (requirement.allOf ?? []).every((value) => capabilities.has(value)) &&
    ((requirement.oneOf ?? []).length === 0 || (requirement.oneOf ?? []).some((value) => capabilities.has(value))) &&
    ((requirement.machineIds ?? []).length === 0 || (requirement.machineIds ?? []).some((value) => environment.machineIds.includes(value)));
}

function legalInEnvironment(exerciseId: string, environment: EnvironmentFixture) {
  const exercise = REFERENCE_EXERCISES.find((row) => row.id === exerciseId);
  return Boolean(exercise?.equipmentRequirements.every((requirement) => requirementSatisfied(requirement, environment)));
}

export const coverageMatrix: readonly CoverageCell[] = Object.freeze(environments.flatMap((environment) =>
  Object.entries(patternCurrentIds).map(([pattern, ids]) => {
    const currentIds = ids.filter((id) => legalInEnvironment(id, environment));
    const candidateIds = patternCandidateIds[pattern as keyof typeof patternCurrentIds];
    const equipmentImpossible = pattern === "vertical_pull" && [
      "bodyweight_no_equipment",
      "dumbbells_without_bench",
      "dumbbells_with_bench",
      "loop_band_only",
      "tube_band_without_anchor",
      "tube_band_low_anchor",
      "tube_band_mid_anchor",
    ].includes(environment.id);
    const status: CoverageCell["status"] = currentIds.length >= 2
      ? "sufficient"
      : currentIds.length === 1
        ? "thin"
        : equipmentImpossible
          ? "impossible_without_equipment"
          : candidateIds.length > 0
            ? "candidate_expansion_available"
            : "empty";
    return {
      environment: environment.id,
      pattern,
      experienceAndFamiliarityStates: coverageExperienceAndFamiliarityStates,
      applicablePurposes: patternPurposes[pattern as keyof typeof patternCurrentIds],
      status,
      currentIds,
      candidateIds,
      reason: equipmentImpossible
        ? "No legal vertical-pull apparatus is proven; report the limitation rather than relabel a pullover or pull-apart."
        : currentIds.length > 0
          ? `${currentIds.length} current legal canonical candidate(s).`
          : candidateIds.length > 0
            ? "No current legal row; curated candidates exist but are not production rows."
            : "No current row or admitted candidate receiver.",
    };
  }),
));

const matrixFor = (environmentIds: readonly string[]) =>
  coverageMatrix.filter((entry) => environmentIds.includes(entry.environment));

export const homeCoverageMatrix = Object.freeze(matrixFor(environments.slice(0, 8).map((entry) => entry.id)));
export const gymCoverageMatrix = Object.freeze(matrixFor(["full_gym", "selected_machine_capabilities"]));

export const currentPoolSummary = Object.freeze({
  home: {
    sufficient: homeCoverageMatrix.filter((entry) => entry.status === "sufficient").length,
    thin: homeCoverageMatrix.filter((entry) => entry.status === "thin").length,
    empty: homeCoverageMatrix.filter((entry) => ["empty", "candidate_expansion_available"].includes(entry.status)).length,
    impossibleWithoutEquipment: homeCoverageMatrix.filter((entry) => entry.status === "impossible_without_equipment").length,
  },
  gym: {
    sufficient: gymCoverageMatrix.filter((entry) => entry.status === "sufficient").length,
    thin: gymCoverageMatrix.filter((entry) => entry.status === "thin").length,
    empty: gymCoverageMatrix.filter((entry) => ["empty", "candidate_expansion_available"].includes(entry.status)).length,
    impossibleWithoutEquipment: gymCoverageMatrix.filter((entry) => entry.status === "impossible_without_equipment").length,
  },
});

export const ontologyAnswers = Object.freeze([
  [1, "Current rows cover push-up, rows with exact support/anchors, dumbbell press with bench, shoulder press, squats, hinge, split squat, bridge, curl, plank, carries, calf, direct hip/cuff work, hamstring walkout, and preparation when their exact equipment/support is available."],
  [2, "Push-up, one-arm row, goblet squat, split squat, bridge, standing calf raise, planks, balance rehearsal, and incline dumbbell bench need realization metadata rather than duplicate grip/support/range/load IDs."],
  [3, "No-bench dumbbell press, direct home triceps/rear delt, side-lying abduction, quadruped trunk control, anchorless band arms, and some legal home horizontal-pull contexts remain gaps."],
  [4, "Dumbbell bench press and chest-supported dumbbell row require a proven flat/adjustable bench; incline pressing also requires an adjustable bench."],
  [5, "Band row requires a mid anchor; band lat pulldown and band face pull require a high anchor."],
  [6, "Band biceps curl and pull-apart are supportable after exact band-path review; pull-apart is not a full horizontal pull."],
  [7, "Foot-anchored rows, body-wrapped presses, and foot-routed RDLs create retention, snapback, body-contact, or release risks requiring review."],
  [8, "No. Dumbbell floor press is a confirmed candidate gap."],
  [9, "No. Side-lying hip abduction is a confirmed candidate gap."],
  [10, "No. Bird-dog is a confirmed candidate gap, not a generic corrective default."],
  [11, "No exact reverse-lunge row; distinctness from split squat remains an owner identity decision."],
  [12, "No. Current direct triceps work requires a cable."],
  [13, "No. Current direct rear-delt paths require a reverse-pec-deck or high band anchor."],
  [14, "No current row. Band biceps curl is the clearest anchorless arm candidate."],
  [15, "Unresolved. Box contact/support can be material; the owner must approve the identity boundary."],
  [16, "Yes, provisionally: incline/wall/knee/floor are support/lever realizations of Push-Up when metadata proves legality."],
  [17, "Yes. Support/stance/side are realization facts for One-Arm Dumbbell Row."],
  [18, "Unresolved. Reverse lunge adds a dynamic backward step and may warrant a distinct identity."],
  [19, "A materially different task/path such as floor press vs bench press, side-lying abduction vs lateral stepping, or suspended pull-up vs pulldown can require a new identity; grip, support, angle, range, or load alone usually does not."],
  [20, "Supported machine vertical press, direct knee extension, assisted/unassisted pull-up paths, seated calf work, and common barbell-specific strength paths are absent."],
  [21, "No. Existing dumbbell/machine/bodyweight patterns can support initial owner delivery; barbell specificity may be a later owner-selected tranche."],
  [22, "Machine shoulder press and leg extension offer high value; assisted pull-up machinery requires an assistance capability. Brand-specific geometries remain realizations."],
  [23, "Floor press, side-lying abduction, bird-dog, machine shoulder press, leg extension, and reviewed direct arm/rear-delt paths improve actual receivers."],
  [24, "Floor press, side-lying abduction, bird-dog, and band curl improve familiar low-setup options without requiring novelty."],
  [25, "Band squat, incline press as a new ID, unsupported mobility filler, and advanced novelty can expand breadth without unique receivers."],
  [26, "Vertical push, calf, direct hip actions, direct elbow actions, and several trunk functions remain one-row dependencies in many environments."],
  [27, "Bodyweight/no apparatus, dumbbells-only, loop-band-only, tube-band without high/rated anchor, and low/mid-anchor-only homes cannot truthfully provide current vertical pulling."],
  [28, "No. A pullover cannot be relabeled as vertical pull without a reviewed receiver and movement-role change."],
  [29, "No. Pull-apart may serve shoulder horizontal abduction/retraction, not full horizontal pulling."],
  [30, "Whenever exact apparatus/support is absent and no candidate satisfies the same required role/action/purpose, return an equipment limitation."],
  [31, "Yes. Read-only curation can earn readiness for owner selection while additions, modifications, ranking, Product, and activation remain zero."],
]);

export const ontologyClassification =
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_ONTOLOGY_READY" as const;

export const firstSessionCohort = Object.freeze([
  ["beginner_dumbbells_no_bench", "Prefer legal recognizable rows; floor press is candidate-only and current external-load horizontal push remains limited."],
  ["beginner_loop_bands_only", "Use current loop-band and bodyweight foundations only where purpose fits; no invented anchor."],
  ["beginner_tube_band_no_anchor", "Do not offer anchored rows/pulldowns/face pulls; report vertical-pull limitation."],
  ["beginner_full_gym", "Stable machines may be considered but are not automatically safer or mandatory."],
  ["unknown_experience_dumbbells", "Among legal equivalents, favor recognizable low-setup options and calibration."],
  ["unknown_experience_bands", "Favor low-complexity reviewed paths; no anchor or band-force inference."],
  ["advanced_home_dumbbells_exact_familiarity", "Preserve familiar legal anchors and use demanding realizations when load/support truth permits."],
  ["advanced_home_bands_exact_anchor_load", "Advanced evidence overrides coarse comfort defaults without bypassing safety or purpose."],
  ["advanced_home_unfamiliar_exercise", "Advanced status does not prove exact identity familiarity; coach the legal setup or retain a familiar anchor."],
  ["intermediate_stable_anchors", "Use exact anchor height/rating and preserve productive continuity."],
  ["relevant_pain", "Pain/restriction truth precedes comfort and familiarity."],
  ["irrelevant_pain", "No unrelated candidate change."],
  ["floor_unavailable", "Remove floor-dependent rows/candidates; never infer floor space."],
  ["wall_unavailable", "Remove wall-dependent realizations; do not infer wall support."],
  ["chair_support_unavailable", "Do not realize chair/table-supported rows or squats."],
  ["limited_space", "Prefer legal stationary options; carries and stepping may become unavailable."],
  ["requests_familiar", "Preserve legal productive identities before novelty."],
  ["requests_challenge", "Progress a legal axis or reviewed transition; challenge cannot invent equipment."],
  ["requests_variety", "Permit bounded justified variation without quota or purpose loss."],
  ["dislikes_floor", "Prefer legal standing/seated alternatives; preference does not fabricate apparatus."],
  ["prefers_machines", "Use exact available machine IDs only."],
  ["prefers_dumbbells", "Use legal dumbbell rows; preference does not imply bench or load ceiling."],
].map(([id, expected]) => ({ id, expected, productionSelectionApplied: false })));

export const causalPairs = Object.freeze([
  ["unknown_home_familiarity", "exact_advanced_familiarity", "local_rank_tie_or_realization", "Exact evidence may retain a more demanding legal home realization."],
  ["simple_legal_option", "complex_equivalent", "local_rank_tie", "Simple wins only after legality, purpose, pain, and continuity tie."],
  ["familiar_productive_anchor", "novel_slightly_higher_ranked", "selection", "Productive anchor persists absent a justified transition."],
  ["load_ceiling_absent", "load_ceiling_reached", "progression_options", "Reached ceiling opens transition review, not automatic replacement."],
  ["bench_absent", "bench_present", "candidate_set", "Bench-dependent rows enter only when bench is explicit."],
  ["band_anchor_absent", "band_anchor_present", "candidate_set", "Only exact-height anchored rows enter."],
  ["support_absent", "support_present", "realization", "Supported realization enters without creating a new identity."],
  ["relevant_pain_absent", "relevant_pain_present", "equipment_legality_and_candidate_set", "Relevant response may remove/review candidates before comfort."],
  ["challenge_preference_absent", "challenge_preference_present", "progression_options", "Challenge may select a legal axis, never override purpose or equipment."],
  ["variety_preference_absent", "variety_preference_present", "bounded_selection", "Variety may justify a reviewed alternative but creates no quota."],
].map(([left, right, responseWindow, expected]) => ({ left, right, responseWindow, expected })));

export const packages = Object.freeze([
  {
    id: "H",
    name: "Home Comfort Core",
    candidateIds: ["dumbbell-floor-press", "dumbbell-triceps-extension", "bent-over-dumbbell-reverse-fly", "side-lying-hip-abduction", "bird-dog", "band-biceps-curl"],
    sameIdentityMetadata: ["push-up", "one-arm-dumbbell-row", "goblet-squat", "split-squat", "glute-bridge", "standing-calf-raise", "forearm-plank", "forearm-side-plank", "single-leg-balance-rehearsal"],
    newRowCount: 6,
    environmentsImproved: ["dumbbells_without_bench", "tube_band_without_anchor", "bodyweight_no_equipment"],
    poolsImproved: ["horizontal_push", "elbow_extension", "shoulder_horizontal_abduction", "hip_abduction", "anti_extension", "elbow_flexion"],
    remainingGaps: ["home_vertical_pull_without_apparatus", "safe_anchorless_full_horizontal_pull", "reverse_lunge_identity", "bodyweight_squat_identity"],
    homeComfortConsequence: "Adds recognizable low-setup choices while retaining explicit floor/band/load truth.",
    advancedUserConsequence: "Adds identities and runway without imposing beginner realizations.",
    rankingConsequenceExpectation: "Future pool/ranking changes require separate Pre-G2 authorization and calibration.",
    composerConsequence: "Future redundancy and assignment tests required; no current change.",
    knowledgeWork: "Full identity, mechanics, stress, support, Prescription, and coaching curation per selected row.",
    testBurden: "Catalog validation, candidate/Composer, Week, Prescription, Product Shadow, home cohort, mutation, and browser invariance.",
    rollback: "Remove selected rows/metadata in one future expansion commit before activation.",
    risk: "Medium: handling/band/support metadata and receiver purity.",
  },
  {
    id: "G",
    name: "Commercial Gym Core",
    candidateIds: ["machine-shoulder-press", "assisted-pull-up", "machine-leg-extension", "cable-hip-adduction", "cable-hip-abduction", "seated-calf-raise"],
    sameIdentityMetadata: ["dumbbell-bench-press", "one-arm-dumbbell-row", "standing-calf-raise"],
    newRowCount: 6,
    environmentsImproved: ["full_gym", "selected_machine_capabilities"],
    poolsImproved: ["vertical_push", "vertical_pull", "direct_quads", "hip_adduction", "hip_abduction", "calf"],
    remainingGaps: ["barbell_specific_strength", "unassisted_pull_up", "landmine_press", "hanging_trunk"],
    homeComfortConsequence: "Neutral; no machine availability is inferred at home.",
    advancedUserConsequence: "Improves supported/loadable path diversity without requiring barbell admission.",
    rankingConsequenceExpectation: "New legal gym candidates would require explicit ranking calibration.",
    composerConsequence: "Direct-work and support/path redundancy need calibration.",
    knowledgeWork: "New machine IDs/assistance/cuff capability plus mechanics, stress, and Prescription curation.",
    testBurden: "Machine capability, equipment rejection, candidate, Composer, direct-work anti-bloat, and regression suites.",
    rollback: "Remove selected future rows and machine capabilities before activation.",
    risk: "Medium-high: equipment ontology and generic machine identity boundaries.",
  },
  {
    id: "M",
    name: "Mixed Minimal Release",
    candidateIds: ["dumbbell-floor-press", "side-lying-hip-abduction", "bird-dog", "machine-shoulder-press", "machine-leg-extension"],
    sameIdentityMetadata: ["push-up", "one-arm-dumbbell-row", "goblet-squat", "split-squat", "glute-bridge", "standing-calf-raise", "forearm-plank", "forearm-side-plank", "single-leg-balance-rehearsal"],
    newRowCount: 5,
    environmentsImproved: ["bodyweight_no_equipment", "dumbbells_without_bench", "full_gym", "selected_machine_capabilities"],
    poolsImproved: ["horizontal_push", "hip_abduction", "anti_extension", "vertical_push", "direct_quads"],
    remainingGaps: ["home_direct_arms", "home_rear_delt", "anchorless_horizontal_pull", "vertical_pull_progression", "barbell_specific_strength"],
    homeComfortConsequence: "Closes three strong home-confidence gaps with low setup burden.",
    advancedUserConsequence: "Adds two supported gym paths while preserving existing advanced choices.",
    rankingConsequenceExpectation: "Smallest cross-environment calibration surface; still separate authorization.",
    composerConsequence: "Five future rows require receiver/redundancy review.",
    knowledgeWork: "Complete five-row curation plus two machine capability decisions.",
    testBurden: "Cross-environment catalog, candidate/Composer, freeze, and Product Shadow regression matrix.",
    rollback: "One bounded future tranche can be removed before activation.",
    risk: "Medium: narrower blast radius but leaves known direct-arm/pull gaps.",
  },
]);

export const ownerQuestions = Object.freeze([
  "Should Home Comfort Core precede Commercial Gym Core?",
  "Which exact candidates belong in the first production tranche?",
  "Should barbell bench, squat, and deadlift be admitted before owner delivery?",
  "Should Dumbbell Floor Press be a top-priority identity?",
  "Is Reverse Lunge distinct from Split Squat?",
  "Is Bodyweight Squat distinct from Bodyweight Box Squat?",
  "Should incline, wall, and knee push-ups remain one Push-Up identity?",
  "Which anchorless band patterns are acceptable?",
  "Should foot-anchored band rows be rejected for setup risk?",
  "Is body-wrapped band chest press acceptable?",
  "Should advanced home users opt into complex choices through exact familiarity rather than a separate catalog?",
  "Which catalog gaps may remain explicit limitations at initial release?",
  "How many expansion tranches should occur before G?",
  "Should Knowledge Layer curation follow each row immediately or remain a later adapter?",
  "Is the Full/Lighter/Recovery bridge a hard blocker before owner delivery?",
]);

export const practiceOptionsReminder = Object.freeze({
  status: "future_separate_authorization",
  full: "Execute the currently prescribed session.",
  lighter: {
    intent: "Reduce day-of burden while preserving required purpose, productive anchors, dependencies, and necessary rest.",
    removeFirst: ["optional_work", "redundancy", "lower_priority_work", "setup_churn"],
    prohibitedDefinition: "minus_one_set_everywhere",
  },
  recovery: {
    intent: "Use only explicitly approved recovery/support responsibilities.",
    prohibited: ["generic_mobility_circuit", "generic_corrective_circuit", "developmental_credit", "automatic_regression", "automatic_week_mutation"],
  },
  longitudinalFailureSignalFromOneChoice: false,
  implementationCount: 0,
});

export const externalEvidence = Object.freeze([
  {
    id: "acsm_progression_models",
    source: "https://pubmed.ncbi.nlm.nih.gov/11828249/",
    boundedConclusion: "Progression and exercise sequencing must be interpreted in the context of target goals, capacity, and training status; no home-equipment-to-beginner inference follows.",
  },
  {
    id: "network_meta_analysis_strength_hypertrophy",
    source: "https://pubmed.ncbi.nlm.nih.gov/37414459/",
    boundedConclusion: "Many resistance prescriptions improve strength/hypertrophy; exercise identity admission still depends on purpose, equipment, and reviewed knowledge.",
  },
  {
    id: "exercise_variation_review",
    source: "https://pubmed.ncbi.nlm.nih.gov/35438660/",
    boundedConclusion: "Variation should be systematic; redundant or frequent random changes do not justify catalog breadth or churn.",
  },
  {
    id: "elastic_resistance_review",
    source: "https://pubmed.ncbi.nlm.nih.gov/30815258/",
    boundedConclusion: "Elastic resistance can support strength, but this does not make every band setup simple, safe, anchored, or load-quantified.",
  },
  {
    id: "machine_free_weight_review",
    source: "https://pubmed.ncbi.nlm.nih.gov/37582807/",
    boundedConclusion: "Machine and free-weight outcomes are modality-specific; selection may follow goals and preferences without declaring one universally safer or superior.",
  },
  {
    id: "task_specificity_review",
    source: "https://pubmed.ncbi.nlm.nih.gov/40314751/",
    boundedConclusion: "Strength transfer is task-specific, supporting truthful identity/path distinctions where the target itself matters.",
  },
]);

export const activationGuards: GuardModel = Object.freeze({
  homeSetsBeginner: false,
  homeBlocksAdvanced: false,
  comfortMeansLowStimulus: false,
  precedence: homeComfortSelectionPolicy.precedence,
  noveltyQuota: 0,
  varietyQuota: 0,
  inferredEquipment: [],
  fakeSubstitutions: [],
  duplicateIdentityReasons: [],
  candidateWithoutReceiverCount: 0,
  catalogSizeTarget: null,
  productionRowAdditions: 0,
  productionRowModifications: 0,
  productionRowDeletions: 0,
  rankingChanges: 0,
  eligibilityChanges: 0,
  composerChanges: 0,
  weekChanges: 0,
  prescriptionChanges: 0,
  productShadowChanges: 0,
  productUiChanges: 0,
  getStrongerVisibilityChanges: 0,
  productPersistenceChanges: 0,
  generateProgramChanges: 0,
  ownerDeliveryCount: 0,
  practiceOptionsImplementationCount: 0,
  productActivationCount: 0,
  genericWarmupCount: 0,
  genericActivationCount: 0,
  productHomeProgramGrowthCount: 0,
  ledgerCompleted: false,
  gCompleted: false,
});

const experienceStates = ["Beginner", "Intermediate", "Advanced", "unknown"] as const;
const familiarityStates = ["unknown", "identity_familiar", "exact_realization_familiar"] as const;
const preferences = ["comfort", "challenge", "variety"] as const;
const constraints = ["none", "relevant_pain", "irrelevant_pain", "floor_unavailable", "wall_unavailable", "support_unavailable", "bench_unavailable", "anchor_unavailable", "limited_space"] as const;

export const controlledScenarios = Object.freeze([
  ...expectedCanonicalIds.flatMap((exerciseId, exerciseIndex) =>
    Array.from({ length: 6 }, (_, variant) => ({
      id: `controlled-current-${String(exerciseIndex + 1).padStart(2, "0")}-${variant + 1}`,
      subject: exerciseId,
      environment: environments[(exerciseIndex + variant) % environments.length].id,
      experience: experienceStates[(exerciseIndex + variant) % experienceStates.length],
      familiarity: familiarityStates[(exerciseIndex + variant) % familiarityStates.length],
      preference: preferences[(exerciseIndex + variant) % preferences.length],
      constraint: constraints[(exerciseIndex * 2 + variant) % constraints.length],
      loadCeiling: variant % 3 === 0 ? "known_not_reached" : variant % 3 === 1 ? "known_reached" : "unknown",
      plateau: variant === 4,
      expected: variant === 4 ? "transition_review_not_automatic_replacement" : "curation_only_no_production_selection",
      productionSelectionApplied: false,
    })),
  ),
  ...allCandidateConcepts.map((entry, index) => ({
    id: `controlled-candidate-${String(index + 1).padStart(2, "0")}`,
    subject: entry.id,
    environment: environments[index % environments.length].id,
    experience: experienceStates[index % experienceStates.length],
    familiarity: familiarityStates[index % familiarityStates.length],
    preference: preferences[index % preferences.length],
    constraint: constraints[index % constraints.length],
    loadCeiling: "unknown",
    plateau: false,
    expected: entry.disposition,
    productionSelectionApplied: false,
  })),
]);

const holdoutBase = expectedCanonicalIds.flatMap((exerciseId, exerciseIndex) =>
  environments.map((environment, environmentIndex) => ({
    id: `holdout-current-${String(exerciseIndex + 1).padStart(2, "0")}-${String(environmentIndex + 1).padStart(2, "0")}`,
    lane: "current_catalog",
    subject: exerciseId,
    environment: environment.id,
    experience: experienceStates[(exerciseIndex + environmentIndex) % experienceStates.length],
    familiarity: familiarityStates[(exerciseIndex * 2 + environmentIndex) % familiarityStates.length],
    comfortDimension: homeComfortProfileSchema.dimensions[(exerciseIndex + environmentIndex) % homeComfortProfileSchema.dimensions.length],
    expected: "no_production_change",
  })),
);

export const holdoutManifest = Object.freeze([
  ...holdoutBase,
  ...allCandidateConcepts.map((entry, index) => ({
    id: `holdout-candidate-${String(index + 1).padStart(2, "0")}`,
    lane: "candidate_boundary",
    subject: entry.id,
    environment: environments[index % environments.length].id,
    experience: experienceStates[index % experienceStates.length],
    familiarity: familiarityStates[index % familiarityStates.length],
    comfortDimension: homeComfortProfileSchema.dimensions[index % homeComfortProfileSchema.dimensions.length],
    expected: entry.disposition,
  })),
  ...deferredCategories.map((entry, index) => ({
    id: `holdout-deferred-${String(index + 1).padStart(2, "0")}`,
    lane: "deferred_category",
    subject: entry.id,
    environment: environments[index % environments.length].id,
    experience: experienceStates[index % experienceStates.length],
    familiarity: "unknown",
    comfortDimension: homeComfortProfileSchema.dimensions[index % homeComfortProfileSchema.dimensions.length],
    expected: entry.disposition,
  })),
  ...ownerQuestions.map((question, index) => ({
    id: `holdout-owner-${String(index + 1).padStart(2, "0")}`,
    lane: "owner_decision",
    subject: question,
    environment: environments[index % environments.length].id,
    experience: experienceStates[index % experienceStates.length],
    familiarity: "unknown",
    comfortDimension: homeComfortProfileSchema.dimensions[index % homeComfortProfileSchema.dimensions.length],
    expected: "owner_decision_required",
  })),
  ...["full", "lighter", "recovery"].map((subject, index) => ({
    id: `holdout-practice-${subject}`,
    lane: "practice_option_invariance",
    subject,
    environment: environments[index].id,
    experience: "unknown",
    familiarity: "unknown",
    comfortDimension: "reviewState",
    expected: "future_only_no_implementation",
  })),
  ...Object.keys(activationGuards).slice(0, 20).map((subject, index) => ({
    id: `holdout-freeze-${String(index + 1).padStart(2, "0")}`,
    lane: "product_engine_freeze",
    subject,
    environment: environments[index % environments.length].id,
    experience: experienceStates[index % experienceStates.length],
    familiarity: "unknown",
    comfortDimension: homeComfortProfileSchema.dimensions[index % homeComfortProfileSchema.dimensions.length],
    expected: "unchanged",
  })),
]);

export const sourceFreezeManifest = Object.freeze({
  "packages/training-engine-v2/src/data/referenceExercises.ts": "a7c69bae80c58b346d2e907387dd16ecd0f3f33f797b0aa239be5401df4d887d",
  "packages/training-engine-v2/src/candidate/ranking/rankCandidates.ts": "aa9ea0bf55cfc369024d8d8b550b5c4984eec57a6853c8db0776283f8599d27a",
  "packages/training-engine-v2/src/candidate/eligibility/equipmentEligibility.ts": "2ea8690110c1e620c29ac9ae42d4c8045358207595d0d3773301c073d6b4f85f",
  "packages/training-engine-v2/src/candidate/eligibility/roleEligibility.ts": "8c6c10cdd3edb00a52ed1b025549b0cd82a276c4c046a5a8cc698ca888c02059",
  "packages/training-engine-v2/src/sessionComposer/candidatePools.ts": "8982d30d652c49c6bcdf9bae3e6d41d075aa80822f61ae4768d05a93598af5c5",
  "packages/training-engine-v2/src/sessionComposer/redundancy.ts": "2edded7580249076d62e2e0aa89a1fa7ae640978a183cd53da8bb7114508e7e2",
  "packages/training-engine-v2/src/sessionComposer/search.ts": "abdb835bc76b1aab5496b306160768028025282d8335ac171fa1b83dbb89144c",
  "apps/consumer/src/components/QuestionnaireForm.tsx": "cacc203b0134b45dfc4871c3abae9e612e34534407e309817c04ad16977917c5",
  "apps/consumer/src/components/questionnaire/productGoalOptionRegistry.ts": "dbded0a8e65160044b0222e48ee888f3126f464e381481187896a7e86b92c7d9",
  "packages/engine/src/exercises.ts": "c3a557c1bb0b50e1f531c6bd762ba608a7665ac2adb3daa42f50a0d04f7721b6",
});

export const upstreamFingerprints = Object.freeze({
  canonicalLedgerBefore: "9265f70a7c0707ff88314a6673e954c54326956a187a50aa834793541982b562",
  referenceCatalogSource: "a7c69bae80c58b346d2e907387dd16ecd0f3f33f797b0aa239be5401df4d887d",
  sessionComposerCatalog: "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
  historicalProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
  chunkC: "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d",
  chunkD: "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464",
  postChunkDMaintenance: "39f761ac75423c549a889c4559b50e2bbf6e608c709ddb8616b5347c32c211bb",
  chunkE: "5822ccde91f41387886dd57d92015956f10035a23f78596040033d4a8fcf559f",
  chunkEReportCorpus: "4b59ed72f987e9f1a6668734052e6d0651fd5e7953529f33f9f7760095ab0bae",
  chunkF: "1665c6b780ab2638d377f09bac48de61480ab76ea346faf1304b799f1bbc9404",
});

export const closureProjection = Object.freeze({
  preG1: "completed_and_proven_read_only",
  preG2: "open_owner_approved_production_expansion",
  preG3: "open_practice_options_bridge",
  g: "open_controlled_owner_account_delivery",
  h: "open_broader_activation",
  finalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  nextDependency: "OWNER_SELECTION_OF_EXERCISE_CATALOG_EXPANSION_TRANCHE_V1",
});

export const readiness = Object.freeze({
  classification: "EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1_READY_FOR_OWNER_SELECTION_OF_PRODUCTION_EXPANSION_TRANCHE",
  ontologyClassification,
  currentRowsFrozen: currentCatalogInventory.rowCount === 45,
  uniqueIdsFrozen: currentCatalogInventory.uniqueIdCount === 45,
  controlledScenarioCount: controlledScenarios.length,
  holdoutCount: holdoutManifest.length,
  ownerQuestionCount: ownerQuestions.length,
  packageSelected: false,
  recommendedPackage: null,
  unresolvedIdentityDecisions: [
    "bodyweight-squat_vs_bodyweight-box-squat",
    "reverse-lunge_vs_split-squat",
    "unilateral_glute-bridge_boundary",
    "band-romanian-deadlift_identity_boundary",
  ],
  unresolvedEquipmentSafetyDecisions: [
    "assisted_pull_up_assistance_capability",
    "machine_leg_extension_capability",
    "foot_anchored_band_row_snapback",
    "body_wrapped_band_press_contact_release",
    "band_rdl_foot_retention",
    "suspension_rated_anchor",
  ],
  unresolvedCatalogPolicyDecisions: [
    "first_package_and_exact_tranche",
    "barbell_admission_before_G",
    "knowledge_curation_timing",
    "acceptable_anchorless_band_patterns",
    "explicit_limitations_at_initial_release",
  ],
  rollback: "Revert the documentation/test evidence commit and ledger-only commit; no production row, migration, Product data, or runtime rollback is required.",
  nextDependency: closureProjection.nextDependency,
});
