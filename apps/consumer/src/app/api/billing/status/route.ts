import { NextResponse } from "next/server";
import { readServerSession } from "@praxis/engine";
import { getUserRepository } from "@praxis/engine";
import { isStripeConfigured } from "@praxis/engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await readServerSession();
  if (!session) {
    return NextResponse.json(
      { ok: true, authenticated: false, stripeConfigured: isStripeConfigured() },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
  const repo = getUserRepository();
  const user = await repo.findUserById(session.id);
  return NextResponse.json(
    {
      ok: true,
      authenticated: true,
      stripeConfigured: isStripeConfigured(),
      user: {
        id: session.id,
        email: session.email,
        plan: user?.plan ?? session.plan,
        stripeCustomerId: user?.stripeCustomerId ?? null,
        stripeSubscriptionId: user?.stripeSubscriptionId ?? null,
        stripePriceId: user?.stripePriceId ?? null,
        stripeSubscriptionStatus: user?.stripeSubscriptionStatus ?? null,
        stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd ?? null,
        stripeCancelAtPeriodEnd: user?.stripeCancelAtPeriodEnd ?? null,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
