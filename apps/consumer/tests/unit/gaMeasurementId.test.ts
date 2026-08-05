import { afterEach, describe, expect, test, vi } from "vitest";
import { getGaMeasurementId } from "@/gaMeasurementId";

describe("getGaMeasurementId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("returns undefined when the env var is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect(getGaMeasurementId()).toBeUndefined();
  });

  test("returns a trimmed measurement id when present", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "  G-VQE2S8M3SE  ");
    expect(getGaMeasurementId()).toBe("G-VQE2S8M3SE");
  });
});
