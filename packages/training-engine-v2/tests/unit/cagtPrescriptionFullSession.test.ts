import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT,
  PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST,
  buildCandidateEvaluationInputs,
  buildPrescriptionTournamentV2HoldoutManifest,
  compileFullSession,
} from "../cagt/prescriptionTournamentEvaluatorHardening";

describe("CAGT Prescription V2 full-session pipeline", () => {
  it("locks an independent V2 holdout with at least 80 multi-assignment full sessions", () => {
    const fixtures = buildPrescriptionTournamentV2HoldoutManifest();
    const manifest = PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST;
    const multiAssignmentCount = manifest.scenarios
      .filter((scenario) => scenario.assignmentCount >= 2).length;
    const tags = new Set(manifest.scenarios.flatMap((scenario) => scenario.contextTags));

    expect(manifest.lockedBeforeExecution).toBe(true);
    expect(fixtures).toHaveLength(100);
    expect(manifest.scenarios).toHaveLength(100);
    expect(multiAssignmentCount).toBeGreaterThanOrEqual(80);
    expect(fixtures.every((fixture) =>
      fixture.locked &&
      fixture.candidateSource === "production_session_intent_planner_candidate_intelligence_composer" &&
      fixture.skeleton.compositionStatus === "valid" &&
      fixture.handoff.assignments.length > 0)).toBe(true);
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
    expect([...tags]).toEqual(expect.arrayContaining([
      "same_framework_different_prescription_facts",
      "productive_prior_prescription",
      "adverse_response",
      "support_requirement",
      "step_sets",
      "stationary_march_duration",
    ]));
  });

  it("compiles full-session prescriptions from production planner, candidate, composer, and handoff outputs", () => {
    const balanced = buildCandidateEvaluationInputs()
      .find((entry) => entry.manifestIdentity.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
    const fixtures = buildPrescriptionTournamentV2HoldoutManifest()
      .filter((fixture) => fixture.handoff.assignments.length >= 2)
      .slice(0, 24);
    const results = fixtures.map((fixture) => compileFullSession({ bundle: balanced.bundle, fixture }));

    expect(results).toHaveLength(24);
    expect(results.every((result) =>
      result.status === "compiled_full_prescription_session" &&
      result.assignmentCount === result.prescriptionPlanCount &&
      result.sourceEvents.eventCount === result.assignmentCount &&
      result.sourceEvents.duplicateSourceEventCount === 0 &&
      result.revisions.finalRevisionCount === result.assignmentCount &&
      result.validationErrorCodes.length === 0 &&
      result.sessionArgument.status === "COHERENT_PRESCRIBED_SESSION_ARGUMENT")).toBe(true);
  });
});
