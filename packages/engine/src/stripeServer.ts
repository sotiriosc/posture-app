import crypto from "crypto";

type StripeSession = {
  id: string;
  url: string | null;
  customer: string | null;
  subscription: string | null;
  metadata?: Record<string, string>;
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

export type StripeCheckoutPlan = "monthly" | "annual" | "founders";

export const STRIPE_CHECKOUT_PLANS: readonly StripeCheckoutPlan[] = [
  "monthly",
  "annual",
  "founders",
] as const;

/** Stripe Price lookup_key for the founders monthly offer. */
export const STRIPE_FOUNDERS_LOOKUP_KEY = "praxis_founders_monthly";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

const encodeForm = (values: Record<string, string>) =>
  new URLSearchParams(values).toString();

const getStripeSecret = () => process.env.STRIPE_SECRET_KEY?.trim() ?? "";

/** Monthly price, with legacy STRIPE_PRICE_ID as fallback for gyms / older envs. */
export const getMonthlyPriceId = () =>
  process.env.STRIPE_PRICE_ID_MONTHLY?.trim() ||
  process.env.STRIPE_PRICE_ID?.trim() ||
  "";

export const getAnnualPriceId = () =>
  process.env.STRIPE_PRICE_ID_ANNUAL?.trim() || "";

/** Optional override; when unset, founders resolves via lookup key at checkout. */
export const getFoundersPriceIdOverride = () =>
  process.env.STRIPE_PRICE_ID_FOUNDERS?.trim() || "";

export const parseStripeCheckoutPlan = (
  value: unknown
): StripeCheckoutPlan | null => {
  if (value === "monthly" || value === "annual" || value === "founders") {
    return value;
  }
  return null;
};

export const getStripeCheckoutPlanAvailability = () => {
  const secret = Boolean(getStripeSecret());
  const monthly = Boolean(getMonthlyPriceId());
  const annual = Boolean(getAnnualPriceId());
  // Founders is available whenever Stripe auth works: resolve by lookup key
  // (or optional STRIPE_PRICE_ID_FOUNDERS override).
  const founders = secret;
  return {
    monthly,
    annual,
    founders,
  } as const;
};

export const isStripeConfigured = () =>
  Boolean(getStripeSecret()) &&
  Boolean(getMonthlyPriceId()) &&
  Boolean(process.env.APP_URL?.trim());

/** True when live Stripe API reads (subscription retrieve, price lookup) are available. */
export const canFetchStripeBilling = () => Boolean(getStripeSecret());

const assertStripeSecretUsable = (secret: string) => {
  if (!secret) {
    throw new Error("Stripe secret missing.");
  }
  if (process.env.NODE_ENV !== "production" && secret.startsWith("sk_live_")) {
    throw new Error(
      "Refusing to use live Stripe secret outside production. Use sk_test_ locally."
    );
  }
};

const callStripe = async <T>(
  path: string,
  params: Record<string, string>
): Promise<T> => {
  const secret = getStripeSecret();
  assertStripeSecretUsable(secret);
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(params),
  });
  const data = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Stripe request failed.");
  }
  return data as T;
};

const callStripeGet = async <T>(pathWithQuery: string): Promise<T> => {
  const secret = getStripeSecret();
  assertStripeSecretUsable(secret);
  const response = await fetch(`${STRIPE_API_BASE}${pathWithQuery}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });
  const data = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Stripe request failed.");
  }
  return data as T;
};

export const resolvePriceIdByLookupKey = async (lookupKey: string) => {
  const query = new URLSearchParams();
  query.append("lookup_keys[]", lookupKey);
  query.append("active", "true");
  query.append("limit", "1");
  const result = await callStripeGet<{
    data?: Array<{ id?: string }>;
  }>(`/prices?${query.toString()}`);
  const priceId = result.data?.[0]?.id?.trim();
  if (!priceId) {
    throw new Error(`No active Stripe price for lookup key "${lookupKey}".`);
  }
  return priceId;
};

export const resolveCheckoutPriceId = async (plan: StripeCheckoutPlan) => {
  if (plan === "monthly") {
    const priceId = getMonthlyPriceId();
    if (!priceId) throw new Error("Monthly Stripe price missing.");
    return priceId;
  }
  if (plan === "annual") {
    const priceId = getAnnualPriceId();
    if (!priceId) throw new Error("Annual Stripe price missing.");
    return priceId;
  }
  const override = getFoundersPriceIdOverride();
  if (override) return override;
  return resolvePriceIdByLookupKey(STRIPE_FOUNDERS_LOOKUP_KEY);
};

export const createStripeCheckoutSession = async (params: {
  userId: string;
  email: string;
  plan?: StripeCheckoutPlan;
}) => {
  const plan = params.plan ?? "monthly";
  const priceId = await resolveCheckoutPriceId(plan);
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) throw new Error("Stripe price/app URL missing.");
  return callStripe<StripeSession>("/checkout/sessions", {
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${appUrl}/api/billing/return?billing=success`,
    cancel_url: `${appUrl}/results?billing=cancel`,
    customer_email: params.email,
    client_reference_id: params.userId,
    // Lets customers enter Stripe Promotion Codes (not coupon IDs) at Checkout.
    // Do not combine with `discounts[]` — Stripe rejects that combination.
    allow_promotion_codes: "true",
    "metadata[userId]": params.userId,
    "metadata[email]": params.email,
    "metadata[checkoutPlan]": plan,
    "subscription_data[metadata][userId]": params.userId,
    "subscription_data[metadata][email]": params.email,
    "subscription_data[metadata][checkoutPlan]": plan,
  });
};

