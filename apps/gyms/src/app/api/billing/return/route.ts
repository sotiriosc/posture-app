import { NextResponse } from "next/server";
import {
  buildUserToken,
  readServerSession,
  serializeSessionCookie,
} from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Stripe checkout success return (Phase 6b, Commit 1 — SHIP-CRITICAL).
 *
 * Stripe's success_url points here instead of straight at /results. Three
 * things go wrong if it lands on /results directly:
 *   1. The session token still encodes the pre-checkout plan (e.g. "free"). The
 *      middleware reads the plan from the token, so a just-upgraded Pro user can
 *      be bounced to /results?paywall=1 the moment they open a Pro day.
 *   2. Any session read that races a cold DB connection right after the Stripe
 *      round-trip presents as a silent logout.
 *   3. An absolute redirect built from the request host can resolve to a
 *      different host than the browser used (proxy/canonical-host normalisation),
 *      and the auth cookie — being host-scoped — is then dropped, logging the
 *      user out. We redirect with a RELATIVE Location so the browser resolves it
 *      against the exact host it already holds the cookie for.
 *
 * This handler re-establishes the session from the DB and re-issues the cookie
 * with the current plan and a fresh expiry, then hands off to the dashboard.
 * If there is no valid session we simply forward to /results and let the normal
 * auth middleware decide (it will route an unauthenticated user to login).
 */
export async function GET() {
  const session = await readServerSession();
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/results?billing=success" },
  });
  if (session) {
    const token = await buildUserToken({
      id: session.id,
      email: session.email,
      plan: session.plan,
    });
    response.cookies.set(serializeSessionCookie(token));
  }
  return response;
}
