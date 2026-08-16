import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  EQUIPMENT_CAPABILITY_KEYS,
  FULL_GYM_EQUIPMENT,
  LOOP_BANDS_ONLY_EQUIPMENT,
  MACHINE_IDS,
  MIXED_HOME_EQUIPMENT,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  buildEquipmentCapabilitySnapshot,
  evaluateEquipmentRequirement,
  hasEquipmentCapability,
  validateEquipmentCapabilities,
  type EquipmentCapabilities,
  type ExerciseFamily,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
} from "../helpers/trunkMechanicsCurationProposal";
import {
  CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
  CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
  CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
  COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT,
  FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS,
  HOME_CARRY_EQUIPMENT,
  SETTLED_TRUNK_CARRY_FUTURE_IDENTITIES,
  TRAVEL_CARRY_EQUIPMENT,
  TRUNK_CARRY_FUTURE_IDENTITIES,
  buildTrunkCarryEquipmentContractData,
  evaluateFutureTrunkCarryEquipment,
  renderTrunkCarryEquipmentContract,
  type TrunkCarryFutureIdentity,
} from "../helpers/trunkCarryEquipmentContract";

const data = buildTrunkCarryEquipmentContractData();

function withEquipment(
  overrides: Partial<EquipmentCapabilities>,
): EquipmentCapabilities {
  return {
    ...CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
    ...overrides,
  };
}

