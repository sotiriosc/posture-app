import type {
  ExerciseDefinition,
  ExerciseMechanicsReviewStatus,
  TrunkFunctionAnnotation,
  TrunkFunctionEvidenceSource,
  TrunkFunctionLevel,
  TrunkFunctionProvenance,
  TrunkMechanicsFunction,
} from "./domain/exercise";

export type TrunkMechanicsTraceSource =
  | TrunkFunctionEvidenceSource
  | "profile_unavailable";

export interface TrunkFunctionAnnotationTrace {
  readonly level: TrunkFunctionLevel;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly source: TrunkMechanicsTraceSource;
  readonly provenance: readonly TrunkFunctionProvenance[];
  readonly notes: string;
}

export interface TrunkMechanicsTrace {
  readonly exerciseId: string;
  readonly profilePresent: boolean;
  readonly functions: Readonly<
    Record<TrunkMechanicsFunction, TrunkFunctionAnnotationTrace>
  >;
}

function unavailableAnnotation(
  functionName: TrunkMechanicsFunction,
): TrunkFunctionAnnotationTrace {
  return {
    level: "unknown",
    reviewStatus: "needs_review",
    source: "profile_unavailable",
    provenance: [],
    notes: `${functionName} is unavailable because no TrunkMechanicsProfile is present.`,
  };
}

function copyAnnotation(
  annotation: TrunkFunctionAnnotation,
): TrunkFunctionAnnotationTrace {
  return {
    ...annotation,
    provenance: annotation.provenance.map((entry) => ({
      sourceRef: entry.sourceRef,
      evidenceBasis: [...entry.evidenceBasis],
    })),
  };
}

function buildFunctionTraces(
  resolve: (functionName: TrunkMechanicsFunction) => TrunkFunctionAnnotationTrace,
): TrunkMechanicsTrace["functions"] {
  return {
    breathingPressureCoordination: resolve("breathingPressureCoordination"),
    antiExtensionContribution: resolve("antiExtensionContribution"),
    antiRotationContribution: resolve("antiRotationContribution"),
    antiLateralFlexionContribution: resolve("antiLateralFlexionContribution"),
    controlledFlexionContribution: resolve("controlledFlexionContribution"),
    controlledRotationContribution: resolve("controlledRotationContribution"),
    loadedBracingContribution: resolve("loadedBracingContribution"),
    gaitLoadTransferContribution: resolve("gaitLoadTransferContribution"),
  };
}

export function buildTrunkMechanicsTrace(
  exercise: ExerciseDefinition,
): TrunkMechanicsTrace {
  const profile = exercise.mechanics?.trunkMechanics;

  if (!profile) {
    return {
      exerciseId: exercise.id,
      profilePresent: false,
      functions: buildFunctionTraces(unavailableAnnotation),
    };
  }

  return {
    exerciseId: exercise.id,
    profilePresent: true,
    functions: buildFunctionTraces((functionName) =>
      copyAnnotation(profile[functionName]),
    ),
  };
}
