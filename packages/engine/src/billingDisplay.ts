import { mapSubscriptionStatusToPlan } from "@/lib/stripeWebhookLogic";

export type LocalBillingRecord = {
  plan: "free" | "pro";
  stripeSubscriptionStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
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

const formatDate = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10) : null;

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
 * status, renewal, and cancellation can never disagree.
 */
export const resolveBillingPhase = (record: LocalBillingRecord): BillingPhase => {
  const status = String(record.stripeSubscriptionStatus ?? "").toLowerCase();
  const planFromStatus = mapSubscriptionStatusToPlan(status);
  const cancelAtPeriodEnd = record.stripeCancelAtPeriodEnd === true;

  if (status === "trialing") return "trial";
  if (status === "past_due") return "past_due";
  if (status === "active" && cancelAtPeriodEnd) return "canceling";
  if (status === "active") return "active";

  if (planFromStatus === "pro") {
    return cancelAtPeriodEnd ? "canceling" : "active";
  }
  if (planFromStatus === "free") return "expired";

  // No mappable Stripe status — fall back to stored plan only.
  if (record.plan === "pro") {
    return cancelAtPeriodEnd ? "canceling" : "active";
  }
  return "free";
};

export const deriveBillingDisplay = (
  record: LocalBillingRecord
): BillingDisplayModel => {
  const phase = resolveBillingPhase(record);
  const periodEnd = formatDate(record.stripeCurrentPeriodEnd);
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
  else if (phase === "trial") accessStatus = "Pro (trial)";
  else if (phase === "past_due") accessStatus = "Pro (past due)";
  else if (phase === "canceling") {
    accessStatus = periodEnd
      ? `Pro (scheduled to end on ${periodEnd})`
      : "Pro (scheduled to end at period close)";
  } else if (phase === "expired") accessStatus = "Access ended";
  else accessStatus = "Pro (active)";

  let renewalLabel = "Renewal date";
  let renewalValue: string;
  if (phase === "free") {
    renewalValue = "Not applicable";
  } else if (phase === "expired") {
    renewalLabel = "Access ended on";
    renewalValue = periodEnd ?? "Not available";
  } else if (phase === "canceling") {
    renewalLabel = "Access ends on";
    renewalValue = periodEnd ?? "At period close";
  } else if (periodEnd) {
    renewalValue = periodEnd;
  } else {
    renewalValue = "Not available from Stripe";
  }

  let cancellationValue: string;
  if (phase === "free" || phase === "expired") {
    cancellationValue = "No cancellation scheduled";
  } else if (cancelAtPeriodEnd) {
    cancellationValue = periodEnd
      ? `Yes — ends on ${periodEnd}`
      : "Yes — ends at period close";
  } else if (record.stripeCancelAtPeriodEnd === false) {
    cancellationValue = "No cancellation scheduled";
  } else {
    cancellationValue = "No cancellation scheduled";
  }

  return {
    planLabel,
    statusChip,
    accessStatus,
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
