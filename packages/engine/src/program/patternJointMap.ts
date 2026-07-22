/**
 * Phase 3W — Pattern → Joint Map
 *
 * Canonical source of truth for which joints are loaded by each main movement
 * pattern.  Ratified by Sotirios for the Phase 3W warmup contract.
 *
 * Imported by:
 *  - warmupPlanner.ts  (MOBILIZE block selection, protective-injection overlay)
 *  - Any future feature that needs to know which joints a given pattern loads.
 *
 * Amendments:
 *  - 2026-07-12: elbows/wrists/grip trimmed from the map.  These are not
 *    authored as dedicated mobilizers; they are covered by the RAMP and the
 *    first PRIME exercise (unloaded pattern rehearsal).
 */

/** Joints addressed by each canonical main pattern. */
export const PATTERN_JOINT_MAP: Readonly<Record<string, readonly string[]>> = {
  hinge:           ["hips", "hamstrings", "lower back"],
  knee_dominant:   ["knees", "hips", "ankles"],
  horizontal_push: ["shoulders", "thoracic spine"],
  vertical_push:   ["shoulders", "thoracic spine"],
  horizontal_pull: ["shoulders", "scapulae"],
  vertical_pull:   ["shoulders", "scapulae"],
  core_stability:  ["trunk/spine", "hips"],
  // carry_load has no dedicated MOBILIZE block (SR-3: carry prep folds into ramp)
  carry_load:      [],
};

/**
 * Return the (deduplicated) list of joints loaded by one pattern.
 * Returns [] for unknown patterns.
 */
export const getJointsForPattern = (pattern: string): string[] =>
  [...(PATTERN_JOINT_MAP[pattern] ?? [])];

/**
 * Return the deduplicated union of joints loaded by all supplied patterns.
 * Preserves insertion order of the first occurrence of each joint.
 */
export const getJointsForPatterns = (patterns: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const pattern of patterns) {
    for (const joint of PATTERN_JOINT_MAP[pattern] ?? []) {
      if (!seen.has(joint)) {
        seen.add(joint);
        result.push(joint);
      }
    }
  }
  return result;
};