export const createStripePortalSession = async (params: { customerId: string }) => {
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) throw new Error("APP_URL missing.");
  return callStripe<{ url: string }>("/billing_portal/sessions", {
    customer: params.customerId,
    return_url: `${appUrl}/account/billing?stripe_return=1`,
  });
};

/** Best-effort sync when the app email changes; billing linkage is by customer id. */
export const updateStripeCustomerEmail = async (params: {
  customerId: string;
  email: string;
}) => {
  if (!canFetchStripeBilling()) return;
  const customerId = params.customerId.trim();
  const email = params.email.trim().toLowerCase();
  if (!customerId || !email) return;
  await callStripe(`/customers/${encodeURIComponent(customerId)}`, { email });
};

type StripeSubscriptionObject = {
  id?: string;
  object?: string;
  status?: string;
  customer?: string | { id?: string };
  cancel_at_period_end?: boolean;
  cancel_at?: number;
  /** Unix seconds — subscription start (preferred over created). */
  start_date?: number;
  /** Unix seconds — object creation time (fallback for member-since). */
  created?: number;
  current_period_end?: number;
  canceled_at?: number | null;
  ended_at?: number | null;
  items?: {
    data?: Array<{
      id?: string;
      price?: { id?: string };
      current_period_end?: number;
      current_period_start?: number;
    }>;
  };
  plan?: { id?: string };
};

export type StripeSubscriptionSnapshot = {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: string | null;
  /** ISO from start_date, else created; null when Stripe omits both. */
  stripeStartDate: string | null;
  stripeCancelAtPeriodEnd: boolean;
  plan: "free" | "pro";
};

const STATUS_RANK: Record<string, number> = {
  active: 50,
  trialing: 40,
  past_due: 30,
  incomplete: 20,
  paused: 15,
  unpaid: 10,
  canceled: 5,
  incomplete_expired: 1,
};

const customerIdFromSubscription = (sub: StripeSubscriptionObject) => {
  if (typeof sub.customer === "string") return sub.customer;
  if (sub.customer && typeof sub.customer === "object" && sub.customer.id) {
    return sub.customer.id;
  }
  return null;
};

/**
 * Period end from the subscription retrieve only — never invoices.
 * Stripe Basil (2025-03-31+) removed top-level subscription.current_period_end;
 * it now lives on items.data[].current_period_end.
 */
const resolveSubscriptionPeriodEndUnix = (sub: StripeSubscriptionObject) => {
  if (typeof sub.current_period_end === "number") return sub.current_period_end;
  const itemPeriodEnds = (sub.items?.data ?? [])
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  if (itemPeriodEnds.length > 0) return Math.max(...itemPeriodEnds);
  if (sub.cancel_at_period_end && typeof sub.cancel_at === "number") {
    return sub.cancel_at;
  }
  if (typeof sub.ended_at === "number") return sub.ended_at;
  if (typeof sub.canceled_at === "number") return sub.canceled_at;
  return null;
};

const summarizeStripeSubscriptionForLog = (sub: StripeSubscriptionObject) => {
  const items = (sub.items?.data ?? []).map((item) => ({
    id: item.id ?? null,
    priceId: item.price?.id ?? null,
    current_period_end: item.current_period_end ?? null,
    current_period_start: item.current_period_start ?? null,
  }));
  return {
    id: sub.id ?? null,
    status: sub.status ?? null,
    cancel_at_period_end: sub.cancel_at_period_end ?? null,
    cancel_at: sub.cancel_at ?? null,
    current_period_end: sub.current_period_end ?? null,
    item_period_ends: items.map((item) => item.current_period_end),
    items,
  };
};

