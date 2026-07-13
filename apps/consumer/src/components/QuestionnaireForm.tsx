"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeEquipmentSelectionValues } from "@praxis/engine";
import { loadAppState, saveAppState } from "@praxis/engine";
import { buildQuestionnaireSignature } from "@praxis/engine";
import { loadTrainingSnapshot, pushTrainingPatch } from "@praxis/engine";
import { logTrainingSync } from "@praxis/engine";
import { clearDraft } from "@praxis/engine";
import { buildSignalsFromLocalState, generateProgram } from "@praxis/engine";
import { getProgram, saveProgram, saveProgramProgress, uuid } from "@praxis/engine";
import type { ProgramProgress } from "@praxis/engine";

export type QuestionnaireData = {
  goals: string;
  painAreas: string[];
  experience: string;
  equipment: string[];
  daysPerWeek: 3 | 4 | 5;
};

const STORAGE_KEY = "posture_questionnaire";

const goalOptions = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

const painOptions = [
  "Neck",
  "Upper back",
  "Lower back",
  "Shoulders",
  "Hips",
];

const experienceOptions = ["Beginner", "Intermediate", "Advanced"];

const equipmentOptions = [
  { value: "none", label: "None" },
  { value: "bands", label: "Resistance bands" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "foam_roller", label: "Foam roller" },
  { value: "gym", label: "Gym" },
];

const emptyData: QuestionnaireData = {
  goals: goalOptions[0],
  painAreas: [],
  experience: experienceOptions[0],
  equipment: ["none"],
  daysPerWeek: 3,
};

const normalizeDaysPerWeek = (value: unknown): QuestionnaireData["daysPerWeek"] => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

const normalizeQuestionnaireData = (
  input?: Partial<QuestionnaireData> | null
): QuestionnaireData => ({
  ...emptyData,
  ...(input ?? {}),
  equipment: normalizeEquipmentSelectionValues(input?.equipment ?? ["none"]),
  daysPerWeek: normalizeDaysPerWeek(input?.daysPerWeek),
});

const hasProgramAffectingChange = (
  next: QuestionnaireData,
  baseline: QuestionnaireData
) =>
  buildQuestionnaireSignature(next) !== buildQuestionnaireSignature(baseline);

