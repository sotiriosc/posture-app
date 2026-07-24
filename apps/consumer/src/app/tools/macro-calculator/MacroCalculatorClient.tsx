"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  MACRO_INPUT_BOUNDS,
  calculateMacros,
  isValidMacroCalculatorInput,
  type ActivityLevel,
  type Goal,
  type Sex,
} from "@/tools/macroCalculator";

type FormState = {
  weightLb: string;
  heightIn: string;
  age: string;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
};

const DEFAULT_FORM: FormState = {
  weightLb: "180",
  heightIn: "70",
  age: "30",
  sex: "male",
  activityLevel: "moderate",
  goal: "maintain",
};

export default function MacroCalculatorClient() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const parsedInput = useMemo(
    () => ({
      weightLb: Number(form.weightLb),
      heightIn: Number(form.heightIn),
      age: Number(form.age),
      sex: form.sex,
      activityLevel: form.activityLevel,
      goal: form.goal,
    }),
    [form]
  );

  const isValid = isValidMacroCalculatorInput(parsedInput);
  const result = isValid ? calculateMacros(parsedInput) : null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      data-testid="macro-calculator"
      className="ui-card ui-soft-surface-raised print:break-inside-avoid rounded-2xl p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Weight (lb)
          <input
            className="ui-input"
            type="number"
            inputMode="decimal"
            data-testid="macro-input-weight"
            min={MACRO_INPUT_BOUNDS.weightLb.min}
            max={MACRO_INPUT_BOUNDS.weightLb.max}
            value={form.weightLb}
            onChange={(event) => update("weightLb", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Height (in)
          <input
            className="ui-input"
            type="number"
            inputMode="decimal"
            data-testid="macro-input-height"
            min={MACRO_INPUT_BOUNDS.heightIn.min}
            max={MACRO_INPUT_BOUNDS.heightIn.max}
            value={form.heightIn}
            onChange={(event) => update("heightIn", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Age
          <input
            className="ui-input"
            type="number"
            inputMode="numeric"
            data-testid="macro-input-age"
            min={MACRO_INPUT_BOUNDS.age.min}
            max={MACRO_INPUT_BOUNDS.age.max}
            value={form.age}
            onChange={(event) => update("age", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Sex (for the calorie formula)
          <select
            className="ui-select"
            data-testid="macro-input-sex"
            value={form.sex}
            onChange={(event) => update("sex", event.target.value as Sex)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300 sm:col-span-2">
          Activity level
          <select
            className="ui-select"
            data-testid="macro-input-activity"
            value={form.activityLevel}
            onChange={(event) => update("activityLevel", event.target.value as ActivityLevel)}
          >
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-300 sm:col-span-2">
          Goal
          <select
            className="ui-select"
            data-testid="macro-input-goal"
            value={form.goal}
            onChange={(event) => update("goal", event.target.value as Goal)}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        {result ? (
          <div data-testid="macro-results">
            <p className="ui-kicker">Your daily targets</p>
            <p className="mt-1 text-3xl font-bold text-white">
              <span data-testid="macro-result-calories">{result.calories}</span>{" "}
              <span className="text-base font-medium text-slate-400">calories / day</span>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Protein
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-protein">{result.proteinG}</span>g
                </p>
              </div>
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Carbs
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-carbs">{result.carbsG}</span>g
                </p>
              </div>
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Fat
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-fat">{result.fatG}</span>g
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Estimated maintenance (TDEE) is {result.tdee} calories/day. Protein is set from
              your bodyweight, fat is a moderate 25% of calories, and carbs fill the rest — a
              high-carb, high-protein, moderate-fat split built for people who train, not for
              general population dieting.
            </p>
          </div>
        ) : (
          <p
            data-testid="macro-results-invalid"
            className="text-sm text-slate-400"
          >
            Enter a weight between {MACRO_INPUT_BOUNDS.weightLb.min}–
            {MACRO_INPUT_BOUNDS.weightLb.max} lb, height between{" "}
            {MACRO_INPUT_BOUNDS.heightIn.min}–{MACRO_INPUT_BOUNDS.heightIn.max} in, and age
            between {MACRO_INPUT_BOUNDS.age.min}–{MACRO_INPUT_BOUNDS.age.max} to see your
            targets.
          </p>
        )}
      </div>
    </div>
  );
}
