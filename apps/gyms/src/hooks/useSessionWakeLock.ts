"use client";

import { useEffect, useRef, useState } from "react";
import {
  isWakeLockSupported,
  requestScreenWakeLock,
  type WakeLockHandle,
} from "@/lib/wakeLock";

/**
 * Phase 6k Commit 4 — keep the screen awake for an active session.
 */
export const useSessionWakeLock = (active: boolean) => {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [supported] = useState(() => isWakeLockSupported());
  const handleRef = useRef<WakeLockHandle | null>(null);

  useEffect(() => {
    let cancelled = false;

    const release = async () => {
      const handle = handleRef.current;
      handleRef.current = null;
      if (handle) {
        await handle.release().catch(() => undefined);
      }
      if (!cancelled) setWakeLockActive(false);
    };

    const acquire = async () => {
      if (!active || !supported) {
        await release();
        return;
      }
      const handle = await requestScreenWakeLock(() => {
        if (!cancelled) setWakeLockActive(false);
      });
      if (cancelled) {
        await handle?.release().catch(() => undefined);
        return;
      }
      handleRef.current = handle;
      setWakeLockActive(Boolean(handle));
    };

    void acquire();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void release();
    };
  }, [active, supported]);

  const releaseEarly = async () => {
    const handle = handleRef.current;
    handleRef.current = null;
    if (handle) {
      await handle.release().catch(() => undefined);
    }
    setWakeLockActive(false);
  };

  return {
    supported,
    wakeLockActive,
    releaseEarly,
  };
};
