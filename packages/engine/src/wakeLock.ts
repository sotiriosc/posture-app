/**
 * Phase 6k Commit 4 — Screen Wake Lock helpers.
 */

export type WakeLockHandle = {
  release: () => Promise<void>;
};

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener?: (
    type: "release",
    listener: () => void
  ) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export const isWakeLockSupported = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return typeof (navigator as WakeLockNavigator).wakeLock?.request === "function";
};

/**
 * Request a screen wake lock. Returns null when unsupported or denied.
 */
export const requestScreenWakeLock = async (
  onRelease?: () => void
): Promise<WakeLockHandle | null> => {
  if (!isWakeLockSupported()) return null;
  try {
    const sentinel = await (navigator as WakeLockNavigator).wakeLock!.request(
      "screen"
    );
    if (onRelease && sentinel.addEventListener) {
      sentinel.addEventListener("release", onRelease);
    }
    return {
      release: async () => {
        if (!sentinel.released) {
          await sentinel.release();
        }
      },
    };
  } catch {
    return null;
  }
};
