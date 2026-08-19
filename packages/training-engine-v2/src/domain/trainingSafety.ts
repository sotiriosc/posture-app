import type { AcuteSeverePain } from "./painInjury";

export const TRAINING_SAFETY_REVIEW_LEVELS = [
  "review_required_before_ordinary_training",
  "urgent_external_review_required",
] as const;

export type TrainingSafetyReviewLevel =
  (typeof TRAINING_SAFETY_REVIEW_LEVELS)[number];

export const TRAINING_SAFETY_AUTHORITY_SOURCES = [
  "athlete_report",
  "clinician",
  "coach",
  "upstream_safety_system",
  "other_external_authority",
] as const;

export type TrainingSafetyAuthoritySource =
  (typeof TRAINING_SAFETY_AUTHORITY_SOURCES)[number];

export interface TrainingSafetyAuthority {
  readonly source: TrainingSafetyAuthoritySource;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly reportedBy: string;
  readonly reportedAt: string;
}

export type TrainingSafetyResolution =
  | { readonly state: "unresolved" }
  | {
      readonly state: "externally_resolved";
      readonly resolvedAt: string;
      readonly resolvedBy: string;
      readonly sourceRef: string;
      readonly evidenceBasis: readonly string[];
    };

export interface TrainingSafetySignal {
  readonly signalId: string;
  readonly requestedReviewLevel: TrainingSafetyReviewLevel;
  readonly authority: TrainingSafetyAuthority;
  readonly resolution: TrainingSafetyResolution;
  readonly notes: readonly string[];
}

export interface TrainingSafetyState {
  readonly signals: readonly TrainingSafetySignal[];
}

export const NO_TRAINING_SAFETY_SIGNALS: TrainingSafetyState = { signals: [] };

export type TrainingReadinessStatus =
  | "TRAINING_ALLOWED"
  | "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING"
  | "URGENT_EXTERNAL_REVIEW_REQUIRED";

export interface TrainingReadinessEvidenceTrace {
  readonly signalId: string;
  readonly source:
    | "independent_training_safety_signal"
    | "legacy_acute_severe_pain_explicit_urgent_bridge";
  readonly requestedReviewLevel: TrainingSafetyReviewLevel;
  readonly authority: TrainingSafetyAuthority;
  readonly resolution: TrainingSafetyResolution;
  readonly notes: readonly string[];
}

export interface TrainingReadinessTrace {
  readonly status: TrainingReadinessStatus;
  readonly downstreamTrainingAllowed: boolean;
  readonly reviewRequiredFirst: boolean;
  readonly urgentExternalReviewRequired: boolean;
  readonly unresolvedSignalIds: readonly string[];
  readonly externallyResolvedSignalIds: readonly string[];
  readonly evidence: readonly TrainingReadinessEvidenceTrace[];
  readonly reason: string;
}

export interface TrainingSafetyValidationFinding {
  readonly severity: "error";
  readonly code: string;
  readonly message: string;
  readonly signalId?: string;
}

