/**
 * Phase 6f, Commit 3 (amended, ratified 2026-07-24) — local subscription
 * status persistence, using a status model rather than an expiry-date
 * model.
 *
 * Real problem: if a paid user's internet drops or Stripe is briefly down,
 * they should not lose access to a subscription they've already paid for.
 * This is the local, offline-readable mirror of the subscription status
 * Praxis already tracks server-side (see stripeWebhookLogic.ts / userStore's
 * stripeSubscriptionStatus / stripeCurrentPeriodEnd / stripeCancelAtPeriodEnd)
 * — written on every successful `/api/billing/status` read, consulted only
 * when a live check can't be made.
 *
 * "Status model, not expiry-date model" (ratified): an "active" plan grants
 * access unconditionally regardless of any timestamp — Pro shouldn't lapse
 * locally just because a device's clock or last-sync time is stale. Only
 * "canceled_at_period_end" carries a meaningful timestamp: the subscription
 * is confirmed ending, and access holds until that already-known date.
 */

export type LocalSubscriptionStatus =
  | "active"
  | "canceled_at_period_end"
  | "canceled";

export type LocalSubscriptionRecord = {
  status: LocalSubscriptionStatus;
  /** ISO timestamp. Only meaningful when status is "canceled_at_period_end". */
  currentPeriodEnd: string | null;
  /** ISO timestamp this record was last confirmed from a live server read. */
  updatedAt: string;
};

export const SUBSCRIPTION_STORAGE_KEY = "praxis_subscription_v1";

const isLocalSubscriptionStatus = (
  value: unknown
): value is LocalSubscriptionStatus =>
  value === "active" || value === "canceled_at_period_end" || value === "canceled";

export const getLocalSubscription = (): LocalSubscriptionRecord | null => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalSubscriptionRecord> | null;
    if (!parsed || !isLocalSubscriptionStatus(parsed.status)) return null;
    return {
      status: parsed.status,
      currentPeriodEnd:
        typeof parsed.currentPeriodEnd === "string" ? parsed.currentPeriodEnd : null,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
};

export const saveLocalSubscription = (record: LocalSubscriptionRecord): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Best-effort only — a full/blocked localStorage must never crash a read.
  }
};

/**
 * Explicit clear, called on logout and "Erase all local data." Both of
 * those paths already call `localStorage.clear()`, which covers this key
 * too — this export exists so the narrower `resetAllAppData` (which only
 * clears a fixed key list) can be told about this key explicitly, and so
 * the intent is documented at the call site rather than implied by a
 * blanket clear elsewhere.
 */
export const clearLocalSubscription = (): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  } catch {
    // Best-effort only.
  }
};

/**
 * Maps the server's already-computed binary `plan` plus the Stripe
 * cancellation fields into the 3-state local model. Deliberately keys off
 * `plan` (Praxis's one existing source of truth for pro/free, already
 * computed by stripeWebhookLogic's mapSubscriptionStatusToPlan) rather than
 * re-interpreting raw Stripe status strings a second time.
 */
export const deriveLocalSubscriptionStatus = (params: {
  plan: "free" | "pro";
  stripeCancelAtPeriodEnd?: boolean | null;
  stripeCurrentPeriodEnd?: string | null;
  nowIso?: string;
}): LocalSubscriptionRecord => {
  const updatedAt = params.nowIso ?? new Date().toISOString();
  if (params.plan !== "pro") {
    return { status: "canceled", currentPeriodEnd: null, updatedAt };
  }
  if (params.stripeCancelAtPeriodEnd) {
    return {
      status: "canceled_at_period_end",
      currentPeriodEnd: params.stripeCurrentPeriodEnd ?? null,
      updatedAt,
    };
  }
  return { status: "active", currentPeriodEnd: null, updatedAt };
};

/**
 * Pure access-rule predicate (ratified Phase 6f Amendment model):
 *   - "active" → Pro access, regardless of connectivity or any timestamp.
 *   - "canceled_at_period_end" AND now < currentPeriodEnd → Pro access.
 *   - "canceled", or a lapsed "canceled_at_period_end" → free access.
 */
export const hasLocalProAccess = (
  record: LocalSubscriptionRecord | null,
  nowIso: string = new Date().toISOString()
): boolean => {
  if (!record) return false;
  if (record.status === "active") return true;
  if (record.status === "canceled_at_period_end") {
    return Boolean(record.currentPeriodEnd) && nowIso < record.currentPeriodEnd!;
  }
  return false;
};
