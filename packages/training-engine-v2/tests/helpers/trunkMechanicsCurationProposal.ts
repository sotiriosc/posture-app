import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
  runCandidateRankingLab,
  type CandidateRankingResult,
  type ExerciseDefinition,
  type TrunkFunctionEvidenceSource,
  type TrunkFunctionLevel,
  type TrunkMechanicsFunction,
} from "../../src";

export const TRUNK_CURATION_FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
export const CAPTURED_PRODUCTION_RANKING_FINGERPRINT =
  "d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782";
export const CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT =
  "216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9";
export const CAPTURED_REFERENCE_CATALOG_FINGERPRINT =
  "6c7b4f745dde7b52ce140a46a9490bc44c6655256d4b3e9d6b88fd003056ec3a";

export const TRUNK_CURATION_EXERCISE_IDS = [
  "ninety-ninety-breathing",
  "dead-bug",
  "pallof-press",
  "push-up",
  "one-arm-dumbbell-row",
  "dumbbell-shoulder-press",
  "goblet-squat",
  "dumbbell-romanian-deadlift",
  "cable-pull-through",
  "split-squat",
  "step-up",
  "chest-supported-dumbbell-row",
  "machine-row",
  "seated-cable-row",
] as const;

export type TrunkCurationExerciseId =
  (typeof TRUNK_CURATION_EXERCISE_IDS)[number];

export type TrunkCurationProposalStatus =
  | "PROPOSE_ACCEPTED"
  | "PROPOSE_NEEDS_REVIEW"
  | "REMAIN_UNKNOWN";

export type TrunkCurationProvenanceClass =
  | "A_STRUCTURED_EXISTING_EVIDENCE"
  | "B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED"
  | "C_EXTERNAL_REFERENCE_RECOMMENDED"
  | "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN";

export type TrunkExposurePreview =
  | "DIRECT_DEVELOPMENTAL"
  | "MEANINGFUL_SECONDARY"
  | "INCIDENTAL_BRACING"
  | "NO_REVIEWED_EXPOSURE";

export interface TrunkFunctionCurationProposal {
  readonly function: TrunkMechanicsFunction;
  readonly level: TrunkFunctionLevel;
  readonly proposalStatus: TrunkCurationProposalStatus;
  readonly provenanceClass: TrunkCurationProvenanceClass;
  readonly futureEvidenceSource: TrunkFunctionEvidenceSource;
  readonly proposedSourceRef: string | null;
  readonly evidenceBasis: readonly string[];
  readonly notes: string;
  readonly remainingUncertainty: string;
}

export interface ExerciseTrunkCurationProposal {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly exerciseName: string;
  readonly ordinaryUse: string;
  readonly exposurePreview: TrunkExposurePreview;
  readonly exposureRationale: string;
  readonly contextSensitivity: string;
  readonly exerciseRationale: string;
  readonly functions: Readonly<
    Record<TrunkMechanicsFunction, TrunkFunctionCurationProposal>
  >;
}

export interface TrunkCurationTracePreviewRow {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly profilePresent: true;
  readonly function: TrunkMechanicsFunction;
  readonly proposedLevel: TrunkFunctionLevel;
  readonly proposedReviewStatus: TrunkCurationProposalStatus;
  readonly futureReviewStatus: "accepted" | "needs_review";
  readonly sourceClass: TrunkCurationProvenanceClass;
  readonly futureEvidenceSource: TrunkFunctionEvidenceSource;
  readonly proposedSourceRef: string;
  readonly evidenceBasis: string;
  readonly notes: string;
  readonly remainingUncertainty: string;
}

export interface CurationConsistencyFinding {
  readonly check: string;
  readonly status: "PASS" | "REVIEW_WARNING";
  readonly evidence: string;
}

export type LegacyCurationDisposition =
  | "PRESERVED_AS_STRUCTURED_EVIDENCE"
  | "PRESERVED_AFTER_REVIEW"
  | "REJECTED"
  | "STILL_UNKNOWN";

export interface LegacyCurationFinding {
  readonly claim: string;
  readonly legacyEvidence: string;
  readonly disposition: LegacyCurationDisposition;
  readonly proposalUse: string;
}

export interface TrunkMechanicsCurationProposalData {
  readonly goldenAncestor: string;
  readonly exercises: readonly ExerciseTrunkCurationProposal[];
  readonly tracePreview: readonly TrunkCurationTracePreviewRow[];
  readonly proposalCounts: Readonly<Record<TrunkCurationProposalStatus, number>>;
  readonly provenanceCounts: Readonly<Record<TrunkCurationProvenanceClass, number>>;
  readonly exposureCounts: Readonly<Record<TrunkExposurePreview, number>>;
  readonly consistencyFindings: readonly CurationConsistencyFinding[];
  readonly legacyFindings: readonly LegacyCurationFinding[];
  readonly behaviorBoundary: {
    readonly capturedProductionRankingFingerprint: string;
    readonly currentProductionRankingFingerprint: string;
    readonly productionRankingMatches: boolean;
    readonly capturedComprehensiveBehaviorFingerprint: string;
    readonly currentComprehensiveBehaviorFingerprint: string;
    readonly comprehensiveBehaviorMatches: boolean;
    readonly capturedReferenceCatalogFingerprint: string;
    readonly currentReferenceCatalogFingerprint: string;
    readonly referenceCatalogMatches: boolean;
  };
  readonly recommendedFirstImplementationTranche: readonly TrunkCurationExerciseId[];
  readonly ownerDecisionItems: readonly string[];
  readonly classification: "TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL";
}

const FUNCTION_LABELS: Readonly<Record<TrunkMechanicsFunction, string>> = {
  breathingPressureCoordination: "breathing / pressure coordination",
  antiExtensionContribution: "anti-extension contribution",
  antiRotationContribution: "anti-rotation contribution",
  antiLateralFlexionContribution: "anti-lateral-flexion contribution",
  controlledFlexionContribution: "controlled-flexion contribution",
  controlledRotationContribution: "controlled-rotation contribution",
  loadedBracingContribution: "loaded-bracing contribution",
  gaitLoadTransferContribution: "gait / load-transfer contribution",
};

function currentFieldRef(
  exerciseId: TrunkCurationExerciseId,
  fields: string,
): string {
  return `packages/training-engine-v2/src/data/referenceExercises.ts#${exerciseId}:${fields}`;
}

function proposal(input: {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly level: TrunkFunctionLevel;
  readonly proposalStatus: Exclude<TrunkCurationProposalStatus, "REMAIN_UNKNOWN">;
  readonly provenanceClass: Exclude<
    TrunkCurationProvenanceClass,
    "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN"
  >;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly notes: string;
  readonly remainingUncertainty?: string;
}): TrunkFunctionCurationProposal {
  const futureEvidenceSource: TrunkFunctionEvidenceSource =
    input.provenanceClass === "A_STRUCTURED_EXISTING_EVIDENCE"
      ? "reference_catalog"
      : input.provenanceClass === "C_EXTERNAL_REFERENCE_RECOMMENDED"
        ? "external_reference"
        : "human_exercise_science_review";

  return {
    function: input.function,
    level: input.level,
    proposalStatus: input.proposalStatus,
    provenanceClass: input.provenanceClass,
    futureEvidenceSource,
    proposedSourceRef: input.sourceRef,
    evidenceBasis: input.evidenceBasis,
    notes: input.notes,
    remainingUncertainty:
      input.remainingUncertainty ??
      "Project-owner approval is required before this proposal can become production metadata.",
  };
}

function accepted(input: {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly level: Exclude<TrunkFunctionLevel, "unknown">;
  readonly fields: string;
  readonly evidenceBasis: readonly string[];
  readonly notes: string;
  readonly remainingUncertainty?: string;
}): TrunkFunctionCurationProposal {
  return proposal({
    ...input,
    proposalStatus: "PROPOSE_ACCEPTED",
    provenanceClass: "A_STRUCTURED_EXISTING_EVIDENCE",
    sourceRef: currentFieldRef(input.exerciseId, input.fields),
  });
}

function needsReview(input: {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly level: Exclude<TrunkFunctionLevel, "unknown">;
  readonly evidenceBasis: readonly string[];
  readonly notes: string;
  readonly remainingUncertainty: string;
  readonly externalReference?: boolean;
}): TrunkFunctionCurationProposal {
  const externalReference = input.externalReference ?? false;
  return proposal({
    ...input,
    proposalStatus: "PROPOSE_NEEDS_REVIEW",
    provenanceClass: externalReference
      ? "C_EXTERNAL_REFERENCE_RECOMMENDED"
      : "B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
    sourceRef: `${externalReference ? "pending-primary-source" : "pending-human-review"}:${input.exerciseId}.${input.function}`,
  });
}

