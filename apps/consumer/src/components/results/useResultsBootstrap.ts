"use client";

import { useEffect, useState } from "react";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import { loadPrefs } from "@/lib/logStore";
import { loadTrainingSnapshot } from "@/lib/trainingSyncClient";
import { useUserPlan } from "@/hooks/useUserPlan";

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  if (value === 4 || value === "4") return 4;
  if (value === 5 || value === "5") return 5;
  return 3;
};

type UseResultsBootstrapParams = {
  storageKey: string;
};

export function useResultsBootstrap({ storageKey }: UseResultsBootstrapParams) {
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { authEnabled, plan } = useUserPlan();
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [nowAnchor, setNowAnchor] = useState(() => Date.now());
  const [remoteAssessment, setRemoteAssessment] = useState<AssessmentReport | null>(
    null
  );

  useEffect(() => {
    const loadBootstrap = async () => {
      const snapshot = await loadTrainingSnapshot();
      const remoteAssessmentSnapshot =
        snapshot?.assessment as AssessmentReport | undefined;
      if (remoteAssessmentSnapshot) {
        setRemoteAssessment(remoteAssessmentSnapshot);
      }

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
        setData({
          goals: parsed.goals ?? "Improve posture",
          painAreas: parsed.painAreas ?? [],
          experience: parsed.experience ?? "Beginner",
          equipment: normalizeEquipmentSelectionValues(
            parsed.equipment ?? ["none"]
          ),
          daysPerWeek: normalizeDaysPerWeek(parsed.daysPerWeek),
        });
      } else {
        const remote = snapshot?.questionnaire as
          | Partial<QuestionnaireData>
          | undefined;
        if (remote) {
          const next = {
            goals: remote.goals ?? "Improve posture",
            painAreas: remote.painAreas ?? [],
            experience: remote.experience ?? "Beginner",
            equipment: normalizeEquipmentSelectionValues(
              remote.equipment ?? ["none"]
            ),
            daysPerWeek: normalizeDaysPerWeek(remote.daysPerWeek),
          };
          setData(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        }
      }
      setIsReady(true);
    };

    const loadPrefsData = async () => {
      const prefs = await loadPrefs();
      if (prefs.substitutionByExercise) {
        setSubstitutionByExercise(prefs.substitutionByExercise);
      }
    };

    loadBootstrap().finally(() => loadPrefsData());
  }, [storageKey]);

  useEffect(() => {
    const tick = () => setNowAnchor(Date.now());
    const timer = window.setInterval(tick, 60 * 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return {
    data,
    isReady,
    authEnabled,
    plan,
    substitutionByExercise,
    nowAnchor,
    remoteAssessment,
  };
}
