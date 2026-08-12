import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BODY_REGIONS,
  CONTROLLED_CANDIDATE_SCENARIOS,
  FULL_GYM_EQUIPMENT,
  MOVEMENT_ROLES,
  MUSCLE_GROUPS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
  buildExerciseTransitionTraces,
  buildTrunkMechanicsTrace,
  evaluateHardEligibility,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  validateExerciseDefinition,
  validateTrunkMechanicsProfile,
  type CandidateRankingResult,
  type ExerciseDefinition,
  type MovementRole,
  type TrunkFunctionAnnotation,
  type TrunkFunctionLevel,
  type TrunkMechanicsFunction,
  type TrunkMechanicsProfile,
} from "../../src";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
const EXPECTED_COMPREHENSIVE_CONTRACT_FINGERPRINT =
  "2553739b6ce4aef79500e6e786d279332470fb176079d17b3e9a594bdd463a02";
const NEW_TRUNK_ROLES = [
  "anti_lateral_flexion_core",
  "trunk_flexion",
  "trunk_rotation",
  "loaded_bracing",
] as const satisfies readonly MovementRole[];

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing reference exercise ${id}.`);
  }
  return found;
}

function annotation(
  level: TrunkFunctionLevel,
  overrides: Partial<TrunkFunctionAnnotation> = {},
): TrunkFunctionAnnotation {
  const hasKnownLevel = level !== "unknown";

  return {
    level,
    reviewStatus: hasKnownLevel ? "accepted" : "needs_review",
    source: hasKnownLevel ? "human_exercise_science_review" : "unknown",
    provenance: hasKnownLevel
      ? [
          {
            sourceRef: `test:${level}`,
            evidenceBasis: ["Synthetic reviewed evidence for contract testing."],
          },
        ]
      : [],
    notes: hasKnownLevel
      ? `Synthetic ${level} function evidence.`
      : "Function evidence remains explicitly unknown.",
    ...overrides,
  };
}

function trunkProfile(
  overrides: Partial<Record<TrunkMechanicsFunction, TrunkFunctionAnnotation>> = {},
): TrunkMechanicsProfile {
  return {
    breathingPressureCoordination: annotation("unknown"),
    antiExtensionContribution: annotation("unknown"),
    antiRotationContribution: annotation("unknown"),
    antiLateralFlexionContribution: annotation("unknown"),
    controlledFlexionContribution: annotation("unknown"),
    controlledRotationContribution: annotation("unknown"),
    loadedBracingContribution: annotation("unknown"),
    gaitLoadTransferContribution: annotation("unknown"),
    ...overrides,
  };
}

function withTrunkProfile(
  base: ExerciseDefinition,
  profile: TrunkMechanicsProfile,
): ExerciseDefinition {
  if (!base.mechanics) {
    throw new Error(`${base.id} needs an existing mechanics profile for this test.`);
  }

  return {
    ...base,
    mechanics: {
      ...base.mechanics,
      trunkMechanics: profile,
    },
  };
}

function hardEligibility(
  candidate: ExerciseDefinition,
  targetMovementRole: MovementRole,
) {
  return evaluateHardEligibility(candidate, {
    equipment: FULL_GYM_EQUIPMENT,
    painAndInjury: NO_PAIN_OR_INJURY,
    assessment: { signals: [], historicalWeaknesses: [] },
    requestedRole: "hypertrophy_accessory",
    requestedSection: "accessory",
    targetMovementRoles: [targetMovementRole],
    targetMuscles: ["trunk"],
    satisfiedPrerequisiteIds: [],
  });
}

function scenario(id: string) {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing controlled scenario ${id}.`);
  }
  return found;
}

function rankingBehavior(result: CandidateRankingResult) {
  return {
    ranked: result.rankedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components,
      painExecutionReadiness: candidate.painExecutionReadiness,
    })),
    rejected: result.hardRejectedCandidates.map((candidate) => ({
      exerciseId: candidate.exercise.id,
      reasons: candidate.eligibility.rejectionReasons,
      warnings: candidate.eligibility.warnings,
    })),
    painExecutionReadiness: result.painExecutionReadiness,
    assessmentInfluence: result.assessmentInfluence,
    alignmentPriorities: result.alignmentPriorities,
  };
}