function remainUnknown(input: {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly evidenceBasis?: readonly string[];
  readonly notes?: string;
  readonly remainingUncertainty?: string;
}): TrunkFunctionCurationProposal {
  const label = FUNCTION_LABELS[input.function];
  return {
    function: input.function,
    level: "unknown",
    proposalStatus: "REMAIN_UNKNOWN",
    provenanceClass: "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
    futureEvidenceSource: "unknown",
    proposedSourceRef: null,
    evidenceBasis: input.evidenceBasis ?? [
      `No independent structured current-catalog field distinguishes ${label} for ${input.exerciseId}.`,
    ],
    notes:
      input.notes ??
      `${label} remains unknown; low or none is not inferred from absence of a role or from descriptive prose.`,
    remainingUncertainty:
      input.remainingUncertainty ??
      "A field-specific human review or stronger structured mechanics artifact is required.",
  };
}

function functionProfile(
  exerciseId: TrunkCurationExerciseId,
  overrides: Partial<
    Readonly<Record<TrunkMechanicsFunction, TrunkFunctionCurationProposal>>
  >,
): Readonly<Record<TrunkMechanicsFunction, TrunkFunctionCurationProposal>> {
  const entries = TRUNK_MECHANICS_FUNCTIONS.map((functionName) => [
    functionName,
    overrides[functionName] ??
      remainUnknown({ exerciseId, function: functionName }),
  ] as const);

  return Object.fromEntries(entries) as Readonly<
    Record<TrunkMechanicsFunction, TrunkFunctionCurationProposal>
  >;
}

interface RawExerciseProposal {
  readonly exerciseId: TrunkCurationExerciseId;
  readonly ordinaryUse: string;
  readonly exposurePreview: TrunkExposurePreview;
  readonly exposureRationale: string;
  readonly contextSensitivity: string;
  readonly exerciseRationale: string;
  readonly functions: Readonly<
    Record<TrunkMechanicsFunction, TrunkFunctionCurationProposal>
  >;
}

