import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
} from "../../src";
import {
  CURATED_TRUNK_CARRY_IDS,
  DEFERRED_TRUNK_CARRY_IDS,
  PRODUCTION_CATALOG_IMPLEMENTATION_READINESS,
  SEVEN_EXERCISE_TRUNK_CARRY_CURATION_CLASSIFICATION,
  buildSevenExerciseTrunkCarryCurationData,
  renderSevenExerciseTrunkCarryCurationReport,
} from "../helpers/sevenExerciseTrunkCarryCuration";

const data = buildSevenExerciseTrunkCarryCurationData();

function exercise(id: string) {
  const found = data.exercises.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing curated exercise ${id}`);
  }
  return found;
}

describe("seven exercise trunk/carry curation review", () => {
  it("renders a deterministic checked-in owner curation artifact", () => {
    const second = buildSevenExerciseTrunkCarryCurationData();
    const rendered = renderSevenExerciseTrunkCarryCurationReport(data);

    expect(second).toEqual(data);
    expect(renderSevenExerciseTrunkCarryCurationReport(second)).toBe(rendered);
    expect(data.classification).toBe(
      SEVEN_EXERCISE_TRUNK_CARRY_CURATION_CLASSIFICATION,
    );
    expect(data.productionReadiness).toBe(PRODUCTION_CATALOG_IMPLEMENTATION_READINESS);
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/SEVEN_EXERCISE_TRUNK_CARRY_CURATION.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });

  it("curates exactly the seven implemented identities without deferred exercises", () => {
    expect(data.exercises.map((candidate) => candidate.id)).toEqual([
      ...CURATED_TRUNK_CARRY_IDS,
    ]);
    expect(new Set(data.exercises.map((candidate) => candidate.id)).size).toBe(7);
    expect(REFERENCE_EXERCISES.map((candidate) => candidate.id)).toEqual(
      expect.arrayContaining([...CURATED_TRUNK_CARRY_IDS]),
    );
    expect(data.exercises.map((candidate) => candidate.id)).not.toEqual(
      expect.arrayContaining([...DEFERRED_TRUNK_CARRY_IDS]),
    );
  });

  it("provides a complete proposed contract for every exercise", () => {
    for (const candidate of data.exercises) {
      expect(candidate.displayName).toBeTruthy();
      expect(candidate.summary).toBeTruthy();
      expect(candidate.family).toBeTruthy();
      expect(candidate.movementRoles.length).toBeGreaterThan(0);
      expect(candidate.trainingRoles.length).toBeGreaterThan(0);
      expect(candidate.sectionSuitability.length).toBeGreaterThan(0);
      expect(candidate.primaryMuscles.length).toBeGreaterThan(0);
      expect(candidate.bodyRegions.length).toBeGreaterThan(0);
      expect(candidate.equipment.length).toBeGreaterThan(0);
      expect(candidate.genericDemands).toHaveLength(6);
      expect(candidate.trunkMechanics).toHaveLength(8);
      expect(candidate.structuredStress.length).toBeGreaterThan(0);
      expect(candidate.progressionAxes.length).toBeGreaterThan(0);
      expect(candidate.responseSensitiveModificationPossibilities.length).toBeGreaterThan(0);
      expect(candidate.prescriptionModes.length).toBeGreaterThan(0);
      expect(candidate.executionStandardNeeds.length).toBeGreaterThan(0);
      expect(candidate.phaseContext.productionImplementationPhaseStatus)
        .toBe("OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED");
      expect(candidate.provenance.length).toBeGreaterThan(0);
    }
  });

  it("requires provenance for every accepted non-unknown mechanics claim and preserves unknown", () => {
    for (const candidate of data.exercises) {
      for (const field of candidate.trunkMechanics) {
        if (field.reviewStatus === "accepted" && field.level !== "unknown") {
          expect(field.provenance.length).toBeGreaterThan(0);
          expect(field.evidenceCluster).not.toBe("not-reviewed-for-this-identity");
        }
        if (field.level === "unknown") {
          expect(field.reviewStatus).toBe("needs_review");
          expect(field.provenance).toEqual([]);
          expect(field.claim).toBe("No accepted curation claim.");
        }
      }
    }
  });

  it("keeps role truth, mechanics, and pain stress in separate lanes", () => {
    expect(exercise("forearm-plank").movementRoles).toEqual(["anti_extension_core"]);
    expect(exercise("forearm-plank").movementRoles).not.toContain("loaded_bracing");
    expect(exercise("forearm-side-plank").movementRoles).toEqual([
      "anti_lateral_flexion_core",
    ]);
    expect(exercise("forearm-side-plank").movementRoles).not.toContain("carry");
    expect(exercise("half-kneeling-high-to-low-cable-chop").movementRoles)
      .toEqual(["trunk_rotation"]);
    expect(exercise("half-kneeling-high-to-low-cable-chop").movementRoles)
      .not.toContain("anti_rotation_core");
    expect(
      exercise("forearm-plank").structuredStress.map((stress) => stress.tag),
    ).not.toContain("loaded_bracing" as never);
  });

  it("keeps side, lever, support, and distance boundaries explicit", () => {
    expect(
      exercise("forearm-plank").identity.prescriptionChangesSameIdentity,
    ).toEqual(expect.arrayContaining(["knee-supported variant"]));
    expect(exercise("forearm-plank").identity.newExerciseIdRequired)
      .toContain("long-lever plank if owner wants separate row");
    expect(
      exercise("forearm-side-plank").identity.prescriptionChangesSameIdentity,
    ).toContain("bent-knee support");
    expect(
      exercise("forearm-side-plank").structuredStress.find(
        (stress) => stress.tag === "lateral_trunk_loading",
      )?.sideScope,
    ).toBe("prescription_side");
    expect(exercise("wall-supported-suitcase-march").equipment)
      .not.toContain("loaded_gait_space");
    expect(exercise("wall-supported-suitcase-march").prescriptionModes)
      .toEqual(["step_march"]);
    expect(exercise("wall-supported-suitcase-march").structuredStress.map((stress) => stress.tag))
      .not.toContain("loaded_gait");
    expect(exercise("wall-supported-suitcase-march").progressionAxes)
      .not.toContain("distance");
    expect(exercise("half-kneeling-high-to-low-cable-chop").supportMechanics.basePosition)
      .toBe("half_kneeling");
    expect(exercise("half-kneeling-high-to-low-cable-chop").supportMechanics.stance)
      .toBe("half_kneeling_lead_side");
    expect(exercise("half-kneeling-high-to-low-cable-chop").supportMechanics.notes)
      .toContain("not body support");
  });

  it("records binding owner decisions and tightens wall-supported march", () => {
    expect(data.ownerDecisions.map((row) => row.decision)).toEqual([
      "Knee-supported forearm plank is approved as a same-exercise prescription/support/lever variant of `forearm-plank`.",
      "Bent-knee forearm side plank is approved as a same-exercise variant of `forearm-side-plank`.",
      "Approved production identities are `forearm-plank`, `forearm-side-plank`, `machine-abdominal-crunch`, `half-kneeling-high-to-low-cable-chop`, `farmer-carry`, and `suitcase-carry`.",
      "`wall-supported-suitcase-march` must not satisfy `carry` in the first production implementation.",
      "`wall-supported-suitcase-march` must not receive hard `anti_lateral_flexion_core` yet.",
      "`wall-supported-suitcase-march` proposed movement role is `loaded_bracing`; proposed training roles are `activation` and `capacity`; sections are `activation` and `accessory` as appropriate.",
    ]);

    const wallMarch = exercise("wall-supported-suitcase-march");
    expect(wallMarch.finalVerdict).toBe("READY_FOR_OWNER_APPROVAL");
    expect(wallMarch.movementRoles).toEqual(["loaded_bracing"]);
    expect(wallMarch.movementRoles).not.toContain("carry");
    expect(wallMarch.movementRoles).not.toContain("anti_lateral_flexion_core");
    expect(wallMarch.trainingRoles).toEqual(["activation", "capacity"]);
    expect(wallMarch.sectionSuitability).toEqual(["activation", "accessory"]);
    expect(wallMarch.candidatePoolEffect.requestedMovementRoles).toEqual([
      "loaded_bracing",
    ]);
    expect(wallMarch.structuredStress.find((stress) =>
      stress.tag === "lateral_trunk_loading"
    )).toEqual(expect.objectContaining({
      exposureScope: "prescription_modifiable",
      reviewStatus: "needs_review",
    }));
  });

  it("does not make carries statically heavy, mandatory, or universally transitional", () => {
    for (const id of ["farmer-carry", "suitcase-carry"] as const) {
      const candidate = exercise(id);
      expect(candidate.legacyStressRecommendation.jointStressTags)
        .not.toEqual(expect.arrayContaining(["grip_intensive", "heavy_axial_loading"]));
      expect(candidate.structuredStress.find((stress) => stress.tag === "grip_intensive")
        ?.exposureScope).toBe("dose_created");
      expect(candidate.structuredStress.find((stress) => stress.tag === "heavy_axial_loading")
        ?.exposureScope).toBe("dose_created");
      expect(candidate.marginalValue.doNotAddWhen).toBeTruthy();
      expect(candidate.marginalValue.redundancyRisk).toMatch(/not|Should not|crowd/i);
    }

    const allTransitions = data.exercises.flatMap((candidate) =>
      candidate.transitionRelationships,
    );
    expect(allTransitions.every((transition) =>
      transition.automaticSelectionEffect === "none"
    )).toBe(true);
    expect(allTransitions.some((transition) => transition.classification === "context_dependent"))
      .toBe(true);
    expect(allTransitions).toHaveLength(7);
  });

  it("reports phase uncertainty, candidate-pool effects, and no fake phase values", () => {
    for (const candidate of data.exercises) {
      expect(candidate.phaseContext.currentGlobalPhaseValueTruthful).toBe("no");
      expect(candidate.phaseContext.acceptedPhaseEvidenceAvailable).toBe("yes");
      expect(candidate.phaseContext.unknown).toBe("yes");
      expect(candidate.candidatePoolEffect.genuineDiversity).toBeTruthy();
    }
    expect(exercise("machine-abdominal-crunch").candidatePoolEffect.createsNewBootstrapRole)
      .toBe(true);
    expect(exercise("half-kneeling-high-to-low-cable-chop").candidatePoolEffect.requestedMovementRoles)
      .toEqual(["trunk_rotation"]);
  });

  it("preserves current behavior fingerprints", () => {
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

  it("covers personas, resolved owner questions, external evidence, blockers, and roadmap handoff", () => {
    for (const candidate of data.exercises) {
      expect(candidate.personaReview).toHaveLength(10);
      expect(candidate.trunkMechanics.every(
        (field) => field.externalPrimaryEvidenceStatus === "EXTERNAL_REFERENCE_PENDING",
      )).toBe(true);
    }
    expect(data.ownerQuestions).toHaveLength(0);
    expect(data.productionBlockers).toEqual([]);
    expect(data.wholeBodyRoadmapHandoff).toContain(
      "WHOLE_BODY_EXERCISE_KNOWLEDGE_AND_CANDIDATE_POOL_AUDIT",
    );
    expect(data.wholeBodyRoadmapHandoff).toContain("forearm/grip");
    expect(data.wholeBodyRoadmapHandoff).toContain("hip-flexor");
  });
});
