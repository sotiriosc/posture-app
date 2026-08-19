import { CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE,
  PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE, stableId,
  validateControlledProductShadowRunV1_1,
  validateProductShadowGoalRealizationMappingBundle,
  type ControlledProductShadowRunV1_1 } from "@praxis/training-engine-v2";
import { buildProductSnapshotReference } from "../controlledProductShadow/productSnapshotAdapter";
import { mapProductEquipment, mapProductGoal, mapProductTrainingIntent } from
  "../controlledProductShadow/mappings";
import { compareHistoricalV1WithGoalRealizationV1 } from "./comparison";
import type { ControlledProductShadowGoalRealizationServiceDependencies,
  ControlledProductShadowGoalRealizationServiceResult,
  ProductGoalRealizationFixtureExtensions } from "./contracts";
import { validateControlledProductShadowGoalRealizationProfile } from "./mappingProfile";

export function createControlledProductShadowGoalRealizationServiceV1(
  dependencies: ControlledProductShadowGoalRealizationServiceDependencies,
) {
  const profileReasons = validateControlledProductShadowGoalRealizationProfile(dependencies.profile);
  if (profileReasons.length) throw new Error(profileReasons[0]);
  if (dependencies.pipeline.profileReference.contractId !== dependencies.profile.pipelineProfileReference.contractId ||
      dependencies.pipeline.profileReference.contractVersion !==
      dependencies.profile.pipelineProfileReference.contractVersion) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_VERSION_UNAVAILABLE");
  }
  return Object.freeze({ run: async (input: { readonly authenticatedUserId: string;
    readonly appSurface: "consumer" | "gyms";
    readonly evaluationTime: string;
    readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
  }): Promise<ControlledProductShadowGoalRealizationServiceResult> => {
    if (!input.authenticatedUserId.trim()) throw new Error("AUTHENTICATED_PRODUCT_SOURCE_REQUIRED");
    const athleteId = input.authenticatedUserId;
    const snapshot = await dependencies.loadProductSnapshot(athleteId);
    const reference = buildProductSnapshotReference(snapshot);
    const activeProgramId = dependencies.resolveActiveProgramId(snapshot);
    const mappingBundle = dependencies.mappingBuilder({ athleteId,
      questionnaire: snapshot.questionnaire && typeof snapshot.questionnaire === "object" ?
        snapshot.questionnaire : null,
      assessment: snapshot.assessment && typeof snapshot.assessment === "object" ? snapshot.assessment : null,
      preferences: snapshot.prefs ?? null, programs: snapshot.programs ?? [], sessions: snapshot.sessions ?? [],
      exerciseLogs: snapshot.exerciseLogs ?? [], activeProgramId,
      productStateRevision: reference.productStateRevisionFingerprint, evaluationTime: input.evaluationTime,
      fixtureExtensions: input.fixtureExtensions });
    const mappingReasons = validateProductShadowGoalRealizationMappingBundle(mappingBundle);
    if (mappingReasons.length) throw new Error(mappingReasons[0]);
    const pipelineResult = await dependencies.pipeline.evaluate({ athleteId,
      mappingBundle, evaluationTime: input.evaluationTime });
    const questionnaire = snapshot.questionnaire && typeof snapshot.questionnaire === "object" ?
      snapshot.questionnaire : null;
    const historicalGoal = mapProductGoal(questionnaire);
    const historicalIntent = mapProductTrainingIntent(questionnaire);
    const historicalEquipment = mapProductEquipment(questionnaire);
    const comparison = compareHistoricalV1WithGoalRealizationV1({ mappingBundle, pipelineResult,
      historicalMappingSummary: { goalStatus: historicalGoal.status, primaryGoal: historicalGoal.primaryGoal,
        trainingIntentStatus: historicalIntent.status, equipmentStatus: historicalEquipment.status,
        legacyProgramAvailable: activeProgramId !== null } });
    const sourceSnapshotRevision = stableId("controlled-product-shadow-goal-realization-source", {
      athleteId, productStateRevision: reference.productStateRevisionFingerprint,
      evaluationTime: input.evaluationTime,
    });
    const runId = stableId("controlled-product-shadow-run-v1-1", { athleteId,
      sourceSnapshotRevision, mappingFingerprint: mappingBundle.mappingFingerprint,
      pipelineProfile: dependencies.profile.pipelineProfileReference });
    const sourceTriggerRevisionId = stableId("controlled-product-shadow-goal-realization-trigger", {
      athleteId, appSurface: input.appSurface, runId, productStateRevision: reference.productStateRevisionFingerprint,
    });
    const semantic = Object.freeze({ runReference: CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE,
      runId, athleteId, appSurface: input.appSurface, sourceTriggerRevisionId, sourceSnapshotRevision,
      productStateRevision: reference.productStateRevisionFingerprint,
      mappingProfileReference: dependencies.profile.reference,
      mappingContractReferences: dependencies.profile.mappingContractReferences,
      pipelineProfileReference: dependencies.profile.pipelineProfileReference,
      stageContractReferences: dependencies.pipeline.stageReferences,
      planningBriefPolicyReference: PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE,
      b1B4References: dependencies.profile.b1B4References, comparisonReference: comparison.comparisonReference,
      mappingBundle, comparison, pipelineStatus: pipelineResult.status,
      unresolvedRequirements: Object.freeze([...new Set([
        ...mappingBundle.unresolvedRequirements, ...pipelineResult.unresolvedRequirements,
      ])].sort()), evaluationTime: input.evaluationTime, counterfactualOnly: true as const,
      deliveredToUser: false as const, performed: false as const, productMutationApplied: false as const,
      applicationApplied: false as const, provenance: Object.freeze(["explicit-shadow-profile-construction",
        "server-loaded-product-truth", "legacy-product-output:sole-user-authority"]) });
    const run = Object.freeze({ ...semantic, runRevisionId:
      stableId("controlled-product-shadow-run-revision-v1-1", semantic) }) satisfies ControlledProductShadowRunV1_1;
    const runReasons = validateControlledProductShadowRunV1_1(run);
    if (runReasons.length) throw new Error(runReasons[0]);
    const reloaded = await dependencies.loadProductSnapshot(athleteId);
    if (buildProductSnapshotReference(reloaded).productStateRevisionFingerprint !==
        reference.productStateRevisionFingerprint) return Object.freeze({ status: "shadow_source_conflict",
      runRevisionId: null, mappingReadiness: mappingBundle.readiness.primaryState,
      clientArtifactCount: 0, productMutationCount: 0, applicationCount: 0 });
    await dependencies.repository.append(run);
    return Object.freeze({ status: pipelineResult.status, runRevisionId: run.runRevisionId,
      mappingReadiness: mappingBundle.readiness.primaryState, clientArtifactCount: 0,
      productMutationCount: 0, applicationCount: 0 });
  } });
}
