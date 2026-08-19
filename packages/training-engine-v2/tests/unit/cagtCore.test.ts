import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER, type CagtCounterfactualContract } from "../cagt/contracts";
import { buildCuratedCagtPairs, runCuratedCagtPairs } from "../cagt/cohorts";
import { validateFixtureDifference } from "../cagt/diff";
import { runCagtPair } from "../cagt/runner";
import { buildNoRescueMutation } from "../cagt/stress";

describe("Causal Adaptation Gate Testing core", () => {
  it("runs every curated pair in immutable Gate 0-16 order", () => {
    const results = runCuratedCagtPairs();
    expect(results).toHaveLength(32);
    expect(results.every((result) => result.finalScoredResult === "PASS")).toBe(true);
    expect(results.every((result) => result.gateResults.map((entry) => entry.gate).join("|") === CAGT_GATE_ORDER.join("|"))).toBe(true);
  });

  it("fails invalid and undeclared fixture differences at Gate 0", () => {
    expect(validateFixtureDifference({ baseline: { goal: "strength" }, counterfactual: { goal: "hypertrophy", label: "changed" },
      declaredPaths: ["goal"] })).toMatchObject({ valid: false, reasonCode: "FIXTURE_DIFF_INVALID" });
    const pair = buildCuratedCagtPairs()[0];
    const result = runCagtPair({ ...pair, contract: { ...pair.contract, changedFactPaths: ["undeclared.path"] } });
    expect(result).toMatchObject({ firstFailingGate: "gate_0_scenario_truth", finalScoredResult: "FAIL_STOP" });
  });

  it("permits expected and structured justified convergence", () => {
    const results = runCuratedCagtPairs();
    expect(results.find((entry) => entry.contractId === "athlete-label-only")?.classification).toBe("EXPECTED_CONVERGENCE");
    expect(results.find((entry) => entry.contractId === "same-exercise-justified")?.classification).toBe("JUSTIFIED_CONVERGENCE");
  });

  it("rejects trace-only response, early response, and late unresponsiveness", () => {
    const source = buildCuratedCagtPairs().find((entry) => entry.contract.id === "direct-calf-priority")!;
    const traceOnly = runCagtPair({ ...source,
      counterfactual: { ...source.counterfactual, gates: { gate_1_weekly_responsibility_truth: { dimensions: { trace_only: "changed" } } } },
      contract: { ...source.contract, latestRequiredResponseGate: "gate_1_weekly_responsibility_truth" } });
    expect(traceOnly.classification).toBe("TRACE_ONLY_DIFFERENCE_NOT_SUFFICIENT");
    const noResponse = runCagtPair({ ...source, counterfactual: { ...source.counterfactual, gates: {} },
      contract: { ...source.contract, latestRequiredResponseGate: "gate_1_weekly_responsibility_truth" } });
    expect(noResponse.classification).toBe("UNRESPONSIVE_TO_MATERIAL_INPUT");
    const earlyContract: CagtCounterfactualContract = { ...source.contract, earliestPermittedResponseGate: "gate_7_candidate_intelligence_truth",
      latestRequiredResponseGate: "gate_7_candidate_intelligence_truth", permittedDifferenceDimensions: ["session_needs"] };
    const early = runCagtPair({ ...source, contract: earlyContract,
      baseline: { ...source.baseline, gates: { gate_6_session_intent_truth: { dimensions: { session_needs: "a" } } } },
      counterfactual: { ...source.counterfactual, gates: { gate_6_session_intent_truth: { dimensions: { session_needs: "b" } } } } });
    expect(early.classification).toBe("OVER_ADAPTATION");
  });

  it("stops scoring and rejects downstream rep rescue while retaining shadow diagnostics", () => {
    const result = runCagtPair({ ...buildNoRescueMutation(), shadowAfterFailure: true });
    expect(result).toMatchObject({ firstFailingGate: "gate_1_weekly_responsibility_truth",
      classification: "DOWNSTREAM_RESCUE_REJECTED", downstreamRescueAttempted: true,
      downstreamDifferencesScored: false, finalScoredResult: "FAIL_STOP" });
    expect(result.gateResults.filter((entry) => entry.diagnosticOnly).every((entry) => !entry.scored)).toBe(true);
  });

  it("never reports design-only as production proof or not-implemented as pass", () => {
    const result = runCuratedCagtPairs().find((entry) => entry.contractId === "direct-calf-priority")!;
    expect(result.gateResults.find((entry) => entry.gate === "gate_1_weekly_responsibility_truth"))
      .toMatchObject({ authority: "DESIGN_ONLY", reasonCode: "DESIGN_EVIDENCE_PASS" });
    expect(result.gateResults.filter((entry) => entry.authority === "NOT_IMPLEMENTED").every((entry) => entry.state !== "PASS")).toBe(true);
    const source = buildCuratedCagtPairs()[0];
    const future = runCagtPair({ ...source, contract: { ...source.contract, materiality: "material",
      earliestPermittedResponseGate: "gate_13_post_prescription_weekly_validation",
      latestRequiredResponseGate: "gate_13_post_prescription_weekly_validation" } });
    expect(future).toMatchObject({ classification: "DIFFERENCE_DEFERRED_TO_LATER_OWNER", finalScoredResult: "NOT_IMPLEMENTED" });
  });
});
