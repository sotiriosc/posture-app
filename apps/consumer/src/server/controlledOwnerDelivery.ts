import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import {
  controlledOwnerSessionBinding,
  issueControlledOwnerCsrfToken,
  resolveControlledOwnerRequestGate,
  takeControlledOwnerRateLimit,
  validateControlledOwnerMutationRequest,
  verifyControlledOwnerCsrfToken,
  type ControlledOwnerRequestGateResult,
  type OwnerCsrfActionFamily,
  type OwnerDeliveryRepository,
} from "@praxis/engine/controlled-owner-delivery";
import { CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS } from "@praxis/training-engine-v2";
import { getTrainingSnapshot, type TrainingSnapshot } from "@/lib/trainingStoreDb";
import { stableTrainingStringify } from "@/lib/trainingStateModel";

export const OWNER_NO_STORE_HEADERS = Object.freeze({
  "Cache-Control": "private, no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});

export const OWNER_ENGINE_VERSION = "training-engine-v2@controlled-owner-delivery-1.0.0";
export const OWNER_POLICY_VERSIONS = CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS;

export function ownerJson(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: OWNER_NO_STORE_HEADERS });
}

export async function readOwnerGate(operation: "read" | "preview" | "apply",
  evaluationTime = new Date().toISOString()): Promise<ControlledOwnerRequestGateResult> {
  return resolveControlledOwnerRequestGate({ operation, evaluationTime });
}

export async function requireOwnerPage(operation: "read" | "preview" | "apply") {
  const gate = await readOwnerGate(operation);
  if (!gate.allowed || !gate.userId) notFound();
  return gate;
}

function csrfSecret(): string {
  return process.env.PRAXIS_V2_OWNER_CSRF_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || "";
}

export function ownerCsrfTokens(input: { readonly userId: string; readonly cookieHeader: string;
  readonly issuedAt: string; readonly actionFamilies: readonly OwnerCsrfActionFamily[] }):
Readonly<Partial<Record<OwnerCsrfActionFamily, string>>> {
  const expiresAt = new Date(Date.parse(input.issuedAt) + 15 * 60_000).toISOString();
  const binding = controlledOwnerSessionBinding(input.cookieHeader);
  const secret = csrfSecret();
  if (!secret) return Object.freeze({});
  return Object.freeze(Object.fromEntries(input.actionFamilies.map((actionFamily) => [actionFamily,
    issueControlledOwnerCsrfToken({ secret, userId: input.userId, sessionBinding: binding,
      actionFamily, expiresAt, revision: 1 })])));
}

export async function authorizeOwnerMutation(input: { readonly request: Request;
  readonly operation: "preview" | "apply"; readonly actionFamily: OwnerCsrfActionFamily;
  readonly action: string }) {
  const evaluatedAt = new Date().toISOString();
  const gate = await readOwnerGate(input.operation, evaluatedAt);
  if (!gate.allowed || !gate.userId) return Object.freeze({ allowed: false as const, gate,
    response: ownerJson({ ok: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404) });
  const requestReasons = validateControlledOwnerMutationRequest({ request: input.request, allowedMethod: "POST" });
  const token = input.request.headers.get("x-praxis-owner-csrf") ?? "";
  const cookieHeader = input.request.headers.get("cookie") ?? "";
  const csrfVerified = verifyControlledOwnerCsrfToken({ token, secret: csrfSecret(), userId: gate.userId,
    sessionBinding: controlledOwnerSessionBinding(cookieHeader), actionFamily: input.actionFamily, evaluatedAt });
  if (requestReasons.length || !csrfVerified) return Object.freeze({ allowed: false as const, gate,
    response: ownerJson({ ok: false, error: { code: "REQUEST_FORBIDDEN",
      message: "Request validation failed." } }, 403) });
  const limit = takeControlledOwnerRateLimit({ userId: gate.userId, action: input.action,
    evaluatedAtMs: Date.parse(evaluatedAt), limit: input.action === "preview" ? 6 : 12, windowMs: 60_000 });
  if (!limit.allowed) return Object.freeze({ allowed: false as const, gate,
    response: ownerJson({ ok: false, error: { code: "RATE_LIMITED", message: "Try again shortly." } }, 429) });
  return Object.freeze({ allowed: true as const, gate, userId: gate.userId, evaluatedAt,
    csrfVerified: true as const, response: null });
}

export function rejectsIdentityFields(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(rejectsIdentityFields);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(([key, entry]) =>
    ["userid", "user_id", "email"].includes(key.toLowerCase()) || rejectsIdentityFields(entry));
}

export function ownerProductRevision(snapshot: TrainingSnapshot): string {
  return `product-revision:${createHash("sha256").update(stableTrainingStringify(snapshot)).digest("hex")}`;
}

export function ownerProductSnapshotId(userId: string): string {
  return `product-snapshot:${createHash("sha256").update(userId).digest("hex").slice(0, 32)}`;
}

function newestProgramReference(snapshot: TrainingSnapshot): string | null {
  const revisions = Object.entries(snapshot.meta?.programUpdatedAtById ?? {})
    .sort((left, right) => right[1].localeCompare(left[1]) || right[0].localeCompare(left[0]));
  return revisions[0] ? `legacy-program:${revisions[0][0]}:${revisions[0][1]}` : null;
}

export async function loadOwnerProductRuntimeContext(userId: string) {
  const snapshot = await getTrainingSnapshot(userId);
  const sourceProductRevisionId = ownerProductRevision(snapshot);
  const activeLegacyProgramRevisionId = newestProgramReference(snapshot);
  const activeLegacySession = (snapshot.sessions ?? []).some((session) => {
    const value = session as unknown as Record<string, unknown>;
    return value.completedAt == null && value.endedAt == null && value.status !== "completed";
  });
  return Object.freeze({ snapshot, sourceProductSnapshotId: ownerProductSnapshotId(userId),
    sourceProductRevisionId, activeLegacyProgramRevisionId, activeLegacySession });
}

export async function loadActiveOwnerEnvelope(input: { readonly userId: string;
  readonly applicationId?: string; readonly delivery: OwnerDeliveryRepository }) {
  const pointer = await input.delivery.readActivePointer(input.userId);
  const applicationId = input.applicationId ?? pointer?.activeApplicationId ?? null;
  if (!applicationId || pointer?.mode !== "v2_owner" || pointer.activeApplicationId !== applicationId) return null;
  const application = await input.delivery.readApplicationExact(input.userId, applicationId);
  if (!application) return null;
  const envelope = await input.delivery.readEnvelopeExact(input.userId, application.envelopeId,
    application.envelopeRevisionId);
  return envelope ? Object.freeze({ pointer, application, envelope }) : null;
}