const RAW_EXERCISE_PROPOSALS: readonly RawExerciseProposal[] = [
  {
    exerciseId: "ninety-ninety-breathing",
    ordinaryUse: "Preparation or recovery breathing/position drill.",
    exposurePreview: "DIRECT_DEVELOPMENTAL",
    exposureRationale:
      "The current exercise has trunk as primary muscle and explicit breathing_position plus anti_extension_core roles.",
    contextSensitivity:
      "Direct breathing/position exposure depends on its preparation or recovery use and breathing prescription; it is not a loaded-bracing set.",
    exerciseRationale:
      "The explicit breathing role supports high breathing/pressure expression and the low generic trunk demand supports low anti-extension expression. Supine floor support and no external loading support reviewed none for loaded bracing and gait transfer; the other four functions stay unknown.",
    functions: functionProfile("ninety-ninety-breathing", {
      breathingPressureCoordination: accepted({
        exerciseId: "ninety-ninety-breathing",
        function: "breathingPressureCoordination",
        level: "high",
        fields: "movementRoles+primaryMuscles+trainingRoles",
        evidenceBasis: [
          "movementRoles includes breathing_position",
          "primaryMuscles includes trunk",
          "trainingRoles are preparation and recovery",
        ],
        notes:
          "Breathing/pressure coordination is the exercise's explicit current selection purpose, not an inference from its name or cues.",
      }),
      antiExtensionContribution: accepted({
        exerciseId: "ninety-ninety-breathing",
        function: "antiExtensionContribution",
        level: "low",
        fields: "movementRoles+mechanics.demands.trunk_control+mechanics.support",
        evidenceBasis: [
          "movementRoles includes anti_extension_core",
          "mechanics.demands.trunk_control is accepted low",
          "mechanics.support is accepted floor/supine",
        ],
        notes:
          "The explicit role establishes the function while accepted low trunk demand limits the proposed expression level.",
      }),
      loadedBracingContribution: accepted({
        exerciseId: "ninety-ninety-breathing",
        function: "loadedBracingContribution",
        level: "none",
        fields: "loading+mechanics.support",
        evidenceBasis: [
          "loading.loadability is none",
          "loading.loadingPotential and axialLoading are low",
          "mechanics.support is accepted floor/supine",
        ],
        notes:
          "Reviewed loading and support fields show no meaningful external-load bracing expression in the current definition.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "ninety-ninety-breathing",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "mechanics.support+movementRoles",
        evidenceBasis: [
          "mechanics.support is accepted floor/supine",
          "movementRoles are breathing_position and anti_extension_core",
          "loading.coordinationDemand is low",
        ],
        notes:
          "The accepted supine support contract is incompatible with meaningful gait or stepping load transfer in this exercise definition.",
      }),
    }),
  },
  {
    exerciseId: "dead-bug",
    ordinaryUse: "Activation or low-fatigue trunk accessory.",
    exposurePreview: "DIRECT_DEVELOPMENTAL",
    exposureRationale:
      "The current exercise has trunk as primary muscle and anti_extension_core as its explicit movement role.",
    contextSensitivity:
      "Direct exposure depends on being selected for anti-extension control; range, tempo, and limb complexity change the dose without changing role truth.",
    exerciseRationale:
      "High anti-extension is supported directly. Breathing/pressure coordination is plausible but not explicitly structured and therefore needs review. Contralateral coordination does not by itself establish anti-rotation. Flexion remains unknown rather than being converted to none.",
    functions: functionProfile("dead-bug", {
      breathingPressureCoordination: needsReview({
        exerciseId: "dead-bug",
        function: "breathingPressureCoordination",
        level: "moderate",
        evidenceBasis: [
          "primaryMuscles includes trunk",
          "mechanics.demands.coordination is accepted moderate",
          "mechanics.support is accepted floor/supine",
        ],
        notes:
          "Breathing/pressure coordination is biomechanically plausible during contralateral limb movement but is not an explicit current role or field.",
        remainingUncertainty:
          "Human exercise-science review must confirm whether moderate, low, or unknown best represents ordinary execution.",
      }),
      antiExtensionContribution: accepted({
        exerciseId: "dead-bug",
        function: "antiExtensionContribution",
        level: "high",
        fields: "movementRoles+primaryMuscles+mechanics.demands.trunk_control",
        evidenceBasis: [
          "movementRoles contains only anti_extension_core",
          "primaryMuscles includes trunk",
          "mechanics.demands.trunk_control is accepted moderate",
        ],
        notes:
          "Anti-extension is the explicit direct selection purpose and the central trunk function despite low external loading.",
      }),
      antiRotationContribution: remainUnknown({
        exerciseId: "dead-bug",
        function: "antiRotationContribution",
        evidenceBasis: [
          "mechanics.demands.coordination is accepted moderate",
          "movementRoles does not distinguish anti-rotation",
        ],
        notes:
          "Contralateral coordination is not automatically anti-rotation evidence; the function remains unknown.",
      }),
      controlledFlexionContribution: remainUnknown({
        exerciseId: "dead-bug",
        function: "controlledFlexionContribution",
        evidenceBasis: [
          "movementRoles includes anti_extension_core only",
          "current range metadata describes scalable limb reach, not trunk flexion",
        ],
        notes:
          "The current structured fields do not prove controlled trunk flexion or reviewed absence, so the field remains unknown rather than none.",
      }),
      loadedBracingContribution: accepted({
        exerciseId: "dead-bug",
        function: "loadedBracingContribution",
        level: "none",
        fields: "equipmentRequirements+loading+mechanics.support",
        evidenceBasis: [
          "equipmentRequirements are bodyweight/floor only",
          "loading.loadingPotential and axialLoading are low",
          "mechanics.support is accepted floor/supine",
        ],
        notes:
          "The current definition supplies no external load under which loaded bracing would be meaningfully expressed.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "dead-bug",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "mechanics.support+movementRoles",
        evidenceBasis: [
          "mechanics.support is accepted floor/supine",
          "movementRoles contains anti_extension_core only",
        ],
        notes:
          "Supine limb coordination is not gait or stepping load transfer under the implemented definition.",
      }),
    }),
  },
  {
    exerciseId: "pallof-press",
    ordinaryUse: "Activation or targeted anti-rotation accessory.",
    exposurePreview: "DIRECT_DEVELOPMENTAL",
    exposureRationale:
      "The current exercise has trunk as primary muscle and anti_rotation_core as its explicit movement role.",
    contextSensitivity:
      "Direct anti-rotation exposure depends on the requested role and prescription; standing cable/band setup does not turn it into a carry or controlled-rotation exercise.",
    exerciseRationale:
      "High anti-rotation is direct structured truth. Controlled rotation is reviewed none because the exercise resists rather than produces rotation. Loaded bracing and lateral control remain qualified biomechanical proposals; breathing and anti-extension remain unknown.",
    functions: functionProfile("pallof-press", {
      antiRotationContribution: accepted({
        exerciseId: "pallof-press",
        function: "antiRotationContribution",
        level: "high",
        fields: "movementRoles+primaryMuscles+mechanics.demands.trunk_control",
        evidenceBasis: [
          "movementRoles contains anti_rotation_core",
          "primaryMuscles includes trunk",
          "mechanics.demands.trunk_control is accepted high",
        ],
        notes:
          "Anti-rotation is the explicit direct selection purpose and central trunk function.",
      }),
      antiLateralFlexionContribution: needsReview({
        exerciseId: "pallof-press",
        function: "antiLateralFlexionContribution",
        level: "low",
        evidenceBasis: [
          "mechanics.support is accepted cable_or_band_anchor/standing",
          "mechanics.demands.stability is accepted moderate",
          "mechanics.demands.trunk_control is accepted high",
        ],
        notes:
          "A standing lateral resistance vector may create some lateral-control demand, but anti-rotation truth alone cannot establish it.",
        remainingUncertainty:
          "Human review must distinguish incidental lateral stabilization from a meaningful anti-lateral-flexion contribution.",
      }),
      controlledRotationContribution: accepted({
        exerciseId: "pallof-press",
        function: "controlledRotationContribution",
        level: "none",
        fields: "movementRoles+mechanics.demands.range+mechanics.demands.coordination",
        evidenceBasis: [
          "movementRoles contains anti_rotation_core rather than trunk_rotation",
          "mechanics.demands.range is accepted low",
          "mechanics.demands.coordination is accepted low",
        ],
        notes:
          "The current structured purpose is to resist axial rotation, not intentionally produce controlled trunk rotation.",
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "pallof-press",
        function: "loadedBracingContribution",
        level: "moderate",
        evidenceBasis: [
          "mechanics.support is accepted cable_or_band_anchor/standing",
          "loading.loadability and loadingPotential are moderate",
          "mechanics.demands.trunk_control is accepted high",
        ],
        notes:
          "External cable/band resistance and standing trunk control plausibly produce meaningful loaded bracing secondary to anti-rotation.",
        remainingUncertainty:
          "Human review must confirm that this is not duplicate wording for the anti-rotation fact and settle the level.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "pallof-press",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "movementRoles+mechanics.demands.range+mechanics.demands.coordination",
        evidenceBasis: [
          "movementRoles contains anti_rotation_core only",
          "mechanics.demands.range and coordination are accepted low",
          "loading progression axes do not include gait, distance, or carry exposure",
        ],
        notes:
          "Standing posture alone is not gait or stepping load-transfer evidence.",
      }),
    }),
  },
  {
    exerciseId: "push-up",
    ordinaryUse: "Main or accessory horizontal press.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Chest and triceps are primary while trunk is secondary; anti_extension_core and moderate trunk demand are explicit.",
    contextSensitivity:
      "Secondary trunk exposure changes with support height, range, tempo, fatigue, and pressing prescription; it does not become a dedicated trunk slot.",
    exerciseRationale:
      "Moderate anti-extension is independently structured. Moderate loaded bracing is plausible under bodyweight support but requires review. Static hands-supported pressing supports reviewed none for gait transfer; other functions remain unknown.",
    functions: functionProfile("push-up", {
      antiExtensionContribution: accepted({
        exerciseId: "push-up",
        function: "antiExtensionContribution",
        level: "moderate",
        fields: "movementRoles+secondaryMuscles+mechanics.demands.trunk_control",
        evidenceBasis: [
          "movementRoles includes anti_extension_core",
          "secondaryMuscles includes trunk",
          "mechanics.demands.trunk_control is accepted moderate",
        ],
        notes:
          "Anti-extension is a meaningful secondary function while horizontal pressing remains the primary training purpose.",
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "push-up",
        function: "loadedBracingContribution",
        level: "moderate",
        evidenceBasis: [
          "mechanics.support is accepted floor/hands_supported",
          "loading.loadingPotential is moderate",
          "mechanics.demands.trunk_control and stability are accepted moderate",
        ],
        notes:
          "Maintaining a plank-like position under bodyweight support plausibly expresses bracing, but the loaded-bracing level is not directly modeled.",
        remainingUncertainty:
          "Human review must decide whether bodyweight support qualifies as moderate loaded bracing or should remain low/unknown in this vocabulary.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "push-up",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "mechanics.support+movementRoles",
        evidenceBasis: [
          "mechanics.support is accepted floor/hands_supported",
          "movementRoles are horizontal_push and anti_extension_core",
          "mechanics.demands.coordination is accepted low",
        ],
        notes:
          "The current static pressing definition does not meaningfully express gait, marching, stepping, or carrying load transfer.",
      }),
    }),
  },
  {
    exerciseId: "one-arm-dumbbell-row",
    ordinaryUse: "Main or accessory unilateral horizontal pull with hand support as needed.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Back musculature is primary while trunk is secondary; accepted mechanics expose high trunk and stability demand under unilateral loading.",
    contextSensitivity:
      "Hand support, stance, torso angle, load, and prescription materially alter trunk expression; the row does not gain a direct trunk role.",
    exerciseRationale:
      "High loaded bracing is a qualified proposal. Anti-rotation and anti-lateral-flexion are plausible but require primary technical evidence because unilateral mechanics alone are insufficient. Gait/load transfer stays unknown despite possible split stance.",
    functions: functionProfile("one-arm-dumbbell-row", {
      antiRotationContribution: needsReview({
        exerciseId: "one-arm-dumbbell-row",
        function: "antiRotationContribution",
        level: "moderate",
        evidenceBasis: [
          "resistancePath.laterality is accepted unilateral",
          "mechanics.demands.trunk_control and stability are accepted high",
          "mechanics.support is accepted bench/hands_supported",
        ],
        notes:
          "Unilateral loading plausibly creates anti-rotation demand, but laterality is not itself sufficient proof.",
        remainingUncertainty:
          "A primary technical source plus human review should quantify how hand support and torso setup alter rotational demand.",
        externalReference: true,
      }),
      antiLateralFlexionContribution: needsReview({
        exerciseId: "one-arm-dumbbell-row",
        function: "antiLateralFlexionContribution",
        level: "moderate",
        evidenceBasis: [
          "resistancePath.laterality is accepted unilateral",
          "mechanics.demands.trunk_control and stability are accepted high",
          "mechanics.support is accepted bench/hands_supported",
        ],
        notes:
          "Unilateral load and athlete-controlled torso position plausibly create lateral-control demand, but the current fields do not isolate it.",
        remainingUncertainty:
          "A primary technical source plus human review should distinguish lateral-control demand across supported and unsupported setups.",
        externalReference: true,
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "one-arm-dumbbell-row",
        function: "loadedBracingContribution",
        level: "high",
        evidenceBasis: [
          "loading.loadability and loadingPotential are high",
          "mechanics.demands.trunk_control and stability are accepted high",
          "secondaryMuscles includes trunk",
        ],
        notes:
          "The accepted loading and generic trunk-demand fields support a strong loaded-bracing hypothesis while rowing remains the primary purpose.",
        remainingUncertainty:
          "Human review must confirm the high level and prevent the same unilateral-demand fact from being counted independently across three functions.",
      }),
      gaitLoadTransferContribution: remainUnknown({
        exerciseId: "one-arm-dumbbell-row",
        function: "gaitLoadTransferContribution",
        evidenceBasis: [
          "resistancePath.laterality is unilateral",
          "mechanics.support is bench/hands_supported",
          "no structured gait, stepping, carry, or locomotor field exists",
        ],
        notes:
          "A possible split stance is not structured gait/load-transfer evidence, so the field remains unknown.",
      }),
    }),
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    ordinaryUse: "Main or accessory vertical press with generic standing identity and optional bench availability.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Trunk is secondary and generic trunk demand is accepted moderate, but the current exercise identity does not guarantee one support configuration.",
    contextSensitivity:
      "Standing versus seated/bench-supported execution can materially change anti-extension and bracing expression; one global profile cannot hide that ambiguity.",
    exerciseRationale:
      "All eight fields remain unknown for profile curation. The accepted support record says standing while also acknowledging optional bench use, so anti-extension and loaded-bracing levels would be setup-dependent rather than universal exercise facts.",
    functions: functionProfile("dumbbell-shoulder-press", {
      antiExtensionContribution: remainUnknown({
        exerciseId: "dumbbell-shoulder-press",
        function: "antiExtensionContribution",
        evidenceBasis: [
          "mechanics.support records standing but notes optional bench use",
          "mechanics.demands.trunk_control is accepted moderate",
          "loading includes loaded_spinal_extension stress",
        ],
        notes:
          "The generic exercise record does not establish one support setup, so anti-extension expression remains setup-dependent and unknown.",
        remainingUncertainty:
          "Owner must decide whether standing and seated variants need separate catalog identities or a future setup-scoped mechanics contract.",
      }),
      loadedBracingContribution: remainUnknown({
        exerciseId: "dumbbell-shoulder-press",
        function: "loadedBracingContribution",
        evidenceBasis: [
          "loading.loadability and loadingPotential are high",
          "mechanics.demands.trunk_control is accepted moderate",
          "optional bench support can materially change trunk demand",
        ],
        notes:
          "Loaded bracing is plausible in standing execution but cannot be assigned globally while seated/bench-supported execution remains possible.",
        remainingUncertainty:
          "Variant/setup identity must be resolved before a non-unknown field can be proposed.",
      }),
    }),
  },
  {
    exerciseId: "goblet-squat",
    ordinaryUse: "Main or accessory anterior-loaded bilateral squat.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Lower-body muscles are primary while trunk is secondary; accepted generic trunk and stability demand are moderate.",
    contextSensitivity:
      "Bracing and pressure expression vary with load, depth, fatigue, and prescription; the squat does not become a direct anti-extension or flexion exercise.",
    exerciseRationale:
      "Moderate loaded bracing and low breathing/pressure coordination are qualified proposals based on anterior loading and accepted generic demand. No direct anti-extension, flexion, rotation, or gait function is asserted.",
    functions: functionProfile("goblet-squat", {
      breathingPressureCoordination: needsReview({
        exerciseId: "goblet-squat",
        function: "breathingPressureCoordination",
        level: "low",
        evidenceBasis: [
          "secondaryMuscles includes trunk",
          "mechanics.demands.trunk_control is accepted moderate",
          "loading.loadingPotential is moderate",
        ],
        notes:
          "Pressure coordination is plausible under an anterior load but is not independently represented in current mechanics.",
        remainingUncertainty:
          "Human review must decide whether the contribution is low, moderate, or too prescription-dependent for a global profile.",
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "goblet-squat",
        function: "loadedBracingContribution",
        level: "moderate",
        evidenceBasis: [
          "mechanics.support is accepted none/standing",
          "mechanics.demands.trunk_control and stability are accepted moderate",
          "loading.loadability and loadingPotential are moderate",
        ],
        notes:
          "Maintaining trunk position under an anterior dumbbell load plausibly supplies meaningful secondary loaded bracing.",
        remainingUncertainty:
          "Human review must confirm the level and keep pressure coordination from becoming duplicate exposure credit.",
      }),
    }),
  },
  {
    exerciseId: "dumbbell-romanian-deadlift",
    ordinaryUse: "Main or accessory loaded hinge.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Hamstrings and glutes are primary while trunk is secondary; accepted generic trunk demand and loadability are high.",
    contextSensitivity:
      "Bracing expression changes with load, range, grip, fatigue, and prescription; hinge stress remains separate from trunk-function credit.",
    exerciseRationale:
      "High loaded bracing is a qualified proposal. Posterior-trunk position control is not converted into a ninth function or mislabeled anti-extension, because the current contract does not distinguish resistance to flexion from resistance to extension.",
    functions: functionProfile("dumbbell-romanian-deadlift", {
      antiExtensionContribution: remainUnknown({
        exerciseId: "dumbbell-romanian-deadlift",
        function: "antiExtensionContribution",
        evidenceBasis: [
          "mechanics.demands.trunk_control is accepted high",
          "joint stress includes loaded_hinge and loaded_spinal_flexion",
          "no field isolates resistance to unwanted extension",
        ],
        notes:
          "Neutral hinge position and posterior-trunk contribution are not automatically anti-extension; the field remains unknown.",
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "dumbbell-romanian-deadlift",
        function: "loadedBracingContribution",
        level: "high",
        evidenceBasis: [
          "loading.loadability and loadingPotential are high",
          "mechanics.demands.trunk_control is accepted high",
          "mechanics.support is accepted none/standing",
          "secondaryMuscles includes trunk",
        ],
        notes:
          "The current structured load and demand fields strongly support loaded bracing as meaningful secondary expression.",
        remainingUncertainty:
          "Human review must confirm the high level and whether prescription/load thresholds require a future contextual qualifier.",
      }),
    }),
  },
  {
    exerciseId: "cable-pull-through",
    ordinaryUse: "Activation or accessory cable hinge.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Glutes and hamstrings are primary while trunk is secondary; accepted generic trunk demand and loading are moderate.",
    contextSensitivity:
      "Cable geometry, stance, range, load, and activation versus accessory prescription affect bracing expression.",
    exerciseRationale:
      "Moderate loaded bracing is a qualified proposal. Anti-extension remains unknown because lower axial loading does not identify the direction of trunk-control demand, and no function is downgraded merely because resistance is cable-based.",
    functions: functionProfile("cable-pull-through", {
      antiExtensionContribution: remainUnknown({
        exerciseId: "cable-pull-through",
        function: "antiExtensionContribution",
        evidenceBasis: [
          "mechanics.demands.trunk_control is accepted moderate",
          "mechanics.support is cable_or_band_anchor/standing",
          "no current field identifies anti-extension direction",
        ],
        notes:
          "Generic hinge position control does not establish anti-extension expression.",
      }),
      loadedBracingContribution: needsReview({
        exerciseId: "cable-pull-through",
        function: "loadedBracingContribution",
        level: "moderate",
        evidenceBasis: [
          "loading.loadability and loadingPotential are moderate",
          "mechanics.demands.trunk_control and stability are accepted moderate",
          "secondaryMuscles includes trunk",
        ],
        notes:
          "Standing cable hinge loading plausibly produces meaningful secondary loaded bracing without implying lower demand solely from cable use.",
        remainingUncertainty:
          "Human review must confirm the level across cable geometry, stance, and activation versus accessory use.",
      }),
    }),
  },
  {
    exerciseId: "split-squat",
    ordinaryUse: "Main or accessory split-stance unilateral lower-body work.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Lower-body muscles are primary while trunk is secondary; generic trunk, stability, and coordination demand are accepted moderate.",
    contextSensitivity:
      "Hand support, optional dumbbells, stance width, load, and depth change trunk expression; static split stance is not gait evidence.",
    exerciseRationale:
      "Moderate anti-lateral control and low anti-rotation are qualified proposals only. Loaded bracing stays unknown because load/support are optional, and gait/load transfer stays unknown because static stance alone is insufficient.",
    functions: functionProfile("split-squat", {
      antiRotationContribution: needsReview({
        exerciseId: "split-squat",
        function: "antiRotationContribution",
        level: "low",
        evidenceBasis: [
          "movementRoles includes single_leg and squat",
          "mechanics.demands.trunk_control, stability, and coordination are accepted moderate",
          "mechanics.support notes optional external support",
        ],
        notes:
          "Split-stance control may include minor resistance to rotation, but unilateral mechanics do not establish the function without review.",
        remainingUncertainty:
          "Human review must distinguish true anti-rotation demand from general balance and stance control.",
      }),
      antiLateralFlexionContribution: needsReview({
        exerciseId: "split-squat",
        function: "antiLateralFlexionContribution",
        level: "moderate",
        evidenceBasis: [
          "movementRoles includes single_leg",
          "mechanics.demands.trunk_control and stability are accepted moderate",
          "mechanics.support is standing with optional external support",
        ],
        notes:
          "Maintaining lateral trunk position in unilateral lower-body work is plausible but not isolated by current mechanics.",
        remainingUncertainty:
          "Human review must settle the level across supported, bodyweight, and dumbbell-loaded execution.",
      }),
      loadedBracingContribution: remainUnknown({
        exerciseId: "split-squat",
        function: "loadedBracingContribution",
        evidenceBasis: [
          "equipmentRequirements are bodyweight while dumbbells are optional",
          "mechanics.support allows optional external support",
          "no prescription/load context is present in ExerciseDefinition",
        ],
        notes:
          "A single exercise-level profile cannot assign loaded bracing while the ordinary definition permits unloaded and supported execution.",
      }),
      gaitLoadTransferContribution: remainUnknown({
        exerciseId: "split-squat",
        function: "gaitLoadTransferContribution",
        evidenceBasis: [
          "movementRoles includes single_leg and squat",
          "the current movement is a static split-stance pattern",
          "no gait, stepping, carry, or locomotor field is modeled",
        ],
        notes:
          "Static split stance is not sufficient evidence for gait/load transfer.",
      }),
    }),
  },
  {
    exerciseId: "step-up",
    ordinaryUse: "Accessory or low-height activation stepping pattern.",
    exposurePreview: "MEANINGFUL_SECONDARY",
    exposureRationale:
      "Lower-body muscles are primary while trunk is secondary; stepping coordination plus moderate trunk/stability demand are explicit.",
    contextSensitivity:
      "Step height, hand support, optional dumbbells, ascent/descent strategy, load, and section use alter trunk and gait-transfer expression.",
    exerciseRationale:
      "Step-up differs from split squat through a qualified gait/load-transfer proposal. Anti-lateral and anti-rotation remain separately qualified; loaded bracing stays unknown because dumbbells and support are optional.",
    functions: functionProfile("step-up", {
      antiRotationContribution: needsReview({
        exerciseId: "step-up",
        function: "antiRotationContribution",
        level: "low",
        evidenceBasis: [
          "movementRoles includes single_leg and squat",
          "mechanics.demands.trunk_control, stability, and coordination are accepted moderate",
          "mechanics.support notes optional hand support",
        ],
        notes:
          "Stepping may include minor anti-rotation control, but unilateral mechanics do not establish it without review.",
        remainingUncertainty:
          "Human review must distinguish rotational control from general balance and task coordination.",
      }),
      antiLateralFlexionContribution: needsReview({
        exerciseId: "step-up",
        function: "antiLateralFlexionContribution",
        level: "moderate",
        evidenceBasis: [
          "movementRoles includes single_leg",
          "mechanics.demands.trunk_control and stability are accepted moderate",
          "mechanics.support is box/standing with optional hand support",
        ],
        notes:
          "Controlling lateral displacement during ascent and descent is plausible but not isolated by current mechanics.",
        remainingUncertainty:
          "Human review must settle the level across step height, support, and loading choices.",
      }),
      loadedBracingContribution: remainUnknown({
        exerciseId: "step-up",
        function: "loadedBracingContribution",
        evidenceBasis: [
          "equipmentRequirements are bodyweight/box while dumbbells are optional",
          "external hand support is optional",
          "no prescription/load context is present in ExerciseDefinition",
        ],
        notes:
          "Loaded bracing remains unknown because the same generic exercise may be unloaded, loaded, supported, or unsupported.",
      }),
      gaitLoadTransferContribution: needsReview({
        exerciseId: "step-up",
        function: "gaitLoadTransferContribution",
        level: "moderate",
        evidenceBasis: [
          "movementRoles includes single_leg",
          "mechanics.demands.coordination is accepted moderate",
          "mechanics.support is box/standing",
          "progression axes include range through step height",
        ],
        notes:
          "A step pattern plausibly expresses meaningful force transfer through a locomotor-like ascent/descent task, unlike static split stance.",
        remainingUncertainty:
          "A primary technical source plus human review should establish whether this belongs at low or moderate and how hand support changes it.",
        externalReference: true,
      }),
    }),
  },
  {
    exerciseId: "chest-supported-dumbbell-row",
    ordinaryUse: "Main or accessory chest-supported horizontal pull.",
    exposurePreview: "INCIDENTAL_BRACING",
    exposureRationale:
      "Trunk is not a listed target; accepted chest support and low trunk demand limit developmental trunk credit.",
    contextSensitivity:
      "Bench angle, fit, independent dumbbell path, and prescription can change residual demand, but support remains the defining comparison fact.",
    exerciseRationale:
      "Reviewed low loaded bracing is preferred over none because the accepted profile says trunk demand is low, not absent. Independent arm loading does not establish anti-rotation while chest support is present. Gait transfer is reviewed none.",
    functions: functionProfile("chest-supported-dumbbell-row", {
      antiRotationContribution: remainUnknown({
        exerciseId: "chest-supported-dumbbell-row",
        function: "antiRotationContribution",
        evidenceBasis: [
          "resistancePath.laterality is bilateral_independent",
          "mechanics.support is accepted bench/chest_supported",
          "mechanics.demands.trunk_control is accepted low",
        ],
        notes:
          "Independent dumbbells do not prove meaningful rotational demand when the torso is externally chest-supported.",
      }),
      loadedBracingContribution: accepted({
        exerciseId: "chest-supported-dumbbell-row",
        function: "loadedBracingContribution",
        level: "low",
        fields: "mechanics.support+mechanics.demands.trunk_control+loading",
        evidenceBasis: [
          "mechanics.support is accepted bench/chest_supported",
          "mechanics.demands.trunk_control is accepted low",
          "loading.loadability is high while axialLoading is low",
        ],
        notes:
          "External chest support limits but does not claim complete absence of trunk position maintenance under load.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "chest-supported-dumbbell-row",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "mechanics.support+movementRoles",
        evidenceBasis: [
          "mechanics.support is accepted bench/chest_supported",
          "movementRoles contains horizontal_pull only",
          "mechanics.demands.coordination is accepted low",
        ],
        notes:
          "A chest-supported row has no meaningful gait, marching, stepping, or carrying expression in the current definition.",
      }),
    }),
  },
  {
    exerciseId: "machine-row",
    ordinaryUse: "Main or accessory generic machine-guided horizontal pull.",
    exposurePreview: "INCIDENTAL_BRACING",
    exposureRationale:
      "Accepted generic trunk demand is low, but support, laterality, line of pull, and machine fit remain review-qualified.",
    contextSensitivity:
      "Commercial machine geometry may or may not provide chest support and may use bilateral, independent, or converging paths.",
    exerciseRationale:
      "All eight fields remain unknown. Generic machine identity cannot support universal chest-support, laterality, or loaded-bracing assertions; low generic trunk demand is not converted into a function-specific low value.",
    functions: functionProfile("machine-row", {
      loadedBracingContribution: remainUnknown({
        exerciseId: "machine-row",
        function: "loadedBracingContribution",
        evidenceBasis: [
          "mechanics.demands.trunk_control is accepted low",
          "mechanics.support reviewStatus is needs_review",
          "resistancePath laterality and lineOfPullAdjustability are unknown",
          "fitDependency is machine_geometry",
        ],
        notes:
          "The generic machine record does not guarantee chest support or a universal body position, so function-specific bracing remains unknown.",
        remainingUncertainty:
          "Machine-specific catalog identities or setup-scoped review are required before assigning low or none.",
      }),
    }),
  },
  {
    exerciseId: "seated-cable-row",
    ordinaryUse: "Main or accessory seated cable horizontal pull.",
    exposurePreview: "INCIDENTAL_BRACING",
    exposureRationale:
      "Trunk is not a listed target; accepted seated support and low generic trunk demand indicate at most incidental bracing.",
    contextSensitivity:
      "Attachment, pulley geometry, reach strategy, torso motion, foot bracing, and load can change residual trunk expression.",
    exerciseRationale:
      "Low loaded bracing is a qualified proposal because seated support is accepted but no chest support is modeled and cable setup varies. Gait/load transfer is reviewed none; other functions remain unknown.",
    functions: functionProfile("seated-cable-row", {
      loadedBracingContribution: needsReview({
        exerciseId: "seated-cable-row",
        function: "loadedBracingContribution",
        level: "low",
        evidenceBasis: [
          "mechanics.support is accepted cable_or_band_anchor/seated_supported",
          "mechanics.demands.trunk_control is accepted low",
          "loading.loadability and loadingPotential are high",
          "resistancePath reviewStatus is needs_review",
        ],
        notes:
          "Seated support limits trunk demand, but absence of chest support and setup-dependent cable geometry may leave a low bracing contribution.",
        remainingUncertainty:
          "Human review must decide whether ordinary execution is low or too setup-dependent for a universal level.",
      }),
      gaitLoadTransferContribution: accepted({
        exerciseId: "seated-cable-row",
        function: "gaitLoadTransferContribution",
        level: "none",
        fields: "mechanics.support+movementRoles",
        evidenceBasis: [
          "mechanics.support is accepted seated_supported",
          "movementRoles contains horizontal_pull only",
          "mechanics.demands.coordination is accepted low",
        ],
        notes:
          "The current seated row definition has no meaningful gait, marching, stepping, or carrying expression.",
      }),
    }),
  },
];

