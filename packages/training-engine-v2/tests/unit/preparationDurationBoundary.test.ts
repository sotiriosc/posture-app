import { describe, expect, it } from "vitest";
import {
  PREPARATION_TAXONOMY,
  REFERENCE_EXERCISES,
  applyDurationRecompositionToIntent,
  planDurationAwareRecomposition,
  planSessionIntent,
  sequenceFinalSession,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from
  "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  prepareCatalogProductionFinalSequencingInput,
  prepareProductionFinalSequencingInput,
} from "../helpers/productionFinalSequencingLab";
import {
  plannerDirective,
  plannerInput,
  plannerObjective,
} from "../helpers/sessionIntentPlannerProduction";

const cooldownFixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((fixture) =>
  fixture.scenarioId === "owner-v1-holdout-008-cooldown")!;

function optionalCooldownInput() {
  const base = prepareProductionFinalSequencingInput(cooldownFixture);
  const intent = {
    ...base.intent,
    availableMinutes: 1,
    needs: base.intent.needs.map((need) => need.section === "cooldown" ? {
      ...need,
      priority: "optional" as const,
      standaloneAdmission: "duration_conditional" as const,
      sourceEvidence: [{
        sourceKind: "recovery_requirement" as const,
        sourceId: "explicit-session-downshift",
        evidenceRefs: ["explicit-session-downshift"],
      }],
    } : need),
  };
  const availableSeconds = 60;
  const finalDuration = {
    sequencingContract: base.sequencingContract,
    knownLowerBoundSeconds: 120,
    knownUpperBoundSeconds: 120,
    availableSeconds,
    status: "definitely_over_budget" as const,
    unknownComponents: [],
    prescriptionIntervalRefs: base.prescriptionSession.plans
      .map((plan) => plan.prescriptionRevisionId),
    transitionInstructionIds: [],
    timingFactReuseCount: 0,
    noInventedTime: true as const,
    provenance: [{ source: "synthetic_contract_fixture" as const, sourceRef: "duration-recomposition" }],
  };
  return { ...base, intent, availableMinutes: availableSeconds / 60, finalDuration };
}

