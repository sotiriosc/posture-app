import { describe, expect, it } from "vitest";
import {
  controlledOwnerSessionBinding,
  issueControlledOwnerCsrfToken,
  takeControlledOwnerRateLimit,
  validateControlledOwnerMutationRequest,
  verifyControlledOwnerCsrfToken,
} from "../../src/controlledOwnerDelivery";

const NOW = "2026-08-17T16:00:00.000Z";

describe("controlled owner request security", () => {
  it("binds HMAC CSRF tokens to stable user, session, action, revision, and expiry", () => {
    const binding = controlledOwnerSessionBinding("bac_user=synthetic-session");
    expect(controlledOwnerSessionBinding("analytics=changed; bac_user=synthetic-session")).toBe(binding);
    const token = issueControlledOwnerCsrfToken({ userId: "owner-1", sessionBinding: binding,
      actionFamily: "preview", expiresAt: "2026-08-17T16:15:00.000Z", revision: 1,
      secret: "synthetic-secret" });
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "preview", evaluatedAt: NOW })).toBe(true);
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-2",
      sessionBinding: binding, actionFamily: "preview", evaluatedAt: NOW })).toBe(false);
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "application", evaluatedAt: NOW })).toBe(false);
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "preview", evaluatedAt: "2026-08-17T16:15:00.000Z" })).toBe(false);
  });

  it("fails closed when the session binding is mismatched or tampered", () => {
    const binding = controlledOwnerSessionBinding("bac_user=session-a");
    const token = issueControlledOwnerCsrfToken({ userId: "owner-1", sessionBinding: binding,
      actionFamily: "enrollment", expiresAt: "2026-08-17T16:15:00.000Z", revision: 1,
      secret: "synthetic-secret" });

    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: controlledOwnerSessionBinding("bac_user=session-b"), actionFamily: "enrollment",
      evaluatedAt: NOW })).toBe(false);
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: `${binding}tampered`, actionFamily: "enrollment", evaluatedAt: NOW })).toBe(false);
  });

  it("fails closed for expired, wrong-action, and tampered CSRF tokens", () => {
    const binding = controlledOwnerSessionBinding("bac_user=synthetic-session");
    const token = issueControlledOwnerCsrfToken({ userId: "owner-1", sessionBinding: binding,
      actionFamily: "enrollment", expiresAt: "2026-08-17T16:15:00.000Z", revision: 1,
      secret: "synthetic-secret" });
    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;

    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "enrollment",
      evaluatedAt: "2026-08-17T16:15:00.000Z" })).toBe(false);
    expect(verifyControlledOwnerCsrfToken({ token, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "profile", evaluatedAt: NOW })).toBe(false);
    expect(verifyControlledOwnerCsrfToken({ token: tampered, secret: "synthetic-secret", userId: "owner-1",
      sessionBinding: binding, actionFamily: "enrollment", evaluatedAt: NOW })).toBe(false);
  });

  it("requires same-origin JSON POST with a session cookie", () => {
    const valid = new Request("https://praxis.test/api/training/v2-owner/profile", { method: "POST",
      headers: { origin: "https://praxis.test", host: "praxis.test", "content-type": "application/json",
        cookie: "bac_user=synthetic" }, body: "{}" });
    expect(validateControlledOwnerMutationRequest({ request: valid, allowedMethod: "POST" })).toEqual([]);
    const invalid = new Request("https://praxis.test/api/training/v2-owner/profile", { method: "POST",
      headers: { origin: "https://other.test", host: "praxis.test", "content-type": "text/plain" }, body: "{}" });
    expect(validateControlledOwnerMutationRequest({ request: invalid, allowedMethod: "POST" })).toEqual([
      "OWNER_JSON_CONTENT_TYPE_REQUIRED", "OWNER_ORIGIN_HOST_MISMATCH", "OWNER_SESSION_COOKIE_REQUIRED",
    ]);
  });

  it("uses explicit-time user and action scoped rate limits", () => {
    const base = { userId: "owner-rate-user", action: "preview", evaluatedAtMs: 1_000,
      limit: 2, windowMs: 1_000 };
    expect(takeControlledOwnerRateLimit(base).allowed).toBe(true);
    expect(takeControlledOwnerRateLimit(base).allowed).toBe(true);
    expect(takeControlledOwnerRateLimit(base).allowed).toBe(false);
    expect(takeControlledOwnerRateLimit({ ...base, action: "profile" }).allowed).toBe(true);
    expect(takeControlledOwnerRateLimit({ ...base, evaluatedAtMs: 2_000 }).allowed).toBe(true);
  });
});
