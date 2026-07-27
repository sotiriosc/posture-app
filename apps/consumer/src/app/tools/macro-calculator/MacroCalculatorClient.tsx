"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type { MacroCalculatorSavedInputs } from "@/lib/macroCalculatorInputs";

type FormState = {
  weightLb: string;
  heightIn: string;
  age: string;
  sex: Sex | "";
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
};

/** Anonymous / logged-out: blank form — never shared defaults that look like another user. */
const BLANK_FORM: FormState = {
  weightLb: "",
  heightIn: "",
  age: "",
  sex: "",
  activityLevel: "",
  goal: "",
};

const savedToForm = (saved: MacroCalculatorSavedInputs): FormState => ({
  weightLb: String(saved.weightLb),
  heightIn: String(saved.heightIn),
  age: String(saved.age),
  sex: saved.sex,
  activityLevel: saved.activityLevel,
  goal: saved.goal,
});

const isCompleteValidForm = (next: FormState) =>
  next.sex !== "" &&
  next.activityLevel !== "" &&
  next.goal !== "" &&
  isValidMacroCalculatorInput({
    weightLb: Number(next.weightLb),
    heightIn: Number(next.heightIn),
    age: Number(next.age),
    sex: next.sex,
    activityLevel: next.activityLevel,
    goal: next.goal,
  });

export default function MacroCalculatorClient() {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const authenticatedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSaveRef = useRef(true);

  const parsedInput = useMemo(
    () => ({
      weightLb: Number(form.weightLb),
      heightIn: Number(form.heightIn),
      age: Number(form.age),
      sex: form.sex as Sex,
      activityLevel: form.activityLevel as ActivityLevel,
      goal: form.goal as Goal,
    }),
    [form]
  );

  const isValid = isCompleteValidForm(form);
  const result = isValid ? calculateMacros(parsedInput) : null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/tools/macro-calculator", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await res.json().catch(() => null)) as {
          authenticated?: boolean;
          inputs?: MacroCalculatorSavedInputs | null;
        } | null;
        if (cancelled) return;
        const isAuth = Boolean(payload?.authenticated);
        authenticatedRef.current = isAuth;
        setAuthenticated(isAuth);
        if (isAuth && payload?.inputs) {
          skipNextSaveRef.current = true;
          setForm(savedToForm(payload.inputs));
        } else {
          setForm(BLANK_FORM);
        }
      } catch {
        if (!cancelled) {
          authenticatedRef.current = false;
          setAuthenticated(false);
          setForm(BLANK_FORM);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (!authenticatedRef.current || !isCompleteValidForm(form)) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void fetch("/api/tools/macro-calculator", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightLb: Number(form.weightLb),
          heightIn: Number(form.heightIn),
          age: Number(form.age),
          sex: form.sex,
          activityLevel: form.activityLevel,
          goal: form.goal,
        }),
      }).catch(() => undefined);
    }, 400);
  }, [form, hydrated]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      data-testid="macro-calculator"
      data-hydrated={hydrated ? "1" : "0"}
      data-authenticated={authenticated ? "1" : "0"}
      className="ui-card ui-soft-surface-raised print:break-inside-avoid rounded-2xl p-5 sm:p-6"
    >
      <form
        autoComplete="off"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Weight (lb)
          <input
            className="ui-input"
            type="number"
            inputMode="decimal"
            name="macro-weight"
            autoComplete="off"
            data-testid="macro-input-weight"
            min={MACRO_INPUT_BOUNDS.weightLb.min}
            max={MACRO_INPUT_BOUNDS.weightLb.max}
            value={form.weightLb}
            onChange={(event) => update("weightLb", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Height (in)
          <input
            className="ui-input"
            type="number"
            inputMode="decimal"
            name="macro-height"
            autoComplete="off"
            data-testid="macro-input-height"
            min={MACRO_INPUT_BOUNDS.heightIn.min}
            max={MACRO_INPUT_BOUNDS.heightIn.max}
            value={form.heightIn}
            onChange={(event) => update("heightIn", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Age
          <input
            className="ui-input"
            type="number"
            inputMode="numeric"
            name="macro-age"
            autoComplete="off"
            data-testid="macro-input-age"
            min={MACRO_INPUT_BOUNDS.age.min}
            max={MACRO_INPUT_BOUNDS.age.max}
            value={form.age}
            onChange={(event) => update("age", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-200">
          Sex (for the calorie formula)
          <select
            className="ui-select"
            name="macro-sex"
            autoComplete="off"
            data-testid="macro-input-sex"
            value={form.sex}
            onChange={(event) => update("sex", event.target.value as Sex | "")}
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-200 sm:col-span-2">
          Activity level
          <select
            className="ui-select"
            name="macro-activity"
            autoComplete="off"
            data-testid="macro-input-activity"
            value={form.activityLevel}
            onChange={(event) =>
              update("activityLevel", event.target.value as ActivityLevel | "")
            }
          >
            <option value="">Select…</option>
            {ACTIVITY_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-200 sm:col-span-2">
          Goal
          <select
            className="ui-select"
            name="macro-goal"
            autoComplete="off"
            data-testid="macro-input-goal"
            value={form.goal}
            onChange={(event) => update("goal", event.target.value as Goal | "")}
          >
            <option value="">Select…</option>
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="mt-6 border-t border-white/10 pt-5">
        {result ? (
          <div data-testid="macro-results">
            <p className="ui-kicker">Your daily targets</p>
            <p className="mt-1 text-3xl font-bold text-white">
              <span data-testid="macro-result-calories">{result.calories}</span>{" "}
              <span className="text-base font-medium text-slate-300">calories / day</span>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Protein
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-protein">{result.proteinG}</span>g
                </p>
              </div>
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Carbs
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-carbs">{result.carbsG}</span>g
                </p>
              </div>
              <div className="ui-soft-surface rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Fat
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  <span data-testid="macro-result-fat">{result.fatG}</span>g
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              Estimated maintenance (TDEE) is {result.tdee} calories/day. Protein is set from
              your bodyweight, fat is a moderate 25% of calories, and carbs fill the rest — a
              high-carb, high-protein, moderate-fat split built for people who train, not for
              general population dieting.
            </p>
          </div>
        ) : (
          <p
            data-testid="macro-results-invalid"
            className="text-sm text-slate-300"
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
