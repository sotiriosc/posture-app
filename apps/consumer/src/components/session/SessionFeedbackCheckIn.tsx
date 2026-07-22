"use client";

import type { SessionFeedback } from "@/lib/types";
import { formatSessionFeedbackSummary } from "@/lib/sessionFeedback";
import Button from "@/components/ui/Button";

type Props = {
  value: Partial<SessionFeedback>;
  savedFeedback?: SessionFeedback | null;
  saveState?: "idle" | "saving" | "saved";
  onChange: (next: Partial<SessionFeedback>) => void;
  onSave: () => void | Promise<void>;
};

const completionOptions: Array<{
  value: NonNullable<SessionFeedback["completed"]>;
  label: string;
}> = [
  { value: "yes", label: "Done" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "Skipped" },
];

const oneToFive = [1, 2, 3, 4, 5] as const;

const numberValue = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const parseNumberInput = (value: string) =>
  value.trim() === "" ? undefined : Number(value);

export default function SessionFeedbackCheckIn({
  value,
  savedFeedback,
  saveState = "idle",
  onChange,
  onSave,
}: Props) {
  const savedSummary = formatSessionFeedbackSummary(savedFeedback);
  const selectedCompletion = value.completed ?? "yes";

  return (
    <div className="ui-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Quick check-in</p>
          <p className="mt-1 text-xs text-slate-600">
            A few notes for this workout. Keep it simple.
          </p>
        </div>
        {saveState === "saved" ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Saved
          </span>
        ) : null}
      </div>

      {savedSummary ? (
        <p
          className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
          data-testid="session-feedback-summary"
        >
          {savedSummary}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Completion
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {completionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-testid={`session-feedback-completed-${option.value}`}
                onClick={() => onChange({ ...value, completed: option.value })}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCompletion === option.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">
              Difficulty
            </span>
            <input
              data-testid="session-feedback-difficulty"
              type="number"
              min={1}
              max={10}
              value={numberValue(value.difficultyRPE)}
              onChange={(event) =>
                onChange({
                  ...value,
                  difficultyRPE: parseNumberInput(event.target.value),
                })
              }
              className="ui-input mt-1 h-10 w-full"
              placeholder="1-10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">
              Pain before
            </span>
            <input
              data-testid="session-feedback-pain-before"
              type="number"
              min={0}
              max={10}
              value={numberValue(value.painBefore)}
              onChange={(event) =>
                onChange({
                  ...value,
                  painBefore: parseNumberInput(event.target.value),
                })
              }
              className="ui-input mt-1 h-10 w-full"
              placeholder="0-10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">
              Pain after
            </span>
            <input
              data-testid="session-feedback-pain-after"
              type="number"
              min={0}
              max={10}
              value={numberValue(value.painAfter)}
              onChange={(event) =>
                onChange({
                  ...value,
                  painAfter: parseNumberInput(event.target.value),
                })
              }
              className="ui-input mt-1 h-10 w-full"
              placeholder="0-10"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">Energy</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {oneToFive.map((score) => (
                <button
                  key={score}
                  type="button"
                  data-testid={`session-feedback-energy-${score}`}
                  onClick={() => onChange({ ...value, energy: score })}
                  className={`h-11 w-11 rounded-full border text-sm font-semibold ${
                    value.energy === score
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  aria-label={`Energy ${score} out of 5`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Confidence</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {oneToFive.map((score) => (
                <button
                  key={score}
                  type="button"
                  data-testid={`session-feedback-confidence-${score}`}
                  onClick={() =>
                    onChange({ ...value, techniqueConfidence: score })
                  }
                  className={`h-11 w-11 rounded-full border text-sm font-semibold ${
                    value.techniqueConfidence === score
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  aria-label={`Confidence ${score} out of 5`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700">
            Notes optional
          </span>
          <textarea
            data-testid="session-feedback-notes"
            value={value.notes ?? ""}
            onChange={(event) => onChange({ ...value, notes: event.target.value })}
            className="ui-input mt-1 min-h-20 w-full resize-y py-2"
            placeholder="Anything worth remembering next time?"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saveState === "saving"}
            className="h-10 rounded-xl px-4 text-sm font-semibold"
            data-testid="session-feedback-save"
          >
            {saveState === "saving" ? "Saving..." : "Save check-in"}
          </Button>
          <p className="text-xs text-slate-500">
            This will not change the next workout yet.
          </p>
        </div>
      </div>
    </div>
  );
}

