import type { ControlledProductShadowRunV1_1 } from "@praxis/training-engine-v2";
import type { ControlledProductShadowGoalRealizationRepository } from "./contracts";

export function createInMemoryControlledProductShadowGoalRealizationRepository():
ControlledProductShadowGoalRealizationRepository {
  const runs = new Map<string, ControlledProductShadowRunV1_1>();
  const repository: ControlledProductShadowGoalRealizationRepository = {
    append: async (run: ControlledProductShadowRunV1_1) => {
      if (run.deliveredToUser || run.performed || run.productMutationApplied || run.applicationApplied) {
        throw new Error("CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_APPLIED_STATE_REJECTED");
      }
      const prior = runs.get(run.runRevisionId);
      if (prior && prior !== run) throw new Error("CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_REVISION_CONFLICT");
      if (!prior) runs.set(run.runRevisionId, run);
    },
    read: async (athleteId: string, runRevisionId: string) => {
      const run = runs.get(runRevisionId);
      return run && run.athleteId === athleteId ? run : null;
    },
  };
  return Object.freeze(repository);
}
