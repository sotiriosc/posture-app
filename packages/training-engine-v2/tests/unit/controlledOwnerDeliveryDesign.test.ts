import { describe, expect, it } from "vitest";
import {
  DELIVERY_MODES,
  OWNER_DELIVERY_STATES,
  ownerDeliveryContracts,
} from "../controlledOwnerDeliveryDesign/contracts";
import {
  activationGuards,
  applicationDesign,
  approvalDesign,
  auditAnswers,
  chunkGReadiness,
  controlledScenarios,
  currentProductInvariance,
  deliveryModePolicy,
  enrollmentDesign,
  fixedShellCohorts,
  generationDesign,
  getStrongerMapping,
  identityPolicy,
  implementationHandoff,
  killSwitchDesign,
  lockedHoldout,
  metamorphicResults,
  mutationResults,
  ontologyAudit,
  ownerProfileDesign,
  ownerRouteDesign,
  practiceOptionDelivery,
  privacySecurity,
  productProjection,
  productShadowBoundary,
  rollbackDesign,
  stateMachine,
  stressEvidence,
  twoKeyAuthorization,
} from "../controlledOwnerDeliveryDesign/evidence";
import {
  applicationPermitted,
  evaluateOwnerEligibility,
  evaluateProfileReadiness,
  normalizeConfiguredOwnerIdentity,
  parseOwnerDeliveryMode,
} from "../controlledOwnerDeliveryDesign/model";
import {
  designFailures,
  stressFailures,
  validationSummary,
} from "../controlledOwnerDeliveryDesign/validation";

