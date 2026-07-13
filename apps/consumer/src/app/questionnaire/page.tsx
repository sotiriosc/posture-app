import Link from "next/link";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export default function QuestionnairePage() {
  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-4xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">
                Step 2
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Build your Praxis movement profile
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Choose the goals, schedule, and equipment that should shape your weekly plan.
              </p>
            </div>
            <Link href="/assessment">
              <Button variant="secondary">Back to photos</Button>
            </Link>
          </header>
        </OnImage>

        <QuestionnaireForm />
      </div>
      <OnboardingInfoButton onboardingKey="questionnaire" />
    </BackgroundShell>
  );
}
