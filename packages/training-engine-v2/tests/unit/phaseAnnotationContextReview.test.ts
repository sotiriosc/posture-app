import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES } from "../../src";
import {
  CONTEXTUAL_PHASE_POLICIES,
  CONTEXTUAL_PHASE_OWNER_POLICIES,
  PHASE_ACCEPTED_PROVENANCE_CONTRACT,
  PHASE_ANNOTATION_AUDIT_PLAN,
  PHASE_CALIBRATION_LAB_DESIGN,
  PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR,
  acceptedPhaseAnnotationHasProductionProvenance,
  buildPhaseAnnotationContextReviewData,
  phaseResolutionCanAffectProductionScoring,
  renderPhaseAnnotationContextReview,
  resolveContextualPhaseAnnotation,
  type ExercisePhaseSuitabilityAnnotation,
} from "../helpers/phaseAnnotationContextReview";

const data = buildPhaseAnnotationContextReviewData();

function annotation(input: {
  readonly annotationId: string;
  readonly suitability: "poor" | "possible" | "good" | "excellent";
  readonly roles?: ExercisePhaseSuitabilityAnnotation["scope"]["trainingRoles"];
  readonly sections?: ExercisePhaseSuitabilityAnnotation["scope"]["sessionSections"];
  readonly reviewStatus?: ExercisePhaseSuitabilityAnnotation["reviewStatus"];
}): ExercisePhaseSuitabilityAnnotation {
  return {
    annotationId: input.annotationId,
    exerciseId: "band-face-pull",
    phaseId: "phase_3",
    suitability: input.suitability,
    scope: {
      trainingRoles: input.roles,
      sessionSections: input.sections,
    },
    reason: "Synthetic resolver test.",
    reviewStatus: input.reviewStatus ?? "accepted",
    provenance: {
      sourceType: "synthetic_counterfactual",
      sourceRef: `test:${input.annotationId}`,
      evidenceBasis: ["Resolver unit test."],
    },
  };
}

