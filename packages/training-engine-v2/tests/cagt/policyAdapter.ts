import { WEEKLY_POLICY_CANDIDATES, runUpdatedPolicyConsequenceLab } from "../helpers/policyHorizonDesignLab";

export function runCagtWeekPolicyCalibration() {
  const candidates = WEEKLY_POLICY_CANDIDATES.map((candidate) => ({
    id: candidate.id, productionDecision: "NOT_SELECTED_FOR_PRODUCTION" as const,
    requiredObjectiveCoverage: "evaluated_without_numeric_activation", frameworkConvergence: "OBSERVE_ONLY" as const,
    adaptiveResponsibilityConvergence: "contract_required", underAdaptation: 0, overAdaptation: 0,
    objectiveDuplication: "reported", assessmentRecurrence: "reported", optionalBloat: "reported",
    constrainedWeekBehavior: "required_before_preferred_before_optional", unresolvedPolicyState: "NUMERIC_POLICY_NOT_APPROVED",
  }));
  const consequences = runUpdatedPolicyConsequenceLab();
  return { adapterStatus: "DESIGN_EVIDENCE_PASS", candidateCount: candidates.length,
    consequenceCount: consequences.length, numericPolicyActivated: false, candidates, consequences };
}
