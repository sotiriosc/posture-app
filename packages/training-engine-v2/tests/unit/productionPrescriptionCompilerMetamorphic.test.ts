import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_POLICY_V1,
  compileSessionPrescription,
  type PrescriptionSessionCompilationResult,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { buildProductionCompilerInputForOwnerScenario } from "../helpers/productionPrescriptionCompiler";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
  entry.expectedResolution === "compile" && entry.handoff.assignments.length > 1
)!;

describe("production Prescription Compiler metamorphic behavior", () => {
  it("is invariant to policy, registry, evidence, and assignment ordering", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const expected = semanticSession(compileSessionPrescription(base));
    const reorderedPolicy = {
      ...PRESCRIPTION_POLICY_V1,
      rules: [...PRESCRIPTION_POLICY_V1.rules].reverse(),
    };
    const reordered = compileSessionPrescription({
      ...base,
      policy: reorderedPolicy,
      exerciseRegistry: [...base.exerciseRegistry].reverse(),
      exerciseKnowledgeRegistry: [...base.exerciseKnowledgeRegistry].reverse(),
      executionRequirements: [...base.executionRequirements].reverse(),
      completedPerformanceReferences: [...base.completedPerformanceReferences].reverse(),
      responseReceiverEvidence: [...base.responseReceiverEvidence].reverse(),
      sessionSkeleton: {
        ...base.sessionSkeleton,
        assignments: [...base.sessionSkeleton.assignments].reverse(),
      },
      handoff: {
        ...base.handoff,
        assignments: [...base.handoff.assignments].reverse(),
      },
    });
    expect(semanticSession(reordered)).toEqual(expected);
  });

  it("is invariant to labels, display prose, candidate ranks, and irrelevant refs", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const expected = semanticSession(compileSessionPrescription(base));
    const exerciseRegistry = base.exerciseRegistry.map((exercise) => ({
      ...exercise,
      name: `Changed display ${exercise.id}`,
      summary: "Changed explanatory prose with no authority.",
    }));
    const changed = compileSessionPrescription({
      ...base,
      athlete: { ...base.athlete, label: "Changed display label" },
      exerciseRegistry,
      sessionIntent: {
        ...base.sessionIntent,
        assessmentContextRefs: ["irrelevant-assessment"],
        painResponseContextRefs: ["irrelevant-pain"],
      },
      sessionSkeleton: {
        ...base.sessionSkeleton,
        assignments: base.sessionSkeleton.assignments.map((assignment) => ({
          ...assignment,
          candidateEvidenceByNeed: assignment.candidateEvidenceByNeed.map((evidence) => ({
            ...evidence,
            candidateRank: evidence.candidateRank + 100,
          })),
        })),
      },
      completedPerformanceReferences: [],
    });
    expect(semanticSession(changed)).toEqual(expected);
  });

  it("responds materially to experience and structural capacity", () => {
    const standard = buildProductionCompilerInputForOwnerScenario(fixture);
    const novice = compileSessionPrescription({
      ...standard,
      athlete: { ...standard.athlete, experience: "novice" },
    });
    const condensed = compileSessionPrescription({
      ...standard,
      sessionIntent: { ...standard.sessionIntent, structuralCapacity: "condensed" },
    });
    const baseline = compileSessionPrescription({
      ...standard,
      athlete: { ...standard.athlete, experience: "advanced" },
      sessionIntent: { ...standard.sessionIntent, structuralCapacity: "standard" },
      contextByHandoffId: Object.fromEntries(Object.entries(standard.contextByHandoffId).map(([id, context]) => [id, {
        ...context,
        familiarity: "known_productive",
        returnAfterAbsence: false,
        painAwareLoadToleranceRegressionPermitted: false,
        reliablePriorPerformance: true,
        reviewedRegression: false,
        adverseResponseSupportsReducedDose: false,
      }])),
    });
    expect(developmentalCounts(novice)).not.toEqual(developmentalCounts(baseline));
    expect(developmentalCounts(condensed)).not.toEqual(developmentalCounts(baseline));
  });
});

function semanticSession(result: PrescriptionSessionCompilationResult): unknown {
  return result.plans.map((plan) => ({
    assignmentId: plan.sourceExposureEvent.sessionAssignmentId,
    sourceEventId: plan.sourceExposureEvent.sourceExposureEventId,
    prescriptionId: plan.prescriptionId,
    blocks: plan.doseBlocks.map((block) => ({
      purpose: block.purpose,
      dose: block.dose,
      contribution: block.contributionClassification,
      requirements: block.requirementRefs,
    })),
  })).sort((left, right) => left.assignmentId.localeCompare(right.assignmentId));
}

function developmentalCounts(result: PrescriptionSessionCompilationResult): readonly unknown[] {
  return result.plans.flatMap((plan) => plan.doseBlocks)
    .filter((block) => block.purpose === "developmental_work")
    .map((block) => "sets" in block.dose ? block.dose.sets : null);
}
