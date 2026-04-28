"use client";

import { useEffect, useState } from "react";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { SubscriptionPlan } from "@/lib/authTypes";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import { loadPrefs } from "@/lib/logStore";
import { resolvePlanStatus, type PlanStatus } from "@/lib/planStatus";
import { loadTrainingSnapshot } from "@/lib/trainingSyncClient";

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
  const [authEnabled, setAuthEnabled] = useState(false);
  const [plan, setPlan] = useState<PlanStatus>("unknown");
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
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          enabled?: boolean;
          authenticated?: boolean;
          user?: { plan?: SubscriptionPlan } | null;
        };
        const enabled = Boolean(payload.enabled);
        setAuthEnabled(enabled);
        if (!enabled || !payload.authenticated) {
          setPlan("free");
          return;
        }

        let billingPlan: SubscriptionPlan | undefined;
        try {
          const billingResponse = await fetch("/api/billing/status", {
            cache: "no-store",
            credentials: "include",
          });
          const billingPayload = (await billingResponse.json()) as {
            user?: { plan?: SubscriptionPlan } | null;
          };
          billingPlan = billingPayload.user?.plan;
        } catch {
          billingPlan = undefined;
        }

        setPlan(resolvePlanStatus(billingPlan, payload.user?.plan));
      } catch {
        setAuthEnabled(false);
        setPlan("free");
      }
    };
    loadSession();
  }, []);

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
