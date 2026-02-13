import { NextResponse } from "next/server";
import { readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import { isStripeConfigured } from "@/lib/stripeServer";

export async function GET() {
  const session = await readServerSession();
  if (!session) {
    return NextResponse.json({ ok: true, authenticated: false, stripeConfigured: isStripeConfigured() });
  }
  const repo = getUserRepository();
  const user = await repo.findUserById(session.id);
  return NextResponse.json({
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
  });
}
