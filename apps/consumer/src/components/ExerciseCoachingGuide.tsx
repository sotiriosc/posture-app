import type { ReactNode } from "react";
import type { ExerciseCoachingViewModel } from "@/lib/coaching/exerciseCoachingContract";

type Props = {
  coaching: ExerciseCoachingViewModel;
  className?: string;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="ui-card space-y-3 p-6">
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    <div className="text-sm leading-6 text-slate-600">{children}</div>
  </section>
);

export default function ExerciseCoachingGuide({ coaching, className = "" }: Props) {
  return (
    <div className={`space-y-4 ${className}`} data-testid="exercise-coaching-guide">
      {coaching.demo.status === "available" && coaching.demo.url ? (
        <div className="ui-card p-6">
          <video
            className="aspect-video w-full rounded-2xl border border-slate-200 bg-black"
            controls
            preload="metadata"
            src={coaching.demo.url}
          >
            Your browser does not support embedded video.
          </video>
        </div>
      ) : coaching.demo.status === "planned" ? (
        <p
          className="text-xs font-medium text-slate-500"
          data-testid="demo-planned-label"
        >
          Demonstration planned
        </p>
      ) : null}

      <Section title="Purpose">
        <p>{coaching.purpose}</p>
        {coaching.whySelected ? (
          <p className="mt-2">
            <span className="font-semibold text-slate-700">Why this today: </span>
            {coaching.whySelected}
          </p>
        ) : null}
      </Section>

      <Section title="Setup">
        <ol className="list-decimal space-y-1 pl-5">
          {coaching.setupSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {coaching.equipmentNeeded.length ? (
          <p className="mt-2 text-xs text-slate-500">
            Equipment: {coaching.equipmentNeeded.join(", ")}
          </p>
        ) : null}
      </Section>

      <Section title="How to perform">
        <ol className="list-decimal space-y-1 pl-5">
          {coaching.executionSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-3">
          <span className="font-semibold text-slate-700">Primary cue: </span>
          {coaching.primaryCue}
        </p>
      </Section>

      <Section title="What you should feel">
        <ul className="list-disc space-y-1 pl-5">
          {coaching.expectedFeel.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {coaching.avoidFeeling?.length ? (
          <div className="mt-3">
            <p className="font-semibold text-slate-700">Avoid / warning feelings</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {coaching.avoidFeeling.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section title="Common mistake">
        <p>
          <span className="font-semibold text-slate-700">Mistake: </span>
          {coaching.commonMistake}
        </p>
        <p className="mt-2">
          <span className="font-semibold text-slate-700">Correction: </span>
          {coaching.correction}
        </p>
      </Section>

      <Section title="Stop or swap">
        <ul className="list-disc space-y-1 pl-5">
          {coaching.stopSignals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          If this feels wrong for your body, make it easier, swap the exercise, or
          report pain from the session controls — do not push through sharp joint pain.
        </p>
      </Section>

      <Section title="Easier and harder">
        {coaching.regression?.name ? (
          <p>
            <span className="font-semibold text-slate-700">Easier: </span>
            {coaching.regression.name}
          </p>
        ) : (
          <p>Stay with this version until control is solid.</p>
        )}
        {coaching.progression?.label ? (
          <p className="mt-2">
            <span className="font-semibold text-slate-700">Progression: </span>
            {coaching.progression.label}
          </p>
        ) : null}
      </Section>

      {coaching.capabilityNote ? (
        <Section title="Setup note">
          <p>{coaching.capabilityNote}</p>
        </Section>
      ) : null}
    </div>
  );
}
