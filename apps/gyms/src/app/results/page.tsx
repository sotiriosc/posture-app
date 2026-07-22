import Link from "next/link";
import { cookies } from "next/headers";
import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";
import { getUserRepository } from "@/lib/userRepository";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import PlanBadge from "@/components/results/PlanBadge";
import PlanUpsell from "@/components/results/PlanUpsell";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
  isBuyerDemoSearchParamValue,
} from "@/lib/gymSaas/demoMode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ResultsProps = {
  searchParams: Promise<{ paywall?: string; demo?: string }>;
};

export default async function ResultsPage({ searchParams }: ResultsProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const buyerDemoMode =
    isBuyerDemoSearchParamValue(query.demo) ||
    isBuyerDemoCookieValue(cookieStore.get(BUYER_DEMO_COOKIE)?.value);
  const authEnabled = buyerDemoMode ? false : await isAuthConfigured();
  const session = buyerDemoMode ? null : await readServerSession();
  const storedUser = session
    ? await getUserRepository().findUserById(session.id)
    : null;
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
                  {buyerDemoMode
                    ? "Member Demo plan"
                    : session
                    ? `Welcome back, ${displayName}`
                    : "Your Praxis plan"}
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
              {buyerDemoMode ? (
                <span className="rounded-lg border border-sky-300/35 bg-sky-400/12 px-3 py-1 font-semibold text-sky-100">
                  Buyer demo mode
                </span>
              ) : null}
              <PlanBadge />
            </div>
          </header>
          <PlanUpsell showPaywallNotice={showPaywallNotice} />
        </OnImage>

        <ResultsRoutine buyerDemoMode={buyerDemoMode} />
      </div>
      <OnboardingInfoButton onboardingKey="results" />
    </BackgroundShell>
  );
}