function comprehensiveProductionFingerprint(): string {
  const rows = CONTROLLED_CANDIDATE_SCENARIOS.map((controlledScenario) => {
    const result = runCandidateRankingLab({
      ...controlledScenario.request,
      evaluationContext: { asOf: FIXED_AS_OF },
    });

    return {
      id: controlledScenario.id,
      ranked: result.rankedCandidates.map((candidate) => ({
        exerciseId: candidate.exercise.id,
        rank: candidate.rank,
        total: candidate.total,
        components: candidate.components.map((component) => ({
          id: component.id,
          rawValue: component.rawValue,
          value: component.value,
          weight: component.weight,
          weightedContribution: component.weightedContribution,
          reasonCode: component.reasonCode,
          assessmentRelevance: component.assessmentRelevance ?? null,
        })),
        painExecutionReadiness: candidate.painExecutionReadiness,
      })),
      rejected: result.hardRejectedCandidates.map((candidate) => ({
        exerciseId: candidate.exercise.id,
        codes: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
      })),
      painExecutionReadiness: result.painExecutionReadiness,
      assessmentInfluence: result.assessmentInfluence,
      alignmentPriorities: result.alignmentPriorities,
    };
  });

  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

function tsFilesUnder(directory: string): readonly string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = join(directory, entry);
    return statSync(entryPath).isDirectory()
      ? tsFilesUnder(entryPath)
      : entry.endsWith(".ts")
        ? [entryPath]
        : [];
  });
}

