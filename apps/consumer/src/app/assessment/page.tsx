import Link from "next/link";
import PhotoUploader from "@/components/PhotoUploader";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export default function AssessmentPage() {
  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">
                Movement & Posture Baseline
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Upload your posture photos
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                These images help detect structural imbalances that influence movement mechanics and corrective focus.
              </p>
            </div>
            <Link href="/questionnaire">
              <Button variant="secondary">Answer profile instead</Button>
            </Link>
          </header>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {["Natural stance", "Good lighting", "Front / side / back"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-400/18 bg-slate-950/42 px-3 py-2 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Phase 4 — Capture quality protocol card */}
          <div className="mt-2 rounded-lg border border-slate-400/18 bg-slate-950/42 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Photo protocol
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              <li>• Phone at chest height — not overhead, not low.</li>
              <li>• Stand ~8 feet from wall or camera.</li>
              <li>• Plain background if possible.</li>
              <li>• Neutral clothing — avoid baggy tops that obscure shoulders and hips.</li>
              <li>• Use timer capture, not selfie mode.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Side view required</span> for forward-head and torso-lean measurements.
              Skipping the side photo disables those observations.
            </p>
          </div>
        </OnImage>

        <PhotoUploader />

        <OnImage className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
          <Link href="/questionnaire">
            <Button variant="primary">Continue to profile</Button>
          </Link>
        </OnImage>
      </div>
      <OnboardingInfoButton onboardingKey="assessment" />
    </BackgroundShell>
  );
}
