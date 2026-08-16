import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES,
  WAVE_K1_KNOWLEDGE_CORE,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
} from "../src";

const expectedIds = [
  "ninety-ninety-breathing", "serratus-wall-slide", "dead-bug", "push-up",
  "dumbbell-bench-press", "machine-chest-press", "cable-chest-fly",
  "chest-supported-dumbbell-row", "one-arm-dumbbell-row", "machine-row",
  "seated-cable-row", "band-row", "dumbbell-shoulder-press", "lat-pulldown",
  "band-lat-pulldown",
];

const expectedFallbacks = {
  "ninety-ninety-breathing": ["Supine breathing drill for ribcage and pelvis position.", ["Exhale fully", "Keep ribs stacked over pelvis"]],
  "serratus-wall-slide": ["Wall-supported scapular upward-rotation and serratus control drill.", ["Reach without shrugging", "Keep ribs quiet"]],
  "dead-bug": ["Supine anti-extension core drill.", ["Move limbs without losing spine position"]],
  "push-up": ["Bodyweight horizontal push.", ["Press the floor away", "Keep trunk organized"]],
  "dumbbell-bench-press": ["Bench-supported horizontal press with external loading.", ["Control the bottom range", "Press without shoulder glide"]],
  "machine-chest-press": ["Machine-guided horizontal press.", ["Set seat to comfortable shoulder path"]],
  "cable-chest-fly": ["Cable chest isolation with adjustable line of pull.", ["Keep range shoulder-friendly", "Move through chest, not front shoulder"]],
  "chest-supported-dumbbell-row": ["Bench-supported horizontal pull with low lumbar stabilization demand.", ["Pull elbows toward hips", "Keep chest supported"]],
  "one-arm-dumbbell-row": ["Unsupported or lightly supported dumbbell horizontal pull with more trunk demand.", ["Support as needed", "Keep torso position steady"]],
  "machine-row": ["Machine-based horizontal pull with machine-specific path and fit constraints.", ["Set pad height cleanly", "Pull without neck tension"]],
  "seated-cable-row": ["Cable-anchored horizontal pull with setup-dependent line of pull.", ["Own the reach", "Finish with shoulder blades moving cleanly"]],
  "band-row": ["Anchored-band horizontal pull.", ["Anchor securely", "Pull without rib flare"]],
  "dumbbell-shoulder-press": ["External-load vertical push.", ["Press in pain-free range", "Avoid leaning back"]],
  "lat-pulldown": ["Machine/cable vertical pull.", ["Pull elbows down", "Avoid neck tension"]],
  "band-lat-pulldown": ["High-anchor band vertical pull.", ["Use a secure high anchor", "Keep ribs stacked"]],
} as const;

describe("Pre-G2K Wave K1 Knowledge curation", () => {
  it("contains the exact 15 preparation, pressing, and pulling identities", () => {
    expect(PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).toEqual(expectedIds);
    expect(validateKnowledgeCore(WAVE_K1_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("keeps every legacy compact fallback byte-equivalent", () => {
    for (const fallback of projectCompactFallbacks(PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES)) {
      const [summary, coachingFocus] = expectedFallbacks[fallback.exerciseId as keyof typeof expectedFallbacks];
      expect(fallback.summary).toBe(summary);
      expect(fallback.coachingFocus).toEqual(coachingFocus);
    }
  });

  it("keeps Package R semantics frozen while entries are modularized", () => {
    expect(createHash("sha256").update(stableKnowledgeJson(PACKAGE_R_KNOWLEDGE_ENTRIES)).digest("hex"))
      .toBe("f813e143858d2675cd14ccbd251222473b763b4f5afefb9c9f0c89442ac53092");
  });

  it("models overrides as differences only", () => {
    const overrides = PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides);
    expect(overrides).toHaveLength(7);
    expect(overrides.every((override) =>
      !override.replaceSetupRefs && !override.replaceDuringRefs && !override.replaceWatchForRefs,
    )).toBe(true);
  });
});
