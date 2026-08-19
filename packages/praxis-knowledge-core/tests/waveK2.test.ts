import { describe, expect, it } from "vitest";
import {
  LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES,
  WAVE_K2_KNOWLEDGE_CORE,
  projectCompactFallbacks,
  validateKnowledgeCore,
} from "../src";

const expected = {
  "goblet-squat": ["Dumbbell-loaded squat pattern.", ["Use range you can own", "Keep pressure through whole foot"]],
  "leg-press": ["Machine-guided bilateral squat pattern.", ["Control depth", "Do not chase load past owned range"]],
  "bodyweight-box-squat": ["Supported squat pattern to a box.", ["Sit to a consistent target", "Stand with whole-foot pressure"]],
  "dumbbell-romanian-deadlift": ["Loaded hinge emphasizing hamstrings and glutes.", ["Hips back", "Keep load close", "Stop before spine position changes"]],
  "cable-pull-through": ["Cable hinge pattern with posterior loading.", ["Let hips move back", "Finish tall without overextending"]],
  "split-squat": ["Unilateral lower-body squat pattern.", ["Use support if balance dominates", "Own depth before load"]],
  "step-up": ["Unilateral lower-body step pattern.", ["Control the descent", "Match box height to owned range"]],
  "lying-leg-curl": ["Machine hamstring knee-flexion isolation.", ["Control the return", "Keep hips settled"]],
  "glute-bridge": ["Supine hip-extension glute exercise.", ["Finish with glutes, not low back"]],
  "dumbbell-lateral-raise": ["Dumbbell side-delt isolation.", ["Lead with elbows softly", "Stay in comfortable range"]],
  "reverse-pec-deck": ["Machine-supported rear-delt and upper-back isolation.", ["Move shoulder blades and rear delts, not neck"]],
  "band-face-pull": ["Anchored-band rear-delt and scapular-control exercise.", ["Pull toward face without shrugging"]],
  "dumbbell-curl": ["Dumbbell elbow-flexion accessory.", ["Control the lowering", "Do not swing"]],
  "cable-triceps-pressdown": ["Cable elbow-extension accessory.", ["Keep upper arm still", "Finish without shoulder roll"]],
  "standing-calf-raise": ["Equipment-neutral standing ankle plantar-flexion accessory exercise.", ["Rise through the ball of the foot", "Control the full return"]],
} as const;

describe("Pre-G2K Wave K2 Knowledge curation", () => {
  it("contains the exact 15 lower-body and direct-accessory identities", () => {
    expect(LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).toEqual(Object.keys(expected));
    expect(validateKnowledgeCore(WAVE_K2_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("keeps all K2 compact fallbacks byte-equivalent", () => {
    for (const fallback of projectCompactFallbacks(LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES)) {
      const [summary, coachingFocus] = expected[fallback.exerciseId as keyof typeof expected];
      expect(fallback.summary).toBe(summary);
      expect(fallback.coachingFocus).toEqual(coachingFocus);
    }
  });

  it("keeps unresolved identity decisions explicit", () => {
    const claims = Object.fromEntries(LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES.map((entry) => [entry.exerciseId, entry.unresolvedClaims]));
    expect(claims["bodyweight-box-squat"]?.join(" ")).toMatch(/identity boundary/i);
    expect(claims["split-squat"]?.join(" ")).toMatch(/reverse lunge/i);
    expect(claims["glute-bridge"]?.join(" ")).toMatch(/unilateral/i);
  });

  it("uses differences-only realization overrides", () => {
    const overrides = LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides);
    expect(overrides).toHaveLength(8);
    expect(overrides.every((override) =>
      !override.replaceSetupRefs && !override.replaceDuringRefs && !override.replaceWatchForRefs,
    )).toBe(true);
  });
});
