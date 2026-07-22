import { NextResponse } from "next/server";
import { buildUserToken, isAuthConfigured, readServerSession, serializeSessionCookie } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const enabled = await isAuthConfigured();
  const session = await readServerSession();
  const response = NextResponse.json({
    ok: true,
    enabled,
    authenticated: Boolean(session),
    user: session,
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  if (session) {
    const refreshed = await buildUserToken({
      id: session.id,
      email: session.email,
      plan: session.plan,
    });
    response.cookies.set(serializeSessionCookie(refreshed));
  }
  return response;
}
