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
      <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="ui-kicker">
                Account
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Billing status
              </h1>
            </div>
            <Link href="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </header>
        </OnImage>

        <div className="ui-card p-6">
          <p className="ui-kicker">Current plan</p>
          <h2 className="ui-title mt-1">
            {user?.plan === "pro" ? "Pro" : "Free"}
          </h2>
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusChip.className}`}
          >
            {statusChip.label}
          </span>
          <div className="mt-3 space-y-2 text-xs text-slate-700">
            <p>Email: {session?.email ?? "Unknown"}</p>
            <p>
              Access status:{" "}
              {getAccessStatusLabel({
                plan: user?.plan,
                stripeStatus: user?.stripeSubscriptionStatus,
                cancelAtPeriodEnd: user?.stripeCancelAtPeriodEnd,
                renewalDate: user?.stripeCurrentPeriodEnd,
              })}
            </p>
            <p>Stripe subscription status: {user?.stripeSubscriptionStatus ?? "--"}</p>
            <p>{dateRow.label}: {dateRow.value}</p>
            <p>
              Cancel at period end:{" "}
              {user?.stripeCancelAtPeriodEnd === null ||
              user?.stripeCancelAtPeriodEnd === undefined
                ? "--"
                : user.stripeCancelAtPeriodEnd
                ? "Yes"
                : "No"}
            </p>
            <p>Stripe customer: {user?.stripeCustomerId ?? "--"}</p>
            <p>Stripe subscription: {user?.stripeSubscriptionId ?? "--"}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Your Pro plan includes:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              <li>Structured corrective progression built around movement quality and pattern balance</li>
              <li>Weekly progression driven by movement performance and recovery data</li>
              <li>Session tracking and analytics</li>
              <li>Continuous system adjustments</li>
            </ul>
          </div>
          {user?.stripeCustomerId ? (
            <div className="mt-4 space-y-3">
              <ManageSubscriptionButton />
              <p className="text-xs text-slate-600">
                You can cancel or modify your subscription anytime.
              </p>
              <p className="text-xs text-slate-600">
                Your training data remains accessible.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </BackgroundShell>
  );
}
