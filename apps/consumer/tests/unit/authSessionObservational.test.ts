import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  buildUserToken: vi.fn(),
  getAuthSecret: vi.fn(),
  getUserByCredentials: vi.fn(),
  isAuthConfigured: vi.fn(),
  readServerSession: vi.fn(),
  serializeSessionCookie: vi.fn(),
}));

vi.mock("@/lib/serverAuth", () => authMocks);
vi.mock("@/lib/rateLimit", () => ({
  takeRateLimit: vi.fn(() => ({ allowed: true, remaining: 9 })),
}));

import { GET as readSession } from "@/app/api/auth/session/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import {
  controlledOwnerSessionBinding,
  issueControlledOwnerCsrfToken,
  verifyControlledOwnerCsrfToken,
} from "@/lib/controlledOwnerDelivery/requestSecurity";

const SESSION = {
  id: "owner-1",
  email: "owner@example.com",
  plan: "pro" as const,
};

describe("consumer auth session lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.isAuthConfigured.mockResolvedValue(true);
    authMocks.readServerSession.mockResolvedValue(SESSION);
    authMocks.getAuthSecret.mockReturnValue("test-auth-secret");
    authMocks.getUserByCredentials.mockResolvedValue(SESSION);
    authMocks.buildUserToken.mockResolvedValue("signed-session-token");
    authMocks.serializeSessionCookie.mockImplementation((token: string) => ({
      name: "bac_user",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }));
  });

  it("reports an authenticated session without emitting or rotating bac_user", async () => {
    const response = await readSession();

    expect(await response.json()).toEqual({
      ok: true,
      enabled: true,
      authenticated: true,
      user: SESSION,
    });
    expect(response.headers.get("cache-control")).toBe(
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(authMocks.buildUserToken).not.toHaveBeenCalled();
    expect(authMocks.serializeSessionCookie).not.toHaveBeenCalled();
  });

  it("keeps repeated authenticated session reads observational", async () => {
    const first = await readSession();
    const second = await readSession();

    expect(first.headers.get("set-cookie")).toBeNull();
    expect(second.headers.get("set-cookie")).toBeNull();
    expect(await first.json()).toEqual(await second.json());
    expect(authMocks.readServerSession).toHaveBeenCalledTimes(2);
    expect(authMocks.buildUserToken).not.toHaveBeenCalled();
  });

  it("still issues bac_user on login", async () => {
    const response = await login(new Request("https://praxis.test/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: SESSION.email, password: "valid-password" }),
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("bac_user=signed-session-token");
    expect(authMocks.buildUserToken).toHaveBeenCalledWith(SESSION);
  });

  it("still clears bac_user on logout", async () => {
    const response = await logout();
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(setCookie).toContain("bac_user=");
    expect(setCookie).toMatch(/(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  });

  it("preserves owner CSRF validity across ordinary session reads", async () => {
    const cookieHeader = "analytics=synthetic; bac_user=stable-session-token";
    const binding = controlledOwnerSessionBinding(cookieHeader);
    const csrf = issueControlledOwnerCsrfToken({
      userId: SESSION.id,
      sessionBinding: binding,
      actionFamily: "enrollment",
      expiresAt: "2026-08-17T16:15:00.000Z",
      revision: 1,
      secret: "test-csrf-secret",
    });

    const first = await readSession();
    const second = await readSession();

    expect(first.headers.get("set-cookie")).toBeNull();
    expect(second.headers.get("set-cookie")).toBeNull();
    expect(verifyControlledOwnerCsrfToken({
      token: csrf,
      secret: "test-csrf-secret",
      userId: SESSION.id,
      sessionBinding: controlledOwnerSessionBinding(cookieHeader),
      actionFamily: "enrollment",
      evaluatedAt: "2026-08-17T16:05:00.000Z",
    })).toBe(true);
  });
});
