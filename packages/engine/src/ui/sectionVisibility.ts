// ---------------------------------------------------------------------------
// Phase 6.3 — Per-section visibility (user-controlled progressive disclosure)
// ---------------------------------------------------------------------------
//
// Pure, React-free source of truth for the toggleable UI sections and their
// ratified defaults.  Lives in the engine package so it is unit-testable and
// so the section registry cannot drift between the app layer and its tests.
//
// The user's overrides are persisted on LogPrefs.sectionVisibility
// (Record<sectionId, boolean>).  An absent key falls back to the section's
// ratified default here.  This is per-section agency, never a global mode.

export type SectionScreen = "results" | "session" | "day";

export type SectionDefinition = {
  /** Stable id persisted in LogPrefs.sectionVisibility. Never rename. */
  id: string;
  /** Which screen the section belongs to (for grouping in Settings). */
  screen: SectionScreen;
  /** Short human label for the Settings › Interface list. */
  label: string;
  /** What the section contains, shown as help text in Settings. */
  description: string;
  /** Ratified default visibility when the user has no explicit preference. */
  defaultVisible: boolean;
};

/**
 * The ratified section registry (bloom-plan § 6.3).
 *
 * Every entry here MUST correspond to a real <VisibilityGate> in the UI —
 * a Settings toggle that controls nothing would violate SR-6 (no cosmetic-only
 * work).  When adding a section, wire its gate in the same change.
 */
export const SECTION_REGISTRY: readonly SectionDefinition[] = [
  // ── Results screen ──────────────────────────────────────────────────────
  {
    id: "results.headline",
    screen: "results",
    label: "Headline metric",
    description: "The single top-of-screen number summarizing your progress.",
    defaultVisible: true,
  },
  {
    id: "results.ladders",
    screen: "results",
    label: "Current ladders",
    description: "Your progress up each movement pattern's rungs (d1–d5).",
    defaultVisible: true,
  },
  {
    id: "results.sacrificeRetest",
    screen: "results",
    label: "Sacrifice retest queue",
    description:
      "Exercises you set aside that are now eligible to try again.",
    defaultVisible: true,
  },
  {
    id: "results.posture",
    screen: "results",
    label: "Posture observations",
    description: "Baseline vs latest measurements for tracked observations.",
    defaultVisible: true,
  },
  {
    id: "results.retiredTags",
    screen: "results",
    label: "Retired posture focus",
    description: "Posture focuses you've cleared and retired.",
    defaultVisible: true,
  },
  {
    id: "results.phaseHistory",
    screen: "results",
    label: "Phase history timeline",
    description:
      "The full timeline of phase transitions with the criteria that earned each one.",
    defaultVisible: false,
  },
  {
    id: "results.provenanceFooter",
    screen: "results",
    label: "Provenance footer",
    description:
      "The trust footer: assessment dates, retest count, and decisions traced.",
    defaultVisible: true,
  },
  // ── Session screen ──────────────────────────────────────────────────────
  {
    id: "session.ladderPill",
    screen: "session",
    label: "Ladder progress pill",
    description:
      "The small progression status pill shown on each exercise card.",
    defaultVisible: true,
  },
  // ── Day view ────────────────────────────────────────────────────────────
  {
    id: "day.correctiveSource",
    screen: "day",
    label: "Corrective-source annotations",
    description:
      'The "Chosen because: [reason]" line under posture-biased picks.',
    defaultVisible: true,
  },
  {
    id: "day.warmupBreakdown",
    screen: "day",
    label: "Warmup four-block breakdown",
    description:
      "The detailed ramp / mobilize / activate / prime breakdown of your warmup.",
    defaultVisible: false,
  },
] as const;

/** All valid section ids (for validation / iteration). */
export const SECTION_IDS: readonly string[] = SECTION_REGISTRY.map((s) => s.id);

/** The ratified default map: sectionId → default visibility. */
export const DEFAULT_SECTION_VISIBILITY: Record<string, boolean> =
  SECTION_REGISTRY.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.id] = section.defaultVisible;
    return acc;
  }, {});

const defaultVisibilityFor = (sectionId: string): boolean => {
  const def = SECTION_REGISTRY.find((s) => s.id === sectionId);
  // Unknown sections default to visible — never hide content we can't reason
  // about (honest-failure principle: recoverable, not silently gone).
  return def ? def.defaultVisible : true;
};

/**
 * Resolve whether a section is visible, given the user's persisted overrides.
 * Absent key ⇒ ratified default.
 */
export const isSectionVisible = (
  sectionVisibility: Record<string, boolean> | undefined,
  sectionId: string
): boolean => {
  const override = sectionVisibility?.[sectionId];
  if (typeof override === "boolean") return override;
  return defaultVisibilityFor(sectionId);
};

/** Sections belonging to a given screen, in registry order. */
export const sectionsForScreen = (
  screen: SectionScreen
): SectionDefinition[] => SECTION_REGISTRY.filter((s) => s.screen === screen);

/**
 * Count how many sections on a given screen are currently hidden.  Used to
 * render the "N sections hidden — [show all]" recovery affordance so nothing
 * is ever permanently invisible without a way back.
 */
export const countHiddenSections = (
  sectionVisibility: Record<string, boolean> | undefined,
  screen: SectionScreen
): number =>
  sectionsForScreen(screen).filter(
    (s) => !isSectionVisible(sectionVisibility, s.id)
  ).length;

/**
 * Produce a visibility map that makes every section on a screen visible again
 * (the "[show all]" action).  Preserves overrides for other screens.
 */
export const showAllForScreen = (
  sectionVisibility: Record<string, boolean> | undefined,
  screen: SectionScreen
): Record<string, boolean> => {
  const next = { ...(sectionVisibility ?? {}) };
  for (const section of sectionsForScreen(screen)) {
    next[section.id] = true;
  }
  return next;
};

/**
 * Reset every section to its ratified default (Settings › "Reset to defaults").
 * Returns a fresh copy of DEFAULT_SECTION_VISIBILITY.
 */
export const resetSectionVisibilityToDefaults = (): Record<string, boolean> => ({
  ...DEFAULT_SECTION_VISIBILITY,
});
