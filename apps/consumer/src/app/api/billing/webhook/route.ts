import { NextResponse } from "next/server";
import { getUserRepository } from "@/lib/userRepository";
import { type StripeWebhookEvent, verifyStripeWebhook } from "@/lib/stripeServer";
import {
  mapPlanFromEvent,
  resolveBillingPatch,
  resolveEmailFromEvent,
  resolveUserIdFromEvent,
} from "@/lib/stripeWebhookLogic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? "";
  const payload = await request.text();
  let event: StripeWebhookEvent;
  try {
    event = verifyStripeWebhook(payload, signature);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid webhook signature.",
      },
      { status: 400 }
    );
  }

  const plan = mapPlanFromEvent(event);
  if (!plan) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const repo = getUserRepository();
  const isNew = await repo.markStripeWebhookEvent(
    event.id,
    event.type,
    JSON.stringify(event)
  );
  if (!isNew) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  const userId = resolveUserIdFromEvent(event);
  const email = resolveEmailFromEvent(event);
  const billingPatch = resolveBillingPatch(event);
  const user =
    (userId ? await repo.findUserById(String(userId)) : null) ??
    (email ? await repo.findUserByEmail(String(email)) : null) ??
    (billingPatch.stripeCustomerId
      ? await repo.findUserByStripeCustomerId(String(billingPatch.stripeCustomerId))
      : null);
  if (!user) {
    return NextResponse.json({ ok: true, ignored: true, reason: "user_not_found" });
  }
  await repo.updateUserBilling(user.id, {
    plan,
    stripeCustomerId: billingPatch.stripeCustomerId,
    stripeSubscriptionId: billingPatch.stripeSubscriptionId,
    stripePriceId: billingPatch.stripePriceId,
    stripeSubscriptionStatus: billingPatch.stripeSubscriptionStatus,
    stripeCurrentPeriodEnd: billingPatch.stripeCurrentPeriodEnd,
    stripeCancelAtPeriodEnd: billingPatch.stripeCancelAtPeriodEnd,
  });

  return NextResponse.json({ ok: true });
}
