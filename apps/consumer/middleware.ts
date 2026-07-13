import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@praxis/engine";

const ADMIN_COOKIE_NAME = "bac_admin";
const AUTH_COOKIE_NAME = "bac_user";

const toSha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/settings")) {
    const adminSecret = process.env.ADMIN_ACCESS_KEY ?? "";
    if (!adminSecret) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const expected = await toSha256(adminSecret);
    const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";
    if (cookieValue !== expected) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const needsAuth =
    pathname.startsWith("/results") ||
    pathname.startsWith("/session") ||
    pathname.startsWith("/program") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/account");

  if (!needsAuth) {
    return NextResponse.next();
  }

  const authEnabled =
    Boolean(process.env.AUTH_SECRET);
  if (!authEnabled) {
    return NextResponse.next();
  }

  const authSecret = process.env.AUTH_SECRET ?? "";
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? "";
  const session = authSecret && token ? await verifySessionToken(token, authSecret) : null;
  if (!session) {
    const next = encodeURIComponent(`${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(new URL(`/auth/login?next=${next}`, request.url));
  }

  const restrictedDay = resolveRequestedDay(pathname, searchParams);
  if (session.plan !== "pro" && restrictedDay !== null && restrictedDay > 0) {
    return NextResponse.redirect(new URL("/results?paywall=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/settings/:path*", "/results/:path*", "/session/:path*", "/program/:path*", "/progress/:path*", "/account/:path*"],
};

const resolveRequestedDay = (
  pathname: string,
  searchParams: URLSearchParams
) => {
  if (pathname.startsWith("/session")) {
    const day = Number(searchParams.get("dayIndex"));
    return Number.isFinite(day) ? day : 0;
  }
  const match = pathname.match(/\/program\/[^/]+\/day\/(\d+)/);
  if (match?.[1]) {
    const day = Number(match[1]);
    return Number.isFinite(day) ? day : 0;
  }
  return null;
};
