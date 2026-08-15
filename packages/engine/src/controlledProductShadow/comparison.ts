import { createControlledProductShadowComparison,
  type ControlledProductShadowComparisonDimension, type ControlledProductShadowPipelineResult } from
  "@praxis/training-engine-v2";
import type { ProductLegacyProgramShadowProjection } from "./contracts";

export function compareLegacyProductWithV2Shadow(input: {
  readonly runId: string;
  readonly legacyProjection: ProductLegacyProgramShadowProjection | null;
  readonly pipeline: ControlledProductShadowPipelineResult;
}) {
  const v2Program = [...input.pipeline.artifactReferences].reverse().find((entry) =>
    entry.artifactType === "phase_program_snapshot" || entry.artifactType === "prescribed_program") ?? null;
  const dimensions: ControlledProductShadowComparisonDimension[] = [
    { dimension: "product_input_mapping", state: input.pipeline.unresolvedRequirements.length ? "unresolved" : "same",
      legacyReferences: [], v2References: [], reasonCodes: input.pipeline.unresolvedRequirements },
    { dimension: "weekly_responsibility", state: input.pipeline.gate13Status === "passed" ? "different" :
      "not_comparable", legacyReferences: input.legacyProjection ? [input.legacyProjection.programRevisionId] : [],
      v2References: v2Program ? [v2Program.artifactRevisionId] : [], reasonCodes: [] },
    { dimension: "source_event_block_structure", state: "not_comparable", legacyReferences: [], v2References: [],
      reasonCodes: ["LEGACY_PROGRAM_PROJECTION_INCOMPLETE_FOR_GATE_14"] },
    { dimension: "prescription", state: v2Program ? "different" : "not_comparable", legacyReferences: [],
      v2References: v2Program ? [v2Program.artifactRevisionId] : [], reasonCodes: [] },
  ];
  return createControlledProductShadowComparison({ runId: input.runId,
    legacyProgramRevisionId: input.legacyProjection?.programRevisionId ?? null,
    v2ProgramRevisionId: v2Program?.artifactRevisionId ?? null, dimensions,
    gate14Compatibility: input.legacyProjection?.unresolvedMappings.length === 0 && v2Program ? "compatible" : "partial",
    unresolvedMappings: input.legacyProjection?.unresolvedMappings ?? [],
    provenance: ["controlled-product-shadow:causal-structural-comparison", "no-weighted-better-score"] });
}
