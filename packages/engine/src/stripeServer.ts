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

const STRIPE_API_BASE = "https://api.stripe.com/v1";

const encodeForm = (values: Record<string, string>) =>
  new URLSearchParams(values).toString();

const getStripeSecret = () => process.env.STRIPE_SECRET_KEY?.trim() ?? "";
export const isStripeConfigured = () =>
  Boolean(getStripeSecret()) &&
  Boolean(process.env.STRIPE_PRICE_ID?.trim()) &&
  Boolean(process.env.APP_URL?.trim());

const callStripe = async <T>(
  path: string,
  params: Record<string, string>
): Promise<T> => {
  const secret = getStripeSecret();
  if (!secret) {
    throw new Error("Stripe secret missing.");
  }
  if (process.env.NODE_ENV !== "production" && secret.startsWith("sk_live_")) {
    throw new Error(
      "Refusing to use live Stripe secret outside production. Use sk_test_ locally."
    );
  }
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

export const createStripeCheckoutSession = async (params: {
  userId: string;
  email: string;
}) => {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  const appUrl = process.env.APP_URL?.trim();
  if (!priceId || !appUrl) throw new Error("Stripe price/app URL missing.");
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
    "subscription_data[metadata][userId]": params.userId,
    "subscription_data[metadata][email]": params.email,
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
