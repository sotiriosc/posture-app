import { describe, expect, it } from "vitest";
import {
  EXERCISE_DOSE_MODES,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  REFERENCE_EXERCISES,
  compilePrescriptionAssignmentV1_1,
  compileSessionPrescriptionV1_1,
  validatePrescriptionCompilerResultV1_1,
} from "../../src";
import { buildPurposeFirstCatalogFixture } from
  "../cagt/purposeFirstPrescriptionResolverFixtures";
import { runPurposeFirstGoldenPairs } from
  "../cagt/purposeFirstPrescriptionResolverEvidence";

describe("Production Prescription Compiler V1.1 purpose-first lane", () => {
  it("compiles all 45 catalog identities and all seven legal dose modes without fallback", () => {
    const results = REFERENCE_EXERCISES.map((exercise) =>
      compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise)));
    const carry = REFERENCE_EXERCISES.find((exercise) => exercise.id === "farmer-carry")!;
    const timedCarry = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(carry, {
      requestedMode: "timed_carry",
    }));
    expect(results).toHaveLength(45);
    expect(results.every((result) => result.status === "compiled" && result.plan &&
      !result.fallbackApplied && validatePrescriptionCompilerResultV1_1(result).length === 0)).toBe(true);
    expect(timedCarry.status).toBe("compiled");
    expect(new Set([...results.map((result) => result.plan!.doseBlocks[0]!.dose.mode),
      timedCarry.plan!.doseBlocks[0]!.dose.mode])).toEqual(new Set(EXERCISE_DOSE_MODES));
  });

  it("fails closed for missing, unsupported, conflicting, role-only, and stale purpose evidence", () => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
    const missing = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise, {
      requirements: [], outcomeGoal: "general_fitness",
    }));
    const unsupported = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise, {
      requirements: [{ purpose: "movement_quality_development" }],
    }));
    const conflict = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise, {
      requirements: [
        { purpose: "strength_development", authority: "primary_local_purpose", requirementId: "a" },
        { purpose: "hypertrophy_development", authority: "primary_local_purpose", requirementId: "b" },
      ],
    }));
    const noPolicy = compilePrescriptionAssignmentV1_1({
      ...buildPurposeFirstCatalogFixture(exercise), purposeResolverPolicy: null,
    });
    const staleInput = buildPurposeFirstCatalogFixture(exercise);
    const stale = compilePrescriptionAssignmentV1_1({ ...staleInput,
      sessionSkeleton: { ...staleInput.sessionSkeleton,
        assignments: staleInput.sessionSkeleton.assignments.map((entry) => ({ ...entry,
          role: "secondary_strength" as const })) } });
    expect([missing.status, unsupported.status, conflict.status, noPolicy.status, stale.status]).toEqual([
      "prescription_purpose_required", "prescription_purpose_policy_required",
      "prescription_purpose_conflict", "prescription_purpose_policy_required",
      "prescription_purpose_lineage_invalid",
    ]);
    expect([missing, unsupported, conflict, noPolicy, stale].every((result) =>
      result.plan === null && result.fallbackApplied === false)).toBe(true);
  });

  it("uses explicit local purpose before a general-fitness global goal", () => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
    const strength = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise, {
      outcomeGoal: "general_fitness", requirements: [{ purpose: "strength_development" }],
    }));
    const hypertrophy = compilePrescriptionAssignmentV1_1(buildPurposeFirstCatalogFixture(exercise, {
      outcomeGoal: "general_fitness", requirements: [{ purpose: "hypertrophy_development" }],
    }));
    expect(strength).toMatchObject({ status: "compiled", selectedUseCase: "main_strength",
      selectedPurpose: "strength_development", fallbackApplied: false });
    expect(hypertrophy).toMatchObject({ status: "compiled", selectedUseCase: "main_hypertrophy",
      selectedPurpose: "hypertrophy_development", fallbackApplied: false });
  });

  it("preserves 100 supported V1.0/V1.1 semantic golden pairs", () => {
    const pairs = runPurposeFirstGoldenPairs();
    expect(pairs).toHaveLength(100);
    expect(pairs.every((pair) => pair.semanticsEqual && pair.sourceEventCount === 2)).toBe(true);
  });

  it("compiles a session only through explicit V1.1 selection and unique assignment coverage", () => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
    const fixture = buildPurposeFirstCatalogFixture(exercise);
    const handoffId = fixture.assignmentHandoffId;
    const result = compileSessionPrescriptionV1_1({
      ...fixture,
      contextByHandoffId: { [handoffId]: fixture.context },
      continuityEvidenceByHandoffId: { [handoffId]: fixture.continuityEvidence },
      priorRealizationEvidenceByHandoffId: { [handoffId]: fixture.priorRealizationEvidence },
      revisionContextByHandoffId: { [handoffId]: fixture.revisionContext },
      purposeResolutionAttemptIdByHandoffId: { [handoffId]: fixture.purposeResolutionAttemptId },
    });
    expect(result).toMatchObject({ status: "compiled", sourceEventsUnique: true,
      assignmentCoverageComplete: true, fallbackApplied: false,
      authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME" });
    expect(result.plans).toHaveLength(1);
    expect(result.assignmentResults).toHaveLength(1);
    expect(fixture.purposeResolverPolicy).toBe(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1);
  });
});
