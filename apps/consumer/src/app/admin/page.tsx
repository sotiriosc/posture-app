import { notFound } from "next/navigation";
import { readServerSession } from "@/lib/serverAuth";
import { isAllowlistedAdminUserId } from "@/lib/adminUserAllowlist";
import { buildOperatorDashboardPayload } from "./operatorData";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Phase 9 — Operator Dashboard.
 * Gated by ADMIN_USER_IDS. Non-admins (and logged-out) get 404 — do not reveal
 * that the route exists.
 */
export default async function AdminOperatorPage() {
  const session = await readServerSession();
  if (!isAllowlistedAdminUserId(session?.id)) {
    notFound();
  }

  const initial = await buildOperatorDashboardPayload("30d");

  return (
    <main className="min-h-screen bg-slate-950">
      <AdminDashboardClient initial={initial} />
    </main>
  );
}
