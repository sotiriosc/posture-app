import { createHash } from "node:crypto";

export const CHUNK_G_DESIGN_STARTING_COMMIT =
  "4bc1ceb618480dc58693b34f4b8cca81ed6d3961";
export const CHUNK_G_LEDGER_BEFORE_SHA =
  "efff1d833aad8b84a6c24df4165b67f500aaa885ebd862efd5e1797a23be3bc6";
export const CHUNK_G_DESIGN_CLASSIFICATION =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_READY_FOR_DELIVERY_IMPLEMENTATION_AUTHORIZATION";
export const CHUNK_G_DESIGN_STATUS =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_COMPLETED_NO_OWNER_DELIVERY";
export const CHUNK_G_DESIGN_ONTOLOGY =
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ONTOLOGY_READY";
export const CHUNK_G_NEXT_DEPENDENCY =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION";

export const contract = (contractId: string, contractVersion = "1.0.0") =>
  Object.freeze({ contractId, contractVersion });

export const ownerDeliveryContracts = Object.freeze({
  identityPolicy: contract("CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY"),
  enrollment: contract("CONTROLLED_OWNER_V2_ENROLLMENT"),
  profile: contract("CONTROLLED_OWNER_GET_STRONGER_PROFILE"),
  generation: contract("CONTROLLED_OWNER_GET_STRONGER_GENERATION"),
  preview: contract("CONTROLLED_OWNER_V2_PROGRAM_PREVIEW"),
  approval: contract("CONTROLLED_OWNER_V2_PROGRAM_APPROVAL"),
  application: contract("CONTROLLED_OWNER_V2_PROGRAM_APPLICATION"),
  programEnvelope: contract("OWNER_V2_PRODUCT_PROGRAM_ENVELOPE"),
  rollback: contract("CONTROLLED_OWNER_V2_ROLLBACK"),
  stateMachine: contract("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STATE_MACHINE"),
  implementationHandoff: contract("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_HANDOFF"),
});

export const DELIVERY_MODE_VARIABLE = "PRAXIS_V2_OWNER_DELIVERY_MODE";
export const DELIVERY_MODES = Object.freeze(["off", "preview", "apply"] as const);
export type DeliveryMode = typeof DELIVERY_MODES[number];

export const PREVIEW_READINESS_STATES = Object.freeze([
  "ready_for_review",
  "blocked_profile_incomplete",
  "blocked_training_safety",
  "blocked_equipment",
  "blocked_policy_required",
  "blocked_mapping",
  "blocked_prescription",
  "blocked_sequence",
  "blocked_gate13",
  "search_inconclusive",
  "stale",
  "conflict",
] as const);

export const OWNER_DELIVERY_STATES = Object.freeze([
  "hidden",
  "ineligible",
  "eligible_not_enrolled",
  "profile_requires_confirmation",
  "profile_ready",
  "generating",
  "preview_blocked",
  "preview_ready",
  "approval_unavailable",
  "approval_ready",
  "approved",
  "applying",
  "applied_inactive",
  "v2_active",
  "active_session_conflict",
  "rollback_ready",
  "rolling_back",
  "legacy_restored",
  "suspended",
  "revoked",
  "stale",
  "conflict",
  "unavailable",
] as const);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)])
  );
}

export const stableJson = (value: unknown) => JSON.stringify(canonicalize(value));
export const fingerprint = (value: unknown) =>
  createHash("sha256").update(stableJson(value)).digest("hex");
export const jsonReport = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
