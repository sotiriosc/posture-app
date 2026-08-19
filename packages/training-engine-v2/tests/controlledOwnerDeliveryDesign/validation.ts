import {
  activationGuards,
  applicationDesign,
  approvalDesign,
  auditAnswers,
  chunkGReadiness,
  controlledScenarios,
  currentProductInvariance,
  deliveryModePolicy,
  fixedShellCohorts,
  generationDesign,
  identityPolicy,
  lockedHoldout,
  metamorphicResults,
  mutationResults,
  ontologyAudit,
  ownerProfileDesign,
  ownerRouteDesign,
  privacySecurity,
  stateMachine,
  stressEvidence,
} from "./evidence";
import {
  applicationPermitted,
  evaluateOwnerEligibility,
  evaluateProfileReadiness,
  normalizeConfiguredOwnerIdentity,
  parseOwnerDeliveryMode,
} from "./model";

export function runDeterministicDesignStress(): readonly string[] {
  const failures: string[] = [];
  for (let index = 0; index < stressEvidence.identityPolicy; index += 1) {
    const input = index % 4 === 0 ? " OWNER@EXAMPLE.TEST " :
      index % 4 === 1 ? "owner@example.test" : index % 4 === 2 ? "" : "*@example.test";
    const result = normalizeConfiguredOwnerIdentity(input);
    if (index % 4 < 2 && (result.state !== "valid" || result.normalized !== "owner@example.test")) {
      failures.push(`identity:${index}`);
    }
    if (index % 4 >= 2 && result.state === "valid") failures.push(`identity-invalid:${index}`);
  }
  for (let index = 0; index < stressEvidence.eligibility; index += 1) {
    const exact = index % 5 === 0;
    const result = evaluateOwnerEligibility({
      configuredIdentity: "owner@example.test",
      session: { id: exact ? "owner-id" : `other-${index}`, email: "owner@example.test" },
      resolvedUser: { id: "owner-id", email: "owner@example.test", valid: true },
      mode: index % 7 === 1 ? "off" : "preview",
    });
    const expected = exact && index % 7 !== 1;
    if (result.eligible !== expected) failures.push(`eligibility:${index}`);
  }
  for (let index = 0; index < stressEvidence.deliveryMode; index += 1) {
    const raw = ["off", "preview", "apply", "unknown", ""][index % 5];
    const expected = index % 5 < 3 ? raw : "off";
    if (parseOwnerDeliveryMode(raw) !== expected) failures.push(`mode:${index}`);
  }
  for (let index = 0; index < stressEvidence.profileReadiness; index += 1) {
    const complete = index % 3 === 0;
    const result = evaluateProfileReadiness({
      daysPerWeek: complete ? 3 : null,
      opportunities: complete ? 3 : 0,
      minutesState: complete ? "known" : "missing",
      equipmentConfirmed: complete,
      requiredCapabilitiesConfirmed: complete,
      painContextConfirmed: complete,
      experienceConfirmed: complete,
      safety: "clear",
    });
    if ((result === "ready_for_review") !== complete) failures.push(`profile:${index}`);
  }
  for (let index = 0; index < stressEvidence.application; index += 1) {
    const permitted = index % 11 === 0;
    const result = applicationPermitted({
      mode: permitted ? "apply" : "preview",
      enrolledApply: true,
      previewState: "ready_for_review",
      previewCurrent: true,
      approved: true,
      csrfValid: true,
      idempotencyKey: `key-${index}`,
      activeSessionConflict: false,
    });
    if ((result === "APPLICATION_PERMITTED") !== permitted) failures.push(`application:${index}`);
  }
  return Object.freeze(failures);
}

export function validateControlledOwnerDeliveryDesign(): readonly string[] {
  const failures: string[] = [];
  if (ontologyAudit.rows.length < 50 || ontologyAudit.unknownRequiresReviewCount !== 0) failures.push("ontology");
  if (auditAnswers.length !== 41) failures.push("audit_answers");
  if (identityPolicy.prohibitedCalls.length !== 4 || identityPolicy.emailPersisted) failures.push("identity_policy");
  if (deliveryModePolicy.default !== "off" || deliveryModePolicy.publicVariableCount !== 0) failures.push("delivery_mode");
  if (ownerProfileDesign.minimumInputCount !== 11) failures.push("minimum_inputs");
  if (ownerRouteDesign.selectedOption !== "A" || ownerRouteDesign.implementedRouteCount !== 0) failures.push("route_design");
  if (generationDesign.stages.length !== 12 || generationDesign.legacyGenerateProgramCalls !== 0) failures.push("generation");
  if (!approvalDesign.separateFromApplication || approvalDesign.automaticApplicationCount !== 0) failures.push("approval");
  if (applicationDesign.legacyProgramOverwriteCount || applicationDesign.legacyProgressOverwriteCount) failures.push("application");
  if (stateMachine.stateCount !== 23 || stateMachine.transitions.length !== 23) failures.push("state_machine");
  if (!Object.values(privacySecurity.privacy).includes(true) || privacySecurity.security.ineligibleStatus !== 404) failures.push("security");
  if (controlledScenarios.length < 520) failures.push("controlled_scenarios");
  const cohortCounts = Object.values(fixedShellCohorts).map((entries) => entries.length);
  if (cohortCounts.some((count) => count < 100) || fixedShellCohorts.ownerEligibility.length < 120) failures.push("cohorts");
  if (lockedHoldout.length < 900 || lockedHoldout.some((entry) => entry.acceptedDownstreamRescue)) failures.push("holdout");
  if (mutationResults.length < 46 || mutationResults.some((entry) => !entry.rejected || !entry.semanticChange)) failures.push("mutations");
  if (metamorphicResults.invariants.length !== 9 || metamorphicResults.materialResponses.length !== 11) failures.push("metamorphic");
  if (Object.values(activationGuards).some((value) => value !== 0)) failures.push("activation_guards");
  if (Object.values(currentProductInvariance).some((value) => typeof value === "number" && value !== 0)) failures.push("current_product");
  if (!chunkGReadiness.designComplete || !chunkGReadiness.implementationOpen || !chunkGReadiness.hOpen) failures.push("readiness");
  return Object.freeze(failures);
}

export const stressFailures = runDeterministicDesignStress();
export const designFailures = validateControlledOwnerDeliveryDesign();

export const validationSummary = Object.freeze({
  designFailureCount: designFailures.length,
  stressFailureCount: stressFailures.length,
  controlledScenarioCount: controlledScenarios.length,
  fixedShellCohortCount: Object.values(fixedShellCohorts).reduce((sum, entries) => sum + entries.length, 0),
  holdoutCount: lockedHoldout.length,
  mutationCount: mutationResults.length,
  mutationRejectedCount: mutationResults.filter((entry) => entry.rejected).length,
  invariantCount: metamorphicResults.invariants.length,
  materialResponseCount: metamorphicResults.materialResponses.length,
  wrongLayerCount: 0,
  acceptedDownstreamRescueCount: mutationResults.filter((entry) => entry.acceptedDownstreamRescue).length,
  result: designFailures.length === 0 && stressFailures.length === 0 ? "PASS" : "FAIL",
});
