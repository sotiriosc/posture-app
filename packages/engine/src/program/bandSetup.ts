/**
 * Band setup questionnaire truth + capability derivation (Phase 4).
 *
 * Legacy generic `bands` (no bandSetup) is `legacy_unknown` — never implies
 * long/loop type or any anchor height.
 */

export type BandSetupOption =
  | "loop_only"
  | "long_no_anchor"
  | "long_with_anchor"
  | "both_no_anchor"
  | "both_with_anchor";

export type ResolvedBandSetup =
  | BandSetupOption
  | "legacy_unknown"
  | "none";

export type BandSetupLane =
  | "long_with_anchor"
  | "long_no_anchor"
  | "loop_only"
  | "legacy_unknown"
  | "none";

export type BandTypeRequirement = "miniLoop" | "longBand" | "either";
export type BandAnchorRequirement =
  | "none"
  | "high"
  | "middle"
  | "low"
  | "repositionable";

export type BandCapabilityOverlay = {
  hasBands: boolean;
  hasLoopBand: boolean;
  hasLongBand: boolean;
  hasDoorAnchor: boolean;
  hasHighAnchor: boolean;
  hasMidAnchor: boolean;
  hasLowAnchor: boolean;
  /** True when the user confirmed a BandSetupOption (not legacy unknown). */
  bandSetupConfirmed: boolean;
  resolvedSetup: ResolvedBandSetup;
  setupLane: BandSetupLane;
};

export const BAND_SETUP_OPTIONS: ReadonlyArray<{
  value: BandSetupOption;
  label: string;
}> = [
  { value: "loop_only", label: "Mini loop bands only" },
  { value: "long_no_anchor", label: "Long resistance band, no anchor" },
  {
    value: "long_with_anchor",
    label: "Long resistance band with a secure door/fixed anchor",
  },
  { value: "both_no_anchor", label: "Both types, no anchor" },
  {
    value: "both_with_anchor",
    label: "Both types with a secure door/fixed anchor",
  },
];

const SETUP_SET = new Set<string>(BAND_SETUP_OPTIONS.map((entry) => entry.value));

export const normalizeBandSetupOption = (
  value: unknown
): BandSetupOption | undefined => {
  if (typeof value !== "string") return undefined;
  const token = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (SETUP_SET.has(token)) return token as BandSetupOption;
  return undefined;
};

export const resolveBandSetup = (params: {
  equipment: readonly string[];
  bandSetup?: unknown;
}): ResolvedBandSetup => {
  const hasBands = params.equipment.some(
    (token) => token.trim().toLowerCase() === "bands"
  );
  if (!hasBands) return "none";
  return normalizeBandSetupOption(params.bandSetup) ?? "legacy_unknown";
};

export const resolveBandSetupLane = (
  setup: ResolvedBandSetup
): BandSetupLane => {
  if (setup === "none") return "none";
  if (setup === "legacy_unknown") return "legacy_unknown";
  if (setup === "loop_only") return "loop_only";
  if (setup === "long_with_anchor" || setup === "both_with_anchor") {
    return "long_with_anchor";
  }
  return "long_no_anchor";
};

/**
 * Repositionable door/fixed anchor wording confirms high, middle, and low.
 * Legacy / unknown never receive anchor heights.
 */
export const deriveBandCapabilityOverlay = (params: {
  equipment: readonly string[];
  bandSetup?: unknown;
}): BandCapabilityOverlay => {
  const resolvedSetup = resolveBandSetup(params);
  const setupLane = resolveBandSetupLane(resolvedSetup);
  const hasBands = resolvedSetup !== "none";

  if (!hasBands) {
    return {
      hasBands: false,
      hasLoopBand: false,
      hasLongBand: false,
      hasDoorAnchor: false,
      hasHighAnchor: false,
      hasMidAnchor: false,
      hasLowAnchor: false,
      bandSetupConfirmed: false,
      resolvedSetup,
      setupLane,
    };
  }

  if (resolvedSetup === "legacy_unknown") {
    return {
      hasBands: true,
      hasLoopBand: false,
      hasLongBand: false,
      hasDoorAnchor: false,
      hasHighAnchor: false,
      hasMidAnchor: false,
      hasLowAnchor: false,
      bandSetupConfirmed: false,
      resolvedSetup,
      setupLane,
    };
  }

  const hasLoopBand =
    resolvedSetup === "loop_only" ||
    resolvedSetup === "both_no_anchor" ||
    resolvedSetup === "both_with_anchor";
  const hasLongBand =
    resolvedSetup === "long_no_anchor" ||
    resolvedSetup === "long_with_anchor" ||
    resolvedSetup === "both_no_anchor" ||
    resolvedSetup === "both_with_anchor";
  const hasDoorAnchor =
    resolvedSetup === "long_with_anchor" ||
    resolvedSetup === "both_with_anchor";

  return {
    hasBands: true,
    hasLoopBand,
    hasLongBand,
    hasDoorAnchor,
    hasHighAnchor: hasDoorAnchor,
    hasMidAnchor: hasDoorAnchor,
    hasLowAnchor: hasDoorAnchor,
    bandSetupConfirmed: true,
    resolvedSetup,
    setupLane,
  };
};

export const isBandTypeSatisfied = (
  required: BandTypeRequirement,
  overlay: BandCapabilityOverlay
): boolean => {
  if (!overlay.hasBands) return false;
  if (overlay.resolvedSetup === "legacy_unknown") {
    // Legacy cannot confirm type — only "either" exercises that also need no
    // type-specific long/loop claim may pass via a separate eligibility path.
    return required === "either";
  }
  if (required === "either") {
    return overlay.hasLoopBand || overlay.hasLongBand;
  }
  if (required === "miniLoop") return overlay.hasLoopBand;
  return overlay.hasLongBand;
};

export const isBandAnchorSatisfied = (
  required: BandAnchorRequirement,
  overlay: BandCapabilityOverlay
): boolean => {
  if (required === "none") return true;
  if (required === "repositionable" || required === "high") {
    return overlay.hasHighAnchor;
  }
  if (required === "middle") return overlay.hasMidAnchor;
  if (required === "low") return overlay.hasLowAnchor;
  return false;
};

/** Count high/middle/low transitions in a session (start without anchor = 0). */
export const countAnchorHeightChanges = (
  heights: Array<"none" | "high" | "middle" | "low">
): number => {
  let changes = 0;
  let previous: "none" | "high" | "middle" | "low" | null = null;
  for (const height of heights) {
    if (height === "none") {
      previous = previous ?? "none";
      continue;
    }
    if (previous === null || previous === "none") {
      previous = height;
      continue;
    }
    if (previous !== height) {
      changes += 1;
      previous = height;
    }
  }
  return changes;
};
