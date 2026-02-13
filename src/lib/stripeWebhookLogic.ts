import type { StripeWebhookEvent } from "@/lib/stripeServer";

const mapSubscriptionStatusToPlan = (statusRaw: unknown) => {
  const status = String(statusRaw ?? "").toLowerCase();
  if (status === "active" || status === "trialing" || status === "past_due") return "pro" as const;
  if (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  ) {
    return "free" as const;
  }
  return null;
};

export const resolveUserIdFromEvent = (event: StripeWebhookEvent) => {
  const object = event.data?.object ?? {};
  return (
    object?.metadata?.userId ??
    object?.client_reference_id ??
    object?.subscription_details?.metadata?.userId ??
    null
  );
};

export const resolveEmailFromEvent = (event: StripeWebhookEvent) => {
  const object = event.data?.object ?? {};
  return (
    object?.customer_details?.email ??
    object?.customer_email ??
    object?.metadata?.email ??
    null
  );
};

export const mapPlanFromEvent = (event: StripeWebhookEvent) => {
  const object = event.data?.object ?? {};
  if (event.type === "checkout.session.completed") {
    const paymentStatus = String(object.payment_status ?? "").toLowerCase();
    return paymentStatus === "paid" || paymentStatus === "no_payment_required"
      ? ("pro" as const)
      : null;
  }
  if (event.type === "customer.subscription.created") {
    return mapSubscriptionStatusToPlan(object.status);
  }
  if (event.type === "customer.subscription.updated") {
    return mapSubscriptionStatusToPlan(object.status);
  }
  if (event.type === "customer.subscription.deleted") return "free" as const;
  return null;
};

export const resolveBillingPatch = (event: StripeWebhookEvent) => {
  const object = event.data?.object ?? {};
  const stripeCustomerId =
    (typeof object.customer === "string" ? object.customer : null) ??
    (typeof object.customer_id === "string" ? object.customer_id : null);
  const stripeSubscriptionId =
    (typeof object.subscription === "string" ? object.subscription : null) ??
    (typeof object.id === "string" && object.object === "subscription" ? object.id : null);
  const stripePriceId = object?.items?.data?.[0]?.price?.id ?? object?.plan?.id ?? null;
  const stripeSubscriptionStatus =
    typeof object.status === "string" ? object.status : null;
  const stripeCurrentPeriodEnd =
    typeof object.current_period_end === "number"
      ? new Date(object.current_period_end * 1000).toISOString()
      : null;
  const stripeCancelAtPeriodEnd =
    typeof object.cancel_at_period_end === "boolean"
      ? object.cancel_at_period_end
      : null;
  return {
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    stripeSubscriptionStatus,
    stripeCurrentPeriodEnd,
    stripeCancelAtPeriodEnd,
  };
};
