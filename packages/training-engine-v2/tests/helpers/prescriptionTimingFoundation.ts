import { createHash } from "node:crypto";
import {
  EXERCISE_DOSE_MODES,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  adaptLegacyTempoPrescription,
  exactCount,
  exactMetres,
  exactSeconds,
  exactSteps,
  validateDose,
  validateExerciseCatalog,
  validateExercisePerformanceRecord,
  type ExerciseDose,
  type ExercisePerformanceRecord,
  type TempoPrescription,
} from "../../src";
import { CAGT_TIMING_DIFFERENCE_DIMENSIONS } from "../cagt/contracts";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";

export const PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION =
  "PRESCRIPTION_TIMING_FOUNDATION_READY_FOR_NON_PRODUCTION_COMPILER_DESIGN";

const CREATED_AT = "2026-08-13T09:00:00-04:00";

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function provenance(sourceRef: string) {
  return {
    source: "synthetic_contract_fixture" as const,
    sourceRef,
    notes: "Prescription timing foundation fixture; not a production numeric policy.",
  };
}

export function codes(findings: readonly { readonly code: string }[]): readonly string[] {
  return findings.map((finding) => finding.code);
}

function countBy<T extends string>(values: readonly T[]): Record<T, number> {
  return values.reduce<Record<T, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {} as Record<T, number>);
}

function acceptedTempo(): TempoPrescription {
  return {
    kind: "repetition_phase_tempo",
    eccentric: { kind: "exact_seconds", seconds: 2 },
    lengthenedTransition: {
      kind: "not_prescribed",
      reason: "No lengthened pause is prescribed.",
    },
    concentric: { kind: "intent_only", intent: "controlled" },
    shortenedTransition: {
      kind: "not_prescribed",
      reason: "No shortened pause is prescribed.",
    },
    provenance: provenance("prescription-timing-foundation:tempo-v2"),
  };
}

export function validStepSetsDose(): Extract<ExerciseDose, { readonly mode: "step_sets" }> {
  return {
    mode: "step_sets",
    sets: exactCount(2),
    steps: exactSteps(8),
    stepCountInterpretation:
      "Synthetic fixture counts reviewed purposeful steps inside one set; it does not claim stationary march or distance.",
    alternation: "alternating",
    stepCadence: {
      kind: "locomotor_or_step_cadence",
      intent: "controlled",
      provenance: provenance("prescription-timing-foundation:step-cadence"),
    },
  };
}

function performanceRecord(
  overrides: Partial<ExercisePerformanceRecord> = {},
): ExercisePerformanceRecord {
  return {
    performanceRecordId: "timing-performance-1",
    prescriptionId: "timing-prescription-1",
    exerciseId: "machine-abdominal-crunch",
    occurredAt: CREATED_AT,
    completionStatus: "completed_as_planned",
    actualDose: {
      mode: "repetition_sets",
      sets: exactCount(2),
      repetitions: exactCount(8),
      tempo: { kind: "unknown", reason: "Actual phase timing was not observed.", provenance: provenance("timing-performance:actual-dose") },
    },
    actualTiming: {
      actualTempo: {
        kind: "unknown",
        reason: "No actual tempo observation was captured.",
        provenance: provenance("timing-performance:actual-tempo"),
      },
      actualDuration: {
        kind: "not_observed",
        reason: "No stopwatch observation was captured.",
        provenance: provenance("timing-performance:actual-duration"),
      },
      timingControlObservationCriterionIds: ["machine-crunch-controlled-flexion"],
      prescribedTempoAssumedActual: false,
      prescribedDurationAssumedActual: false,
    },
    qualityObservations: [],
    unresolvedPainResponseEvidenceIds: [],
    trainingResponseObservationIds: [],
    recoveryEvidenceIds: [],
    substitutions: [],
    notes: [],
    provenance: provenance("timing-performance"),
    ...overrides,
  };
}

