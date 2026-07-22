import Link from "next/link";
import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import PlanBadge from "@/components/results/PlanBadge";
import PlanUpsell from "@/components/results/PlanUpsell";
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
  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-8 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="ui-kicker">Praxis Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {session ? `Welcome back, ${displayName}` : "Your Praxis plan"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/questionnaire">
                  <Button variant="secondary">Edit profile</Button>
                </Link>
                {authEnabled ? (
                  <Link href="/account/billing">
                    <Button variant="secondary">Account and billing</Button>
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-200">
              <span className="rounded-lg border border-slate-400/30 bg-slate-950/45 px-3 py-1">
                Built from your movement profile
              </span>
              <PlanBadge />
            </div>
          </header>
          <PlanUpsell showPaywallNotice={showPaywallNotice} />
        </OnImage>

        <ResultsRoutine />
      </div>
      <OnboardingInfoButton onboardingKey="results" />
    </BackgroundShell>
  );
}
