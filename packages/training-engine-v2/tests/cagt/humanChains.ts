export function runCagtHumanLikeChains() {
  return [
    { id: "ordinary-successful-week", stages: ["confirmed_horizon", "weekly_responsibilities", "reservations", "materialized_day",
      "session_intent", "candidates", "session_skeleton", "response_foundation"], result: "FOUNDATION_EVIDENCE_PASS" },
    { id: "equipment-changed-today", stages: ["expected_gym", "actual_home", "truthful_materialization_or_reallocation"],
      unrelatedGoalChanged: false, result: "DESIGN_EVIDENCE_PASS" },
    { id: "pain-during-realization", stages: ["immutable_original_plan", "response_recorded", "rightful_next_review"],
      permanentBanInvented: false, result: "FOUNDATION_EVIDENCE_PASS" },
    { id: "missed-session", stages: ["immutable_completed_history", "explicit_reallocation"], automaticDoubling: false,
      result: "DESIGN_EVIDENCE_PASS" },
    { id: "same-framework-different-users", stages: ["shared_four_day_framework", "different_responsibilities", "productive_anchor_stability"],
      fakeUniqueness: false, result: "DESIGN_EVIDENCE_PASS" },
    { id: "irrelevant-difference", stages: ["label_or_prose_change", "semantic_equivalence"], result: "PASS_WITH_EXPECTED_CONVERGENCE" },
  ] as const;
}
