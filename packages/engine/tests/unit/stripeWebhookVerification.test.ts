import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import crypto from "crypto";
import { verifyStripeWebhook } from "@/lib/stripeServer";

const SECRET = "whsec_test_secret";

const sign = (payload: string, timestampSeconds: number) => {
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${timestampSeconds}.${payload}`, "utf8")
    .digest("hex");
  return `t=${timestampSeconds},v1=${signature}`;
};

describe("stripe webhook verification", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("accepts a recent, correctly signed payload", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    const now = Math.floor(Date.now() / 1000);
    const event = verifyStripeWebhook(payload, sign(payload, now));
    expect(event.id).toBe("evt_1");
  });

  test("rejects a stale timestamp beyond tolerance", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    const stale = Math.floor(Date.now() / 1000) - 301;
    expect(() => verifyStripeWebhook(payload, sign(payload, stale))).toThrow(
      /timestamp outside tolerance/
    );
  });

  test("rejects a future timestamp beyond tolerance", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    const future = Math.floor(Date.now() / 1000) + 301;
    expect(() => verifyStripeWebhook(payload, sign(payload, future))).toThrow(
      /timestamp outside tolerance/
    );
  });

  test("accepts a timestamp within tolerance", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    const withinWindow = Math.floor(Date.now() / 1000) - 299;
    const event = verifyStripeWebhook(payload, sign(payload, withinWindow));
    expect(event.id).toBe("evt_1");
  });

  test("rejects a tampered signature even with a valid timestamp", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    const now = Math.floor(Date.now() / 1000);
    const bad = `t=${now},v1=${"0".repeat(64)}`;
    expect(() => verifyStripeWebhook(payload, bad)).toThrow(
      /signature verification failed/
    );
  });

  test("rejects a non-numeric timestamp", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
    expect(() => verifyStripeWebhook(payload, "t=notanumber,v1=abc")).toThrow(
      /Invalid Stripe signature header/
    );
  });
});
