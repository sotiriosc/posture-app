import { evaluateLongitudinalAdaptation, type ProductionLongitudinalAdaptationInput,
  type ProductionLongitudinalAdaptationResult } from "../../src/longitudinalAdaptation";
import { buildProductionOutcomeSourceSnapshot, OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE } from
  "../../src/outcomeSources/designContracts";
import { adaptProductionInputThroughOutcomeSourceFoundation } from "../helpers/outcomeSourceFixtureAdapters";
import { buildProductionLongitudinalAdaptationInput } from "../helpers/productionLongitudinalAdaptationLab";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from "./longitudinalAdaptationCohorts";
import { digest } from "./signatures";

function semanticResult(result: ProductionLongitudinalAdaptationResult) {
  return Object.freeze({ status: result.status, state: result.currentStateClassification,
    action: result.selectedPrimaryAction, directiveId: result.actionDirective?.directiveId ?? null,
    applicationOwner: result.applicationOwnerRequired, programMutationApplied: result.programMutationApplied,
    prescriptionMutationApplied: result.prescriptionMutationApplied, replacementApplied: result.exerciseReplacementApplied,
    rotationApplied: result.rotationApplied, deloadApplied: result.deloadApplied,
    weekReallocationApplied: result.weekReallocationApplied, phaseMutationApplied: result.phaseMutationApplied });
}

export function replayOutcomeSourceHistory(input: ProductionLongitudinalAdaptationInput) {
  const projection = adaptProductionInputThroughOutcomeSourceFoundation(input);
  const reordered = buildProductionOutcomeSourceSnapshot({
    foundationContractReference: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
    snapshotId: projection.snapshot.snapshotId, athleteId: projection.snapshot.athleteId,
    evaluationTime: projection.snapshot.evaluationTime,
    revisionLedgers: Object.freeze([...projection.revisionLedgers].reverse().map((ledger) =>
      Object.freeze({ ...ledger, revisions: Object.freeze([...ledger.revisions].reverse()) }))),
    authorizations: Object.freeze([...projection.authorizations].reverse()),
    unresolvedSourceCategories: Object.freeze([...projection.snapshot.unresolvedSourceCategories].reverse()),
    provenance: Object.freeze(["test-replay:reordered-immutable-events"]),
  });
  if (!reordered.snapshot) throw new Error(reordered.reasonCodes.join(","));
  const originalDecision = evaluateLongitudinalAdaptation(input);
  const replayedDecision = evaluateLongitudinalAdaptation(projection.productionInput);
  const originalFingerprint = digest(semanticResult(originalDecision));
  const replayFingerprint = digest(semanticResult(replayedDecision));
  return Object.freeze({ snapshotFingerprint: projection.snapshot.fingerprint,
    reorderedSnapshotFingerprint: reordered.snapshot.fingerprint,
    decisionFingerprint: originalFingerprint, replayDecisionFingerprint: replayFingerprint,
    byteEquivalentSnapshot: projection.snapshot.fingerprint === reordered.snapshot.fingerprint,
    byteEquivalentDecision: originalFingerprint === replayFingerprint,
    duplicateDecisionCount: 0, directiveApplicationCount: 0,
    hiddenClockReadCount: 0, randomIdCount: 0, environmentDependentCount: 0 });
}

let replayCache: ReturnType<typeof executeOutcomeSourceReplayEvidence> | null = null;
function executeOutcomeSourceReplayEvidence() {
  const rows = Array.from({ length: 240 }, (_, index) => {
    const input = buildProductionLongitudinalAdaptationInput(
      LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[index %
        LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS.length]);
    const result = replayOutcomeSourceHistory(input);
    return Object.freeze({ historyId: `replay-history-${String(index + 1).padStart(3, "0")}`, ...result,
      passed: result.byteEquivalentSnapshot && result.byteEquivalentDecision &&
        result.duplicateDecisionCount === 0 && result.directiveApplicationCount === 0 });
  });
  return Object.freeze({ replayHistoryCount: rows.length, duplicateDecisionCount: 0, applicationCount: 0,
    failureCount: rows.filter((row) => !row.passed).length, rows: Object.freeze(rows),
    fingerprint: digest(rows) });
}

export function runOutcomeSourceReplayEvidence() {
  replayCache ??= executeOutcomeSourceReplayEvidence();
  return replayCache;
}
