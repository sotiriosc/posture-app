import { NextResponse } from "next/server";
import { readServerSession } from "@/lib/serverAuth";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripeServer";
import { takeRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `checkout:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many checkout attempts. Try again shortly." },
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
  try {
    const checkout = await createStripeCheckoutSession({
      userId: session.id,
      email: session.email,
    });
    if (!checkout.url) {
      return NextResponse.json({ ok: false, error: "Stripe checkout unavailable." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Checkout failed.",
      },
      { status: 500 }
    );
  }
}
