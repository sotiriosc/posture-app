import { describe, expect, it } from "vitest";
import {
  OWNER_WEEK_POLICY_DECISIONS,
  WEEKLY_EVIDENCE_INVENTORY,
  WEEKLY_POLICY_CANDIDATES,
  frequencyPolicyRule,
  resolveWeeklyPolicyRules,
  runUpdatedPolicyConsequenceLab,
} from "../helpers/policyHorizonDesignLab";

describe("Weekly policy evidence and owner semantics", () => {
  it("records every binding owner decision with stable authority", () => {
    expect(OWNER_WEEK_POLICY_DECISIONS).toMatchObject({
      sourceType: "owner_decision",
      reviewerId: "sotiriosc",
      reviewedAt: "2026-08-12T00:00:00-04:00",
      allocationOpportunity: "responsibility_only_no_dose_credit",
      standaloneRecoverySession: "KEEP_DEFERRED",
    });
  });

  it("keeps evidence inventory explicit about population, dose, and limitations", () => {
    expect(WEEKLY_EVIDENCE_INVENTORY.length).toBeGreaterThanOrEqual(9);
    expect(WEEKLY_EVIDENCE_INVENTORY.every((entry) => entry.publicationDate && entry.population && entry.goal &&
      entry.outcome && entry.doseDefinition && entry.effectCertainty && entry.praxisApplicability &&
      entry.doesNotEstablish.length > 0 && entry.url.startsWith("https://"))).toBe(true);
  });

  it("does not promote broad participation or set-volume evidence into objective frequency", () => {
    expect(WEEKLY_EVIDENCE_INVENTORY.find((entry) => entry.id === "who-2020-participation")?.classification)
      .toBe("SUPPORTED_ONLY_AS_BROAD_PRIOR");
    expect(WEEKLY_EVIDENCE_INVENTORY.find((entry) => entry.id === "schoenfeld-2017-volume")?.classification)
      .toBe("PRESCRIPTION_DEPENDENT");
    expect(WEEKLY_EVIDENCE_INVENTORY.find((entry) => entry.id === "pelland-2026-dose-response")?.doesNotEstablish)
      .toContain("Praxis fractional set coefficients");
  });

  it("keeps all owner-ready policy candidates non-production", () => {
    expect(WEEKLY_POLICY_CANDIDATES).toHaveLength(9);
    expect(WEEKLY_POLICY_CANDIDATES.every((entry) => entry.productionState === "NOT_SELECTED_FOR_PRODUCTION")).toBe(true);
    expect(WEEKLY_POLICY_CANDIDATES.some((entry) => entry.affects === "dose")).toBe(false);
  });

  it("returns required and conflict states rather than hidden defaults or blends", () => {
    expect(resolveWeeklyPolicyRules([], "objective_frequency_intent").status).toBe("WEEKLY_POLICY_REQUIRED");
    const left = frequencyPolicyRule({ id: "left", candidateRef: "candidate:left" });
    const right = frequencyPolicyRule({ id: "right", candidateRef: "candidate:right" });
    expect(resolveWeeklyPolicyRules([left, right], "objective_frequency_intent").status).toBe("WEEKLY_POLICY_CONFLICT");
    const winner = frequencyPolicyRule({ id: "winner", candidateRef: "candidate:right", overridesRuleIds: ["left"] });
    expect(resolveWeeklyPolicyRules([left, winner], "objective_frequency_intent"))
      .toMatchObject({ status: "policy_rule_resolved", rule: { id: "winner" } });
  });

  it("extends the consequence lab while selecting no values", () => {
    const rows = runUpdatedPolicyConsequenceLab();
    expect(rows).toHaveLength(13);
    expect(rows.every((entry) => entry.productionDecision === "NOT_SELECTED_FOR_PRODUCTION")).toBe(true);
    expect(rows.map((entry) => entry.id)).toEqual(expect.arrayContaining([
      "participation-vs-objective-frequency", "week-goal-vs-session-goal", "capacity-main-support",
      "order-vs-elapsed-spacing", "profile-vs-confirmed-horizon", "volume-vs-frequency",
    ]));
  });
});
