import Link from "next/link";
import ResultsRoutine from "@/components/ResultsRoutine";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

export default function ResultsPage() {
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
                Your results
              </h1>
            </div>
            <Link href="/questionnaire">
              <Button variant="secondary">Edit questionnaire</Button>
            </Link>
          </header>

          <p className="max-w-2xl text-sm text-slate-200">
            Your routine is generated locally using simple rules based on your
            answers. Try it 3 times per week and adjust as needed.
          </p>
        </OnImage>

        <ResultsRoutine />
      </div>
    </BackgroundShell>
  );
}
