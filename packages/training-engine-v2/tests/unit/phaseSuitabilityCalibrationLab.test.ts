import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
  PHASE_CALIBRATION_POLICIES,
  PHASE_FIELD_CONSUMPTION,
  PHASE_OVERLAP_AUDIT,
  buildPhaseSuitabilityCalibrationData,
  renderPhaseSuitabilityCalibrationReview,
} from "../helpers/phaseSuitabilityCalibrationLab";

const data = buildPhaseSuitabilityCalibrationData();

function byNeed<T extends { readonly need: string }>(rows: readonly T[]): Map<string, readonly T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const existing = groups.get(row.need) ?? [];
    existing.push(row);
    groups.set(row.need, existing);
  }
  return groups;
}

describe("phase suitability calibration laboratory", () => {
  it("captures the published production behavior before running non-production policy experiments", () => {
    expect(data.fixedAsOf).toBe("2026-08-10T00:00:00.000Z");
    expect(data.productionRankingFingerprint).toBe(
      EXPECTED_PRODUCTION_RANKING_FINGERPRINT,
    );
    expect(data.productionFingerprintMatches).toBe(true);
    expect(data.phaseOnlySummaries).toHaveLength(30);
    expect(data.phaseCandidateMatrix).toHaveLength(72);
    expect(data.phaseRejectionMatrix).toHaveLength(1278);
  });

  it("records the exact current phase math, normalized weight and maximum effect", () => {
    expect(data.currentMath).toEqual({
      excellent: 8.8,
      good: 7.8,
      possible: 6.2,
      unspecified: 5.5,
      phase3HighLoadabilityBonus: 0.8,
      phase1LowSkillStabilityBonus: 0.5,
      configuredWeight: 1,
      emittedTotalWeight: 16.2,
      normalizedWeight: 1 / 16.2,
      maximumRawPhaseFit: 9.6,
      maximumAggregateContribution: 9.6 / 16.2,
      maximumAggregateSpread: 4.1 / 16.2,
    });
  });

  it("distinguishes represented phase fields from fields with actual receivers", () => {
    expect(PHASE_FIELD_CONSUMPTION).toHaveLength(24);
    expect(
      PHASE_FIELD_CONSUMPTION.find((row) => row.inputField === "PhaseIntent.primaryGoal")
        ?.status,
    ).toBe("UNUSED");
    expect(
      PHASE_FIELD_CONSUMPTION.find(
        (row) => row.inputField === "progressionIntent.exerciseContinuityDefault",
      )?.status,
    ).toBe("UNUSED");
    expect(
      PHASE_FIELD_CONSUMPTION.find(
        (row) => row.inputField === "ExerciseDefinition.phaseSuitability[phase].suitability",
      )?.status,
    ).toBe("FULLY_USED");
    expect(
      PHASE_FIELD_CONSUMPTION.find(
        (row) => row.inputField === "ExerciseDefinition.phaseSuitability[phase].reason",
      )?.status,
    ).toBe("UNUSED");
  });

  it("identifies exact mechanical double counts without collapsing distinct owners", () => {
    expect(
      PHASE_OVERLAP_AUDIT.filter((row) => row.classification === "ACTUAL_DOUBLE_COUNT")
        .map((row) => row.comparedFacts),
    ).toEqual([
      "phase_fit Phase 3 high-loadability bonus vs loadability",
      "phase_fit Phase 1 low-skill bonus vs skill_fit",
      "phase_fit Phase 1 stability condition vs stability_fit",
    ]);
    expect(
      PHASE_OVERLAP_AUDIT.find(
        (row) => row.comparedFacts === "PhaseIntent.primaryGoal vs CandidateRequest.goal/goal_fit",
      )?.classification,
    ).toBe("UNUSED_SEMANTIC");
  });

  it("audits all 45 phase annotation sets without inventing provenance", () => {
    expect(data.catalogAudit).toHaveLength(45);
    expect(new Set(data.catalogAudit.map((row) => row.exerciseId)).size).toBe(45);
    expect(data.catalogAudit.every((row) =>
      row.provenanceReviewStatus.includes("not modeled")
    )).toBe(true);
    expect(data.catalogAudit.filter((row) => row.classification === "WELL_JUSTIFIED")).toHaveLength(34);
    expect(data.catalogAudit.filter((row) => row.classification === "PLAUSIBLE_NEEDS_REVIEW")).toHaveLength(8);
    expect(data.catalogAudit.filter((row) => row.classification === "ARBITRARY_OR_UNDERSPECIFIED")).toHaveLength(3);
    expect(data.catalogAudit.filter((row) => row.classification === "CONTRADICTORY")).toEqual([]);
  });

  it("changes only phase while preserving legal pools and every hard-rejection truth", () => {
    const summaryGroups = byNeed(data.phaseOnlySummaries);
    const rejectionGroups = byNeed(data.phaseRejectionMatrix);
    expect([...summaryGroups.keys()]).toHaveLength(10);

    for (const summaries of summaryGroups.values()) {
      expect(summaries).toHaveLength(3);
      expect(new Set(summaries.map((row) => JSON.stringify([...row.legalCandidateIds].sort()))).size).toBe(1);
      expect(new Set(summaries.map((row) => row.goal)).size).toBe(1);
    }
    for (const rejections of rejectionGroups.values()) {
      const signaturesByPhase = ["phase_1", "phase_2", "phase_3"].map((phaseId) =>
        rejections
          .filter((row) => row.phaseId === phaseId)
          .map((row) => [row.exerciseId, row.reasonCodes] as const)
          .sort((left, right) => left[0].localeCompare(right[0])),
      );
      expect(signaturesByPhase[1]).toEqual(signaturesByPhase[0]);
      expect(signaturesByPhase[2]).toEqual(signaturesByPhase[0]);
    }

    const verticalPush = data.phaseOnlySummaries.filter(
      (row) => row.need === "vertical push secondary",
    );
    expect(verticalPush.every((row) => row.legalCandidateIds.length === 1)).toBe(true);
  });

  it("keeps the enduring request goal independent from the unused phase primaryGoal", () => {
    expect(data.goalMatrix).toHaveLength(18);
    for (const phaseId of ["phase_1", "phase_2", "phase_3"] as const) {
      const rows = data.goalMatrix.filter((row) => row.phaseId === phaseId);
      expect(new Set(rows.map((row) => row.requestGoal))).toEqual(
        new Set([
          "hypertrophy",
          "strength",
          "posture_and_movement_quality",
          "general_fitness",
          "pain_aware_return",
          "conditioning",
        ]),
      );
      expect(new Set(rows.map((row) => row.phasePrimaryGoal))).toEqual(
        new Set([rows[0]?.phasePrimaryGoal]),
      );
      expect(new Set(rows.map((row) => JSON.stringify([...row.legalCandidateIds].sort()))).size).toBe(1);
    }
    expect(
      data.goalMatrix.filter((row) => row.requestGoal === "conditioning")
        .every((row) => row.winnerGoalFit === 6),
    ).toBe(true);
  });

  it("keeps experience and phase as independent dimensions without machine-only legality", () => {
    expect(data.experienceMatrix).toHaveLength(12);
    expect(data.experienceMatrix.every((row) =>
      row.freeWeightCandidateIds.includes("dumbbell-bench-press") &&
      row.freeWeightCandidateIds.includes("push-up")
    )).toBe(true);
    for (const phaseId of ["phase_1", "phase_2", "phase_3"] as const) {
      const rows = data.experienceMatrix.filter((row) => row.phaseId === phaseId);
      expect(new Set(rows.map((row) => row.experience)).size).toBe(4);
      expect(new Set(rows.map((row) => row.winnerExperienceFit)).size).toBeGreaterThan(1);
    }
  });

  it("preserves productive continuity across phases and keeps transitions observational", () => {
    expect(data.continuityMatrix).toHaveLength(24);
    expect(data.continuityMatrix.every((row) =>
      row.transitionAutomaticSelectionEffects.length === 1 &&
      row.transitionAutomaticSelectionEffects[0] === "none"
    )).toBe(true);
    for (const state of ["productive", "stable", "ready_to_progress", "productive_stable_ready"]) {
      expect(
        data.continuityMatrix.filter((row) => row.state === state)
          .every((row) => row.winner === "chest-supported-dumbbell-row"),
      ).toBe(true);
    }
    expect(
      data.continuityMatrix.filter((row) => row.state === "ready_to_progress")
        .every((row) => row.currentContinuityReasonCode === "CONTINUITY_FAVORED"),
    ).toBe(true);
    for (const state of ["plateaued", "failed_progression", "pain_response"]) {
      expect(
        data.continuityMatrix.filter((row) => row.state === state)
          .every((row) => row.currentContinuityReasonCode === "REPLACEMENT_JUSTIFIED"),
      ).toBe(true);
    }
  });

  it("keeps phase subordinate to assessment, pain readiness and hard eligibility", () => {
    expect(data.interactionMatrix).toHaveLength(24);
    expect(
      data.interactionMatrix.filter((row) => row.scenario === "relevant_assessment")
        .every((row) => row.assessmentTraceCount === 1 && row.oneArmAssessmentFit === 6.39),
    ).toBe(true);
    const readinessByScenario = {
      current_discomfort: "EXECUTABLE_AT_CANDIDATE_SCOPE",
      moderate_candidate_review: "EXECUTABLE_AT_CANDIDATE_SCOPE",
      moderate_prescription_required: "EXECUTABLE_AT_CANDIDATE_SCOPE",
      moderate_role_substitution: "EXECUTABLE_AT_CANDIDATE_SCOPE",
    } as const;
    for (const [scenario, readiness] of Object.entries(readinessByScenario)) {
      expect(
        data.interactionMatrix.filter((row) => row.scenario === scenario)
          .every((row) => row.oneArmReadiness === readiness),
      ).toBe(true);
    }
    expect(
      data.interactionMatrix.filter((row) => row.scenario === "hard_contraindication")
        .every((row) =>
          row.oneArmReadiness === "hard_rejected" &&
          row.hardRejectedIds.includes("one-arm-dumbbell-row")
        ),
    ).toBe(true);
  });

  it("measures current, annotation-only, no-phase, weight and category-gap policies", () => {
    expect(PHASE_CALIBRATION_POLICIES).toHaveLength(11);
    expect(data.policySummaries).toHaveLength(11);
    expect(data.policySummaries.find((row) => row.policyId === "A_CURRENT")).toEqual({
      policyId: "A_CURRENT",
      rankChanges: 0,
      winnerChanges: 0,
      tiesCreated: 0,
      tiesBroken: 0,
      affectedCandidateIds: [],
    });
    expect(data.policySummaries.find((row) => row.policyId === "B_ANNOTATION_ONLY")).toEqual(
      expect.objectContaining({ rankChanges: 0, winnerChanges: 0 }),
    );
    expect(data.policySummaries.find((row) => row.policyId === "C_NO_PHASE_COMPONENT")).toEqual(
      expect.objectContaining({ rankChanges: 13, winnerChanges: 5, tiesCreated: 0 }),
    );
    expect(data.policySummaries.find((row) => row.policyId === "D_WEIGHT_125")).toEqual(
      expect.objectContaining({ rankChanges: 2, winnerChanges: 1 }),
    );
    expect(data.winnerChanges).toHaveLength(16);
    expect(data.rankThresholds).toHaveLength(5);
    expect(Math.min(...data.rankThresholds.map((row) => row.distanceFromCurrent))).toBe(0.25);
    expect(data.mechanicalBonusOnlyMovements).toEqual([]);
    expect(data.annotationRetainedMovements.length).toBeGreaterThan(0);
  });

  it("proves phase annotation counterfactual boundaries", () => {
    expect(data.counterfactualProof).toEqual({
      differentAnnotationOnlyChangesPhaseFit: true,
      eligibilityUnchanged: true,
      painReadinessUnchanged: true,
      progressionAndTransitionUnchanged: true,
      proseReasonDoesNotChangeScoring: true,
      unspecifiedPhaseFit: 5.5,
      unspecifiedRemainsExplicit: true,
    });
  });

  it("records production carry candidates without inventing allocation", () => {
    expect(data.carryAudit).toEqual(
      expect.objectContaining({
        movementRoleExists: true,
        referenceCarryExerciseIds: ["farmer-carry", "suitcase-carry"],
        scenarioIdsRequestingCarry: [],
        sessionOrWeeklyAllocationExists: false,
      }),
    );
  });

  it("renders a deterministic complete report and stops at owner decision", () => {
    expect(data.classification).toBe("PHASE_POLICY_READY_FOR_OWNER_DECISION");
    expect(data.remainingP1).toEqual([
      "Project-owner approval of the final Candidate Intelligence phase policy.",
      "Implementation and full revalidation of the approved phase policy before Session Composer.",
    ]);
    const rendered = renderPhaseSuitabilityCalibrationReview(data);
    expect(rendered).toContain("### Every Hard Rejection");
    expect(rendered).toContain("### Policy F - Continuity-Preserving Contrast");
    expect(rendered).toContain("## Weekly Development Ledger Handoff");
    expect(rendered).toContain("Overall Candidate Intelligence remains **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/PHASE_SUITABILITY_CALIBRATION_REVIEW.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
