import { NextResponse } from "next/server";
import { getUserRepository } from "@praxis/engine";
import {
  buildUserToken,
  getAuthSecret,
  isAuthConfigured,
  serializeSessionCookie,
} from "@praxis/engine";
import { takeRateLimit } from "@praxis/engine";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  emailOptIn?: boolean;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `register:${ip}`,
    limit: 8,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many signup attempts. Please wait 1 minute." },
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

  const body = (await request.json().catch(() => null)) as RegisterBody | null;
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const emailOptIn = Boolean(body?.emailOptIn);

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (name.length > 80) {
    return NextResponse.json(
      { ok: false, error: "Name is too long." },
      { status: 400 }
    );
  }

  const repo = getUserRepository();
  try {
    const user = await repo.createUser({
      email,
      password,
      name: name || null,
      emailOptIn,
      onboardingSource: "web_signup",
      plan: "free",
    });
    const token = await buildUserToken({
      id: user.id,
      email: user.email,
      plan: user.plan,
    });
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, plan: user.plan },
    });
    response.cookies.set(serializeSessionCookie(token));
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "registration_failed";
    if (message.includes("exists")) {
      return NextResponse.json(
        { ok: false, error: "Email already registered. Please log in." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not create account." },
      { status: 500 }
    );
  }
}

