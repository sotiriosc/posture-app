import { NextResponse } from "next/server";
import {
  buildUserToken,
  readServerSession,
  serializeSessionCookie,
} from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import {
  billingPatchFromSnapshot,
  canFetchStripeBilling,
  fetchStripeSubscriptionSnapshot,
} from "@/lib/stripeServer";
import { takeRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RefreshBody = {
  /** session-only: re-issue cookie from DB. stripe (default): fetch Stripe first. */
  mode?: "stripe" | "session-only";
};

/**
 * Reconcile local billing from a live Stripe subscription retrieve (not
 * webhook replay), then re-issue the auth cookie with the updated plan.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `billing-refresh:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many refresh attempts. Try again shortly." },
      { status: 429 }
    );
  }

  const session = await readServerSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as RefreshBody | null;
  const mode = body?.mode === "session-only" ? "session-only" : "stripe";

  const repo = getUserRepository();
  let user = await repo.findUserById(session.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  if (mode === "stripe") {
    if (!canFetchStripeBilling()) {
      return NextResponse.json(
        { ok: false, error: "Stripe not configured." },
        { status: 500 }
      );
    }
    if (!user.stripeCustomerId && !user.stripeSubscriptionId) {
      return NextResponse.json(
        { ok: false, error: "No Stripe customer is linked to this account." },
        { status: 400 }
      );
    }
    try {
      const snapshot = await fetchStripeSubscriptionSnapshot({
        subscriptionId: user.stripeSubscriptionId,
        customerId: user.stripeCustomerId,
      });
      if (!snapshot) {
        return NextResponse.json(
          { ok: false, error: "No Stripe subscription found for this account." },
          { status: 404 }
        );
      }
      user =
        (await repo.updateUserBilling(
          user.id,
          billingPatchFromSnapshot(snapshot)
        )) ?? user;
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not refresh subscription from Stripe.",
        },
        { status: 502 }
      );
    }
  }

  const token = await buildUserToken({
    id: user.id,
    email: user.email,
    plan: user.plan,
  });
  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
      stripePriceId: user.stripePriceId ?? null,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus ?? null,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd ?? null,
      stripeCancelAtPeriodEnd: user.stripeCancelAtPeriodEnd ?? null,
    },
  });
  response.cookies.set(serializeSessionCookie(token));
  return response;
}
