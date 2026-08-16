import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  LOOP_BANDS_ONLY_EQUIPMENT,
  MIXED_HOME_EQUIPMENT,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  buildEquipmentCapabilitySnapshot,
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
  type EquipmentEnvironment,
  type EquipmentRequirement,
  type EquipmentRequirementResult,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";

export const SETTLED_TRUNK_CARRY_FUTURE_IDENTITIES = [
  "forearm-plank",
  "forearm-side-plank",
  "machine-abdominal-crunch",
  "half-kneeling-high-to-low-cable-chop",
  "farmer-carry",
  "suitcase-carry",
] as const;

export const PROVISIONAL_TRUNK_CARRY_FUTURE_IDENTITIES = [
  "wall-supported-suitcase-march",
] as const;

export const TRUNK_CARRY_FUTURE_IDENTITIES = [
  ...SETTLED_TRUNK_CARRY_FUTURE_IDENTITIES,
  ...PROVISIONAL_TRUNK_CARRY_FUTURE_IDENTITIES,
] as const;

export type TrunkCarryFutureIdentity =
  (typeof TRUNK_CARRY_FUTURE_IDENTITIES)[number];

export interface FutureEquipmentRequirementContract {
  readonly exerciseId: TrunkCarryFutureIdentity;
  readonly identityStatus: "SETTLED" | "PROVISIONAL";
  readonly requirements: readonly EquipmentRequirement[];
  readonly finding: string;
}

export const FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS: readonly FutureEquipmentRequirementContract[] = [
  {
    exerciseId: "forearm-plank",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-forearm-plank-space",
        label: "Bodyweight with ordinary floor space",
        allOf: ["bodyweight", "floor_space"],
      },
    ],
    finding:
      "Ordinary stationary floor space is sufficient; loaded standing and loaded gait are irrelevant.",
  },
  {
    exerciseId: "forearm-side-plank",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-forearm-side-plank-space",
        label: "Bodyweight with ordinary floor space",
        allOf: ["bodyweight", "floor_space"],
      },
    ],
    finding:
      "Ordinary stationary floor space is sufficient; side prescription is now representable by the structured prescription contract.",
  },
  {
    exerciseId: "machine-abdominal-crunch",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-machine-abdominal-crunch",
        label: "Exact selectorized abdominal-crunch machine",
        allOf: ["selectorized_machine"],
        machineIds: ["abdominal_crunch"],
      },
    ],
    finding:
      "Generic selectorized-machine availability and exact abdominal-crunch identity are both required.",
  },
  {
    exerciseId: "half-kneeling-high-to-low-cable-chop",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-half-kneeling-high-to-low-cable-chop",
        label: "Cable stack with explicit high attachment and floor space",
        allOf: ["cable_stack", "cable_anchor_high", "floor_space"],
      },
    ],
    finding:
      "Generic cable availability and adjustableHeight do not replace explicit high-attachment truth.",
  },
  {
    exerciseId: "farmer-carry",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-farmer-carry",
        label: "Usable dumbbell pair with loaded-gait space",
        allOf: ["dumbbell_pair", "loaded_gait_space"],
      },
    ],
    finding:
      "The pair and loaded-gait facts are explicit; no minimum effective load or distance is manufactured.",
  },
  {
    exerciseId: "suitcase-carry",
    identityStatus: "SETTLED",
    requirements: [
      {
        id: "future-suitcase-carry",
        label: "At least one dumbbell with loaded-gait space",
        allOf: ["dumbbells", "loaded_gait_space"],
      },
    ],
    finding:
      "One-or-more dumbbell truth remains distinct from pair truth; no minimum effective load is a hard gate.",
  },
  {
    exerciseId: "wall-supported-suitcase-march",
    identityStatus: "PROVISIONAL",
    requirements: [
      {
        id: "future-wall-supported-suitcase-march",
        label: "Dumbbell, wall, and stable loaded standing space",
        allOf: ["dumbbells", "wall", "stable_loaded_standing_space"],
      },
    ],
    finding:
      "The stationary march does not request loaded-gait space; side, support, load, and no-distance dose semantics are now representable, but final identity still awaits owner curation.",
  },
];

