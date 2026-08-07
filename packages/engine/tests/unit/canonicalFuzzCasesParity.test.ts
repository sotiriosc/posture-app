/**
 * Generator parity (§9 option 2): canonicalFuzzCases is the single source of
 * truth for mode-audit fuzz dimensions (mode audits import buildCanonicalFuzzCase).
 */
import { describe, expect, test } from "vitest";
import {
  buildCanonicalFuzzCase,
  FUZZ_MODES,
  hashSeedForMode,
} from "@/lib/__debug__/lib/canonicalFuzzCases";

const BLOCK_POOL = ["db-rdl", "goblet-squat", "bodyweight-squat", "band-rdl"] as const;
const INDEXES = [0, 1, 2, 16, 17, 26, 80, 81, 242, 243, 728, 729, 999, 9999];

describe("canonicalFuzzCases", () => {
  test.each(FUZZ_MODES)("%s seed/hash stable at representative indexes", (mode) => {
    for (const index of INDEXES) {
      const fuzzCase = buildCanonicalFuzzCase(mode, index);
      expect(hashSeedForMode(mode, index)).toBe(fuzzCase.seed);
      expect(buildCanonicalFuzzCase(mode, index).seed).toBe(fuzzCase.seed);
      expect(fuzzCase.blockedExerciseIds).toBeUndefined();
    }
  });

  test.each(FUZZ_MODES)(
    "%s includeBlocks injects blocks only when index %% 17 === 0",
    (mode) => {
      for (const index of INDEXES) {
        const withoutBlocks = buildCanonicalFuzzCase(mode, index);
        const withBlocks = buildCanonicalFuzzCase(mode, index, { includeBlocks: true });

        expect(withoutBlocks.blockedExerciseIds).toBeUndefined();

        if (index % 17 === 0) {
          const expectedId =
            BLOCK_POOL[Math.floor(index / 17) % BLOCK_POOL.length];
          expect(withBlocks.blockedExerciseIds).toBeDefined();
          expect(Object.keys(withBlocks.blockedExerciseIds!)).toEqual([expectedId]);
          expect(BLOCK_POOL).toContain(expectedId);
          expect(withBlocks.structuralKey).toContain(expectedId);
          expect(withBlocks.blockedKey).toBe(expectedId);
        } else {
          expect(withBlocks.blockedExerciseIds).toBeUndefined();
          expect(withBlocks.structuralKey).toContain("blocks:none");
          expect(withBlocks.blockedKey).toBe("");
        }
      }
    }
  );

  test.each(FUZZ_MODES)("%s dimensions reproducible at representative indexes", (mode) => {
    for (const index of INDEXES) {
      const a = buildCanonicalFuzzCase(mode, index);
      const b = buildCanonicalFuzzCase(mode, index);
      expect(a).toEqual(b);
      expect(a.questionnaire).toEqual(b.questionnaire);
      expect(a.phaseIndex).toBe(b.phaseIndex);
      expect(a.capabilityLane).toBe(b.capabilityLane);
      expect(a.structuralKey).toBe(b.structuralKey);
    }
  });
});
