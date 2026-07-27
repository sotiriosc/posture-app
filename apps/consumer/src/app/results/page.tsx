import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import PlanBadge from "@/components/results/PlanBadge";
import PlanUpsell from "@/components/results/PlanUpsell";
import DashboardProfileMenu from "@/components/results/DashboardProfileMenu";
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
          {/* Phase 6d, Commit 3.a — pill hierarchy above the fold. Plan badge
              stays; Edit profile / Account and billing live in the bottom Menu
              on phone (the "..." control was redundant and clipped off-screen).
              Desktop still has the compact "..." menu. */}
          <header className="ui-page-heading">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="ui-kicker">Praxis Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {session ? `Welcome back, ${displayName}` : "Your Praxis plan"}
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Built from your movement profile
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PlanBadge />
                {/* Mobile: Edit profile / Account live in the bottom Menu.
                    Desktop keeps the compact "..." control. */}
                <div className="hidden sm:block">
                  <DashboardProfileMenu authEnabled={authEnabled} />
                </div>
              </div>
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
