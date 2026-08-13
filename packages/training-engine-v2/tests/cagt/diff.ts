import { CAGT_NON_MATERIAL_DIMENSIONS, type CagtDifferenceDimension } from "./contracts";

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalize(entry)]));
  return value;
}
export function semanticallyEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function paths(left: unknown, right: unknown, prefix = ""): string[] {
  if (semanticallyEqual(left, right)) return [];
  if (!left || !right || typeof left !== "object" || typeof right !== "object" || Array.isArray(left) || Array.isArray(right)) {
    return [prefix || "$root"];
  }
  const keys = [...new Set([...Object.keys(left as object), ...Object.keys(right as object)])].sort();
  return keys.flatMap((key) => paths((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key],
    prefix ? `${prefix}.${key}` : key));
}
export function fixtureDifferencePaths(left: unknown, right: unknown, ignoredPaths: readonly string[] = []): readonly string[] {
  return paths(left, right).filter((path) => !ignoredPaths.includes(path)).sort();
}
export function validateFixtureDifference(input: { baseline: unknown; counterfactual: unknown; declaredPaths: readonly string[];
  ignoredPaths?: readonly string[] }): { readonly valid: boolean; readonly actualPaths: readonly string[]; readonly reasonCode: string } {
  const actualPaths = fixtureDifferencePaths(input.baseline, input.counterfactual, input.ignoredPaths);
  const valid = semanticallyEqual(actualPaths, [...input.declaredPaths].sort());
  return { valid, actualPaths, reasonCode: valid ? "FIXTURE_DIFF_VALID" : "FIXTURE_DIFF_INVALID" };
}
export function differingDimensions(left: Partial<Record<CagtDifferenceDimension, unknown>>,
  right: Partial<Record<CagtDifferenceDimension, unknown>>): readonly CagtDifferenceDimension[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter((key) => !semanticallyEqual(left[key as CagtDifferenceDimension], right[key as CagtDifferenceDimension]))
    .sort() as CagtDifferenceDimension[];
}
export function materialDimensions(dimensions: readonly CagtDifferenceDimension[]): readonly CagtDifferenceDimension[] {
  return dimensions.filter((dimension) => !CAGT_NON_MATERIAL_DIMENSIONS.includes(dimension));
}
