import { describe, expect, it } from "vitest";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  SESSION_SEQUENCING_POLICY_V1,
  buildProductionSequencingAssignmentFacts,
  deriveFinalSequencingIntegrityTrace,
  sequenceFinalSession as sequenceFinalSessionKernel,
  validateFinalSessionSequencePlan,
  type ExplicitProductionSequencingTransitionFact,
  type ProductionFinalSessionSequencePlan,
  type ProductionFinalSessionSequencingInput,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { PRODUCTION_FINAL_SEQUENCING_MUTATIONS } from "../cagt/productionFinalSequencingEvidence";
import { prepareSequencingCase } from "../helpers/sessionSequencingDesignLab";
import { prepareProductionFinalSequencingInput } from "../helpers/productionFinalSequencingLab";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((candidate) =>
  prepareSequencingCase(candidate).prescription.status === "compiled" && candidate.skeleton.assignments.length >= 2
)!;

type DeepMutable<T> = T extends readonly (infer Item)[]
  ? DeepMutable<Item>[]
  : T extends object ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> } : T;

function baseInput(): DeepMutable<ProductionFinalSessionSequencingInput> {
  return structuredClone(prepareProductionFinalSequencingInput(fixture)) as unknown as DeepMutable<ProductionFinalSessionSequencingInput>;
}

const sequenceFinalSession = (input: unknown) =>
  sequenceFinalSessionKernel(input as ProductionFinalSessionSequencingInput);

