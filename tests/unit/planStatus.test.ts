import { describe, expect, test } from "vitest";
import {
  PRO_ACTIVE_MESSAGE,
  formatPlanLabel,
  formatPlanStatusMessage,
  isFreeAccessPlan,
  resolvePlanStatus,
} from "@/lib/planStatus";

describe("plan status helpers", () => {
  test("known Pro billing state wins over stale Free session state", () => {
    const plan = resolvePlanStatus("pro", "free");

    expect(plan).toBe("pro");
    expect(formatPlanLabel({ authEnabled: true, plan })).toBe("Pro");
    expect(formatPlanStatusMessage({ authEnabled: true, plan })).toBe(
      PRO_ACTIVE_MESSAGE
    );
    expect(isFreeAccessPlan({ authEnabled: true, plan })).toBe(false);
  });

  test("unknown authenticated plan is safe for access checks without saying Free", () => {
    const plan = resolvePlanStatus(undefined, null);

    expect(plan).toBe("unknown");
    expect(formatPlanLabel({ authEnabled: true, plan })).toBe("Checking");
    expect(formatPlanStatusMessage({ authEnabled: true, plan })).toBe(
      "Checking plan status"
    );
    expect(isFreeAccessPlan({ authEnabled: true, plan })).toBe(true);
  });
});
