import { describe, expect, it } from "vitest";
import {
  auditCatalog,
  summarizeCatalogAudit,
  TIMING_REVIEW_CANDIDATES,
} from "@/lib/catalogDataIntegrity";
import { allExercises } from "@/lib/exercises";

/**
 * Phase 6k Commit 5 — coaching rulings applied; queue must stay empty.
 * Structural FAILs must stay at zero.
 */
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

  it("has zero NEEDS_REVIEW after Commit 5 coaching rulings", () => {
    expect(summary.reviewResults.map((r) => r.id)).toEqual([]);
  });

  it("applies Sotirios Commit 5 dose rulings", () => {
    const byId = Object.fromEntries(allExercises.map((e) => [e.id, e]));
    expect(byId["cat-cow"]?.loadType).toBe("bodyweight");
    expect(byId["cat-cow"]?.durationOrReps).toBe("6-8 reps");
    expect(byId["wall-slides"]?.loadType).toBe("bodyweight");
    expect(byId["wall-slides"]?.durationOrReps).toBe("8-10 reps");
    expect(byId["hip-flexor-stretch"]?.loadType).toBe("timed");
    expect(byId["hip-flexor-stretch"]?.durationOrReps).toBe("20 sec per side");
    expect(byId["thread-the-needle"]?.durationOrReps).toBe("6-10 per side");
    expect(byId["reverse-snow-angel"]?.durationOrReps).toBe("8-12 reps");
  });

  it("every exercise has an explicit demoStatus (1.g)", () => {
    for (const exercise of allExercises) {
      expect(
        exercise.demoStatus === "none" || exercise.demoStatus === "url"
      ).toBe(true);
    }
  });

  it("cleared timing candidates are not re-queued", () => {
    expect(TIMING_REVIEW_CANDIDATES.has("wall-slides")).toBe(false);
    expect(TIMING_REVIEW_CANDIDATES.has("cat-cow")).toBe(false);
    expect(TIMING_REVIEW_CANDIDATES.has("hip-flexor-stretch")).toBe(false);
    expect(TIMING_REVIEW_CANDIDATES.has("thread-the-needle")).toBe(false);
    expect(TIMING_REVIEW_CANDIDATES.has("reverse-snow-angel")).toBe(false);
  });
});