function validExplicitTime(value: string): boolean {
  return (
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

export function validateTrainingSafetyState(
  state: TrainingSafetyState,
): readonly TrainingSafetyValidationFinding[] {
  const findings: TrainingSafetyValidationFinding[] = [];
  const ids = new Set<string>();
  const add = (code: string, message: string, signalId?: string): void => {
    findings.push({ severity: "error", code, message, signalId });
  };

  if (!Array.isArray(state.signals)) {
    return [{
      severity: "error",
      code: "invalid_training_safety_signals",
      message: "Training safety signals must be an array.",
    }];
  }
  for (const signal of state.signals) {
    if (typeof signal !== "object" || signal === null) {
      add("invalid_training_safety_signal", "Training safety signal must be a structured object.");
      continue;
    }
    if (!signal.signalId?.trim()) {
      add("missing_training_safety_signal_id", "Training safety signalId is required.");
    } else if (ids.has(signal.signalId)) {
      add("duplicate_training_safety_signal_id", "Training safety signalId must be unique.", signal.signalId);
    } else {
      ids.add(signal.signalId);
    }
    if (!TRAINING_SAFETY_REVIEW_LEVELS.includes(signal.requestedReviewLevel)) {
      add("invalid_training_safety_review_level", "Training safety review level is invalid.", signal.signalId);
    }
    if (!TRAINING_SAFETY_AUTHORITY_SOURCES.includes(signal.authority?.source)) {
      add("invalid_training_safety_authority", "Training safety authority source is invalid.", signal.signalId);
    }
    if (!signal.authority?.sourceRef?.trim() || !signal.authority?.reportedBy?.trim()) {
      add("incomplete_training_safety_authority", "Training safety authority requires sourceRef and reportedBy.", signal.signalId);
    }
    if (!signal.authority?.evidenceBasis?.length || signal.authority.evidenceBasis.some((item: string) => !item.trim())) {
      add("invalid_training_safety_evidence_basis", "Training safety authority requires structured evidence basis.", signal.signalId);
    }
    if (!validExplicitTime(signal.authority?.reportedAt ?? "")) {
      add("invalid_training_safety_reported_at", "Training safety reportedAt requires a valid timestamp.", signal.signalId);
    }
    if (signal.resolution?.state === "externally_resolved") {
      if (
        !validExplicitTime(signal.resolution.resolvedAt) ||
        !signal.resolution.resolvedBy.trim() ||
        !signal.resolution.sourceRef.trim() ||
        signal.resolution.evidenceBasis.length === 0 ||
        signal.resolution.evidenceBasis.some((item: string) => !item.trim())
      ) {
        add("invalid_training_safety_resolution", "External resolution requires time, identity, sourceRef, and evidence basis.", signal.signalId);
      }
    } else if (signal.resolution?.state !== "unresolved") {
      add("invalid_training_safety_resolution_state", "Training safety resolution state is invalid.", signal.signalId);
    }
  }
  return findings;
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function legacyUrgentBridge(
  signals: readonly AcuteSeverePain[],
): readonly TrainingReadinessEvidenceTrace[] {
  return signals
    .filter((signal) => signal.urgentReviewRecommended === true)
    .map((signal) => ({
      signalId: signal.id,
      source: "legacy_acute_severe_pain_explicit_urgent_bridge" as const,
      requestedReviewLevel: "urgent_external_review_required" as const,
      authority: {
        source: "upstream_safety_system" as const,
        sourceRef: `PainAndInjuryState.acuteSeverePain:${signal.id}:urgentReviewRecommended`,
        evidenceBasis: [
          "Legacy compatibility bridge reads the explicit urgentReviewRecommended flag; severity is not the bridge condition.",
        ],
        reportedBy: "legacy_pain_state_adapter",
        reportedAt: "unknown",
      },
      resolution: { state: "unresolved" as const },
      notes: [],
    }));
}

export function buildTrainingReadinessTrace(input: {
  readonly trainingSafety?: TrainingSafetyState;
  readonly acuteSeverePain?: readonly AcuteSeverePain[];
}): TrainingReadinessTrace {
  const independentEvidence = (input.trainingSafety?.signals ?? []).map(
    (signal): TrainingReadinessEvidenceTrace => ({
      signalId: signal.signalId,
      source: "independent_training_safety_signal",
      requestedReviewLevel: signal.requestedReviewLevel,
      authority: signal.authority,
      resolution: signal.resolution,
      notes: signal.notes,
    }),
  );
  const evidence = [
    ...independentEvidence,
    ...legacyUrgentBridge(input.acuteSeverePain ?? []),
  ].sort((left, right) => left.signalId.localeCompare(right.signalId));
  const unresolved = evidence.filter(
    (candidate) => candidate.resolution.state === "unresolved",
  );
  const urgent = unresolved.some(
    (candidate) =>
      candidate.requestedReviewLevel === "urgent_external_review_required",
  );
  const status: TrainingReadinessStatus = urgent
    ? "URGENT_EXTERNAL_REVIEW_REQUIRED"
    : unresolved.length > 0
      ? "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING"
      : "TRAINING_ALLOWED";

  return {
    status,
    downstreamTrainingAllowed: status === "TRAINING_ALLOWED",
    reviewRequiredFirst: status !== "TRAINING_ALLOWED",
    urgentExternalReviewRequired: status === "URGENT_EXTERNAL_REVIEW_REQUIRED",
    unresolvedSignalIds: unique(unresolved.map((candidate) => candidate.signalId)),
    externallyResolvedSignalIds: unique(
      evidence
        .filter((candidate) => candidate.resolution.state === "externally_resolved")
        .map((candidate) => candidate.signalId),
    ),
    evidence,
    reason:
      status === "TRAINING_ALLOWED"
        ? "No explicit unresolved training-safety authority prevents ordinary downstream training."
        : urgent
          ? "Explicit unresolved authority requires urgent external review before ordinary downstream training."
          : "Explicit unresolved authority requires review before ordinary downstream training.",
  };
}
