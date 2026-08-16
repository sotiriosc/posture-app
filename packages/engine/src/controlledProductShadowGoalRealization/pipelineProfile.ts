import { CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE,
  type GoalRealizationContractReference } from "@praxis/training-engine-v2";
import { PRODUCT_SHADOW_B1_B4_STAGE_ORDER, type ControlledProductShadowB1B4PipelinePort,
  type ProductShadowB1B4PipelineResult, type ProductShadowB1B4StagePort } from "./contracts";

export const CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4 = Object.freeze({
  reference: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE,
  mappingProfileReference: Object.freeze({ contractId: "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING",
    contractVersion: "1.0.0" }),
  planningBriefPolicyReference: Object.freeze({ contractId: "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1",
    contractVersion: "1.0.0" }),
  stageReferences: Object.freeze([
    { contractId: "PRODUCT_GOAL_ARCHITECTURE_SHADOW_PLANNING_BRIEF", contractVersion: "1.0.0" },
    { contractId: "PRODUCTION_WEEKLY_INTENT_PLANNER", contractVersion: "1.1.0" },
    { contractId: "PRODUCTION_WEEK_ALLOCATION_COMPOSER", contractVersion: "1.1.0" },
    { contractId: "PRODUCTION_WEEK_PLAN_MATERIALIZER", contractVersion: "1.1.0" },
    { contractId: "SESSION_INTENT_PLANNER_PRODUCTION_KERNEL", contractVersion: "1.0.0" },
    { contractId: "CANDIDATE_INTELLIGENCE_PRODUCTION_KERNEL", contractVersion: "1.0.0" },
    { contractId: "SESSION_COMPOSER_PRODUCTION_KERNEL", contractVersion: "1.0.0" },
    { contractId: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL", contractVersion: "1.3.0" },
    { contractId: "PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL", contractVersion: "1.0.0" },
    { contractId: "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL", contractVersion: "1.2.0" },
    { contractId: "PRODUCTION_PHASE_CONTINUITY_KERNEL", contractVersion: "1.0.0" },
    { contractId: "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL", contractVersion: "1.0.0" },
    { contractId: "ADAPTATION_APPLICATION_ORCHESTRATION", contractVersion: "1.0.0" },
  ] as readonly GoalRealizationContractReference[]),
  purposeResolverReference: Object.freeze({ contractId: "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_SUPPORTED_CORE",
    contractVersion: "1.1.0" }),
  prescriptionPolicyReference: Object.freeze({ contractId: "PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE",
    contractVersion: "2.0.0" }),
  comparisonReference: Object.freeze({ contractId: "CONTROLLED_PRODUCT_SHADOW_COMPARISON",
    contractVersion: "1.1.0" }),
  evaluationTimeRequired: true,
  explicitSelectionOnly: true,
  hiddenStagePortCount: 0,
  defaultSelected: false,
  applicationAuthorized: false,
});

function preflightStatus(state: string): ProductShadowB1B4PipelineResult["status"] | null {
  if (["primary_outcome_follow_up_required", "purpose_bundle_follow_up_required", "availability_incomplete",
    "experience_context_incomplete"].includes(state)) return "shadow_program_incomplete_product_input";
  if (state === "training_mode_policy_required" || state === "unsupported_scope") {
    return "shadow_program_incomplete_policy";
  }
  if (["equipment_capability_incomplete", "equipment_realization_incomplete",
    "exercise_mapping_incomplete", "mapping_conflict"].includes(state)) return "shadow_program_incomplete_mapping";
  return null;
}

function failedResult(status: ProductShadowB1B4PipelineResult["status"],
  unresolved: readonly string[], firstStoppedStage: ProductShadowB1B4PipelineResult["firstStoppedStage"],
  completedStages: ProductShadowB1B4PipelineResult["completedStages"],
  artifacts: ProductShadowB1B4PipelineResult["artifacts"]): ProductShadowB1B4PipelineResult {
  return Object.freeze({ status, completedStages, artifacts,
    unresolvedRequirements: Object.freeze([...new Set(unresolved)].sort()), firstStoppedStage,
    gate13Status: status === "shadow_blocked_training_safety" ? "failed" :
      completedStages.includes("gate_13") ? "passed" : "not_evaluated",
    longitudinalStatus: completedStages.includes("longitudinal") ? "restricted" : "not_evaluated",
    orchestrationStatus: completedStages.includes("application_orchestration") ? "not_applicable" : "not_evaluated",
    deliveredToUser: false, performed: false, productMutationApplied: false, applicationApplied: false });
}

export function createControlledProductShadowB1B4Pipeline(input: {
  readonly profile: typeof CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4;
  readonly stagePorts: readonly ProductShadowB1B4StagePort[];
}): ControlledProductShadowB1B4PipelinePort {
  if (input.profile.reference.contractId !== CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE.contractId ||
      input.profile.reference.contractVersion !== CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE.contractVersion ||
      !input.profile.explicitSelectionOnly || input.profile.defaultSelected) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_VERSION_UNAVAILABLE");
  }
  const byStage = new Map(input.stagePorts.map((port) => [port.stage, port]));
  if (byStage.size !== PRODUCT_SHADOW_B1_B4_STAGE_ORDER.length || input.stagePorts.length !== byStage.size ||
      PRODUCT_SHADOW_B1_B4_STAGE_ORDER.some((stage, index) => {
        const port = byStage.get(stage);
        const expected = input.profile.stageReferences[index]!;
        return !port || port.contractReference.contractId !== expected.contractId ||
          port.contractReference.contractVersion !== expected.contractVersion;
      })) throw new Error("CONTROLLED_PRODUCT_SHADOW_EXPLICIT_B1_B4_STAGE_PORTS_REQUIRED");

  const pipeline: ControlledProductShadowB1B4PipelinePort = { profileReference: input.profile.reference,
    stageReferences: input.profile.stageReferences,
    evaluate: async ({ athleteId, mappingBundle, evaluationTime }) => {
      const preflight = preflightStatus(mappingBundle.readiness.primaryState);
      if (preflight) return failedResult(preflight, mappingBundle.unresolvedRequirements, "week_source",
        Object.freeze([]), Object.freeze([]));
      const artifacts: ProductShadowB1B4PipelineResult["artifacts"][number][] = [];
      const completed: typeof PRODUCT_SHADOW_B1_B4_STAGE_ORDER[number][] = [];
      const unresolved = new Set<string>();
      for (const stage of PRODUCT_SHADOW_B1_B4_STAGE_ORDER) {
        const result = await byStage.get(stage)!.evaluate({ athleteId, mappingBundle,
          priorArtifacts: Object.freeze([...artifacts]), evaluationTime });
        result.unresolvedRequirements.forEach((reason) => unresolved.add(reason));
        if (result.artifactReference) artifacts.push(result.artifactReference);
        if (result.status === "complete" || result.status === "not_applicable") {
          completed.push(stage);
          continue;
        }
        const status = result.status === "incomplete_product_input" ? "shadow_program_incomplete_product_input" :
          result.status === "incomplete_policy" ? "shadow_program_incomplete_policy" :
          result.status === "incomplete_mapping" ? "shadow_program_incomplete_mapping" :
          result.status === "search_inconclusive" ? "shadow_search_inconclusive" :
            "shadow_blocked_training_safety";
        return failedResult(status, [...unresolved], stage, Object.freeze(completed), Object.freeze(artifacts));
      }
      const status = mappingBundle.readiness.primaryState === "complete_with_self_selected_calibration" ?
        "shadow_program_complete_with_self_selected_calibration" : "shadow_program_complete";
      return failedResult(status, [...unresolved], null, Object.freeze(completed), Object.freeze(artifacts));
    } };
  return Object.freeze(pipeline);
}
