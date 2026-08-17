import { explicitIsoTime } from "@praxis/training-engine-v2";
import type { AuthUser } from "../authTypes";
import type { StoredUser } from "../userStore";
import type { ControlledOwnerEligibilityResult, OwnerEligibilityReasonCode } from "./contracts";

const SINGLE_EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

export type PassiveOwnerUserRepository = Pick<
  import("../userRepository").UserRepository,
  "findUserByEmail"
>;

function result(input: {
  eligible: boolean;
  userId: string | null;
  reasonCode: OwnerEligibilityReasonCode;
  evaluationTime: string;
}): ControlledOwnerEligibilityResult {
  return Object.freeze({
    contractId: "CONTROLLED_OWNER_ELIGIBILITY_RESULT",
    contractVersion: "1.0.0",
    eligible: input.eligible,
    userId: input.userId,
    reasonCode: input.reasonCode,
    evaluatedAt: input.evaluationTime,
    databaseWriteCount: 0,
    bootstrapCallCount: 0,
  });
}

export function parseConfiguredOwnerReference(raw: string | null | undefined):
  | { readonly status: "valid"; readonly normalized: string }
  | { readonly status: "missing" | "invalid"; readonly normalized: null } {
  if (raw === null || raw === undefined || raw.trim() === "") {
    return Object.freeze({ status: "missing", normalized: null });
  }
  const normalized = raw.trim().toLowerCase();
  if (!SINGLE_EMAIL.test(normalized) || /[,;\s]/.test(normalized)) {
    return Object.freeze({ status: "invalid", normalized: null });
  }
  return Object.freeze({ status: "valid", normalized });
}

export async function resolveConfiguredOwnerEligibility(input: {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly readSession: () => Promise<AuthUser | null>;
  readonly userRepository: PassiveOwnerUserRepository;
  readonly evaluationTime: string;
}): Promise<ControlledOwnerEligibilityResult> {
  if (!explicitIsoTime(input.evaluationTime)) {
    throw new Error("CONTROLLED_OWNER_ELIGIBILITY_EXPLICIT_TIME_REQUIRED");
  }
  const configured = parseConfiguredOwnerReference(input.environment.AUTH_USER_EMAIL);
  if (configured.status === "missing") {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_CONFIGURATION_MISSING",
      evaluationTime: input.evaluationTime });
  }
  if (configured.status === "invalid") {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_CONFIGURATION_INVALID",
      evaluationTime: input.evaluationTime });
  }
  const configuredEmail = configured.normalized;
  if (!configuredEmail) throw new Error("OWNER_CONFIGURATION_NARROWING_FAILED");
  const session = await input.readSession();
  if (!session) {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_SESSION_MISSING",
      evaluationTime: input.evaluationTime });
  }
  const stored: StoredUser | null = await input.userRepository.findUserByEmail(configuredEmail);
  if (!stored) {
    return result({ eligible: false, userId: null, reasonCode: "CONFIGURED_OWNER_NOT_FOUND",
      evaluationTime: input.evaluationTime });
  }
  if (session.id !== stored.id) {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_USER_ID_MISMATCH",
      evaluationTime: input.evaluationTime });
  }
  if (stored.email.trim().toLowerCase() !== configuredEmail) {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_STORED_EMAIL_MISMATCH",
      evaluationTime: input.evaluationTime });
  }
  if (session.email.trim().toLowerCase() !== stored.email.trim().toLowerCase()) {
    return result({ eligible: false, userId: null, reasonCode: "OWNER_TOKEN_EMAIL_MISMATCH",
      evaluationTime: input.evaluationTime });
  }
  return result({ eligible: true, userId: stored.id, reasonCode: "OWNER_ELIGIBLE",
    evaluationTime: input.evaluationTime });
}
