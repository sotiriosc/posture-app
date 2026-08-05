import Link from "next/link";
import { exerciseById } from "@/lib/exercises";
import { resolveExerciseCoachingViewModel } from "@/lib/coaching/resolveExerciseCoaching";
import ExerciseHistory from "@/components/ExerciseHistory";
import ExerciseCoachingGuide from "@/components/ExerciseCoachingGuide";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const exercise = exerciseById(id);
  const coaching = resolveExerciseCoachingViewModel({ exerciseId: id });

  if (!exercise || !coaching) {
    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              Exercise not found
            </h1>
            <p className="text-sm text-slate-200">
              We couldn&apos;t find that exercise. Please go back to results and
              try again.
            </p>
            <Link href="/results">
              <Button variant="secondary">Back to results</Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Exercise guidance
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {coaching.name}
            </h1>
            <p className="text-sm text-slate-200">
              {exercise.category} • {coaching.prescription.repsOrDuration}
            </p>
          </header>
        </OnImage>

        <ExerciseCoachingGuide coaching={coaching} />

        {exercise.contraindications?.length ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Additional cautions</p>
            <ul className="mt-3 list-disc pl-5">
              {exercise.contraindications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <ExerciseHistory exerciseId={exercise.id} />

        <OnImage>
          <Link href="/results">
            <Button variant="secondary">Back to results</Button>
          </Link>
        </OnImage>
      </div>
    </BackgroundShell>
  );
}
