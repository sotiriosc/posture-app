import type { EquipmentRequirement, MachineId } from "../domain/equipment";
import type {
  ExerciseDefinition,
  ExerciseActionFunction,
  ExerciseActionFunctionAnnotation,
  ExerciseDemandAnnotation,
  ExerciseDemandAnnotationLevel,
  ExerciseMechanicsProfile,
  ExerciseMechanicsReviewStatus,
  ExerciseMuscleContribution,
  ExercisePhaseAnnotationReviewStatus,
  ExercisePhaseSuitabilityAnnotation,
  ExerciseStressAnnotation,
  ExerciseStressExposureScope,
  ExerciseStressSideScope,
  ExerciseSuitability,
  ExerciseTransitionClassification,
  ExerciseTransitionDirection,
  ExerciseTransitionPurpose,
  ExerciseTransitionRelationship,
  ScapularMechanicsProfile,
  TrunkFunctionAnnotation,
  TrunkFunctionLevel,
  TrunkMechanicsFunction,
  TrunkMechanicsProfile,
} from "../domain/exercise";
import type { PhaseId } from "../domain/phase";
import type { JointStressTag } from "../domain/primitives";
import type { SessionSection, TrainingRole } from "../domain/session";

const excellent = (reason: string): ExerciseSuitability => ({ suitability: "excellent", reason });
const good = (reason: string): ExerciseSuitability => ({ suitability: "good", reason });
const possible = (reason: string): ExerciseSuitability => ({ suitability: "possible", reason });

const bodyweight: EquipmentRequirement = {
  id: "bodyweight-floor",
  label: "Bodyweight with floor space",
  allOf: ["bodyweight", "floor_space"],
};

const wall: EquipmentRequirement = {
  id: "wall-support",
  label: "Wall support",
  allOf: ["wall"],
};

const dumbbells: EquipmentRequirement = {
  id: "dumbbells",
  label: "Dumbbells",
  allOf: ["dumbbells"],
};

const bench: EquipmentRequirement = {
  id: "stable-bench",
  label: "Stable flat or adjustable bench",
  oneOf: ["flat_bench", "adjustable_bench"],
};

const cable: EquipmentRequirement = {
  id: "cable-stack",
  label: "Cable stack",
  allOf: ["cable_stack"],
};

const highCable: EquipmentRequirement = {
  id: "high-cable-stack",
  label: "Cable stack with high anchor",
  allOf: ["cable_stack", "cable_anchor_high", "floor_space"],
};

const farmerCarryEquipment: EquipmentRequirement = {
  id: "farmer-carry-equipment",
  label: "Dumbbell pair and loaded gait space",
  allOf: ["dumbbell_pair", "loaded_gait_space", "stable_loaded_standing_space"],
};

const suitcaseCarryEquipment: EquipmentRequirement = {
  id: "suitcase-carry-equipment",
  label: "One dumbbell and loaded gait space",
  allOf: ["dumbbells", "loaded_gait_space", "stable_loaded_standing_space"],
};

const supportedMarchEquipment: EquipmentRequirement = {
  id: "wall-supported-suitcase-march-equipment",
  label: "One dumbbell, wall, and stable standing space",
  allOf: ["dumbbells", "wall", "stable_loaded_standing_space"],
};

const machine = (id: MachineId, label: string): EquipmentRequirement => ({
  id: `machine-${id}`,
  label,
  allOf: ["selectorized_machine"],
  machineIds: [id],
});

const anchoredBand = (height: "low" | "mid" | "high"): EquipmentRequirement => ({
  id: `anchored-band-${height}`,
  label: `Band with ${height} anchor`,
  allOf: ["tube_band", `band_anchor_${height}`],
});

const loopBand: EquipmentRequirement = {
  id: "loop-band",
  label: "Loop or mini-loop band",
  allOf: ["loop_band"],
};

function sections(values: Partial<Record<SessionSection, ExerciseSuitability>>) {
  return values;
}

function demand(
  level: ExerciseDemandAnnotationLevel,
  notes: string,
  input: {
    readonly source?: ExerciseDemandAnnotation["source"];
    readonly reviewStatus?: ExerciseMechanicsReviewStatus;
  } = {},
): ExerciseDemandAnnotation {
  return {
    level,
    source: input.source ?? (level === "unknown" ? "unknown" : "reference_catalog"),
    reviewStatus: input.reviewStatus ?? (level === "unknown" ? "needs_review" : "accepted"),
    notes,
  };
}

function unknownDemand(notes = "Reference catalog has not explicitly reviewed this demand."): ExerciseDemandAnnotation {
  return demand("unknown", notes, { source: "unknown", reviewStatus: "needs_review" });
}

const TRUNK_MECHANICS_OWNER_DECISION_REF =
  "docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche";
const PHASE_OWNER_DECISION_REF =
  "docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-current-contextual-phase-annotations";
const PHASE_ACTIVATION_OWNER_DECISION_REF =
  "docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#contextual-phase-activation-finalization";
const SEVEN_PHASE_OWNER_DECISION_REF =
  "docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-seven-row-contextual-phase-annotations";
const STRESS_OWNER_DECISION_REF =
  "docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions";
const OWNER_REVIEWED_AT = "2026-08-12T00:00:00-04:00";
const ROLE_MUSCLE_OWNER_DECISION_REF =
  "docs/training-engine-v2/ROLE_AND_MUSCLE_CONTRIBUTION_CONTRACT.md#production-catalog-migration";

function contributions(input: {
  readonly primary: readonly ExerciseMuscleContribution["muscle"][];
  readonly keySecondary?: readonly ExerciseMuscleContribution["muscle"][];
  readonly incidental?: readonly ExerciseMuscleContribution["muscle"][];
  readonly contextual?: readonly ExerciseMuscleContribution["muscle"][];
}): readonly ExerciseMuscleContribution[] {
  const entries = [
    ...input.primary.map((muscle) => ({ muscle, relationship: "primary_target" as const })),
    ...(input.keySecondary ?? []).map((muscle) => ({ muscle, relationship: "key_secondary_target" as const })),
    ...(input.incidental ?? []).map((muscle) => ({ muscle, relationship: "incidental_contributor" as const })),
    ...(input.contextual ?? []).map((muscle) => ({ muscle, relationship: "stabilizer_or_contextual_contributor" as const })),
  ];
  return entries.map(({ muscle, relationship }) => ({
    muscle,
    relationship,
    reviewStatus: "accepted",
    provenance: [{
      source: "owner_decision",
      sourceRef: ROLE_MUSCLE_OWNER_DECISION_REF,
      evidenceBasis: [`Owner-reviewed ${relationship} classification for ${muscle}.`],
    }],
    notes: `${muscle} is classified as ${relationship.replaceAll("_", " ")} for this exercise identity.`,
  }));
}

function actions(...values: readonly ExerciseActionFunction[]): readonly ExerciseActionFunctionAnnotation[] {
  return values.map((action) => ({
    action,
    reviewStatus: "accepted",
    provenance: [{
      source: "owner_decision",
      sourceRef: ROLE_MUSCLE_OWNER_DECISION_REF,
      evidenceBasis: [`Owner-reviewed ${action} action/function assignment.`],
    }],
    notes: `${action.replaceAll("_", " ")} is a direct selection function for this exercise.`,
  }));
}

type CanonicalExerciseDefinition = Omit<
  ExerciseDefinition,
  "actionFunctions" | "primaryMuscles" | "secondaryMuscles"
> & {
  readonly actionFunctions?: readonly ExerciseActionFunctionAnnotation[];
};

function defineExercise(input: CanonicalExerciseDefinition): ExerciseDefinition {
  return {
    ...input,
    actionFunctions: input.actionFunctions ?? [],
    primaryMuscles: input.muscleContributions
      .filter((entry) => entry.relationship === "primary_target")
      .map((entry) => entry.muscle),
    secondaryMuscles: input.muscleContributions
      .filter((entry) => entry.relationship === "key_secondary_target")
      .map((entry) => entry.muscle),
  };
}

function ownerPhaseAnnotation(input: {
  readonly annotationId: string;
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly suitability: ExerciseSuitability["suitability"];
  readonly reason: string;
  readonly reviewStatus: ExercisePhaseAnnotationReviewStatus;
  readonly sourceRef?: string;
  readonly trainingRoles?: readonly TrainingRole[];
  readonly sessionSections?: readonly SessionSection[];
  readonly legalUseCoverage?: {
    readonly trainingRoles: readonly TrainingRole[];
    readonly sessionSections: readonly SessionSection[];
  };
}): ExercisePhaseSuitabilityAnnotation {
  return {
    annotationId: input.annotationId,
    exerciseId: input.exerciseId,
    phaseId: input.phaseId,
    suitability: input.suitability,
    scope: {
      ...(input.trainingRoles ? { trainingRoles: input.trainingRoles } : {}),
      ...(input.sessionSections ? { sessionSections: input.sessionSections } : {}),
    },
    reason: input.reason,
    reviewStatus: input.reviewStatus,
    provenance: {
      sourceType: "owner_decision",
      sourceRef: input.sourceRef ?? PHASE_OWNER_DECISION_REF,
      evidenceBasis: [
        input.reason,
        "Owner disposition applies the selected contextual phase policy to the reviewed role/section scope.",
      ],
      reviewerId: "sotiriosc",
      reviewedAt: OWNER_REVIEWED_AT,
      ...(input.legalUseCoverage
        ? { legalUseCoverage: input.legalUseCoverage }
        : {}),
    },
  };
}

function ownerStressAnnotation(input: {
  readonly tag: JointStressTag;
  readonly exposureScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly notes: string;
  readonly reviewStatus?: ExerciseStressAnnotation["reviewStatus"];
}): ExerciseStressAnnotation {
  return {
    tag: input.tag,
    source: "joint_stress",
    exposureScope: input.exposureScope,
    sideScope: input.sideScope,
    reviewStatus: input.reviewStatus ?? "accepted",
    provenance: [
      {
        source: "owner_decision",
        sourceRef: STRESS_OWNER_DECISION_REF,
        evidenceBasis: [input.notes],
      },
    ],
    notes: input.notes,
  };
}

function reviewedSevenRowTrunkFunction(
  level: Exclude<TrunkFunctionLevel, "unknown">,
  evidenceBasis: readonly string[],
  notes: string,
): TrunkFunctionAnnotation {
  return {
    level,
    reviewStatus: "accepted",
    source: "human_exercise_science_review",
    provenance: [
      {
        sourceRef: STRESS_OWNER_DECISION_REF,
        evidenceBasis,
      },
    ],
    notes,
  };
}

function reviewedSevenRowTrunkMechanics(
  input: Partial<Record<TrunkMechanicsFunction, {
    readonly level: Exclude<TrunkFunctionLevel, "unknown">;
    readonly notes: string;
  }>>,
): TrunkMechanicsProfile {
  const value = (functionName: TrunkMechanicsFunction): TrunkFunctionAnnotation => {
    const reviewed = input[functionName];
    return reviewed
      ? reviewedSevenRowTrunkFunction(
          reviewed.level,
          [reviewed.notes],
          reviewed.notes,
        )
      : unknownTrunkFunction(
          `${functionName} remains unknown for this production identity.`,
        );
  };

  return {
    breathingPressureCoordination: value("breathingPressureCoordination"),
    antiExtensionContribution: value("antiExtensionContribution"),
    antiRotationContribution: value("antiRotationContribution"),
    antiLateralFlexionContribution: value("antiLateralFlexionContribution"),
    controlledFlexionContribution: value("controlledFlexionContribution"),
    controlledRotationContribution: value("controlledRotationContribution"),
    loadedBracingContribution: value("loadedBracingContribution"),
    gaitLoadTransferContribution: value("gaitLoadTransferContribution"),
  };
}

function reviewedTrunkFunction(
  level: Exclude<TrunkFunctionLevel, "unknown">,
  evidenceBasis: readonly string[],
  notes: string,
): TrunkFunctionAnnotation {
  return {
    level,
    reviewStatus: "accepted",
    source: "human_exercise_science_review",
    provenance: [
      {
        sourceRef: TRUNK_MECHANICS_OWNER_DECISION_REF,
        evidenceBasis,
      },
    ],
    notes,
  };
}

function unknownTrunkFunction(notes: string): TrunkFunctionAnnotation {
  return {
    level: "unknown",
    reviewStatus: "needs_review",
    source: "unknown",
    provenance: [],
    notes,
  };
}

const defaultDemands = {
  trunk_control: unknownDemand(),
  scapular_control: unknownDemand(),
  stability: unknownDemand(),
  coordination: unknownDemand(),
  range: unknownDemand(),
  joint_control: unknownDemand(),
} satisfies ExerciseMechanicsProfile["demands"];

function mechanics(input: {
  readonly support?: ExerciseMechanicsProfile["support"];
  readonly resistancePath?: ExerciseMechanicsProfile["resistancePath"];
  readonly demands?: Partial<ExerciseMechanicsProfile["demands"]>;
  readonly scapularMechanics?: ScapularMechanicsProfile;
  readonly trunkMechanics?: TrunkMechanicsProfile;
}): ExerciseMechanicsProfile {
  return {
    support: input.support ?? {
      basePosition: "unknown",
      stance: "unknown",
      orientation: "unknown",
      supportContacts: [],
      supportAmount: "unknown",
      supportRelationship: "unknown",
      reviewStatus: "needs_review",
      notes: "Support mechanics not yet reviewed.",
    },
    resistancePath: input.resistancePath,
    demands: {
      ...defaultDemands,
      ...input.demands,
    },
    scapularMechanics: input.scapularMechanics,
    ...(input.trunkMechanics ? { trunkMechanics: input.trunkMechanics } : {}),
  };
}

function scapularMechanics(input: Partial<ScapularMechanicsProfile>): ScapularMechanicsProfile {
  return {
    serratusContribution: input.serratusContribution ?? unknownDemand("Serratus contribution needs review."),
    upwardRotationControl: input.upwardRotationControl ?? unknownDemand("Upward-rotation relevance needs review."),
    retractionDemand: input.retractionDemand ?? unknownDemand("Retraction demand needs review."),
    externalRotationContribution:
      input.externalRotationContribution ?? unknownDemand("External-rotation/cuff contribution needs review."),
    loadedScapularControl: input.loadedScapularControl ?? unknownDemand("Loaded scapular-control demand needs review."),
    preparationSuitability: input.preparationSuitability ?? "unknown",
    reviewStatus: input.reviewStatus ?? "needs_review",
    notes: input.notes ?? "Scapular mechanics annotation needs human exercise-science review.",
  };
}

