import { NextResponse } from "next/server";
import { getUserRepository } from "@/lib/userRepository";
import {
  buildUserToken,
  isAuthConfigured,
  readServerSession,
  serializeSessionCookie,
} from "@/lib/serverAuth";
import { takeRateLimit } from "@/lib/rateLimit";
import { updateStripeCustomerEmail } from "@/lib/stripeServer";

type CredentialsBody = {
  currentPassword?: string;
  newEmail?: string;
  newPassword?: string;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export async function PATCH(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `account-credentials:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  if (!(await isAuthConfigured())) {
    return NextResponse.json({ ok: false, error: "Auth not configured." }, { status: 500 });
  }

  const session = await readServerSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CredentialsBody | null;
  const currentPassword = body?.currentPassword ?? "";
  const newEmailRaw = body?.newEmail?.trim().toLowerCase() ?? "";
  const newPassword = body?.newPassword ?? "";

  if (!currentPassword) {
    return NextResponse.json(
      { ok: false, error: "Current password is required." },
      { status: 400 }
    );
  }
  if (!newEmailRaw && !newPassword) {
    return NextResponse.json(
      { ok: false, error: "Provide a new email and/or new password." },
      { status: 400 }
    );
  }
  if (newEmailRaw && !isValidEmail(newEmailRaw)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const repo = getUserRepository();
  const user = await repo.findUserById(session.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }
  if (!repo.verifyUserPassword(user, currentPassword)) {
    return NextResponse.json(
      { ok: false, error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const emailChanging = Boolean(newEmailRaw && newEmailRaw !== user.email);
  const passwordChanging = Boolean(newPassword);

  try {
    const updated = await repo.updateUserCredentials(user.id, {
      ...(emailChanging ? { email: newEmailRaw } : {}),
      ...(passwordChanging ? { password: newPassword } : {}),
    });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }

    if (emailChanging && updated.stripeCustomerId) {
      try {
        await updateStripeCustomerEmail({
          customerId: updated.stripeCustomerId,
          email: updated.email,
        });
      } catch (error) {
        console.warn("[account:credentials] Stripe customer email sync failed", error);
      }
    }

    const token = await buildUserToken({
      id: updated.id,
      email: updated.email,
      plan: updated.plan,
    });
    const response = NextResponse.json({
      ok: true,
      user: { id: updated.id, email: updated.email, plan: updated.plan },
    });
    response.cookies.set(serializeSessionCookie(token));
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "update_failed";
    if (message.includes("exists")) {
      return NextResponse.json(
        { ok: false, error: "That email is already in use." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not update account." },
      { status: 500 }
    );
  }
}
