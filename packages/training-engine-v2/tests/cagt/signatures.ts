import { createHash } from "node:crypto";
import type { CagtDifferenceDimension, CagtGateSnapshot } from "./contracts";
import { canonicalize } from "./diff";

export interface CagtFrameworkSignature {
  readonly opportunityCount: number;
  readonly reservationCount: number;
  readonly dominantResponsibilityPattern: readonly string[];
  readonly stableAnchorPattern: readonly string[];
}
export interface CagtAdaptiveSignatures {
  readonly horizon: unknown; readonly weeklyResponsibility: unknown; readonly weeklyAllocation: unknown;
  readonly reservation: unknown; readonly materializedDirective: unknown; readonly sessionIntent: unknown;
  readonly candidateLegality: unknown; readonly candidateOrderReadiness: unknown; readonly sessionSkeleton: unknown;
  readonly prescriptionHandoff: unknown; readonly sequencingHandoff: unknown; readonly responseEvidence: unknown;
}

export function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}
export function frameworkSignature(input: Partial<CagtFrameworkSignature>): CagtFrameworkSignature {
  return { opportunityCount: input.opportunityCount ?? 0, reservationCount: input.reservationCount ?? 0,
    dominantResponsibilityPattern: [...(input.dominantResponsibilityPattern ?? [])],
    stableAnchorPattern: [...(input.stableAnchorPattern ?? [])].sort() };
}
export function gateSnapshot(dimensions: Partial<Record<CagtDifferenceDimension, unknown>>): CagtGateSnapshot {
  return { dimensions: canonicalize(dimensions) as Partial<Record<CagtDifferenceDimension, unknown>> };
}
export function adaptiveSignatureHashes(signatures: CagtAdaptiveSignatures): Readonly<Record<keyof CagtAdaptiveSignatures, string>> {
  return Object.fromEntries(Object.entries(signatures).map(([key, value]) => [key, digest(value)])) as
    Readonly<Record<keyof CagtAdaptiveSignatures, string>>;
}
export function collisionRate(signatures: readonly unknown[]): number {
  if (signatures.length < 2) return 0;
  return 1 - new Set(signatures.map(digest)).size / signatures.length;
}