describe("controlled owner-account Get stronger delivery design", () => {
  it("audits auth and ontology without granting delivery authority", () => {
    expect(ontologyAudit.classification).toBe("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ONTOLOGY_READY");
    expect(ontologyAudit.rows.length).toBeGreaterThanOrEqual(50);
    expect(auditAnswers).toHaveLength(41);
    expect(identityPolicy.passiveResolution).toEqual(["readServerSession", "findUserByEmail"]);
    expect(identityPolicy.prohibitedCalls).toContain("ensureBootstrapUser");
    expect(identityPolicy.emailPersisted).toBe(false);
  });

  it("normalizes one exact configured identity and fails closed otherwise", () => {
    expect(normalizeConfiguredOwnerIdentity(" OWNER@EXAMPLE.TEST ")).toEqual({
      state: "valid", normalized: "owner@example.test",
    });
    expect(normalizeConfiguredOwnerIdentity("owner@example.test,other@example.test").state).not.toBe("valid");
    expect(normalizeConfiguredOwnerIdentity("*@example.test").state).not.toBe("valid");
    expect(evaluateOwnerEligibility({
      configuredIdentity: "owner@example.test",
      session: { id: "owner-id", email: "owner@example.test" },
      resolvedUser: { id: "owner-id", email: "owner@example.test", valid: true },
      mode: "preview",
    })).toEqual({ eligible: true, mode: "preview", reason: "EXACT_CONFIGURED_OWNER_MATCH" });
  });

  it("uses a separate default-off delivery mode and exact two-key authorization", () => {
    expect(DELIVERY_MODES).toEqual(["off", "preview", "apply"]);
    expect(parseOwnerDeliveryMode(undefined)).toBe("off");
    expect(parseOwnerDeliveryMode("unknown")).toBe("off");
    expect(deliveryModePolicy.variable).toBe("PRAXIS_V2_OWNER_DELIVERY_MODE");
    expect(twoKeyAuthorization.identityOnlyActivationCount).toBe(0);
  });

  it("defines explicit enrollment and the separate owner strength profile", () => {
    expect(enrollmentDesign.contract).toEqual(ownerDeliveryContracts.enrollment);
    expect(enrollmentDesign.automaticEnrollmentCount).toBe(0);
    expect(ownerProfileDesign.primaryGoal).toBe("strength");
    expect(ownerProfileDesign.trainingMode).toBe("develop");
    expect(ownerProfileDesign.secondaryGoal).toBeNull();
    expect(ownerProfileDesign.minimumInputCount).toBe(11);
    expect(getStrongerMapping.productOptionId).toBe("get_stronger");
  });

  it("selects dedicated Option A routes without implementing them", () => {
    expect(ownerRouteDesign.selectedOption).toBe("A");
    expect(ownerRouteDesign.root).toBe("/account/praxis-v2");
    expect(ownerRouteDesign.ineligibleResponse).toBe("404_NOT_FOUND");
    expect(ownerRouteDesign.implementedRouteCount).toBe(0);
    expect(currentProductInvariance.ownerRouteImplementations).toBe(0);
  });

  it("designs production generation, preview, approval and application without legacy mutation", () => {
    expect(generationDesign.stages).toHaveLength(12);
    expect(generationDesign.productShadowOutputUsed).toBe(false);
    expect(generationDesign.legacyGenerateProgramCalls).toBe(0);
    expect(approvalDesign.separateFromApplication).toBe(true);
    expect(applicationDesign.legacyProgramOverwriteCount).toBe(0);
    expect(applicationDesign.legacyProgressOverwriteCount).toBe(0);
    expect(applicationPermitted({ mode: "apply", enrolledApply: true, previewState: "ready_for_review",
      previewCurrent: true, approved: true, csrfValid: true, idempotencyKey: "test-key",
      activeSessionConflict: false })).toBe("APPLICATION_PERMITTED");
  });

  it("preserves lineage, practice truth, rollback, kill-switch safety and Shadow separation", () => {
    expect(productProjection.lineageLossCount).toBe(0);
    expect(practiceOptionDelivery.ordinaryProductRemainsV1).toBe(true);
    expect(rollbackDesign.dataDeletionCount).toBe(0);
    expect(killSwitchDesign.strandsActiveAttemptCount).toBe(0);
    expect(productShadowBoundary.appliedArtifactCount).toBe(0);
    expect(privacySecurity.security.ineligibleStatus).toBe(404);
  });

  it("covers every state and deterministic evidence floor", () => {
    expect(stateMachine.states).toEqual(OWNER_DELIVERY_STATES);
    expect(stateMachine.stateCount).toBe(23);
    expect(controlledScenarios.length).toBeGreaterThanOrEqual(520);
    expect(fixedShellCohorts.ownerEligibility.length).toBeGreaterThanOrEqual(120);
    expect(Object.values(fixedShellCohorts).every((rows) => rows.length >= 100)).toBe(true);
    expect(lockedHoldout.length).toBeGreaterThanOrEqual(900);
    expect(stressEvidence.result).toBe("PASS");
  });

  it("rejects all semantic mutations and passes all metamorphic relations", () => {
    expect(mutationResults).toHaveLength(50);
    expect(mutationResults.every((mutation) => mutation.rejected && mutation.semanticChange)).toBe(true);
    expect(mutationResults.some((mutation) => mutation.acceptedDownstreamRescue)).toBe(false);
    expect(metamorphicResults.invariants).toHaveLength(9);
    expect(metamorphicResults.materialResponses).toHaveLength(11);
  });

  it("passes profile readiness, stress, guards and final design classification", () => {
    expect(evaluateProfileReadiness({ daysPerWeek: 3, opportunities: 3, minutesState: "known",
      equipmentConfirmed: true, requiredCapabilitiesConfirmed: true, painContextConfirmed: true,
      experienceConfirmed: true, safety: "clear" })).toBe("ready_for_review");
    expect(designFailures).toEqual([]);
    expect(stressFailures).toEqual([]);
    expect(validationSummary.result).toBe("PASS");
    expect(Object.values(activationGuards).every((value) => value === 0)).toBe(true);
    expect(chunkGReadiness.classification).toBe(
      "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_READY_FOR_DELIVERY_IMPLEMENTATION_AUTHORIZATION"
    );
    expect(chunkGReadiness.implementationOpen).toBe(true);
    expect(chunkGReadiness.hOpen).toBe(true);
    expect(implementationHandoff.implementationExecuted).toBe(false);
  });
});
