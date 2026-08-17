import { OWNER_DELIVERY_CONTRACTS, type OwnerDeliveryMode } from "./contracts";

export interface OwnerDeliveryModeResolution {
  readonly contract: typeof OWNER_DELIVERY_CONTRACTS.modePolicy;
  readonly mode: OwnerDeliveryMode;
  readonly configured: boolean;
  readonly accepted: boolean;
}

export function resolveOwnerDeliveryMode(raw: string | null | undefined): OwnerDeliveryModeResolution {
  const normalized = raw?.trim().toLowerCase() ?? "";
  const accepted = normalized === "off" || normalized === "preview" || normalized === "apply";
  return Object.freeze({
    contract: OWNER_DELIVERY_CONTRACTS.modePolicy,
    mode: accepted ? normalized : "off",
    configured: normalized.length > 0,
    accepted,
  } as OwnerDeliveryModeResolution);
}

export function ownerModeAllows(mode: OwnerDeliveryMode, operation: "read" | "preview" | "apply"): boolean {
  if (mode === "off") return false;
  if (operation === "apply") return mode === "apply";
  return true;
}
