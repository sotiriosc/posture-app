import { mapSubscriptionStatusToPlan } from "@/lib/stripeWebhookLogic";

export type LocalBillingRecord = {
  plan: "free" | "pro";
  stripeSubscriptionStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
  /** ISO from live Stripe subscription start_date (or created). */
  stripeStartDate?: string | null;
  stripeCancelAtPeriodEnd?: boolean | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export type BillingStatusChip = {
  label: "Active" | "Trial" | "Expired";
  className: string;
};

export type BillingDisplayModel = {
  planLabel: "Pro" | "Free";
  statusChip: BillingStatusChip;
  accessStatus: string;
  /** Formatted start date, or null when unavailable (UI should hide the field). */
  memberSince: string | null;
  renewalLabel: string;
  renewalValue: string;
  cancellationValue: string;
};

type BillingPhase =
  | "free"
  | "trial"
  | "active"
  | "past_due"
  | "canceling"
  | "expired";

const DATE_UNAVAILABLE = "Date not available from Stripe";

/** Human-readable billing date (UTC) e.g. "Aug 26, 2026". */
export const formatBillingDate = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
};

const CHIP_ACTIVE: BillingStatusChip = {
  label: "Active",
  className: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
const CHIP_TRIAL: BillingStatusChip = {
  label: "Trial",
  className: "border-blue-200 bg-blue-50 text-blue-700",
};
const CHIP_EXPIRED: BillingStatusChip = {
  label: "Expired",
  className: "border-rose-200 bg-rose-50 text-rose-700",
};

/**
 * Resolve one phase from the local subscription record so plan chip, access
 * status, renewal/access-end, and cancellation can never disagree.
 */
export const resolveBillingPhase = (record: LocalBillingRecord): BillingPhase => {
  const status = String(record.stripeSubscriptionStatus ?? "").toLowerCase();
  const planFromStatus = mapSubscriptionStatusToPlan(status);
  const cancelAtPeriodEnd = record.stripeCancelAtPeriodEnd === true;
  const proLike =
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    planFromStatus === "pro" ||
    record.plan === "pro";

  // Cancel-at-period-end must win over active/trial/past_due so the UI never
  // shows "Renews on" / "No cancellation scheduled" for a cancelling sub.
  if (proLike && cancelAtPeriodEnd) return "canceling";

  if (status === "trialing") return "trial";
  if (status === "past_due") return "past_due";
  if (status === "active") return "active";

  if (planFromStatus === "pro") return "active";
  if (planFromStatus === "free") return "expired";

  if (record.plan === "pro") return "active";
  return "free";
};

export const deriveBillingDisplay = (
  record: LocalBillingRecord
): BillingDisplayModel => {
  const phase = resolveBillingPhase(record);
  const periodEnd = formatBillingDate(record.stripeCurrentPeriodEnd);
  const memberSince = formatBillingDate(record.stripeStartDate);
  const cancelAtPeriodEnd = record.stripeCancelAtPeriodEnd === true;

  const planLabel: "Pro" | "Free" =
    phase === "free" || phase === "expired" ? "Free" : "Pro";

  const statusChip: BillingStatusChip =
    phase === "trial"
      ? CHIP_TRIAL
      : phase === "active" || phase === "past_due" || phase === "canceling"
        ? CHIP_ACTIVE
        : CHIP_EXPIRED;

  let accessStatus: string;
  if (phase === "free") accessStatus = "Free access";
  else if (phase === "expired") accessStatus = "Free access";
  else if (phase === "trial") accessStatus = "Pro (trial)";
  else if (phase === "past_due") accessStatus = "Pro (past due)";
  else if (phase === "canceling") {
    accessStatus = periodEnd
      ? `Pro (access ends ${periodEnd})`
      : "Pro (access ends at period close)";
  } else accessStatus = "Pro (active)";

  let renewalLabel: string;
  let renewalValue: string;
  let cancellationValue: string;

  if (phase === "canceling") {
    renewalLabel = "Access ends on";
    renewalValue = periodEnd ?? DATE_UNAVAILABLE;
    cancellationValue = periodEnd
      ? `Yes — access ends ${periodEnd}`
      : "Yes";
  } else if (phase === "expired") {
    renewalLabel = "Subscription ended";
    renewalValue = periodEnd ?? DATE_UNAVAILABLE;
    cancellationValue = "No cancellation scheduled";
  } else if (phase === "free") {
    renewalLabel = "Renews on";
    renewalValue = "Not applicable";
    cancellationValue = "No cancellation scheduled";
  } else {
    // Active, trial, or past_due — subscription will renew unless cancel_at_period_end.
    renewalLabel = "Renews on";
    renewalValue = periodEnd ?? DATE_UNAVAILABLE;
    cancellationValue = cancelAtPeriodEnd
      ? periodEnd
        ? `Yes — access ends ${periodEnd}`
        : "Yes"
      : "No cancellation scheduled";
  }

  return {
    planLabel,
    statusChip,
    accessStatus,
    memberSince,
    renewalLabel,
    renewalValue,
    cancellationValue,
  };
};

/**
 * True when local billing looks partial or internally inconsistent and should
 * be overwritten from a live Stripe subscription retrieve.
 */
export const needsBillingReconcile = (record: LocalBillingRecord): boolean => {
  const hasStripeLink = Boolean(
    record.stripeCustomerId || record.stripeSubscriptionId
  );
  if (!hasStripeLink) return false;

  const status = String(record.stripeSubscriptionStatus ?? "").toLowerCase();
  const planFromStatus = mapSubscriptionStatusToPlan(status);
  const planStatusConflict =
    (planFromStatus === "pro" && record.plan === "free") ||
    (planFromStatus === "free" && record.plan === "pro");
  if (planStatusConflict) return true;

  const activeLike =
    record.plan === "pro" ||
    status === "active" ||
    status === "trialing" ||
    status === "past_due";
  if (!activeLike) return false;

  return (
    !status ||
    !record.stripeCurrentPeriodEnd ||
    record.stripeCancelAtPeriodEnd === null ||
    record.stripeCancelAtPeriodEnd === undefined
  );
};
