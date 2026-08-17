import type { OwnerDeliveryMode } from "@praxis/training-engine-v2";
import { readServerSession } from "../serverAuth";
import { getUserRepository, type UserRepository } from "../userRepository";
import type { AuthUser } from "../authTypes";
import type { ControlledOwnerEligibilityResult } from "./contracts";
import { resolveConfiguredOwnerEligibility } from "./eligibility";
import { resolveOwnerDeliveryModeFromEnvironment } from "./environment";

export interface ControlledOwnerRequestGateResult {
  readonly allowed: boolean;
  readonly mode: OwnerDeliveryMode;
  readonly userId: string | null;
  readonly reasonCode: ControlledOwnerEligibilityResult["reasonCode"] | "OWNER_DELIVERY_MODE_OFF" |
    "OWNER_DELIVERY_MODE_INSUFFICIENT";
  readonly sessionReadCount: 0 | 1;
  readonly databaseWriteCount: 0;
}

export async function resolveControlledOwnerRequestGate(input: {
  readonly operation: "read" | "preview" | "apply";
  readonly evaluationTime: string;
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly readSession?: () => Promise<AuthUser | null>;
  readonly userRepository?: Pick<UserRepository, "findUserByEmail">;
}): Promise<ControlledOwnerRequestGateResult> {
  const environment = input.environment ?? process.env;
  const mode = resolveOwnerDeliveryModeFromEnvironment(environment).mode;
  if (mode === "off") {
    return Object.freeze({ allowed: false, mode, userId: null, reasonCode: "OWNER_DELIVERY_MODE_OFF",
      sessionReadCount: 0, databaseWriteCount: 0 });
  }
  if (input.operation === "apply" && mode !== "apply") {
    return Object.freeze({ allowed: false, mode, userId: null, reasonCode: "OWNER_DELIVERY_MODE_INSUFFICIENT",
      sessionReadCount: 0, databaseWriteCount: 0 });
  }
  const eligibility = await resolveConfiguredOwnerEligibility({
    environment,
    readSession: input.readSession ?? readServerSession,
    userRepository: input.userRepository ?? getUserRepository(),
    evaluationTime: input.evaluationTime,
  });
  return Object.freeze({
    allowed: eligibility.eligible,
    mode,
    userId: eligibility.userId,
    reasonCode: eligibility.reasonCode,
    sessionReadCount: 1,
    databaseWriteCount: 0,
  });
}
