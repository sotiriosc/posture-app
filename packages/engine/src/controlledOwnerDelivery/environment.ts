import { resolveOwnerDeliveryMode } from "@praxis/training-engine-v2";

export const OWNER_DELIVERY_MODE_ENVIRONMENT_VARIABLE = "PRAXIS_V2_OWNER_DELIVERY_MODE" as const;

export function resolveOwnerDeliveryModeFromEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  return resolveOwnerDeliveryMode(environment[OWNER_DELIVERY_MODE_ENVIRONMENT_VARIABLE]);
}
