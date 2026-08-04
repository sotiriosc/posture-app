import { describe, expect, test } from "vitest";

import {
  deriveProgramCapabilities,
  isSupportConfirmedByCapabilities,
} from "@/lib/program/equipmentCapabilities";
import {
  deriveLegacyHasLoadIntentEquipmentMode,
  parsePrimaryProgramEquipmentMode,
  resolvePrimaryProgramEquipmentMode,
  serializePrimaryProgramEquipmentMode,
} from "@/lib/program/equipmentMode";
import { buildProgramIntentProfile } from "@/lib/program";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";

describe("resolvePrimaryProgramEquipmentMode", () => {
  test("gym only resolves to gym", () => {
    expect(resolvePrimaryProgramEquipmentMode(["gym"])).toBe("gym");
  });

  test("dumbbells only resolves to dumbbells", () => {
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells"])).toBe("dumbbells");
  });

  test("bands only resolves to bands", () => {
    expect(resolvePrimaryProgramEquipmentMode(["bands"])).toBe("bands");
  });

  test("none/bodyweight resolves to bodyweight", () => {
    expect(resolvePrimaryProgramEquipmentMode(["none"])).toBe("bodyweight");
    expect(resolvePrimaryProgramEquipmentMode([])).toBe("bodyweight");
  });

  test("dumbbells plus bands resolves to mixedHome", () => {
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells", "bands"])).toBe(
      "mixedHome"
    );
  });

  test("gym plus dumbbells resolves to gym", () => {
    expect(resolvePrimaryProgramEquipmentMode(["gym", "dumbbells"])).toBe("gym");
  });

  test("gym plus bands resolves to gym", () => {
    expect(resolvePrimaryProgramEquipmentMode(["gym", "bands"])).toBe("gym");
  });

  test("reordered equipment arrays resolve identically", () => {
    const a = resolvePrimaryProgramEquipmentMode(["bands", "dumbbells", "none"]);
    const b = resolvePrimaryProgramEquipmentMode(["dumbbells", "bands"]);
    const c = resolvePrimaryProgramEquipmentMode(["dumbbells", "bands", "bands"]);
    expect(a).toBe("mixedHome");
    expect(b).toBe("mixedHome");
    expect(c).toBe("mixedHome");
  });

  test("legacy normalized values remain valid", () => {
    expect(
      resolvePrimaryProgramEquipmentMode(
        normalizeEquipmentSelectionValues(["Dumbbell", "Resistance Bands"])
      )
    ).toBe("mixedHome");
    expect(
      resolvePrimaryProgramEquipmentMode(
        normalizeEquipmentSelectionValues(["No Equipment"])
      )
    ).toBe("bodyweight");
    expect(
      resolvePrimaryProgramEquipmentMode(
        normalizeEquipmentSelectionValues(["Gym"])
      )
    ).toBe("gym");
  });

  test("support-only tokens without load tools resolve to bodyweight", () => {
    expect(resolvePrimaryProgramEquipmentMode(["bench"])).toBe("bodyweight");
    expect(resolvePrimaryProgramEquipmentMode(["pullup_bar"])).toBe("bodyweight");
    expect(resolvePrimaryProgramEquipmentMode(["foam_roller"])).toBe("bodyweight");
  });

  test("legacy barbell/cables without gym do not become gym", () => {
    expect(resolvePrimaryProgramEquipmentMode(["barbell"])).toBe("dumbbells");
    expect(resolvePrimaryProgramEquipmentMode(["cables", "bands"])).toBe(
      "mixedHome"
    );
    expect(resolvePrimaryProgramEquipmentMode(["machines"])).toBe("dumbbells");
  });
});

