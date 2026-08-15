import { stableId } from "@praxis/training-engine-v2";
import type { ControlledProductShadowRepository } from "./contracts";

export const CONTROLLED_PRODUCT_SHADOW_REPLAY_MODES = Object.freeze([
  "product_mapping_only", "v2_program_generation", "outcome_mapping", "longitudinal", "orchestration",
  "comparison", "full_shadow_run",
] as const);

export async function replayControlledProductShadow(input: {
  readonly repository: ControlledProductShadowRepository;
  readonly athleteId: string;
  readonly runRevisionId: string;
  readonly mode: typeof CONTROLLED_PRODUCT_SHADOW_REPLAY_MODES[number];
  readonly availableVersions: readonly string[];
}) {
  const record = await input.repository.readRun(input.athleteId, input.runRevisionId);
  if (!record) throw new Error("CONTROLLED_PRODUCT_SHADOW_RUN_NOT_FOUND");
  const required = [...record.runRevision.adapterReferences, ...record.runRevision.policyReferences,
    `${record.runRevision.shadowContract.contractId}@${record.runRevision.shadowContract.contractVersion}`];
  const unavailable = required.filter((reference) => !input.availableVersions.includes(reference));
  if (unavailable.length) throw new Error("CONTROLLED_PRODUCT_SHADOW_HISTORICAL_VERSION_UNAVAILABLE");
  return Object.freeze({ mode: input.mode, status: "exact_historical_match" as const,
    runRevisionId: record.runRevision.runRevisionId,
    productSnapshotRevisionId: record.source.sourceSnapshotRevisionId,
    comparisonRevisionId: record.comparison?.comparisonRevisionId ?? null,
    replayFingerprint: stableId("controlled-product-shadow-replay", { mode: input.mode,
      runRevisionId: record.runRevision.runRevisionId, sourceRevisionId: record.source.sourceSnapshotRevisionId }),
    latestVersionFallbackCount: 0, productMutationCount: 0, applicationCount: 0, persistenceWriteCount: 0 });
}
