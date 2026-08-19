import { describe, expect, it } from "vitest";
import {
  PREPARATION_TAXONOMY,
  REFERENCE_EXERCISES,
  applyDurationRecompositionToIntent,
  executeBoundedDurationRecompositionLoop,
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
      status: "duration_over_capacity_recomposable",
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

  it("preserves dependency-required activation", () => {
    const input = optionalCooldownInput();
    const supportingNeed = input.intent.needs.find((need) => need.section === "cooldown")!;
    const mainNeed = input.intent.needs.find((need) => need.section === "main")!;
    const requiredDependency = {
      dependencyId: "required-activation",
      targetNeedIds: [mainNeed.id],
      targetExerciseIds: [],
      movementRoles: [],
      actionFunctions: [],
      bodyRegions: [],
      assessmentSignalIds: [],
      painResponseRequirementIds: [],
      required: true,
    };
    const intent = { ...input.intent, needs: input.intent.needs.map((need) =>
      need.id === supportingNeed.id ? { ...need, section: "activation" as const,
        selection: { ...need.selection, requestedRole: "activation" as const },
        dependencies: [requiredDependency] } : need) };
    const skeleton = { ...input.skeleton, assignments: input.skeleton.assignments.map((assignment) =>
      assignment.satisfiedNeedIds.includes(supportingNeed.id) ? { ...assignment,
        section: "activation" as const, role: "activation" as const } : assignment) };
    const decision = planDurationAwareRecomposition({ intent, skeleton,
      prescription: input.prescriptionSession, finalDuration: input.finalDuration });

    expect(decision.status).toBe("duration_over_capacity_required_work");
    expect(decision.nextRemoval).toBeNull();
    expect(decision.protectedAssignmentIds).toHaveLength(skeleton.assignments.length);
  });

  it("removes optional accessory work and does not repeat an already-applied state", () => {
    const input = optionalCooldownInput();
    const optionalNeed = input.intent.needs.find((need) => need.section === "cooldown")!;
    const intent = { ...input.intent, needs: input.intent.needs.map((need) =>
      need.id === optionalNeed.id ? { ...need, section: "accessory" as const,
        selection: { ...need.selection, requestedRole: "hypertrophy_accessory" as const } } : need) };
    const skeleton = { ...input.skeleton, assignments: input.skeleton.assignments.map((assignment) =>
      assignment.satisfiedNeedIds.includes(optionalNeed.id) ? { ...assignment,
        section: "accessory" as const, role: "hypertrophy_accessory" as const } : assignment) };
    const first = planDurationAwareRecomposition({ intent, skeleton,
      prescription: input.prescriptionSession, finalDuration: input.finalDuration });
    const replay = planDurationAwareRecomposition({ intent, skeleton,
      prescription: input.prescriptionSession, finalDuration: input.finalDuration });
    expect(first).toEqual(replay);
    expect(first.nextRemoval).toMatchObject({ section: "accessory", priority: "optional" });
    const once = applyDurationRecompositionToIntent({ intent, decision: first });
    const twice = applyDurationRecompositionToIntent({ intent: once, decision: first });
    expect(twice).toEqual(once);
    expect(once.plannerSourceTrace.sourceRefs).toContain(
      `duration-recomposition:${first.nextRemoval!.assignmentId}`,
    );
  });

  it("removes preferred work only after all removable optional work", () => {
    const input = optionalCooldownInput();
    const optionalNeed = input.intent.needs.find((need) => need.section === "cooldown")!;
    const optionalAssignment = input.skeleton.assignments.find((assignment) =>
      assignment.satisfiedNeedIds.includes(optionalNeed.id))!;
    const optionalPlan = input.prescriptionSession.plans.find((plan) =>
      plan.sourceExposureEvent.sessionAssignmentId === optionalAssignment.routinePrescriptionHandoffId)!;
    const preferredNeed = { ...optionalNeed, id: `${optionalNeed.id}:preferred`,
      section: "accessory" as const, priority: "preferred" as const,
      priorityOrder: optionalNeed.priorityOrder + 1,
      selection: { ...optionalNeed.selection, requestedRole: "hypertrophy_accessory" as const } };
    const preferredAssignmentId = `${optionalAssignment.routinePrescriptionHandoffId}:preferred`;
    const preferredAssignment = { ...optionalAssignment,
      routinePrescriptionHandoffId: preferredAssignmentId,
      section: "accessory" as const, role: "hypertrophy_accessory" as const,
      satisfiedNeedIds: [preferredNeed.id] };
    const preferredPlan = { ...optionalPlan,
      sourceExposureEvent: { ...optionalPlan.sourceExposureEvent,
        sessionAssignmentId: preferredAssignmentId } };
    const intent = { ...input.intent, needs: [...input.intent.needs, preferredNeed] };
    const skeleton = { ...input.skeleton,
      assignments: [...input.skeleton.assignments, preferredAssignment] };
    const prescription = { ...input.prescriptionSession,
      plans: [...input.prescriptionSession.plans, preferredPlan] };
    const first = planDurationAwareRecomposition({ intent, skeleton, prescription,
      finalDuration: input.finalDuration });
    expect(first.nextRemoval).toMatchObject({ assignmentId: optionalAssignment.routinePrescriptionHandoffId,
      priority: "optional" });

    const afterOptional = applyDurationRecompositionToIntent({ intent, decision: first });
    const skeletonAfterOptional = { ...skeleton, assignments: skeleton.assignments.filter((assignment) =>
      assignment.routinePrescriptionHandoffId !== optionalAssignment.routinePrescriptionHandoffId) };
    const prescriptionAfterOptional = { ...prescription, plans: prescription.plans.filter((plan) =>
      plan.sourceExposureEvent.sessionAssignmentId !== optionalAssignment.routinePrescriptionHandoffId) };
    const second = planDurationAwareRecomposition({ intent: afterOptional,
      skeleton: skeletonAfterOptional, prescription: prescriptionAfterOptional,
      finalDuration: input.finalDuration });
    expect(second.nextRemoval).toMatchObject({ assignmentId: preferredAssignmentId,
      priority: "preferred" });
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
    expect(decision.status).toBe("duration_unknown");
    expect(decision.nextRemoval).toBeNull();
    expect(decision.calculatedUpperBoundSeconds).toBeNull();
    expect(decision.unresolvedDurationComponents.length).toBeGreaterThan(0);
    expect(decision.noInventedTime).toBe(true);
  });

  it("does not treat a finite work interval as over-budget when capacity is unknown", () => {
    const input = optionalCooldownInput();
    const decision = planDurationAwareRecomposition({
      intent: input.intent,
      skeleton: input.skeleton,
      prescription: input.prescriptionSession,
      finalDuration: {
        ...input.finalDuration,
        availableCapacityStatus: "unknown",
        status: "unknown_due_to_available_capacity",
        unknownComponents: ["available_session_capacity:AVAILABLE_SESSION_CAPACITY_NOT_CONFIRMED"],
      },
    });

    expect(decision).toMatchObject({
      status: "duration_unknown",
      nextRemoval: null,
      calculatedLowerBoundSeconds: 120,
      calculatedUpperBoundSeconds: 120,
    });
    expect(decision.unresolvedDurationComponents)
      .toContain("available_session_capacity:AVAILABLE_SESSION_CAPACITY_NOT_CONFIRMED");
  });

  it("rebuilds deterministically through intent and stops on the first fitting final result", () => {
    const input = optionalCooldownInput();
    const run = () => executeBoundedDurationRecompositionLoop({
      initialIntent: input.intent,
      fingerprintIntent: (intent) => JSON.stringify(intent.needs.map((need) => need.id).sort()),
      build: (intent) => {
        const retainedNeedIds = new Set(intent.needs.map((need) => need.id));
        const assignments = input.skeleton.assignments.filter((assignment) =>
          assignment.satisfiedNeedIds.some((id) => retainedNeedIds.has(id)));
        const assignmentIds = new Set(assignments.map((assignment) =>
          assignment.routinePrescriptionHandoffId));
        const plans = input.prescriptionSession.plans.filter((plan) =>
          assignmentIds.has(plan.sourceExposureEvent.sessionAssignmentId)).map((plan) => ({ ...plan,
            durationInterval: { ...plan.durationInterval, knownLowerBoundSeconds: 10,
              knownUpperBoundSeconds: 20, unknownComponents: [],
              status: "bounded_before_sequencing" as const } }));
        const over = intent.needs.some((need) => need.section === "cooldown");
        return {
          skeleton: { ...input.skeleton, assignments },
          prescription: { ...input.prescriptionSession, plans },
          finalDuration: over ? input.finalDuration : {
            ...input.finalDuration,
            knownLowerBoundSeconds: 40,
            knownUpperBoundSeconds: 50,
            lowerBoundSeconds: 40,
            upperBoundSeconds: 50,
            status: "fits_known_bound" as const,
          },
          artifact: { assignmentIds: [...assignmentIds].sort() },
        };
      },
    });
    const first = run();
    const replay = run();
    expect(first).toEqual(replay);
    expect(first).toMatchObject({ status: "duration_within_capacity", rebuildCount: 1,
      structuralIterationBound: 1 });
    expect(first.decisions.map((decision) => decision.status)).toEqual([
      "duration_over_capacity_recomposable", "duration_within_capacity",
    ]);
    expect(first.intentStateFingerprints).toHaveLength(2);
    expect(new Set(first.intentStateFingerprints).size).toBe(2);
    expect(first.finalIntent.needs.some((need) => need.section === "cooldown")).toBe(false);
  });

  it("fails a non-monotonic recomposition fingerprint closed without a retry loop", () => {
    const input = optionalCooldownInput();
    let buildCount = 0;
    const result = executeBoundedDurationRecompositionLoop({
      initialIntent: input.intent,
      fingerprintIntent: () => "same-state",
      build: () => {
        buildCount += 1;
        return { skeleton: input.skeleton, prescription: input.prescriptionSession,
          finalDuration: input.finalDuration, artifact: null };
      },
    });
    expect(result.status).toBe("duration_recomposition_exhausted");
    expect(result.reasonCodes).toEqual(["DURATION_RECOMPOSITION_NON_MONOTONIC_OR_REPEATED_STATE"]);
    expect(buildCount).toBe(1);
  });
});