describe("trunk/carry training-space and equipment contract", () => {
  it("requires explicit training-space, cable-height, and dumbbell-pair truth in every shared fixture", () => {
    const fixtures = [
      FULL_GYM_EQUIPMENT,
      DUMBBELLS_AND_BENCH_EQUIPMENT,
      DUMBBELLS_NO_BENCH_EQUIPMENT,
      ANCHORED_BANDS_EQUIPMENT,
      BANDS_WITHOUT_ANCHOR_EQUIPMENT,
      LOOP_BANDS_ONLY_EQUIPMENT,
      BODYWEIGHT_EQUIPMENT,
      MIXED_HOME_EQUIPMENT,
    ];

    for (const fixture of fixtures) {
      expect(Object.hasOwn(fixture, "trainingSpace")).toBe(true);
      expect(Object.hasOwn(fixture.trainingSpace, "stableLoadedStandingSpace")).toBe(
        true,
      );
      expect(Object.hasOwn(fixture.trainingSpace.loadedGait, "available")).toBe(
        true,
      );
      expect(Object.hasOwn(fixture.dumbbells, "pairAvailable")).toBe(true);
      expect(Object.hasOwn(fixture.cables, "availableHeights")).toBe(true);
    }

    expect(EQUIPMENT_CAPABILITY_KEYS).toEqual(
      expect.arrayContaining([
        "floor_space",
        "stable_loaded_standing_space",
        "loaded_gait_space",
        "dumbbell_pair",
        "cable_anchor_low",
        "cable_anchor_mid",
        "cable_anchor_high",
      ]),
    );
    expect(EQUIPMENT_CAPABILITY_KEYS).not.toContain(
      "overhead_loaded_gait_clearance",
    );
  });

  it("keeps ordinary floor space separate from both loaded-space capabilities", () => {
    const floorOnly = withEquipment({
      trainingSpace: {
        stableLoadedStandingSpace: false,
        loadedGait: { available: false },
      },
    });

    expect(hasEquipmentCapability(floorOnly, "floor_space")).toBe(true);
    expect(
      hasEquipmentCapability(floorOnly, "stable_loaded_standing_space"),
    ).toBe(false);
    expect(hasEquipmentCapability(floorOnly, "loaded_gait_space")).toBe(false);
  });

  it("does not let stable loaded standing manufacture loaded-gait availability", () => {
    const standingOnly = withEquipment({
      trainingSpace: {
        stableLoadedStandingSpace: true,
        loadedGait: { available: false },
      },
    });

    expect(
      hasEquipmentCapability(standingOnly, "stable_loaded_standing_space"),
    ).toBe(true);
    expect(hasEquipmentCapability(standingOnly, "loaded_gait_space")).toBe(false);
  });

  it("reports loaded gait without stable loaded standing as inconsistent input", () => {
    const inconsistent = withEquipment({
      trainingSpace: {
        stableLoadedStandingSpace: false,
        loadedGait: { available: true },
      },
    });

    expect(hasEquipmentCapability(inconsistent, "loaded_gait_space")).toBe(true);
    expect(validateEquipmentCapabilities(inconsistent)).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "loaded_gait_requires_stable_loaded_standing_space",
      }),
    );
  });

  it("keeps absent loaded-gait details explicitly unknown rather than false", () => {
    expect(HOME_CARRY_EQUIPMENT.trainingSpace.loadedGait).toEqual({
      available: true,
    });

    const snapshot = buildEquipmentCapabilitySnapshot(HOME_CARRY_EQUIPMENT);
    expect(snapshot.loadedGait).toEqual({
      available: true,
      straightLineMeters: null,
      turningAvailable: null,
      overheadClearance: null,
    });
    expect(
      buildEquipmentCapabilitySnapshot(
        CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
      ).loadedGait,
    ).toEqual(
      expect.objectContaining({
        available: true,
        overheadClearance: false,
      }),
    );
  });

  it("requires explicit cable heights independently from adjustability and band anchors", () => {
    expect(hasEquipmentCapability(FULL_GYM_EQUIPMENT, "cable_anchor_low")).toBe(
      true,
    );
    expect(hasEquipmentCapability(FULL_GYM_EQUIPMENT, "cable_anchor_mid")).toBe(
      true,
    );
    expect(hasEquipmentCapability(FULL_GYM_EQUIPMENT, "cable_anchor_high")).toBe(
      true,
    );

    const genericAdjustableCable = withEquipment({
      cables: {
        available: true,
        adjustableHeight: true,
        availableHeights: [],
      },
      bands: {
        types: ["tube_handles"],
        anchors: [{ height: "high", stableFor: "moderate" }],
      },
    });

    expect(hasEquipmentCapability(genericAdjustableCable, "cable_stack")).toBe(
      true,
    );
    expect(
      hasEquipmentCapability(genericAdjustableCable, "band_anchor_high"),
    ).toBe(true);
    expect(
      hasEquipmentCapability(genericAdjustableCable, "cable_anchor_high"),
    ).toBe(false);
  });

  it("validates exact abdominal-crunch machine identity separately from generic machines", () => {
    const requirement = FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS.find(
      (contract) => contract.exerciseId === "machine-abdominal-crunch",
    )?.requirements[0];
    if (!requirement) {
      throw new Error("Missing abdominal-crunch synthetic requirement.");
    }

    const genericMachine = withEquipment({
      machines: { availableMachineIds: ["row"] },
    });
    const exactMachine = withEquipment({
      machines: { availableMachineIds: ["abdominal_crunch"] },
    });

    expect(MACHINE_IDS).toContain("abdominal_crunch");
    expect(validateEquipmentCapabilities(exactMachine)).toEqual([]);
    expect(evaluateEquipmentRequirement(genericMachine, requirement)).toEqual(
      expect.objectContaining({
        satisfied: false,
        missingCapabilities: ["machine:abdominal_crunch"],
      }),
    );
    expect(evaluateEquipmentRequirement(exactMachine, requirement).satisfied).toBe(
      true,
    );
  });

  it("distinguishes one dumbbell from a pair without inventing a minimum-load gate", () => {
    const oneDumbbell = withEquipment({
      dumbbells: {
        available: true,
        pairAvailable: false,
        adjustable: false,
      },
    });
    const pairWithoutKnownMaximum = withEquipment({
      dumbbells: {
        available: true,
        pairAvailable: true,
        adjustable: false,
      },
    });

    expect(hasEquipmentCapability(oneDumbbell, "dumbbells")).toBe(true);
    expect(hasEquipmentCapability(oneDumbbell, "dumbbell_pair")).toBe(false);
    expect(hasEquipmentCapability(pairWithoutKnownMaximum, "dumbbells")).toBe(
      true,
    );
    expect(
      hasEquipmentCapability(pairWithoutKnownMaximum, "dumbbell_pair"),
    ).toBe(true);
    expect(
      evaluateFutureTrunkCarryEquipment(
        "farmer-carry",
        pairWithoutKnownMaximum,
      ).satisfied,
    ).toBe(true);
  });

  it("assigns carry_load only to the three approved production identities", () => {
    const futureFamily: ExerciseFamily = "carry_load";
    expect(futureFamily).toBe("carry_load");
    expect(
      REFERENCE_EXERCISES.filter((exercise) => exercise.family === "carry_load"),
    ).toEqual([
      expect.objectContaining({ id: "farmer-carry" }),
      expect.objectContaining({ id: "suitcase-carry" }),
      expect.objectContaining({ id: "wall-supported-suitcase-march" }),
    ]);
  });

  it("defines the six settled identities and one provisional identity exactly", () => {
    expect(SETTLED_TRUNK_CARRY_FUTURE_IDENTITIES).toEqual([
      "forearm-plank",
      "forearm-side-plank",
      "machine-abdominal-crunch",
      "half-kneeling-high-to-low-cable-chop",
      "farmer-carry",
      "suitcase-carry",
    ]);
    expect(TRUNK_CARRY_FUTURE_IDENTITIES).toEqual([
      ...SETTLED_TRUNK_CARRY_FUTURE_IDENTITIES,
      "wall-supported-suitcase-march",
    ]);
    expect(
      FUTURE_TRUNK_CARRY_EQUIPMENT_REQUIREMENTS.at(-1)?.identityStatus,
    ).toBe("PROVISIONAL");
  });

  it("passes every synthetic future requirement in a capability-complete environment", () => {
    for (const exerciseId of TRUNK_CARRY_FUTURE_IDENTITIES) {
      expect(
        evaluateFutureTrunkCarryEquipment(
          exerciseId,
          CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
        ),
      ).toEqual(
        expect.objectContaining({
          exerciseId,
          satisfied: true,
          missingCapabilities: [],
        }),
      );
    }
  });

  it("fails each future contract on precise missing structured facts", () => {
    const noFloor = withEquipment({
      bodyweight: {
        ...CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT.bodyweight,
        floorSpace: false,
      },
    });
    const noExactMachine = withEquipment({
      machines: { availableMachineIds: ["row"] },
    });
    const noCable = withEquipment({
      cables: {
        available: false,
        adjustableHeight: false,
        availableHeights: [],
      },
    });
    const noHighCable = withEquipment({
      cables: {
        available: true,
        adjustableHeight: true,
        availableHeights: ["low", "mid"],
      },
    });
    const noPair = withEquipment({
      dumbbells: {
        available: true,
        pairAvailable: false,
        adjustable: false,
      },
    });
    const noLoadedGait = withEquipment({
      trainingSpace: {
        stableLoadedStandingSpace: true,
        loadedGait: { available: false },
      },
    });
    const noDumbbells = withEquipment({
      dumbbells: {
        available: false,
        pairAvailable: false,
        adjustable: false,
      },
    });
    const noWall = withEquipment({
      bodyweight: {
        ...CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT.bodyweight,
        wallAvailable: false,
      },
      supportSurfaces: [],
    });
    const noStableLoadedStanding = withEquipment({
      trainingSpace: {
        stableLoadedStandingSpace: false,
        loadedGait: { available: false },
      },
    });

    const cases: readonly [
      TrunkCarryFutureIdentity,
      EquipmentCapabilities,
      readonly string[],
    ][] = [
      ["forearm-plank", noFloor, ["floor_space"]],
      ["forearm-side-plank", noFloor, ["floor_space"]],
      ["machine-abdominal-crunch", noExactMachine, ["machine:abdominal_crunch"]],
      [
        "half-kneeling-high-to-low-cable-chop",
        noCable,
        ["cable_stack", "cable_anchor_high"],
      ],
      [
        "half-kneeling-high-to-low-cable-chop",
        noHighCable,
        ["cable_anchor_high"],
      ],
      ["farmer-carry", noPair, ["dumbbell_pair"]],
      ["farmer-carry", noLoadedGait, ["loaded_gait_space"]],
      ["suitcase-carry", noDumbbells, ["dumbbells"]],
      ["suitcase-carry", noLoadedGait, ["loaded_gait_space"]],
      ["wall-supported-suitcase-march", noDumbbells, ["dumbbells"]],
      ["wall-supported-suitcase-march", noWall, ["wall"]],
      [
        "wall-supported-suitcase-march",
        noStableLoadedStanding,
        ["stable_loaded_standing_space"],
      ],
    ];

    for (const [exerciseId, equipment, missingCapabilities] of cases) {
      expect(
        evaluateFutureTrunkCarryEquipment(exerciseId, equipment),
      ).toEqual(
        expect.objectContaining({
          satisfied: false,
          missingCapabilities,
        }),
      );
    }
  });

  it("uses explicit capabilities rather than commercial, home, or travel labels", () => {
    expect(
      evaluateFutureTrunkCarryEquipment(
        "farmer-carry",
        COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT,
      ).missingCapabilities,
    ).toEqual(["dumbbell_pair", "loaded_gait_space"]);
    expect(
      evaluateFutureTrunkCarryEquipment(
        "machine-abdominal-crunch",
        COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT,
      ).missingCapabilities,
    ).toEqual(["selectorized_machine", "machine:abdominal_crunch"]);

    for (const equipment of [HOME_CARRY_EQUIPMENT, TRAVEL_CARRY_EQUIPMENT]) {
      expect(
        evaluateFutureTrunkCarryEquipment("farmer-carry", equipment).satisfied,
      ).toBe(true);
      expect(
        evaluateFutureTrunkCarryEquipment("suitcase-carry", equipment).satisfied,
      ).toBe(true);
    }
  });

  it("exposes requested, available, missing, and contextual equipment evidence", () => {
    const result = evaluateFutureTrunkCarryEquipment(
      "half-kneeling-high-to-low-cable-chop",
      CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
    ).requirementResults[0];

    expect(result.trace.requestedCapabilities).toEqual([
      "cable_stack",
      "cable_anchor_high",
      "floor_space",
    ]);
    expect(result.trace.availableCapabilities).toEqual(
      result.trace.requestedCapabilities,
    );
    expect(result.trace.missingCapabilities).toEqual([]);
    expect(result.trace.capabilitySnapshot).toEqual(
      expect.objectContaining({
        stableLoadedStandingSpace: true,
        cable: expect.objectContaining({
          availableHeights: ["low", "mid", "high"],
        }),
        dumbbells: expect.objectContaining({ pairAvailable: true }),
        availableMachineIds: ["abdominal_crunch"],
      }),
    );
  });

  it("preserves all current equipment legality and behavior fingerprints", () => {
    expect(data.currentNewCapabilityRequirementCount).toBe(7);
    expect(data.currentCarryFamilyCount).toBe(3);
    expect(data.equipmentLegalityMatches).toBe(true);
    expect(data.currentEquipmentLegalityFingerprint).toBe(
      CAPTURED_CURRENT_EQUIPMENT_LEGALITY_FINGERPRINT,
    );
    expect(data.equipmentFixtureMatches).toBe(true);
    expect(data.equipmentFixtureFingerprint).toBe(
      CAPTURED_EXPANDED_EQUIPMENT_FIXTURE_FINGERPRINT,
    );
    expect(data.rankingMatches).toBe(true);
    expect(data.rankingFingerprint).toBe(
      CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    );
    expect(data.comprehensiveBehaviorMatches).toBe(true);
    expect(data.comprehensiveBehaviorFingerprint).toBe(
      CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    );
    expect(data.referenceCatalogMatches).toBe(true);
    expect(data.referenceCatalogFingerprint).toBe(
      FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
    );
  });

  it("matches the checked-in deterministic equipment-contract report", () => {
    const rendered = renderTrunkCarryEquipmentContract(data);

    expect(data.classification).toBe("TRUNK_CARRY_EQUIPMENT_CONTRACT_READY");
    expect(data.nextDependency).toBe(
      "TRUNK / CARRY PAIN-STRESS VOCABULARY AND RECEIVER REVIEW",
    );
    expect(rendered).toContain("## Loaded Standing Versus Loaded Gait");
    expect(rendered).toContain("## Synthetic Future Requirements");
    expect(rendered).toContain("**TRUNK_CARRY_EQUIPMENT_CONTRACT_READY**");
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });
});
