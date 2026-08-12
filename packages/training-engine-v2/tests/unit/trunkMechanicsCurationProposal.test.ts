import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  TRUNK_CURATION_EXERCISE_IDS,
  buildTrunkMechanicsCurationProposalData,
  renderTrunkMechanicsCurationProposal,
} from "../helpers/trunkMechanicsCurationProposal";

const data = buildTrunkMechanicsCurationProposalData();

describe("trunk mechanics representative curation proposal", () => {
  it("includes all 14 requested exercises exactly once", () => {
    expect(data.exercises).toHaveLength(14);
    expect(data.exercises.map((exercise) => exercise.exerciseId)).toEqual([
      ...TRUNK_CURATION_EXERCISE_IDS,
    ]);
    expect(new Set(data.exercises.map((exercise) => exercise.exerciseId)).size).toBe(14);
  });

  it("includes all eight trunk functions for every exercise", () => {
    expect(TRUNK_MECHANICS_FUNCTIONS).toHaveLength(8);
    expect(data.tracePreview).toHaveLength(14 * 8);

    for (const exercise of data.exercises) {
      expect(Object.keys(exercise.functions)).toEqual([
        ...TRUNK_MECHANICS_FUNCTIONS,
      ]);
      expect(
        TRUNK_MECHANICS_FUNCTIONS.map(
          (functionName) => exercise.functions[functionName].function,
        ),
      ).toEqual([...TRUNK_MECHANICS_FUNCTIONS]);
    }
  });

  it("records deterministic accepted, review, and unknown counts", () => {
    expect(data.proposalCounts).toEqual({
      PROPOSE_ACCEPTED: 15,
      PROPOSE_NEEDS_REVIEW: 17,
      REMAIN_UNKNOWN: 80,
    });
    expect(data.provenanceCounts).toEqual({
      A_STRUCTURED_EXISTING_EVIDENCE: 15,
      B_HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED: 14,
      C_EXTERNAL_REFERENCE_RECOMMENDED: 3,
      D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN: 80,
    });
  });

  it("gives every non-unknown proposal a non-circular provenance plan", () => {
    const nonUnknown = data.tracePreview.filter(
      (row) => row.proposedLevel !== "unknown",
    );

    expect(nonUnknown).toHaveLength(32);
    for (const row of nonUnknown) {
      expect(row.proposedSourceRef).not.toBe("none");
      expect(row.proposedSourceRef).not.toContain("trunkMechanics");
      expect(row.proposedSourceRef).not.toContain(
        "TRUNK_MECHANICS_CURATION_PROPOSAL",
      );
      expect(row.evidenceBasis.trim().length).toBeGreaterThan(0);
      expect(row.sourceClass).not.toBe(
        "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
      );

      if (row.proposedReviewStatus === "PROPOSE_ACCEPTED") {
        expect(row.sourceClass).toBe("A_STRUCTURED_EXISTING_EVIDENCE");
        expect(row.proposedSourceRef).toContain("referenceExercises.ts#");
        expect(row.proposedSourceRef).not.toContain("pending-");
      } else {
        expect(row.futureReviewStatus).toBe("needs_review");
        expect(row.proposedSourceRef).toMatch(/^pending-/);
      }
    }
  });

  it("never proposes none without independent structured evidence", () => {
    const noneRows = data.tracePreview.filter(
      (row) => row.proposedLevel === "none",
    );

    expect(noneRows).toHaveLength(9);
    for (const row of noneRows) {
      expect(row.proposedReviewStatus).toBe("PROPOSE_ACCEPTED");
      expect(row.sourceClass).toBe("A_STRUCTURED_EXISTING_EVIDENCE");
      expect(row.proposedSourceRef).toContain("referenceExercises.ts#");
      expect(row.evidenceBasis.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps insufficient evidence explicitly unknown", () => {
    const unknownRows = data.tracePreview.filter(
      (row) => row.proposedLevel === "unknown",
    );

    expect(unknownRows).toHaveLength(80);
    for (const row of unknownRows) {
      expect(row.proposedReviewStatus).toBe("REMAIN_UNKNOWN");
      expect(row.futureReviewStatus).toBe("needs_review");
      expect(row.futureEvidenceSource).toBe("unknown");
      expect(row.proposedSourceRef).toBe("none");
      expect(row.sourceClass).toBe(
        "D_INSUFFICIENT_EVIDENCE_REMAIN_UNKNOWN",
      );
    }
  });

  it("never collapses controlled rotation into anti-rotation", () => {
    const pallof = data.exercises.find(
      (exercise) => exercise.exerciseId === "pallof-press",
    );

    expect(pallof?.functions.antiRotationContribution).toEqual(
      expect.objectContaining({
        function: "antiRotationContribution",
        level: "high",
        proposalStatus: "PROPOSE_ACCEPTED",
      }),
    );
    expect(pallof?.functions.controlledRotationContribution).toEqual(
      expect.objectContaining({
        function: "controlledRotationContribution",
        level: "none",
        proposalStatus: "PROPOSE_ACCEPTED",
      }),
    );
    expect(
      pallof?.functions.controlledRotationContribution.notes,
    ).toContain("resist axial rotation, not intentionally produce");
  });

  it("keeps exposure classes report-only and contextual", () => {
    expect(data.exposureCounts).toEqual({
      DIRECT_DEVELOPMENTAL: 3,
      MEANINGFUL_SECONDARY: 8,
      INCIDENTAL_BRACING: 3,
      NO_REVIEWED_EXPOSURE: 0,
    });

    const exerciseDomain = readFileSync(
      new URL("../../src/domain/exercise.ts", import.meta.url),
      "utf8",
    );
    const referenceCatalog = readFileSync(
      new URL("../../src/data/referenceExercises.ts", import.meta.url),
      "utf8",
    );

    expect(exerciseDomain).not.toContain("exposureClass");
    expect(referenceCatalog).not.toContain("DIRECT_DEVELOPMENTAL");
    expect(referenceCatalog).not.toContain("MEANINGFUL_SECONDARY");
    expect(referenceCatalog).not.toContain("INCIDENTAL_BRACING");
  });

  it("changes only the authorized production trunk-profile metadata", () => {
    expect(data.behaviorBoundary.fullReferenceCatalogMatchesFirstTranche).toBe(true);
    expect(data.behaviorBoundary.capturedReferenceCatalogFingerprint).toBe(
      CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
    );
    expect(data.behaviorBoundary.currentReferenceCatalogFingerprint).toBe(
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    );
    expect(data.behaviorBoundary.strippedReferenceCatalogMatchesBaseline).toBe(true);
    expect(data.behaviorBoundary.strippedReferenceCatalogFingerprint).toBe(
      CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
    );
    expect(
      REFERENCE_EXERCISES.filter(
        (exercise) => exercise.mechanics?.trunkMechanics !== undefined,
      ).map((exercise) => exercise.id),
    ).toHaveLength(10);
  });

  it("preserves current production ranking and comprehensive behavior fingerprints", () => {
    expect(data.behaviorBoundary.productionRankingMatches).toBe(true);
    expect(data.behaviorBoundary.currentProductionRankingFingerprint).toBe(
      CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    );
    expect(data.behaviorBoundary.comprehensiveBehaviorMatches).toBe(true);
    expect(data.behaviorBoundary.currentComprehensiveBehaviorFingerprint).toBe(
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    );
  });

  it("preserves review warnings instead of silently resolving shared evidence", () => {
    const warnings = data.consistencyFindings.filter(
      (finding) => finding.status === "REVIEW_WARNING",
    );

    expect(warnings).toHaveLength(3);
    expect(warnings.map((finding) => finding.check)).toEqual([
      "One-Arm Row function proposals share one unilateral/high-demand evidence cluster.",
      "Step-Up function proposals share one stepping/stability evidence cluster.",
      "Goblet Squat pressure and bracing proposals overlap.",
    ]);
  });

  it("keeps rejected legacy policy out of the proposal", () => {
    const rejected = data.legacyFindings.filter(
      (finding) => finding.disposition === "REJECTED",
    );

    expect(rejected.map((finding) => finding.claim)).toEqual(
      expect.arrayContaining([
        "Exercise names, tags, movementPattern strings, and coaching cues can infer core family.",
        "Every three-day plan requires fixed generic core and carry quotas.",
        "Pallof Press to woodchop is an automatic progression.",
        "Free-text pain contraindications can authorize V2 gating.",
      ]),
    );
  });

  it("recommends only the direct trio for the first metadata implementation", () => {
    expect(data.recommendedFirstImplementationTranche).toEqual([
      "ninety-ninety-breathing",
      "dead-bug",
      "pallof-press",
    ]);
    expect(data.classification).toBe(
      "TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL",
    );
  });

  it("matches the checked-in deterministic proposal report", () => {
    const rendered = renderTrunkMechanicsCurationProposal(data);
    expect(rendered).toContain("## Complete 14 x 8 Function Matrix");
    expect(rendered).toContain("## Owner Approval and First-Tranche Implementation");
    expect(rendered).toContain("## Future Trace Preview");
    expect(rendered).toContain("## Protected Legacy Review");
    expect(rendered).toContain(
      "**TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL**",
    );
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/TRUNK_MECHANICS_CURATION_PROPOSAL.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
