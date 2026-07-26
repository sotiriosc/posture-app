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

type StripeSubscriptionObject = {
  id?: string;
  object?: string;
  status?: string;
  customer?: string | { id?: string };
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  items?: { data?: Array<{ price?: { id?: string } }> };
  plan?: { id?: string };
};

export type StripeSubscriptionSnapshot = {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: string | null;
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
  return {
    stripeCustomerId: customerIdFromSubscription(sub),
    stripeSubscriptionId: typeof sub.id === "string" ? sub.id : null,
    stripePriceId: sub.items?.data?.[0]?.price?.id ?? sub.plan?.id ?? null,
    stripeSubscriptionStatus: status,
    stripeCurrentPeriodEnd:
      typeof sub.current_period_end === "number"
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    stripeCancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    plan: planFromStatus,
  };
};

const pickBestSubscription = (subs: StripeSubscriptionObject[]) => {
  if (subs.length === 0) return null;
  return [...subs].sort((a, b) => {
    const rankA = STATUS_RANK[String(a.status ?? "").toLowerCase()] ?? 0;
    const rankB = STATUS_RANK[String(b.status ?? "").toLowerCase()] ?? 0;
    if (rankA !== rankB) return rankB - rankA;
    return (b.current_period_end ?? 0) - (a.current_period_end ?? 0);
  })[0]!;
};

/**
 * Direct Stripe retrieve (not event replay). Prefers subscription id, else the
 * best subscription for the customer.
 */
export const fetchStripeSubscriptionSnapshot = async (params: {
  subscriptionId?: string | null;
  customerId?: string | null;
}): Promise<StripeSubscriptionSnapshot | null> => {
  if (params.subscriptionId) {
    try {
      const sub = await callStripeGet<StripeSubscriptionObject>(
        `/subscriptions/${encodeURIComponent(params.subscriptionId)}`
      );
      return stripeSubscriptionToSnapshot(sub);
    } catch {
      // Fall through to customer listing when the stored sub id is stale.
    }
  }
  if (!params.customerId) return null;
  const query = new URLSearchParams({
    customer: params.customerId,
    status: "all",
    limit: "10",
  });
  const listed = await callStripeGet<{ data?: StripeSubscriptionObject[] }>(
    `/subscriptions?${query.toString()}`
  );
  const best = pickBestSubscription(listed.data ?? []);
  return best ? stripeSubscriptionToSnapshot(best) : null;
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