function emptyEquipment(
  environment: EquipmentEnvironment,
): EquipmentCapabilities {
  return {
    environment,
    trainingSpace: {
      stableLoadedStandingSpace: false,
      loadedGait: {
        available: false,
      },
    },
    bodyweight: {
      floorSpace: false,
      wallAvailable: false,
      pullUpBar: false,
    },
    bench: {
      types: [],
      stable: false,
    },
    dumbbells: {
      available: false,
      pairAvailable: false,
      adjustable: false,
    },
    barbell: {
      available: false,
      rackAvailable: false,
    },
    cables: {
      available: false,
      adjustableHeight: false,
      availableHeights: [],
    },
    bands: {
      types: [],
      anchors: [],
    },
    machines: {
      availableMachineIds: [],
    },
    supportSurfaces: [],
  };
}

export const CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT: EquipmentCapabilities = {
  ...emptyEquipment("commercial_gym"),
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: true,
      straightLineMeters: 10,
      turningAvailable: true,
      overheadClearance: false,
    },
  },
  bodyweight: {
    floorSpace: true,
    wallAvailable: true,
    pullUpBar: false,
  },
  dumbbells: {
    available: true,
    pairAvailable: true,
    adjustable: false,
  },
  cables: {
    available: true,
    adjustableHeight: true,
    availableHeights: ["low", "mid", "high"],
  },
  machines: {
    availableMachineIds: ["abdominal_crunch"],
  },
  supportSurfaces: ["wall"],
};

function carryEquipment(
  environment: EquipmentEnvironment,
): EquipmentCapabilities {
  return {
    ...emptyEquipment(environment),
    trainingSpace: {
      stableLoadedStandingSpace: true,
      loadedGait: {
        available: true,
      },
    },
    dumbbells: {
      available: true,
      pairAvailable: true,
      adjustable: false,
    },
  };
}

export const COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT = emptyEquipment("commercial_gym");
export const HOME_CARRY_EQUIPMENT = carryEquipment("home");
export const TRAVEL_CARRY_EQUIPMENT = carryEquipment("travel");

export interface FutureEquipmentEvaluation {
  readonly exerciseId: TrunkCarryFutureIdentity;
  readonly satisfied: boolean;
  readonly missingCapabilities: readonly string[];
  readonly requirementResults: readonly EquipmentRequirementResult[];
}

export function evaluateFutureTrunkCarryEquipment(
  exerciseId: TrunkCarryFutureIdentity,
  equipment: EquipmentCapabilities,
): FutureEquipmentEvaluation {
  const contract = FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS.find(
    (candidate) => candidate.exerciseId === exerciseId,
  );
  if (!contract) {
    throw new Error(`Missing future equipment contract for ${exerciseId}.`);
  }

  const requirementResults = contract.requirements.map((requirement) =>
    evaluateEquipmentRequirement(equipment, requirement),
  );
  return {
    exerciseId,
    satisfied: requirementResults.every((result) => result.satisfied),
    missingCapabilities: [
      ...new Set(
        requirementResults.flatMap((result) => result.missingCapabilities),
      ),
    ],
    requirementResults,
  };
}

const CURRENT_EQUIPMENT_FIXTURES = {
  FULL_GYM_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  ANCHORED_BANDS_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  LOOP_BANDS_ONLY_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  MIXED_HOME_EQUIPMENT,
} as const;

export const CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT =
  "ac3d2d4e8c8c3acc3cf3b57610bfb7e958c9879eef19e525887468646bbc1fd5";
export const CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT =
  "bb07188480cab4134ba4f2eb36dfa4f17e5d4d62d6139b539c5603ad602b482a";

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildCurrentEquipmentLegalityFingerprint(): string {
  const rows = Object.entries(CURRENT_EQUIPMENT_FIXTURES).flatMap(
    ([fixture, equipment]) =>
      REFERENCE_EXERCISES.map((exercise) => ({
        fixture,
        exerciseId: exercise.id,
        requirements: exercise.equipmentRequirements.map((requirement) => {
          const result = evaluateEquipmentRequirement(equipment, requirement);
          return {
            id: requirement.id,
            satisfied: result.satisfied,
            missingCapabilities: result.missingCapabilities,
          };
        }),
      })),
  );
  return sha256(rows);
}

