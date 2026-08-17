import type { OwnerDeliveryMode } from "@praxis/training-engine-v2";
import { readServerSession } from "../serverAuth";
import { getUserRepository, type UserRepository } from "../userRepository";
import type { AuthUser } from "../authTypes";
import type { ControlledOwnerEligibilityResult } from "./contracts";
import { resolveConfiguredOwnerEligibility } from "./eligibility";
import { resolveOwnerDeliveryModeFromEnvironment } from "./environment";
import { buildControlledOwnerObservabilityEvent, NOOP_CONTROLLED_OWNER_OBSERVABILITY,
  type ControlledOwnerObservability } from "./observability";

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
  readonly observability?: ControlledOwnerObservability;
}): Promise<ControlledOwnerRequestGateResult> {
  const environment = input.environment ?? process.env;
  const mode = resolveOwnerDeliveryModeFromEnvironment(environment).mode;
  const observability = input.observability ?? NOOP_CONTROLLED_OWNER_OBSERVABILITY;
  if (mode === "off") {
    await observability.emit(buildControlledOwnerObservabilityEvent({ name: "kill_switch",
      occurredAt: input.evaluationTime, userId: null, recordId: null, contractVersion: "1.0.0",
      mode, state: "suspended", reasonCodes: ["OWNER_DELIVERY_MODE_OFF"], latencyMs: null,
      fingerprint: null, appSurface: null }));
    return Object.freeze({ allowed: false, mode, userId: null, reasonCode: "OWNER_DELIVERY_MODE_OFF",
      sessionReadCount: 0, databaseWriteCount: 0 });
  }
  if (input.operation === "apply" && mode !== "apply") {
    await observability.emit(buildControlledOwnerObservabilityEvent({ name: "eligibility_result",
      occurredAt: input.evaluationTime, userId: null, recordId: null, contractVersion: "1.0.0",
      mode, state: "ineligible", reasonCodes: ["OWNER_DELIVERY_MODE_INSUFFICIENT"], latencyMs: null,
      fingerprint: null, appSurface: null }));
    return Object.freeze({ allowed: false, mode, userId: null, reasonCode: "OWNER_DELIVERY_MODE_INSUFFICIENT",
      sessionReadCount: 0, databaseWriteCount: 0 });
  }
  const eligibility = await resolveConfiguredOwnerEligibility({
    environment,
    readSession: input.readSession ?? readServerSession,
    userRepository: input.userRepository ?? getUserRepository(),
    evaluationTime: input.evaluationTime,
  });
  await observability.emit(buildControlledOwnerObservabilityEvent({ name: "eligibility_result",
    occurredAt: input.evaluationTime, userId: eligibility.userId, recordId: eligibility.userId,
    contractVersion: eligibility.contractVersion, mode, state: eligibility.eligible ? "eligible" : "ineligible",
    reasonCodes: [eligibility.reasonCode], latencyMs: null, fingerprint: null, appSurface: null }));
  return Object.freeze({
    allowed: eligibility.eligible,
    mode,
    userId: eligibility.userId,
    reasonCode: eligibility.reasonCode,
    sessionReadCount: 1,
    databaseWriteCount: 0,
  });
}
