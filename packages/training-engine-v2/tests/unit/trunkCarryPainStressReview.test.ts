import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  JOINT_STRESS_TAGS,
  REFERENCE_EXERCISES,
} from "../../src";
import {
  PROPOSED_TRUNK_CARRY_CANDIDATE_IDS,
} from "../helpers/minimalTrunkCarryCatalogProposal";
import {
  PROPOSED_TRUNK_CARRY_STRESS_TAGS,
  REJECTED_VAGUE_STRESS_TAGS,
  TRUNK_CARRY_PAIN_STRESS_CLASSIFICATION,
  buildTrunkCarryPainStressReviewData,
  renderTrunkCarryPainStressReviewReport,
  type SyntheticReceiverLabRow,
} from "../helpers/trunkCarryPainStressReview";

const data = buildTrunkCarryPainStressReviewData();

function row(input: {
  readonly candidateId: string;
  readonly scenario: string;
}): SyntheticReceiverLabRow {
  const found = data.syntheticReceiverRows.find(
    (candidateRow) =>
      candidateRow.candidateId === input.candidateId &&
      candidateRow.scenario === input.scenario,
  );
  if (!found) {
    throw new Error(`Missing synthetic row ${input.candidateId}/${input.scenario}`);
  }
  return found;
}

function sourceConsequence(input: {
  readonly source: string;
  readonly signalKind: string;
}) {
  const found = data.receiverSourceConsequences.find(
    (candidateRow) =>
      candidateRow.sourcePlacement.join(" + ") === input.source &&
      candidateRow.signalKind === input.signalKind,
  );
  if (!found) {
    throw new Error(`Missing source consequence ${input.source}/${input.signalKind}`);
  }
  return found;
}

