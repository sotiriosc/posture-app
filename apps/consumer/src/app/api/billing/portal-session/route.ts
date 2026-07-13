import { NextResponse } from "next/server";
import { readServerSession } from "@praxis/engine";
import { getUserRepository } from "@praxis/engine";
import { createStripePortalSession, isStripeConfigured } from "@praxis/engine";
import { takeRateLimit } from "@praxis/engine";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `portal:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many portal attempts. Try again shortly." },
      { status: 429 }
    );
  }
  const session = await readServerSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe not configured." }, { status: 500 });
  }
  const repo = getUserRepository();
  const user = await repo.findUserById(session.id);
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { ok: false, error: "No Stripe customer on file yet." },
      { status: 400 }
    );
  }
  try {
    const portal = await createStripePortalSession({
      customerId: user.stripeCustomerId,
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Portal session failed.",
      },
      { status: 500 }
    );
  }
}
