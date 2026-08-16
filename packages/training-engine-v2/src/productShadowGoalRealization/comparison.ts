import { stableId } from "../prescription/compiler/utilities";
import { CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE,
  PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER,
  type ControlledProductShadowComparisonV1_1,
  type ProductShadowGoalRealizationDifferenceDimension } from "./contracts";

export function createControlledProductShadowComparisonV1_1(input: {
  readonly mappingFingerprint: string;
  readonly dimensions: readonly { readonly dimension: ProductShadowGoalRealizationDifferenceDimension;
    readonly state: "same" | "different" | "unresolved" | "not_comparable";
    readonly reasonCodes: readonly string[] }[];
  readonly unresolvedRequirements: readonly string[];
  readonly legacyProgramStructuralComparison: "available" | "unavailable" | "partial";
}): ControlledProductShadowComparisonV1_1 {
  const dimensions = Object.freeze([...input.dimensions].sort((left, right) =>
    PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER.indexOf(left.dimension) -
    PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER.indexOf(right.dimension)));
  const firstMeaningfulDifference = PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER.find((dimension) =>
    dimensions.some((entry) => entry.dimension === dimension && entry.state !== "same")) ?? null;
  const semantic = Object.freeze({ comparisonReference: CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE,
    historicalMappingReference: "CONTROLLED_PRODUCT_SHADOW_RUN@1.0.0" as const,
    goalRealizationMappingFingerprint: input.mappingFingerprint, dimensions, firstMeaningfulDifference,
    unresolvedRequirements: Object.freeze([...new Set(input.unresolvedRequirements)].sort()),
    legacyProgramStructuralComparison: input.legacyProgramStructuralComparison,
    weightedBetterScore: null, outcomeSuperiorityClaimed: false as const, noRescueAccepted: true as const,
    counterfactualOnly: true as const });
  const fingerprint = stableId("controlled-product-shadow-comparison-v1-1", semantic);
  return Object.freeze({ ...semantic, comparisonId: `shadow-comparison-v1-1:${fingerprint}`, fingerprint });
}