export function buildExpandedEquipmentFixtureFingerprint(): string {
  return sha256(CURRENT_EQUIPMENT_FIXTURES);
}

export interface TrunkCarryEquipmentContractData {
  readonly futureRequirements: readonly FutureEquipmentRequirementContract[];
  readonly completeEnvironmentResults: readonly FutureEquipmentEvaluation[];
  readonly unknownDetailSnapshot: ReturnType<
    typeof buildEquipmentCapabilitySnapshot
  >;
  readonly currentNewCapabilityRequirementCount: number;
  readonly currentCarryFamilyCount: number;
  readonly currentEquipmentLegalityFingerprint: string;
  readonly equipmentLegalityMatches: boolean;
  readonly equipmentFixtureFingerprint: string;
  readonly equipmentFixtureMatches: boolean;
  readonly rankingFingerprint: string;
  readonly rankingMatches: boolean;
  readonly comprehensiveBehaviorFingerprint: string;
  readonly comprehensiveBehaviorMatches: boolean;
  readonly referenceCatalogFingerprint: string;
  readonly referenceCatalogMatches: boolean;
  readonly classification: "TRUNK_CARRY_EQUIPMENT_CONTRACT_READY";
  readonly nextDependency: "TRUNK / CARRY PAIN-STRESS VOCABULARY AND RECEIVER REVIEW";
}

export function buildTrunkCarryEquipmentContractData(): TrunkCarryEquipmentContractData {
  const identities = FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS.map(
    (contract) => contract.exerciseId,
  );
  if (
    identities.length !== TRUNK_CARRY_FUTURE_IDENTITIES.length ||
    new Set(identities).size !== TRUNK_CARRY_FUTURE_IDENTITIES.length ||
    TRUNK_CARRY_FUTURE_IDENTITIES.some((identity) => !identities.includes(identity))
  ) {
    throw new Error("Every accepted future identity needs exactly one equipment contract.");
  }

  const newCapabilityKeys = new Set([
    "stable_loaded_standing_space",
    "loaded_gait_space",
    "dumbbell_pair",
    "cable_anchor_low",
    "cable_anchor_mid",
    "cable_anchor_high",
  ]);
  const currentNewCapabilityRequirementCount = REFERENCE_EXERCISES.flatMap(
    (exercise) => exercise.equipmentRequirements,
  )
    .flatMap((requirement) => [
      ...(requirement.allOf ?? []),
      ...(requirement.oneOf ?? []),
    ])
    .filter((capability) => newCapabilityKeys.has(capability)).length;
  const fingerprints = buildCurrentTrunkCurationFingerprints();
  const currentEquipmentLegalityFingerprint =
    buildCurrentEquipmentLegalityFingerprint();
  const equipmentFixtureFingerprint =
    buildExpandedEquipmentFixtureFingerprint();

  return {
    futureRequirements: FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS,
    completeEnvironmentResults: TRUNK_CARRY_FUTURE_IDENTITIES.map((identity) =>
      evaluateFutureTrunkCarryEquipment(
        identity,
        CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
      ),
    ),
    unknownDetailSnapshot: buildEquipmentCapabilitySnapshot(HOME_CARRY_EQUIPMENT),
    currentNewCapabilityRequirementCount,
    currentCarryFamilyCount: REFERENCE_EXERCISES.filter(
      (exercise) => exercise.family === "carry_load",
    ).length,
    currentEquipmentLegalityFingerprint,
    equipmentLegalityMatches:
      currentEquipmentLegalityFingerprint ===
      CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
    equipmentFixtureFingerprint,
    equipmentFixtureMatches:
      equipmentFixtureFingerprint ===
      CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
    rankingFingerprint: fingerprints.productionRanking,
    rankingMatches:
      fingerprints.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    comprehensiveBehaviorFingerprint: fingerprints.comprehensiveBehavior,
    comprehensiveBehaviorMatches:
      fingerprints.comprehensiveBehavior ===
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    referenceCatalogFingerprint: fingerprints.referenceCatalog,
    referenceCatalogMatches:
      fingerprints.referenceCatalog ===
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    classification: "TRUNK_CARRY_EQUIPMENT_CONTRACT_READY",
    nextDependency:
      "TRUNK / CARRY PAIN-STRESS VOCABULARY AND RECEIVER REVIEW",
  };
}

