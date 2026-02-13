import Link from "next/link";
import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import UpgradePrompt from "@/components/UpgradePrompt";

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
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <OnImage>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Step 3
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Results Dashboard
              </h1>
              {session ? (
                <p className="mt-1 text-sm font-semibold text-slate-100">
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
          {authEnabled && isPro ? <ManageSubscriptionButton /> : null}
          {authEnabled && showPaywallNotice && !isPro ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Free plan only unlocks Day 1 workout execution. Upgrade to access all days.
            </div>
          ) : null}
          {authEnabled && !isPro ? <UpgradePrompt /> : null}
        </OnImage>

        <ResultsRoutine />
      </div>
    </BackgroundShell>
  );
}
