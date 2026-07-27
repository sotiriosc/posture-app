import { describe, expect, test } from "vitest";
import { exercises } from "@/lib/exercises";
import {
  CENTRATION_CUES_COVERED_IDS,
  CENTRATION_REVIEW_ORDER,
  flattenCentrationFocusTips,
  getCentrationCues,
  hasCentrationCues,
} from "@/lib/centrationCues";

describe("centrationCues", () => {
  test("covers every catalog warmup and activation exercise", () => {
    const prepIds = exercises
      .filter((e) => e.category === "warmup" || e.category === "activation")
      .map((e) => e.id);
    for (const id of prepIds) {
      expect(hasCentrationCues(id), `missing prep cues: ${id}`).toBe(true);
    }
  });

  test("every covered id exists in the catalog", () => {
    const catalogIds = new Set(exercises.map((e) => e.id));
    for (const id of CENTRATION_CUES_COVERED_IDS) {
      expect(catalogIds.has(id), `unknown exercise id: ${id}`).toBe(true);
    }
  });

  test("review order lists every covered id exactly once", () => {
    expect(new Set(CENTRATION_REVIEW_ORDER).size).toBe(
      CENTRATION_REVIEW_ORDER.length
    );
    expect([...CENTRATION_REVIEW_ORDER].sort()).toEqual(
      [...CENTRATION_CUES_COVERED_IDS].sort()
    );
  });

  test("dead-bug returns actionable setup/during/pattern/watchFor", () => {
    const cues = getCentrationCues("dead-bug");
    expect(cues).not.toBeNull();
    expect(cues!.setup.length).toBeGreaterThanOrEqual(2);
    expect(cues!.during.length).toBeGreaterThanOrEqual(2);
    expect(cues!.pattern.length).toBeGreaterThan(10);
    expect(cues!.watchFor.length).toBeGreaterThanOrEqual(1);
    expect(cues!.setup.join(" ").toLowerCase()).toMatch(/rib/);
  });

  test("high-frequency main (db-rdl) has centration cues", () => {
    const cues = getCentrationCues("db-rdl");
    expect(cues).not.toBeNull();
    expect(cues!.setup.join(" ").toLowerCase()).toMatch(/rib|pelvis|hinge/);
    expect(cues!.during.length).toBeGreaterThanOrEqual(2);
    expect(cues!.watchFor.length).toBeGreaterThanOrEqual(1);
  });

  test("unknown ids fall back gracefully (null / no focus tips)", () => {
    expect(hasCentrationCues("not-a-real-exercise")).toBe(false);
    expect(getCentrationCues("not-a-real-exercise")).toBeNull();
    expect(flattenCentrationFocusTips(null)).toEqual([]);
  });

  test("focus tips flatten setup + during + pattern (not watch-for)", () => {
    const cues = getCentrationCues("glute-bridges");
    const tips = flattenCentrationFocusTips(cues);
    expect(tips.length).toBeGreaterThan(3);
    expect(tips).toContain(cues!.pattern);
    for (const watch of cues!.watchFor) {
      expect(tips).not.toContain(watch);
    }
  });
});
