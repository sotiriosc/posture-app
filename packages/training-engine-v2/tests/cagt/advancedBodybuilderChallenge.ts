import { ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE,
  type AdvancedIntensityTechniqueRequest } from "../../src";

export const ADVANCED_BODYBUILDER_CHALLENGE_REFERENCE = Object.freeze({
  contractId: "ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE",
  contractVersion: "1.0.0",
} as const);

export type ChallengeCatalogMappingStatus =
  | "exact_canonical_identity"
  | "approved_same_identity_realization"
  | "reviewed_alias_candidate"
  | "catalog_identity_gap"
  | "equipment_only_gap"
  | "unsupported_intensity_technique_gap"
  | "ambiguous";

export interface AdvancedChallengeExercise {
  readonly day: 1 | 2 | 3 | 4 | 5 | 6;
  readonly externalPlanName: string;
  readonly listedWorkSets: number;
  readonly canonicalExerciseId: string | null;
  readonly mappingStatus: ChallengeCatalogMappingStatus;
  readonly equipmentGap: string | null;
}

const exercises: readonly AdvancedChallengeExercise[] = Object.freeze([
  { day: 1, externalPlanName: "low-incline dumbbell press", listedWorkSets: 4,
    canonicalExerciseId: "dumbbell-bench-press", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "exact dumbbell range, increments, and adjustable bench setting unknown" },
  { day: 1, externalPlanName: "incline machine press", listedWorkSets: 3,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "exact machine unknown" },
  { day: 1, externalPlanName: "cable chest fly", listedWorkSets: 3,
    canonicalExerciseId: "cable-chest-fly", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact cable stack, ratio, and increment unknown" },
  { day: 1, externalPlanName: "dumbbell lateral raise", listedWorkSets: 4,
    canonicalExerciseId: "dumbbell-lateral-raise", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact dumbbell increment unknown" },
  { day: 1, externalPlanName: "cable lateral raise", listedWorkSets: 3,
    canonicalExerciseId: null, mappingStatus: "reviewed_alias_candidate",
    equipmentGap: "attachment and cable stack unknown" },
  { day: 1, externalPlanName: "reverse pec deck", listedWorkSets: 2,
    canonicalExerciseId: "reverse-pec-deck", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact machine ID and setting system unknown" },

  { day: 2, externalPlanName: "Romanian deadlift", listedWorkSets: 4,
    canonicalExerciseId: "dumbbell-romanian-deadlift", mappingStatus: "reviewed_alias_candidate",
    equipmentGap: "external plan implement is ambiguous" },
  { day: 2, externalPlanName: "lying leg curl", listedWorkSets: 4,
    canonicalExerciseId: "lying-leg-curl", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact machine ID and increment unknown" },
  { day: 2, externalPlanName: "glute bridge", listedWorkSets: 4,
    canonicalExerciseId: "glute-bridge", mappingStatus: "exact_canonical_identity",
    equipmentGap: "external loading and support realization unknown" },
  { day: 2, externalPlanName: "split squat", listedWorkSets: 3,
    canonicalExerciseId: "split-squat", mappingStatus: "exact_canonical_identity",
    equipmentGap: "implement, side load, and support unknown" },
  { day: 2, externalPlanName: "hip adduction machine", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "machine not in catalog" },
  { day: 2, externalPlanName: "hip abduction machine", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "machine not in catalog" },

  { day: 3, externalPlanName: "pull-up or assisted pull-up", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap",
    equipmentGap: "pull-up identity and assistance realization unavailable" },
  { day: 3, externalPlanName: "lat pulldown", listedWorkSets: 4,
    canonicalExerciseId: "lat-pulldown", mappingStatus: "exact_canonical_identity",
    equipmentGap: "machine and stack realization unknown" },
  { day: 3, externalPlanName: "one-arm dumbbell row", listedWorkSets: 4,
    canonicalExerciseId: "one-arm-dumbbell-row", mappingStatus: "exact_canonical_identity",
    equipmentGap: "side-specific load and support unknown" },
  { day: 3, externalPlanName: "seated cable row", listedWorkSets: 4,
    canonicalExerciseId: "seated-cable-row", mappingStatus: "exact_canonical_identity",
    equipmentGap: "stack, ratio, and attachment unknown" },
  { day: 3, externalPlanName: "machine row", listedWorkSets: 4,
    canonicalExerciseId: "machine-row", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact machine identity unknown" },
  { day: 3, externalPlanName: "reverse pec deck rear delt", listedWorkSets: 3,
    canonicalExerciseId: "reverse-pec-deck", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "machine setting unknown" },

  { day: 4, externalPlanName: "hack squat", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "machine not in catalog" },
  { day: 4, externalPlanName: "leg press", listedWorkSets: 4,
    canonicalExerciseId: "leg-press", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact machine ID, load, support, and range unknown" },
  { day: 4, externalPlanName: "goblet squat", listedWorkSets: 4,
    canonicalExerciseId: "goblet-squat", mappingStatus: "exact_canonical_identity",
    equipmentGap: "dumbbell ceiling and increment unknown" },
  { day: 4, externalPlanName: "split squat quad bias", listedWorkSets: 4,
    canonicalExerciseId: "split-squat", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "support and range realization unknown" },
  { day: 4, externalPlanName: "leg extension", listedWorkSets: 3,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "identity not in catalog" },
  { day: 4, externalPlanName: "optional walking lunge", listedWorkSets: 3,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "identity not in catalog" },

  { day: 5, externalPlanName: "dumbbell curl", listedWorkSets: 4,
    canonicalExerciseId: "dumbbell-curl", mappingStatus: "exact_canonical_identity",
    equipmentGap: "load and increment unknown" },
  { day: 5, externalPlanName: "cable curl", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "identity not in catalog" },
  { day: 5, externalPlanName: "cable triceps pressdown", listedWorkSets: 4,
    canonicalExerciseId: "cable-triceps-pressdown", mappingStatus: "exact_canonical_identity",
    equipmentGap: "stack, ratio, and attachment unknown" },
  { day: 5, externalPlanName: "overhead cable triceps extension", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "identity not in catalog" },
  { day: 5, externalPlanName: "serratus cable press", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "ambiguous", equipmentGap: "identity and anchor unknown" },
  { day: 5, externalPlanName: "machine abdominal crunch", listedWorkSets: 4,
    canonicalExerciseId: "machine-abdominal-crunch", mappingStatus: "exact_canonical_identity",
    equipmentGap: "exact machine and setting unknown" },
  { day: 5, externalPlanName: "Pallof press", listedWorkSets: 4,
    canonicalExerciseId: "pallof-press", mappingStatus: "exact_canonical_identity",
    equipmentGap: "anchor, stack, and side load unknown" },

  { day: 6, externalPlanName: "chest-supported dumbbell row", listedWorkSets: 4,
    canonicalExerciseId: "chest-supported-dumbbell-row", mappingStatus: "exact_canonical_identity",
    equipmentGap: "bench and dumbbell realization unknown" },
  { day: 6, externalPlanName: "machine row back thickness", listedWorkSets: 5,
    canonicalExerciseId: "machine-row", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "exact machine identity unknown" },
  { day: 6, externalPlanName: "seated cable row back thickness", listedWorkSets: 5,
    canonicalExerciseId: "seated-cable-row", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "stack, ratio, and attachment unknown" },
  { day: 6, externalPlanName: "band row finish", listedWorkSets: 5,
    canonicalExerciseId: "band-row", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "band and anchor realization unknown" },
  { day: 6, externalPlanName: "standing calf raise", listedWorkSets: 4,
    canonicalExerciseId: "standing-calf-raise", mappingStatus: "exact_canonical_identity",
    equipmentGap: "loading realization unknown" },
  { day: 6, externalPlanName: "seated calf raise", listedWorkSets: 4,
    canonicalExerciseId: null, mappingStatus: "catalog_identity_gap", equipmentGap: "identity not in catalog" },
  { day: 6, externalPlanName: "lat pulldown finish", listedWorkSets: 4,
    canonicalExerciseId: "lat-pulldown", mappingStatus: "approved_same_identity_realization",
    equipmentGap: "machine and stack realization unknown" },
]);

const technique = (
  requestId: string,
  exerciseId: string,
  value: AdvancedIntensityTechniqueRequest["technique"],
): AdvancedIntensityTechniqueRequest => Object.freeze({
  contractReference: ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE,
  requestId,
  exerciseId,
  targetBlockId: `${requestId}:target-block`,
  technique: value,
  intendedPurpose: "hypertrophy_development",
  exactTrigger: null,
  loadRepetitionTransition: null,
  failureRelationship: "external plan request; exact trigger unresolved",
  volumeRelationship: "not flattened into ordinary sets",
  source: "coach",
  reviewStatus: "athlete_authored_unreviewed",
  provenance: Object.freeze([{ source: "athlete_report" as const,
    sourceRef: "sanitized-owner-plan" }]),
});

export const ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE = Object.freeze({
  contractReference: ADVANCED_BODYBUILDER_CHALLENGE_REFERENCE,
  authority: Object.freeze({
    athleteAuthoredPreferenceEvidence: true,
    testFixtureOnly: true,
    completedPerformance: false,
    clinicalDiagnosis: false,
    productRuntimeInput: false,
    prescriptionPolicy: false,
  }),
  athleteContext: Object.freeze({
    resistanceTrainingYears: Object.freeze({ min: 20, max: null }),
    coarseExperience: "advanced" as const,
    orientation: "bodybuilding_classic_physique",
    primaryOutcome: "hypertrophy" as const,
    secondaryInterests: Object.freeze(["strength", "posture_and_movement_quality"] as const),
    resistanceTrainingOpportunities: 6,
    externalRecoveryMobilityPosingOpportunities: 1,
    environmentLabel: "commercial_gym" as const,
    exactMachineInventoryConfirmed: false,
    exactWorkingLoadsSupplied: false,
    exactLoadIncrementsSupplied: false,
    sessionMinutesSupplied: false,
    completedHabitualExposureInV2Lineage: false,
    stableAnchorsAreStrongPreferenceEvidence: true,
  }),
  physiquePriorities: Object.freeze([
    "upper_chest", "side_delts", "lower_lat_sweep", "back_thickness",
    "hamstrings_glute_ham_tie_in", "glutes", "adductors", "quad_sweep",
    "calves", "serratus_waist_control", "posing_skill",
  ]),
  nonDiagnosticMovementHypotheses: Object.freeze([
    "pelvis_rib_shoulder_organization", "one_sided_hip_pelvis_asymmetry",
    "rib_cage_rotation_or_flare", "serratus_leverage",
    "front_shoulder_internal_rotation_or_anterior_glide_bias",
  ]),
  exercises,
  recurringRituals: Object.freeze([
    "90/90 hip lift with ball squeeze",
    "wall serratus reach",
    "half-kneeling hip-flexor reset",
  ]),
  representativeRamp: Object.freeze({ exercise: "low-incline dumbbell press",
    requestedRepetitions: Object.freeze([15, 10, 6]), developmentalCredit: false,
    universalThreeRampRule: false }),
  intensityTechniqueRequests: Object.freeze([
    technique("challenge-technique-post-failure", "dumbbell-lateral-raise", "post_failure_partials"),
    technique("challenge-technique-lengthened", "lying-leg-curl", "lengthened_partials"),
    technique("challenge-technique-drop", "cable-triceps-pressdown", "drop_set"),
    technique("challenge-technique-isometric", "standing-calf-raise", "isometric_finish"),
  ]),
  calendarProgressionDraft: Object.freeze([
    "week_1_positions_2_rir", "week_2_add_repetitions", "week_3_add_load_main",
    "week_4_push_isolations", "automatic_4_to_5_day_deload_or_40_percent_volume_reduction",
  ]),
  externalActivities: Object.freeze([
    Object.freeze({ activity: "posing", minutes: "20-30", recoveryClaimed: false }),
    Object.freeze({ activity: "easy_walking", minutes: "30-45", recoveryClaimed: false }),
    Object.freeze({ activity: "mobility", minutes: "unknown", recoveryClaimed: false }),
  ]),
  productOutputCount: 0,
  diagnosisCount: 0,
  fuzzyMatchCount: 0,
});

export const ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT = exercises.reduce(
  (total, exercise) => total + exercise.listedWorkSets,
  0,
);

export const ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS = Object.freeze(
  Object.fromEntries([
    "exact_canonical_identity",
    "approved_same_identity_realization",
    "reviewed_alias_candidate",
    "catalog_identity_gap",
    "equipment_only_gap",
    "unsupported_intensity_technique_gap",
    "ambiguous",
  ].map((status) => [status, exercises.filter((entry) => entry.mappingStatus === status).length])),
);
