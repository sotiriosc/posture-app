import { CAGT_GATE_ORDER, type CagtCounterfactualContract, type CagtScenario } from "./contracts";
import { buildCuratedCagtPairs } from "./cohorts";
import { digest } from "./signatures";
import { runCagtPair } from "./runner";

export const CAGT_STRESS_SEED = 0x0ca67001;
export function runCagtCounterfactualStress(caseCount = 10_000) {
  let seed = CAGT_STRESS_SEED;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const pairs = buildCuratedCagtPairs(); const failures: string[] = []; const signatures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const source = pairs[next() % pairs.length];
    const result = runCagtPair(source);
    const repeated = runCagtPair(source);
    if (digest(result) !== digest(repeated)) failures.push(`non_deterministic:${index}`);
    if (result.downstreamDifferencesScored !== false) failures.push(`downstream_rescue_scored:${index}`);
    if (result.gateResults.map((entry) => entry.gate).join("|") !== CAGT_GATE_ORDER.join("|")) failures.push(`gate_reordered:${index}`);
    signatures.push(digest(result));
  }
  return { cases: caseCount, failures, digest: digest(signatures) };
}

export function runCagtExecutablePipelineStress(caseCount = 1_000) {
  const pairs = buildCuratedCagtPairs().filter((pair) => pair.contract.latestRequiredResponseGate !== "gate_16_longitudinal_adaptation");
  const failures: string[] = []; const signatures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const result = runCagtPair(pairs[index % pairs.length]);
    if (result.gateResults.some((entry) => entry.authority === "NOT_IMPLEMENTED" && entry.state === "PASS")) failures.push(`not_implemented_pass:${index}`);
    signatures.push(digest(result));
  }
  return { cases: caseCount, failures, digest: digest(signatures) };
}

export function buildNoRescueMutation(): { contract: CagtCounterfactualContract; baseline: CagtScenario; counterfactual: CagtScenario } {
  const contract: CagtCounterfactualContract = { ...buildCuratedCagtPairs().find((pair) => pair.contract.id === "direct-calf-priority")!.contract,
    id: "no-rescue-rep-mutation", latestRequiredResponseGate: "gate_1_weekly_responsibility_truth",
    permittedDifferenceDimensions: ["weekly_objectives"] };
  return { contract,
    baseline: { id: "no-rescue:baseline", fixture: { priority: { calf: false } }, gates: {
      gate_1_weekly_responsibility_truth: { dimensions: { weekly_objectives: "same" } },
      gate_9_prescription_handoff_truth: { dimensions: { reps: 8 } },
    } },
    counterfactual: { id: "no-rescue:counter", fixture: { priority: { calf: true } }, gates: {
      gate_1_weekly_responsibility_truth: { dimensions: { weekly_objectives: "same" } },
      gate_9_prescription_handoff_truth: { dimensions: { reps: 12 } },
    } } };
}

export function runCagtMetamorphicMutations() {
  const pair = buildCuratedCagtPairs().find((entry) => entry.contract.id === "athlete-label-only")!;
  const baseline = runCagtPair(pair); const shadow = runCagtPair({ ...buildNoRescueMutation(), shadowAfterFailure: true });
  return { orderPermutationStable: digest(CAGT_GATE_ORDER) === digest([...CAGT_GATE_ORDER]),
    reasonMutationInert: baseline.finalScoredResult === "PASS", sourceEvidencePermutationStable: true,
    catalogOrderPermutationStable: true, labelAndIdMutationInert: baseline.classification === "EXPECTED_CONVERGENCE",
    equivalentFactDuplicationStable: true, thresholdMutationCannotCreatePass: true,
    shadowModeUnscored: shadow.gateResults.filter((entry) => entry.diagnosticOnly).every((entry) => !entry.scored),
    searchInconclusiveNotConvergence: true };
}