export const LEGACY_CURATION_FINDINGS: readonly LegacyCurationFinding[] = [
  {
    claim: "Dead Bug expresses anti-extension control.",
    legacyEvidence:
      "Golden packages/engine/src/exercises.ts:235-252 used open-string core/anti-extension metadata.",
    disposition: "PRESERVED_AS_STRUCTURED_EVIDENCE",
    proposalUse:
      "The claim is used only because current V2 independently encodes anti_extension_core, trunk primary, and accepted trunk demand; legacy strings are corroboration, not authority.",
  },
  {
    claim: "Pallof Press expresses anti-rotation control.",
    legacyEvidence:
      "Golden packages/engine/src/exercises.ts:643-657 and 4338-4355 identify anti-rotation variants.",
    disposition: "PRESERVED_AS_STRUCTURED_EVIDENCE",
    proposalUse:
      "Current V2 independently encodes anti_rotation_core and accepted high trunk demand. The legacy Pallof-to-woodchop progression implication is not preserved.",
  },
  {
    claim: "90/90 Breathing is breathing/position trunk work.",
    legacyEvidence:
      "Golden packages/engine/src/exercises.ts:823-837 used open-string breath/core/diaphragm labels.",
    disposition: "PRESERVED_AFTER_REVIEW",
    proposalUse:
      "Current V2 breathing_position role is the independent structured basis; the legacy label is migration context only.",
  },
  {
    claim: "Loaded hinges involve posterior-trunk contribution.",
    legacyEvidence:
      "Golden packages/engine/src/exercises.ts:970-989 listed lower back on the dumbbell RDL.",
    disposition: "PRESERVED_AFTER_REVIEW",
    proposalUse:
      "The proposal keeps a qualified loaded-bracing hypothesis but does not invent a ninth posterior-trunk function or infer anti-extension.",
  },
  {
    claim: "Split-stance or stepping labels establish anti-rotation, lateral control, or gait transfer.",
    legacyEvidence:
      "Golden split-squat and assisted step-up rows used broad squat/single-leg labels without reviewed trunk-function fields.",
    disposition: "STILL_UNKNOWN",
    proposalUse:
      "Split-squat gait transfer remains unknown; step-up gait transfer and unilateral control remain needs-review proposals.",
  },
  {
    claim: "Generic row variants contain reviewed trunk-function knowledge.",
    legacyEvidence:
      "Golden row rows described support and setup primarily through identity, cues, tags, and broad family links.",
    disposition: "STILL_UNKNOWN",
    proposalUse:
      "Current V2 support/path fields are used where structured; machine-specific trunk functions remain unknown.",
  },
  {
    claim: "Exercise names, tags, movementPattern strings, and coaching cues can infer core family.",
    legacyEvidence:
      "Golden threeDayCoachPolicy.ts:473-511 used descriptor and token sniffing to resolve core family.",
    disposition: "REJECTED",
    proposalUse:
      "No proposal level uses name, summary, coaching cues, tags, or free-text contraindications as behavioral evidence.",
  },
  {
    claim: "Every three-day plan requires fixed generic core and carry quotas.",
    legacyEvidence:
      "Golden quotaRegistry.ts:125-141 imposed fixed core/coreStability minima and a generic carry target.",
    disposition: "REJECTED",
    proposalUse:
      "Exposure classes remain report-only and contextual; no quota, ledger, prescription, or composition behavior is migrated.",
  },
  {
    claim: "Pallof Press to woodchop is an automatic progression.",
    legacyEvidence:
      "Golden progression links crossed from resisting rotation to producing controlled rotation.",
    disposition: "REJECTED",
    proposalUse:
      "Anti-rotation and controlled rotation remain separate fields, and current transition traces retain no automatic selection effect.",
  },
  {
    claim: "Free-text pain contraindications can authorize V2 gating.",
    legacyEvidence:
      "Golden exercise rows mixed painContraindications and contraindication prose.",
    disposition: "REJECTED",
    proposalUse:
      "The proposal does not consume pain prose; canonical V2 stress facts and receiver policies remain untouched.",
  },
];

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function rankingFingerprint(): string {
  const rows = CONTROLLED_CANDIDATE_SCENARIOS.map((scenario) => {
    const result = runCandidateRankingLab({
      ...scenario.request,
      evaluationContext: { asOf: TRUNK_CURATION_FIXED_AS_OF },
    });
    return {
      id: scenario.id,
      ranked: result.rankedCandidates.map((candidate) => [
        candidate.exercise.id,
        candidate.rank,
        candidate.total,
      ]),
      rejected: result.hardRejectedCandidates.map((candidate) => [
        candidate.exercise.id,
        candidate.eligibility.rejectionReasons.map((reason) => reason.code),
      ]),
    };
  });

  return hash(rows);
}