function transition(input: {
  readonly targetExerciseId: string;
  readonly direction: ExerciseTransitionDirection;
  readonly classification: ExerciseTransitionClassification;
  readonly purposes: readonly ExerciseTransitionPurpose[];
  readonly notes: string;
  readonly reviewStatus?: ExerciseMechanicsReviewStatus;
  readonly provenance?: readonly string[];
}): ExerciseTransitionRelationship {
  return {
    targetExerciseId: input.targetExerciseId,
    direction: input.direction,
    classification: input.classification,
    purposes: input.purposes,
    reviewStatus:
      input.reviewStatus ??
      (input.classification === "developmental" || input.classification === "context_dependent"
        ? "accepted"
        : "needs_review"),
    notes: input.notes,
    provenance: input.provenance ?? ["migrated from legacy cross-exercise progression edge"],
  };
}

const REFERENCE_EXERCISE_DEFINITIONS = [
  {
    id: "ninety-ninety-breathing",
    name: "90/90 Breathing",
    summary: "Supine breathing drill for ribcage and pelvis position.",
    family: "breathing_reset",
    movementRoles: ["breathing_position", "anti_extension_core"],
    trainingRoles: ["preparation", "recovery"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["serratus"] }),
    bodyRegions: ["ribcage", "pelvis", "lumbar_spine"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      warmup: excellent("Prepares trunk position before loaded work."),
      cooldown: good("Supports down-regulation after training."),
    }),
    phaseSuitability: {
      phase_1: excellent("Directly supports control and position."),
      phase_2: good("Useful when assessment priorities remain relevant."),
      phase_3: possible("Useful as targeted preparation, not a main stimulus."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "ninety-ninety-breathing-phase-1-owner-approved",
        exerciseId: "ninety-ninety-breathing",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 position, control, and repeatable-technique development.",
        reviewStatus: "accepted",
        legalUseCoverage: {
          trainingRoles: ["preparation", "recovery"],
          sessionSections: ["warmup", "cooldown"],
        },
      }),
      ownerPhaseAnnotation({
        annotationId: "ninety-ninety-breathing-phase-2-owner-unknown",
        exerciseId: "ninety-ninety-breathing",
        phaseId: "phase_2",
        suitability: "good",
        reason: "No independent Phase 2 evidence is approved; assessment priority and preparation remain separate owners.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "none",
      loadingPotential: "low",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "supine",
        stance: "unknown",
        orientation: "supine",
        supportContacts: [
          { bodyRegion: "back", source: "floor", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Floor-supported breathing position with minimal external load.",
      },
      demands: {
        trunk_control: demand("low", "Low-load positional trunk control."),
        stability: demand("low", "Supine floor support keeps stability demand low."),
        coordination: demand("low", "Breathing and position coordination only."),
        range: demand("low", "No large joint range challenge."),
        joint_control: demand("low", "No meaningful joint-control loading."),
      },
      trunkMechanics: {
        breathingPressureCoordination: reviewedTrunkFunction(
          "high",
          [
            "movementRoles includes breathing_position.",
            "primaryMuscles includes trunk.",
            "trainingRoles include preparation and recovery.",
            "mechanics.support is accepted floor/supine.",
            "mechanics.demands.trunk_control is accepted low.",
            "Project-owner review approves breathing/pressure coordination as the central function expression.",
          ],
          "Owner-reviewed high breathing and pressure-coordination expression in a low-load supine position drill.",
        ),
        antiExtensionContribution: reviewedTrunkFunction(
          "low",
          [
            "movementRoles includes anti_extension_core.",
            "Floor-supported supine mechanics and low loading establish a low-load position-control context.",
            "mechanics.demands.trunk_control is accepted low.",
            "Project-owner review approves low anti-extension expression.",
          ],
          "Owner-reviewed low anti-extension contribution during supine position control.",
        ),
        antiRotationContribution: unknownTrunkFunction(
          "No approved evidence currently classifies anti-rotation expression for this supine breathing and position drill.",
        ),
        antiLateralFlexionContribution: unknownTrunkFunction(
          "No approved evidence currently classifies anti-lateral-flexion expression for this floor-supported breathing drill.",
        ),
        controlledFlexionContribution: unknownTrunkFunction(
          "No approved evidence currently classifies intentional controlled trunk-flexion expression for this exercise.",
        ),
        controlledRotationContribution: unknownTrunkFunction(
          "No approved evidence currently classifies intentional controlled trunk-rotation expression for this exercise.",
        ),
        loadedBracingContribution: reviewedTrunkFunction(
          "none",
          [
            "No external load is modeled for the exercise.",
            "mechanics.support is accepted floor/supine.",
            "loading.loadability is none.",
            "Project-owner review applies the loaded-bracing definition that requires meaningful trunk-position maintenance under external load.",
          ],
          "Owner-reviewed absence of loaded bracing in the unloaded floor-supported exercise definition.",
        ),
        gaitLoadTransferContribution: reviewedTrunkFunction(
          "none",
          [
            "mechanics.support is accepted floor/supine.",
            "The exercise has no stepping, marching, carrying, or locomotor movement role.",
            "Project-owner review confirms no meaningful gait or load-transfer expression.",
          ],
          "Owner-reviewed absence of gait or locomotor load transfer in the supine exercise definition.",
        ),
      },
    }),
    progression: {
      progressionAxes: ["tempo", "range"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dead-bug",
          direction: "progression",
          classification: "developmental",
          purposes: [
            "movement_pattern_development",
            "preparation_to_loaded_training",
            "increase_stability_demand",
            "increase_coordination_demand",
          ],
          notes: "Develops from low-load breathing/position control toward an anti-extension trunk drill; not a readiness or dosage guarantee.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Exhale fully", "Keep ribs stacked over pelvis"],
  },
  {
    id: "serratus-wall-slide",
    name: "Serratus Wall Slide",
    summary: "Wall-supported scapular upward-rotation and serratus control drill.",
    family: "scapular_preparation",
    movementRoles: ["scapular_control"],
    actionFunctions: actions("scapular_upward_rotation"),
    trainingRoles: ["activation", "preparation"],
    muscleContributions: contributions({ primary: ["serratus"], keySecondary: ["upper_back", "rotator_cuff"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [wall],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      warmup: good("Prepares shoulder mechanics for pressing."),
      activation: excellent("Targets scapular control before loaded push work."),
    }),
    phaseSuitability: {
      phase_1: excellent("Useful for control development."),
      phase_2: good("Useful as preparation before higher loading."),
      phase_3: possible("Useful when shoulder control remains a priority."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "serratus-wall-slide-phase-1-owner-approved",
        exerciseId: "serratus-wall-slide",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 scapular-position and control development.",
        reviewStatus: "accepted",
        legalUseCoverage: {
          trainingRoles: ["activation", "preparation"],
          sessionSections: ["warmup", "activation"],
        },
      }),
      ownerPhaseAnnotation({
        annotationId: "serratus-wall-slide-phase-2-warmup-owner-approved",
        exerciseId: "serratus-wall-slide",
        phaseId: "phase_2",
        suitability: "good",
        reason: "Supports preparation for progressively loaded upper-body training within the Phase 2 capacity context.",
        reviewStatus: "accepted",
        trainingRoles: ["preparation"],
        sessionSections: ["warmup"],
      }),
    ],
    loading: {
      loadability: "limited",
      loadingPotential: "low",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "moderate",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["overhead_pressing"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
          { bodyRegion: "hand", source: "wall", mode: "positioning", side: "bilateral", taskRole: "secondary" },
        ],
        supportAmount: "partial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Wall support constrains setup and reduces load demand.",
      },
      demands: {
        trunk_control: demand("low", "Rib control is relevant but not externally loaded."),
        scapular_control: demand("moderate", "Direct low-load scapular control drill."),
        stability: demand("low", "Wall-supported setup."),
        coordination: demand("moderate", "Requires coordinated upward reach without shrugging."),
        range: demand("moderate", "Shoulder elevation range is involved."),
        joint_control: demand("moderate", "Shoulder/scapular control is the target."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("high", "Primary serratus contribution in reference catalog."),
        upwardRotationControl: demand("high", "Modeled as upward-rotation/reach control."),
        retractionDemand: demand("low", "Not primarily a retraction exercise."),
        externalRotationContribution: demand("low", "Rotator cuff is secondary."),
        loadedScapularControl: demand("low", "Wall drill with low external loading."),
        preparationSuitability: "excellent",
        reviewStatus: "needs_review",
        notes: "Serratus/upward-rotation emphasis is plausible but should be reviewed.",
      }),
    }),
    progression: {
      progressionAxes: ["range", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "band-face-pull",
          direction: "progression",
          classification: "context_dependent",
          purposes: ["feature_shift", "preparation_to_loaded_training", "change_resistance_path"],
          notes: "General scapular-development transition that shifts from serratus/upward-rotation emphasis to band-loaded retraction/cuff emphasis.",
        }),
      ],
    },
    cautionStressTags: ["overhead_pressing"],
    contraindicatedStressTags: [],
    coachingFocus: ["Reach without shrugging", "Keep ribs quiet"],
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    summary: "Supine anti-extension core drill.",
    family: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["hip_adductors"] }),
    bodyRegions: ["lumbar_spine", "pelvis"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: excellent("Improves trunk control before lower or upper work."),
      accessory: good("Adds low-fatigue core practice."),
    }),
    phaseSuitability: {
      phase_1: excellent("Direct control exercise."),
      phase_2: good("Can progress with tempo or range."),
      phase_3: possible("Useful for targeted trunk control."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "dead-bug-phase-1-owner-approved",
        exerciseId: "dead-bug",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 trunk-position and repeatable-control development.",
        reviewStatus: "accepted",
        legalUseCoverage: {
          trainingRoles: ["activation", "hypertrophy_accessory"],
          sessionSections: ["activation", "accessory"],
        },
      }),
    ],
    loading: {
      loadability: "limited",
      loadingPotential: "low",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "long_lever_core",
        exposureScope: "variant_dependent",
        sideScope: "side_neutral",
        notes: "Long-lever exposure is potential only and requires a realized reviewed lever variant.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "supine",
        stance: "unknown",
        orientation: "supine",
        supportContacts: [
          { bodyRegion: "back", source: "floor", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Supine floor support with long-lever progression options.",
      },
      demands: {
        trunk_control: demand("moderate", "Direct anti-extension control with low external load."),
        stability: demand("moderate", "Limb movement challenges trunk position."),
        coordination: demand("moderate", "Contralateral limb coordination."),
        range: demand("moderate", "Range can be scaled through limb reach."),
        joint_control: demand("low", "Low joint loading."),
      },
      trunkMechanics: {
        breathingPressureCoordination: unknownTrunkFunction(
          "The proposed moderate breathing/pressure value remains unapproved; no approved evidence currently classifies this function for Dead Bug.",
        ),
        antiExtensionContribution: reviewedTrunkFunction(
          "high",
          [
            "movementRoles includes anti_extension_core.",
            "primaryMuscles includes trunk.",
            "mechanics.demands.trunk_control is accepted moderate.",
            "family is core_control.",
            "Project-owner review approves anti-extension as the central function expression.",
          ],
          "Owner-reviewed high anti-extension contribution as the exercise's direct trunk-control purpose.",
        ),
        antiRotationContribution: unknownTrunkFunction(
          "Contralateral limb coordination is not approved as anti-rotation evidence, so this function remains unclassified.",
        ),
        antiLateralFlexionContribution: unknownTrunkFunction(
          "No approved evidence currently isolates anti-lateral-flexion expression during the supine limb-control task.",
        ),
        controlledFlexionContribution: unknownTrunkFunction(
          "No approved evidence currently classifies intentional controlled trunk flexion; anti-extension purpose does not establish reviewed absence.",
        ),
        controlledRotationContribution: unknownTrunkFunction(
          "No approved evidence currently classifies intentional controlled trunk rotation during Dead Bug execution.",
        ),
        loadedBracingContribution: reviewedTrunkFunction(
          "none",
          [
            "No external loading is modeled for the exercise.",
            "mechanics.support is accepted floor/supine.",
            "Project-owner review applies the loaded-bracing definition that requires meaningful trunk-position maintenance under external load.",
          ],
          "Owner-reviewed absence of loaded bracing in the unloaded supine exercise definition.",
        ),
        gaitLoadTransferContribution: reviewedTrunkFunction(
          "none",
          [
            "mechanics.support is accepted floor/supine.",
            "The exercise has no gait, stepping, marching, carrying, or locomotor purpose.",
            "Project-owner review confirms that contralateral supine limb motion is not gait/load-transfer expression.",
          ],
          "Owner-reviewed absence of gait or locomotor load transfer in the supine exercise definition.",
        ),
      },
    }),
    progression: {
      progressionAxes: ["range", "tempo", "complexity"],
      transitionRelationships: [
        transition({
          targetExerciseId: "pallof-press",
          direction: "progression",
          classification: "context_dependent",
          purposes: [
            "movement_pattern_development",
            "change_resistance_path",
            "increase_loadability",
          ],
          notes: "Can move from supine anti-extension toward standing anti-rotation when trunk-development context supports the role change.",
        }),
        transition({
          targetExerciseId: "ninety-ninety-breathing",
          direction: "regression",
          classification: "developmental",
          purposes: [
            "pain_or_tolerance_regression",
            "reduce_stability_demand",
            "reduce_coordination_demand",
            "movement_pattern_development",
          ],
          notes: "Regresses trunk-control exposure toward lower-load breathing/position work.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Move limbs without losing spine position"],
  },
  {
    id: "push-up",
    name: "Push-Up",
    summary: "Bodyweight horizontal push.",
    family: "upper_push",
    movementRoles: ["horizontal_push", "anti_extension_core"],
    trainingRoles: ["primary_strength", "secondary_strength", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["chest", "triceps"], keySecondary: ["front_delts"], contextual: ["trunk", "serratus"] }),
    bodyRegions: ["shoulder", "elbow", "wrist", "lumbar_spine"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [wall],
    prerequisites: [
      {
        id: "push-up-plank-control",
        type: "required_control",
        description: "Requires enough trunk and shoulder control to hold a plank-like position.",
      },
    ],
    sectionSuitability: sections({
      main: good("Can be a primary push stimulus when loadability fits."),
      accessory: good("Useful push volume with simple setup."),
    }),
    phaseSuitability: {
      phase_1: possible("Appropriate if supported or regressed."),
      phase_2: good("Good continuity exercise when progression remains available."),
      phase_3: possible("May need loading or variation for sufficient stimulus."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["horizontal_pressing", "wrist_extension_loading"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "long_lever_core",
        exposureScope: "variant_dependent",
        sideScope: "side_neutral",
        notes: "Long-lever trunk exposure depends on the realized support and lever variant.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "prone",
        stance: "bilateral",
        orientation: "prone",
        supportContacts: [
          { bodyRegion: "hand", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Hands-to-floor bodyweight press with plank-like trunk control.",
      },
      demands: {
        trunk_control: demand("moderate", "Push-up requires anti-extension plank control."),
        scapular_control: demand("moderate", "Scapular protraction/reach contributes to clean pressing."),
        stability: demand("moderate", "Bodyweight plank stability."),
        coordination: demand("low", "Simple press pattern once plank is controlled."),
        range: demand("moderate", "Pressing range can be scaled."),
        joint_control: demand("moderate", "Shoulder/wrist/elbow control under bodyweight."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("moderate", "Serratus is secondary in push-up mechanics."),
        upwardRotationControl: demand("low", "Horizontal press, not primary upward rotation."),
        retractionDemand: demand("low", "Not a retraction-focused exercise."),
        externalRotationContribution: demand("low", "Cuff contribution not explicit in current catalog."),
        loadedScapularControl: demand("moderate", "Scapula controls loaded bodyweight press."),
        preparationSuitability: "possible",
        reviewStatus: "needs_review",
        notes: "Push-up scapular control details need review before precision claims.",
      }),
    }),
    progression: {
      progressionAxes: ["reps", "sets", "tempo", "support_reduction"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dumbbell-bench-press",
          direction: "progression",
          classification: "context_dependent",
          purposes: [
            "increase_loadability",
            "increase_support",
            "change_resistance_path",
            "stimulus_shift",
          ],
          notes: "May increase external loadability but changes from bodyweight/floor support to bench-supported free implements.",
        }),
        transition({
          targetExerciseId: "machine-chest-press",
          direction: "regression",
          classification: "context_dependent",
          purposes: [
            "increase_support",
            "reduce_stability_demand",
            "pain_or_tolerance_regression",
          ],
          notes: "Can reduce free-body trunk/stability demands through a guided machine press when equipment and fit are appropriate.",
        }),
      ],
    },
    cautionStressTags: ["horizontal_pressing", "wrist_extension_loading"],
    contraindicatedStressTags: [],
    coachingFocus: ["Press the floor away", "Keep trunk organized"],
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    summary: "Bench-supported horizontal press with external loading.",
    family: "upper_push",
    movementRoles: ["horizontal_push"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["chest"], keySecondary: ["triceps", "front_delts"] }),
    bodyRegions: ["shoulder", "elbow"],
    equipmentRequirements: [dumbbells, bench],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Loadable supported horizontal push."),
      accessory: good("Can add chest volume when not the primary press."),
    }),
    phaseSuitability: {
      phase_1: possible("Can be used with light loading and support."),
      phase_2: excellent("Strong progression path."),
      phase_3: excellent("Excellent continuity candidate with load or volume progression."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: ["horizontal_pressing"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "supine",
        stance: "bilateral",
        orientation: "supine",
        supportContacts: [
          { bodyRegion: "back", source: "bench", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Bench-supported external-load horizontal press.",
      },
      demands: {
        trunk_control: demand("low", "Bench support limits trunk-control demand."),
        scapular_control: demand("moderate", "Scapular control matters for shoulder path under load."),
        stability: demand("moderate", "Dumbbells require shoulder and implement stability."),
        coordination: demand("moderate", "Independent dumbbells require bilateral coordination."),
        range: demand("moderate", "Pressing range must be controlled."),
        joint_control: demand("moderate", "Shoulder/elbow control under external load."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "machine-chest-press",
          direction: "regression",
          classification: "context_dependent",
          purposes: [
            "increase_support",
            "reduce_stability_demand",
            "reduce_coordination_demand",
            "pain_or_tolerance_regression",
          ],
          notes: "May regress toward a more guided press when free dumbbell stability or shoulder tolerance is limiting.",
        }),
        transition({
          targetExerciseId: "push-up",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["reduce_loadability", "equipment_transition", "change_resistance_path"],
          notes: "Can substitute bodyweight pressing when equipment or loading constraints matter, but it increases trunk/bodyweight support demands.",
        }),
      ],
    },
    cautionStressTags: ["horizontal_pressing"],
    contraindicatedStressTags: [],
    coachingFocus: ["Control the bottom range", "Press without shoulder glide"],
  },
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    summary: "Machine-guided horizontal press.",
    family: "upper_push",
    movementRoles: ["horizontal_push"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["chest"], keySecondary: ["triceps", "front_delts"] }),
    bodyRegions: ["shoulder", "elbow"],
    equipmentRequirements: [machine("chest_press", "Chest press machine")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: good("Guided pressing stimulus with low setup complexity."),
      accessory: good("Useful extra chest/triceps volume."),
    }),
    phaseSuitability: {
      phase_1: good("Support can reduce coordination demand."),
      phase_2: good("Load progression is clear."),
      phase_3: good("Useful when machine path fits the athlete."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: ["horizontal_pressing"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "back", source: "machine", mode: "positioning", side: "side_neutral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Machine path and seat support reduce free stability demand.",
      },
      demands: {
        trunk_control: demand("low", "Supported machine press has low trunk demand."),
        scapular_control: demand("low", "Guided path reduces scapular-control demand relative to free pressing."),
        stability: demand("low", "Machine support lowers stability demand."),
        coordination: demand("low", "Guided bilateral press."),
        range: demand("moderate", "Pressing range is still relevant."),
        joint_control: demand("moderate", "Shoulder/elbow path still needs fit."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dumbbell-bench-press",
          direction: "progression",
          classification: "developmental",
          purposes: [
            "reduce_support",
            "increase_stability_demand",
            "increase_coordination_demand",
            "change_resistance_path",
          ],
          notes: "Developmental option from guided machine pressing to free dumbbell pressing when stability/coordination development is intended.",
        }),
      ],
    },
    cautionStressTags: ["horizontal_pressing"],
    contraindicatedStressTags: [],
    coachingFocus: ["Set seat to comfortable shoulder path"],
  },
  {
    id: "cable-chest-fly",
    name: "Cable Chest Fly",
    summary: "Cable chest isolation with adjustable line of pull.",
    family: "upper_push",
    movementRoles: ["accessory"],
    actionFunctions: actions("shoulder_horizontal_adduction"),
    trainingRoles: ["hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["chest"], keySecondary: ["front_delts"] }),
    bodyRegions: ["shoulder"],
    equipmentRequirements: [cable],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Adds chest volume without duplicating a heavy press."),
    }),
    phaseSuitability: {
      phase_1: possible("Use cautiously if shoulder control is limited."),
      phase_2: good("Useful accessory volume."),
      phase_3: excellent("High-value hypertrophy accessory."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["horizontal_pressing", "shoulder_abduction_external_rotation"],
    },
    progression: {
      progressionAxes: ["reps", "sets", "tempo", "range"],
      transitionRelationships: [
        transition({
          targetExerciseId: "machine-chest-press",
          direction: "regression",
          classification: "needs_review",
          purposes: ["increase_loadability", "stimulus_shift", "equipment_transition"],
          notes: "Legacy edge changes from accessory isolation to a primary guided press; review before treating as a true regression.",
        }),
      ],
    },
    cautionStressTags: ["shoulder_abduction_external_rotation"],
    contraindicatedStressTags: [],
    coachingFocus: ["Keep range shoulder-friendly", "Move through chest, not front shoulder"],
  },
  {
    id: "chest-supported-dumbbell-row",
    name: "Chest-Supported Dumbbell Row",
    summary: "Bench-supported horizontal pull with low lumbar stabilization demand.",
    family: "upper_pull",
    movementRoles: ["horizontal_pull"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["mid_back", "lats"], keySecondary: ["rear_delts", "biceps"] }),
    bodyRegions: ["shoulder", "thoracic_spine", "lumbar_spine"],
    equipmentRequirements: [dumbbells, bench],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Loadable pull with support when low-back cost matters."),
      accessory: good("Useful upper-back volume."),
    }),
    phaseSuitability: {
      phase_1: good("Support reduces setup and trunk demand."),
      phase_2: excellent("Clear load progression."),
      phase_3: excellent("Strong continuity candidate."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["grip_intensive"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "prone",
        stance: "bilateral",
        orientation: "prone",
        supportContacts: [
          { bodyRegion: "chest", source: "bench", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Chest support intentionally reduces lumbar/trunk stabilization demand.",
      },
      resistancePath: {
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        lineOfPullAdjustability: "moderate",
        laterality: "bilateral_independent",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
        notes: "Dumbbells are independently controlled free implements; bench angle and athlete setup affect the row line without guaranteeing one universal elbow path.",
        provenance: [
          "equipmentRequirements: dumbbells + stable bench",
          "support profile: bench/chest_supported",
          "catalog identity: chest-supported dumbbell row",
        ],
      },
      demands: {
        trunk_control: demand("low", "Chest support keeps trunk-control demand low."),
        scapular_control: demand("moderate", "Horizontal pull needs scapular control but is externally supported."),
        stability: demand("low", "Bench support reduces stability demand."),
        coordination: demand("low", "Simple supported pull."),
        range: demand("moderate", "Scapular reach/retraction range is relevant."),
        joint_control: demand("moderate", "Shoulder/elbow control under load."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not a serratus-emphasis exercise."),
        upwardRotationControl: demand("low", "Horizontal row does not primarily train upward rotation."),
        retractionDemand: demand("moderate", "Rowing emphasizes scapular retraction/control."),
        externalRotationContribution: demand("low", "Cuff contribution is not primary in catalog."),
        loadedScapularControl: demand("moderate", "Loadable row with chest support."),
        preparationSuitability: "possible",
        reviewStatus: "needs_review",
        notes: "Retraction/loading emphasis should be reviewed.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "seated-cable-row",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["change_resistance_path", "equipment_transition", "stimulus_shift"],
          notes: "Moves from chest-supported free implements to a seated cable path; useful only when setup, equipment, or tolerance context supports the swap.",
        }),
      ],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Pull elbows toward hips", "Keep chest supported"],
  },
  {
    id: "one-arm-dumbbell-row",
    name: "One-Arm Dumbbell Row",
    summary: "Unsupported or lightly supported dumbbell horizontal pull with more trunk demand.",
    family: "upper_pull",
    movementRoles: ["horizontal_pull"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["mid_back", "lats"], keySecondary: ["rear_delts", "biceps"], contextual: ["trunk"] }),
    bodyRegions: ["shoulder", "thoracic_spine", "lumbar_spine", "hip"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [bench],
    prerequisites: [],
    sectionSuitability: sections({
      main: good("Loadable row when dumbbells are available and trunk demand is acceptable."),
      accessory: good("Useful upper-back volume with minimal setup."),
    }),
    phaseSuitability: {
      phase_1: possible("May need support and conservative loading."),
      phase_2: good("Progression-friendly home or gym row."),
      phase_3: excellent("Useful loadable pull when setup fits."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "high",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "moderate",
      jointStressTags: ["grip_intensive"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "loaded_hinge",
        exposureScope: "variant_dependent",
        sideScope: "prescription_side",
        notes: "Hinge exposure requires exact unsupported support, stance, and prescription realization; supported rows do not inherit it.",
        reviewStatus: "needs_review",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "unknown",
        orientation: "diagonal",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
          { bodyRegion: "hand", source: "bench", mode: "weight_bearing", side: "unknown", taskRole: "secondary" },
        ],
        supportAmount: "partial",
        supportRelationship: "unknown",
        reviewStatus: "accepted",
        notes: "Bench may support the free hand, but torso/trunk position remains athlete-controlled.",
      },
      resistancePath: {
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        lineOfPullAdjustability: "moderate",
        laterality: "unilateral",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
        notes: "One dumbbell creates a unilateral free-implement row with athlete-selected arm path and torso setup; trunk/stability demand remains modeled in existing demand/loading fields.",
        provenance: [
          "equipmentRequirements: dumbbells",
          "optionalEquipment: stable bench",
          "catalog identity: one-arm dumbbell row",
        ],
      },
      demands: {
        trunk_control: demand("high", "Unsupported torso position plus load creates high trunk-control demand."),
        scapular_control: demand("moderate", "Horizontal pull requires scapular control under load."),
        stability: demand("high", "Unilateral loaded row has high stability demand."),
        coordination: demand("moderate", "Unilateral pull with torso control."),
        range: demand("moderate", "Row range must be controlled."),
        joint_control: demand("moderate", "Shoulder/elbow and lumbar position control."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-focused."),
        upwardRotationControl: demand("low", "Not upward-rotation-focused."),
        retractionDemand: demand("moderate", "Rowing emphasizes retraction/control."),
        externalRotationContribution: demand("low", "External rotation not explicit in current catalog."),
        loadedScapularControl: demand("high", "Loaded unilateral row with trunk control demand."),
        preparationSuitability: "possible",
        reviewStatus: "needs_review",
        notes: "Loaded scapular-control demand should be reviewed.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "chest-supported-dumbbell-row",
          direction: "regression",
          classification: "developmental",
          purposes: [
            "increase_support",
            "reduce_stability_demand",
            "reduce_coordination_demand",
            "pain_or_tolerance_regression",
          ],
          notes: "Regresses unilateral unsupported rowing toward chest support and lower trunk/stability demand.",
        }),
        transition({
          targetExerciseId: "seated-cable-row",
          direction: "regression",
          classification: "context_dependent",
          purposes: [
            "increase_support",
            "reduce_stability_demand",
            "change_resistance_path",
            "equipment_transition",
          ],
          notes: "Can reduce unilateral/free-implement demands through a seated cable setup, but line of pull and setup remain context dependent.",
        }),
      ],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Support as needed", "Keep torso position steady"],
  },
  {
    id: "machine-row",
    name: "Machine Row",
    summary: "Machine-based horizontal pull with machine-specific path and fit constraints.",
    family: "upper_pull",
    movementRoles: ["horizontal_pull"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["mid_back", "lats"], keySecondary: ["rear_delts", "biceps"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [machine("row", "Row machine")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Stable and loadable horizontal pull."),
      accessory: good("Useful back volume when machine fit is good."),
    }),
    phaseSuitability: {
      phase_1: good("Guided setup can reduce coordination demand."),
      phase_2: excellent("Clear load progression."),
      phase_3: good("Strong stimulus if the machine path fits the athlete."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "machine-row-phase-3-owner-unknown",
        exerciseId: "machine-row",
        phaseId: "phase_3",
        suitability: "good",
        reason: "No independent Phase 3 evidence is approved beyond machine path, loadability, and stimulus owners.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["grip_intensive"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "needs_review",
        notes: "Generic machine-row identity implies machine support but does not guarantee chest support, grip, exact path, or anthropometric fit.",
      },
      resistancePath: {
        resistancePath: "machine_guided",
        trajectoryFreedom: "low",
        lineOfPullAdjustability: "unknown",
        laterality: "unknown",
        fitDependency: "machine_geometry",
        reviewStatus: "needs_review",
        notes: "Row-machine resistance is guided, but generic catalog identity does not identify the commercial machine, convergence/divergence, grip, line of pull, or athlete fit.",
        provenance: [
          "equipmentRequirements: selectorized row machine",
          "catalog identity: generic machine row",
          "machine-specific path and fit require context before selection preference",
        ],
      },
      demands: {
        trunk_control: demand("low", "Machine support keeps trunk-control demand low."),
        scapular_control: demand("moderate", "Horizontal pulling still needs scapular control."),
        stability: demand("low", "Machine path and support lower stability demand."),
        coordination: demand("low", "Guided row pattern."),
        range: demand("moderate", "Scapular reach/retraction range is relevant."),
        joint_control: demand("moderate", "Shoulder/elbow control under load."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-emphasis."),
        upwardRotationControl: demand("low", "Not upward-rotation-emphasis."),
        retractionDemand: demand("moderate", "Rowing emphasizes retraction/control."),
        externalRotationContribution: demand("low", "External rotation not explicit."),
        loadedScapularControl: demand("moderate", "Loadable machine row."),
        preparationSuitability: "possible",
        reviewStatus: "needs_review",
        notes: "Machine-specific scapular path needs review.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "chest-supported-dumbbell-row",
          direction: "progression",
          classification: "context_dependent",
          purposes: ["change_resistance_path", "equipment_transition", "stimulus_shift"],
          notes: "Changes from generic machine-guided row mechanics to chest-supported free implements; not universally harder or better.",
        }),
        transition({
          targetExerciseId: "band-row",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["reduce_loadability", "change_resistance_path", "equipment_transition"],
          notes: "May regress equipment/loading demands from machine to band resistance when machine access or tolerance changes.",
        }),
        transition({
          targetExerciseId: "seated-cable-row",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["change_resistance_path", "equipment_transition", "stimulus_shift"],
          notes: "Machine-to-cable row transition changes path and setup; classify as contextual rather than a universal regression.",
        }),
      ],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Set pad height cleanly", "Pull without neck tension"],
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    summary: "Cable-anchored horizontal pull with setup-dependent line of pull.",
    family: "upper_pull",
    movementRoles: ["horizontal_pull"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["mid_back", "lats"], keySecondary: ["biceps", "rear_delts"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [cable],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Stable loadable horizontal pull."),
      accessory: good("Works well as supplemental pull volume."),
    }),
    phaseSuitability: {
      phase_1: good("Predictable path and setup."),
      phase_2: excellent("Progression-friendly."),
      phase_3: good("Useful when cable station is practical."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "seated-cable-row-phase-3-owner-unknown",
        exerciseId: "seated-cable-row",
        phaseId: "phase_3",
        suitability: "good",
        reason: "No independent Phase 3 evidence is approved beyond equipment, setup, and progression owners.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["grip_intensive"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "seat", source: "bench", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Seated cable setup with stable lower-body support.",
      },
      resistancePath: {
        resistancePath: "cable_anchored",
        trajectoryFreedom: "moderate",
        lineOfPullAdjustability: "moderate",
        laterality: "bilateral_linked",
        fitDependency: "setup_geometry",
        reviewStatus: "needs_review",
        notes: "Cable anchor makes resistance setup-dependent; attachment, pulley geometry, grip, and exact line of pull can vary across cable stations.",
        provenance: [
          "equipmentRequirements: cable stack",
          "support profile: cable_or_band_anchor/seated_supported",
          "attachment and pulley geometry remain setup-dependent",
        ],
      },
      demands: {
        trunk_control: demand("low", "Seated stable setup keeps trunk-control demand low to moderate."),
        scapular_control: demand("moderate", "Scapular control is relevant to reach and finish."),
        stability: demand("low", "Stable seated setup."),
        coordination: demand("low", "Simple bilateral pull pattern."),
        range: demand("moderate", "Reach/row range is relevant."),
        joint_control: demand("moderate", "Shoulder/elbow path under load."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-emphasis."),
        upwardRotationControl: demand("low", "Not upward-rotation-emphasis."),
        retractionDemand: demand("moderate", "Rowing emphasizes retraction/control."),
        externalRotationContribution: demand("low", "External rotation not explicit."),
        loadedScapularControl: demand("moderate", "Loadable cable row."),
        preparationSuitability: "possible",
        reviewStatus: "needs_review",
        notes: "Cable row scapular mechanics need review.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "chest-supported-dumbbell-row",
          direction: "progression",
          classification: "context_dependent",
          purposes: ["change_resistance_path", "equipment_transition", "stimulus_shift"],
          notes: "Cable-to-chest-supported dumbbell row changes resistance path, laterality, and setup; do not rank it universally.",
        }),
        transition({
          targetExerciseId: "band-row",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["reduce_loadability", "change_resistance_path", "equipment_transition"],
          notes: "May regress cable loading/setup toward band resistance when equipment or tolerance requires it.",
        }),
      ],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Own the reach", "Finish with shoulder blades moving cleanly"],
  },
  {
    id: "band-row",
    name: "Band Row",
    summary: "Anchored-band horizontal pull.",
    family: "upper_pull",
    movementRoles: ["horizontal_pull"],
    trainingRoles: ["activation", "hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["mid_back", "lats"], keySecondary: ["biceps", "rear_delts"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [anchoredBand("mid")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: good("Rehearses scapular mechanics."),
      accessory: good("Simple pulling volume with bands."),
    }),
    phaseSuitability: {
      phase_1: excellent("Accessible row pattern when anchor is available."),
      phase_2: good("Useful when load needs are modest."),
      phase_3: possible("May be limited by loading potential."),
    },
    loading: {
      loadability: "limited",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Anchored band provides resistance but not body support.",
      },
      demands: {
        trunk_control: demand("low", "Low-load row with modest trunk demand."),
        scapular_control: demand("low", "Accessible scapular exposure without heavy loading."),
        stability: demand("low", "Low external load and simple setup."),
        coordination: demand("low", "Simple band pull."),
        range: demand("moderate", "Row reach/retraction range is relevant."),
        joint_control: demand("low", "Low joint loading."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-emphasis."),
        upwardRotationControl: demand("low", "Not upward-rotation-emphasis."),
        retractionDemand: demand("moderate", "Band row rehearses retraction/control."),
        externalRotationContribution: demand("low", "External rotation not explicit."),
        loadedScapularControl: demand("low", "Band loading is limited."),
        preparationSuitability: "good",
        reviewStatus: "needs_review",
        notes: "Band row is preparation-friendly but exact scapular emphasis needs review.",
      }),
    }),
    progression: {
      progressionAxes: ["reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "seated-cable-row",
          direction: "progression",
          classification: "developmental",
          purposes: ["increase_loadability", "change_resistance_path", "equipment_transition"],
          notes: "Moves from anchored band resistance toward cable loading when equipment access and target stimulus support it.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Anchor securely", "Pull without rib flare"],
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    summary: "External-load vertical push.",
    family: "upper_push",
    movementRoles: ["vertical_push"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["front_delts", "triceps"], keySecondary: ["side_delts"], contextual: ["trunk"] }),
    bodyRegions: ["shoulder", "elbow", "lumbar_spine"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [bench],
    prerequisites: [
      {
        id: "overhead-control",
        type: "required_control",
        description: "Requires shoulder control through the intended overhead range.",
      },
    ],
    sectionSuitability: sections({
      main: good("Loadable vertical push if shoulder range and control fit."),
      accessory: good("Useful delt/triceps strength work."),
    }),
    phaseSuitability: {
      phase_1: possible("Usually requires review of range and support."),
      phase_2: good("Useful if overhead control is established."),
      phase_3: excellent("Strong loadability for vertical push stimulus."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "moderate",
      axialLoading: "moderate",
      jointStressTags: ["overhead_pressing"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "heavy_axial_loading",
        exposureScope: "dose_created",
        sideScope: "bilateral_or_systemic",
        notes: "Heavy axial exposure requires explicit reviewed realized-dose authority and is not implied by shoulder-press identity.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "External-load overhead press without fixed path unless bench is optionally used.",
      },
      demands: {
        trunk_control: demand("moderate", "Overhead loading can demand trunk position control."),
        scapular_control: demand("high", "Overhead press requires scapular upward rotation/control."),
        stability: demand("moderate", "Dumbbell overhead stability demand."),
        coordination: demand("moderate", "Coordinated overhead press."),
        range: demand("high", "Overhead shoulder range is central."),
        joint_control: demand("high", "Shoulder/scapular control under overhead load."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("moderate", "Serratus contribution likely relevant."),
        upwardRotationControl: demand("high", "Overhead pressing requires upward rotation."),
        retractionDemand: demand("low", "Not retraction-focused."),
        externalRotationContribution: demand("moderate", "Cuff contribution likely relevant."),
        loadedScapularControl: demand("high", "Loaded overhead scapular control."),
        preparationSuitability: "poor",
        reviewStatus: "needs_review",
        notes: "Overhead press scapular demands should be reviewed.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "serratus-wall-slide",
          direction: "regression",
          classification: "developmental",
          purposes: [
            "reduce_loadability",
            "reduce_stability_demand",
            "preparation_to_loaded_training",
            "pain_or_tolerance_regression",
          ],
          notes: "Regresses loaded overhead pressing toward a lower-load wall-supported scapular drill.",
        }),
      ],
    },
    cautionStressTags: ["overhead_pressing"],
    contraindicatedStressTags: [],
    coachingFocus: ["Press in pain-free range", "Avoid leaning back"],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    summary: "Machine/cable vertical pull.",
    family: "upper_pull",
    movementRoles: ["vertical_pull"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["lats"], keySecondary: ["mid_back", "biceps"] }),
    bodyRegions: ["shoulder", "elbow"],
    equipmentRequirements: [machine("lat_pulldown", "Lat pulldown station")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Loadable vertical pull with stable setup."),
      accessory: good("Complements horizontal pull exposure."),
    }),
    phaseSuitability: {
      phase_1: good("Stable path can support skill acquisition."),
      phase_2: excellent("Clear progression route."),
      phase_3: excellent("High-value back stimulus."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["grip_intensive"],
    },
    progression: {
      progressionAxes: ["load", "reps", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "band-lat-pulldown",
          direction: "regression",
          classification: "developmental",
          purposes: ["reduce_loadability", "change_resistance_path", "equipment_transition"],
          notes: "Regresses vertical pulling from machine/cable station loading to anchored band resistance.",
        }),
      ],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Pull elbows down", "Avoid neck tension"],
  },
  {
    id: "band-lat-pulldown",
    name: "Band Lat Pulldown",
    summary: "High-anchor band vertical pull.",
    family: "upper_pull",
    movementRoles: ["vertical_pull"],
    trainingRoles: ["activation", "hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["lats"], keySecondary: ["biceps", "mid_back"] }),
    bodyRegions: ["shoulder", "elbow"],
    equipmentRequirements: [anchoredBand("high")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: good("Can prepare lats and scapular depression."),
      accessory: good("Useful vertical pull exposure when load needs are modest."),
    }),
    phaseSuitability: {
      phase_1: good("Accessible vertical pull pattern if anchor exists."),
      phase_2: possible("Loadability may limit stimulus."),
      phase_3: possible("Usually accessory or travel option."),
    },
    loading: {
      loadability: "limited",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    progression: {
      progressionAxes: ["reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "lat-pulldown",
          direction: "progression",
          classification: "developmental",
          purposes: ["increase_loadability", "change_resistance_path", "equipment_transition"],
          notes: "Progresses anchored-band vertical pulling toward a more loadable lat-pulldown station.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Use a secure high anchor", "Keep ribs stacked"],
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    summary: "Dumbbell-loaded squat pattern.",
    family: "squat_pattern",
    movementRoles: ["squat", "knee_dominant"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["quads", "glutes"], contextual: ["trunk"] }),
    bodyRegions: ["knee", "hip", "ankle", "lumbar_spine"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("Accessible loaded squat with clear range control."),
      accessory: good("Useful quad/glute volume."),
    }),
    phaseSuitability: {
      phase_1: good("Teaches squat with manageable load."),
      phase_2: excellent("Progression-friendly until load ceiling."),
      phase_3: possible("May be load-limited for advanced users."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "goblet-squat-phase-1-main-owner-approved",
        exerciseId: "goblet-squat",
        phaseId: "phase_1",
        suitability: "good",
        reason: "The coordinated free-standing loaded squat task directly develops Phase 1 position, repeatable technique, and movement confidence for primary-strength main use; this judgment does not derive from low skill, stability, equipment, or loadability.",
        reviewStatus: "accepted",
        sourceRef: PHASE_ACTIVATION_OWNER_DECISION_REF,
        trainingRoles: ["primary_strength"],
        sessionSections: ["main"],
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "heavy_axial_loading",
        exposureScope: "dose_created",
        sideScope: "bilateral_or_systemic",
        notes: "Heavy axial exposure requires explicit reviewed realized-dose authority and is not implied by goblet-squat identity.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Free-standing loaded squat pattern.",
      },
      demands: {
        trunk_control: demand("moderate", "Anterior load requires trunk position control."),
        stability: demand("moderate", "Free squat pattern with implement."),
        coordination: demand("low", "Bilateral squat coordination is modest."),
        range: demand("moderate", "Squat depth range is adjustable."),
        joint_control: demand("moderate", "Hip/knee/ankle control under load."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "range", "sets"],
      transitionRelationships: [
        transition({
          targetExerciseId: "leg-press",
          direction: "progression",
          classification: "context_dependent",
          purposes: ["increase_loadability", "increase_support", "equipment_transition", "stimulus_shift"],
          notes: "May increase machine loadability and support, but machine loading is not universally a progression from goblet squatting.",
        }),
        transition({
          targetExerciseId: "bodyweight-box-squat",
          direction: "regression",
          classification: "developmental",
          purposes: [
            "reduce_loadability",
            "increase_support",
            "reduce_stability_demand",
            "pain_or_tolerance_regression",
          ],
          notes: "Regresses loaded squat exposure toward bodyweight box-supported range control.",
        }),
      ],
    },
    cautionStressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    contraindicatedStressTags: [],
    coachingFocus: ["Use range you can own", "Keep pressure through whole foot"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    summary: "Machine-guided bilateral squat pattern.",
    family: "squat_pattern",
    movementRoles: ["knee_dominant"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["quads", "glutes"], keySecondary: ["hamstrings"] }),
    bodyRegions: ["knee", "hip"],
    equipmentRequirements: [machine("leg_press", "Leg press machine")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      main: excellent("High loadability with low balance demand."),
      accessory: good("Can add lower-body volume."),
    }),
    phaseSuitability: {
      phase_1: possible("Use range and load conservatively."),
      phase_2: excellent("Useful capacity builder."),
      phase_3: excellent("High-stimulus lower-body option."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "leg-press-phase-2-owner-unknown",
        exerciseId: "leg-press",
        phaseId: "phase_2",
        suitability: "excellent",
        reason: "No independent Phase 2 evidence is approved beyond support, loadability, and stimulus owners.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "high",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "diagonal",
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "back", source: "machine", mode: "positioning", side: "side_neutral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Machine-guided lower-body press with trunk support.",
      },
      demands: {
        trunk_control: demand("low", "Seat/back support limits trunk demand."),
        stability: demand("low", "Machine path reduces stability demand."),
        coordination: demand("low", "Guided bilateral lower-body pattern."),
        range: demand("moderate", "Depth/range must still be controlled."),
        joint_control: demand("moderate", "Hip/knee control under load."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "range"],
      transitionRelationships: [
        transition({
          targetExerciseId: "goblet-squat",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["reduce_support", "increase_stability_demand", "equipment_transition"],
          notes: "Moves from machine-supported leg press to free standing squatting; not a universal regression despite lower external loading.",
        }),
      ],
    },
    cautionStressTags: ["loaded_knee_flexion"],
    contraindicatedStressTags: [],
    coachingFocus: ["Control depth", "Do not chase load past owned range"],
  },
  {
    id: "bodyweight-box-squat",
    name: "Bodyweight Box Squat",
    summary: "Supported squat pattern to a box.",
    family: "squat_pattern",
    movementRoles: ["squat", "knee_dominant"],
    trainingRoles: ["preparation", "activation", "secondary_strength"],
    muscleContributions: contributions({ primary: ["quads", "glutes"], contextual: ["trunk"] }),
    bodyRegions: ["knee", "hip", "ankle"],
    equipmentRequirements: [bodyweight, { id: "box", label: "Box or stable chair", oneOf: ["box"] }],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      warmup: good("Rehearses squat range for the day."),
      activation: good("Builds confidence and control."),
      accessory: possible("Low-load squat volume."),
    }),
    phaseSuitability: {
      phase_1: excellent("Range and support are easy to control."),
      phase_2: possible("Often becomes too low stimulus."),
      phase_3: possible("Mostly preparation or deload context."),
    },
    loading: {
      loadability: "limited",
      loadingPotential: "low",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["deep_knee_flexion"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
          { bodyRegion: "pelvis", source: "box", mode: "positioning", side: "side_neutral", taskRole: "secondary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Box target constrains depth and confidence.",
      },
      demands: {
        trunk_control: demand("low", "Low-load squat control."),
        stability: demand("low", "Box target reduces uncontrolled range."),
        coordination: demand("low", "Simple squat pattern."),
        range: demand("low", "Range can be constrained by box height."),
        joint_control: demand("low", "Low-load joint-control exposure."),
      },
    }),
    progression: {
      progressionAxes: ["range", "reps", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "goblet-squat",
          direction: "progression",
          classification: "developmental",
          purposes: ["increase_loadability", "reduce_support", "increase_stability_demand"],
          notes: "Progresses bodyweight box squat toward externally loaded standing squat when range and control are ready.",
        }),
      ],
    },
    cautionStressTags: ["deep_knee_flexion"],
    contraindicatedStressTags: [],
    coachingFocus: ["Sit to a consistent target", "Stand with whole-foot pressure"],
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    summary: "Loaded hinge emphasizing hamstrings and glutes.",
    family: "hinge_pattern",
    movementRoles: ["hinge"],
    trainingRoles: ["primary_strength", "secondary_strength"],
    muscleContributions: contributions({ primary: ["hamstrings", "glutes"], contextual: ["trunk", "mid_back"] }),
    bodyRegions: ["hip", "lumbar_spine"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "hinge-control",
        type: "required_competency",
        description: "Requires ability to hinge without loaded spinal flexion.",
      },
    ],
    sectionSuitability: sections({
      main: excellent("Loadable hinge stimulus."),
      accessory: good("Useful posterior-chain volume."),
    }),
    phaseSuitability: {
      phase_1: possible("Appropriate only if hinge control is present."),
      phase_2: excellent("Strong progression path."),
      phase_3: excellent("Productive posterior-chain stimulus."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "high",
      systemicFatigue: "moderate",
      axialLoading: "moderate",
      jointStressTags: ["loaded_hinge", "grip_intensive"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "loaded_hinge",
        exposureScope: "intrinsic",
        sideScope: "bilateral_or_systemic",
        notes: "The Romanian deadlift identity intrinsically realizes a loaded hinge; magnitude and range remain prescription facts.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Free-standing loaded hinge.",
      },
      demands: {
        trunk_control: demand("high", "Loaded hinge requires trunk and lumbar position control."),
        stability: demand("moderate", "Free hinge stability demand."),
        coordination: demand("moderate", "Hip hinge coordination under load."),
        range: demand("moderate", "Hip hinge range must be controlled."),
        joint_control: demand("high", "Hip/lumbar control under load."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "range"],
      transitionRelationships: [
        transition({
          targetExerciseId: "cable-pull-through",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["reduce_loadability", "change_resistance_path", "equipment_transition", "pain_or_tolerance_regression"],
          notes: "May reduce free-implement hinge loading through cable resistance, but equipment and tolerance context must justify the swap.",
        }),
      ],
    },
    cautionStressTags: ["loaded_hinge"],
    contraindicatedStressTags: [],
    coachingFocus: ["Hips back", "Keep load close", "Stop before spine position changes"],
  },
  {
    id: "cable-pull-through",
    name: "Cable Pull-Through",
    summary: "Cable hinge pattern with posterior loading.",
    family: "hinge_pattern",
    movementRoles: ["hinge"],
    trainingRoles: ["activation", "secondary_strength", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["glutes", "hamstrings"], contextual: ["trunk"] }),
    bodyRegions: ["hip", "lumbar_spine"],
    equipmentRequirements: [cable],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: good("Teaches hinge direction and glute use."),
      accessory: good("Adds hinge volume with lower load ceiling."),
    }),
    phaseSuitability: {
      phase_1: good("Good hinge teaching tool."),
      phase_2: good("Useful accessory or hinge regression."),
      phase_3: possible("May be too setup-limited for primary work."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "cable-pull-through-phase-1-activation-owner-approved",
        exerciseId: "cable-pull-through",
        phaseId: "phase_1",
        suitability: "good",
        reason: "Provides scoped hinge-pattern teaching and control exposure within Phase 1.",
        reviewStatus: "accepted",
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
      ownerPhaseAnnotation({
        annotationId: "cable-pull-through-phase-2-accessory-owner-review",
        exerciseId: "cable-pull-through",
        phaseId: "phase_2",
        suitability: "good",
        reason: "Accessory/regression rationale is not yet independent of role, progression, and prescription ownership.",
        reviewStatus: "needs_review",
        trainingRoles: ["secondary_strength"],
        sessionSections: ["accessory"],
      }),
      ownerPhaseAnnotation({
        annotationId: "cable-pull-through-phase-3-owner-unknown",
        exerciseId: "cable-pull-through",
        phaseId: "phase_3",
        suitability: "possible",
        reason: "No narrower independent Phase 3 developmental evidence is approved.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["loaded_hinge"],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "loaded_hinge",
        exposureScope: "intrinsic",
        sideScope: "bilateral_or_systemic",
        notes: "The cable pull-through identity intrinsically realizes a loaded hinge; magnitude and range remain prescription facts.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Cable load guides hinge direction with lower axial loading.",
      },
      demands: {
        trunk_control: demand("moderate", "Hinge exposure with lower axial demand than RDL."),
        stability: demand("moderate", "Standing cable hinge."),
        coordination: demand("low", "Cable direction can simplify hinge learning."),
        range: demand("moderate", "Hip hinge range is trained."),
        joint_control: demand("moderate", "Hip/lumbar control under moderate demand."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "range"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dumbbell-romanian-deadlift",
          direction: "progression",
          classification: "developmental",
          purposes: ["increase_loadability", "change_resistance_path", "movement_pattern_development"],
          notes: "Can progress cable hinge practice toward a more loadable free-implement Romanian deadlift.",
        }),
      ],
    },
    cautionStressTags: ["loaded_hinge"],
    contraindicatedStressTags: [],
    coachingFocus: ["Let hips move back", "Finish tall without overextending"],
  },
  {
    id: "split-squat",
    name: "Split Squat",
    summary: "Unilateral lower-body squat pattern.",
    family: "single_leg_pattern",
    movementRoles: ["single_leg", "knee_dominant"],
    trainingRoles: ["secondary_strength", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["quads", "glutes"], contextual: ["hip_adductors", "trunk"] }),
    bodyRegions: ["knee", "hip", "ankle"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [dumbbells],
    prerequisites: [],
    sectionSuitability: sections({
      main: possible("Can be primary for some home sessions."),
      accessory: excellent("Useful unilateral lower-body volume."),
    }),
    phaseSuitability: {
      phase_1: possible("Support may be needed."),
      phase_2: good("Progresses single-leg strength."),
      phase_3: excellent("Strong accessory stimulus."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "split-squat-phase-2-owner-approved",
        exerciseId: "split-squat",
        phaseId: "phase_2",
        suitability: "good",
        reason: "Directly contributes to Phase 2 single-leg strength and tissue and training-capacity development.",
        reviewStatus: "accepted",
        legalUseCoverage: {
          trainingRoles: ["secondary_strength", "hypertrophy_accessory"],
          sessionSections: ["main", "accessory"],
        },
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "high",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "split",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Unilateral stance can be externally supported but is not inherently supported.",
      },
      demands: {
        trunk_control: demand("moderate", "Unilateral lower-body work requires trunk control."),
        stability: demand("moderate", "Single-leg stance pattern."),
        coordination: demand("moderate", "Split stance and depth control."),
        range: demand("moderate", "Depth can be scaled."),
        joint_control: demand("moderate", "Hip/knee/ankle control under unilateral load."),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "range", "support_reduction"],
      transitionRelationships: [
        transition({
          targetExerciseId: "step-up",
          direction: "regression",
          classification: "context_dependent",
          purposes: ["movement_pattern_development", "stimulus_shift"],
          notes: "Split squat and step-up share single-leg/squat roles but do not have one universal difficulty order.",
        }),
      ],
    },
    cautionStressTags: ["deep_knee_flexion", "loaded_knee_flexion"],
    contraindicatedStressTags: [],
    coachingFocus: ["Use support if balance dominates", "Own depth before load"],
  },
  {
    id: "step-up",
    name: "Step-Up",
    summary: "Unilateral lower-body step pattern.",
    family: "single_leg_pattern",
    movementRoles: ["single_leg", "knee_dominant"],
    trainingRoles: ["secondary_strength", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["quads", "glutes"], keySecondary: ["hamstrings"], contextual: ["trunk"] }),
    bodyRegions: ["knee", "hip", "ankle"],
    equipmentRequirements: [bodyweight, { id: "box", label: "Box or step", oneOf: ["box"] }],
    optionalEquipment: [dumbbells],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Useful unilateral work with adjustable height."),
      activation: possible("Can prepare lower-body control at low height."),
    }),
    phaseSuitability: {
      phase_1: good("Height and support can be scaled."),
      phase_2: good("Useful unilateral volume."),
      phase_3: good("Useful accessory when loadability is enough."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["loaded_knee_flexion"],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "split",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "box", mode: "weight_bearing", side: "unknown", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "unknown", taskRole: "secondary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Box/step height constrains range; external hand support is optional.",
      },
      demands: {
        trunk_control: demand("moderate", "Unilateral step requires trunk control."),
        stability: demand("moderate", "Step-up balance and stance control."),
        coordination: demand("moderate", "Stepping pattern coordination."),
        range: demand("moderate", "Range depends on step height."),
        joint_control: demand("moderate", "Hip/knee/ankle control."),
      },
    }),
    progression: {
      progressionAxes: ["load", "range", "reps"],
      transitionRelationships: [
        transition({
          targetExerciseId: "split-squat",
          direction: "progression",
          classification: "context_dependent",
          purposes: ["movement_pattern_development", "stimulus_shift"],
          notes: "Step-up to split squat can be useful for unilateral development but should not be treated as universally harder.",
        }),
        transition({
          targetExerciseId: "bodyweight-box-squat",
          direction: "regression",
          classification: "developmental",
          purposes: [
            "reduce_loadability",
            "reduce_stability_demand",
            "reduce_coordination_demand",
            "pain_or_tolerance_regression",
          ],
          notes: "Regresses unilateral step pattern toward bilateral bodyweight squat-to-box control.",
        }),
      ],
    },
    cautionStressTags: ["loaded_knee_flexion"],
    contraindicatedStressTags: [],
    coachingFocus: ["Control the descent", "Match box height to owned range"],
  },
  {
    id: "lying-leg-curl",
    name: "Lying Leg Curl",
    summary: "Machine hamstring knee-flexion isolation.",
    family: "glute_hamstring",
    movementRoles: ["accessory"],
    actionFunctions: actions("knee_flexion"),
    trainingRoles: ["hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["hamstrings"] }),
    bodyRegions: ["knee", "hip"],
    equipmentRequirements: [machine("leg_curl", "Leg curl machine")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Adds hamstring volume without hinge fatigue."),
    }),
    phaseSuitability: {
      phase_1: possible("Useful if simple machine setup fits."),
      phase_2: good("Supports posterior-chain volume."),
      phase_3: excellent("High-value hypertrophy accessory."),
    },
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Control the return", "Keep hips settled"],
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    summary: "Supine hip-extension glute exercise.",
    family: "glute_hamstring",
    movementRoles: ["accessory"],
    actionFunctions: actions("hip_extension"),
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["glutes"], keySecondary: ["hamstrings"], contextual: ["trunk"] }),
    bodyRegions: ["hip", "pelvis", "lumbar_spine"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [dumbbells, loopBand],
    prerequisites: [],
    sectionSuitability: sections({
      activation: excellent("Prepares hip extension and pelvic control."),
      accessory: good("Adds low-skill glute volume."),
    }),
    phaseSuitability: {
      phase_1: excellent("Accessible glute and pelvic-control option."),
      phase_2: good("Can progress with load or band."),
      phase_3: possible("May need stronger loading path."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "glute-bridge-phase-1-activation-owner-approved",
        exerciseId: "glute-bridge",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 pelvic and glute-control development in activation use.",
        reviewStatus: "accepted",
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dumbbell-romanian-deadlift",
          direction: "progression",
          classification: "context_dependent",
          purposes: [
            "increase_loadability",
            "increase_stability_demand",
            "movement_pattern_development",
            "stimulus_shift",
          ],
          notes: "Can develop from supine hip-extension work toward loaded hinge training when hinge readiness and tolerance support it.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Finish with glutes, not low back"],
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    summary: "Dumbbell side-delt isolation.",
    family: "delt_accessory",
    movementRoles: ["accessory"],
    actionFunctions: actions("shoulder_abduction"),
    trainingRoles: ["hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["side_delts"], contextual: ["upper_back"] }),
    bodyRegions: ["shoulder"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Adds shoulder volume without heavy pressing."),
    }),
    phaseSuitability: {
      phase_1: possible("Use light load and owned range."),
      phase_2: good("Useful delt volume."),
      phase_3: excellent("High-value hypertrophy accessory."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["shoulder_abduction_external_rotation"],
    },
    progression: {
      progressionAxes: ["reps", "sets", "tempo", "load"],
      transitionRelationships: [],
    },
    cautionStressTags: ["shoulder_abduction_external_rotation"],
    contraindicatedStressTags: [],
    coachingFocus: ["Lead with elbows softly", "Stay in comfortable range"],
  },
  {
    id: "reverse-pec-deck",
    name: "Reverse Pec Deck",
    summary: "Machine-supported rear-delt and upper-back isolation.",
    family: "delt_accessory",
    movementRoles: ["scapular_control"],
    actionFunctions: actions("shoulder_horizontal_abduction", "scapular_retraction"),
    trainingRoles: ["hypertrophy_accessory", "activation"],
    muscleContributions: contributions({ primary: ["rear_delts"], keySecondary: ["upper_back", "mid_back"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [machine("reverse_pec_deck", "Reverse pec deck")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: good("Can prepare scapular mechanics."),
      accessory: excellent("Adds rear-delt volume with support."),
    }),
    phaseSuitability: {
      phase_1: good("Stable setup for scapular work."),
      phase_2: good("Useful upper-back accessory."),
      phase_3: excellent("High-value rear-delt accessory."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "reverse-pec-deck-phase-1-activation-owner-approved",
        exerciseId: "reverse-pec-deck",
        phaseId: "phase_1",
        suitability: "good",
        reason: "Provides scoped scapular and retraction-control activation within Phase 1.",
        reviewStatus: "accepted",
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Machine-supported rear-delt/scapular isolation.",
      },
      demands: {
        scapular_control: demand("moderate", "Supported loaded scapular/rear-delt control."),
        stability: demand("low", "Machine support lowers stability demand."),
        coordination: demand("low", "Guided accessory movement."),
        range: demand("moderate", "Scapular/rear-delt range is relevant."),
        joint_control: demand("moderate", "Shoulder control under load."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-focused."),
        upwardRotationControl: demand("low", "Not upward-rotation-focused."),
        retractionDemand: demand("moderate", "Rear-delt/retraction control."),
        externalRotationContribution: demand("low", "External rotation not primary."),
        loadedScapularControl: demand("moderate", "Loaded machine-supported scapular work."),
        preparationSuitability: "good",
        reviewStatus: "needs_review",
        notes: "Machine-specific scapular path needs human review.",
      }),
    }),
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "band-face-pull",
          direction: "regression",
          classification: "questionable",
          purposes: ["reduce_loadability", "change_resistance_path", "feature_shift"],
          notes: "May reduce loading and change scapular feature emphasis, but reverse pec deck to face pull is not a universal regression.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Move shoulder blades and rear delts, not neck"],
  },
  {
    id: "band-face-pull",
    name: "Band Face Pull",
    summary: "Anchored-band rear-delt and scapular-control exercise.",
    family: "scapular_preparation",
    movementRoles: ["scapular_control"],
    actionFunctions: actions("scapular_retraction", "shoulder_external_rotation"),
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["rear_delts", "upper_back"], keySecondary: ["rotator_cuff"] }),
    bodyRegions: ["shoulder", "thoracic_spine"],
    equipmentRequirements: [anchoredBand("mid")],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: excellent("Prepares scapular control before pressing or pulling."),
      accessory: good("Low-load rear-delt/scapular volume."),
    }),
    phaseSuitability: {
      phase_1: excellent("Strong control and preparation fit."),
      phase_2: good("Useful between pressing volume."),
      phase_3: possible("Accessory if loadability is enough."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "band-face-pull-phase-1-activation-owner-approved",
        exerciseId: "band-face-pull",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 scapular-control and preparation development.",
        reviewStatus: "accepted",
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
    ],
    loading: {
      loadability: "limited",
      loadingPotential: "low",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "moderate",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Anchored band resistance with standing body position.",
      },
      demands: {
        scapular_control: demand("high", "Direct scapular-control drill with cuff/rear-delt contribution."),
        stability: demand("low", "Low-load standing setup."),
        coordination: demand("moderate", "Requires coordinated pull and external-rotation/retraction control."),
        range: demand("moderate", "Pull-to-face range is controlled."),
        joint_control: demand("moderate", "Shoulder/scapular control is central."),
      },
      scapularMechanics: scapularMechanics({
        serratusContribution: demand("low", "Not serratus-emphasis."),
        upwardRotationControl: demand("low", "Not upward-rotation-focused."),
        retractionDemand: demand("high", "Face pull emphasizes retraction/posterior shoulder control."),
        externalRotationContribution: demand("moderate", "Rotator cuff contribution is modeled from catalog secondary muscle."),
        loadedScapularControl: demand("moderate", "Band load is limited but active."),
        preparationSuitability: "excellent",
        reviewStatus: "needs_review",
        notes: "Face-pull cuff/retraction emphasis needs human review.",
      }),
    }),
    progression: {
      progressionAxes: ["reps", "sets", "tempo"],
      transitionRelationships: [
        transition({
          targetExerciseId: "reverse-pec-deck",
          direction: "progression",
          classification: "questionable",
          purposes: ["increase_loadability", "change_resistance_path", "feature_shift"],
          notes: "Changes from band face-pull retraction/cuff emphasis to machine rear-delt/retraction loading; review before calling this progression.",
        }),
        transition({
          targetExerciseId: "serratus-wall-slide",
          direction: "lateral",
          classification: "context_dependent",
          purposes: ["feature_shift", "equipment_transition"],
          notes: "Context-dependent lateral transition from band-loaded retraction/cuff preparation to wall-supported serratus/upward-rotation preparation. Neither exercise is a universal progression or regression of the other.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Pull toward face without shrugging"],
  },
  {
    id: "dumbbell-curl",
    name: "Dumbbell Curl",
    summary: "Dumbbell elbow-flexion accessory.",
    family: "arm_accessory",
    movementRoles: ["accessory"],
    actionFunctions: actions("elbow_flexion"),
    trainingRoles: ["hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["biceps"] }),
    bodyRegions: ["elbow", "wrist"],
    equipmentRequirements: [dumbbells],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Direct biceps volume with simple setup."),
    }),
    phaseSuitability: {
      phase_1: possible("Optional accessory."),
      phase_2: good("Adds arm volume."),
      phase_3: excellent("Useful hypertrophy accessory."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: ["grip_intensive"],
    },
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [],
    },
    cautionStressTags: ["grip_intensive"],
    contraindicatedStressTags: [],
    coachingFocus: ["Control the lowering", "Do not swing"],
  },
  {
    id: "cable-triceps-pressdown",
    name: "Cable Triceps Pressdown",
    summary: "Cable elbow-extension accessory.",
    family: "arm_accessory",
    movementRoles: ["accessory"],
    actionFunctions: actions("elbow_extension"),
    trainingRoles: ["hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["triceps"] }),
    bodyRegions: ["elbow", "shoulder"],
    equipmentRequirements: [cable],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      accessory: excellent("Direct triceps volume without more pressing fatigue."),
    }),
    phaseSuitability: {
      phase_1: possible("Optional accessory."),
      phase_2: good("Useful pressing support volume."),
      phase_3: excellent("High-value arm accessory."),
    },
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    progression: {
      progressionAxes: ["load", "reps", "sets", "tempo"],
      transitionRelationships: [],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Keep upper arm still", "Finish without shoulder roll"],
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    summary: "Anti-rotation core press using cable or anchored band.",
    family: "core_control",
    movementRoles: ["anti_rotation_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["glutes"] }),
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder"],
    equipmentRequirements: [
      {
        id: "pallof-load",
        label: "Cable or mid-anchor tube band",
        oneOf: ["cable_stack", "band_anchor_mid"],
      },
    ],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: sections({
      activation: excellent("Prepares trunk control before loaded work."),
      accessory: good("Adds low-fatigue anti-rotation exposure."),
    }),
    phaseSuitability: {
      phase_1: excellent("Strong control exercise."),
      phase_2: good("Useful accessory and preparation."),
      phase_3: good("Can remain as targeted trunk work."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "pallof-press-phase-1-activation-owner-approved",
        exerciseId: "pallof-press",
        phaseId: "phase_1",
        suitability: "excellent",
        reason: "Directly serves Phase 1 anti-rotation and control development.",
        reviewStatus: "accepted",
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
      ownerPhaseAnnotation({
        annotationId: "pallof-press-phase-2-owner-unknown",
        exerciseId: "pallof-press",
        phaseId: "phase_2",
        suitability: "good",
        reason: "No independent Phase 2 evidence is approved beyond requested need, progression, and continuity owners.",
        reviewStatus: "unknown",
      }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "low",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    stressAnnotations: [
      ownerStressAnnotation({
        tag: "long_lever_core",
        exposureScope: "prescription_modifiable",
        sideScope: "side_neutral",
        notes: "Long-lever exposure requires the realized press distance, stance, and prescription context.",
      }),
    ],
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Standing anti-rotation drill with external cable or band resistance.",
      },
      demands: {
        trunk_control: demand("high", "Anti-rotation resistance creates higher trunk-control demand than supine drills."),
        stability: demand("moderate", "Standing posture against lateral pull."),
        coordination: demand("low", "Simple press-and-hold pattern."),
        range: demand("low", "Small press-out range."),
        joint_control: demand("low", "Low joint stress; trunk control is primary."),
      },
      trunkMechanics: {
        breathingPressureCoordination: unknownTrunkFunction(
          "No approved evidence currently classifies breathing or pressure-coordination expression for Pallof Press.",
        ),
        antiExtensionContribution: unknownTrunkFunction(
          "No approved evidence currently isolates anti-extension expression from the exercise's anti-rotation purpose.",
        ),
        antiRotationContribution: reviewedTrunkFunction(
          "high",
          [
            "movementRoles includes anti_rotation_core.",
            "primaryMuscles includes trunk.",
            "mechanics.demands.trunk_control is accepted high.",
            "Project-owner review approves anti-rotation as the central function expression.",
          ],
          "Owner-reviewed high anti-rotation contribution as the exercise's direct trunk-control purpose.",
        ),
        antiLateralFlexionContribution: unknownTrunkFunction(
          "The proposed low anti-lateral-flexion value remains unapproved and no approved evidence currently classifies this function.",
        ),
        controlledFlexionContribution: unknownTrunkFunction(
          "No approved evidence currently classifies intentional controlled trunk flexion during Pallof Press execution.",
        ),
        controlledRotationContribution: reviewedTrunkFunction(
          "none",
          [
            "The explicit movement purpose is resisting rotation through anti_rotation_core.",
            "movementRoles does not include trunk_rotation.",
            "Project-owner review keeps anti-rotation and intentional controlled rotation as separate concepts.",
          ],
          "Owner-reviewed absence of intentional controlled rotation; the exercise resists rather than produces trunk rotation.",
        ),
        loadedBracingContribution: unknownTrunkFunction(
          "The proposed moderate loaded-bracing value remains unapproved and no approved evidence currently classifies it separately from anti-rotation.",
        ),
        gaitLoadTransferContribution: reviewedTrunkFunction(
          "none",
          [
            "The current exercise has no stepping, marching, carrying, or locomotor purpose.",
            "Standing support alone is not gait/load-transfer evidence.",
            "Project-owner review confirms no meaningful gait or load-transfer expression.",
          ],
          "Owner-reviewed absence of gait or locomotor load transfer in the standing press-and-hold definition.",
        ),
      },
    }),
    progression: {
      progressionAxes: ["load", "reps", "tempo", "stability"],
      transitionRelationships: [
        transition({
          targetExerciseId: "dead-bug",
          direction: "regression",
          classification: "needs_review",
          purposes: [
            "reduce_loadability",
            "movement_pattern_development",
            "pain_or_tolerance_regression",
          ],
          notes: "Standing anti-rotation to supine anti-extension changes movement role; review before treating as a simple regression.",
        }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Resist rotation", "Stay tall without rib flare"],
  },
  {
    id: "forearm-plank",
    name: "Forearm Plank",
    summary: "Stationary forearm-supported anti-extension trunk exercise.",
    family: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["serratus", "front_delts"] }),
    bodyRegions: ["shoulder", "ribcage", "lumbar_spine", "pelvis"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "forearm-support-setup",
        type: "required_setup_skill",
        description: "Requires a stable forearm-supported floor setup.",
      },
    ],
    sectionSuitability: sections({
      activation: excellent("Direct anti-extension position-control exposure."),
      accessory: good("Adds bounded trunk-control volume."),
    }),
    phaseSuitability: {
      phase_1: good("Legacy migration value for early control work."),
      phase_2: possible("Legacy migration value for accessory use."),
      phase_3: possible("Legacy migration value pending contextual evidence."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({
        annotationId: "forearm-plank-phase-1-activation-owner-approved",
        exerciseId: "forearm-plank",
        phaseId: "phase_1",
        suitability: "good",
        reason: "Provides scoped anti-extension position and control development within Phase 1.",
        reviewStatus: "accepted",
        sourceRef: SEVEN_PHASE_OWNER_DECISION_REF,
        trainingRoles: ["activation"],
        sessionSections: ["activation"],
      }),
      ownerPhaseAnnotation({
        annotationId: "forearm-plank-phase-2-accessory-owner-review",
        exerciseId: "forearm-plank",
        phaseId: "phase_2",
        suitability: "possible",
        reason: "Phase 2 accessory value remains insufficiently independent of capacity and progression owners.",
        reviewStatus: "needs_review",
        sourceRef: SEVEN_PHASE_OWNER_DECISION_REF,
        trainingRoles: ["hypertrophy_accessory"],
        sessionSections: ["accessory"],
      }),
      ownerPhaseAnnotation({
        annotationId: "forearm-plank-phase-3-accessory-owner-unknown",
        exerciseId: "forearm-plank",
        phaseId: "phase_3",
        suitability: "possible",
        reason: "No independent Phase 3 developmental evidence is approved.",
        reviewStatus: "unknown",
        sourceRef: SEVEN_PHASE_OWNER_DECISION_REF,
        trainingRoles: ["hypertrophy_accessory"],
        sessionSections: ["accessory"],
      }),
    ],
    loading: {
      loadability: "limited",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "prone",
        stance: "bilateral",
        orientation: "prone",
        supportContacts: [
          { bodyRegion: "forearm", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "bilateral", taskRole: "primary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Forearm and foot support define the standard task; knee support is a same-identity prescription variant.",
      },
      resistancePath: {
        resistancePath: "bodyweight",
        trajectoryFreedom: "low",
        lineOfPullAdjustability: "low",
        laterality: "bilateral_linked",
        fitDependency: "low",
        reviewStatus: "accepted",
        notes: "Bodyweight support path with prescription-realized lever.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Anti-extension position control is the direct task."),
        scapular_control: demand("moderate", "Forearm support requires scapular support control."),
        stability: demand("moderate", "Full-body support creates moderate stability demand."),
        coordination: demand("low", "Stationary support has no locomotor path."),
        range: demand("low", "The standard prescription is a static hold."),
        joint_control: demand("moderate", "Upper-limb support tolerance remains relevant."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        antiExtensionContribution: { level: "high", notes: "Straight-body forearm support directly expresses anti-extension control." },
        loadedBracingContribution: { level: "none", notes: "The identity contains no external load or loaded transport." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "upper_limb_support_loading", exposureScope: "intrinsic", sideScope: "bilateral_or_systemic", notes: "Forearm support intrinsically loads the upper-limb support chain." }),
      ownerStressAnnotation({ tag: "long_lever_core", exposureScope: "variant_dependent", sideScope: "side_neutral", notes: "Long-lever exposure requires a reviewed realized lever variant." }),
    ],
    progression: {
      progressionAxes: ["duration", "lever", "support_reduction", "effort"],
      transitionRelationships: [
        transition({ targetExerciseId: "dead-bug", direction: "lateral", classification: "context_dependent", purposes: ["movement_pattern_development", "change_resistance_path"], notes: "Supine and prone anti-extension contexts are related but not automatic substitutions.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Keep ribs and pelvis organized", "Press through the forearms"],
  },
  {
    id: "forearm-side-plank",
    name: "Forearm Side Plank",
    summary: "Forearm-supported side plank for anti-lateral-flexion control.",
    family: "core_control",
    movementRoles: ["anti_lateral_flexion_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["serratus", "front_delts", "hip_abductors"] }),
    bodyRegions: ["shoulder", "ribcage", "lumbar_spine", "pelvis", "hip"],
    equipmentRequirements: [bodyweight],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "side-forearm-support-setup",
        type: "required_setup_skill",
        description: "Requires a stable side-oriented forearm support setup.",
      },
    ],
    sectionSuitability: sections({
      activation: excellent("Direct lateral-position control exposure."),
      accessory: good("Adds bounded side-specific trunk work."),
    }),
    phaseSuitability: {
      phase_1: good("Legacy migration value for early lateral control."),
      phase_2: possible("Legacy migration value for accessory use."),
      phase_3: possible("Legacy migration value pending contextual evidence."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "forearm-side-plank-phase-1-activation-owner-approved", exerciseId: "forearm-side-plank", phaseId: "phase_1", suitability: "good", reason: "Provides scoped lateral-position and control development within Phase 1.", reviewStatus: "accepted", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["activation"], sessionSections: ["activation"] }),
      ownerPhaseAnnotation({ annotationId: "forearm-side-plank-phase-2-accessory-owner-review", exerciseId: "forearm-side-plank", phaseId: "phase_2", suitability: "possible", reason: "Phase 2 accessory value remains insufficiently independent of stability and progression owners.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["hypertrophy_accessory"], sessionSections: ["accessory"] }),
      ownerPhaseAnnotation({ annotationId: "forearm-side-plank-phase-3-accessory-owner-unknown", exerciseId: "forearm-side-plank", phaseId: "phase_3", suitability: "possible", reason: "No independent Phase 3 developmental evidence is approved.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["hypertrophy_accessory"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "limited",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "low",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "side_support",
        stance: "stacked_feet",
        orientation: "lateral",
        supportContacts: [
          { bodyRegion: "forearm", source: "floor", mode: "weight_bearing", side: "unknown", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "unknown", taskRole: "primary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Forearm and foot support define the standard task; bent-knee support is a same-identity variant.",
      },
      resistancePath: {
        resistancePath: "bodyweight",
        trajectoryFreedom: "low",
        lineOfPullAdjustability: "low",
        laterality: "unilateral",
        fitDependency: "low",
        reviewStatus: "accepted",
        notes: "Side and lever are prescription-realized facts.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Side support directly challenges anti-lateral control."),
        scapular_control: demand("moderate", "The support shoulder requires control."),
        stability: demand("moderate", "The lateral support base creates stability demand."),
        coordination: demand("low", "The standard task is a static hold."),
        range: demand("low", "The standard task uses a static support position."),
        joint_control: demand("moderate", "Shoulder and hip support positions matter."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        antiLateralFlexionContribution: { level: "high", notes: "Side forearm support directly expresses anti-lateral-flexion control." },
        loadedBracingContribution: { level: "none", notes: "The identity contains no external load or loaded transport." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "upper_limb_support_loading", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "The support side intrinsically loads the upper-limb support chain." }),
      ownerStressAnnotation({ tag: "lateral_trunk_loading", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "Side support intrinsically creates lateral trunk loading." }),
      ownerStressAnnotation({ tag: "long_lever_core", exposureScope: "variant_dependent", sideScope: "prescription_side", notes: "Long-lever exposure requires the realized side-support lever variant." }),
    ],
    progression: {
      progressionAxes: ["duration", "lever", "support_reduction", "load", "effort"],
      transitionRelationships: [
        transition({ targetExerciseId: "suitcase-carry", direction: "lateral", classification: "context_dependent", purposes: ["change_resistance_path", "stimulus_shift"], notes: "Static side support and unilateral loaded gait are distinct contexts with no automatic substitution.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Keep a long side line", "Press through the forearm"],
  },
  {
    id: "machine-abdominal-crunch",
    name: "Machine Abdominal Crunch",
    summary: "Machine-guided controlled trunk-flexion exercise.",
    family: "core_control",
    movementRoles: ["trunk_flexion"],
    trainingRoles: ["hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["trunk"] }),
    bodyRegions: ["ribcage", "lumbar_spine", "pelvis"],
    equipmentRequirements: [machine("abdominal_crunch", "Abdominal crunch machine")],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "abdominal-crunch-machine-setup",
        type: "required_setup_skill",
        description: "Requires correct adjustment and entry for the specific abdominal machine.",
      },
    ],
    sectionSuitability: sections({
      accessory: excellent("Direct controlled trunk-flexion development."),
    }),
    phaseSuitability: {
      phase_1: possible("Legacy migration value pending contextual evidence."),
      phase_2: possible("Legacy migration value pending contextual evidence."),
      phase_3: good("Legacy migration value for direct hypertrophy use."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "machine-abdominal-crunch-phase-1-owner-unknown", exerciseId: "machine-abdominal-crunch", phaseId: "phase_1", suitability: "possible", reason: "Machine guidance and nominal ease are not independent Phase 1 evidence.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF }),
      ownerPhaseAnnotation({ annotationId: "machine-abdominal-crunch-phase-2-accessory-owner-review", exerciseId: "machine-abdominal-crunch", phaseId: "phase_2", suitability: "possible", reason: "Controlled loaded flexion may serve Phase 2 development, but independent evidence remains under review.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["secondary_strength"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "low",
      stabilityDemand: "low",
      coordinationDemand: "low",
      localFatigue: "high",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "seated",
        stance: "bilateral",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
          { bodyRegion: "back", source: "machine", mode: "positioning", side: "side_neutral", taskRole: "secondary" },
        ],
        supportAmount: "substantial",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Machine seat and pads materially define the controlled flexion path.",
      },
      resistancePath: {
        resistancePath: "machine_guided",
        trajectoryFreedom: "low",
        lineOfPullAdjustability: "low",
        laterality: "bilateral_linked",
        fitDependency: "machine_geometry",
        reviewStatus: "accepted",
        notes: "The specific machine geometry controls path and fit.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Intentional controlled flexion is the task."),
        scapular_control: demand("low", "Scapular control is not a selection purpose."),
        stability: demand("low", "Machine support constrains stability demand."),
        coordination: demand("low", "The machine provides a guided path."),
        range: demand("moderate", "Flexion range is prescription controlled."),
        joint_control: demand("moderate", "Loaded flexion tolerance remains relevant."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        controlledFlexionContribution: { level: "high", notes: "The machine-guided identity directly expresses controlled trunk flexion." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "loaded_spinal_flexion", exposureScope: "intrinsic", sideScope: "side_neutral", notes: "Controlled loaded trunk flexion is intrinsic to this identity and is not itself a danger label." }),
    ],
    progression: { progressionAxes: ["load", "reps", "sets", "range", "tempo"], transitionRelationships: [] },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Flex through the trunk with control", "Return without dropping the stack"],
  },
  {
    id: "half-kneeling-high-to-low-cable-chop",
    name: "Half-Kneeling High-to-Low Cable Chop",
    summary: "Half-kneeling high-cable controlled trunk-rotation exercise.",
    family: "core_control",
    movementRoles: ["trunk_rotation"],
    trainingRoles: ["activation", "hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["glutes"] }),
    bodyRegions: ["thoracic_spine", "ribcage", "lumbar_spine", "pelvis", "hip", "shoulder"],
    equipmentRequirements: [highCable],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "high-cable-half-kneeling-setup",
        type: "required_setup_skill",
        description: "Requires a stable high-cable and half-kneeling side setup.",
      },
    ],
    sectionSuitability: sections({
      activation: good("Provides controlled rotational preparation at a reviewed dose."),
      accessory: excellent("Provides direct controlled loaded-rotation development."),
    }),
    phaseSuitability: {
      phase_1: possible("Legacy migration value for controlled activation use."),
      phase_2: good("Legacy migration value for loaded rotational capacity."),
      phase_3: possible("Legacy migration value pending contextual evidence."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "cable-chop-phase-1-activation-owner-review", exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_1", suitability: "possible", reason: "Phase 1 activation requires further range and prescription review.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["activation"], sessionSections: ["activation"] }),
      ownerPhaseAnnotation({ annotationId: "cable-chop-phase-2-accessory-owner-approved", exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_2", suitability: "good", reason: "Provides scoped controlled loaded-rotation capacity within Phase 2.", reviewStatus: "accepted", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["secondary_strength"], sessionSections: ["accessory"] }),
      ownerPhaseAnnotation({ annotationId: "cable-chop-phase-3-accessory-owner-unknown", exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_3", suitability: "possible", reason: "No independent Phase 3 developmental evidence is approved.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["hypertrophy_accessory"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "low",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "half_kneeling",
        stance: "half_kneeling_lead_side",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "knee", source: "floor", mode: "weight_bearing", side: "unknown", taskRole: "primary" },
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "unknown", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "side_neutral",
        reviewStatus: "accepted",
        notes: "Half-kneeling contacts and side are explicit setup facts.",
      },
      resistancePath: {
        resistancePath: "cable_anchored",
        trajectoryFreedom: "moderate",
        lineOfPullAdjustability: "high",
        laterality: "unilateral",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
        notes: "High-anchor geometry and side determine the diagonal path.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Controlled rotation is the selected task."),
        scapular_control: demand("low", "The arms transmit load but are not the target."),
        stability: demand("moderate", "Half-kneeling position requires control."),
        coordination: demand("moderate", "Trunk rotation and cable path must coordinate."),
        range: demand("moderate", "Rotation range is prescription controlled."),
        joint_control: demand("moderate", "Rotation tolerance and setup matter."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        antiRotationContribution: { level: "none", notes: "The identity produces controlled rotation rather than resisting rotation." },
        controlledRotationContribution: { level: "high", notes: "The high-to-low resisted path directly expresses controlled trunk rotation." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "loaded_trunk_rotation", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "Controlled resisted rotation is intrinsic; range, side, load, and tempo remain prescription facts." }),
    ],
    progression: {
      progressionAxes: ["load", "reps", "sets", "range", "tempo"],
      transitionRelationships: [
        transition({ targetExerciseId: "pallof-press", direction: "lateral", classification: "context_dependent", purposes: ["feature_shift", "change_resistance_path"], notes: "Controlled rotation and anti-rotation are distinct tasks with no automatic substitution.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Rotate through the trunk with control", "Follow the high-to-low path"],
  },
  {
    id: "farmer-carry",
    name: "Farmer Carry",
    summary: "Bilateral one-implement-per-hand loaded walking carry.",
    family: "carry_load",
    movementRoles: ["carry", "loaded_bracing"],
    trainingRoles: ["capacity", "hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["trunk", "upper_back"], contextual: ["glutes", "quads", "hamstrings"] }),
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "pelvis", "hip", "knee", "ankle"],
    equipmentRequirements: [farmerCarryEquipment],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "farmer-carry-loaded-gait-setup",
        type: "required_setup_skill",
        description: "Requires a safe paired-implement pickup, gait path, turn, and set-down setup.",
      },
    ],
    sectionSuitability: sections({
      main: good("Provides intentional loaded capacity work."),
      accessory: good("Adds carry exposure when marginal value is real."),
    }),
    phaseSuitability: {
      phase_1: possible("Legacy migration value pending contextual evidence."),
      phase_2: good("Legacy migration value for loaded capacity."),
      phase_3: possible("Legacy migration value pending contextual evidence."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "farmer-carry-phase-1-accessory-owner-review", exerciseId: "farmer-carry", phaseId: "phase_1", suitability: "possible", reason: "Early capacity use remains under review and cannot be inferred from load or gait skill.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
      ownerPhaseAnnotation({ annotationId: "farmer-carry-phase-2-main-owner-approved", exerciseId: "farmer-carry", phaseId: "phase_2", suitability: "good", reason: "Directly serves recoverable loaded capacity and training consistency within Phase 2.", reviewStatus: "accepted", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["main"] }),
      ownerPhaseAnnotation({ annotationId: "farmer-carry-phase-3-accessory-owner-unknown", exerciseId: "farmer-carry", phaseId: "phase_3", suitability: "possible", reason: "No independent Phase 3 developmental preference is approved.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "high",
      systemicFatigue: "high",
      axialLoading: "moderate",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "unknown",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "alternating", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "bilateral",
        reviewStatus: "accepted",
        notes: "Unsupported loaded gait with one implement per hand.",
      },
      resistancePath: {
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        lineOfPullAdjustability: "low",
        laterality: "bilateral_independent",
        fitDependency: "low",
        reviewStatus: "accepted",
        notes: "A pair of free implements and actual walking define the identity.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Loaded walking requires trunk control."),
        scapular_control: demand("moderate", "The upper quarter supports the implements."),
        stability: demand("moderate", "Walking under load creates dynamic stability demand."),
        coordination: demand("moderate", "Gait and load must remain coordinated."),
        range: demand("low", "No large-range target is intrinsic."),
        joint_control: demand("moderate", "Load and gait make control relevant."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        loadedBracingContribution: { level: "high", notes: "Bilateral loaded walking directly expresses loaded bracing." },
        gaitLoadTransferContribution: { level: "high", notes: "Walking under bilateral external load directly expresses gait and load transfer." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "loaded_gait", exposureScope: "intrinsic", sideScope: "bilateral_or_systemic", notes: "Walking under external load is intrinsic." }),
      ownerStressAnnotation({ tag: "grip_loading", exposureScope: "intrinsic", sideScope: "bilateral_or_systemic", notes: "Holding one implement per hand intrinsically loads grip." }),
      ownerStressAnnotation({ tag: "grip_intensive", exposureScope: "dose_created", sideScope: "bilateral_or_systemic", notes: "Grip intensity requires explicit reviewed realized-dose authority." }),
      ownerStressAnnotation({ tag: "heavy_axial_loading", exposureScope: "dose_created", sideScope: "bilateral_or_systemic", notes: "Heavy axial exposure requires explicit reviewed realized-dose authority." }),
    ],
    progression: {
      progressionAxes: ["load", "distance", "trips", "duration", "effort"],
      transitionRelationships: [
        transition({ targetExerciseId: "suitcase-carry", direction: "lateral", classification: "context_dependent", purposes: ["stimulus_shift"], notes: "Bilateral and unilateral loaded carries answer distinct needs without automatic substitution.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Walk tall with quiet implements", "Use controlled turns and set-downs"],
  },
  {
    id: "suitcase-carry",
    name: "Suitcase Carry",
    summary: "Unilateral side-specific loaded walking carry.",
    family: "carry_load",
    movementRoles: ["carry", "anti_lateral_flexion_core", "loaded_bracing"],
    trainingRoles: ["capacity", "hypertrophy_accessory", "secondary_strength"],
    muscleContributions: contributions({ primary: ["trunk"], keySecondary: ["upper_back"], contextual: ["glutes", "quads", "hamstrings"] }),
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "ribcage", "pelvis", "hip", "knee", "ankle"],
    equipmentRequirements: [suitcaseCarryEquipment],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "suitcase-carry-loaded-gait-setup",
        type: "required_setup_skill",
        description: "Requires a safe single-implement pickup, side plan, gait path, turn, and set-down setup.",
      },
    ],
    sectionSuitability: sections({
      main: good("Provides intentional unilateral loaded capacity work."),
      accessory: good("Adds side-specific carry exposure when needed."),
    }),
    phaseSuitability: {
      phase_1: possible("Legacy migration value pending contextual evidence."),
      phase_2: good("Legacy migration value for unilateral loaded capacity."),
      phase_3: possible("Legacy migration value pending contextual evidence."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "suitcase-carry-phase-1-accessory-owner-review", exerciseId: "suitcase-carry", phaseId: "phase_1", suitability: "possible", reason: "Early asymmetric carry exposure requires further prescription-context review.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
      ownerPhaseAnnotation({ annotationId: "suitcase-carry-phase-2-main-owner-approved", exerciseId: "suitcase-carry", phaseId: "phase_2", suitability: "good", reason: "Directly serves recoverable unilateral loaded-gait and trunk-capacity development within Phase 2.", reviewStatus: "accepted", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["main"] }),
      ownerPhaseAnnotation({ annotationId: "suitcase-carry-phase-3-accessory-owner-unknown", exerciseId: "suitcase-carry", phaseId: "phase_3", suitability: "possible", reason: "No independent Phase 3 developmental preference is approved.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "high",
      loadingPotential: "high",
      skillDemand: "moderate",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "high",
      systemicFatigue: "moderate",
      axialLoading: "moderate",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "unknown",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "alternating", taskRole: "primary" },
        ],
        supportAmount: "none",
        supportRelationship: "unknown",
        reviewStatus: "accepted",
        notes: "Unsupported loaded gait with one prescription-side implement.",
      },
      resistancePath: {
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        lineOfPullAdjustability: "low",
        laterality: "unilateral",
        fitDependency: "low",
        reviewStatus: "accepted",
        notes: "The single implement and load side are prescription-realized.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("high", "Unilateral loaded walking requires trunk control."),
        scapular_control: demand("moderate", "The loaded upper quarter supports the implement."),
        stability: demand("moderate", "Walking under unilateral load creates dynamic stability demand."),
        coordination: demand("moderate", "Gait, load side, and posture must coordinate."),
        range: demand("low", "No large-range target is intrinsic."),
        joint_control: demand("moderate", "Side-specific load and gait make control relevant."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        antiRotationContribution: { level: "moderate", notes: "Unilateral load may require resisting unwanted rotation; magnitude remains context dependent." },
        antiLateralFlexionContribution: { level: "high", notes: "Unilateral loaded walking directly expresses anti-lateral-flexion control." },
        loadedBracingContribution: { level: "high", notes: "External load during gait directly expresses loaded bracing." },
        gaitLoadTransferContribution: { level: "high", notes: "Walking under unilateral load directly expresses gait and load transfer." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "loaded_gait", exposureScope: "intrinsic", sideScope: "bilateral_or_systemic", notes: "Walking under external load is intrinsic." }),
      ownerStressAnnotation({ tag: "grip_loading", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "Holding one implement intrinsically loads the prescribed-side grip." }),
      ownerStressAnnotation({ tag: "lateral_trunk_loading", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "Unilateral loaded gait intrinsically creates lateral trunk loading." }),
      ownerStressAnnotation({ tag: "grip_intensive", exposureScope: "dose_created", sideScope: "prescription_side", notes: "Grip intensity requires explicit reviewed realized-dose authority." }),
      ownerStressAnnotation({ tag: "heavy_axial_loading", exposureScope: "dose_created", sideScope: "bilateral_or_systemic", notes: "Heavy axial exposure requires explicit reviewed realized-dose authority." }),
    ],
    progression: {
      progressionAxes: ["load", "distance", "trips", "duration", "effort"],
      transitionRelationships: [
        transition({ targetExerciseId: "forearm-side-plank", direction: "lateral", classification: "context_dependent", purposes: ["change_resistance_path", "stimulus_shift"], notes: "Static side support and unilateral loaded gait are distinct contexts.", provenance: [STRESS_OWNER_DECISION_REF] }),
        transition({ targetExerciseId: "farmer-carry", direction: "lateral", classification: "context_dependent", purposes: ["stimulus_shift"], notes: "Unilateral and bilateral carries answer distinct needs.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Stay tall over each step", "Keep the load side controlled"],
  },
  {
    id: "wall-supported-suitcase-march",
    name: "Wall-Supported Suitcase March",
    summary: "Stationary alternating loaded march with opposite-hand wall support.",
    family: "carry_load",
    movementRoles: ["loaded_bracing"],
    trainingRoles: ["activation", "capacity"],
    muscleContributions: contributions({ primary: ["trunk"], contextual: ["glutes", "quads"] }),
    bodyRegions: ["shoulder", "wrist", "lumbar_spine", "ribcage", "pelvis", "hip", "knee", "ankle"],
    equipmentRequirements: [supportedMarchEquipment],
    optionalEquipment: [],
    prerequisites: [
      {
        id: "wall-supported-loaded-march-setup",
        type: "required_setup_skill",
        description: "Requires opposite-hand wall support and load-side setup without walking distance.",
      },
    ],
    sectionSuitability: sections({
      activation: excellent("Provides supported loaded-bracing position control."),
      accessory: good("Adds stationary supported loaded-march capacity."),
    }),
    phaseSuitability: {
      phase_1: good("Legacy migration value for supported control."),
      phase_2: possible("Legacy migration value pending contextual evidence."),
      phase_3: possible("Legacy migration remains unknown rather than poor."),
    },
    phaseSuitabilityAnnotations: [
      ownerPhaseAnnotation({ annotationId: "wall-supported-suitcase-march-phase-1-activation-owner-approved", exerciseId: "wall-supported-suitcase-march", phaseId: "phase_1", suitability: "good", reason: "Provides supported loaded-bracing, position control, and controlled stationary marching within Phase 1.", reviewStatus: "accepted", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["activation"], sessionSections: ["activation"] }),
      ownerPhaseAnnotation({ annotationId: "wall-supported-suitcase-march-phase-2-accessory-owner-review", exerciseId: "wall-supported-suitcase-march", phaseId: "phase_2", suitability: "possible", reason: "Phase 2 capacity use remains under review because support force and load transfer are unresolved.", reviewStatus: "needs_review", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
      ownerPhaseAnnotation({ annotationId: "wall-supported-suitcase-march-phase-3-accessory-owner-unknown", exerciseId: "wall-supported-suitcase-march", phaseId: "phase_3", suitability: "possible", reason: "No independent Phase 3 developmental evidence is approved; unknown is not poor.", reviewStatus: "unknown", sourceRef: SEVEN_PHASE_OWNER_DECISION_REF, trainingRoles: ["capacity"], sessionSections: ["accessory"] }),
    ],
    loading: {
      loadability: "moderate",
      loadingPotential: "moderate",
      skillDemand: "low",
      stabilityDemand: "moderate",
      coordinationDemand: "moderate",
      localFatigue: "moderate",
      systemicFatigue: "moderate",
      axialLoading: "low",
      jointStressTags: [],
    },
    mechanics: mechanics({
      support: {
        basePosition: "standing",
        stance: "alternating_march",
        orientation: "upright",
        supportContacts: [
          { bodyRegion: "foot", source: "floor", mode: "weight_bearing", side: "alternating", taskRole: "primary" },
          { bodyRegion: "hand", source: "wall", mode: "balance_assist", side: "unknown", taskRole: "secondary" },
        ],
        supportAmount: "prescription_modifiable",
        supportRelationship: "opposite_side_load",
        reviewStatus: "accepted",
        notes: "Wall-support force and opposite-side load relationship are prescription-realized.",
      },
      resistancePath: {
        resistancePath: "free_implement",
        trajectoryFreedom: "moderate",
        lineOfPullAdjustability: "low",
        laterality: "alternating",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
        notes: "One implement plus opposite wall support defines the stationary march.",
        provenance: [STRESS_OWNER_DECISION_REF],
      },
      demands: {
        trunk_control: demand("moderate", "Support-modified unilateral load requires position control."),
        scapular_control: demand("low", "Wall and implement positions are not scapular selection purposes."),
        stability: demand("moderate", "Alternating stationary march retains support-modified stability demand."),
        coordination: demand("moderate", "March, load side, and support side must coordinate."),
        range: demand("low", "March height is prescription controlled."),
        joint_control: demand("moderate", "Loaded marching and wall support remain relevant."),
      },
      trunkMechanics: reviewedSevenRowTrunkMechanics({
        loadedBracingContribution: { level: "moderate", notes: "Holding load while marching directly expresses support-modified loaded bracing." },
      }),
    }),
    stressAnnotations: [
      ownerStressAnnotation({ tag: "loaded_march", exposureScope: "intrinsic", sideScope: "bilateral_or_systemic", notes: "Stationary loaded marching is intrinsic and does not create loaded-gait or distance truth." }),
      ownerStressAnnotation({ tag: "grip_loading", exposureScope: "intrinsic", sideScope: "prescription_side", notes: "Holding one dumbbell intrinsically loads the prescribed-side grip." }),
      ownerStressAnnotation({ tag: "lateral_trunk_loading", exposureScope: "prescription_modifiable", sideScope: "prescription_side", notes: "Wall support, load side, and support force must realize lateral trunk loading before it can count.", reviewStatus: "needs_review" }),
    ],
    progression: {
      progressionAxes: ["load", "steps", "duration", "support_reduction", "effort"],
      transitionRelationships: [
        transition({ targetExerciseId: "suitcase-carry", direction: "progression", classification: "context_dependent", purposes: ["reduce_support", "movement_pattern_development"], notes: "Removing support and adding walking changes identity; this transition has no automatic selection effect.", provenance: [STRESS_OWNER_DECISION_REF] }),
      ],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: ["Use light wall support", "March without drifting toward the load"],
  },
] satisfies readonly CanonicalExerciseDefinition[];

export const REFERENCE_EXERCISES: readonly ExerciseDefinition[] =
  REFERENCE_EXERCISE_DEFINITIONS.map(defineExercise);

export function getReferenceExercise(id: string): ExerciseDefinition | undefined {
  return REFERENCE_EXERCISES.find((exercise) => exercise.id === id);
}
