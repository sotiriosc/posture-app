import { describe, expect, test } from "vitest";

const ADMIN_TEST_IP = "203.0.113.77";

const post = async () => {
  const { POST } = await import("@/app/api/admin/access/route");
  return POST(
    new Request("http://localhost/api/admin/access", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ADMIN_TEST_IP,
      },
      body: JSON.stringify({ accessKey: "wrong-key" }),
    })
  );
};

describe("admin access rate limiting", () => {
  test("allows up to 5 attempts then returns 429", async () => {
    for (let i = 0; i < 5; i += 1) {
      const res = await post();
      expect(res.status).not.toBe(429);
    }
    const blocked = await post();
    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toMatchObject({ ok: false });
  });
});