function markdownCell(value: string | number | boolean): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number | boolean)[])[],
): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

export function renderTrunkCarryEquipmentContract(
  data: TrunkCarryEquipmentContractData,
): string {
  return [
    "# Trunk / Carry Training-Space and Equipment Contract",
    "",
    "## Scope",
    "",
    "This contract resolves only training-space and equipment truth for the accepted minimal trunk/carry direction. It adds no proposed exercise and changes no current exercise requirement, pain/stress tag, prescription, progression axis, score, rank, phase, assessment, transition, Session Composer, or Weekly Composer behavior.",
    "",
    "## Owner Identity Refinements",
    "",
    table(
      ["Future identity", "Status", "Equipment finding"],
      data.futureRequirements.map((contract) => [
        contract.exerciseId,
        contract.identityStatus,
        contract.finding,
      ]),
    ),
    "",
    "`wall-supported-suitcase-march` remains provisional for exercise-science curation. The structured prescription contract can represent support side, load side, steps/time, stationary gait, and no-distance semantics, but it does not approve production metadata.",
    "",
    "## Training-Space Contract",
    "",
    "`EquipmentCapabilities.trainingSpace` now requires `stableLoadedStandingSpace` and a separate `loadedGait.available` fact. Loaded gait may optionally report `straightLineMeters`, `turningAvailable`, and `overheadClearance`. Absence of those optional details means unknown, not false.",
    "",
    "Loaded-gait availability is a user/environment capability statement, not a medical or absolute safety guarantee. It does not manufacture a usable distance, turn, or overhead-clearance fact.",
    "",
    "## Loaded Standing Versus Loaded Gait",
    "",
    "`floor_space`, `stable_loaded_standing_space`, and `loaded_gait_space` are independent requirement keys. Floor space satisfies neither loaded-space key. Stable loaded standing does not satisfy loaded gait. Loaded gait marked available while stable loaded standing is false remains raw input truth for inspection and emits `loaded_gait_requires_stable_loaded_standing_space` validation error rather than being silently normalized.",
    "",
    table(
      ["Loaded-gait trace field", "Value in unknown-detail example"],
      [
        ["available", data.unknownDetailSnapshot.loadedGait.available],
        [
          "straightLineMeters",
          String(data.unknownDetailSnapshot.loadedGait.straightLineMeters),
        ],
        [
          "turningAvailable",
          String(data.unknownDetailSnapshot.loadedGait.turningAvailable),
        ],
        [
          "overheadClearance",
          String(data.unknownDetailSnapshot.loadedGait.overheadClearance),
        ],
      ],
    ),
    "",
    "## Cable-Height Contract",
    "",
    "`CableCapability.availableHeights` explicitly enumerates `low`, `mid`, and `high`. `adjustableHeight` remains a separate equipment characteristic and does not prove any usable attachment height. `cable_anchor_low`, `cable_anchor_mid`, and `cable_anchor_high` require both cable availability and the matching explicit height. Band-anchor keys remain independent.",
    "",
    "## Abdominal-Crunch Machine Identity",
    "",
    "`MachineId` now includes `abdominal_crunch`. A future requirement must request `selectorized_machine` and `machineIds: [abdominal_crunch]`; a generic machine or commercial-gym label cannot satisfy exact identity.",
    "",
    "## Dumbbell Single / Pair Truth",
    "",
    "`DumbbellCapability.pairAvailable` distinguishes one-or-more dumbbell availability from a usable pair. The existing `dumbbells` key reads generic availability; `dumbbell_pair` requires both generic and pair truth. Existing maximum-pair-weight data is preserved.",
    "",
    "Minimum effective carry load remains a future prescription and candidate-suitability question. Neither generic dumbbell nor pair equipment legality invents a minimum load gate.",
    "",
    "## Carry Exercise Family",
    "",
    "`ExerciseFamily` includes `carry_load` for future catalog identity and personal-block taxonomy. Current exercises using it: 0. The family creates no role legality, score, capacity credit, carry slot, or mandatory finisher.",
    "",
    "## Synthetic Future Requirements",
    "",
    table(
      ["Future identity", "Requirement", "Complete environment", "Missing capability trace"],
      data.futureRequirements.map((contract, index) => [
        contract.exerciseId,
        contract.requirements
          .map((requirement) =>
            [
              ...(requirement.allOf ?? []),
              ...(requirement.oneOf ?? []),
              ...(requirement.machineIds ?? []).map(
                (machineId) => `machine:${machineId}`,
              ),
            ].join(", "),
          )
          .join("; "),
        data.completeEnvironmentResults[index].satisfied,
        data.completeEnvironmentResults[index].missingCapabilities.join(", ") ||
          "none",
      ]),
    ),
    "",
    "Synthetic counterfactuals prove each missing structured fact fails with its exact capability key, commercial-gym labels provide no carry-space or machine identity, and home/travel environments can satisfy carries when their explicit capabilities match.",
    "",
    "## Requirement Trace and Observability",
    "",
    "Every pure requirement result now exposes the requirement ID, requested capabilities, available requested capabilities, missing capabilities, per-capability checks, and a capability snapshot containing loaded-gait details, cable heights, dumbbell-pair truth, and machine identities. Existing hard-rejection evidence continues to use the same missing-capability strings.",
    "",
    "## Current-Behavior Invariance",
    "",
    table(
      ["Artifact", "Required fingerprint/count", "Current", "Result"],
      [
        [
          "240 current exercise-by-fixture equipment legality rows",
          CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
          data.currentEquipmentLegalityFingerprint,
          data.equipmentLegalityMatches,
        ],
        [
          "Expanded equipment fixture serialization",
          CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
          data.equipmentFixtureFingerprint,
          data.equipmentFixtureMatches,
        ],
        [
          "22-scenario ranking",
          CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
          data.rankingFingerprint,
          data.rankingMatches,
        ],
        [
          "Comprehensive behavior including hard-rejection codes",
          CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
          data.comprehensiveBehaviorFingerprint,
          data.comprehensiveBehaviorMatches,
        ],
        [
          "Reference catalog",
          FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
          data.referenceCatalogFingerprint,
          data.referenceCatalogMatches,
        ],
        [
          "Current requirements using a new capability",
          0,
          data.currentNewCapabilityRequirementCount,
          data.currentNewCapabilityRequirementCount === 0,
        ],
        [
          "Current exercises using carry_load",
          0,
          data.currentCarryFamilyCount,
          data.currentCarryFamilyCount === 0,
        ],
      ],
    ),
    "",
    "The fixture fingerprint changes intentionally because every equipment fixture now serializes explicit training-space, cable-height, and dumbbell-pair truth. Exercise catalog serialization does not change.",
    "",
    "## Validation Results",
    "",
    "Focused tests cover explicit space fields, all non-implication boundaries, inconsistent loaded-gait input, unknown optional details, cable/band separation, exact machine identity, dumbbell single/pair truth, future synthetic requirements, environment-label counterfactuals, carry-family non-use, and all current fingerprints.",
    "",
    "## Final Classification",
    "",
    `**${data.classification}**`,
    "",
    "Structured prescription and same-exercise progression semantics are now represented by `STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY`. The exercise tranche is still not production-ready. The next dependency is:",
    "",
    `**${data.nextDependency}**`,
    "",
    "Then exact seven-exercise owner curation and production metadata.",
    "",
  ].join("\n");
}

export function writeTrunkCarryEquipmentContract(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: TrunkCarryEquipmentContractData;
} {
  const data = buildTrunkCarryEquipmentContractData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md",
  );
  writeFileSync(outputPath, renderTrunkCarryEquipmentContract(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeTrunkCarryEquipmentContract();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        futureIdentities: result.data.futureRequirements.length,
        classification: result.data.classification,
        nextDependency: result.data.nextDependency,
      },
      null,
      2,
    ),
  );
}
