import { NextResponse } from "next/server";
import { readServerSession } from "@/lib/serverAuth";
import { isAllowlistedAdminUserId } from "@/lib/adminUserAllowlist";
import {
  assertNoPiiInOperatorPayload,
  buildOperatorDashboardPayload,
  type OperatorWindowPreset,
} from "@/app/admin/operatorData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const parseWindow = (raw: string | null): OperatorWindowPreset => {
  if (raw === "7d" || raw === "30d" || raw === "all") return raw;
  return "30d";
};

/**
 * Phase 9 — aggregate-only operator metrics.
 * 404 for anyone not on ADMIN_USER_IDS (including logged-out).
 */
export async function GET(request: Request) {
  const session = await readServerSession();
  if (!isAllowlistedAdminUserId(session?.id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const window = parseWindow(url.searchParams.get("window"));
  const payload = await buildOperatorDashboardPayload(window);

  const violations = assertNoPiiInOperatorPayload(payload);
  if (violations.length > 0) {
    console.error("[admin/metrics] PII guard blocked response", violations);
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
