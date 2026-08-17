import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import {
  evaluateEquipmentRequirement,
  MACHINE_IDS,
  type EquipmentCapabilities,
} from "../../src/domain/equipment";
import {
  DUMBBELL_BENCH_PRESS_ANGLE_REALIZATIONS,
  MACHINE_CHEST_PRESS_ANGLE_REALIZATIONS,
  PRESS_SUPPORT_ANGLE_REALIZATIONS,
  resolvePressSupportAngleRealization,
  validatePressSupportAngleRealization,
} from "../../src/domain/pressAngleRealization";
import {
  PULL_UP_ASSISTANCE_REALIZATIONS,
  resolvePullUpAssistanceRealization,
  validatePullUpAssistanceRealizations,
} from "../../src/domain/assistanceRealization";
import {
  PACKAGE_S_NEW_MACHINE_IDS,
  PRE_PACKAGE_S_MACHINE_IDS,
  STANDARD_GYM_ONTOLOGY_ANSWERS,
} from "../packageS/foundationEvidence";

function equipment(input: {
  readonly benches?: EquipmentCapabilities["bench"]["types"];
  readonly machines?: EquipmentCapabilities["machines"]["availableMachineIds"];
  readonly pullUpBar?: boolean;
} = {}): EquipmentCapabilities {
  return {
    environment: "commercial_gym",
    trainingSpace: {
      stableLoadedStandingSpace: true,
      loadedGait: { available: true },
    },
    bodyweight: {
      floorSpace: true,
      wallAvailable: true,
      pullUpBar: input.pullUpBar ?? false,
    },
    bench: { types: input.benches ?? [], stable: true },
    dumbbells: { available: true, pairAvailable: true, adjustable: false },
    barbell: { available: false, rackAvailable: false },
    cables: { available: true, adjustableHeight: true, availableHeights: ["low", "mid", "high"] },
    bands: { types: [], anchors: [] },
    machines: { availableMachineIds: input.machines ?? [] },
    supportSurfaces: ["wall", "box"],
  };
}

describe("Package S incline, machine, and assistance foundations", () => {
  it("expands exact machine capabilities without admitting exercise rows", () => {
    expect(PRE_PACKAGE_S_MACHINE_IDS).toHaveLength(9);
    expect(PACKAGE_S_NEW_MACHINE_IDS).toHaveLength(9);
    expect(MACHINE_IDS).toHaveLength(18);
    expect(new Set(MACHINE_IDS).size).toBe(18);
    expect(REFERENCE_EXERCISES).toHaveLength(53);
  });

  it("keeps flat and incline dumbbell pressing under one typed identity", () => {
    expect(DUMBBELL_BENCH_PRESS_ANGLE_REALIZATIONS).toHaveLength(3);
    expect(new Set(DUMBBELL_BENCH_PRESS_ANGLE_REALIZATIONS.map((value) => value.exerciseId)))
      .toEqual(new Set(["dumbbell-bench-press"]));
    expect(PRESS_SUPPORT_ANGLE_REALIZATIONS.flatMap(validatePressSupportAngleRealization))
      .toEqual([]);
    const result = resolvePressSupportAngleRealization({
      exerciseId: "dumbbell-bench-press",
      explicitRealizationId: "adjustable-bench-incline",
      currentProductiveRealizationId: null,
      equipment: equipment({ benches: ["adjustable"] }),
    });
    expect(result.selected?.angleClass).toBe("incline");
    expect(result.selectionSource).toBe("explicit_preference");
    expect(result.automaticRotationApplied).toBe(false);
    expect(result.upperChestGuaranteeApplied).toBe(false);
  });

  it("fails closed when an incline bench or exact incline machine is absent", () => {
    const dumbbell = resolvePressSupportAngleRealization({
      exerciseId: "dumbbell-bench-press",
      explicitRealizationId: "adjustable-bench-incline",
      currentProductiveRealizationId: null,
      equipment: equipment({ benches: ["flat"] }),
    });
    const machine = resolvePressSupportAngleRealization({
      exerciseId: "machine-chest-press",
      explicitRealizationId: "fixed-machine-incline",
      currentProductiveRealizationId: null,
      equipment: equipment({ machines: ["chest_press"] }),
    });
    expect(dumbbell.selected).toBeNull();
    expect(machine.selected).toBeNull();
  });

  it("admits machine incline only through incline_chest_press capability", () => {
    expect(MACHINE_CHEST_PRESS_ANGLE_REALIZATIONS).toHaveLength(2);
    const result = resolvePressSupportAngleRealization({
      exerciseId: "machine-chest-press",
      explicitRealizationId: "fixed-machine-incline",
      currentProductiveRealizationId: null,
      equipment: equipment({ machines: ["incline_chest_press"] }),
    });
    expect(result.selected?.capabilityReference).toEqual({
      kind: "machine",
      machineId: "incline_chest_press",
    });
  });

  it("keeps Pull-Up assistance as two realizations of one identity", () => {
    expect(validatePullUpAssistanceRealizations()).toEqual([]);
    expect(PULL_UP_ASSISTANCE_REALIZATIONS).toHaveLength(2);
    const unassisted = resolvePullUpAssistanceRealization({
      requestedRealizationId: "bodyweight-unassisted",
      exactMachineAssistanceSetting: null,
      equipment: equipment({ pullUpBar: true }),
    });
    const assisted = resolvePullUpAssistanceRealization({
      requestedRealizationId: "machine-assisted",
      exactMachineAssistanceSetting: 8,
      equipment: equipment({ machines: ["assisted_pull_up"] }),
    });
    expect(unassisted.sourceEventCount).toBe(1);
    expect(assisted.assistanceMagnitude).toEqual({ kind: "machine_setting", setting: 8 });
    expect(assisted.assistanceTreatedAsExternalLoad).toBe(false);
    expect(assisted.automaticProgressionApplied).toBe(false);
  });

  it("supports exact alternative Pull-Up apparatus without gym-label inference", () => {
    const requirement = {
      id: "pull-up-apparatus",
      label: "Exact pull-up bar or assisted pull-up machine",
      oneOf: ["pull_up_bar"],
      oneOfMachineIds: ["assisted_pull_up"],
    } as const;
    expect(evaluateEquipmentRequirement(equipment(), requirement).satisfied).toBe(false);
    expect(evaluateEquipmentRequirement(equipment({ pullUpBar: true }), requirement).satisfied)
      .toBe(true);
    expect(evaluateEquipmentRequirement(
      equipment({ machines: ["assisted_pull_up"] }),
      requirement,
    ).satisfied).toBe(true);
  });

  it("records complete owner ontology dispositions", () => {
    expect(STANDARD_GYM_ONTOLOGY_ANSWERS).toHaveLength(30);
    expect(STANDARD_GYM_ONTOLOGY_ANSWERS.every((answer) => answer.length > 20)).toBe(true);
  });
});
