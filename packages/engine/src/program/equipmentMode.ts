import {
  normalizeEquipmentSelectionValues,
  type EquipmentSelection,
} from "@/lib/equipment";

/**
 * First-class program identity. Distinct from eligibility availability and from
 * the coarse physical capability bucket (`noneOnly | bandOnly | hasLoad`).
 */
export type PrimaryProgramEquipmentMode =
  | "gym"
  | "dumbbells"
  | "bands"
  | "bodyweight"
  | "mixedHome";

const LOAD_TOKENS_WITHOUT_GYM = new Set<EquipmentSelection>([
  "barbell",
  "kettlebell",
  "cables",
  "machines",
]);

const isPrimaryProgramEquipmentMode = (
  value: unknown
): value is PrimaryProgramEquipmentMode =>
  value === "gym" ||
  value === "dumbbells" ||
  value === "bands" ||
  value === "bodyweight" ||
  value === "mixedHome";

/**
 * Deterministic primary-mode resolution.
 *
 * Priority (order-independent; operates on a normalized set):
 * 1. `gym` present → `gym`
 * 2. `dumbbells` + `bands` (no gym) → `mixedHome`
 * 3. `dumbbells` → `dumbbells`
 * 4. `bands` + other non-gym load tools (barbell/kettlebell/cables/machines) → `mixedHome`
 * 5. `bands` → `bands`
 * 6. other non-gym load tools only → `dumbbells` (nearest loaded non-gym identity)
 * 7. otherwise → `bodyweight`
 *
 * Ambiguous / legacy combinations (documented):
 * - `gym` + anything → `gym` (full facility identity wins)
 * - `dumbbells` + `bands` → `mixedHome` (never gym)
 * - `barbell` / `kettlebell` / `cables` / `machines` without `gym` → not gym;
 *   nearest non-gym loaded identity is `dumbbells`, or `mixedHome` when bands are also present
 * - `bench` / `pullup_bar` / `foam_roller` alone → `bodyweight` (support tokens, not program identity)
 * - unknown / empty selection normalizes to `none` → `bodyweight`
 * - array order never affects the result
 */
export function resolvePrimaryProgramEquipmentMode(
  selection: readonly string[]
): PrimaryProgramEquipmentMode {
  const normalized = new Set(normalizeEquipmentSelectionValues([...selection]));
  const hasGym = normalized.has("gym");
  const hasDumbbells = normalized.has("dumbbells");
  const hasBands = normalized.has("bands");
  const hasOtherLoad = Array.from(normalized).some((token) =>
    LOAD_TOKENS_WITHOUT_GYM.has(token)
  );

  if (hasGym) return "gym";
  if (hasDumbbells && hasBands) return "mixedHome";
  if (hasDumbbells) return "dumbbells";
  if (hasBands && hasOtherLoad) return "mixedHome";
  if (hasBands) return "bands";
  if (hasOtherLoad) return "dumbbells";
  return "bodyweight";
}

/** Version-safe round-trip helper. Unknown values return null (never coerce to gym). */
export function parsePrimaryProgramEquipmentMode(
  value: unknown
): PrimaryProgramEquipmentMode | null {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (isPrimaryProgramEquipmentMode(token)) return token;
  // Legacy intent labels that may appear in older debug/export payloads.
  if (token === "none" || token === "no equipment" || token === "noneOnly") {
    return "bodyweight";
  }
  if (token === "bandOnly") return "bands";
  if (token === "hasLoad") return null;
  return null;
}

export function serializePrimaryProgramEquipmentMode(
  mode: PrimaryProgramEquipmentMode
): PrimaryProgramEquipmentMode {
  return mode;
}

/**
 * Phase 0 legacy mapping kept only for comparison audits.
 * Do not use for generation identity.
 */
export function deriveLegacyHasLoadIntentEquipmentMode(
  capabilityMode: "noneOnly" | "bandOnly" | "hasLoad"
): "none" | "bands" | "gym" {
  if (capabilityMode === "hasLoad") return "gym";
  if (capabilityMode === "bandOnly") return "bands";
  return "none";
}