export function buildPrescriptionTimingFoundationData() {
  const profiles = REFERENCE_EXERCISES.map((exercise) => exercise.prescriptionKnowledge);
  const doseModeCounts = countBy(profiles.map((profile) => profile.primaryDoseMode));
  const timingModelCounts = countBy(profiles.map((profile) => profile.timingModel));
  const rowsWithRepetitionTempo = REFERENCE_EXERCISES
    .filter((exercise) => exercise.prescriptionKnowledge.repetitionTempo.status === "applicable")
    .map((exercise) => exercise.id);
  const rowsWithPrimaryDuration = REFERENCE_EXERCISES
    .filter((exercise) => exercise.prescriptionKnowledge.duration.status === "primary_duration_dose")
    .map((exercise) => exercise.id);
  const rowsWithAlternateDuration = REFERENCE_EXERCISES
    .filter((exercise) => exercise.prescriptionKnowledge.duration.status === "legal_alternative_duration_dose")
    .map((exercise) => exercise.id);
  const rowsWithBreathCadence = REFERENCE_EXERCISES
    .filter((exercise) => exercise.prescriptionKnowledge.breathingCadence.status === "optional_structured")
    .map((exercise) => exercise.id);
  const rowsWithLocomotorCadence = REFERENCE_EXERCISES
    .filter((exercise) => exercise.prescriptionKnowledge.locomotorCadence.status === "optional_structured")
    .map((exercise) => exercise.id);
  const explicitUnknowns = REFERENCE_EXERCISES.flatMap((exercise) =>
    exercise.prescriptionKnowledge.unknowns.map((unknown) => ({
      exerciseId: exercise.id,
      unknown,
    })),
  );

  const legacyAmbiguous = adaptLegacyTempoPrescription({
    legacy: {
      eccentricSeconds: 2,
      pauseSeconds: 1,
      concentricIntent: "controlled",
      description: "Legacy fixture with ambiguous pause authority.",
    },
    provenance: provenance("prescription-timing-foundation:legacy-tempo"),
  });

  const mutationResults = {
    stepSetsValid: codes(validateDose(validStepSetsDose())),
    stepMarchDistanceClaim: codes(validateDose({
      mode: "step_march",
      stationary: true,
      steps: exactSteps(10),
      marchControlStandard: "Synthetic stationary march.",
      distance: exactMetres(5),
    } as unknown as ExerciseDose)),
    stepMarchNotStationary: codes(validateDose({
      mode: "step_march",
      stationary: false,
      steps: exactSteps(10),
      marchControlStandard: "Synthetic stationary march.",
    } as unknown as ExerciseDose)),
    timedHoldWithTempo: codes(validateDose({
      mode: "timed_hold",
      sets: exactCount(2),
      duration: exactSeconds(20),
      tempo: acceptedTempo(),
    } as unknown as ExerciseDose)),
    breathCyclesWithTempo: codes(validateDose({
      mode: "breath_cycles",
      rounds: exactCount(2),
      breathCycles: { kind: "exact", value: 4, unit: "breath_cycles" },
      tempo: acceptedTempo(),
    } as unknown as ExerciseDose)),
    carryWithTempo: codes(validateDose({
      mode: "distance_carry",
      trips: exactCount(2),
      distancePerTrip: exactMetres(20),
      gaitControlStandard: "Synthetic gait control.",
      tempo: acceptedTempo(),
    } as unknown as ExerciseDose)),
    legacyAmbiguousStatus:
      legacyAmbiguous.kind === "legacy_compatibility"
        ? legacyAmbiguous.migrationStatus
        : "unexpected",
    actualTimingValid: codes(validateExercisePerformanceRecord(performanceRecord())),
    actualTimingAssumptionRejected: codes(validateExercisePerformanceRecord(performanceRecord({
      actualTiming: {
        actualTempo: {
          kind: "unknown",
          reason: "No actual tempo observation was captured.",
          provenance: provenance("timing-performance:actual-tempo"),
        },
        timingControlObservationCriterionIds: [],
        prescribedTempoAssumedActual: true,
        prescribedDurationAssumedActual: false,
      } as unknown as ExercisePerformanceRecord["actualTiming"],
    }))),
  };

  const cagtTimingDimensions = [
    "dose_mode_knowledge",
    "tempo_capability",
    "duration_capability",
    "timing_policy_requirement",
    "timing_provenance",
    "duration_determinability",
    "unknown_tempo_contribution",
    "actual_tempo",
    "actual_duration",
    "timing_control_observation",
  ] as const;

  const timingConsequenceLab = [
    { id: "no-fixed-tempo", result: "CONTROLLED_OR_NATURAL_INTENT_WITHOUT_NUMERIC_POLICY" },
    { id: "exact-phase-tempo", result: "LEGAL_ONLY_FOR_DYNAMIC_REPETITION_WITH_EXPLICIT_PHASES" },
    { id: "timed-hold", result: "DURATION_DOSE_WITHOUT_REPETITION_TEMPO" },
    { id: "distance-vs-timed-carry", result: "ONE_CARRY_IDENTITY_WITH_ALTERNATE_TRIP_DOSE" },
    { id: "steps-vs-duration-march", result: "STATIONARY_MARCH_NO_DISTANCE_CREDIT" },
    { id: "breath-cycles", result: "BREATH_COUNT_OR_CADENCE_WITHOUT_REP_TEMPO" },
  ] as const;

  const curation = {
    doseModes: profiles.map((profile) => ({
      exerciseId: profile.exerciseId,
      primaryDoseMode: profile.primaryDoseMode,
      legalAlternateDoseModes: profile.legalAlternateDoseModes,
    })),
    tempo: profiles.map((profile) => ({
      exerciseId: profile.exerciseId,
      timingModel: profile.timingModel,
      repetitionTempo: profile.repetitionTempo.status,
      legalTimingProgressionAxes: profile.legalTimingProgressionAxes,
    })),
    duration: profiles.map((profile) => ({
      exerciseId: profile.exerciseId,
      duration: profile.duration.status,
      contexts: profile.duration.contexts,
    })),
  };
  const behavior = buildCurrentTrunkCurationFingerprints();
  const fingerprints = {
    timingOntologyAudit: hash({ modes: EXERCISE_DOSE_MODES, timingModels: timingModelCounts }),
    doseModeVocabulary: hash(EXERCISE_DOSE_MODES),
    stepModeDecision: hash({
      decision: "step_sets",
      rows: ["loop-band-lateral-walk", "supine-hamstring-walkout"],
    }),
    exercisePrescriptionKnowledgeProfile: hash(profiles),
    doseModeCuration45Rows: hash(curation.doseModes),
    tempoCuration45Rows: hash(curation.tempo),
    durationCuration45Rows: hash(curation.duration),
    tempoPrescriptionV2: hash(acceptedTempo()),
    legacyTempoMigration: hash(legacyAmbiguous),
    breathingCadenceBoundary: hash(rowsWithBreathCadence),
    locomotorMarchCadenceBoundary: hash(rowsWithLocomotorCadence),
    progressionAxisAgreement: hash(curation.tempo.map((row) => ({
      exerciseId: row.exerciseId,
      legalTimingProgressionAxes: row.legalTimingProgressionAxes,
    }))),
    performanceTimingTruth: hash(mutationResults.actualTimingValid),
    evidenceInventory: hash([
      "ACSM 2026 Position Stand PMID 41843416",
      "Schoenfeld 2015 PMID 25601394",
      "Amdi 2025 PMID 40692176",
      "Enes 2025 DOI 10.1519/JSC.0000000000005302",
    ]),
    compilerDesign: hash({ status: "DESIGN_ONLY", output: "NON_PRODUCTION_PRESCRIPTION_FIXTURE" }),
    reviewedPolicyDesign: hash({ missing: "PRESCRIPTION_POLICY_REQUIRED", conflict: "PRESCRIPTION_POLICY_CONFLICT" }),
    consequenceLab: hash(timingConsequenceLab),
    cagtTimingMatrix: hash(cagtTimingDimensions),
    knowledgeCompatibility: hash(REFERENCE_EXERCISES.map((exercise) => ({
      id: exercise.id,
      canonicalProfileId: exercise.prescriptionKnowledge.profileId,
      publicKnowledgeLayerDependency: false,
    }))),
    combinedPrescriptionTimingFoundation: "",
  };
  fingerprints.combinedPrescriptionTimingFoundation = hash(fingerprints);

  return {
    classification: PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION,
    catalogCount: REFERENCE_EXERCISES.length,
    validationErrors: validateExerciseCatalog(REFERENCE_EXERCISES)
      .filter((finding) => finding.severity === "error"),
    doseModeCounts,
    timingModelCounts,
    rowsWithRepetitionTempo,
    rowsWithPrimaryDuration,
    rowsWithAlternateDuration,
    rowsWithBreathCadence,
    rowsWithLocomotorCadence,
    explicitUnknowns,
    stepModeDecision:
      "STEP_SETS_IMPLEMENTED_FOR_LOOP_BAND_LATERAL_WALK_AND_SUPINE_HAMSTRING_WALKOUT",
    mutationResults,
    cagtTimingDimensions,
    cagtTimingDimensionCoverage: cagtTimingDimensions.every((dimension) =>
      CAGT_TIMING_DIFFERENCE_DIMENSIONS.includes(dimension),
    ),
    timingConsequenceLab,
    candidateBehavior: {
      rankingFingerprint: behavior.productionRanking,
      rankingMatches: behavior.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      comprehensiveFingerprint: behavior.comprehensiveBehavior,
      comprehensiveMatches:
        behavior.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      catalogIdentityFingerprint: hash(
        REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name })),
      ),
      catalogBehaviorMetadataFingerprint: behavior.referenceCatalog,
      catalogPrescriptionMetadataFingerprint:
        behavior.referenceCatalogWithPrescriptionKnowledge,
    },
    fingerprints,
  };
}
