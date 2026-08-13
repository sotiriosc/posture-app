import { WEEKLY_POLICY_CANDIDATES, runUpdatedPolicyConsequenceLab } from "../helpers/policyHorizonDesignLab";
import { ATOMIC_WEEK_POLICY_CANDIDATES } from "./weekPolicyTournamentCandidates";
import { executeTournamentScenario } from "./weekPolicyTournamentRunner";
import { CALIBRATION_POLICY_SCENARIOS } from "./weekPolicyTournamentScenarios";

let executableCalibration: ReturnType<typeof executeTournamentScenario>[] | undefined;

export function runExecutableCagtWeekPolicyCalibration() {
  if (!executableCalibration) {
    executableCalibration = WEEKLY_POLICY_CANDIDATES.map((_, index) => executeTournamentScenario(
      ATOMIC_WEEK_POLICY_CANDIDATES[index],
      CALIBRATION_POLICY_SCENARIOS[index % CALIBRATION_POLICY_SCENARIOS.length],
    ));
  }
  return executableCalibration;
}

export function runCagtWeekPolicyCalibration() {
  const executable = runExecutableCagtWeekPolicyCalibration();
  const candidates = WEEKLY_POLICY_CANDIDATES.map((candidate, index) => ({
    id: candidate.id, productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const,
    requiredObjectiveCoverage: "evaluated_without_numeric_activation", frameworkConvergence: "OBSERVE_ONLY" as const,
    adaptiveResponsibilityConvergence: "contract_required",
    underAdaptation: executable[index].gates.filter((entry) => entry.reasonCode === "LATEST_RIGHTFUL_GATE_UNRESPONSIVE").length,
    overAdaptation: executable[index].gates.filter((entry) => entry.reasonCode === "RESPONSE_OUTSIDE_CAUSAL_AUTHORITY").length,
    objectiveDuplication: "reported", assessmentRecurrence: "reported", optionalBloat: "reported",
    constrainedWeekBehavior: "required_before_preferred_before_optional", unresolvedPolicyState: "NUMERIC_POLICY_NOT_APPROVED",
  }));
  const consequences = runUpdatedPolicyConsequenceLab();
  return { adapterStatus: "DESIGN_EVIDENCE_PASS", candidateCount: candidates.length,
    consequenceCount: consequences.length, numericPolicyActivated: false, candidates, consequences };
}
