import Link from "next/link";
import PhotoUploader from "@/components/PhotoUploader";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export default function AssessmentPage() {
  return (
    <BackgroundShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <OnImage>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Step 1
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Upload your posture photos
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                These photos help the system detect posture imbalances and adapt your training automatically.
              </p>
            </div>
            <Link href="/questionnaire">
              <Button variant="secondary">Skip to questionnaire</Button>
            </Link>
          </header>

          <p className="max-w-2xl text-sm text-slate-200">
            Photos are stored on your device. Capture natural posture in good
            lighting for the clearest results.
          </p>
        </OnImage>

        <PhotoUploader />
        <p className="max-w-3xl text-sm text-slate-200">
          These images help the system detect posture imbalances and automatically adjust your program for better alignment, strength, and long-term progression.
        </p>

        <OnImage className="flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
          <Link href="/questionnaire">
            <Button variant="primary">Continue to questionnaire</Button>
          </Link>
        </OnImage>
      </div>
      <OnboardingInfoButton onboardingKey="assessment" />
    </BackgroundShell>
  );
}
