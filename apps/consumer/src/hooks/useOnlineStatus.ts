"use client";

import { useEffect, useState } from "react";

/**
 * Phase 6f, Commit 2 — offline mode for the current workout.
 *
 * Thin wrapper around `navigator.onLine` + the `online`/`offline` window
 * events. `navigator.onLine` is a same-network-interface check (it can be
 * `true` on a connected-but-not-actually-working network), which is a known
 * limitation, but it's the only offline signal that doesn't require a
 * network round-trip itself — appropriate for a purely informational badge,
 * not a hard gate on functionality (nothing in the app blocks on this).
 *
 * Lives in the app layer, not @praxis/engine: the engine package's R3
 * standing rule forbids importing React there (hooks belong in app layer).
 */
export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
};
