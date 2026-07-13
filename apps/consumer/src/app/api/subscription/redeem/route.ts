import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Manual redeem has been disabled. Use Stripe checkout.",
    },
    { status: 410 }
  );
}
