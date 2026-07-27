import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import BillingSessionSync from "@/components/BillingSessionSync";
import {
  deriveBillingDisplay,
  type LocalBillingRecord,
} from "@/lib/billingDisplay";
import {
  billingPatchFromSnapshot,
  canFetchStripeBilling,
  fetchStripeSubscriptionSnapshot,
} from "@/lib/stripeServer";
import type { StoredUser } from "@/lib/userStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const toBillingRecord = (user: StoredUser | null): LocalBillingRecord => ({
  plan: user?.plan === "pro" ? "pro" : "free",
  stripeSubscriptionStatus: user?.stripeSubscriptionStatus ?? null,
  stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd ?? null,
  stripeCancelAtPeriodEnd: user?.stripeCancelAtPeriodEnd ?? null,
  stripeCustomerId: user?.stripeCustomerId ?? null,
  stripeSubscriptionId: user?.stripeSubscriptionId ?? null,
});

const hasStripeBillingLink = (user: StoredUser | null) =>
  Boolean(user?.stripeCustomerId || user?.stripeSubscriptionId);

const reconcileFromStripe = async (user: StoredUser): Promise<StoredUser> => {
  if (!canFetchStripeBilling()) {
    console.error("[billing:page] sync skipped: Stripe secret missing");
    return user;
  }
  if (!hasStripeBillingLink(user)) {
    console.error("[billing:page] sync skipped: no stripeCustomerId/subscriptionId on user", {
      userId: user.id,
      plan: user.plan,
    });
    return user;
  }
  const before = toBillingRecord(user);
  try {
    const snapshot = await fetchStripeSubscriptionSnapshot({
      subscriptionId: user.stripeSubscriptionId,
      customerId: user.stripeCustomerId,
    });
    if (!snapshot) {
      console.error("[billing:page] Stripe retrieve returned null; keeping local record", {
        userId: user.id,
        before,
      });
      return user;
    }
    const repo = getUserRepository();
    const updated =
      (await repo.updateUserBilling(user.id, billingPatchFromSnapshot(snapshot))) ??
      user;
    console.info("[billing:page] synced from Stripe", {
      userId: user.id,
      before,
      snapshot,
      after: toBillingRecord(updated),
    });
    return updated;
  } catch (error) {
    console.error("[billing:page] Stripe subscription retrieve failed; keeping local record", {
      userId: user.id,
      before,
      error: error instanceof Error ? error.message : String(error),
    });
    return user;
  }
};

export default async function BillingAccountPage() {
  const session = await readServerSession();
  const repo = getUserRepository();
  let user = session ? await repo.findUserById(session.id) : null;
  const showTechnicalBillingDetails = process.env.NODE_ENV !== "production";

  const shouldSyncFromStripe =
    Boolean(user) && canFetchStripeBilling() && hasStripeBillingLink(user);
  console.info("[billing:page] load", {
    userId: user?.id ?? null,
    email: session?.email ?? null,
    canFetchStripeBilling: canFetchStripeBilling(),
    hasStripeBillingLink: hasStripeBillingLink(user),
    shouldSyncFromStripe,
    local: user ? toBillingRecord(user) : null,
  });
  if (user && shouldSyncFromStripe) {
    user = await reconcileFromStripe(user);
  }

  const display = deriveBillingDisplay(toBillingRecord(user));
  console.info("[billing:page] render", {
    userId: user?.id ?? null,
    display,
    record: toBillingRecord(user),
  });

  return (
    <BackgroundShell>
      {shouldSyncFromStripe ? <BillingSessionSync /> : null}
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
          <div
            className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6"
            data-testid="billing-plan-card"
          >
            <p className="ui-kicker">Current plan</p>
            <h2
              className="mt-2 text-3xl font-semibold text-white"
              data-testid="billing-plan-label"
            >
              {display.planLabel}
            </h2>
            <span
              className={`mt-3 inline-flex rounded-lg border px-3 py-1 text-[11px] font-semibold uppercase ${display.statusChip.className}`}
              data-testid="billing-status-chip"
            >
              {display.statusChip.label}
            </span>
            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {[
                ["Email", session?.email ?? "Unknown"],
                ["Access status", display.accessStatus],
                [display.renewalLabel, display.renewalValue],
                ["Scheduled cancellation", display.cancellationValue],
                ...(showTechnicalBillingDetails
                  ? [
                      ["Billing status", user?.stripeSubscriptionStatus ?? "—"],
                      ["Customer reference", user?.stripeCustomerId ?? "—"],
                      ["Subscription reference", user?.stripeSubscriptionId ?? "—"],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="ui-soft-surface rounded-lg px-3 py-3"
                  data-testid={`billing-field-${label.toLowerCase().replace(/\s+/g, "-")}`}
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
