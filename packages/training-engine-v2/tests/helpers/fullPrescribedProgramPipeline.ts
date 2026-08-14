import {
  validatePostPrescriptionWeek,
  type ProductionPostPrescriptionWeekValidationInput,
} from "../../src";
import { CAGT_GATE_ORDER, type CagtGateId } from "../cagt/contracts";
import {
  FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
  type FullPrescribedProgramSnapshot,
  type FullProgramUpstreamGateResult,
} from "../cagt/fullProgramContracts";
import {
  type CagtEffectiveAuthorityRegistry,
  validateEffectiveAuthorityRegistryV2,
} from "../cagt/effectiveAuthorityRegistryV2";
import { digest } from "../cagt/signatures";

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
  return Object.freeze(value);
}

export function deriveFullPrescribedProgramSnapshotId(
  input: ProductionPostPrescriptionWeekValidationInput,
  validationId: string,
): string {
  return `full-prescribed-program:${digest({
    athleteId: input.weekSource.athleteId,
    planningHorizonId: input.weekSource.planningHorizonId,
    weeklyIntentId: input.weekSource.weeklyIntentId,
    weekAllocationPlanId: input.weekSource.weekAllocationPlanId,
    validatorContract: input.validatorContract,
    validationId,
  }).slice(0, 16)}`;
}

function deriveSnapshotRevisionId(
  input: ProductionPostPrescriptionWeekValidationInput,
  validationRevisionId: string,
): string {
  return `full-prescribed-program-revision:${digest({
    sourceSnapshotRevisionId: input.weekSource.sourceSnapshotRevisionId,
    validationRevisionId,
    reservationArtifacts: input.sessionBundles.map((bundle) => ({
      reservationId: bundle.reservationId,
      opportunityId: bundle.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      prescriptionRevisionIds: bundle.prescriptionCompilation?.plans
        .map((plan) => plan.revisionLedger.finalRevisionId).sort() ?? [],
      sequenceRevisionId: bundle.sequencingResult?.plan?.revisionLedger.finalRevisionId ?? null,
    })).sort((left, right) => left.reservationId.localeCompare(right.reservationId)),
    evaluationTime: input.evaluationTime,
  }).slice(0, 16)}`;
}

function buildUpstreamGateResults(
  registry: CagtEffectiveAuthorityRegistry,
  gate13Failed: boolean,
  overrides: Partial<Readonly<Record<CagtGateId, FullProgramUpstreamGateResult["state"]>>>,
): readonly FullProgramUpstreamGateResult[] {
  return Object.freeze(CAGT_GATE_ORDER.slice(0, 14).map((gate) => {
    const typedGate = gate as FullProgramUpstreamGateResult["gate"];
    const state = overrides[gate] ??
      (gate === "gate_13_post_prescription_weekly_validation" && gate13Failed ? "FAIL_STOP" : "PASS");
    return Object.freeze({
      gate: typedGate,
      state,
      reasonCodes: Object.freeze([
        state === "FAIL_STOP" ? "CONTROLLED_UPSTREAM_FAILURE" : "UPSTREAM_EVIDENCE_AVAILABLE",
      ]),
      authority: registry.gates[gate].exactAuthority,
    });
  }));
}

export interface BuildFullPrescribedProgramSnapshotInput {
  readonly validationInput: ProductionPostPrescriptionWeekValidationInput;
  readonly authorityRegistry: CagtEffectiveAuthorityRegistry;
  readonly upstreamGateOverrides?: Partial<Readonly<Record<CagtGateId, FullProgramUpstreamGateResult["state"]>>>;
  readonly provenance?: readonly string[];
}

export type BuildFullPrescribedProgramSnapshotResult =
  | { readonly status: "built"; readonly snapshot: FullPrescribedProgramSnapshot; readonly reasonCodes: readonly string[] }
  | { readonly status: "incomplete"; readonly snapshot: null; readonly reasonCodes: readonly string[] };

