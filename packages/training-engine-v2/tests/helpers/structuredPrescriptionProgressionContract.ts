import {
  CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
  CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
  CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
  FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS,
  buildCurrentEquipmentLegalityFingerprint,
  buildExpandedEquipmentFixtureFingerprint,
  type TrunkCarryFutureIdentity,
} from "./trunkCarryEquipmentContract";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";
import type {
  EffortTarget,
  EquipmentRequirement,
  ExerciseDefinition,
  ExercisePrescription,
  ExerciseProgressionAxis,
  ExecutionQualityCriterion,
  ExecutionQualityDimension,
  ExecutionStandard,
  LoadTarget,
  MovementRole,
  PrescriptionSideBehavior,
} from "../../src";
import {
  exactBreathCycles,
  exactCount,
  exactMetres,
  exactSeconds,
  exactSteps,
  validateStructuredPrescriptionContext,
} from "../../src";

export const STRUCTURED_PRESCRIPTION_CLASSIFICATION =
  "STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY";

const CREATED_AT = "2026-08-11T12:00:00.000Z";

function provenance(sourceRef: string) {
  return {
    source: "synthetic_contract_fixture" as const,
    sourceRef,
    notes: "Artificial contract fixture; not a recommended dose.",
  };
}

function criterion(
  id: string,
  dimension: ExecutionQualityDimension,
  description: string,
): ExecutionQualityCriterion {
  return {
    id,
    dimension,
    importance: "required_for_progression",
    source: "exercise_mechanics",
    description,
    provenance: provenance(`structured-fixture:${id}`),
  };
}

function executionStandard(input: {
  readonly fixtureId: TrunkCarryFutureIdentity;
  readonly intent: string;
  readonly criteria: readonly ExecutionQualityCriterion[];
  readonly sideBehavior?: PrescriptionSideBehavior;
}): ExecutionStandard {
  return {
    alignmentPriorityIds: [],
    assessmentPriorityIds: [],
    painResponseRequirementIds: [],
    exerciseMechanicsIntent: input.intent,
    sideBehavior: input.sideBehavior,
    criteria: input.criteria,
    provenance: provenance(`structured-fixture:${input.fixtureId}:execution`),
  };
}

function qualityLimitedEffort(
  requiredCriterionIds: readonly string[],
): EffortTarget {
  return {
    kind: "quality_limited",
    requiredCriterionIds,
    description:
      "Stop the synthetic set when required execution criteria are no longer maintained.",
  };
}

const rest = { kind: "exact", value: 60, unit: "seconds" } as const;
const bodyweightLoad: LoadTarget = { kind: "bodyweight" };
const machineLoad: LoadTarget = {
  kind: "machine_stack",
  target: { kind: "exact", setting: 3 },
  machineId: "abdominal_crunch",
  application: "machine_stack",
};
const cableLoad: LoadTarget = {
  kind: "cable_stack",
  target: { kind: "exact", value: 10, unit: "kg" },
  cableStackId: "synthetic-high-cable",
  application: "cable_stack",
};
const farmerLoad: LoadTarget = {
  kind: "external_load",
  target: { kind: "exact", value: 12, unit: "kg" },
  application: "per_hand",
};
const leftSuitcaseLoad: LoadTarget = {
  kind: "external_load",
  target: { kind: "exact", value: 8, unit: "kg" },
  application: "unilateral_side",
  side: "left",
};

