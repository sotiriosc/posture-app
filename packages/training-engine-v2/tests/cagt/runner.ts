import { CAGT_GATE_AUTHORITY, CAGT_GATE_ORDER, type CagtClassification, type CagtCounterfactualContract, type CagtGateId,
  type CagtPairResult, type CagtScenario } from "./contracts";
import { evaluateGate } from "./gates";

export function runCagtPair(input: { contract: CagtCounterfactualContract; baseline: CagtScenario;
  counterfactual: CagtScenario; shadowAfterFailure?: boolean }): CagtPairResult {
  let failedGate: CagtGateId | null = null;
  let failedReason: string | null = null;
  let materialResponseObserved = false;
  const results = CAGT_GATE_ORDER.map((gate) => {
    const result = evaluateGate({ gate, contract: input.contract, baseline: input.baseline, counterfactual: input.counterfactual,
      failedGate, failedReason, shadow: input.shadowAfterFailure ?? false, materialResponseObserved });
    if (!failedGate && result.classification === "MATERIAL_ADAPTATION") materialResponseObserved = true;
    if (!failedGate && result.state === "FAIL_STOP") { failedGate = gate; failedReason = result.reasonCode; }
    return result;
  });
  const anyDifference = results.find((result) => result.differingDimensions.length > 0)?.gate ?? null;
  const materialDifference = results.find((result) => result.materialDifferingDimensions.length > 0)?.gate ?? null;
  const firstDimensions = results.find((result) => result.gate === (materialDifference ?? anyDifference))?.differingDimensions ?? [];
  const classified = results.find((result) => result.classification === "MATERIAL_ADAPTATION")?.classification ??
    results.find((result) => result.classification)?.classification ??
    (input.contract.materiality === "inert" ? "EXPECTED_CONVERGENCE" : "JUSTIFIED_CONVERGENCE");
  const failedIndex = failedGate ? CAGT_GATE_ORDER.indexOf(failedGate) : -1;
  const downstream = failedIndex < 0 ? [] : results.slice(failedIndex + 1).flatMap((result) => result.materialDifferingDimensions);
  const downstreamRescueAttempted = downstream.length > 0;
  const requiredNotImplemented = input.contract.latestRequiredResponseGate !== null &&
    CAGT_GATE_AUTHORITY[input.contract.latestRequiredResponseGate] === "NOT_IMPLEMENTED";
  const classification: CagtClassification = failedGate && downstreamRescueAttempted ? "DOWNSTREAM_RESCUE_REJECTED" :
    requiredNotImplemented ? "DIFFERENCE_DEFERRED_TO_LATER_OWNER" : classified;
  return { contractId: input.contract.id, fixtureValid: results[0].state === "PASS",
    expectedEarliestGate: input.contract.earliestPermittedResponseGate, expectedLatestGate: input.contract.latestRequiredResponseGate,
    actualFirstAnyDifferenceGate: anyDifference, actualFirstMaterialDifferenceGate: materialDifference,
    firstDifferenceDimensions: firstDimensions, firstFailingGate: failedGate, classification,
    downstreamRescueAttempted, downstreamDifferencesObserved: [...new Set(downstream)].sort(), downstreamDifferencesScored: false,
    finalScoredResult: failedGate ? "FAIL_STOP" : requiredNotImplemented ? "NOT_IMPLEMENTED" : "PASS", gateResults: results };
}

export function summarizeGateStates(results: readonly CagtPairResult[]) {
  return CAGT_GATE_ORDER.map((gate) => { const rows = results.flatMap((result) => result.gateResults).filter((entry) => entry.gate === gate);
    return { gate, authority: rows[0]?.authority, pass: rows.filter((entry) => entry.state === "PASS").length,
      justifiedConvergence: rows.filter((entry) => entry.state === "PASS_WITH_JUSTIFIED_CONVERGENCE").length,
      deferred: rows.filter((entry) => entry.state === "PASS_DIFFERENCE_DEFERRED_TO_RIGHTFUL_OWNER").length,
      failStop: rows.filter((entry) => entry.state === "FAIL_STOP").length,
      notReached: rows.filter((entry) => entry.state === "NOT_REACHED" || entry.state === "NOT_IMPLEMENTED").length };
  });
}
