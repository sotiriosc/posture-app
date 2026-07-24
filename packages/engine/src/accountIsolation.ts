import { clearAllLocalStateExceptPhotos } from "./resetAppData";
import { setActivePhotoNamespace } from "./photoStore";

/**
 * Per-account state isolation (Phase 6e, Commit 1 / SR-6e, ED-6e.1).
 *
 * The device remembers who the local (non-photo) state currently belongs to
 * under this key. It is only ever written here, and it is deliberately NOT
 * on the `resetAppData` LOCAL_KEYS / DB_NAMES lists — it must survive
 * `localStorage.clear()` calls made for other reasons and be the very next
 * thing written after `clearAllLocalStateExceptPhotos()` runs.
 */
export const LOCAL_OWNER_KEY = "praxis_local_owner_id";

/** Fired whenever `syncLocalOwner` detects (and clears) an account switch. */
export const OWNER_CHANGED_EVENT = "praxis:owner-changed";

export const getStoredLocalOwnerId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_OWNER_KEY);
};

/**
 * Record `ownerId` as the local owner without wiping anything first. For
 * callers that just performed (or are about to perform) their own
 * deliberate, complete local-state reset — dev-seed, the "Erase all local
 * data" buttons — and know who the resulting clean state belongs to. This
 * keeps the very next `syncLocalOwner` call (the startup check on whatever
 * page loads next) from seeing a spurious mismatch and wiping the
 * just-established state a second time.
 */
export const adoptLocalOwner = (ownerId: string | null): void => {
  if (typeof window === "undefined") return;
  setActivePhotoNamespace(ownerId);
  const normalized = ownerId ?? null;
  if (normalized) {
    localStorage.setItem(LOCAL_OWNER_KEY, normalized);
  } else {
    localStorage.removeItem(LOCAL_OWNER_KEY);
  }
};

/**
 * Reconcile this device's locally-remembered account owner against the
 * server's current notion of who's signed in (pass the session user's id,
 * or null for signed-out/guest use).
 *
 * Photos are namespaced to `ownerId` unconditionally and immediately —
 * namespacing, not deletion, is the whole photo-isolation mechanism (Option
 * A refined), so this never touches them. Everything else local
 * (session logs, program state, phase gating) is device-global today, so a
 * mismatch means this device is carrying a different account's state: wipe
 * it before anything can read it as this account's own.
 *
 * Call this on every app load (the "stale device" startup check) AND,
 * deterministically, right after a login/register/logout response resolves
 * — reusing one primitive for all of those triggers is what keeps them from
 * drifting apart.
 */
export const syncLocalOwner = async (
  ownerId: string | null
): Promise<{ wiped: boolean }> => {
  if (typeof window === "undefined") return { wiped: false };

  setActivePhotoNamespace(ownerId);

  const previous = getStoredLocalOwnerId();
  const normalized = ownerId ?? null;
  if (previous === normalized) return { wiped: false };

  await clearAllLocalStateExceptPhotos();
  adoptLocalOwner(normalized);
  window.dispatchEvent(new CustomEvent(OWNER_CHANGED_EVENT));
  return { wiped: true };
};
