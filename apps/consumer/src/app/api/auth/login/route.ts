import { NextResponse } from "next/server";
import {
  buildUserToken,
  getAuthSecret,
  getUserByCredentials,
  isAuthConfigured,
  serializeSessionCookie,
} from "@/lib/serverAuth";
import { takeRateLimit } from "@/lib/rateLimit";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `login:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please wait 1 minute." },
      { status: 429 }
    );
  }

  const secret = getAuthSecret();
  if (!secret || !(await isAuthConfigured())) {
    return NextResponse.json(
      { ok: false, error: "Auth not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as LoginBody | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await getUserByCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials." },
      { status: 401 }
    );
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
    },
  });
  response.cookies.set(serializeSessionCookie(token));
  return response;
}
