import Link from "next/link";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export default function QuestionnairePage() {
  return (
    <BackgroundShell>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
        <OnImage>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                Step 2
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Structured movement profile assessment
              </h1>
            </div>
            <Link href="/assessment">
              <Button variant="secondary">Back to photos</Button>
            </Link>
          </header>

          <p className="max-w-2xl text-sm text-slate-200">
            Your answers help identify movement priorities and constraints for better corrective programming.
          </p>
        </OnImage>

        <QuestionnaireForm />
      </div>
      <OnboardingInfoButton onboardingKey="questionnaire" />
    </BackgroundShell>
  );
}
