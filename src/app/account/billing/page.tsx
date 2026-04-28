import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatDate = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10) : "--";

const getAccessStatusLabel = (params: {
  plan?: "free" | "pro";
  stripeStatus?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  renewalDate?: string | null;
}) => {
  const stripeStatus = (params.stripeStatus ?? "").toLowerCase();
  if (params.plan === "free") return "Free access";
  if (params.cancelAtPeriodEnd) {
    const date = formatDate(params.renewalDate);
    return date === "--"
      ? "Pro (scheduled to end at period close)"
      : `Pro (scheduled to end on ${date})`;
  }
  if (stripeStatus === "active" || stripeStatus === "trialing" || stripeStatus === "past_due") {
    return "Pro (active)";
  }
  return "Pro (active)";
};

const getDateRow = (params: {
  plan?: "free" | "pro";
  stripeStatus?: string | null;
  renewalDate?: string | null;
}) => {
  const stripeStatus = (params.stripeStatus ?? "").toLowerCase();
  const date = formatDate(params.renewalDate);
  if (date === "--") {
    return { label: "Renewal date", value: "--" };
  }
  if (
    params.plan === "free" ||
    stripeStatus === "canceled" ||
    stripeStatus === "incomplete_expired" ||
    stripeStatus === "unpaid"
  ) {
    return { label: "Access ended on", value: date };
  }
  return { label: "Renewal date", value: date };
};

type PlanStatusChip = {
  label: "Active" | "Trial" | "Expired";
  className: string;
};

const getPlanStatusChip = (params: {
  plan?: "free" | "pro";
  stripeStatus?: string | null;
}): PlanStatusChip => {
  const stripeStatus = (params.stripeStatus ?? "").toLowerCase();
  if (stripeStatus === "trialing") {
    return {
      label: "Trial",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  if (
    params.plan === "pro" &&
    (stripeStatus === "active" || stripeStatus === "past_due" || stripeStatus === "")
  ) {
    return {
      label: "Active",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  return {
    label: "Expired",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
};

export default async function BillingAccountPage() {
  const session = await readServerSession();
  const repo = getUserRepository();
  const user = session ? await repo.findUserById(session.id) : null;
  const showTechnicalBillingDetails = process.env.NODE_ENV !== "production";
  const dateRow = getDateRow({
    plan: user?.plan,
    stripeStatus: user?.stripeSubscriptionStatus,
    renewalDate: user?.stripeCurrentPeriodEnd,
  });
  const statusChip = getPlanStatusChip({
    plan: user?.plan,
    stripeStatus: user?.stripeSubscriptionStatus,
  });

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ui-kicker">
                Account
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Account and billing
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Review your Praxis access, renewal timing, and subscription controls.
              </p>
            </div>
            <Link href="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </header>
        </OnImage>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
            <p className="ui-kicker">Current plan</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              {user?.plan === "pro" ? "Pro" : "Free"}
            </h2>
            <span
              className={`mt-3 inline-flex rounded-lg border px-3 py-1 text-[11px] font-semibold uppercase ${statusChip.className}`}
            >
              {statusChip.label}
            </span>
            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {[
                ["Email", session?.email ?? "Unknown"],
                [
                  "Access status",
                  getAccessStatusLabel({
                    plan: user?.plan,
                    stripeStatus: user?.stripeSubscriptionStatus,
                    cancelAtPeriodEnd: user?.stripeCancelAtPeriodEnd,
                    renewalDate: user?.stripeCurrentPeriodEnd,
                  }),
                ],
                [dateRow.label, dateRow.value],
                [
                  "Scheduled cancellation",
                  user?.stripeCancelAtPeriodEnd === null ||
                  user?.stripeCancelAtPeriodEnd === undefined
                    ? "--"
                    : user.stripeCancelAtPeriodEnd
                    ? "Yes"
                    : "No",
                ],
                ...(showTechnicalBillingDetails
                  ? [
                      ["Billing status", user?.stripeSubscriptionStatus ?? "--"],
                      ["Customer reference", user?.stripeCustomerId ?? "--"],
                      ["Subscription reference", user?.stripeSubscriptionId ?? "--"],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="ui-soft-surface rounded-lg px-3 py-3"
                >
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-1 break-words font-semibold text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
            <p className="ui-kicker">Access</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Praxis Pro includes
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Structured corrective progression around movement quality.</li>
              <li>Weekly progression driven by performance and recovery data.</li>
              <li>Session tracking, analytics, and continuous adjustments.</li>
            </ul>
            {user?.stripeCustomerId ? (
              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <ManageSubscriptionButton />
                <p className="text-xs text-slate-400">
                  You can cancel or modify your subscription anytime.
                </p>
                <p className="text-xs text-slate-400">
                  Your training data remains accessible.
                </p>
              </div>
            ) : (
              <div className="ui-soft-surface mt-5 rounded-lg px-3 py-3 text-xs text-slate-300">
                Subscription management appears after your first checkout is connected.
              </div>
            )}
            <div className="mt-4">
              <Link href="/account/settings">
                <Button variant="secondary" className="w-full">
                  Data settings
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </BackgroundShell>
  );
}
