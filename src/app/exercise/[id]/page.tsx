import Link from "next/link";
import { exerciseById } from "@/lib/exercises";
import ExerciseHistory from "@/components/ExerciseHistory";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const exercise = exerciseById(id);

  if (!exercise) {
    return (
      <BackgroundShell>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
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
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <OnImage>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Exercise detail
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {exercise.name}
            </h1>
            <p className="text-sm text-slate-200">
              Category: {exercise.category} • {exercise.durationOrReps}
            </p>
          </header>
        </OnImage>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {exercise.videoUrl ? (
            <>
              <div className="aspect-video w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400 flex items-center justify-center">
                Video placeholder
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Video URL: {exercise.videoUrl}
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-xs text-slate-500">
              Video coming soon
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Cues</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
            {exercise.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Mistakes</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
            {exercise.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </div>

        {exercise.contraindications?.length ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Contraindications</p>
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
