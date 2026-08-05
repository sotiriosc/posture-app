/**
 * Canonical reason-code → severity map for Program Quality V2 Phase 7.
 */

import type { ProgramQualitySeverity } from "@/lib/program/qualityGate/qualityGateTypes";

const HARD_PREFIXES = [
  "GYM_",
  "DUMBBELL_",
  "BAND_",
  "BODYWEIGHT_",
  "MIXED_HOME_",
  "QUALITY_",
  "COACHING_",
] as const;

/** Explicit overrides when a mode code is a capability limitation, not a hard failure. */
const CAPABILITY_LIMITATION_CODES = new Set<string>([
  "BODYWEIGHT_TRUE_VERTICAL_UNAVAILABLE",
  "BODYWEIGHT_LOADED_PULL_UNAVAILABLE",
  "BAND_HIGH_ANCHOR_UNAVAILABLE",
  "BAND_LONG_BAND_UNAVAILABLE_LOOP_ONLY",
  "DUMBBELL_TRUE_VERTICAL_UNAVAILABLE",
  "MIXED_HOME_TRUE_VERTICAL_UNAVAILABLE",
]);

const DEFERRED_CODES = new Set<string>([
  "COACHING_DEMO_PLANNED",
  "DEFERRED_DEMO",
  "DEFERRED_CUES",
  "DEFERRED_PROGRESSION_LINK",
  "DEFERRED_ANCHOR_SAFETY_NOTE",
]);

const WARNING_CODES = new Set<string>([
  "QUALITY_UNCOMMON_FAMILY",
  "QUALITY_HIGH_SETUP_COMPLEXITY",
  "QUALITY_TERMINAL_PROGRESSION",
]);

export const resolveProgramQualitySeverity = (
  code: string
): ProgramQualitySeverity => {
  if (CAPABILITY_LIMITATION_CODES.has(code) || /CAPABILITY_LIMIT/.test(code)) {
    return "capabilityLimitation";
  }
  if (DEFERRED_CODES.has(code) || code.startsWith("DEFERRED_")) {
    return "deferredContent";
  }
  if (WARNING_CODES.has(code) || code.startsWith("WARN_")) {
    return "warning";
  }
  if (HARD_PREFIXES.some((prefix) => code.startsWith(prefix))) {
    return "hardFailure";
  }
  return "warning";
};

export const USER_SAFE_QUALITY_MESSAGE =
  "We could not build a safe plan for your current equipment and preferences. Please adjust your equipment or pain answers and try again.";

export const listKnownSeverityCodes = () => ({
  capabilityLimitation: [...CAPABILITY_LIMITATION_CODES],
  deferredContent: [...DEFERRED_CODES],
  warning: [...WARNING_CODES],
  hardFailurePrefixes: [...HARD_PREFIXES],
});
