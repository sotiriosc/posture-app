import Link from "next/link";
import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import UpgradePrompt from "@/components/UpgradePrompt";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ResultsProps = {
  searchParams: Promise<{ paywall?: string }>;
};

export default async function ResultsPage({ searchParams }: ResultsProps) {
  const query = await searchParams;
  const authEnabled = await isAuthConfigured();
  const session = await readServerSession();
  const repo = getUserRepository();
  const storedUser = session ? await repo.findUserById(session.id) : null;
  const displayName =
    storedUser?.name?.trim() ||
    session?.email?.split("@")[0] ||
    "athlete";
  const showPaywallNotice = query.paywall === "1";
  const isPro = session?.plan === "pro";
  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-8 py-8 sm:py-12">
        <OnImage>
          <header className="rounded-2xl border border-slate-300/20 bg-slate-900/35 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="ui-kicker">
                  Step 3
                </p>
                <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                  Results Dashboard
                </h1>
                {session ? (
                  <p className="mt-2 text-base font-semibold text-slate-100 sm:text-lg">
                    Hey {displayName}, welcome back. How are you feeling today?
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/questionnaire">
                  <Button variant="secondary">Edit questionnaire</Button>
                </Link>
                {authEnabled ? (
                  <Link href="/account/billing">
                    <Button variant="secondary">Billing status</Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </header>

          <p className="max-w-2xl text-sm text-slate-200">
            Your routine is generated locally using simple rules based on your
            answers. Ready to start your next session and build momentum?
          </p>
          {authEnabled ? (
            <p className="text-xs font-semibold text-slate-200">
              Plan: {isPro ? "Pro (full access)" : "Free (day 1 workout access)"}
            </p>
          ) : null}
          {authEnabled && isPro ? <ManageSubscriptionButton showRefreshAction={false} /> : null}
          {authEnabled && showPaywallNotice && !isPro ? (
            <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Free plan only unlocks Day 1 workout execution. Upgrade to access all days.
            </div>
          ) : null}
          {authEnabled && !isPro ? <UpgradePrompt /> : null}
        </OnImage>

        <ResultsRoutine />
      </div>
      <OnboardingInfoButton page="results" />
    </BackgroundShell>
  );
}
