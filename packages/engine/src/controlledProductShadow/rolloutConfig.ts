import { CONTROLLED_PRODUCT_SHADOW_MODES, CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_REFERENCE,
  type ControlledProductShadowMode, type ControlledProductShadowRolloutPolicy } from "./contracts";

function parseAllowlist(raw: string | undefined): ReadonlySet<string> {
  return new Set((raw ?? "").split(",").map((value) => value.trim()).filter(Boolean));
}

export function resolveControlledProductShadowRolloutPolicy(input: {
  readonly mode: string | undefined;
  readonly allowlistedUserIds: string | undefined;
  readonly source?: ControlledProductShadowRolloutPolicy["source"];
}): ControlledProductShadowRolloutPolicy {
  const normalized = input.mode?.trim().toLowerCase();
  const mode: ControlledProductShadowMode = CONTROLLED_PRODUCT_SHADOW_MODES.includes(normalized as never) ?
    normalized as ControlledProductShadowMode : "off";
  return Object.freeze({ reference: CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_REFERENCE, mode,
    allowlistedUserIds: parseAllowlist(input.allowlistedUserIds),
    supportedAppSurfaces: Object.freeze(["consumer", "gyms"] as const), allUsersEnabled: false,
    percentageRollout: null, randomSampling: false, anonymousEligible: false, adminAllowlistReused: false,
    legacyAdaptiveFlagReused: false, source: input.source ?? "explicit_server_environment" });
}

export function resolveControlledProductShadowRolloutPolicyFromEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): ControlledProductShadowRolloutPolicy {
  return resolveControlledProductShadowRolloutPolicy({ mode: environment.PRAXIS_V2_SHADOW_MODE,
    allowlistedUserIds: environment.PRAXIS_V2_SHADOW_USER_IDS });
}

export function controlledProductShadowEligibility(input: {
  readonly policy: ControlledProductShadowRolloutPolicy;
  readonly authenticatedUserId: string | null;
  readonly appSurface: "consumer" | "gyms";
}): "off" | "ineligible" | "eligible" {
  if (input.policy.mode === "off" || input.policy.mode === "replay_only") return "off";
  if (!input.authenticatedUserId || !input.policy.allowlistedUserIds.has(input.authenticatedUserId) ||
      !input.policy.supportedAppSurfaces.includes(input.appSurface)) return "ineligible";
  return "eligible";
}