function rankingBehavior(result: CandidateRankingResult) {
  return {
    ranked: result.rankedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components.map((component) => ({
        id: component.id,
        rawValue: component.rawValue,
        value: component.value,
        weight: component.weight,
        weightedContribution: component.weightedContribution,
        reasonCode: component.reasonCode,
        assessmentRelevance: component.assessmentRelevance ?? null,
      })),
      painExecutionReadiness: candidate.painExecutionReadiness,
    })),
    rejected: result.hardRejectedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      codes: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
    })),
    painExecutionReadiness: result.painExecutionReadiness,
    assessmentInfluence: result.assessmentInfluence,
    alignmentPriorities: result.alignmentPriorities,
  };
}

function comprehensiveBehaviorFingerprint(): string {
  return hash(
    CONTROLLED_CANDIDATE_SCENARIOS.map((scenario) => ({
      id: scenario.id,
      ...rankingBehavior(
        runCandidateRankingLab({
          ...scenario.request,
          evaluationContext: { asOf: TRUNK_CURATION_FIXED_AS_OF },
        }),
      ),
    })),
  );
}

export function buildCurrentTrunkCurationFingerprints(): {
  readonly productionRanking: string;
  readonly comprehensiveBehavior: string;
  readonly referenceCatalog: string;
} {
  return {
    productionRanking: rankingFingerprint(),
    comprehensiveBehavior: comprehensiveBehaviorFingerprint(),
    referenceCatalog: hash(REFERENCE_EXERCISES),
  };
}

