import { stableId } from "../prescription/compiler/utilities";
import type { ControlledProductShadowComparison, ControlledProductShadowRunRevision } from "./contracts";

export function deriveControlledProductShadowRunId(input: {
  readonly contract: unknown;
  readonly athleteId: string;
  readonly productStateLineage: string;
  readonly triggerFamily: string;
  readonly anchorEntityId: string | null;
  readonly runAttemptId: string;
}): string {
  return stableId("controlled-product-shadow-run", input);
}

export function deriveControlledProductShadowRunRevisionId(
  input: Omit<ControlledProductShadowRunRevision, "runRevisionId" | "provenance">,
): string {
  return stableId("controlled-product-shadow-run-revision", input);
}

export function deriveControlledProductShadowComparisonId(input: {
  readonly legacyProgramRevisionId: string | null;
  readonly v2ProgramRevisionId: string | null;
  readonly runId: string;
}): string {
  return stableId("controlled-product-shadow-comparison", input);
}

export function deriveControlledProductShadowComparisonRevisionId(
  input: Omit<ControlledProductShadowComparison, "comparisonRevisionId" | "provenance">,
): string {
  return stableId("controlled-product-shadow-comparison-revision", input);
}
