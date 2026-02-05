import Link from "next/link";
import PhotoUploader from "@/components/PhotoUploader";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

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
            </div>
            <Link href="/questionnaire">
              <Button variant="secondary">Skip to questionnaire</Button>
            </Link>
          </header>

          <p className="max-w-2xl text-sm text-slate-200">
            We only store these photos on your device using local storage. Capture
            natural posture in good lighting for the clearest results.
          </p>
        </OnImage>

        <PhotoUploader />

        <OnImage className="flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
          <Link href="/questionnaire">
            <Button variant="primary">Continue to questionnaire</Button>
          </Link>
        </OnImage>
      </div>
    </BackgroundShell>
  );
}
