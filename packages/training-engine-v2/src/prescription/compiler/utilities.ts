import type { EvidenceProvenance } from "../types";

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

export function sameSemanticValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function fnv1a(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function deterministicToken(value: unknown): string {
  const source = JSON.stringify(canonicalize(value));
  const left = fnv1a(source, 0x811c9dc5).toString(16).padStart(8, "0");
  const right = fnv1a(source, 0x9e3779b9).toString(16).padStart(8, "0");
  return `${left}${right}`;
}

export function stableId(prefix: string, components: unknown): string {
  return `${prefix}:${deterministicToken(components)}`;
}

export function productionProvenance(
  sourceRef: string,
  notes?: string,
): EvidenceProvenance {
  return { source: "prescription_contract", sourceRef, notes };
}

export function explicitIsoTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

export function numericBounds(
  target: { readonly kind: string; readonly value?: number; readonly min?: number; readonly max?: number } | null | undefined,
): readonly [number, number] | null {
  if (target?.kind === "exact" && typeof target.value === "number") {
    return [target.value, target.value];
  }
  if (
    target?.kind === "range" &&
    typeof target.min === "number" &&
    typeof target.max === "number"
  ) {
    return [target.min, target.max];
  }
  return null;
}
