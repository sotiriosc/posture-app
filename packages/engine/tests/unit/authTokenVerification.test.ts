import { describe, expect, test } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/authToken";
import type { SessionTokenPayload } from "@/lib/authTypes";

const SECRET = "test-secret-long-enough-for-hmac";

const payload = (overrides: Partial<SessionTokenPayload> = {}): SessionTokenPayload => ({
  sub: "user-1",
  email: "user@example.com",
  plan: "pro",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  ...overrides,
});

describe("session token timing-safe verification", () => {
  test("round-trips a valid token", async () => {
    const token = await createSessionToken(payload(), SECRET);
    const verified = await verifySessionToken(token, SECRET);
    expect(verified?.sub).toBe("user-1");
    expect(verified?.plan).toBe("pro");
  });

  test("rejects a tampered signature", async () => {
    const token = await createSessionToken(payload(), SECRET);
    const [header, body] = token.split(".");
    const forged = `${header}.${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    expect(await verifySessionToken(forged, SECRET)).toBeNull();
  });

  test("rejects a tampered payload", async () => {
    const token = await createSessionToken(payload({ plan: "free" }), SECRET);
    const [header, , signature] = token.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify(payload({ plan: "pro" }))
    ).toString("base64url");
    const forged = `${header}.${forgedBody}.${signature}`;
    expect(await verifySessionToken(forged, SECRET)).toBeNull();
  });

  test("rejects a malformed signature segment without throwing", async () => {
    const token = await createSessionToken(payload(), SECRET);
    const [header, body] = token.split(".");
    const forged = `${header}.${body}.!!!not-base64!!!`;
    expect(await verifySessionToken(forged, SECRET)).toBeNull();
  });

  test("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(payload(), SECRET);
    expect(await verifySessionToken(token, "other-secret")).toBeNull();
  });

  test("rejects an expired token", async () => {
    const token = await createSessionToken(
      payload({ exp: Math.floor(Date.now() / 1000) - 10 }),
      SECRET
    );
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });
});
