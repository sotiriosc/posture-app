import { NextResponse } from "next/server";
import { readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import {
  parseMacroCalculatorSavedInputs,
  type MacroCalculatorSavedInputs,
} from "@/lib/macroCalculatorInputs";
import { takeRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Account-scoped macro calculator inputs (Option C).
 * Anonymous callers get { authenticated: false, inputs: null }.
 * Authenticated callers read/write the user record — never browser-global storage.
 */

export async function GET() {
  const session = await readServerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, inputs: null });
  }
  const repo = getUserRepository();
  const user = await repo.findUserById(session.id);
  return NextResponse.json({
    authenticated: true,
    inputs: user?.macroCalculatorInputs ?? null,
  });
}

export async function PUT(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = takeRateLimit({
    key: `macro-calculator:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many saves. Try again shortly." },
      { status: 429 }
    );
  }

  const session = await readServerSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | Partial<MacroCalculatorSavedInputs>
    | null;
  const parsed = parseMacroCalculatorSavedInputs({
    ...(body ?? {}),
    updatedAt: new Date().toISOString(),
  });
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: "Invalid calculator inputs." },
      { status: 400 }
    );
  }

  const repo = getUserRepository();
  const updated = await repo.updateUserMacroCalculatorInputs(session.id, parsed);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, inputs: updated.macroCalculatorInputs ?? parsed });
}
