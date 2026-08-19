import { describe, expect, it } from "vitest";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  buildFinalSessionSequencingAdmissionReport,
  prepareSequencingCase,
  sequenceSessionDesignOnly,
} from "../helpers/sessionSequencingDesignLab";

describe("Final Session Sequencing V1 complete-session matrices", () => {
  const report = buildFinalSessionSequencingAdmissionReport();

  it("passes warm-up and activation coherence", () => {
    expect(report.warmupActivation.matrixCaseCount).toBe(16);
    expect(report.warmupActivation.coherenceFailureCount).toBe(0);
    expect(report.warmupActivation.supportingAssignmentDuplicationCount).toBe(0);
    expect(report.warmupActivation.supportingMovedAfterMainCount).toBe(0);
    expect(report.warmupActivation.developmentalCreditRewriteCount).toBe(0);
  });

  it("orders production-origin preparation and activation before their main dependent without duplication", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) => entry.archetype === "preparation_activation")!;
    const prepared = prepareSequencingCase(fixture);
    const plan = sequenceSessionDesignOnly(prepared.input);
    expect(plan.status).toBe("incomplete_due_to_unresolved_prescription");
    expect(plan.steps.map((step) => step.section)).toEqual(["warmup", "activation", "main"]);
    expect(new Set(plan.steps.map((step) => step.assignmentId)).size).toBe(plan.steps.length);
    const positions = new Map(plan.steps.map((step) => [step.exerciseId, step.sequenceIndex]));
    for (const step of plan.steps) {
      for (const dependency of step.dependencyExerciseIds) {
        expect(positions.get(dependency)).toBeLessThan(step.sequenceIndex);
      }
    }
    expect(plan.unresolvedRequirementRefs).toContain("PRESCRIPTION_SESSION_INCOMPLETE");
  });

  it("passes main and accessory causal priority", () => {
    expect(report.mainAccessory.matrixCaseCount).toBe(16);
    expect(report.mainAccessory.dominantPurposeLossCount).toBe(0);
    expect(report.mainAccessory.requiredAccessoryDisplacementCount).toBe(0);
    expect(report.mainAccessory.setupFirstDisplacementRejectedCount).toBeGreaterThan(0);
  });

  it("keeps transitions and final duration explicit or unknown", () => {
    expect(report.transitions.matrixCaseCount).toBe(21);
    expect(report.transitions.inventedSetupTimeCount).toBe(0);
    expect(report.transitions.inventedRecoveryTimeCount).toBe(0);
    expect(report.transitions.reusedTimingFactCount).toBe(0);
    expect(report.duration.matrixCaseCount).toBe(21);
    expect(report.duration.unknownCalledFitCount).toBe(0);
    expect(report.duration.result).toBe("PASS_INTERVAL_TRUTH_PRESERVED");
  });

  it("computes exact, bounded, unknown, and definitely-over intervals without defaults", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
      entry.expectedResolution === "compile" && entry.skeleton.assignments.length === 1)!;
    const prepared = prepareSequencingCase(fixture);
    const withInterval = (lower: number, upper: number | null, availableMinutes = 50) => {
      const original = prepared.input.prescriptionSession.plans[0];
      const plan = {
        ...original,
        durationInterval: {
          ...original.durationInterval,
          knownLowerBoundSeconds: lower,
          knownUpperBoundSeconds: upper,
          unknownComponents: upper === null ? ["repetition_tempo" as const] : [],
        },
      };
      return sequenceSessionDesignOnly({
        ...prepared.input,
        availableMinutes,
        prescriptionSession: {
          ...prepared.input.prescriptionSession,
          plans: [plan],
          assignmentResults: prepared.input.prescriptionSession.assignmentResults.map((result) =>
            result.plan?.exerciseId === plan.exerciseId ? { ...result, plan } : result),
        },
      }).duration;
    };
    expect(withInterval(60, 60).status).toBe("fully_determinable");
    expect(withInterval(60, 120).status).toBe("bounded");
    expect(withInterval(60, null).status).toBe("unknown_due_to_prescription");
    expect(withInterval(60, null, 0.5).status).toBe("definitely_over_budget");
  });

  it("passes metamorphic invariance and material-response coverage", () => {
    expect(report.metamorphic.invariantCaseCount).toBe(14);
    expect(report.metamorphic.materialResponseCaseCount).toBe(11);
    expect(report.metamorphic.invariantFailureCount).toBe(0);
    expect(report.metamorphic.missedMaterialResponseCount).toBe(0);
    expect(report.metamorphic.candidateRankMutationResult).toBe("PASS_ORDER_INVARIANT");
  });
});