describe("trunk/carry pain-stress vocabulary and receiver review", () => {
  it("renders a deterministic checked-in review report with the selected classification", () => {
    const second = buildTrunkCarryPainStressReviewData();
    const rendered = renderTrunkCarryPainStressReviewReport(data);

    expect(second).toEqual(data);
    expect(renderTrunkCarryPainStressReviewReport(second)).toBe(rendered);
    expect(data.classification).toBe(TRUNK_CARRY_PAIN_STRESS_CLASSIFICATION);
    expect(rendered.match(/TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY/g))
      .toHaveLength(1);
    expect(rendered).toContain("## Current Vocabulary Inventory");
    expect(rendered).toContain("## Synthetic Receiver Matrix");
    expect(rendered).toContain("Policy C");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_REVIEW.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });

  it("inventories the approved stress vocabulary without adding production exercises or rows", () => {
    expect(data.currentVocabulary.map((tag) => tag.tag)).toEqual([
      "deep_knee_flexion",
      "loaded_knee_flexion",
      "loaded_spinal_flexion",
      "loaded_spinal_extension",
      "heavy_axial_loading",
      "loaded_hinge",
      "overhead_pressing",
      "horizontal_pressing",
      "shoulder_abduction_external_rotation",
      "wrist_extension_loading",
      "high_impact",
      "grip_intensive",
      "long_lever_core",
      "upper_limb_support_loading",
      "loaded_trunk_rotation",
      "lateral_trunk_loading",
      "loaded_gait",
      "loaded_march",
      "grip_loading",
    ]);
    expect(JOINT_STRESS_TAGS).toEqual(
      expect.arrayContaining([...PROPOSED_TRUNK_CARRY_STRESS_TAGS]),
    );
    expect(
      REFERENCE_EXERCISES.map((exercise) => exercise.id),
    ).not.toEqual(
      expect.arrayContaining([...PROPOSED_TRUNK_CARRY_CANDIDATE_IDS]),
    );
    expect(
      REFERENCE_EXERCISES.flatMap((exercise) => [
        ...exercise.loading.jointStressTags,
        ...exercise.cautionStressTags,
        ...exercise.contraindicatedStressTags,
      ]),
    ).not.toEqual(expect.arrayContaining([...PROPOSED_TRUNK_CARRY_STRESS_TAGS]));
  });

  it("classifies current tag migration risk without performing migration", () => {
    expect(
      data.currentVocabulary.find((tag) => tag.tag === "grip_intensive")
        ?.recommendedTreatment,
    ).toBe("MIGRATE_TO_STRUCTURED_SCOPE");
    expect(
      data.currentVocabulary.find((tag) => tag.tag === "long_lever_core")
        ?.classifications,
    ).toEqual(["OVERBROAD", "VARIANT_DEPENDENT"]);
    expect(
      data.currentVocabulary.find((tag) => tag.tag === "heavy_axial_loading")
        ?.classifications,
    ).toEqual(["UNUSED", "DOSE_DEPENDENT"]);
    expect(
      data.currentVocabulary.find((tag) => tag.tag === "loaded_spinal_flexion")
        ?.recommendedTreatment,
    ).toBe("REVIEW_LATER");
  });

  it("approves only receiver-owned proposal tags and rejects vague tag names", () => {
    const accepted = data.proposedTagDecisions
      .filter((decision) => decision.recommendation === "ACCEPT_FOR_OWNER_DECISION")
      .map((decision) => decision.proposedName);

    expect(accepted).toEqual([
      "upper_limb_support_loading",
      "loaded_trunk_rotation",
      "lateral_trunk_loading",
      "loaded_gait",
      "loaded_march",
      "grip_loading",
    ]);
    expect(
      data.proposedTagDecisions.find(
        (decision) => decision.concept === "loaded gait or march as one shared exposure",
      )?.recommendation,
    ).toBe("REJECT_AS_SHARED_TAG");
    expect(data.rejectedVagueTags).toEqual([...REJECTED_VAGUE_STRESS_TAGS]);
    expect(data.rejectedVagueTags).toEqual(
      expect.arrayContaining([
        "core_stress",
        "carry_stress",
        "bad_posture",
        "hard_exercise",
      ]),
    );
  });

  it("keeps candidate exposure ownership distinct from movement role and mechanics function", () => {
    const forearmPlank = data.candidateAudit.find(
      (candidate) => candidate.candidateId === "forearm-plank",
    );
    const sidePlank = data.candidateAudit.find(
      (candidate) => candidate.candidateId === "forearm-side-plank",
    );
    const chop = data.candidateAudit.find(
      (candidate) =>
        candidate.candidateId === "half-kneeling-high-to-low-cable-chop",
    );
    const farmer = data.candidateAudit.find(
      (candidate) => candidate.candidateId === "farmer-carry",
    );
    const wallMarch = data.candidateAudit.find(
      (candidate) => candidate.candidateId === "wall-supported-suitcase-march",
    );

    expect(forearmPlank?.potentialNewTags).toEqual([
      "upper_limb_support_loading",
    ]);
    expect(forearmPlank?.currentTagsThatDoNotFit).toContain(
      "wrist_extension_loading",
    );
    expect(sidePlank?.potentialNewTags).toEqual([
      "upper_limb_support_loading",
      "lateral_trunk_loading",
    ]);
    expect(chop?.currentTagsThatDoNotFit).toEqual(
      expect.arrayContaining([
        "loaded_spinal_flexion",
        "loaded_spinal_extension",
        "overhead_pressing from anchor height alone",
      ]),
    );
    expect(farmer?.currentTagsThatDoNotFit).toContain(
      "heavy_axial_loading as static tag",
    );
    expect(wallMarch?.currentTagsThatDoNotFit).toContain("loaded_gait");
  });

  it("pins the current source/receiver consequences for proposed source placement", () => {
    expect(sourceConsequence({
      source: "joint_stress",
      signalKind: "current_discomfort",
    })).toEqual(
      expect.objectContaining({
        canonicalMatchCount: 1,
        painSuitabilityUnits: 1,
        jointCostUnits: 1,
        legal: true,
      }),
    );
    expect(sourceConsequence({
      source: "caution",
      signalKind: "hard_contraindication",
    })).toEqual(
      expect.objectContaining({
        canonicalMatchCount: 1,
        hardCriteria: 0,
        legal: true,
      }),
    );
    expect(sourceConsequence({
      source: "contraindicated",
      signalKind: "hard_contraindication",
    })).toEqual(
      expect.objectContaining({
        canonicalMatchCount: 1,
        hardCriteria: 1,
        legal: false,
      }),
    );
    expect(sourceConsequence({
      source: "contraindicated",
      signalKind: "acute_severe_pain",
    })).toEqual(
      expect.objectContaining({
        canonicalMatchCount: 1,
        acuteCriteria: 0,
        legal: true,
      }),
    );
    expect(sourceConsequence({
      source: "joint_stress + caution",
      signalKind: "current_discomfort",
    })).toEqual(
      expect.objectContaining({
        canonicalMatchCount: 1,
        painSuitabilityUnits: 1,
        jointCostUnits: 1,
      }),
    );
  });

  it("runs the proposal-only receiver matrix for every selected candidate", () => {
    for (const candidateId of [
      "forearm-plank",
      "forearm-side-plank",
      "machine-abdominal-crunch",
      "half-kneeling-high-to-low-cable-chop",
      "farmer-carry",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ]) {
      expect(row({ candidateId, scenario: "no pain" })).toEqual(
        expect.objectContaining({
          legal: "LEGAL",
          warning: false,
          canonicalMatchCount: 0,
          painSuitabilityUnits: 0,
          jointCostUnits: 0,
          candidateExecutionReadiness: "EXECUTABLE_AT_CANDIDATE_SCOPE",
        }),
      );
      expect(row({ candidateId, scenario: "unrelated current discomfort" }))
        .toEqual(expect.objectContaining({
          canonicalMatchCount: 0,
          painSuitabilityUnits: 0,
          jointCostUnits: 0,
        }));
      expect(row({ candidateId, scenario: "matching current discomfort" }))
        .toEqual(expect.objectContaining({
          canonicalMatchCount: 1,
          painSuitabilityUnits: 1,
          jointCostUnits: 1,
          candidateExecutionReadiness: "REQUIRES_PRESCRIPTION",
        }));
      expect(row({
        candidateId,
        scenario: "matching moderate pain: avoid_aggravator",
      })).toEqual(expect.objectContaining({
        warning: true,
        canonicalMatchCount: 1,
        responseRequirement:
          "avoid_aggravator:candidate_review:policy_unresolved_candidate_review_required",
        candidateExecutionReadiness: "REQUIRES_CANDIDATE_REVIEW",
      }));
      expect(row({
        candidateId,
        scenario: "matching moderate pain: reduce_load_and_range",
      })).toEqual(expect.objectContaining({
        warning: true,
        responseRequirement:
          "reduce_load_and_range:prescription:deferred_unexecutable_at_candidate_layer",
        candidateExecutionReadiness: "REQUIRES_PRESCRIPTION",
      }));
      expect(row({
        candidateId,
        scenario: "matching moderate pain: substitute_role",
      })).toEqual(expect.objectContaining({
        warning: true,
        responseRequirement:
          "substitute_role:session_intent_or_session_composer:deferred_unexecutable_at_candidate_layer",
        candidateExecutionReadiness: "REQUIRES_SESSION_ROLE_SUBSTITUTION",
      }));
      expect(row({ candidateId, scenario: "matching acute/severe pain" }))
        .toEqual(expect.objectContaining({
          legal: "REJECTED",
          acuteCriteria: 1,
        }));
      expect(row({ candidateId, scenario: "matching hard contraindication" }))
        .toEqual(expect.objectContaining({
          legal: "REJECTED",
          hardCriteria: 1,
        }));
      expect(row({ candidateId, scenario: "contraindicated-only placement" }))
        .toEqual(expect.objectContaining({
          legal: "LEGAL",
          canonicalMatchCount: 1,
          painSuitabilityUnits: 1,
          jointCostUnits: 0,
        }));
      expect(row({ candidateId, scenario: "duplicate source placement" }))
        .toEqual(expect.objectContaining({
          canonicalMatchCount: 1,
          painSuitabilityUnits: 1,
          jointCostUnits: 1,
        }));
      expect(row({ candidateId, scenario: "two distinct signals sharing one tag" }))
        .toEqual(expect.objectContaining({
          canonicalMatchCount: 2,
          painSuitabilityUnits: 2,
          jointCostUnits: 2,
        }));
    }
  });

  it("records side, hard-authority, prescription-realization, and variant boundaries", () => {
    expect(data.sideSpecificPainFinding).toContain("canonical matcher emits side null");
    expect(data.hardAuthorityRecommendation).toContain("Policy C");
    expect(data.prescriptionStressTraceRecommendation).toContain(
      "PrescriptionStressExposureTrace",
    );
    expect(data.variantDoseCounterfactuals.find(
      (variant) =>
        variant.candidateId === "wall-supported-suitcase-march" &&
        variant.variant === "no walking distance",
    )).toEqual(expect.objectContaining({
      disappears: expect.arrayContaining(["loaded_gait"]),
      remains: expect.arrayContaining(["loaded_march"]),
    }));
  });

  it("preserves all current behavior fingerprints from the accepted contracts", () => {
    expect(data.behaviorFingerprints.productionRankingFingerprint).toBe(
      "f9e22a86a99361f6fa4cd36d663a8b448ec6f25a10301cc413ecdec31c9c206c",
    );
    expect(data.behaviorFingerprints.productionRankingMatches).toBe(true);
    expect(data.behaviorFingerprints.comprehensiveBehaviorFingerprint).toBe(
      "3a52602bd3ebcaf116a3289ff329e54c2374539a92974aca2bec33dec0b0de1f",
    );
    expect(data.behaviorFingerprints.comprehensiveBehaviorMatches).toBe(true);
    expect(data.behaviorFingerprints.referenceCatalogFingerprint).toBe(
      "903e344207a91f4af6519f88c667f7baa5f2d04711579fc2e2effddc8820ef8c",
    );
    expect(data.behaviorFingerprints.referenceCatalogMatches).toBe(true);
    expect(data.behaviorFingerprints.equipmentLegalityFingerprint).toBe(
      "5aa3d161faf552652caec1b6b01e22f2c2718dfc12337d74329f4a39deb38869",
    );
    expect(data.behaviorFingerprints.equipmentLegalityMatches).toBe(true);
    expect(data.behaviorFingerprints.expandedEquipmentFixtureFingerprint).toBe(
      "bb07188480cab4134ba4f2eb36dfa4f17e5d4d62d6139b539c5603ad602b482a",
    );
    expect(data.behaviorFingerprints.expandedEquipmentFixtureMatches).toBe(true);
  });
});
