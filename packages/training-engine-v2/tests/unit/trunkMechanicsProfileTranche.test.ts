import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
  buildExerciseTransitionTraces,
  buildTrunkMechanicsTrace,
  evaluateHardEligibility,
  validateTrunkMechanicsProfile,
  type ExerciseDefinition,
  type TrunkMechanicsFunction,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
  stripPrescriptionKnowledgeFromCatalog,
  stripTrunkMechanicsFromCatalog,
} from "../helpers/trunkMechanicsCurationProposal";
import {
  APPROVED_FIRST_TRANCHE_DECISIONS,
  APPROVED_TRUNK_PROFILE_EXERCISE_IDS,
  DEFERRED_ACCEPTED_TRUNK_DECISIONS,
  FIRST_TRANCHE_UNKNOWN_FIELDS,
  TRUNK_MECHANICS_OWNER_DECISION_REF,
  UNRESOLVED_NEEDS_REVIEW_PROPOSALS,
  renderTrunkMechanicsOwnerDecisions,
} from "../helpers/trunkMechanicsOwnerDecisions";

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing reference exercise ${id}.`);
  return found;
}

function annotation(
  exerciseId: string,
  functionName: TrunkMechanicsFunction,
) {
  const profile = exercise(exerciseId).mechanics?.trunkMechanics;
  if (!profile) throw new Error(`Missing approved trunk profile ${exerciseId}.`);
  return profile[functionName];
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

describe("approved first trunk mechanics profile tranche", () => {
  it("preserves the first three profiles alongside the seven approved production profiles", () => {
    const profiledIds = REFERENCE_EXERCISES.filter(
      (candidate) => candidate.mechanics?.trunkMechanics !== undefined,
    ).map((candidate) => candidate.id);

    expect(profiledIds).toEqual(expect.arrayContaining([
      "ninety-ninety-breathing",
      "dead-bug",
      "pallof-press",
    ]));
    expect(profiledIds).toHaveLength(10);
    for (const candidate of REFERENCE_EXERCISES) {
      if (APPROVED_TRUNK_PROFILE_EXERCISE_IDS.some((exerciseId) => exerciseId === candidate.id)) {
        expect(Object.hasOwn(candidate.mechanics ?? {}, "trunkMechanics")).toBe(true);
      }
    }
  });

  it("validates every complete production profile", () => {
    for (const exerciseId of APPROVED_TRUNK_PROFILE_EXERCISE_IDS) {
      const profile = exercise(exerciseId).mechanics?.trunkMechanics;
      expect(profile).toBeDefined();
      expect(validateTrunkMechanicsProfile(profile!, exerciseId)).toEqual([]);
      expect(Object.keys(profile!)).toEqual([...TRUNK_MECHANICS_FUNCTIONS]);
    }
  });

  it("implements exactly the ten accepted owner decisions", () => {
    expect(APPROVED_FIRST_TRANCHE_DECISIONS).toHaveLength(10);

    for (const decision of APPROVED_FIRST_TRANCHE_DECISIONS) {
      const actual = annotation(decision.exerciseId, decision.function);
      expect(actual).toEqual(
        expect.objectContaining({
          level: decision.level,
          reviewStatus: "accepted",
          source: "human_exercise_science_review",
        }),
      );
      expect(actual.provenance).toEqual([
        {
          sourceRef: TRUNK_MECHANICS_OWNER_DECISION_REF,
          evidenceBasis: decision.evidenceBasis,
        },
      ]);
      expect(actual.notes.trim().length).toBeGreaterThan(0);
    }

    const actualAccepted = APPROVED_TRUNK_PROFILE_EXERCISE_IDS.flatMap(
      (exerciseId) => {
        const profile = exercise(exerciseId).mechanics!.trunkMechanics!;
        return TRUNK_MECHANICS_FUNCTIONS.filter(
          (functionName) => profile[functionName].reviewStatus === "accepted",
        ).map((functionName) => `${exerciseId}:${functionName}`);
      },
    );
    expect(actualAccepted).toEqual(
      APPROVED_FIRST_TRANCHE_DECISIONS.map(
        (decision) => `${decision.exerciseId}:${decision.function}`,
      ),
    );
  });

  it("keeps the other fourteen first-tranche fields explicitly unknown", () => {
    expect(FIRST_TRANCHE_UNKNOWN_FIELDS).toHaveLength(14);

    for (const decision of FIRST_TRANCHE_UNKNOWN_FIELDS) {
      const actual = annotation(decision.exerciseId, decision.function);
      expect(actual).toEqual(
        expect.objectContaining({
          level: "unknown",
          reviewStatus: "needs_review",
          source: "unknown",
          provenance: [],
        }),
      );
      expect(actual.notes.trim().length).toBeGreaterThan(0);
    }

    const actualUnknown = APPROVED_TRUNK_PROFILE_EXERCISE_IDS.flatMap(
      (exerciseId) => {
        const profile = exercise(exerciseId).mechanics!.trunkMechanics!;
        return TRUNK_MECHANICS_FUNCTIONS.filter(
          (functionName) => profile[functionName].level === "unknown",
        ).map((functionName) => `${exerciseId}:${functionName}`);
      },
    );
    expect(actualUnknown).toEqual(
      FIRST_TRANCHE_UNKNOWN_FIELDS.map(
        (decision) => `${decision.exerciseId}:${decision.function}`,
      ),
    );
  });

  it("does not silently implement any needs-review proposal", () => {
    expect(UNRESOLVED_NEEDS_REVIEW_PROPOSALS).toHaveLength(17);
    expect(
      annotation("dead-bug", "breathingPressureCoordination").level,
    ).toBe("unknown");
    expect(
      annotation("pallof-press", "antiLateralFlexionContribution").level,
    ).toBe("unknown");
    expect(
      annotation("pallof-press", "loadedBracingContribution").level,
    ).toBe("unknown");

    for (const proposal of UNRESOLVED_NEEDS_REVIEW_PROPOSALS) {
      const currentProfile = exercise(proposal.exerciseId).mechanics?.trunkMechanics;
      if (currentProfile) {
        expect(currentProfile[proposal.function].level).not.toBe(
          proposal.proposedLevel,
        );
      }
    }
  });

  it("keeps every accepted secondary or supported decision deferred", () => {
    expect(DEFERRED_ACCEPTED_TRUNK_DECISIONS).toHaveLength(5);
    for (const decision of DEFERRED_ACCEPTED_TRUNK_DECISIONS) {
      expect(exercise(decision.exerciseId).mechanics?.trunkMechanics).toBeUndefined();
    }
  });

  it("reproduces every production annotation exactly in TrunkMechanicsTrace", () => {
    for (const exerciseId of APPROVED_TRUNK_PROFILE_EXERCISE_IDS) {
      const candidate = exercise(exerciseId);
      const trace = buildTrunkMechanicsTrace(candidate);

      expect(trace.exerciseId).toBe(exerciseId);
      expect(trace.profilePresent).toBe(true);
      expect(trace.functions).toEqual(candidate.mechanics?.trunkMechanics);
    }
  });

  it("does not let a profile grant loaded-bracing movement-role eligibility", () => {
    for (const exerciseId of APPROVED_TRUNK_PROFILE_EXERCISE_IDS) {
      const candidate = exercise(exerciseId);
      const requestedSection = Object.keys(candidate.sectionSuitability)[0];
      if (!requestedSection) throw new Error(`${exerciseId} has no legal section.`);

      const eligibility = evaluateHardEligibility(candidate, {
        equipment: FULL_GYM_EQUIPMENT,
        painAndInjury: NO_PAIN_OR_INJURY,
        assessment: { signals: [], historicalWeaknesses: [] },
        requestedRole: candidate.trainingRoles[0]!,
        requestedSection: requestedSection as keyof typeof candidate.sectionSuitability,
        targetMovementRoles: ["loaded_bracing"],
        targetMuscles: ["trunk"],
        satisfiedPrerequisiteIds: [],
      });

      expect(candidate.movementRoles).not.toContain("loaded_bracing");
      expect(eligibility.legal).toBe(false);
      expect(eligibility.rejectionReasons.map((reason) => reason.code)).toContain(
        "MOVEMENT_ROLE_MISMATCH",
      );
    }
  });

  it("changes only mechanics.trunkMechanics in the pre-prescription catalog projection", () => {
    const prePrescription = stripPrescriptionKnowledgeFromCatalog(REFERENCE_EXERCISES);
    const stripped = stripPrescriptionKnowledgeFromCatalog(
      stripTrunkMechanicsFromCatalog(REFERENCE_EXERCISES),
    );

    expect(hash(prePrescription)).toBe(
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    );
    expect(hash(stripped)).toBe(CAPTURED_REFERENCE_CATALOG_FINGERPRINT);
    expect(
      stripped.every(
        (candidate) => candidate.mechanics?.trunkMechanics === undefined,
      ),
    ).toBe(true);
  });

  it("preserves ranking and comprehensive controlled behavior deterministically", () => {
    const first = buildCurrentTrunkCurationFingerprints();
    const second = buildCurrentTrunkCurationFingerprints();

    expect(first).toEqual(second);
    expect(first.productionRanking).toBe(
      CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    );
    expect(first.comprehensiveBehavior).toBe(
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    );
    expect(first.referenceCatalog).toBe(
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    );
    expect(first.referenceCatalogWithoutTrunkMechanics).toBe(
      CAPTURED_REFERENCE_CATALOG_FINGERPRINT,
    );
  });

  it("preserves transition non-selection semantics", () => {
    const traces = REFERENCE_EXERCISES.flatMap((candidate) =>
      buildExerciseTransitionTraces(candidate, REFERENCE_EXERCISES),
    );

    expect(traces.length).toBeGreaterThan(0);
    expect(
      traces.every((trace) => trace.automaticSelectionEffect === "none"),
    ).toBe(true);
  });

  it("matches the checked-in owner-decision artifact", () => {
    const rendered = renderTrunkMechanicsOwnerDecisions();
    expect(rendered).toContain("# Approved First Tranche");
    expect(rendered).toContain("Accepted production fields: 10");
    expect(rendered).toContain("Unknown production fields: 14");
    expect(rendered).toContain("No `PROPOSE_NEEDS_REVIEW` value is promoted");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
