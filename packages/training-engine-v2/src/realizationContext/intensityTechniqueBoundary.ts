import type {
  AdvancedIntensityTechniqueBoundaryResult,
  AdvancedIntensityTechniqueRequest,
} from "./contracts";

export function resolveAdvancedIntensityTechniqueBoundary(
  requests: readonly AdvancedIntensityTechniqueRequest[],
): AdvancedIntensityTechniqueBoundaryResult {
  return Object.freeze({
    status: requests.length > 0 ? "ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED" :
      "NO_TECHNIQUE_REQUESTED",
    requestIds: Object.freeze(requests.map((request) => request.requestId).sort()),
    productionPolicyCount: 0,
    compiledTechniqueCount: 0,
    flattenedTechniqueCount: 0,
    advancedStatusAuthorizedTechnique: false,
  });
}
export function validateAdvancedIntensityTechniqueRequest(
  request: AdvancedIntensityTechniqueRequest,
): readonly string[] {
  const reasons: string[] = [];
  if (!request.requestId.trim() || !request.exerciseId.trim() || !request.targetBlockId.trim()) {
    reasons.push("INTENSITY_TECHNIQUE_REQUEST_IDENTITY_REQUIRED");
  }
  if (request.provenance.length === 0) reasons.push("INTENSITY_TECHNIQUE_PROVENANCE_REQUIRED");
  if (request.technique === "unknown") reasons.push("INTENSITY_TECHNIQUE_REVIEW_REQUIRED");
  return Object.freeze(reasons);
}