describe("production Final Session Sequencing semantic mutations", () => {
  it("enumerates the complete required semantic mutation surface", () => {
    expect(PRODUCTION_FINAL_SEQUENCING_MUTATIONS).toHaveLength(49);
    expect(new Set(PRODUCTION_FINAL_SEQUENCING_MUTATIONS).size).toBe(49);
  });

  it("returns exact policy, resource, and unsupported-version statuses", () => {
    expect(sequenceFinalSession({ ...baseInput(), policy: null }).status).toBe("sequencing_policy_required");
    expect(sequenceFinalSession({
      ...baseInput(),
      policy: { policyId: SESSION_SEQUENCING_POLICY_V1.policyId, version: "2.0.0" },
      availablePolicies: [SESSION_SEQUENCING_POLICY_V1],
    }).status).toBe("sequencing_policy_unavailable");
    expect(sequenceFinalSession({ ...baseInput(), searchResourcePolicy: null }).status)
      .toBe("sequencing_search_policy_required");
    expect(sequenceFinalSession({
      ...baseInput(),
      searchResourcePolicy: { policyId: "FINAL_SEQUENCING_EXACT_SEARCH_RESOURCE_POLICY", version: "2.0.0" },
    }).status).toBe("sequencing_search_policy_unavailable");
    expect(sequenceFinalSession({
      ...baseInput(),
      sequencingContract: {
        ...PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        contractVersion: "2.0.0" as "1.0.0",
      },
    }).status).toBe("unsupported_sequencing_contract_version");
    const compiler = baseInput();
    expect(sequenceFinalSession({
      ...compiler,
      prescriptionSession: {
        ...compiler.prescriptionSession,
        compilerContract: { ...compiler.prescriptionSession.compilerContract, contractVersion: "2.0.0" as "1.0.0" },
      },
    }).status).toBe("unsupported_prescription_compiler_contract_version");
  });

  it("rejects duplicate, missing, extra, and wrong assignment ownership", () => {
    const duplicate = baseInput();
    duplicate.skeleton.assignments = [
      ...duplicate.skeleton.assignments,
      duplicate.skeleton.assignments[0],
    ] as typeof duplicate.skeleton.assignments;
    expect(sequenceFinalSession(duplicate).status).toBe("invalid_session_input");

    const missing = baseInput();
    missing.prescriptionSession.assignmentResults = missing.prescriptionSession.assignmentResults.slice(1);
    expect(sequenceFinalSession(missing).decisionTrace.finalReasonCodes)
      .toContain("MISSING_PRESCRIPTION_ASSIGNMENT_RESULT");

    const extra = baseInput();
    const plan = extra.prescriptionSession.plans[0];
    extra.prescriptionSession.plans = [
      ...extra.prescriptionSession.plans,
      {
        ...plan,
        prescriptionId: "extra-prescription",
        sourceExposureEvent: {
          ...plan.sourceExposureEvent,
          sourceExposureEventId: "extra-source-event",
          sessionAssignmentId: "extra-assignment",
        },
      },
    ];
    expect(sequenceFinalSession(extra).decisionTrace.finalReasonCodes).toContain("EXTRA_PRESCRIPTION_PLAN");

    const wrong = baseInput();
    const firstResult = wrong.prescriptionSession.assignmentResults[0];
    wrong.prescriptionSession.assignmentResults = [{
      ...firstResult,
      sourceExposureEvent: {
        ...firstResult.sourceExposureEvent!,
        sessionAssignmentId: wrong.skeleton.assignments[1].routinePrescriptionHandoffId,
      },
    }, ...wrong.prescriptionSession.assignmentResults.slice(1)];
    expect(sequenceFinalSession(wrong).status).toBe("invalid_session_input");
  });

  it("rejects attempt, section, role, source, revision, block, and rest mutations", () => {
    const attempt = baseInput();
    attempt.executionAttemptId = "wrong-attempt";
    expect(sequenceFinalSession(attempt).decisionTrace.finalReasonCodes)
      .toContain("PRESCRIPTION_EXECUTION_ATTEMPT_MISMATCH");

    const semantic = baseInput();
    semantic.skeleton.assignments = semantic.skeleton.assignments.map((assignment, index) => index === 0
      ? { ...assignment, role: "capacity" as const }
      : assignment);
    expect(sequenceFinalSession(semantic).status).toBe("invalid_session_input");

    const source = baseInput();
    source.prescriptionSession.plans = source.prescriptionSession.plans.map((plan, index) => index === 0
      ? { ...plan, sourceExposureEvent: { ...plan.sourceExposureEvent, sourceExposureEventId: "rewritten" } }
      : plan);
    expect(sequenceFinalSession(source).decisionTrace.finalReasonCodes).toContain("PRESCRIPTION_PLAN_RESULT_MISMATCH");

    const revision = baseInput();
    revision.prescriptionSession.plans = revision.prescriptionSession.plans.map((plan, index) => index === 0
      ? { ...plan, prescriptionRevisionId: "rewritten-revision" }
      : plan);
    expect(sequenceFinalSession(revision).status).toBe("invalid_session_input");

    const blocks = baseInput();
    const blockPlan = blocks.prescriptionSession.plans.find((candidate) => candidate.doseBlocks.length > 1);
    if (blockPlan) {
      blocks.prescriptionSession.plans = blocks.prescriptionSession.plans.map((candidate) =>
        candidate.prescriptionId === blockPlan.prescriptionId
          ? { ...candidate, doseBlocks: [...candidate.doseBlocks].reverse() }
          : candidate
      );
      expect(sequenceFinalSession(blocks).status).toBe("invalid_session_input");
    }

    const rest = baseInput();
    const restPlan = rest.prescriptionSession.plans.find((candidate) => candidate.restInstructions.length > 0);
    if (restPlan) {
      rest.prescriptionSession.plans = rest.prescriptionSession.plans.map((candidate) =>
        candidate.prescriptionId === restPlan.prescriptionId
          ? { ...candidate, restInstructions: [...candidate.restInstructions, candidate.restInstructions[0]] }
          : candidate
      );
      expect(sequenceFinalSession(rest).status).toBe("invalid_session_input");
    }
  });

  it("rejects equal-authority transition conflict without averaging", () => {
    const input = baseInput();
    const [left, right] = input.skeleton.assignments;
    const makeFact = (id: string, seconds: number): DeepMutable<ExplicitProductionSequencingTransitionFact> => ({
      sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
      transitionFactId: id,
      fromAssignmentId: left.routinePrescriptionHandoffId,
      toAssignmentId: right.routinePrescriptionHandoffId,
      executionAttemptId: input.executionAttemptId,
      factType: "setup_duration",
      sourceOwner: "coach_review",
      sourceRef: id,
      reviewState: "reviewed",
      target: { kind: "timing", value: { kind: "exact", seconds } },
      provenance: { source: "coach_review", sourceRef: id },
    });
    input.explicitTransitionFacts = [makeFact("conflict-a", 10), makeFact("conflict-b", 20)];
    const result = sequenceFinalSession(input);
    expect(result.status).toBe("transition_fact_conflict");
    expect(result.decisionTrace.finalReasonCodes).toContain("SEQUENCING_TRANSITION_FACT_CONFLICT");
  });

  it("returns a nonexecutable diagnostic and no fallback when the exact budget is exhausted", () => {
    const input = baseInput();
    input.searchResourcePolicy = {
      policyId: "FINAL_SEQUENCING_EXACT_SEARCH_RESOURCE_POLICY",
      version: "1.0.0",
      mode: "exact_only",
      maximumStatesExpanded: 2,
      maximumLegalCompleteOrdersEvaluated: 1_000,
      onLimit: "RETURN_SEARCH_INCONCLUSIVE",
      provenance: { source: "synthetic_contract_fixture", sourceRef: "low-budget" },
    };
    const result = sequenceFinalSession(input);
    expect(result.status).toBe("search_inconclusive");
    expect(result.plan).toBeNull();
    expect(result.diagnosticBestOrder).toMatchObject({ executable: false, optimalityProven: false });
  });

  it("derives and rejects forged executable-plan semantics", () => {
    const input = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSessionKernel(input);
    const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
    expect(initial.plan).not.toBeNull();
    expect(assignmentBuild.findings).toEqual([]);

    const findingsFor = (
      mutate: (plan: DeepMutable<ProductionFinalSessionSequencePlan>) => void,
    ) => {
      const mutated = structuredClone(initial.plan!) as DeepMutable<ProductionFinalSessionSequencePlan>;
      mutate(mutated);
      mutated.integrity = structuredClone(deriveFinalSequencingIntegrityTrace({
        sequencingInput: input,
        assignmentFacts: assignmentBuild.facts,
        plan: mutated as ProductionFinalSessionSequencePlan,
      })) as DeepMutable<ProductionFinalSessionSequencePlan>["integrity"];
      return validateFinalSessionSequencePlan({
        sequencingInput: input,
        assignmentFacts: assignmentBuild.facts,
        plan: mutated as ProductionFinalSessionSequencePlan,
      });
    };

    const semanticMutations: Readonly<Record<
      string,
      (plan: DeepMutable<ProductionFinalSessionSequencePlan>) => void
    >> = {
      assignment_addition: (plan) => plan.steps.push({
        ...structuredClone(plan.steps[0]),
        sequenceIndex: plan.steps.length,
        assignmentId: "policy-created-assignment",
      }),
      assignment_removal: (plan) => { plan.steps.pop(); },
      duplicate_assignment: (plan) => { plan.steps[1].assignmentId = plan.steps[0].assignmentId; },
      section_change: (plan) => { plan.steps[0].section = "cooldown"; },
      role_change: (plan) => { plan.steps[0].role = "capacity"; },
      source_event_rewrite: (plan) => { plan.steps[0].sourceExposureEventId = "rewritten-source"; },
      prescription_id_rewrite: (plan) => { plan.steps[0].prescriptionId = "rewritten-prescription"; },
      prescription_revision_rewrite: (plan) => { plan.steps[0].finalPrescriptionRevisionId = "rewritten-revision"; },
      block_reorder: (plan) => { plan.steps[0].orderedDoseBlockIds.reverse(); },
      block_interleaving: (plan) => { plan.steps[1].orderedDoseBlockIds[0] = plan.steps[0].orderedDoseBlockIds[0]; },
      dependency_violation: (plan) => { plan.steps[0].dependencyAssignmentIds = [plan.steps[0].assignmentId]; },
      copied_within_exercise_rest: (plan) => {
        plan.transitionInstructions[0].sourceTransitionFactId =
          input.prescriptionSession.plans[0].restInstructions[0].restInstructionId;
      },
      fake_setup_duration: (plan) => { plan.transitionInstructions[0].target = { kind: "exact", seconds: 99 }; },
      fake_recovery_duration: (plan) => { plan.transitionInstructions[1].target = { kind: "exact", seconds: 99 }; },
      unknown_duration_called_fit: (plan) => { plan.duration.status = "fits_known_bound"; },
      timing_fact_counted_twice: (plan) => {
        plan.transitionInstructions[0].sourceTransitionFactId = "reused-timing-fact";
        plan.transitionInstructions[1].sourceTransitionFactId = "reused-timing-fact";
      },
      unsupported_pairing: (plan) => { plan.compatibilityProjection.pairing = true as false; },
    };
    for (const [name, mutate] of Object.entries(semanticMutations)) {
      expect(findingsFor(mutate), name).not.toEqual([]);
    }
  });
});
