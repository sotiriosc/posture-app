import { describe, expect, test } from "vitest";
import { assertNoPiiInOperatorPayload } from "../../src/app/admin/operatorData";

describe("assertNoPiiInOperatorPayload", () => {
  test("accepts aggregate-only shapes", () => {
    expect(
      assertNoPiiInOperatorPayload({
        glance: { totalAccounts: 3, proSubscribers: 1 },
        activationFunnel: { steps: [{ id: "account_created", count: 3 }] },
      })
    ).toEqual([]);
  });

  test("rejects email, name, userId, accountKey", () => {
    expect(
      assertNoPiiInOperatorPayload({ email: "a@b.com" })
    ).toContain("email field");
    expect(assertNoPiiInOperatorPayload({ name: "Ada" })).toContain("name field");
    expect(assertNoPiiInOperatorPayload({ userId: "u1" })).toContain("userId field");
    expect(assertNoPiiInOperatorPayload({ accountKey: "abc" })).toContain(
      "accountKey field"
    );
    expect(
      assertNoPiiInOperatorPayload({ note: "contact ada@example.com" })
    ).toContain("email address literal");
  });
});