export const STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES: readonly ExercisePrescription[] = [
  {
    prescriptionId: "fixture-prescription-forearm-plank",
    sourceExposureEventId: "fixture-source-forearm-plank",
    exerciseId: "forearm-plank",
    phaseId: "phase_1",
    createdAt: CREATED_AT,
    dose: {
      mode: "timed_hold",
      sets: exactCount(2),
      duration: { kind: "range", min: 20, max: 30, unit: "seconds" },
      load: bodyweightLoad,
      lever: { state: "standard" },
      support: { level: "none", surface: "floor" },
      effort: qualityLimitedEffort(["forearm-plank-position-control"]),
      rest,
      laterality: { kind: "bilateral" },
    },
    executionStandard: executionStandard({
      fixtureId: "forearm-plank",
      intent: "Maintain the anti-extension hold at the selected lever.",
      criteria: [
        criterion(
          "forearm-plank-position-control",
          "position_control",
          "Ribcage and pelvis remain organized for the reviewed hold.",
        ),
      ],
    }),
    rationale: ["Synthetic timed-hold fixture for anti-extension dose shape."],
    intendedProgressionAxes: ["duration", "lever", "effort"],
    provenance: provenance("structured-fixture:forearm-plank"),
  },
  {
    prescriptionId: "fixture-prescription-forearm-side-plank",
    sourceExposureEventId: "fixture-source-forearm-side-plank",
    exerciseId: "forearm-side-plank",
    phaseId: "phase_1",
    createdAt: CREATED_AT,
    dose: {
      mode: "timed_hold",
      sets: exactCount(2),
      duration: exactSeconds(20),
      load: bodyweightLoad,
      lever: { state: "shortened_regressed" },
      support: { level: "partial", surface: "floor" },
      effort: qualityLimitedEffort(["side-plank-lateral-position"]),
      rest,
      laterality: { kind: "each_side" },
      sideBehavior: { movementSide: { kind: "each_side" } },
    },
    executionStandard: executionStandard({
      fixtureId: "forearm-side-plank",
      intent: "Maintain lateral trunk position on each side.",
      criteria: [
        criterion(
          "side-plank-lateral-position",
          "side_or_symmetry_control",
          "The lateral line remains controlled for the selected side and lever.",
        ),
      ],
      sideBehavior: { movementSide: { kind: "each_side" } },
    }),
    rationale: ["Synthetic each-side timed-hold fixture for lateral control."],
    intendedProgressionAxes: ["duration", "lever", "support_reduction"],
    provenance: provenance("structured-fixture:forearm-side-plank"),
  },
  {
    prescriptionId: "fixture-prescription-machine-abdominal-crunch",
    sourceExposureEventId: "fixture-source-machine-abdominal-crunch",
    exerciseId: "machine-abdominal-crunch",
    phaseId: "phase_2",
    createdAt: CREATED_AT,
    dose: {
      mode: "repetition_sets",
      sets: exactCount(2),
      repetitions: { kind: "range", min: 8, max: 10, unit: "count" },
      load: machineLoad,
      range: {
        kind: "custom_reviewed",
        reviewedRangeId: "fixture-machine-flexion-range",
        description: "Artificial reviewed range for contract validation.",
      },
      tempo: {
        eccentricSeconds: 2,
        pauseSeconds: 0.5,
        concentricIntent: "controlled",
        description: "Synthetic controlled flexion tempo.",
      },
      effort: { kind: "rir", target: { kind: "range", min: 2, max: 4 } },
      rest,
      laterality: { kind: "bilateral" },
    },
    executionStandard: executionStandard({
      fixtureId: "machine-abdominal-crunch",
      intent: "Controlled trunk flexion through a reviewed machine range.",
      criteria: [
        criterion(
          "machine-crunch-controlled-flexion",
          "movement_control",
          "The machine-guided flexion remains controlled through the reviewed range.",
        ),
      ],
    }),
    rationale: ["Synthetic repetition-sets fixture for machine flexion."],
    intendedProgressionAxes: ["load", "reps", "sets", "range", "tempo"],
    provenance: provenance("structured-fixture:machine-abdominal-crunch"),
  },
  {
    prescriptionId: "fixture-prescription-cable-chop",
    sourceExposureEventId: "fixture-source-cable-chop",
    exerciseId: "half-kneeling-high-to-low-cable-chop",
    phaseId: "phase_2",
    createdAt: CREATED_AT,
    dose: {
      mode: "repetition_sets",
      sets: exactCount(2),
      repetitions: exactCount(8),
      perSide: true,
      load: cableLoad,
      range: {
        kind: "custom_reviewed",
        reviewedRangeId: "fixture-high-to-low-chop-range",
        description: "Artificial rotational path range for contract validation.",
      },
      tempo: {
        eccentricSeconds: 2,
        concentricIntent: "controlled",
        description: "Synthetic controlled return.",
      },
      effort: { kind: "rpe", target: { kind: "range", min: 6, max: 7 } },
      rest,
      laterality: { kind: "each_side" },
      sideBehavior: { movementSide: { kind: "each_side" } },
    },
    executionStandard: executionStandard({
      fixtureId: "half-kneeling-high-to-low-cable-chop",
      intent: "Controlled high-to-low rotation from a reviewed half-kneeling stance.",
      criteria: [
        criterion(
          "cable-chop-controlled-rotation",
          "movement_control",
          "The rotation and return remain controlled without momentum.",
        ),
        criterion(
          "cable-chop-pelvis-position",
          "position_control",
          "The pelvis remains organized for the selected half-kneeling side.",
        ),
      ],
      sideBehavior: { movementSide: { kind: "each_side" } },
    }),
    rationale: ["Synthetic per-side repetition fixture for controlled rotation."],
    intendedProgressionAxes: ["load", "reps", "sets", "range", "tempo"],
    provenance: provenance("structured-fixture:half-kneeling-high-to-low-cable-chop"),
  },
  {
    prescriptionId: "fixture-prescription-farmer-carry",
    sourceExposureEventId: "fixture-source-farmer-carry",
    exerciseId: "farmer-carry",
    phaseId: "phase_2",
    createdAt: CREATED_AT,
    dose: {
      mode: "distance_carry",
      trips: exactCount(2),
      distancePerTrip: exactMetres(20),
      load: farmerLoad,
      rest,
      laterality: { kind: "bilateral" },
      gaitControlStandard: "Synthetic gait-control standard.",
    },
    executionStandard: executionStandard({
      fixtureId: "farmer-carry",
      intent: "Carry bilateral loads with reviewed gait and bracing control.",
      criteria: [
        criterion(
          "farmer-carry-gait-control",
          "gait_load_transfer_control",
          "Loaded gait remains controlled for the prescribed trip.",
        ),
        criterion(
          "farmer-carry-loaded-bracing",
          "position_control",
          "Loaded bracing remains acceptable across the trip.",
        ),
      ],
    }),
    rationale: ["Synthetic distance-carry fixture with per-hand load."],
    intendedProgressionAxes: ["load", "distance", "trips", "duration"],
    provenance: provenance("structured-fixture:farmer-carry"),
  },
  {
    prescriptionId: "fixture-prescription-suitcase-carry",
    sourceExposureEventId: "fixture-source-suitcase-carry",
    exerciseId: "suitcase-carry",
    phaseId: "phase_2",
    createdAt: CREATED_AT,
    dose: {
      mode: "timed_carry",
      trips: exactCount(2),
      durationPerTrip: exactSeconds(30),
      load: leftSuitcaseLoad,
      rest,
      laterality: { kind: "each_side" },
      sideBehavior: {
        movementSide: { kind: "each_side" },
        loadSide: "left",
        startingSide: "left",
        alternates: true,
      },
      gaitControlStandard: "Synthetic unilateral gait-control standard.",
    },
    executionStandard: executionStandard({
      fixtureId: "suitcase-carry",
      intent: "Carry unilateral load while preserving gait and lateral trunk control.",
      criteria: [
        criterion(
          "suitcase-carry-lateral-control",
          "side_or_symmetry_control",
          "The user controls lateral trunk position for the loaded side.",
        ),
        criterion(
          "suitcase-carry-gait-control",
          "gait_load_transfer_control",
          "Loaded gait remains controlled for the prescribed time.",
        ),
      ],
      sideBehavior: {
        movementSide: { kind: "each_side" },
        loadSide: "left",
        startingSide: "left",
        alternates: true,
      },
    }),
    rationale: ["Synthetic timed-carry fixture with unilateral side truth."],
    intendedProgressionAxes: ["load", "duration", "trips"],
    provenance: provenance("structured-fixture:suitcase-carry"),
  },
  {
    prescriptionId: "fixture-prescription-wall-supported-suitcase-march",
    sourceExposureEventId: "fixture-source-wall-supported-suitcase-march",
    exerciseId: "wall-supported-suitcase-march",
    phaseId: "phase_1",
    createdAt: CREATED_AT,
    dose: {
      mode: "step_march",
      stationary: true,
      steps: exactSteps(20),
      load: leftSuitcaseLoad,
      support: {
        level: "partial",
        surface: "wall",
        side: "right",
        description: "Synthetic opposite-side wall support.",
      },
      rest,
      laterality: { kind: "alternating", startingSide: "left" },
      sideBehavior: {
        movementSide: { kind: "alternating", startingSide: "left" },
        loadSide: "left",
        supportSide: "right",
        sideRelationship: "opposite_side",
        alternates: true,
      },
      alternation: "alternating",
      marchControlStandard: "Synthetic stationary march control.",
    },
    executionStandard: executionStandard({
      fixtureId: "wall-supported-suitcase-march",
      intent:
        "March in place with one loaded side and separately represented wall-support side.",
      criteria: [
        criterion(
          "wall-march-stationary-truth",
          "gait_load_transfer_control",
          "The march remains stationary and earns no distance-carry credit.",
        ),
        criterion(
          "wall-march-support-control",
          "support_control",
          "Wall support remains a balance/support input, not a hidden gait-space claim.",
        ),
      ],
      sideBehavior: {
        movementSide: { kind: "alternating", startingSide: "left" },
        loadSide: "left",
        supportSide: "right",
        sideRelationship: "opposite_side",
        alternates: true,
      },
    }),
    rationale: ["Synthetic stationary step/march fixture with no distance truth."],
    intendedProgressionAxes: ["steps", "duration", "load", "support_reduction"],
    provenance: provenance("structured-fixture:wall-supported-suitcase-march"),
  },
];