describe("cooldown ownership and duration-aware recomposition boundary", () => {
  it("keeps cooldown optional, explicit, and empty when no owner allocates it", () => {
    const withoutCooldown = planSessionIntent(plannerInput());
    expect(withoutCooldown.sessionIntent?.needs.some((need) => need.section === "cooldown"))
      .toBe(false);

    const withCooldown = planSessionIntent(plannerInput({
      directive: plannerDirective({
        id: "explicit-cooldown",
        objectives: [
          plannerObjective({ id: "main", kind: "dominant_main" }),
          plannerObjective({
            id: "downshift",
            kind: "recovery",
            priority: "optional",
            priorityOrder: 0,
            selectionTarget: {
              targetMovementRoles: ["breathing_position"],
              targetActionFunctions: [],
              targetMuscles: [],
              muscleRequirement: "any_meaningful_contributor",
              targetBodyRegions: ["ribcage"],
            },
            sourceEvidence: [{
              sourceKind: "typed_dependency",
              sourceId: "explicit-downshift-policy",
              evidenceRefs: ["cooldown-van-hooren-2018"],
            }],
          }),
        ],
      }),
    }));
    expect(withCooldown.sessionIntent?.needs.find((need) => need.section === "cooldown"))
      .toMatchObject({
        priority: "optional",
        selection: { requestedRole: "recovery" },
      });
  });

  it("gives neither preparation nor cooldown developmental credit", () => {
    expect(PREPARATION_TAXONOMY.every((entry) => entry.developmentalCredit === false)).toBe(true);
    const input = prepareProductionFinalSequencingInput(cooldownFixture);
    const cooldownAssignment = input.skeleton.assignments.find((assignment) =>
      assignment.section === "cooldown")!;
    const cooldownPlan = input.prescriptionSession.plans.find((plan) =>
      plan.sourceExposureEvent.sessionAssignmentId ===
        cooldownAssignment.routinePrescriptionHandoffId)!;
    expect(cooldownPlan.doseBlocks).not.toHaveLength(0);
    expect(cooldownPlan.doseBlocks.every((block) =>
      block.contributionClassification === "recovery_observation_only")).toBe(true);
    expect(cooldownPlan.doseBlocks.every((block) =>
      block.purpose === "recovery_or_downregulation")).toBe(true);
  });

  it("accounts every selected section and removes session-local cooldown before main work", () => {
    const input = optionalCooldownInput();
    const decision = planDurationAwareRecomposition({
      intent: input.intent,
      skeleton: input.skeleton,
      prescription: input.prescriptionSession,
      finalDuration: input.finalDuration,
    });
    expect(decision).toMatchObject({
      status: "session_local_recomposition_required",
      availableSeconds: 60,
      calculatedLowerBoundSeconds: 120,
      calculatedUpperBoundSeconds: 120,
      calculatedDurationDistinctFromAvailable: true,
      nextRemoval: {
        section: "cooldown",
        priority: "optional",
        reasonCode: "REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST",
      },
      noInventedTime: true,
    });
    expect(decision.accountedAssignmentIdsBySection.main).toHaveLength(1);
    expect(decision.accountedAssignmentIdsBySection.cooldown).toHaveLength(1);
    expect(decision.accountedAssignmentIds).toHaveLength(input.skeleton.assignments.length);
    const recomposed = applyDurationRecompositionToIntent({ intent: input.intent, decision });
    expect(recomposed.needs.some((need) => need.section === "cooldown")).toBe(false);
    expect(recomposed.needs.some((need) =>
      need.section === "main" && need.priority === "required")).toBe(true);
  });

  it("makes Final Sequencing request recomposition instead of emitting an over-budget executable plan", () => {
    const input = optionalCooldownInput();
    const result = sequenceFinalSession({
      ...input,
      prescriptionSession: {
        ...input.prescriptionSession,
        sessionDurationInterval: {
          ...input.prescriptionSession.sessionDurationInterval,
          knownLowerBoundSeconds: 120,
          knownUpperBoundSeconds: 120,
          unknownComponents: [],
          status: "definitely_over_budget",
        },
      },
    });
    expect(result.status).toBe("duration_recomposition_required");
    expect(result.plan).toBeNull();
    expect(result.decisionTrace.finalReasonCodes)
      .toContain("REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST");
  });

  it("removes optional activation before required main work when the known duration bound is exceeded", () => {
    const input = optionalCooldownInput();
    const cooldownNeedId = input.intent.needs.find((need) => need.section === "cooldown")!.id;
    const intent = {
      ...input.intent,
      needs: input.intent.needs.map((need) => need.id === cooldownNeedId ? {
        ...need,
        section: "activation" as const,
        selection: { ...need.selection, requestedRole: "activation" as const },
      } : need),
    };
    const skeleton = {
      ...input.skeleton,
      assignments: input.skeleton.assignments.map((assignment) =>
        assignment.satisfiedNeedIds.includes(cooldownNeedId) ? {
          ...assignment,
          section: "activation" as const,
          role: "activation" as const,
        } : assignment),
    };
    const decision = planDurationAwareRecomposition({
      intent,
      skeleton,
      prescription: input.prescriptionSession,
      finalDuration: input.finalDuration,
    });
    expect(decision.nextRemoval).toMatchObject({ section: "activation", priority: "optional" });
    const recomposed = applyDurationRecompositionToIntent({ intent, decision });
    expect(recomposed.needs.some((need) => need.section === "activation")).toBe(false);
    expect(recomposed.needs).toContainEqual(expect.objectContaining({
      section: "main",
      priority: "required",
    }));
  });

  it("fails closed when required main work alone cannot fit", () => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "machine-row")!;
    const input = prepareCatalogProductionFinalSequencingInput(exercise);
    const result = sequenceFinalSession({
      ...input,
      availableMinutes: 0.1,
      intent: { ...input.intent, availableMinutes: 0.1 },
      prescriptionSession: {
        ...input.prescriptionSession,
        sessionDurationInterval: {
          ...input.prescriptionSession.sessionDurationInterval,
          knownLowerBoundSeconds: 120,
          knownUpperBoundSeconds: 120,
          unknownComponents: [],
          status: "definitely_over_budget",
        },
      },
    });
    expect(result.status).toBe("required_work_duration_infeasible");
    expect(result.plan).toBeNull();
    expect(result.decisionTrace.finalReasonCodes)
      .toContain("REQUIRED_OR_UPSTREAM_WORK_LOWER_BOUND_EXCEEDS_AVAILABLE_DURATION");
  });

  it("preserves duration uncertainty instead of guessing or deleting work", () => {
    const input = prepareProductionFinalSequencingInput(cooldownFixture);
    const decision = planDurationAwareRecomposition({
      intent: input.intent,
      skeleton: input.skeleton,
      prescription: input.prescriptionSession,
    });
    expect(decision.status).toBe("duration_indeterminate");
    expect(decision.nextRemoval).toBeNull();
    expect(decision.calculatedUpperBoundSeconds).toBeNull();
    expect(decision.unresolvedDurationComponents.length).toBeGreaterThan(0);
    expect(decision.noInventedTime).toBe(true);
  });
});
