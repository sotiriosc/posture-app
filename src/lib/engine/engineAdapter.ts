import {
  getProgramProgress,
  listAllExerciseLogs,
  listSessions,
} from "@/lib/logStore";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { EngineHistory, EngineSignals } from "@/lib/engine/engineTypes";

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

export const buildSignalsFromLocalState = async (
  params?: { programId?: string | null }
): Promise<EngineSignals> => {
  const history = await loadEngineHistory(params?.programId);
  let questionnaire = defaultQuestionnaire;

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("posture_questionnaire");
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<QuestionnaireData>;
      questionnaire = {
        ...defaultQuestionnaire,
        ...parsed,
      };
    }
  }

  return {
    questionnaire,
    history,
    nowIso: new Date().toISOString(),
  };
};
