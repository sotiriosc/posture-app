import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
} from "../helpers/trunkMechanicsCurationProposal";
import {
  PROPOSED_TRUNK_CARRY_CANDIDATE_IDS,
  SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE,
  buildMinimalTrunkCarryCatalogProposalData,
  renderMinimalTrunkCarryCatalogProposal,
  type MechanicsProposal,
  type ProposedExerciseContract,
} from "../helpers/minimalTrunkCarryCatalogProposal";

const data = buildMinimalTrunkCarryCatalogProposalData();

function candidate(candidateId: string): ProposedExerciseContract {
  const row = data.candidates.find((candidateRow) => candidateRow.id === candidateId);
  if (!row) {
    throw new Error(`Missing proposal candidate ${candidateId}.`);
  }
  return row;
}

function nonUnknownMechanics(
  candidateRow: ProposedExerciseContract,
): readonly MechanicsProposal[] {
  return [
    ...Object.values(candidateRow.genericDemands),
    ...Object.values(candidateRow.trunkMechanicsProfile),
  ].filter((proposal) => proposal.level !== "unknown");
}

describe("minimal direct trunk/core and carry catalog proposal", () => {
  it("considers each of the 24 requested candidate concepts exactly once", () => {
    expect(data.candidates).toHaveLength(24);
    expect(data.candidates.map((candidateRow) => candidateRow.id)).toEqual([
      ...PROPOSED_TRUNK_CARRY_CANDIDATE_IDS,
    ]);
    expect(new Set(data.candidates.map((candidateRow) => candidateRow.id)).size).toBe(24);
  });

  it("selects exactly the seven-candidate minimal tranche", () => {
    const selectedIds = data.candidates
      .filter(
        (candidateRow) =>
          candidateRow.disposition === "SELECTED_FOR_FIRST_IMPLEMENTATION",
      )
      .map((candidateRow) => candidateRow.id);

    expect(selectedIds).toHaveLength(SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE.length);
    expect(selectedIds).toEqual(
      expect.arrayContaining([...SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE]),
    );
    expect(data.selectedRationales.map((rationale) => rationale.candidateId)).toEqual([
      ...SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE,
    ]);
  });

  it("addresses every requested missing function or keeps it explicitly unresolved", () => {
    expect(data.requiredGapCoverage.map((coverage) => coverage.gap)).toEqual([
      "later anti-extension progression beyond Dead Bug",
      "externally loadable dynamic anti-extension",
      "anti-lateral flexion",
      "controlled trunk flexion / abdominal shortening",
      "controlled trunk rotation",
      "loaded bracing as intentional selection purpose",
      "bilateral carry",
      "unilateral carry",
      "supported/static/march carry-family regression",
      "capacity-role trunk/gait work",
    ]);
    expect(
      data.requiredGapCoverage.every(
        (coverage) =>
          coverage.status === "ADDRESSED_BY_SELECTED_TRANCHE" ||
          coverage.status === "EXPLICITLY_UNRESOLVED",
      ),
    ).toBe(true);
    expect(
      data.requiredGapCoverage.filter(
        (coverage) => coverage.status === "EXPLICITLY_UNRESOLVED",
      ),
    ).toEqual([
      expect.objectContaining({
        gap: "externally loadable dynamic anti-extension",
        candidates: ["stability-ball-rollout", "ab-wheel-rollout", "barbell-rollout"],
      }),
    ]);
  });

  it("gives every selected candidate a complete proposal contract", () => {
    for (const candidateId of SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE) {
      const row = candidate(candidateId);

      expect(row.displayName.trim()).not.toBe("");
      expect(row.exerciseFamily.trim()).not.toBe("");
      expect(row.movementRoles.length).toBeGreaterThan(0);
      expect(row.trainingRoles.length).toBeGreaterThan(0);
      expect(row.primaryMuscles.length).toBeGreaterThan(0);
      expect(row.bodyRegions.length).toBeGreaterThan(0);
      expect(row.equipment.requiredEquipment.length).toBeGreaterThan(0);
      expect(row.equipment.setupCapability.trim()).not.toBe("");
      expect(row.equipment.spaceRequirement.trim()).not.toBe("");
      expect(row.equipment.anchorRequirement.trim()).not.toBe("");
      expect(row.equipment.loadRangeRequirement.trim()).not.toBe("");
      expect(row.equipment.supportRequirement.trim()).not.toBe("");
      expect(row.equipment.currentDomainSupport.trim()).not.toBe("");
      expect(row.equipment.contractGap.trim()).not.toBe("");
      expect(row.prerequisites.length).toBeGreaterThan(0);
      expect(Object.keys(row.genericDemands).length).toBeGreaterThan(0);
      expect(Object.keys(row.trunkMechanicsProfile)).toEqual([
        ...TRUNK_MECHANICS_FUNCTIONS,
      ]);
      expect(row.progressionAxes.length).toBeGreaterThan(0);
      expect(row.prescription.requiredUnits.length).toBeGreaterThan(0);
      expect(row.phaseContextNeeds.trim()).not.toBe("");
      expect(row.provenancePlan.length).toBeGreaterThan(0);
      expect(row.ledgerHandoff.doubleCreditControl).toContain(
        "one source exposure event",
      );
    }
  });

  it("keeps movement-role truth separate from mechanics expression", () => {
    const sidePlank = candidate("side-plank");
    const farmerCarry = candidate("farmer-carry");
    const suitcaseCarry = candidate("suitcase-carry");

    expect(sidePlank.movementRoles).toEqual(["anti_lateral_flexion_core"]);
    expect(sidePlank.movementRoles).not.toContain("carry");
    expect(sidePlank.trunkMechanicsProfile.antiLateralFlexionContribution.level).toBe(
      "high",
    );

    expect(farmerCarry.movementRoles).toEqual(["carry", "loaded_bracing"]);
    expect(farmerCarry.movementRoles).not.toContain("anti_lateral_flexion_core");
    expect(
      farmerCarry.trunkMechanicsProfile.antiLateralFlexionContribution.level,
    ).toBe("moderate");

    expect(suitcaseCarry.movementRoles).toEqual([
      "carry",
      "anti_lateral_flexion_core",
      "loaded_bracing",
    ]);
  });

  it("keeps anti-rotation and controlled rotation distinct", () => {
    const chop = candidate("half-kneeling-cable-chop");
    const pallof = REFERENCE_EXERCISES.find(
      (exercise) => exercise.id === "pallof-press",
    );

    expect(chop.movementRoles).toEqual(["trunk_rotation"]);
    expect(chop.movementRoles).not.toContain("anti_rotation_core");
    expect(chop.trunkMechanicsProfile.controlledRotationContribution.level).toBe(
      "high",
    );
    expect(chop.trunkMechanicsProfile.antiRotationContribution.level).toBe(
      "unknown",
    );
    expect(pallof?.movementRoles).toEqual(["anti_rotation_core"]);
    expect(
      pallof?.mechanics?.trunkMechanics?.antiRotationContribution.level,
    ).toBe("high");
    expect(
      pallof?.mechanics?.trunkMechanics?.controlledRotationContribution.level,
    ).toBe("none");
  });

  it("keeps carry and anti-lateral-flexion purposes distinct", () => {
    expect(candidate("side-plank").movementRoles).not.toContain("carry");
    expect(candidate("farmer-carry").movementRoles).not.toContain(
      "anti_lateral_flexion_core",
    );
    expect(candidate("suitcase-carry").movementRoles).toEqual(
      expect.arrayContaining(["carry", "anti_lateral_flexion_core"]),
    );
    expect(data.roleMechanicsDoctrine).toContain(
      "MovementRole is reviewed selection-purpose truth; a mechanics level cannot grant a role.",
    );
  });

  it("defines shared-evidence clusters and one-source rules for every multi-function proposal", () => {
    const multiFunctionCandidates = data.candidates.filter(
      (candidateRow) => candidateRow.multiFunctionCredit !== undefined,
    );

    expect(multiFunctionCandidates.length).toBeGreaterThan(0);
    for (const row of multiFunctionCandidates) {
      expect(row.multiFunctionCredit?.primaryTrainingPurpose.trim()).not.toBe("");
      expect(row.multiFunctionCredit?.sharedEvidenceClusters.length).toBeGreaterThan(0);
      expect(row.multiFunctionCredit?.doubleCreditRisk.trim()).not.toBe("");
      expect(row.multiFunctionCredit?.futureLedgerRule).toContain(
        "one source exposure event",
      );
    }

    for (const row of data.candidates.filter(
      (candidateRow) => candidateRow.movementRoles.length > 1,
    )) {
      expect(row.multiFunctionCredit).toBeDefined();
    }
  });

  it("gives every non-unknown mechanics proposal a non-circular provenance plan", () => {
    for (const row of data.candidates) {
      expect(row.provenancePlan.length).toBeGreaterThan(0);
      expect(row.provenancePlan.join(" ")).not.toContain(
        "MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL",
      );

      for (const proposal of nonUnknownMechanics(row)) {
        expect(proposal.reviewStatus).toBe(
          "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
        );
        expect(proposal.sourceRef).toMatch(
          new RegExp(`^pending-owner-review:minimal-trunk-carry:${row.id}\\.`),
        );
        expect(proposal.sourceRef).not.toContain("referenceExercises.ts");
        expect(proposal.sourceRef).not.toContain(
          "MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL",
        );
        expect(proposal.evidenceBasis.length).toBeGreaterThan(0);
      }
    }
  });

  it("never selects candidates from ID, name, tag, prose, or legacy inference", () => {
    for (const row of data.candidates) {
      expect(row.selectionBasis).toBe("EXACT_MOVEMENT_DEFINITION_AND_REVIEW");
    }
    expect(data.rejectedLegacyPolicies).toContain(
      "REJECT name, ID, tag, and coaching-prose sniffing as mechanical or role authority.",
    );
    expect(data.rejectedLegacyPolicies).toContain(
      "REJECT difficulty tier as exercise-science proof.",
    );
  });

  it("leaves the production reference catalog and profile tranche unchanged", () => {
    expect(REFERENCE_EXERCISES).toHaveLength(30);
    expect(
      REFERENCE_EXERCISES.filter(
        (exercise) => exercise.mechanics?.trunkMechanics !== undefined,
      ).map((exercise) => exercise.id),
    ).toEqual(["ninety-ninety-breathing", "dead-bug", "pallof-press"]);
    expect(
      REFERENCE_EXERCISES.some((exercise) =>
        PROPOSED_TRUNK_CARRY_CANDIDATE_IDS.some(
          (candidateId) => candidateId === exercise.id,
        ),
      ),
    ).toBe(false);
    expect(data.behaviorBoundary.referenceCatalogMatches).toBe(true);
    expect(data.behaviorBoundary.referenceCatalogFingerprint).toBe(
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    );
  });

  it("preserves ranking and comprehensive behavior fingerprints", () => {
    expect(data.behaviorBoundary.rankingMatches).toBe(true);
    expect(data.behaviorBoundary.rankingFingerprint).toBe(
      CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    );
    expect(data.behaviorBoundary.comprehensiveBehaviorMatches).toBe(true);
    expect(data.behaviorBoundary.comprehensiveBehaviorFingerprint).toBe(
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    );
  });

  it("matches the checked-in deterministic proposal report", () => {
    const rendered = renderMinimalTrunkCarryCatalogProposal(data);

    expect(rendered).toContain("## Complete Proposed Exercise Contracts");
    expect(rendered).toContain("## Assessment Handoff");
    expect(rendered).toContain("## Weekly Development Ledger Handoff");
    expect(rendered).toContain("**TRUNK_CARRY_CONTRACT_FIXES_REQUIRED**");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
