import { describe, expect, it } from "vitest";
import {
  auditCatalog,
  summarizeCatalogAudit,
  TIMING_REVIEW_CANDIDATES,
} from "@/lib/catalogDataIntegrity";
import { allExercises } from "@/lib/exercises";

/**
 * Phase 6k Commit 1 guard. Structural FAILs must stay at zero.
 * NEEDS_REVIEW ids are the Commit 5 coaching queue — shrinks to empty
 * once Sotirios's rulings land.
 */
const COMMIT_5_REVIEW_QUEUE = [
  "cat-cow",
  "wall-slides",
  "hip-flexor-stretch",
  "thread-the-needle",
  "reverse-snow-angel",
] as const;

describe("catalogDataIntegrity (Phase 6k)", () => {
  const results = auditCatalog();
  const summary = summarizeCatalogAudit(results);

  it("audits the full catalog (225 including deprecated)", () => {
    expect(allExercises.length).toBe(225);
    expect(summary.total).toBe(225);
  });

  it("has zero structural FAIL exercises", () => {
    expect(summary.failResults.map((r) => r.id)).toEqual([]);
  });

  it("NEEDS_REVIEW matches the Commit 5 coaching queue only", () => {
    expect(summary.reviewResults.map((r) => r.id).sort()).toEqual(
      [...COMMIT_5_REVIEW_QUEUE].sort()
    );
  });

  it("every exercise has an explicit demoStatus (1.g)", () => {
    for (const exercise of allExercises) {
      expect(
        exercise.demoStatus === "none" || exercise.demoStatus === "url"
      ).toBe(true);
    }
  });

  it("timing review candidates are a known set", () => {
    expect(TIMING_REVIEW_CANDIDATES.has("wall-slides")).toBe(true);
    expect(TIMING_REVIEW_CANDIDATES.has("cat-cow")).toBe(true);
  });
});
