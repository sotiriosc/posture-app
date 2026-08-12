import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BODY_REGIONS,
  MOVEMENT_ROLES,
  MUSCLE_GROUPS,
  REFERENCE_EXERCISES,
} from "../../src";
import {
  buildTrunkCoreDomainReviewData,
  renderTrunkCoreDomainReview,
} from "../helpers/trunkCoreDomainReview";

const data = buildTrunkCoreDomainReviewData();

describe("trunk/core domain and coverage review", () => {
  it("records the owner-approved primitive contract without inventing anatomy", () => {
    expect(MUSCLE_GROUPS).toContain("trunk");
    expect(MUSCLE_GROUPS).not.toEqual(
      expect.arrayContaining(["abdominals", "obliques", "spinal_extensors"]),
    );
    expect(BODY_REGIONS).toEqual(
      expect.arrayContaining(["ribcage", "lumbar_spine", "pelvis", "general"]),
    );
    expect(BODY_REGIONS).not.toEqual(expect.arrayContaining(["abdomen", "abdominal_wall"]));
    expect(MOVEMENT_ROLES).toEqual(
      expect.arrayContaining([
        "breathing_position",
        "anti_extension_core",
        "anti_rotation_core",
        "anti_lateral_flexion_core",
        "trunk_flexion",
        "trunk_rotation",
        "loaded_bracing",
        "carry",
      ]),
    );
  });

  it("audits every reference exercise exactly once", () => {
    expect(data.snapshot.referenceExerciseCount).toBe(37);
    expect(data.catalogRows).toHaveLength(REFERENCE_EXERCISES.length);
    expect(new Set(data.catalogRows.map((row) => row.exerciseId))).toEqual(
      new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id)),
    );
  });

  it("reports the exact current dedicated and direct catalog coverage", () => {
    expect(data.snapshot).toEqual(
      expect.objectContaining({
        dedicatedCoreControlCount: 6,
        breathingResetCount: 1,
        primaryTrunkCount: 10,
        secondaryTrunkCount: 10,
        directDevelopmentalCount: 10,
        meaningfulSecondaryCount: 8,
        incidentalBracingCount: 10,
        noCurrentTrunkEvidenceCount: 9,
        trunkProfileCount: 10,
        acceptedTrunkFunctionCount: 24,
        unknownTrunkFunctionCount: 56,
      }),
    );
    expect(
      data.catalogRows
        .filter((row) => row.exposureClass === "DIRECT_DEVELOPMENTAL")
        .map((row) => row.exerciseId),
    ).toEqual([
      "ninety-ninety-breathing",
      "dead-bug",
      "pallof-press",
      "forearm-plank",
      "forearm-side-plank",
      "machine-abdominal-crunch",
      "half-kneeling-high-to-low-cable-chop",
      "farmer-carry",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ]);
    expect(
      data.catalogRows
        .filter((row) => row.exposureClass === "MEANINGFUL_SECONDARY")
        .map((row) => row.exerciseId),
    ).toEqual([
      "push-up",
      "one-arm-dumbbell-row",
      "dumbbell-shoulder-press",
      "goblet-squat",
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
      "split-squat",
      "step-up",
    ]);
  });

  it("records the exact carry and capacity production coverage", () => {
    expect(data.snapshot.carryRoleCount).toBe(2);
    expect(data.snapshot.capacityTrainingRoleCount).toBe(3);
    expect(data.functionalCoverage.find((row) => row.function === "Loaded gait / carries"))
      .toEqual(
        expect.objectContaining({
          currentExerciseSupport: "Farmer and suitcase carry plus three capacity-role exercises",
        }),
      );
  });

  it("keeps current weekly credit contract-only and separates all four future lanes", () => {
    expect(data.catalogRows.every((row) => row.currentWeeklyCreditPossibility.length > 0)).toBe(
      true,
    );
    expect(data.exposurePolicy.map((row) => row.class)).toEqual([
      "DIRECT DEVELOPMENTAL SET/UNIT",
      "MEANINGFUL SECONDARY EXPOSURE",
      "INCIDENTAL BRACING",
      "CAPACITY EXPOSURE",
    ]);
    expect(data.exposurePolicy[1]?.ledgerCredit).toContain("do not convert 1:1");
    expect(data.exposurePolicy[2]?.ledgerCredit).toContain("Zero developmental credit");
  });

  it("covers every requested trunk function and assigns an owner", () => {
    expect(data.functionalCoverage.map((row) => row.function)).toEqual([
      "Breathing / ribcage-pelvis position",
      "Anti-extension",
      "Anti-rotation",
      "Anti-lateral flexion",
      "Controlled flexion / abdominal shortening",
      "Controlled rotation",
      "Loaded bracing",
      "Loaded gait / carries",
      "Posterior-trunk contribution",
    ]);
    expect(data.functionalCoverage.every((row) => row.recommendedOwner.length > 0)).toBe(true);
  });

  it("preserves legacy domain knowledge without migrating legacy inference policy", () => {
    const counts = Object.fromEntries(
      [
        "PRESERVE_AS_DOMAIN_KNOWLEDGE",
        "PRESERVE_AFTER_REVIEW",
        "REDUNDANT",
        "QUESTIONABLE",
        "DO_NOT_MIGRATE",
      ].map((classification) => [
        classification,
        data.legacyDecisions.filter((row) => row.classification === classification).length,
      ]),
    );

    expect(counts).toEqual({
      PRESERVE_AS_DOMAIN_KNOWLEDGE: 5,
      PRESERVE_AFTER_REVIEW: 5,
      REDUNDANT: 2,
      QUESTIONABLE: 3,
      DO_NOT_MIGRATE: 3,
    });
    expect(
      data.legacyDecisions.find((row) => row.concept.includes("Name/tag/prose sniffing")),
    ).toEqual(expect.objectContaining({ classification: "DO_NOT_MIGRATE" }));
  });

  it("selects the compact Option B contract without splitting trunk", () => {
    expect(data.decisions).toEqual({
      muscleGroup: "KEEP_TRUNK_UMBRELLA",
      bodyRegion: "ABDOMINAL_WALL_USEFUL_LATER",
      movementRolesToAdd: [
        "anti_lateral_flexion_core",
        "trunk_flexion",
        "trunk_rotation",
        "loaded_bracing",
      ],
      architectureOption: "B",
      assessmentTiming: "BEFORE_SESSION_COMPOSER",
      carryDoctrine: "FIRST_CLASS_CAPACITY_TRUNK_GAIT_NOT_MANDATORY_FINISHER",
    });
    expect(data.architectureOptions.find((option) => option.option === "B")?.verdict).toBe(
      "RECOMMENDED",
    );
  });

  it("records owner acceptance and the next pre-Composer implementation boundary", () => {
    expect(data.classification).toBe("TRUNK_CORE_CONTRACT_READY_FOR_OWNER_DECISION");
    expect(data.implementationStatus).toBe("FIRST_TRUNK_PROFILE_TRANCHE_IMPLEMENTED");
    expect(data.implementationOrder).toHaveLength(11);
    expect(data.implementationOrder.slice(0, 4).every((step) => step.startsWith("COMPLETED:")))
      .toBe(true);
    expect(data.implementationOrder[4]).toContain(
      "TRUNK_CARRY_CONTRACT_FIXES_REQUIRED",
    );
    expect(data.implementationOrder[5]).toContain(
      "TRUNK_CARRY_EQUIPMENT_CONTRACT_READY",
    );
    expect(data.implementationOrder[6]).toContain(
      "STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY",
    );
    expect(data.implementationOrder[7]).toContain(
      "pain-stress vocabulary and receiver review",
    );
    expect(data.implementationOrder.at(-1)).toContain("before Session Composer");
    expect(data.uncertainties).toHaveLength(7);
  });

  it("renders the deterministic complete report", () => {
    const rendered = renderTrunkCoreDomainReview(data);
    expect(rendered).toContain("## Current Inventory and Receivers");
    expect(rendered).toContain("## Current Catalog: Direct and Meaningful Secondary Exposure");
    expect(rendered).toContain("## Protected Legacy Knowledge Review");
    expect(rendered).toContain("## Owner-Accepted Contract Implementation");
    expect(rendered).toContain(
      "## First Tranche Owner Approval and Implementation",
    );
    expect(rendered).toContain(
      "## Minimal Direct Trunk / Carry Catalog Proposal Status",
    );
    expect(rendered).toContain("TRUNK_CARRY_EQUIPMENT_CONTRACT_READY");
    expect(rendered).toContain("15 `PROPOSE_ACCEPTED`");
    expect(rendered).toContain("ten accepted fields and fourteen explicit unknowns");
    expect(rendered).toContain("all 17 needs-review proposals remain unresolved");
    expect(rendered).toContain("Five accepted secondary/support judgments");
    expect(rendered).toContain(
      "TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche",
    );
    expect(rendered).toContain("## Weekly Development Ledger Handoff");
    expect(rendered).toContain("**TRUNK_CORE_CONTRACT_READY_FOR_OWNER_DECISION**");
    expect(rendered).toContain("**FIRST_TRUNK_PROFILE_TRANCHE_IMPLEMENTED**");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
