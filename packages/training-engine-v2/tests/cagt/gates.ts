import {
  CAGT_GATE_AUTHORITY, CAGT_GATE_ORDER, type CagtCounterfactualContract, type CagtDifferenceDimension,
  type CagtGateId, type CagtGateResult, type CagtScenario,
} from "./contracts";
import { differingDimensions, materialDimensions, validateFixtureDifference } from "./diff";

const indexOf = (gate: CagtGateId | null): number => gate === null ? -1 : CAGT_GATE_ORDER.indexOf(gate);

export function evaluateGate(input: { gate: CagtGateId; contract: CagtCounterfactualContract; baseline: CagtScenario;
  counterfactual: CagtScenario; failedGate: CagtGateId | null; failedReason: string | null; shadow: boolean;
  materialResponseObserved: boolean }): CagtGateResult {
  const { gate, contract } = input;
  const authority = CAGT_GATE_AUTHORITY[gate];
  const empty = { gate, authority, differingDimensions: [] as readonly CagtDifferenceDimension[],
    materialDifferingDimensions: [] as readonly CagtDifferenceDimension[] };
  if (input.failedGate && !input.shadow) return { ...empty, state: "NOT_REACHED", classification: null,
    reasonCode: "EARLIER_GATE_FAILED", invalidUpstreamGate: input.failedGate, invalidUpstreamReason: input.failedReason,
    scored: false, diagnosticOnly: false };
  const left = input.baseline.gates[gate]?.dimensions ?? {};
  const right = input.counterfactual.gates[gate]?.dimensions ?? {};
  const dimensions = differingDimensions(left, right);
  const material = materialDimensions(dimensions);
  if (input.failedGate && input.shadow) return { gate, authority, state: "SHADOW_DIAGNOSTIC_ONLY", classification: null,
    differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: "INVALID_UPSTREAM_CONTEXT",
    invalidUpstreamGate: input.failedGate, invalidUpstreamReason: input.failedReason, scored: false, diagnosticOnly: true };
  if (gate === "gate_0_scenario_truth") {
    const fixture = validateFixtureDifference({ baseline: input.baseline.fixture, counterfactual: input.counterfactual.fixture,
      declaredPaths: contract.changedFactPaths, ignoredPaths: ["scenarioId", "evidenceRef", "traceLabel"] });
    return { ...empty, state: fixture.valid ? "PASS" : "FAIL_STOP", classification: fixture.valid ? null : "WRONG_LAYER_EFFECT",
      reasonCode: fixture.reasonCode, invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
  }
  if (authority === "NOT_IMPLEMENTED") return { gate, authority, state: "NOT_IMPLEMENTED", classification: null,
    differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: "GATE_NOT_IMPLEMENTED",
    invalidUpstreamGate: null, invalidUpstreamReason: null, scored: false, diagnosticOnly: false };
  const gateIndex = indexOf(gate);
  const earliest = indexOf(contract.earliestPermittedResponseGate);
  const latest = indexOf(contract.latestRequiredResponseGate);
  const prohibited = material.filter((dimension) => contract.prohibitedDifferenceDimensions.includes(dimension));
  if (prohibited.length > 0 || contract.invariantGates.includes(gate) && material.length > 0 || earliest >= 0 && gateIndex < earliest && material.length > 0) {
    return { gate, authority, state: "FAIL_STOP", classification: earliest >= 0 && gateIndex < earliest ? "OVER_ADAPTATION" : "WRONG_LAYER_EFFECT",
      differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: "RESPONSE_OUTSIDE_CAUSAL_AUTHORITY",
      invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
  }
  const permitted = material.filter((dimension) => contract.permittedDifferenceDimensions.includes(dimension));
  if (permitted.length > 0) return { gate, authority, state: "PASS", classification: "MATERIAL_ADAPTATION",
    differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: authority === "DESIGN_ONLY" ? "DESIGN_EVIDENCE_PASS" : "RIGHTFUL_MATERIAL_RESPONSE",
    invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
  if (latest === gateIndex && contract.materiality === "material") {
    if (input.materialResponseObserved) return { gate, authority, state: "PASS", classification: null,
      differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: "RESPONSE_WINDOW_ALREADY_SATISFIED",
      invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
    if (contract.justifiedConvergenceReason && contract.acceptableConvergenceReasons.includes(contract.justifiedConvergenceReason)) {
      return { gate, authority, state: "PASS_WITH_JUSTIFIED_CONVERGENCE", classification: "JUSTIFIED_CONVERGENCE",
        differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: contract.justifiedConvergenceReason,
        invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
    }
    return { gate, authority, state: "FAIL_STOP", classification: dimensions.length > 0 ? "TRACE_ONLY_DIFFERENCE_NOT_SUFFICIENT" : "UNRESPONSIVE_TO_MATERIAL_INPUT",
      differingDimensions: dimensions, materialDifferingDimensions: material, reasonCode: "LATEST_RIGHTFUL_GATE_UNRESPONSIVE",
      invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
  }
  if (contract.materiality === "inert" && gate === "gate_12_all_horizon_sessions") return { gate, authority,
    state: "PASS_WITH_EXPECTED_CONVERGENCE", classification: "EXPECTED_CONVERGENCE", differingDimensions: dimensions,
    materialDifferingDimensions: material, reasonCode: "EXPECTED_INERT_CONVERGENCE", invalidUpstreamGate: null,
    invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
  return { gate, authority, state: "PASS", classification: null, differingDimensions: dimensions,
    materialDifferingDimensions: material, reasonCode: authority === "DESIGN_ONLY" ? "DESIGN_EVIDENCE_PASS" :
      authority === "HANDOFF_ONLY" ? "HANDOFF_BOUNDARY_PASS" : authority === "FOUNDATION_ONLY" ? "FOUNDATION_EVIDENCE_PASS" : "INVARIANT_PRESERVED",
    invalidUpstreamGate: null, invalidUpstreamReason: null, scored: true, diagnosticOnly: false };
}