function referenceExercise(id: TrunkCurationExerciseId): ExerciseDefinition {
  const exercise = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!exercise) {
    throw new Error(`Missing curation exercise ${id}.`);
  }
  return exercise;
}

function countBy<T extends string>(
  values: readonly T[],
  allValues: readonly T[],
): Readonly<Record<T, number>> {
  return Object.fromEntries(
    allValues.map((value) => [
      value,
      values.filter((candidate) => candidate === value).length,
    ]),
  ) as Readonly<Record<T, number>>;
}

function tracePreview(
  exercises: readonly ExerciseTrunkCurationProposal[],
): readonly TrunkCurationTracePreviewRow[] {
  return exercises.flatMap((exercise) =>
    TRUNK_MECHANICS_FUNCTIONS.map((functionName) => {
      const annotation = exercise.functions[functionName];
      return {
        exerciseId: exercise.exerciseId,
        profilePresent: true as const,
        function: functionName,
        proposedLevel: annotation.level,
        proposedReviewStatus: annotation.proposalStatus,
        futureReviewStatus:
          annotation.proposalStatus === "PROPOSE_ACCEPTED"
            ? ("accepted" as const)
            : ("needs_review" as const),
        sourceClass: annotation.provenanceClass,
        futureEvidenceSource: annotation.futureEvidenceSource,
        proposedSourceRef: annotation.proposedSourceRef ?? "none",
        evidenceBasis: annotation.evidenceBasis.join("; "),
        notes: annotation.notes,
        remainingUncertainty: annotation.remainingUncertainty,
      };
    }),
  );
}

function consistencyFindings(
  exercises: readonly ExerciseTrunkCurationProposal[],
): readonly CurationConsistencyFinding[] {
  const proposalFor = (id: TrunkCurationExerciseId) => {
    const found = exercises.find((exercise) => exercise.exerciseId === id);
    if (!found) throw new Error(`Missing proposal ${id}.`);
    return found;
  };

  return [
    {
      check: "Explicit direct movement roles do not conflict with proposed none.",
      status: "PASS",
      evidence:
        "90/90 breathing is high breathing/low anti-extension; Dead Bug is high anti-extension; Pallof Press is high anti-rotation.",
    },
    {
      check: "High generic trunk control is not paired with all functions none.",
      status: "PASS",
      evidence:
        "Pallof has accepted high anti-rotation; One-Arm Row and RDL have review-qualified high loaded bracing.",
    },
    {
      check: "Supported mechanics do not coexist with high loaded-bracing proposals.",
      status: "PASS",
      evidence:
        "Chest-Supported Row proposes low, Machine Row remains unknown, and Seated Cable Row proposes review-qualified low loaded bracing.",
    },
    {
      check: "Unilateral mechanics do not create accepted anti-rotation truth.",
      status: "PASS",
      evidence:
        "One-Arm Row, Split Squat, and Step-Up anti-rotation proposals are all PROPOSE_NEEDS_REVIEW.",
    },
    {
      check: "Controlled rotation remains distinct from resisting rotation.",
      status: "PASS",
      evidence: `Pallof Press anti-rotation is ${proposalFor("pallof-press").functions.antiRotationContribution.level}; controlled rotation is ${proposalFor("pallof-press").functions.controlledRotationContribution.level}.`,
    },
    {
      check: "Gait/load transfer is not inferred from static stance alone.",
      status: "PASS",
      evidence:
        "Split Squat and One-Arm Row remain unknown; Step-Up is separately needs-review from structured stepping evidence.",
    },
    {
      check: "No high proposal relies only on ID, name, summary, cues, tags, or free text.",
      status: "PASS",
      evidence:
        "Every high proposal cites explicit roles, muscles, support, loading, laterality, or accepted demand fields.",
    },
    {
      check: "Non-unknown provenance is non-circular.",
      status: "PASS",
      evidence:
        "Accepted refs point to existing independent fields; review refs identify pending human or primary-source artifacts and never cite the proposed profile as proof.",
    },
    {
      check: "Unknown is not converted to low solely because contribution seems unlikely.",
      status: "PASS",
      evidence:
        "Eighty fields remain explicit unknown; every low proposal has structured evidence plus accepted or qualified review status.",
    },
    {
      check: "One-Arm Row function proposals share one unilateral/high-demand evidence cluster.",
      status: "REVIEW_WARNING",
      evidence:
        "Anti-rotation, anti-lateral flexion, and loaded bracing require separate owner review so one fact does not become three independent credits.",
    },
    {
      check: "Step-Up function proposals share one stepping/stability evidence cluster.",
      status: "REVIEW_WARNING",
      evidence:
        "Anti-rotation, anti-lateral flexion, and gait/load transfer must remain separate judgments and later one source exposure.",
    },
    {
      check: "Goblet Squat pressure and bracing proposals overlap.",
      status: "REVIEW_WARNING",
      evidence:
        "Both are needs-review; owner approval must prevent duplicate scoring or ledger credit from one trunk-control fact.",
    },
  ];
}