export const stripeSubscriptionToSnapshot = (
  sub: StripeSubscriptionObject
): StripeSubscriptionSnapshot => {
  const status = typeof sub.status === "string" ? sub.status : null;
  const planFromStatus = (() => {
    const normalized = String(status ?? "").toLowerCase();
    if (normalized === "active" || normalized === "trialing" || normalized === "past_due") {
      return "pro" as const;
    }
    return "free" as const;
  })();
  const periodEndUnix = resolveSubscriptionPeriodEndUnix(sub);
  const startUnix =
    typeof sub.start_date === "number"
      ? sub.start_date
      : typeof sub.created === "number"
        ? sub.created
        : null;
  return {
    stripeCustomerId: customerIdFromSubscription(sub),
    stripeSubscriptionId: typeof sub.id === "string" ? sub.id : null,
    stripePriceId: sub.items?.data?.[0]?.price?.id ?? sub.plan?.id ?? null,
    stripeSubscriptionStatus: status,
    stripeCurrentPeriodEnd:
      periodEndUnix !== null ? new Date(periodEndUnix * 1000).toISOString() : null,
    stripeStartDate:
      startUnix !== null ? new Date(startUnix * 1000).toISOString() : null,
    stripeCancelAtPeriodEnd: resolveCancelAtPeriodEnd(sub),
    plan: planFromStatus,
  };
};

/** True when Stripe has scheduled end-of-period cancellation. */
export const resolveCancelAtPeriodEnd = (sub: StripeSubscriptionObject) => {
  if (sub.cancel_at_period_end === true) return true;
  // Some responses only populate cancel_at when cancellation is scheduled.
  if (typeof sub.cancel_at === "number" && sub.cancel_at > 0) {
    const status = String(sub.status ?? "").toLowerCase();
    if (status === "active" || status === "trialing" || status === "past_due") {
      return true;
    }
  }
  return false;
};

const periodEndUnixForSort = (sub: StripeSubscriptionObject) =>
  resolveSubscriptionPeriodEndUnix(sub) ?? 0;

/**
 * Prefer the most recent non-canceled subscription (active/trialing/past_due),
 * then fall back to the newest canceled one if nothing else exists.
 */
const pickBestSubscription = (subs: StripeSubscriptionObject[]) => {
  if (subs.length === 0) return null;
  const nonCanceled = subs.filter((sub) => {
    const status = String(sub.status ?? "").toLowerCase();
    return status !== "canceled" && status !== "incomplete_expired";
  });
  const pool = nonCanceled.length > 0 ? nonCanceled : subs;
  return [...pool].sort((a, b) => {
    const rankA = STATUS_RANK[String(a.status ?? "").toLowerCase()] ?? 0;
    const rankB = STATUS_RANK[String(b.status ?? "").toLowerCase()] ?? 0;
    if (rankA !== rankB) return rankB - rankA;
    return periodEndUnixForSort(b) - periodEndUnixForSort(a);
  })[0]!;
};

const listSubscriptionsForCustomer = async (customerId: string) => {
  const query = new URLSearchParams({
    customer: customerId,
    status: "all",
    limit: "10",
  });
  const listed = await callStripeGet<{ data?: StripeSubscriptionObject[] }>(
    `/subscriptions?${query.toString()}`
  );
  return listed.data ?? [];
};

/**
 * Direct Stripe retrieve (not event replay).
 * Customer-first: list subscriptions for the Stripe customer (resilient when
 * subscription ID was never stored due to webhook outage), then fall back to
 * a direct subscription retrieve if only the subscription ID is known.
 */