export default function QuestionnaireForm() {
  const [data, setData] = useState<QuestionnaireData>(emptyData);
  const [committedData, setCommittedData] = useState<QuestionnaireData>(emptyData);
  const [pendingData, setPendingData] = useState<QuestionnaireData | null>(null);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [isApplyingChange, setIsApplyingChange] = useState(false);
  const [changeWarning, setChangeWarning] = useState<string | null>(null);
  const [requiresChangeConfirmation, setRequiresChangeConfirmation] = useState(false);
  const router = useRouter();
  const [hydratedServerSnapshot, setHydratedServerSnapshot] = useState(false);
  const lastQuestionnaireSyncSignatureRef = useRef<string | null>(null);

  const persistQuestionnaire = (next: QuestionnaireData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (hydratedServerSnapshot) {
      const nextSignature = buildQuestionnaireSignature(next);
      if (lastQuestionnaireSyncSignatureRef.current === nextSignature) {
        logTrainingSync("training-sync", "skipped unchanged questionnaire sync");
        return;
      }
      lastQuestionnaireSyncSignatureRef.current = nextSignature;
      void pushTrainingPatch({ questionnaire: next });
    }
  };

  const openChangeConfirm = (next: QuestionnaireData) => {
    setPendingData(next);
    setShowChangeConfirm(true);
    const state = loadAppState();
    setChangeWarning(
      state?.activeSessionId
        ? "An active session is in progress. Confirming will end it and build a refreshed plan."
        : null
    );
  };

  const commitAndRegenerateProgram = async (next: QuestionnaireData) => {
    setIsApplyingChange(true);
    const state = loadAppState();
    const nextProgramVersion =
      typeof state?.programVersion === "number" ? state.programVersion + 1 : 1;
    const questionnaireSignature = buildQuestionnaireSignature(next);

    persistQuestionnaire(next);
    setCommittedData(next);
    setData(next);
    setRequiresChangeConfirmation(true);
    setPendingData(null);
    setShowChangeConfirm(false);

    if (state?.activeSessionId) {
      await clearDraft(state.activeSessionId).catch(() => undefined);
    }

    try {
      const nowIso = new Date().toISOString();
      const nextProgramId = uuid();
      const currentProgramId = state?.activeProgramId ?? state?.programId ?? null;
      const currentProgram =
        currentProgramId && state?.questionnaireSignature === questionnaireSignature
          ? await getProgram(currentProgramId).catch(() => null)
          : null;
      const signals = await buildSignalsFromLocalState({
        programId: currentProgramId,
        questionnaire: next,
        nowIso,
      });
      const result = generateProgram({
        mode: "weekly",
        signals,
        currentProgram: currentProgram ?? undefined,
        initialVariationSeed: currentProgram ? undefined : nextProgramId,
        nextProgramId,
      });
      if (!("program" in result)) {
        throw new Error(result.message);
      }
      const nextProgram = {
        ...result.program,
        questionnaireSignature,
      };
      const nextProgress: ProgramProgress = {
        programId: nextProgram.id,
        lastCompletedDayIndex: null,
        nextDayIndex: 0,
        completedDayIndices: [],
        phaseIndex: nextProgram.phaseIndex ?? 1,
        phaseStartedAt: nowIso,
        cyclesCompletedInPhase: 0,
        workoutsCompletedInPhase: 0,
        daysPerWeek: nextProgram.daysPerWeek,
        weekIndex: 1,
        countedWeekKeys: [],
        updatedAt: nowIso,
      };
      await saveProgram(nextProgram);
      await saveProgramProgress(nextProgress);
      saveAppState({
        programId: nextProgram.id,
        activeProgramId: nextProgram.id,
        activeProgramBaselineAt: Date.now(),
        activeGenerationMode: currentProgram ? "live_regeneration" : "live_initial",
        activeInitialVariationSeed: currentProgram ? undefined : nextProgramId,
        selectedDay: 0,
        activeSessionId: undefined,
        programVersion: nextProgramVersion,
        activePhaseIndex: nextProgram.phaseIndex ?? 1,
        activeCycleIndex: nextProgram.cycleIndex ?? 1,
        questionnaireSignature,
        lastRoute: "/results",
      });
    } catch {
      // If local DB writes fail, still invalidate active routing state so Results regenerates.
      saveAppState({
        programId: undefined,
        activeProgramId: undefined,
        activeProgramBaselineAt: undefined,
        activeGenerationMode: undefined,
        activeInitialVariationSeed: undefined,
        selectedDay: 0,
        activeSessionId: undefined,
        programVersion: nextProgramVersion,
        questionnaireSignature,
        lastRoute: "/results",
      });
    } finally {
      setIsApplyingChange(false);
      router.push("/results");
    }
  };

  const cancelPendingChange = () => {
    setData(committedData);
    setPendingData(null);
    setShowChangeConfirm(false);
    setChangeWarning(null);
  };

  useEffect(() => {
    const state = loadAppState();

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setRequiresChangeConfirmation(Boolean(state?.activeProgramId || state?.programId));
        return;
      }

      const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
      const normalized = normalizeQuestionnaireData(parsed);
      setData(normalized);
      setCommittedData(normalized);
      setRequiresChangeConfirmation(true);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setData(emptyData);
      setCommittedData(emptyData);
      setRequiresChangeConfirmation(Boolean(state?.activeProgramId || state?.programId));
    }
  }, []);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      const snapshot = await loadTrainingSnapshot();
      const remote = snapshot?.questionnaire as Partial<QuestionnaireData> | undefined;
      if (!active || !remote) {
        setHydratedServerSnapshot(true);
        return;
      }
      const merged = normalizeQuestionnaireData(remote);
      setData(merged);
      setCommittedData(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      lastQuestionnaireSyncSignatureRef.current = buildQuestionnaireSignature(merged);
      setRequiresChangeConfirmation(true);
      setHydratedServerSnapshot(true);
    };
    hydrate().catch(() => setHydratedServerSnapshot(true));
    return () => {
      active = false;
    };
  }, []);

  const updateData = (updates: Partial<QuestionnaireData>) => {
    const next = { ...data, ...updates };
    setData(next);

    if (!requiresChangeConfirmation) {
      setCommittedData(next);
      persistQuestionnaire(next);
      return;
    }
    setPendingData(next);
    setShowChangeConfirm(false);
    setChangeWarning(null);
  };

  const toggleArrayValue = (key: "painAreas" | "equipment", value: string) => {
    const list = data[key].includes(value)
      ? data[key].filter((item) => item !== value)
      : [...data[key], value];

    if (key === "equipment") {
      if (value === "none") {
        updateData({ equipment: ["none"] });
        return;
      }
      if (list.includes("none")) {
        updateData({ equipment: list.filter((item) => item !== "none") });
        return;
      }
    }

    updateData({ [key]: list } as Partial<QuestionnaireData>);
  };

  return (
    <form
      data-testid="questionnaire-form"
      className="ui-card space-y-8 rounded-lg bg-slate-950/60 p-5 shadow-lg sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (requiresChangeConfirmation && hasProgramAffectingChange(data, committedData)) {
          openChangeConfirm(data);
          return;
        }

        void commitAndRegenerateProgram(data);
      }}
    >
      <div>
        <p className="text-sm font-semibold text-white">
          Days per week
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[3, 4, 5].map((days) => (
            <button
              type="button"
              key={days}
              data-testid={`days-${days}`}
              onClick={() =>
                updateData({ daysPerWeek: days as QuestionnaireData["daysPerWeek"] })
              }
              className={`min-h-12 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                data.daysPerWeek === days
                  ? "border-sky-200/60 bg-slate-900 text-white shadow-[0_12px_30px_rgba(14,165,233,0.14)] ring-1 ring-sky-300/30"
                  : "border-slate-500/25 bg-slate-950/45 text-slate-300 hover:border-sky-200/30"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div>
            <label className="text-sm font-semibold text-white">
              Primary goal
            </label>
            <select
          className="mt-2 w-full rounded-lg border border-slate-500/25 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none focus-visible:border-sky-200/50 focus-visible:ring-2 focus-visible:ring-sky-300/30"
          value={data.goals}
          onChange={(event) => updateData({ goals: event.target.value })}
        >
          {goalOptions.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">Pain areas</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {painOptions.map((area) => (
            <label
              key={area}
              className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-3 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <input
                type="checkbox"
                checked={data.painAreas.includes(area)}
                onChange={() => toggleArrayValue("painAreas", area)}
                className="h-4 w-4 accent-slate-900"
              />
              {area}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          Training experience
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {experienceOptions.map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => updateData({ experience: level })}
              className={`min-h-12 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                data.experience === level
                  ? "border-sky-200/60 bg-slate-900 text-white shadow-[0_12px_30px_rgba(14,165,233,0.14)] ring-1 ring-sky-300/30"
                  : "border-slate-500/25 bg-slate-950/45 text-slate-300 hover:border-sky-200/30"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">Equipment</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {equipmentOptions.map((item) => (
            <label
              key={item.value}
              className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-3 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <input
                type="checkbox"
                data-testid={`equipment-${item.value}`}
                checked={data.equipment.includes(item.value)}
                onChange={() => toggleArrayValue("equipment", item.value)}
                className="h-4 w-4 accent-slate-900"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        data-testid="generate-routine"
        disabled={isApplyingChange}
        className="h-12 w-full rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(37,99,235,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Build my Praxis plan
      </button>

      {showChangeConfirm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Movement profile change confirmation"
          data-testid="questionnaire-change-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-slate-950/95 p-6 text-white shadow-xl">
            <p className="text-lg font-semibold">
              Your profile changed. Your plan will update.
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Cancel keeps your current plan. Confirm builds a refreshed Praxis plan now.
            </p>
            {changeWarning ? (
              <p className="mt-3 rounded-2xl border border-amber-200/40 bg-amber-50/10 px-3 py-2 text-xs text-amber-100">
                {changeWarning}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="questionnaire-change-cancel"
                onClick={cancelPendingChange}
                disabled={isApplyingChange}
                className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="questionnaire-change-confirm"
                onClick={() => {
                  const next = pendingData ?? data;
                  void commitAndRegenerateProgram(next);
                }}
                disabled={isApplyingChange}
                className="rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {isApplyingChange ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