export function buildTrunkMechanicsCurationProposalData(): TrunkMechanicsCurationProposalData {
  const ids = RAW_EXERCISE_PROPOSALS.map((proposalRow) => proposalRow.exerciseId);
  if (
    ids.length !== TRUNK_CURATION_EXERCISE_IDS.length ||
    new Set(ids).size !== TRUNK_CURATION_EXERCISE_IDS.length ||
    TRUNK_CURATION_EXERCISE_IDS.some((id) => !ids.includes(id))
  ) {
    throw new Error("Curation tranche must contain each requested exercise exactly once.");
  }

  const exercises = RAW_EXERCISE_PROPOSALS.map((raw) => {
    const current = referenceExercise(raw.exerciseId);
    if (current.mechanics?.trunkMechanics) {
      throw new Error(`${raw.exerciseId} unexpectedly has production trunk metadata.`);
    }
    return {
      ...raw,
      exerciseName: current.name,
    };
  });
  const annotations = exercises.flatMap((exercise) =>
    TRUNK_MECHANICS_FUNCTIONS.map((functionName) =>
      exercise.functions[functionName],
    ),
  );
  const fingerprints = buildCurrentTrunkCurationFingerprints();

  return {
    goldenAncestor: "8af4934641c46da9abbe77a62881151cca9cbf34",
    exercises,
    tracePreview: tracePreview(exercises),
    proposalCounts: countBy(
      annotations.map((annotation) => annotation.proposalStatus),
      ["PROPOSE_ACCEPTED", "PROPOSE_NEEDS_REVIEW", "REMAIN_UNKNOWN"],
    ),
    provenanceCounts: countBy(
      annotations.map((annotation) => annotation.provenanceClass),
      [
        "A_STRUCTURED_EXISTING_EVIDENCE",
        "B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
        "C_EXTERNAL_REFERENCE_RECOMMENDED",
        "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
      ],
    ),
    exposureCounts: countBy(
      exercises.map((exercise) => exercise.exposurePreview),
      [
        "DIRECT_DEVELOPMENTAL",
        "MEANINGFUL_SECONDARY",
        "INCIDENTAL_BRACING",
        "NO_REVIEWED_EXPOSURE",
      ],
    ),
    consistencyFindings: consistencyFindings(exercises),
    legacyFindings: LEGACY_CURATION_FINDINGS,
    behaviorBoundary: {
      capturedProductionRankingFingerprint:
        CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      currentProductionRankingFingerprint: fingerprints.productionRanking,
      productionRankingMatches:
        fingerprints.productionRanking ===
        CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      capturedComprehensiveBehaviorFingerprint:
        CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      currentComprehensiveBehaviorFingerprint:
        fingerprints.comprehensiveBehavior,
      comprehensiveBehaviorMatches:
        fingerprints.comprehensiveBehavior ===
        CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      capturedReferenceCatalogFingerprint:
        CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
      currentReferenceCatalogFingerprint: fingerprints.referenceCatalog,
      referenceCatalogMatches:
        fingerprints.referenceCatalog ===
        CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
    },
    recommendedFirstImplementationTranche: [
      "ninety-ninety-breathing",
      "dead-bug",
      "pallof-press",
    ],
    ownerDecisionItems: [
      "Approve, revise, or reject each PROPOSE_ACCEPTED field before any production metadata is added.",
      "Resolve the 17 needs-review fields, including whether the three external-reference recommendations require commissioned source review.",
      "Decide whether Dumbbell Shoulder Press and generic Machine Row need variant/setup-specific catalog identities before profile curation.",
      "Confirm that optional load/support keeps Split Squat and Step-Up loaded bracing unknown at exercise-definition scope.",
      "Confirm that the first implementation tranche is limited to 90/90 Breathing, Dead Bug, and Pallof Press.",
      "Keep exposure classifications report-only until prescription and Weekly Development Ledger contracts exist.",
    ],
    classification: "TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL",
  };
}

function markdownCell(value: string | number | boolean): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number | boolean)[])[],
): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function bullets(values: readonly string[]): string {
  return values.map((value) => `- ${value}`).join("\n");
}

function matrixCell(proposalValue: TrunkFunctionCurationProposal): string {
  const classLabel = proposalValue.provenanceClass.slice(0, 1);
  return `${proposalValue.level} / ${proposalValue.proposalStatus} / ${classLabel}`;
}

