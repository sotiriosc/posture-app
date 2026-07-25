import { afterEach, describe, expect, it, vi } from "vitest";
import { vibrateForEvent } from "../../src/haptics";
import { isWakeLockSupported } from "../../src/wakeLock";

describe("haptics + wakeLock (Phase 6k)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("vibrateForEvent no-ops when disabled", () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal("navigator", { vibrate });
    expect(vibrateForEvent("restEnding", false)).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("vibrateForEvent uses rest / set / session patterns", () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal("navigator", { vibrate });
    expect(vibrateForEvent("restEnding")).toBe(true);
    expect(vibrate).toHaveBeenLastCalledWith(200);
    expect(vibrateForEvent("setComplete")).toBe(true);
    expect(vibrate).toHaveBeenLastCalledWith(500);
    expect(vibrateForEvent("sessionComplete")).toBe(true);
    expect(vibrate).toHaveBeenLastCalledWith([300, 100, 300]);
  });

  it("isWakeLockSupported reflects navigator.wakeLock", () => {
    vi.stubGlobal("navigator", {});
    expect(isWakeLockSupported()).toBe(false);
    vi.stubGlobal("navigator", {
      wakeLock: { request: vi.fn() },
    });
    expect(isWakeLockSupported()).toBe(true);
  });
});
