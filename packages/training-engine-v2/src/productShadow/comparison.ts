import { uniqueSorted } from "../prescription/compiler/utilities";
import { CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY,
  type ControlledProductShadowComparison,
  type ControlledProductShadowComparisonDimension,
  type ControlledProductShadowDifferenceClass } from "./contracts";
import { deriveControlledProductShadowComparisonId,
  deriveControlledProductShadowComparisonRevisionId } from "./identities";

export function createControlledProductShadowComparison(input: {
  readonly runId: string;
  readonly legacyProgramRevisionId: string | null;
  readonly v2ProgramRevisionId: string | null;
  readonly dimensions: readonly ControlledProductShadowComparisonDimension[];
  readonly differenceClass?: ControlledProductShadowDifferenceClass;
  readonly gate14Compatibility: ControlledProductShadowComparison["gate14Compatibility"];
  readonly unresolvedMappings: readonly string[];
  readonly provenance: readonly string[];
}): ControlledProductShadowComparison {
  const dimensions = Object.freeze([...input.dimensions].sort((left, right) =>
    CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY.indexOf(left.dimension) -
    CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY.indexOf(right.dimension)));
  const firstMeaningfulDifference = CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY.find((dimension) =>
    dimensions.some((entry) => entry.dimension === dimension && entry.state !== "same")) ?? null;
  const differenceClass = input.differenceClass ?? (firstMeaningfulDifference === null ?
    "justified_convergence" : dimensions.some((entry) => entry.state === "unresolved" || entry.state === "not_comparable") ?
      "incomplete_comparison" : "v2_supported_material_difference");
  const comparisonId = deriveControlledProductShadowComparisonId({ legacyProgramRevisionId:
    input.legacyProgramRevisionId, v2ProgramRevisionId: input.v2ProgramRevisionId, runId: input.runId });
  const semantic = Object.freeze({ comparisonContract: CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE,
    comparisonId, legacyProgramRevisionId: input.legacyProgramRevisionId,
    v2ProgramRevisionId: input.v2ProgramRevisionId, dimensions, firstMeaningfulDifference,
    differenceClass, gate14Compatibility: input.gate14Compatibility,
    unresolvedMappings: Object.freeze(uniqueSorted(input.unresolvedMappings)), noRescueAccepted: true as const,
    weightedBetterScore: null, outcomeSuperiorityClaimed: false as const });
  return Object.freeze({ ...semantic, comparisonRevisionId:
    deriveControlledProductShadowComparisonRevisionId(semantic), provenance: Object.freeze(input.provenance) });
}