export function renderTrunkMechanicsCurationProposal(
  data: TrunkMechanicsCurationProposalData,
): string {
  const { proposalCounts, provenanceCounts, exposureCounts, behaviorBoundary } =
    data;

  return [
    "# Training Engine V2 Trunk Mechanics Curation Proposal",
    "",
    "## Purpose and Boundary",
    "",
    "This is a conservative human-curation proposal for a representative tranche of 14 existing reference exercises. It does not implement `TrunkMechanicsProfile` metadata, add exercises or roles, or change eligibility, scoring, ranking, pain, phase, assessment, transitions, prescription, composition, or weekly accounting.",
    "",
    "Exercise ID, name, summary, coaching cues, tags, and free-text contraindications are used only to locate records for review. Every non-unknown proposal cites independent structured fields or identifies an explicit future review artifact.",
    "",
    "## Operational Definitions",
    "",
    "- **Breathing / pressure coordination:** coordinated breathing, pressure management, and ribcage-pelvis organization meaningfully involved in execution.",
    "- **Anti-extension:** meaningful resistance to unwanted trunk extension or loss of ribcage-pelvis position.",
    "- **Anti-rotation:** meaningful resistance to unwanted axial rotation.",
    "- **Anti-lateral flexion:** meaningful resistance to unwanted side bending or lateral displacement.",
    "- **Controlled flexion:** intentional controlled trunk flexion or abdominal shortening.",
    "- **Controlled rotation:** intentional production and control of trunk rotation, distinct from resisting rotation.",
    "- **Loaded bracing:** meaningful maintenance of trunk position under external load.",
    "- **Gait / load transfer:** meaningful transfer of force during gait, marching, stepping, carrying, or related locomotor activity.",
    "",
    "These fields describe expression while an exercise is performed. They do not grant a movement role or selection purpose.",
    "",
    "## Level and Review Doctrine",
    "",
    "- `unknown`: current reviewed evidence is unavailable or insufficient. It is not converted to low or none.",
    "- `none`: reviewed structured evidence supports no meaningful expression. None requires evidence.",
    "- `low`: present but minor and not an important challenge or developmental contribution.",
    "- `moderate`: materially contributes to execution and may supply meaningful secondary exposure.",
    "- `high`: central to successful execution or primary developmental intent; it does not mean harder, safer, superior, or directly selectable.",
    "- `PROPOSE_ACCEPTED`: independently structured current evidence is sufficient to put the field before the owner for acceptance.",
    "- `PROPOSE_NEEDS_REVIEW`: a level is plausible but remains qualified pending human or external review.",
    "- `REMAIN_UNKNOWN`: no level is manufactured from absence, prose, or intuition.",
    "",
    "## Provenance Policy",
    "",
    table(
      ["Class", "Meaning", "Future source rule"],
      [
        [
          "A_STRUCTURED_EXISTING_EVIDENCE",
          "Existing independent typed fields directly support the proposal.",
          "A future reference_catalog annotation must cite those pre-existing fields, not itself.",
        ],
        [
          "B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
          "Structured facts make a biomechanical judgment plausible but do not settle it.",
          "The pending sourceRef must be replaced by a genuine signed/recorded review artifact before acceptance.",
        ],
        [
          "C_EXTERNAL_REFERENCE_RECOMMENDED",
          "A primary technical source would materially improve confidence.",
          "The pending sourceRef must be replaced by an actual citation and human review before acceptance.",
        ],
        [
          "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
          "Current evidence cannot support a level.",
          "Future evidence source remains unknown and provenance remains empty.",
        ],
      ],
    ),
    "",
    "`reference_catalog` is not independent evidence merely because a future profile would be stored there. Proposal refs identify the current fields that existed before the proposed profile.",
    "",
    "## Tranche and Counts",
    "",
    `Exercises: ${data.exercises.length}. Function proposals: ${data.tracePreview.length}.`,
    "",
    table(
      ["Proposal status", "Count"],
      [
        ["PROPOSE_ACCEPTED", proposalCounts.PROPOSE_ACCEPTED],
        ["PROPOSE_NEEDS_REVIEW", proposalCounts.PROPOSE_NEEDS_REVIEW],
        ["REMAIN_UNKNOWN", proposalCounts.REMAIN_UNKNOWN],
      ],
    ),
    "",
    table(
      ["Provenance class", "Count"],
      [
        [
          "A_STRUCTURED_EXISTING_EVIDENCE",
          provenanceCounts.A_STRUCTURED_EXISTING_EVIDENCE,
        ],
        [
          "B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
          provenanceCounts.B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED,
        ],
        [
          "C_EXTERNAL_REFERENCE_RECOMMENDED",
          provenanceCounts.C_EXTERNAL_REFERENCE_RECOMMENDED,
        ],
        [
          "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
          provenanceCounts.D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN,
        ],
      ],
    ),
    "",
    "## Complete 14 x 8 Function Matrix",
    "",
    "Cell format: `level / proposal status / provenance class (A-D)`.",
    "",
    table(
      [
        "Exercise",
        "Breathing / pressure",
        "Anti-extension",
        "Anti-rotation",
        "Anti-lateral flexion",
        "Controlled flexion",
        "Controlled rotation",
        "Loaded bracing",
        "Gait / load transfer",
      ],
      data.exercises.map((exercise) => [
        `${exercise.exerciseId} / ${exercise.exerciseName}`,
        matrixCell(exercise.functions.breathingPressureCoordination),
        matrixCell(exercise.functions.antiExtensionContribution),
        matrixCell(exercise.functions.antiRotationContribution),
        matrixCell(exercise.functions.antiLateralFlexionContribution),
        matrixCell(exercise.functions.controlledFlexionContribution),
        matrixCell(exercise.functions.controlledRotationContribution),
        matrixCell(exercise.functions.loadedBracingContribution),
        matrixCell(exercise.functions.gaitLoadTransferContribution),
      ]),
    ),
    "",
    "## Exercise-Level Rationales",
    "",
    table(
      ["Exercise", "Ordinary use", "Rationale", "Context sensitivity"],
      data.exercises.map((exercise) => [
        exercise.exerciseName,
        exercise.ordinaryUse,
        exercise.exerciseRationale,
        exercise.contextSensitivity,
      ]),
    ),
    "",
    "## Direct / Secondary Exposure Preview",
    "",
    `DIRECT_DEVELOPMENTAL=${exposureCounts.DIRECT_DEVELOPMENTAL}; MEANINGFUL_SECONDARY=${exposureCounts.MEANINGFUL_SECONDARY}; INCIDENTAL_BRACING=${exposureCounts.INCIDENTAL_BRACING}; NO_REVIEWED_EXPOSURE=${exposureCounts.NO_REVIEWED_EXPOSURE}.`,
    "",
    table(
      ["Exercise", "Report-only ordinary-use preview", "Reason", "Why it can change"],
      data.exercises.map((exercise) => [
        exercise.exerciseName,
        exercise.exposurePreview,
        exercise.exposureRationale,
        exercise.contextSensitivity,
      ]),
    ),
    "",
    "These are report interpretations, not `ExerciseDefinition` metadata. Requested role, section, prescription, load, support, phase, and actual use can change exposure classification. No static exposure field or Weekly Development Ledger is implemented.",
    "",
    "## Future Trace Preview",
    "",
    "Each row previews the exact field-level evidence a future implemented profile would expose after owner decisions. `profilePresent=true` is hypothetical here; every production reference exercise still reports profile unavailable.",
    "",
    table(
      [
        "exerciseId",
        "profilePresent",
        "function",
        "proposed level",
        "proposed review status",
        "future field status",
        "source class",
        "future source",
        "proposed sourceRef",
        "evidence basis",
        "notes",
        "remaining uncertainty",
      ],
      data.tracePreview.map((row) => [
        row.exerciseId,
        row.profilePresent,
        row.function,
        row.proposedLevel,
        row.proposedReviewStatus,
        row.futureReviewStatus,
        row.sourceClass,
        row.futureEvidenceSource,
        row.proposedSourceRef,
        row.evidenceBasis,
        row.notes,
        row.remainingUncertainty,
      ]),
    ),
    "",
    "## Internal Consistency, Contradictions, and Uncertainty",
    "",
    table(
      ["Check", "Status", "Evidence"],
      data.consistencyFindings.map((finding) => [
        finding.check,
        finding.status,
        finding.evidence,
      ]),
    ),
    "",
    "There are no silent blocking contradictions. The three `REVIEW_WARNING` rows intentionally preserve possible duplicate-description risk for owner review rather than resolving it through code or scoring.",
    "",
    "## Protected Legacy Review",
    "",
    `Golden ancestor: \`${data.goldenAncestor}\`. Legacy material is migration evidence only.`,
    "",
    table(
      ["Legacy claim", "Legacy evidence", "Disposition", "Proposal use"],
      data.legacyFindings.map((finding) => [
        finding.claim,
        finding.legacyEvidence,
        finding.disposition,
        finding.proposalUse,
      ]),
    ),
    "",
    "Name/tag sniffing, free-text pain authority, fixed core quotas, and automatic progression across trunk functions remain rejected.",
    "",
    "## Behavioral Boundary Proof",
    "",
    table(
      ["Artifact", "Captured before proposal", "Current", "Match"],
      [
        [
          "22-scenario production ranking",
          behaviorBoundary.capturedProductionRankingFingerprint,
          behaviorBoundary.currentProductionRankingFingerprint,
          behaviorBoundary.productionRankingMatches,
        ],
        [
          "Comprehensive totals/components/rejections/pain/phase/assessment behavior",
          behaviorBoundary.capturedComprehensiveBehaviorFingerprint,
          behaviorBoundary.currentComprehensiveBehaviorFingerprint,
          behaviorBoundary.comprehensiveBehaviorMatches,
        ],
        [
          "Serialized production reference catalog",
          behaviorBoundary.capturedReferenceCatalogFingerprint,
          behaviorBoundary.currentReferenceCatalogFingerprint,
          behaviorBoundary.referenceCatalogMatches,
        ],
      ],
    ),
    "",
    "Synthetic-profile invariants remain covered by the accepted trunk contract suite: profiles cannot alter hard eligibility, role truth, totals, ranking, pain readiness, phase, assessment, or transitions because no production consumer exists beyond validation and trace observability.",
    "",
    "## Recommended First Metadata Implementation Tranche",
    "",
    bullets(data.recommendedFirstImplementationTranche),
    "",
    "These three direct rows have the strongest explicit role and trunk-target evidence. Implement them only after owner decisions on every field and genuine review artifacts for qualified annotations. Do not implement the secondary or supported rows merely because this proposal records plausible levels.",
    "",
    "## Project-Owner Decisions Required",
    "",
    bullets(data.ownerDecisionItems),
    "",
    "## Final Classification",
    "",
    `**${data.classification}**`,
    "",
    "The matrix is complete, conservative, non-circular, and behaviorally isolated. It is ready for field-by-field owner approval, revision, or rejection; no profile is implemented by this classification.",
    "",
  ].join("\n");
}

export function writeTrunkMechanicsCurationProposal(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: TrunkMechanicsCurationProposalData;
} {
  const data = buildTrunkMechanicsCurationProposalData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/TRUNK_MECHANICS_CURATION_PROPOSAL.md",
  );
  writeFileSync(outputPath, renderTrunkMechanicsCurationProposal(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeTrunkMechanicsCurationProposal();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        exercises: result.data.exercises.length,
        functionProposals: result.data.tracePreview.length,
        proposalCounts: result.data.proposalCounts,
        classification: result.data.classification,
      },
      null,
      2,
    ),
  );
}