describe("deriveProgramCapabilities", () => {
  test("unknown band anchor state stays false", () => {
    const capabilities = deriveProgramCapabilities(["bands"]);
    expect(capabilities.hasBands).toBe(true);
    expect(capabilities.hasLoopBand).toBe(false);
    expect(capabilities.hasLongBand).toBe(false);
    expect(capabilities.hasDoorAnchor).toBe(false);
    expect(capabilities.hasHighAnchor).toBe(false);
    expect(capabilities.hasMidAnchor).toBe(false);
    expect(capabilities.hasLowAnchor).toBe(false);
    expect(
      isSupportConfirmedByCapabilities("high_band_anchor", capabilities)
    ).toBe(false);
    expect(isSupportConfirmedByCapabilities("band_anchor", capabilities)).toBe(
      false
    );
  });

  test("no unconfirmed support-equipment assumptions for dumbbells-only", () => {
    const capabilities = deriveProgramCapabilities(["dumbbells"]);
    expect(capabilities.hasDumbbells).toBe(true);
    expect(capabilities.hasBench).toBe(false);
    expect(capabilities.hasPullupBar).toBe(false);
    expect(capabilities.hasCables).toBe(false);
    expect(capabilities.hasMachines).toBe(false);
    expect(capabilities.hasGymAccess).toBe(false);
    expect(capabilities.canIncreaseDumbbellLoad).toBeUndefined();
  });

  test("gym expands confirmed facility inventory but not band anchors or pullup bar", () => {
    const capabilities = deriveProgramCapabilities(["gym"]);
    expect(capabilities.hasGymAccess).toBe(true);
    expect(capabilities.hasDumbbells).toBe(true);
    expect(capabilities.hasBench).toBe(true);
    expect(capabilities.hasCables).toBe(true);
    expect(capabilities.hasMachines).toBe(true);
    expect(capabilities.hasPullupBar).toBe(false);
    expect(capabilities.hasHighAnchor).toBe(false);
  });

  test("bodyweight environment exposes floor/wall only assumptions", () => {
    const capabilities = deriveProgramCapabilities(["none"]);
    expect(capabilities.isFloorWallBodyweightEnvironment).toBe(true);
    expect(capabilities.hasFloorSpace).toBe(true);
    expect(capabilities.hasWall).toBe(true);
    expect(capabilities.hasDumbbells).toBe(false);
    expect(capabilities.hasBands).toBe(false);
  });

  test("explicit bench/pullup_bar tokens are honored without becoming gym", () => {
    const capabilities = deriveProgramCapabilities(["dumbbells", "bench"]);
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells", "bench"])).toBe(
      "dumbbells"
    );
    expect(capabilities.hasBench).toBe(true);
    expect(capabilities.hasGymAccess).toBe(false);
  });
});

describe("program intent no longer maps hasLoad to gym identity", () => {
  test("dumbbell-only intent equipment is dumbbells, not gym", () => {
    const profile = buildProgramIntentProfile({
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      painSeverity: "low",
      phaseStage: "activation",
      experienceLevel: "beginner",
      capabilityMode: "hasLoad",
    });
    expect(profile.equipment).toBe("dumbbells");
    expect(deriveLegacyHasLoadIntentEquipmentMode("hasLoad")).toBe("gym");
  });

  test("mixed-home intent equipment is mixedHome", () => {
    const profile = buildProgramIntentProfile({
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["bands", "dumbbells"],
        daysPerWeek: 3,
      },
      painSeverity: "low",
      phaseStage: "skill",
      experienceLevel: "intermediate",
      capabilityMode: "hasLoad",
    });
    expect(profile.equipment).toBe("mixedHome");
  });

  test("none intent equipment is bodyweight", () => {
    const profile = buildProgramIntentProfile({
      questionnaire: {
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      painSeverity: "low",
      phaseStage: "activation",
      experienceLevel: "beginner",
      capabilityMode: "noneOnly",
    });
    expect(profile.equipment).toBe("bodyweight");
  });
});

describe("version-safe mode serialization", () => {
  test("round-trips known modes and rejects hasLoad coercion", () => {
    expect(serializePrimaryProgramEquipmentMode("dumbbells")).toBe("dumbbells");
    expect(parsePrimaryProgramEquipmentMode("mixedHome")).toBe("mixedHome");
    expect(parsePrimaryProgramEquipmentMode("none")).toBe("bodyweight");
    expect(parsePrimaryProgramEquipmentMode("hasLoad")).toBeNull();
    expect(parsePrimaryProgramEquipmentMode("cable-station")).toBeNull();
  });
});
