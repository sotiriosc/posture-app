import {
  getProgramProgress,
  listAllExerciseLogs,
  loadPrefs,
  listSessions,
} from "@/lib/logStore";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { EngineHistory, EngineSignals } from "@/lib/engine/engineTypes";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import type { LogPrefs } from "@/lib/types";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";

export const loadEngineHistory = async (
  programId?: string | null
): Promise<EngineHistory> => {
  const [sessions, exerciseLogs, programProgress] = await Promise.all([
    listSessions(500),
    listAllExerciseLogs(),
    programId ? getProgramProgress(programId) : Promise.resolve(null),
  ]);

  return {
    sessions,
    exerciseLogs,
    programProgress,
  };
};

const defaultQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
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
  ...defaultQuestionnaire,
  ...(input ?? {}),
  equipment: normalizeEquipmentSelectionValues(input?.equipment ?? ["none"]),
  daysPerWeek: normalizeDaysPerWeek(input?.daysPerWeek),
});

export const buildEngineSignals = (params: {
  questionnaire?: Partial<QuestionnaireData> | null;
  history?: EngineHistory;
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
  prefs?: LogPrefs | null;
  nowIso?: string;
}): EngineSignals => ({
  questionnaire: normalizeQuestionnaireData(params.questionnaire),
  history: {
    sessions: params.history?.sessions ?? [],
    exerciseLogs: params.history?.exerciseLogs ?? [],
    programProgress: params.history?.programProgress ?? null,
  },
  poseAnalysis: params.poseAnalysis ?? null,
  assessmentReport: params.assessmentReport ?? null,
  prefs: params.prefs ?? null,
  nowIso: params.nowIso ?? new Date().toISOString(),
});

export const buildSignalsFromLocalState = async (
  params?: {
    programId?: string | null;
    questionnaire?: Partial<QuestionnaireData> | null;
    history?: EngineHistory;
    poseAnalysis?: PoseAnalysis | null;
    assessmentReport?: AssessmentReport | null;
    prefs?: LogPrefs | null;
    nowIso?: string;
  }
): Promise<EngineSignals> => {
  const history =
    params?.history ?? (await loadEngineHistory(params?.programId));
  const prefs =
    params?.prefs ??
    (await loadPrefs().catch(() => null));
  let questionnaire = normalizeQuestionnaireData(params?.questionnaire);

  if (!params?.questionnaire && typeof window !== "undefined") {
    const raw = window.localStorage.getItem("posture_questionnaire");
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<QuestionnaireData>;
      questionnaire = normalizeQuestionnaireData(parsed);
    }
  }

  return buildEngineSignals({
    questionnaire,
    history,
    poseAnalysis: params?.poseAnalysis,
    assessmentReport: params?.assessmentReport,
    prefs,
    nowIso: params?.nowIso,
  });
};
