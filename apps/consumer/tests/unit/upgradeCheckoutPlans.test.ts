import { describe, expect, test } from "vitest";
import { resolveVisibleCheckoutPlanOptions } from "@/components/UpgradePrompt";

describe("upgrade checkout plan visibility", () => {
  test("monthly + founders when annual absent → exactly 2 options", () => {
    const options = resolveVisibleCheckoutPlanOptions({
      monthly: true,
      annual: false,
      founders: true,
    });
    expect(options.map((o) => o.id)).toEqual(["monthly", "founders"]);
    expect(options).toHaveLength(2);
    expect(options.find((o) => o.id === "monthly")?.label).toBe("$19.99/mo");
    expect(options.find((o) => o.id === "founders")?.label).toBe("$12.99/mo");
  });

  test("annual appears when intentionally configured", () => {
    const options = resolveVisibleCheckoutPlanOptions({
      monthly: true,
      annual: true,
      founders: true,
    });
    expect(options.map((o) => o.id)).toEqual([
      "monthly",
      "annual",
      "founders",
    ]);
    expect(options).toHaveLength(3);
  });
});
