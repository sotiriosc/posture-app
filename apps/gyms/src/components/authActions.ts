import { syncLocalOwner } from "@/lib/accountIsolation";

/**
 * Shared logout handler (Phase 6f, Commit 1 / SR-6f — porting Phase 6e's
 * per-account isolation to the gyms app, mirrors
 * apps/consumer/src/components/authActions.ts exactly).
 *
 * Clears this device's non-photo local state (session logs, program state,
 * phase gating) before the logout request resolves, so nothing from the
 * ending session survives for whoever/whatever loads next on this device
 * — this matters more here than in consumer, since operators demonstrably
 * log in and out on shared devices during pilots. See `@/lib/accountIsolation`
 * for why photos are untouched.
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