describe("trunk mechanics production domain contract", () => {
  it("adds all four selection-purpose movement roles without aliases or anatomy changes", () => {
    expect(MOVEMENT_ROLES).toEqual(expect.arrayContaining([...NEW_TRUNK_ROLES]));
    expect(new Set(MOVEMENT_ROLES).size).toBe(MOVEMENT_ROLES.length);
    expect(MUSCLE_GROUPS).toContain("trunk");
    expect(MUSCLE_GROUPS).not.toEqual(
      expect.arrayContaining(["abdominals", "obliques", "spinal_extensors", "abs"]),
    );
    expect(BODY_REGIONS).not.toEqual(
      expect.arrayContaining(["abdominal_wall", "abdomen"]),
    );
  });

  it("accepts a synthetic exercise carrying each new requested role", () => {
    const base = exercise("pallof-press");

    for (const role of NEW_TRUNK_ROLES) {
      const candidate: ExerciseDefinition = {
        ...base,
        id: `synthetic-${role.replaceAll("_", "-")}`,
        movementRoles: [role],
        phaseSuitabilityAnnotations: [],
      };
      const validationErrors = validateExerciseDefinition(candidate).filter(
        (finding) => finding.severity === "error",
      );

      expect(validationErrors).toEqual([]);
      expect(hardEligibility(candidate, role).legal).toBe(true);
    }
  });

  it("adds new roles only to the approved production rows", () => {
    const newRoleSet = new Set<MovementRole>(NEW_TRUNK_ROLES);

    for (const candidate of REFERENCE_EXERCISES) {
      if (candidate.movementRoles.some((role) => newRoleSet.has(role))) {
        expect(candidate.id).toEqual(expect.stringMatching(
          /^(forearm-side-plank|machine-abdominal-crunch|half-kneeling-high-to-low-cable-chop|farmer-carry|suitcase-carry|wall-supported-suitcase-march)$/,
        ));
      }
    }
    expect(
      REFERENCE_EXERCISES.filter(
        (candidate) => candidate.mechanics?.trunkMechanics !== undefined,
      ).map((candidate) => candidate.id),
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
  });

  it("requires explicit role truth even when trunk mechanics expression is high", () => {
    const base = exercise("pallof-press");
    const highBracing = withTrunkProfile(
      base,
      trunkProfile({ loadedBracingContribution: annotation("high") }),
    );
    const withoutRole = hardEligibility(highBracing, "loaded_bracing");
    const withRole = hardEligibility(
      { ...highBracing, movementRoles: [...highBracing.movementRoles, "loaded_bracing"] },
      "loaded_bracing",
    );

    expect(withoutRole.legal).toBe(false);
    expect(withoutRole.rejectionReasons.map((reason) => reason.code)).toContain(
      "MOVEMENT_ROLE_MISMATCH",
    );
    expect(withRole.legal).toBe(true);
  });

  it("validates all eight fields and accepts explicit field-level unknown", () => {
    const explicitUnknown = trunkProfile();
    const { gaitLoadTransferContribution: _omitted, ...withoutGait } = explicitUnknown;

    expect(TRUNK_MECHANICS_FUNCTIONS).toHaveLength(8);
    expect(validateTrunkMechanicsProfile(explicitUnknown, "synthetic-profile")).toEqual([]);
    expect(
      validateTrunkMechanicsProfile(
        withoutGait as TrunkMechanicsProfile,
        "synthetic-profile",
      ).map((finding) => finding.code),
    ).toContain("missing_trunk_function_annotation");
  });

  it("rejects malformed annotation levels, review states, sources, provenance, and notes", () => {
    const malformed = trunkProfile({
      antiRotationContribution: {
        level: "maximal",
        reviewStatus: "approved",
        source: "exercise_name",
        provenance: [{ sourceRef: "", evidenceBasis: [] }],
        notes: "",
      } as unknown as TrunkFunctionAnnotation,
    });
    const codes = validateTrunkMechanicsProfile(malformed).map(
      (finding) => finding.code,
    );

    expect(codes).toEqual(
      expect.arrayContaining([
        "invalid_trunk_function_level",
        "invalid_trunk_function_review_status",
        "invalid_trunk_function_source",
        "invalid_trunk_function_provenance",
        "invalid_trunk_function_notes",
      ]),
    );
  });

  it("requires structured provenance for none, low, moderate, and high", () => {
    for (const level of ["none", "low", "moderate", "high"] as const) {
      const valid = trunkProfile({ antiExtensionContribution: annotation(level) });
      const missingEvidence = trunkProfile({
        antiExtensionContribution: annotation(level, {
          source: "unknown",
          provenance: [],
        }),
      });

      expect(validateTrunkMechanicsProfile(valid)).toEqual([]);
      expect(
        validateTrunkMechanicsProfile(missingEvidence).map((finding) => finding.code),
      ).toContain("missing_trunk_function_provenance");
    }
  });

  it("does not accept confident unknown evidence without a reviewed basis", () => {
    const unsupportedAcceptedUnknown = trunkProfile({
      controlledRotationContribution: annotation("unknown", {
        reviewStatus: "accepted",
      }),
    });
    const reviewedAcceptedUnknown = trunkProfile({
      controlledRotationContribution: annotation("unknown", {
        reviewStatus: "accepted",
        source: "human_exercise_science_review",
        provenance: [
          {
            sourceRef: "review:controlled-rotation-unavailable",
            evidenceBasis: ["Reviewer confirmed that current evidence cannot classify this field."],
          },
        ],
      }),
    });

    expect(
      validateTrunkMechanicsProfile(unsupportedAcceptedUnknown).map(
        (finding) => finding.code,
      ),
    ).toContain("accepted_unknown_trunk_function_without_review_basis");
    expect(validateTrunkMechanicsProfile(reviewedAcceptedUnknown)).toEqual([]);
  });

  it("keeps none and unknown structurally distinct in the trace", () => {
    const profiled = withTrunkProfile(
      exercise("pallof-press"),
      trunkProfile({
        antiExtensionContribution: annotation("none"),
        controlledFlexionContribution: annotation("unknown"),
      }),
    );
    const trace = buildTrunkMechanicsTrace(profiled);

    expect(trace.profilePresent).toBe(true);
    expect(trace.functions.antiExtensionContribution.level).toBe("none");
    expect(trace.functions.controlledFlexionContribution).toEqual(
      expect.objectContaining({
        level: "unknown",
        reviewStatus: "needs_review",
        source: "unknown",
      }),
    );
  });

  it("does not let aggregate profile metadata hide a field-level unknown", () => {
    const runtimeProfile = {
      ...trunkProfile(),
      reviewStatus: "accepted",
    } as TrunkMechanicsProfile;
    const trace = buildTrunkMechanicsTrace(
      withTrunkProfile(exercise("pallof-press"), runtimeProfile),
    );

    expect(trace.functions.antiLateralFlexionContribution).toEqual(
      expect.objectContaining({
        level: "unknown",
        reviewStatus: "needs_review",
      }),
    );
  });

  it("exposes explicit unavailable unknown evidence when the profile is absent", () => {
    const trace = buildTrunkMechanicsTrace(exercise("push-up"));

    expect(trace.exerciseId).toBe("push-up");
    expect(trace.profilePresent).toBe(false);
    expect(Object.keys(trace.functions)).toEqual([...TRUNK_MECHANICS_FUNCTIONS]);
    expect(Object.values(trace.functions)).toHaveLength(8);
    expect(
      Object.values(trace.functions).every(
        (functionTrace) =>
          functionTrace.level === "unknown" &&
          functionTrace.source === "profile_unavailable" &&
          functionTrace.provenance.length === 0,
      ),
    ).toBe(true);
    expect(Object.values(trace.functions).some((functionTrace) => functionTrace.level === "none"))
      .toBe(false);
  });

  it("cannot change hard eligibility when only TrunkMechanicsProfile changes", () => {
    const base = exercise("pallof-press");
    const profiled = withTrunkProfile(
      base,
      trunkProfile({
        antiLateralFlexionContribution: annotation("high"),
        loadedBracingContribution: annotation("high"),
      }),
    );

    expect(hardEligibility(profiled, "anti_rotation_core")).toEqual(
      hardEligibility(base, "anti_rotation_core"),
    );
  });

  it("cannot change assessment, phase, totals, or ranking when only the profile changes", () => {
    const controlledScenario = scenario("scapular-activation-high-confidence");
    const request = {
      ...controlledScenario.request,
      evaluationContext: { asOf: FIXED_AS_OF },
    };
    const profiledPool = request.candidatePool.map((candidate) =>
      candidate.id === "band-face-pull"
        ? withTrunkProfile(
            candidate,
            trunkProfile({
              antiExtensionContribution: annotation("none"),
              antiRotationContribution: annotation("high"),
              loadedBracingContribution: annotation("moderate"),
            }),
          )
        : candidate,
    );
    const baseline = runCandidateRankingLab(request);
    const profiled = runCandidateRankingLab({ ...request, candidatePool: profiledPool });

    expect(rankingBehavior(profiled)).toEqual(rankingBehavior(baseline));
  });

  it("cannot change pain readiness when only the profile changes", () => {
    const controlledScenario = scenario("horizontal-pull-low-back-discomfort");
    const request = {
      ...controlledScenario.request,
      evaluationContext: { asOf: FIXED_AS_OF },
    };
    const profiledPool = request.candidatePool.map((candidate) =>
      candidate.id === "one-arm-dumbbell-row"
        ? withTrunkProfile(
            candidate,
            trunkProfile({ loadedBracingContribution: annotation("high") }),
          )
        : candidate,
    );
    const baseline = runCandidateRankingLab(request);
    const profiled = runCandidateRankingLab({ ...request, candidatePool: profiledPool });

    expect(profiled.painExecutionReadiness).toEqual(baseline.painExecutionReadiness);
    expect(
      profiled.rankedCandidates.map((candidate) => candidate.painExecutionReadiness),
    ).toEqual(
      baseline.rankedCandidates.map((candidate) => candidate.painExecutionReadiness),
    );
  });

  it("cannot activate a transition when only trunk mechanics changes", () => {
    const baseSource = exercise("pallof-press");
    const baseTraces = buildExerciseTransitionTraces(baseSource, REFERENCE_EXERCISES);
    const profiledSource = withTrunkProfile(
      baseSource,
      trunkProfile({ controlledRotationContribution: annotation("high") }),
    );
    const profiledCatalog = REFERENCE_EXERCISES.map((candidate) =>
      candidate.id === "dead-bug"
        ? withTrunkProfile(
            candidate,
            trunkProfile({ antiExtensionContribution: annotation("high") }),
          )
        : candidate,
    );
    const profiledTraces = buildExerciseTransitionTraces(profiledSource, profiledCatalog);

    expect(profiledTraces).toEqual(baseTraces);
    expect(profiledTraces.every((trace) => trace.automaticSelectionEffect === "none")).toBe(true);
  });

  it("does not let notes or provenance change eligibility or ranking", () => {
    const controlledScenario = scenario("horizontal-pull-gym-neutral");
    const request = {
      ...controlledScenario.request,
      evaluationContext: { asOf: FIXED_AS_OF },
    };
    const profileA = trunkProfile({
      loadedBracingContribution: annotation("high", {
        notes: "First explanatory note.",
        provenance: [
          { sourceRef: "review:first", evidenceBasis: ["First structured basis."] },
        ],
      }),
    });
    const profileB = trunkProfile({
      loadedBracingContribution: annotation("high", {
        notes: "Completely different prose that must remain non-behavioral.",
        provenance: [
          { sourceRef: "review:second", evidenceBasis: ["Second structured basis."] },
        ],
      }),
    });
    const poolWith = (profile: TrunkMechanicsProfile) =>
      request.candidatePool.map((candidate) =>
        candidate.id === "machine-row" ? withTrunkProfile(candidate, profile) : candidate,
      );
    const resultA = runCandidateRankingLab({ ...request, candidatePool: poolWith(profileA) });
    const resultB = runCandidateRankingLab({ ...request, candidatePool: poolWith(profileB) });

    expect(rankingBehavior(resultA)).toEqual(rankingBehavior(resultB));
  });

  it("keeps trunk function inference isolated from IDs, prose, cues, and tags", () => {
    const srcRoot = fileURLToPath(new URL("../../src", import.meta.url));
    const sourceFiles = tsFilesUnder(srcRoot);
    const trunkMechanicsConsumers = sourceFiles
      .filter((filePath) => readFileSync(filePath, "utf8").includes("trunkMechanics"))
      .map((filePath) => relative(srcRoot, filePath))
      .sort();
    const inferenceSources = [
      join(srcRoot, "trunkMechanics.ts"),
      join(srcRoot, "validation.ts"),
    ].map((filePath) => readFileSync(filePath, "utf8"));
    const forbiddenDescriptiveReads = [
      "exercise.name",
      "exercise.summary",
      "exercise.coachingFocus",
      "exercise.loading.jointStressTags",
      "exercise.cautionStressTags",
      "exercise.contraindicatedStressTags",
    ];

    expect(trunkMechanicsConsumers).toEqual([
      "data/referenceExercises.ts",
      "domain/exercise.ts",
      "index.ts",
      "trunkMechanics.ts",
      "validation.ts",
    ]);
    for (const source of inferenceSources) {
      for (const forbiddenRead of forbiddenDescriptiveReads) {
        expect(source).not.toContain(forbiddenRead);
      }
      expect(source).not.toMatch(
        /exercise\.id\s*(?:\.|\?\.)\s*(?:includes|startsWith|endsWith|match|search)\s*\(/,
      );
    }
  });

  it("preserves the complete accepted production behavior fingerprint", () => {
    expect(CONTROLLED_CANDIDATE_SCENARIOS).toHaveLength(22);
    expect(comprehensiveProductionFingerprint()).toBe(
      EXPECTED_COMPREHENSIVE_CONTRACT_FINGERPRINT,
    );
  });
});