export const fetchStripeSubscriptionSnapshot = async (params: {
  subscriptionId?: string | null;
  customerId?: string | null;
}): Promise<StripeSubscriptionSnapshot | null> => {
  console.info("[billing:stripe-retrieve]", {
    lookup: {
      subscriptionId: params.subscriptionId ?? null,
      customerId: params.customerId ?? null,
      strategy: "customer-first",
    },
  });

  if (params.customerId) {
    try {
      const listed = await listSubscriptionsForCustomer(params.customerId);
      const best = pickBestSubscription(listed);
      console.info("[billing:stripe-retrieve] by_customer_list", {
        customerId: params.customerId,
        count: listed.length,
        candidates: listed.map(summarizeStripeSubscriptionForLog),
        picked: best ? summarizeStripeSubscriptionForLog(best) : null,
        snapshot: best ? stripeSubscriptionToSnapshot(best) : null,
      });
      if (best) return stripeSubscriptionToSnapshot(best);
    } catch (error) {
      console.error("[billing:stripe-retrieve] by_customer_list failed", {
        customerId: params.customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Fall through to subscription-id retrieve when possible.
    }
  }

  if (params.subscriptionId) {
    try {
      const sub = await callStripeGet<StripeSubscriptionObject>(
        `/subscriptions/${encodeURIComponent(params.subscriptionId)}`
      );
      console.info("[billing:stripe-retrieve] by_subscription_id ok", {
        raw: summarizeStripeSubscriptionForLog(sub),
        snapshot: stripeSubscriptionToSnapshot(sub),
      });
      return stripeSubscriptionToSnapshot(sub);
    } catch (error) {
      console.error("[billing:stripe-retrieve] by_subscription_id failed", {
        subscriptionId: params.subscriptionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.error("[billing:stripe-retrieve] no subscription found", {
    subscriptionId: params.subscriptionId ?? null,
    customerId: params.customerId ?? null,
  });
  return null;
};

export const billingPatchFromSnapshot = (snapshot: StripeSubscriptionSnapshot) => ({
  plan: snapshot.plan,
  stripeCustomerId: snapshot.stripeCustomerId,
  stripeSubscriptionId: snapshot.stripeSubscriptionId,
  stripePriceId: snapshot.stripePriceId,
  stripeSubscriptionStatus: snapshot.stripeSubscriptionStatus,
  stripeCurrentPeriodEnd: snapshot.stripeCurrentPeriodEnd,
  stripeCancelAtPeriodEnd: snapshot.stripeCancelAtPeriodEnd,
});

export type CheckoutPriceLabel = {
  label: string;
  detail: string;
};

type StripePriceObject = {
  id?: string;
  unit_amount?: number | null;
  currency?: string;
  recurring?: { interval?: string; interval_count?: number };
};

export const formatStripePriceLabel = (price: StripePriceObject): string | null => {
  if (price.unit_amount == null || !price.currency) return null;
  const amount = price.unit_amount / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  const interval = price.recurring?.interval;
  if (interval === "month") return `${formatted}/mo`;
  if (interval === "year") return `${formatted}/yr`;
  if (interval === "week") return `${formatted}/wk`;
  return formatted;
};

const fetchStripePrice = async (priceId: string) =>
  callStripeGet<StripePriceObject>(`/prices/${encodeURIComponent(priceId)}`);

const labelForPlan = async (
  priceId: string,
  detail: string
): Promise<CheckoutPriceLabel | null> => {
  try {
    const price = await fetchStripePrice(priceId);
    const label = formatStripePriceLabel(price);
    if (!label) return null;
    return { label, detail };
  } catch {
    return null;
  }
};

/** Live price labels from Stripe Price objects (falls back to empty when unavailable). */
export const fetchCheckoutPriceLabels = async (): Promise<
  Partial<Record<StripeCheckoutPlan, CheckoutPriceLabel>>
> => {
  if (!canFetchStripeBilling()) return {};
  const labels: Partial<Record<StripeCheckoutPlan, CheckoutPriceLabel>> = {};

  const monthlyId = getMonthlyPriceId();
  if (monthlyId) {
    const monthly = await labelForPlan(monthlyId, "Standard monthly");
    if (monthly) labels.monthly = monthly;
  }

  const annualId = getAnnualPriceId();
  if (annualId) {
    const annual = await labelForPlan(annualId, "Best value");
    if (annual) labels.annual = annual;
  }

  const foundersOverride = getFoundersPriceIdOverride();
  if (foundersOverride) {
    const founders = await labelForPlan(foundersOverride, "Founders");
    if (founders) labels.founders = founders;
  } else {
    try {
      const foundersPriceId = await resolvePriceIdByLookupKey(STRIPE_FOUNDERS_LOOKUP_KEY);
      const founders = await labelForPlan(foundersPriceId, "Founders");
      if (founders) labels.founders = founders;
    } catch {
      // Founders price optional until lookup key exists in Stripe.
    }
  }

  return labels;
};

const parseStripeSignature = (header: string) => {
  const parts = header.split(",").map((item) => item.trim());
  const fields = Object.fromEntries(
    parts.map((entry) => {
      const [key, value] = entry.split("=");
      return [key, value];
    })
  );
  return {
    timestamp: fields.t,
    signature: fields.v1,
  };
};

const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export const verifyStripeWebhook = (payload: string, signatureHeader: string) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  const { timestamp, signature } = parseStripeSignature(signatureHeader);
  if (!timestamp || !signature) {
    throw new Error("Invalid Stripe signature header.");
  }
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    throw new Error("Invalid Stripe signature header.");
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Stripe webhook timestamp outside tolerance.");
  }
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error("Webhook signature verification failed.");
  }
  return JSON.parse(payload) as StripeEvent;
};

export type StripeWebhookEvent = StripeEvent;
