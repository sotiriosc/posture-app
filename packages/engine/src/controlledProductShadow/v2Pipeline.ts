import type { ControlledProductShadowArtifactReference, ControlledProductShadowPipelineResult,
  ControlledProductShadowRunStatus } from "@praxis/training-engine-v2";
import type { ControlledProductShadowMappingBundle, ControlledProductShadowV2PipelinePort,
  ProductLegacyProgramShadowProjection, ProductTrainingSnapshotShadowSource } from "./contracts";

export const CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER = Object.freeze([
  "week_source", "weekly_intent", "week_allocation", "planning_context", "session_intent",
  "candidate_intelligence", "session_composer", "prescription", "final_sequence", "gate_13",
  "phase_snapshot", "longitudinal", "application_orchestration",
] as const);
export type ControlledProductShadowV2Stage = typeof CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER[number];

export interface ControlledProductShadowV2StageResult {
  readonly status: "complete" | "incomplete_product_input" | "incomplete_policy" | "incomplete_mapping" |
    "search_inconclusive" | "blocked_training_safety" | "not_applicable";
  readonly artifactReference: ControlledProductShadowArtifactReference | null;
  readonly unresolvedRequirements: readonly string[];
}

export interface ControlledProductShadowV2StagePort {
  readonly stage: ControlledProductShadowV2Stage;
  readonly contractReference: { readonly contractId: string; readonly contractVersion: string };
  readonly evaluate: (context: {
    readonly athleteId: string;
    readonly source: ProductTrainingSnapshotShadowSource;
    readonly mappings: ControlledProductShadowMappingBundle;
    readonly legacyProjection: ProductLegacyProgramShadowProjection | null;
    readonly priorArtifacts: readonly ControlledProductShadowArtifactReference[];
    readonly evaluationTime: string;
  }) => Promise<ControlledProductShadowV2StageResult> | ControlledProductShadowV2StageResult;
}

function statusFor(result: ControlledProductShadowV2StageResult): ControlledProductShadowRunStatus {
  if (result.status === "incomplete_product_input") return "shadow_program_incomplete_product_input";
  if (result.status === "incomplete_policy") return "shadow_program_incomplete_policy";
  if (result.status === "incomplete_mapping") return "shadow_program_incomplete_mapping";
  if (result.status === "search_inconclusive") return "shadow_search_inconclusive";
  if (result.status === "blocked_training_safety") return "shadow_blocked_training_safety";
  return "shadow_longitudinal_not_applicable";
}

export function createControlledProductShadowV2Pipeline(input: {
  readonly stagePorts: readonly ControlledProductShadowV2StagePort[];
}): ControlledProductShadowV2PipelinePort {
  const byStage = new Map(input.stagePorts.map((port) => [port.stage, port]));
  if (byStage.size !== input.stagePorts.length || CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER.some((stage) =>
    !byStage.has(stage))) throw new Error("CONTROLLED_PRODUCT_SHADOW_EXPLICIT_STAGE_PORTS_REQUIRED");
  const pipeline: ControlledProductShadowV2PipelinePort = { evaluate: async (context) => {
    const artifacts: ControlledProductShadowArtifactReference[] = [];
    const unresolved = new Set<string>();
    let gate13Status: ControlledProductShadowPipelineResult["gate13Status"] = "not_evaluated";
    let phaseStatus: ControlledProductShadowPipelineResult["phaseStatus"] = "not_evaluated";
    let longitudinalStatus: ControlledProductShadowPipelineResult["longitudinalStatus"] = "not_evaluated";
    let orchestrationStatus: ControlledProductShadowPipelineResult["orchestrationStatus"] = "not_evaluated";
    for (const stage of CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER) {
      const result = await byStage.get(stage)!.evaluate({ ...context, priorArtifacts: Object.freeze([...artifacts]) });
      result.unresolvedRequirements.forEach((requirement) => unresolved.add(requirement));
      if (result.artifactReference) artifacts.push(result.artifactReference);
      if (stage === "gate_13") gate13Status = result.status === "complete" ? "passed" :
        result.status === "not_applicable" ? "not_evaluated" : result.status === "blocked_training_safety" ?
          "failed" : "incomplete";
      if (stage === "phase_snapshot" && result.status === "complete") phaseStatus = "remain";
      if (stage === "longitudinal") longitudinalStatus = result.status === "complete" ? "complete_unapplied" :
        result.status === "not_applicable" ? "not_applicable" : "restricted";
      if (stage === "application_orchestration") orchestrationStatus = result.status === "complete" ?
        "complete_unapplied" : result.status === "incomplete_policy" ? "pending_policy" :
          result.status === "not_applicable" ? "not_applicable" : "pending_human_review";
      if ((result.status !== "complete" &&
          !(stage === "longitudinal" || stage === "application_orchestration")) ||
          result.status === "blocked_training_safety") {
        return Object.freeze({ status: statusFor(result), runType: "product_program_generation_shadow",
          artifactReferences: Object.freeze(artifacts), unresolvedRequirements: Object.freeze([...unresolved].sort()),
          gate13Status, phaseStatus, longitudinalStatus, orchestrationStatus,
          productMutationApplied: false, applicationApplied: false });
      }
    }
    const status = orchestrationStatus === "complete_unapplied" ? "shadow_orchestration_complete_unapplied" :
      longitudinalStatus === "complete_unapplied" ? "shadow_longitudinal_complete_unapplied" :
        "shadow_program_complete";
    return Object.freeze({ status, runType: "combined_product_shadow", artifactReferences: Object.freeze(artifacts),
      unresolvedRequirements: Object.freeze([...unresolved].sort()), gate13Status, phaseStatus,
      longitudinalStatus, orchestrationStatus, productMutationApplied: false, applicationApplied: false });
  } };
  return Object.freeze(pipeline);
}

const conservativePipeline: ControlledProductShadowV2PipelinePort = {
  evaluate: async (input) => Object.freeze({ status: input.mappings.goal.status !== "mapped" ?
    "shadow_program_incomplete_product_input" : input.mappings.equipment.status === "mapping_required" ?
      "shadow_program_incomplete_mapping" : "shadow_program_incomplete_policy",
  runType: "product_program_generation_shadow", artifactReferences: Object.freeze([]),
  unresolvedRequirements: Object.freeze([...new Set([...input.mappings.unresolvedRequirements,
    "CONTROLLED_PRODUCT_SHADOW_PRODUCTION_STAGE_PORTS_REQUIRED"])].sort()), gate13Status: "not_evaluated",
  phaseStatus: "not_evaluated", longitudinalStatus: "not_evaluated", orchestrationStatus: "not_evaluated",
  productMutationApplied: false, applicationApplied: false }),
};
export const CONSERVATIVE_PRODUCT_SHADOW_V2_PIPELINE = Object.freeze(conservativePipeline);
