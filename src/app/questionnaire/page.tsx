import Link from "next/link";
import { cookies } from "next/headers";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
  isBuyerDemoSearchParamValue,
} from "@/lib/gymSaas/demoMode";
import {
  getActiveGymConfig,
  getGymQuestionnaireEquipmentSelection,
} from "@/lib/gymSaas/gymConfig";

type QuestionnairePageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function QuestionnairePage({
  searchParams,
}: QuestionnairePageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const buyerDemoMode =
    isBuyerDemoSearchParamValue(query.demo) ||
    isBuyerDemoCookieValue(cookieStore.get(BUYER_DEMO_COOKIE)?.value);
  const activeGymConfig = buyerDemoMode ? getActiveGymConfig() : null;

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-4xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">
                {buyerDemoMode ? "Buyer demo mode" : "Step 2"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {buyerDemoMode
                  ? "Build the member demo profile"
                  : "Build your Praxis movement profile"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                {buyerDemoMode
                  ? "Choose the member goal and schedule for this pilot flow. Equipment is configured by the gym."
                  : "Choose the goals, schedule, and equipment that should shape your weekly plan."}
              </p>
            </div>
            <Link href="/assessment">
              <Button variant="secondary">Back to photos</Button>
            </Link>
          </header>
        </OnImage>

        <QuestionnaireForm
          buyerDemoMode={buyerDemoMode}
          gymMode={buyerDemoMode}
          lockedEquipment={
            activeGymConfig
              ? getGymQuestionnaireEquipmentSelection(activeGymConfig)
              : undefined
          }
          lockedEquipmentLabel={
            activeGymConfig ? "Configured gym floor equipment" : undefined
          }
        />
      </div>
      <OnboardingInfoButton onboardingKey="questionnaire" />
    </BackgroundShell>
  );
}