export function buildFullPrescribedProgramSnapshot(
  request: BuildFullPrescribedProgramSnapshotInput,
): BuildFullPrescribedProgramSnapshotResult {
  const registryReasons = validateEffectiveAuthorityRegistryV2(request.authorityRegistry);
  if (registryReasons.length > 0) return { status: "incomplete", snapshot: null, reasonCodes: registryReasons };
  const input = structuredClone(request.validationInput);
  const missingArtifactReservations = input.sessionBundles.filter((bundle) =>
    !bundle.sessionIntent || !bundle.sessionSkeleton || !bundle.prescriptionCompilation || !bundle.sequencingResult?.plan)
    .map((bundle) => bundle.reservationId);
  if (missingArtifactReservations.length > 0) {
    return {
      status: "incomplete",
      snapshot: null,
      reasonCodes: Object.freeze(missingArtifactReservations.map((id) => `PROGRAM_SNAPSHOT_ARTIFACT_MISSING:${id}`)),
    };
  }
  const validationResult = validatePostPrescriptionWeek(input);
  if (!validationResult.revisionLedger) {
    return { status: "incomplete", snapshot: null, reasonCodes: Object.freeze(["PROGRAM_VALIDATION_REVISION_REQUIRED"]) };
  }
  const reservationArtifacts = input.sessionBundles.map((bundle) => Object.freeze({
    reservationId: bundle.reservationId,
    opportunityId: bundle.opportunityId,
    sessionIntent: bundle.sessionIntent!,
    sessionSkeleton: bundle.sessionSkeleton!,
    prescriptionCompilation: bundle.prescriptionCompilation!,
    finalSequencePlan: bundle.sequencingResult!.plan!,
  })).sort((left, right) => left.reservationId.localeCompare(right.reservationId));
  const snapshotId = deriveFullPrescribedProgramSnapshotId(input, validationResult.validationId);
  const snapshotRevisionId = deriveSnapshotRevisionId(input, validationResult.validationRevisionId);
  const upstreamGateResults = buildUpstreamGateResults(
    request.authorityRegistry,
    validationResult.gate13Trace.some((trace) => trace.state === "FAIL_STOP"),
    request.upstreamGateOverrides ?? {},
  );
  const snapshot: FullPrescribedProgramSnapshot = {
    snapshotContract: FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotId,
    snapshotRevisionId,
    athleteId: input.weekSource.athleteId,
    planningHorizonId: input.weekSource.planningHorizonId,
    weeklyIntentId: input.weekSource.weeklyIntentId,
    weekAllocationPlanId: input.weekSource.weekAllocationPlanId,
    normalizedWeekSourceSnapshot: input.weekSource,
    postPrescriptionWeekValidationResult: validationResult,
    reservationArtifacts,
    sessionIntents: reservationArtifacts.map((artifact) => artifact.sessionIntent),
    sessionSkeletons: reservationArtifacts.map((artifact) => artifact.sessionSkeleton),
    prescriptionSessionResults: reservationArtifacts.map((artifact) => artifact.prescriptionCompilation),
    finalSequencePlans: reservationArtifacts.map((artifact) => artifact.finalSequencePlan),
    finalValidationRevisions: validationResult.revisionLedger.revisions,
    upstreamGateResults,
    evaluationTime: input.evaluationTime,
    sourceAuthorityTrace: validationResult.inputAuthorityTrace,
    provenance: Object.freeze([
      "full-program-snapshot:structured-production-artifacts",
      ...(request.provenance ?? []),
    ]),
  };
  return { status: "built", snapshot: deepFreeze(snapshot), reasonCodes: Object.freeze([]) };
}

export function validateFullPrescribedProgramSnapshot(
  snapshot: FullPrescribedProgramSnapshot,
): readonly string[] {
  const reasons: string[] = [];
  if (snapshot.snapshotContract.contractId !== FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE.contractId ||
      snapshot.snapshotContract.version !== FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE.version) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_UNSUPPORTED");
  }
  if (!Object.isFrozen(snapshot) || !Object.isFrozen(snapshot.reservationArtifacts) ||
      !Object.isFrozen(snapshot.postPrescriptionWeekValidationResult)) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_SNAPSHOT_NOT_IMMUTABLE");
  }
  if (snapshot.reservationArtifacts.length !== snapshot.normalizedWeekSourceSnapshot.reservations.length) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_RESERVATION_ARTIFACT_COUNT_MISMATCH");
  }
  if (snapshot.finalValidationRevisions.length === 0 ||
      !snapshot.finalValidationRevisions.some((revision) =>
        revision.validationRevisionId === snapshot.postPrescriptionWeekValidationResult.validationRevisionId)) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_FINAL_VALIDATION_REVISION_MISSING");
  }
  if (snapshot.finalSequencePlans.some((plan) => !plan.revisionLedger.finalRevisionId)) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_FINAL_SEQUENCE_REVISION_MISSING");
  }
  if (snapshot.prescriptionSessionResults.some((result) => result.plans.some((plan) =>
    !plan.revisionLedger.finalRevisionId))) {
    reasons.push("FULL_PRESCRIBED_PROGRAM_FINAL_PRESCRIPTION_REVISION_MISSING");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function relineageFullProgramInput(
  source: ProductionPostPrescriptionWeekValidationInput,
  lineage: { readonly athleteId: string; readonly planningHorizonId: string; readonly suffix: string },
): ProductionPostPrescriptionWeekValidationInput {
  const input = structuredClone(source);
  const weeklyIntentId = `${input.weekSource.weeklyIntentId}:${lineage.suffix}`;
  const weekAllocationPlanId = `${input.weekSource.weekAllocationPlanId}:${lineage.suffix}`;
  const sourceSnapshotId = `${input.weekSource.sourceSnapshotId}:${lineage.suffix}`;
  const sourceSnapshotRevisionId = `${input.weekSource.sourceSnapshotRevisionId}:${lineage.suffix}`;
  return {
    ...input,
    weekSource: {
      ...input.weekSource,
      athleteId: lineage.athleteId,
      planningHorizonId: lineage.planningHorizonId,
      weeklyIntentId,
      weekAllocationPlanId,
      sourceSnapshotId,
      sourceSnapshotRevisionId,
    },
    sessionBundles: input.sessionBundles.map((bundle) => ({
      ...bundle,
      sessionIntent: bundle.sessionIntent ? { ...bundle.sessionIntent, athleteId: lineage.athleteId } : null,
    })),
  };
}

export function cloneFrozenFullProgramSnapshot(
  snapshot: FullPrescribedProgramSnapshot,
  mutate: (draft: FullPrescribedProgramSnapshot) => void,
): FullPrescribedProgramSnapshot {
  const draft = structuredClone(snapshot);
  mutate(draft);
  return deepFreeze(draft);
}
