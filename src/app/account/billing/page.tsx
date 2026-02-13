import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";

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

export default async function BillingAccountPage() {
  const session = await readServerSession();
  const repo = getUserRepository();
  const user = session ? await repo.findUserById(session.id) : null;
  const dateRow = getDateRow({
    plan: user?.plan,
    stripeStatus: user?.stripeSubscriptionStatus,
    renewalDate: user?.stripeCurrentPeriodEnd,
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
          {user?.stripeCustomerId ? <ManageSubscriptionButton /> : null}
        </div>
      </div>
    </BackgroundShell>
  );
}