describe("phase annotation context and uncertainty review", () => {
  it("preserves the accepted production fingerprint at the published baseline", () => {
    expect(data.fixedAsOf).toBe("2026-08-10T00:00:00.000Z");
    expect(data.productionFingerprintMatches).toBe(true);
    expect(data.productionRankingFingerprint).toBe(
      "d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782",
    );
  });

  it("audits every phase annotation for all 30 reference exercises", () => {
    expect(PHASE_ANNOTATION_AUDIT_PLAN).toHaveLength(30);
    expect(data.ownershipAudit).toHaveLength(90);
    expect(new Set(data.ownershipAudit.map((row) => row.exerciseId))).toEqual(
      new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id)),
    );
    expect(
      new Set(data.ownershipAudit.map((row) => `${row.exerciseId}:${row.phaseId}`)).size,
    ).toBe(90);
  });

  it("does not invent accepted evidence or structured provenance", () => {
    expect(data.acceptedAnnotationCount).toBe(0);
    expect(data.needsReviewAnnotationCount).toBe(16);
    expect(data.unknownAnnotationCount).toBe(74);
    expect(
      data.ownershipAudit.every(
        (row) => row.provenanceStatus === "MISSING_STRUCTURED_PROVENANCE",
      ),
    ).toBe(true);
    expect(data.proposedAnnotations).toHaveLength(16);
    expect(
      data.proposedAnnotations.every(
        (candidate) =>
          candidate.reviewStatus === "needs_review" &&
          candidate.provenance.sourceType === "legacy_reference_catalog_migration",
      ),
    ).toBe(true);
  });

  it("resolves exact role+section before section, role, or general evidence", () => {
    const general = annotation({
      annotationId: "general",
      suitability: "possible",
    });
    const role = annotation({
      annotationId: "role",
      suitability: "good",
      roles: ["activation"],
    });
    const section = annotation({
      annotationId: "section",
      suitability: "good",
      sections: ["activation"],
    });
    const exact = annotation({
      annotationId: "exact",
      suitability: "excellent",
      roles: ["activation"],
      sections: ["activation"],
    });
    const resolution = resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations: [general, role, section, exact],
    });

    expect(resolution.selectedAnnotation?.annotationId).toBe("exact");
    expect(resolution.specificity).toBe("role_and_section");
    expect(resolution.evidenceStatus).toBe("ACCEPTED_ANNOTATION");
    expect(resolution.consideredAnnotationIds).toEqual(["exact", "general", "role", "section"]);
  });

  it("keeps no match distinct from explicit reviewed poor", () => {
    const unknown = resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations: [],
    });
    const poor = resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations: [
        annotation({
          annotationId: "reviewed-poor",
          suitability: "poor",
          roles: ["activation"],
          sections: ["activation"],
        }),
      ],
    });

    expect(unknown).toEqual(
      expect.objectContaining({
        selectedAnnotation: null,
        evidenceStatus: "UNKNOWN_NO_MATCH",
        specificity: "none",
      }),
    );
    expect(poor.selectedAnnotation?.suitability).toBe("poor");
    expect(poor.evidenceStatus).toBe("ACCEPTED_ANNOTATION");
    expect(phaseResolutionCanAffectProductionScoring(unknown)).toBe(false);
    expect(phaseResolutionCanAffectProductionScoring(poor)).toBe(false);
  });

  it("requires accepted provenance before production phase scoring can use evidence", () => {
    const reviewedAccepted = annotation({
      annotationId: "accepted-owner",
      suitability: "good",
      roles: ["activation"],
      sections: ["activation"],
    });
    const complete: ExercisePhaseSuitabilityAnnotation = {
      ...reviewedAccepted,
      provenance: {
        sourceType: "owner_decision",
        sourceRef: "OWNER-PHASE-CONTEXT-2026-08-12",
        evidenceBasis: ["Owner exercise-science decision for exact role/section context."],
        reviewerId: "project-owner",
        reviewedAt: "2026-08-12T00:00:00.000Z",
      },
    };

    const incompleteResolution = resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations: [reviewedAccepted],
    });
    const completeResolution = resolveContextualPhaseAnnotation({
      phaseId: "phase_3",
      requestedRole: "activation",
      requestedSection: "activation",
      exerciseId: "band-face-pull",
      annotations: [complete],
    });

    expect(acceptedPhaseAnnotationHasProductionProvenance(reviewedAccepted)).toBe(false);
    expect(acceptedPhaseAnnotationHasProductionProvenance(complete)).toBe(true);
    expect(phaseResolutionCanAffectProductionScoring(incompleteResolution)).toBe(false);
    expect(phaseResolutionCanAffectProductionScoring(completeResolution)).toBe(true);
  });

  it("returns an explicit deterministic conflict for equally specific disagreement", () => {
    const excellent = annotation({
      annotationId: "conflict-a",
      suitability: "excellent",
      roles: ["activation"],
      sections: ["activation"],
    });
    const poor = annotation({
      annotationId: "conflict-b",
      suitability: "poor",
      roles: ["activation"],
      sections: ["activation"],
    });
    const resolve = (annotations: readonly ExercisePhaseSuitabilityAnnotation[]) =>
      resolveContextualPhaseAnnotation({
        phaseId: "phase_3",
        requestedRole: "activation",
        requestedSection: "activation",
        exerciseId: "band-face-pull",
        annotations,
      });

    const forward = resolve([excellent, poor]);
    const reverse = resolve([poor, excellent]);
    expect(forward.selectedAnnotation).toBeNull();
    expect(forward.evidenceStatus).toBe("CONFLICTING_ANNOTATIONS");
    expect(forward.unresolvedConflictIds).toEqual(["conflict-a", "conflict-b"]);
    expect(reverse.unresolvedConflictIds).toEqual(forward.unresolvedConflictIds);
  });

  it("scopes accessory rationale away from the Phase 3 activation request", () => {
    expect(data.scapularActivationFocus).toEqual([
      expect.objectContaining({
        exerciseId: "band-face-pull",
        currentSuitability: "possible",
        contextualEvidenceStatus: "UNKNOWN_NO_MATCH",
        currentRank: 2,
        contextualRank: 1,
      }),
      expect.objectContaining({
        exerciseId: "reverse-pec-deck",
        currentSuitability: "excellent",
        contextualEvidenceStatus: "UNKNOWN_NO_MATCH",
        currentRank: 1,
        contextualRank: 2,
      }),
      expect.objectContaining({
        exerciseId: "serratus-wall-slide",
        contextualEvidenceStatus: "REVIEW_QUALIFIED_ANNOTATION",
        contextualRank: 3,
      }),
    ]);
  });

  it("runs every required copied policy without mechanical bonuses in owner-policy variants", () => {
    expect(CONTEXTUAL_PHASE_POLICIES).toHaveLength(8);
    expect(
      CONTEXTUAL_PHASE_POLICIES.filter((policy) => policy.id !== "A_CURRENT_GLOBAL")
        .every((policy) => !policy.includeMechanicalBonuses),
    ).toBe(true);
    expect(data.controlledScenarios).toHaveLength(35);
    expect(data.candidateRows).toHaveLength(832);
  });

  it("records owner policies, review-status behavior, provenance, and calibration-lab design", () => {
    expect(CONTEXTUAL_PHASE_OWNER_POLICIES).toHaveLength(12);
    expect(CONTEXTUAL_PHASE_OWNER_POLICIES).toContain(
      "`UNKNOWN_NO_MATCH` is not poor.",
    );
    expect(CONTEXTUAL_PHASE_OWNER_POLICIES).toContain(
      "The Phase 1 low-skill/stability bonus is scheduled for removal.",
    );
    expect(PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR.find((row) =>
      row.reviewStatus === "needs_review"
    )?.productionScoring).toBe("zero");
    expect(PHASE_REVIEW_STATUS_PRODUCTION_BEHAVIOR.find((row) =>
      row.reviewStatus === "conflict"
    )?.productionScoring).toBe("omit_effective_evidence_require_review");
    expect(PHASE_ACCEPTED_PROVENANCE_CONTRACT.requiredFields).toEqual([
      "sourceType",
      "sourceRef",
      "evidenceBasis",
      "reviewerId",
      "reviewedAt",
    ]);
    expect(PHASE_CALIBRATION_LAB_DESIGN.coefficientStatus).toBe(
      "NO_FINAL_CATEGORY_VALUES_OR_PHASE_WEIGHT_SELECTED",
    );
    expect(PHASE_CALIBRATION_LAB_DESIGN.comparisonAxes).toEqual(
      expect.arrayContaining([
        "golden personas",
        "unknown not disadvantaged",
        "accepted poor versus unknown",
        "conflict cases",
      ]),
    );
    expect(data.calibrationLabDesign.productionBehavior).toBe("UNCHANGED");
  });

  it("omits phase weight for unknown evidence and exposes review attenuation", () => {
    const unknown = data.candidateRows.find(
      (row) =>
        row.policyId === "C_CONTEXT_SCOPED_ANNOTATION_ONLY" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === "band-face-pull",
    );
    expect(unknown).toEqual(
      expect.objectContaining({
        evidenceStatus: "UNKNOWN_NO_MATCH",
        phaseRawValue: null,
        effectivePhaseWeight: 0,
        phaseContribution: 0,
      }),
    );

    const full = data.candidateRows.find(
      (row) =>
        row.policyId === "F_REVIEW_QUALIFIED_FULL" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === "serratus-wall-slide",
    );
    const attenuated = data.candidateRows.find(
      (row) =>
        row.policyId === "F_REVIEW_QUALIFIED_ATTENUATED" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === "serratus-wall-slide",
    );
    const observational = data.candidateRows.find(
      (row) =>
        row.policyId === "F_REVIEW_QUALIFIED_OBSERVABILITY_ONLY" &&
        row.scenarioId === "scapular-activation-phase_3" &&
        row.exerciseId === "serratus-wall-slide",
    );
    expect(full?.effectivePhaseWeight).toBe(1);
    expect(attenuated?.effectivePhaseWeight).toBe(0.5);
    expect(observational?.effectivePhaseWeight).toBe(0);
  });

  it("records rank sensitivity without presenting a production choice", () => {
    expect(data.policySummaries.find((row) => row.policyId === "A_CURRENT_GLOBAL")).toEqual(
      expect.objectContaining({ rankChanges: 0, winnerChanges: 0 }),
    );
    expect(
      data.policySummaries.find((row) => row.policyId === "B_GLOBAL_ANNOTATION_ONLY"),
    ).toEqual(expect.objectContaining({ rankChanges: 2, winnerChanges: 1 }));
    expect(
      data.policySummaries.find(
        (row) => row.policyId === "C_CONTEXT_SCOPED_ANNOTATION_ONLY",
      ),
    ).toEqual(
      expect.objectContaining({
        rankChanges: 19,
        winnerChanges: 8,
        tiesCreated: 1,
        unknownCandidateRows: 94,
        reviewQualifiedCandidateRows: 10,
      }),
    );
    expect(data.winnerChanges).toHaveLength(49);
  });

  it("preserves productive continuity and pain readiness across contextual policies", () => {
    expect(
      data.scenarioRows
        .filter((row) => row.scenarioKind === "productive_continuity")
        .every((row) => row.winner === "chest-supported-dumbbell-row"),
    ).toBe(true);
    expect(data.counterfactualProof.scopeCannotAlterPainReadiness).toBe(true);
    expect(data.counterfactualProof.scopeCannotActivateTransition).toBe(true);
  });

  it("passes every structured-scope counterfactual invariant", () => {
    expect(Object.values(data.counterfactualProof).every(Boolean)).toBe(true);
  });

  it("stops at owner decision with the approved future PhaseIntent treatment", () => {
    expect(data.classification).toBe("PHASE_CONTEXT_CONTRACT_READY_FOR_OWNER_DECISION");
    expect(data.primaryGoalRecommendation).toContain("developmentalEmphasis");
    expect(data.remainingP1).toHaveLength(3);
  });

  it("renders a deterministic complete contextual review", () => {
    const rendered = renderPhaseAnnotationContextReview(data);
    expect(rendered).toContain("## All 90 Current Annotation Ownership Decisions");
    expect(rendered).toContain("## Focus Contrast: Phase 3 Scapular Activation");
    expect(rendered).toContain("## Review Status Production Behavior");
    expect(rendered).toContain("## Accepted Evidence Provenance Contract");
    expect(rendered).toContain("## Counterfactual Contract Tests");
    expect(rendered).toContain("**PHASE_CONTEXT_CONTRACT_READY_FOR_OWNER_DECISION**");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/PHASE_ANNOTATION_CONTEXT_REVIEW.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
