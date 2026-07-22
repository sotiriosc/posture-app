/**
 * Phase 6.3 — sectionVisibility.test.ts
 *
 * Pure-logic coverage for the per-section visibility registry and helpers.
 * These back the user-controlled progressive disclosure feature; every
 * registered section must have a stable id and a defined default, and the
 * resolve/count/reset helpers must honour the ratified defaults.
 */

import { describe, it, expect } from "vitest";
import {
  SECTION_REGISTRY,
  SECTION_IDS,
  DEFAULT_SECTION_VISIBILITY,
  isSectionVisible,
  sectionsForScreen,
  countHiddenSections,
  showAllForScreen,
  resetSectionVisibilityToDefaults,
} from "../../src/ui/sectionVisibility";

describe("section visibility registry", () => {
  it("has unique, stable ids for every section", () => {
    const ids = SECTION_REGISTRY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SECTION_IDS).toEqual(ids);
  });

  it("assigns every section to a known screen with non-empty copy", () => {
    for (const section of SECTION_REGISTRY) {
      expect(["results", "session", "day"]).toContain(section.screen);
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.description.length).toBeGreaterThan(0);
      expect(typeof section.defaultVisible).toBe("boolean");
    }
  });

  it("encodes the ratified defaults (Phase 6a selective-default set)", () => {
    // Hidden until toggled on: full timeline, warmup breakdown, provenance
    // footer, and corrective-source annotations (Phase 6a Commit 2).
    expect(DEFAULT_SECTION_VISIBILITY["results.phaseHistory"]).toBe(false);
    expect(DEFAULT_SECTION_VISIBILITY["day.warmupBreakdown"]).toBe(false);
    expect(DEFAULT_SECTION_VISIBILITY["results.provenanceFooter"]).toBe(false);
    expect(DEFAULT_SECTION_VISIBILITY["day.correctiveSource"]).toBe(false);
    // Core sections are visible by default.
    expect(DEFAULT_SECTION_VISIBILITY["results.headline"]).toBe(true);
    expect(DEFAULT_SECTION_VISIBILITY["results.ladders"]).toBe(true);
    expect(DEFAULT_SECTION_VISIBILITY["results.posture"]).toBe(true);
    expect(DEFAULT_SECTION_VISIBILITY["results.sacrificeRetest"]).toBe(true);
    expect(DEFAULT_SECTION_VISIBILITY["results.retiredTags"]).toBe(true);
    expect(DEFAULT_SECTION_VISIBILITY["session.ladderPill"]).toBe(true);
  });
});

describe("isSectionVisible", () => {
  it("falls back to the ratified default when there is no override", () => {
    expect(isSectionVisible(undefined, "results.phaseHistory")).toBe(false);
    expect(isSectionVisible({}, "results.headline")).toBe(true);
  });

  it("honours an explicit user override in either direction", () => {
    expect(isSectionVisible({ "results.headline": false }, "results.headline")).toBe(false);
    expect(
      isSectionVisible({ "results.phaseHistory": true }, "results.phaseHistory")
    ).toBe(true);
  });

  it("defaults unknown sections to visible (never silently hide unknown content)", () => {
    expect(isSectionVisible(undefined, "totally.unknown")).toBe(true);
  });
});

describe("screen scoping", () => {
  it("groups sections by screen", () => {
    const resultsIds = sectionsForScreen("results").map((s) => s.id);
    expect(resultsIds).toContain("results.headline");
    expect(resultsIds.every((id) => id.startsWith("results."))).toBe(true);
  });

  it("counts hidden sections per screen using defaults + overrides", () => {
    // Default: results has two hidden sections (phaseHistory + provenanceFooter).
    expect(countHiddenSections(undefined, "results")).toBe(2);
    // Hiding the headline too raises the count.
    expect(
      countHiddenSections({ "results.headline": false }, "results")
    ).toBe(3);
    // Showing both hidden-by-default sections drops it to zero.
    expect(
      countHiddenSections(
        { "results.phaseHistory": true, "results.provenanceFooter": true },
        "results"
      )
    ).toBe(0);
  });

  it("showAllForScreen makes every section on that screen visible, leaving others untouched", () => {
    const next = showAllForScreen(
      { "results.headline": false, "session.ladderPill": false },
      "results"
    );
    for (const section of sectionsForScreen("results")) {
      expect(isSectionVisible(next, section.id)).toBe(true);
    }
    // Other screens' overrides are preserved.
    expect(next["session.ladderPill"]).toBe(false);
  });
});

describe("resetSectionVisibilityToDefaults", () => {
  it("returns a fresh copy equal to the ratified defaults", () => {
    const reset = resetSectionVisibilityToDefaults();
    expect(reset).toEqual(DEFAULT_SECTION_VISIBILITY);
    expect(reset).not.toBe(DEFAULT_SECTION_VISIBILITY);
  });
});