export function structuredFixtureById(
  id: TrunkCarryFutureIdentity,
): ExercisePrescription {
  const found = STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES.find(
    (fixture) => fixture.exerciseId === id,
  );
  if (!found) {
    throw new Error(`Missing structured fixture ${id}`);
  }
  return found;
}

export function syntheticExerciseForFixture(
  id: TrunkCarryFutureIdentity,
): ExerciseDefinition {
  const fixture = structuredFixtureById(id);
  const requirement = FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS.find(
    (contract) => contract.exerciseId === id,
  );
  if (!requirement) {
    throw new Error(`Missing equipment requirement for ${id}`);
  }

  return {
    id,
    name: `Synthetic ${id}`,
    summary: "Synthetic contract-only exercise definition.",
    family:
      id.includes("carry") || id.includes("march") ? "carry_load" : "core_control",
    movementRoles: movementRolesFor(id),
    trainingRoles: ["activation", "hypertrophy_accessory", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: [],
    bodyRegions: ["lumbar_spine", "pelvis"],
    equipmentRequirements: requirement.requirements as readonly EquipmentRequirement[],
    optionalEquipment: [],
    prerequisites: [],
    sectionSuitability: {
      activation: { suitability: "possible", reason: "Synthetic fixture only." },
      accessory: { suitability: "possible", reason: "Synthetic fixture only." },
    },
    phaseSuitability: {
      phase_1: { suitability: "possible", reason: "Synthetic fixture only." },
      phase_2: { suitability: "possible", reason: "Synthetic fixture only." },
      phase_3: { suitability: "possible", reason: "Synthetic fixture only." },
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
      jointStressTags: [],
    },
    progression: {
      progressionAxes: fixture.intendedProgressionAxes as readonly ExerciseProgressionAxis[],
      transitionRelationships: [],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
    coachingFocus: [],
  };
}

export function buildStructuredPrescriptionContractData() {
  const curationFingerprints = buildCurrentTrunkCurationFingerprints();
  const fixtureResults = STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES.map(
    (fixture) => ({
      exerciseId: fixture.exerciseId,
      mode: fixture.dose.mode,
      validationStatus: validateStructuredPrescriptionContext({
        exercise: syntheticExerciseForFixture(
          fixture.exerciseId as TrunkCarryFutureIdentity,
        ),
        equipment: CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
        prescription: fixture,
      }).status,
      sourceExposureEventId: fixture.sourceExposureEventId,
    }),
  );

  return {
    classification: STRUCTURED_PRESCRIPTION_CLASSIFICATION,
    fixtureResults,
    productionRankingFingerprint: curationFingerprints.productionRanking,
    productionRankingMatches:
      curationFingerprints.productionRanking ===
      CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    comprehensiveBehaviorFingerprint: curationFingerprints.comprehensiveBehavior,
    comprehensiveBehaviorMatches:
      curationFingerprints.comprehensiveBehavior ===
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    referenceCatalogFingerprint: curationFingerprints.referenceCatalog,
    referenceCatalogMatches:
      curationFingerprints.referenceCatalog ===
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    equipmentLegalityFingerprint: buildCurrentEquipmentLegalityFingerprint(),
    equipmentLegalityMatches:
      buildCurrentEquipmentLegalityFingerprint() ===
      CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
    expandedEquipmentFixtureFingerprint: buildExpandedEquipmentFixtureFingerprint(),
    expandedEquipmentFixtureMatches:
      buildExpandedEquipmentFixtureFingerprint() ===
      CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
  };
}

export function renderStructuredPrescriptionContractReport(
  data = buildStructuredPrescriptionContractData(),
): string {
  const fixtureTable = data.fixtureResults
    .map(
      (result) =>
        `| ${result.exerciseId} | ${result.mode} | ${result.validationStatus} | ${result.sourceExposureEventId} |`,
    )
    .join("\n");

  return [
    "# Structured Prescription and Progression Contract Report",
    "",
    "## Synthetic Fixture Results",
    "",
    "| Fixture | Dose mode | Validation status | Source exposure |",
    "| --- | --- | --- | --- |",
    fixtureTable,
    "",
    "## Current Behavior Fingerprints",
    "",
    `- 22-scenario ranking: ${data.productionRankingFingerprint} (${data.productionRankingMatches ? "matches" : "changed"})`,
    `- Comprehensive behavior: ${data.comprehensiveBehaviorFingerprint} (${data.comprehensiveBehaviorMatches ? "matches" : "changed"})`,
    `- Reference catalog: ${data.referenceCatalogFingerprint} (${data.referenceCatalogMatches ? "matches" : "changed"})`,
    `- Equipment legality: ${data.equipmentLegalityFingerprint} (${data.equipmentLegalityMatches ? "matches" : "changed"})`,
    `- Expanded equipment fixtures: ${data.expandedEquipmentFixtureFingerprint} (${data.expandedEquipmentFixtureMatches ? "matches" : "changed"})`,
    "",
    "## Classification",
    "",
    `**${data.classification}**`,
  ].join("\n");
}

function movementRolesFor(
  id: TrunkCarryFutureIdentity,
): readonly MovementRole[] {
  switch (id) {
    case "forearm-plank":
      return ["anti_extension_core"];
    case "forearm-side-plank":
      return ["anti_lateral_flexion_core"];
    case "machine-abdominal-crunch":
      return ["trunk_flexion"];
    case "half-kneeling-high-to-low-cable-chop":
      return ["trunk_rotation"];
    case "farmer-carry":
      return ["carry", "loaded_bracing"];
    case "suitcase-carry":
    case "wall-supported-suitcase-march":
      return ["carry", "anti_lateral_flexion_core", "loaded_bracing"];
  }
}
