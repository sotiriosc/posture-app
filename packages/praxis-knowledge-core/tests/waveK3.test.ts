import { describe, expect, it } from "vitest";
import {
  TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES,
  WAVE_K3_KNOWLEDGE_CORE,
  projectCompactFallbacks,
  validateKnowledgeCore,
} from "../src";

const expected = {
  "pallof-press": ["Anti-rotation core press using cable or anchored band.", ["Resist rotation", "Stay tall without rib flare"]],
  "forearm-plank": ["Stationary forearm-supported anti-extension trunk exercise.", ["Keep ribs and pelvis organized", "Press through the forearms"]],
  "forearm-side-plank": ["Forearm-supported side plank for anti-lateral-flexion control.", ["Keep a long side line", "Press through the forearm"]],
  "machine-abdominal-crunch": ["Machine-guided controlled trunk-flexion exercise.", ["Flex through the trunk with control", "Return without dropping the stack"]],
  "half-kneeling-high-to-low-cable-chop": ["Half-kneeling high-cable controlled trunk-rotation exercise.", ["Rotate through the trunk with control", "Follow the high-to-low path"]],
  "farmer-carry": ["Bilateral one-implement-per-hand loaded walking carry.", ["Walk tall with quiet implements", "Use controlled turns and set-downs"]],
  "suitcase-carry": ["Unilateral side-specific loaded walking carry.", ["Stay tall over each step", "Keep the load side controlled"]],
  "wall-supported-suitcase-march": ["Stationary alternating loaded march with opposite-hand wall support.", ["Use light wall support", "March without drifting toward the load"]],
  "side-lying-hip-adduction": ["Floor-supported direct hip-adduction accessory exercise.", ["Lift with the inner thigh", "Keep the pelvis stacked"]],
  "loop-band-lateral-walk": ["Standing lateral stepping against unanchored loop-band resistance.", ["Step without letting the knees collapse", "Keep steady band tension"]],
  "side-lying-dumbbell-external-rotation": ["Supported direct shoulder external-rotation accessory exercise.", ["Rotate from the shoulder", "Keep the elbow position quiet"]],
  "supine-hamstring-walkout": ["Floor-supported bridge-position heel walkout for direct hamstring work.", ["Keep the hips controlled", "Walk only as far as you can own"]],
  "wall-ankle-dorsiflexion-rock": ["Wall-referenced ankle dorsiflexion preparation exercise.", ["Guide the knee forward over the foot", "Keep the heel grounded"]],
  "bodyweight-hip-hinge-rehearsal": ["Unloaded standing hip-hinge pattern preparation.", ["Send the hips back", "Keep the trunk organized"]],
  "single-leg-balance-rehearsal": ["Stationary single-leg stance-control preparation with prescription-modifiable support.", ["Use only the support you need", "Keep the stance side controlled"]],
} as const;

describe("Pre-G2K Wave K3 Knowledge curation", () => {
  it("contains the exact 15 trunk, carry, preparation, and P0 identities", () => {
    expect(TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).toEqual(Object.keys(expected));
    expect(validateKnowledgeCore(WAVE_K3_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("keeps all K3 compact fallbacks byte-equivalent", () => {
    for (const fallback of projectCompactFallbacks(TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES)) {
      const [summary, coachingFocus] = expected[fallback.exerciseId as keyof typeof expected];
      expect(fallback.summary).toBe(summary);
      expect(fallback.coachingFocus).toEqual(coachingFocus);
    }
  });

  it("keeps stationary march, carry, and support identities distinct", () => {
    const byId = new Map(TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES.map((entry) => [entry.exerciseId, entry]));
    expect(byId.get("wall-supported-suitcase-march")?.relatedMovementRoleIds).toEqual(["loaded_bracing"]);
    expect(byId.get("farmer-carry")?.relatedMovementRoleIds).toContain("carry");
    expect(byId.get("single-leg-balance-rehearsal")?.relatedActionFunctionIds).toEqual(["single_leg_stance_control"]);
  });

  it("uses differences-only realization overrides", () => {
    const overrides = TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides);
    expect(overrides).toHaveLength(11);
    expect(overrides.every((override) =>
      !override.replaceSetupRefs && !override.replaceDuringRefs && !override.replaceWatchForRefs,
    )).toBe(true);
  });
});
