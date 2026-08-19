import { createHash } from "node:crypto";
import { GOAL_SPECIFIC_HOLDOUT_MANIFEST } from "./scenarioManifest";

export const HISTORICAL_PRODUCT_SHADOW_FINGERPRINT =
  "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c" as const;

export const GOAL_SPECIFIC_LOCKED_HOLDOUT_FINGERPRINT = createHash("sha256")
  .update(JSON.stringify(GOAL_SPECIFIC_HOLDOUT_MANIFEST)).digest("hex");

export function validateGoalSpecificLockedHoldout(): readonly string[] {
  const failures: string[] = [];
  const manifest = GOAL_SPECIFIC_HOLDOUT_MANIFEST;
  if (!manifest.lockedBeforeExecution || manifest.tuningAfterInspectionPermitted) {
    failures.push("GOAL_SPECIFIC_HOLDOUT_NOT_LOCKED");
  }
  if (manifest.scenarioCount < 850 || manifest.historicalV1GoldenCount < 300 ||
      manifest.newProfileMappingCount < 500 || manifest.genuinePipelineExecutionTarget < 450 ||
      manifest.completeOrCalibrationCompleteTarget < 300 || manifest.honestIncompleteTarget < 250 ||
      manifest.gate14ComparisonTarget < 250 || manifest.causalPairContractTarget < 200) {
    failures.push("GOAL_SPECIFIC_HOLDOUT_MINIMUM_NOT_MET");
  }
  return Object.freeze(failures);
}
