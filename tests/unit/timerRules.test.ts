import { describe, expect, test } from "vitest";
import { getEffectiveTimer } from "@/lib/timerRules";

describe("timerRules", () => {
  test("per-item values override defaults", () => {
    const result = getEffectiveTimer(
      { durationSec: 90, restSec: 45 } as any,
      { workSeconds: 60, restSeconds: 60 }
    );
    expect(result.workSeconds).toBe(90);
    expect(result.restSeconds).toBe(45);
  });

  test("fallback uses prefs", () => {
    const result = getEffectiveTimer(
      { durationSec: null, restSec: null } as any,
      { workSeconds: 70, restSeconds: 80 }
    );
    expect(result.workSeconds).toBe(70);
    expect(result.restSeconds).toBe(80);
  });

  test("invalid values are ignored", () => {
    const result = getEffectiveTimer(
      { durationSec: -5, restSec: 0 } as any,
      { workSeconds: 55, restSeconds: 65 }
    );
    expect(result.workSeconds).toBe(55);
    expect(result.restSeconds).toBe(65);
  });
});
