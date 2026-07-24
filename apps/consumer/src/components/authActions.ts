import { syncLocalOwner } from "@/lib/accountIsolation";

/**
 * Shared logout handler (Phase 6e, Commit 1 / SR-6e).
 *
 * Clears this device's non-photo local state (session logs, program state,
 * phase gating) before the logout request resolves, so nothing from the
 * ending session survives for whoever/whatever loads next on this device.
 * AuthControls and AppMenuClient both call this instead of duplicating the
 * sequence — see `@/lib/accountIsolation` for why photos are untouched.
 */
export async function performLogout(): Promise<void> {
  await syncLocalOwner(null).catch(() => undefined);
  await fetch("/api/auth/logout", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  }).catch(() => null);
  window.location.href = "/";
}
