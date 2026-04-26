"use client";

import { useEffect, useState } from "react";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  analyzeImagePose,
  computeMetrics,
  generateObservations,
  type PoseAnalysis,
  type PoseMetrics,
} from "@/lib/poseAnalyzer";
import {
  buildAssessmentReport,
  type AssessmentReport,
} from "@/lib/assessmentEngine";
import { pushTrainingPatch } from "@/lib/trainingSyncClient";
import { logTrainingSync } from "@/lib/trainingSyncDebug";

export type PoseAssessmentState = {
  loading: boolean;
  error: string | null;
  analysis: PoseAnalysis | null;
  report: AssessmentReport | null;
};

type UsePoseAssessmentParams = {
  photos: Record<string, File | null>;
  data: QuestionnaireData | null;
  remoteAssessment: AssessmentReport | null;
};

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    image.src = url;
  });

export function usePoseAssessment({
  photos,
  data,
  remoteAssessment,
}: UsePoseAssessmentParams) {
  const [poseState, setPoseState] = useState<PoseAssessmentState>({
    loading: false,
    error: null,
    analysis: null,
    report: null,
  });

  useEffect(() => {
    const runPoseAnalysis = async () => {
      if (!data) return;
      const entries = Object.entries(photos).filter(
        ([, value]) => value !== null
      ) as [string, File][];

      if (!entries.length) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        const reportForUi = remoteAssessment ?? fallbackReport;
        setPoseState((current) => {
          if (
            !current.loading &&
            current.error === null &&
            current.analysis === null &&
            current.report
          ) {
            return current;
          }
          return {
            loading: false,
            error: null,
            analysis: null,
            report: reportForUi,
          };
        });
        if (remoteAssessment) {
          logTrainingSync(
            "training-sync",
            "skipped fallback assessment write because remote assessment is loaded"
          );
        } else {
          void pushTrainingPatch({
            assessment: fallbackReport as unknown as Record<string, unknown>,
          });
        }
        return;
      }

      setPoseState({ loading: true, error: null, analysis: null, report: null });

      try {
        const metricsByView: Record<string, PoseMetrics> = {};
        const observations: string[] = [];
        const priorities: string[] = [];
        const confidenceScores: number[] = [];

        for (const [view, file] of entries) {
          const image = await loadImageFromFile(file);
          const keypoints = await analyzeImagePose(image);
          if (!keypoints) continue;
          const metrics = computeMetrics(keypoints);
          metricsByView[view] = metrics;
          const analysis = generateObservations(metrics);
          observations.push(...analysis.observations.map((item) => `${view}: ${item}`));
          priorities.push(...analysis.priorities);
          confidenceScores.push(analysis.confidenceScore);
        }

        const combined: PoseAnalysis = {
          metrics: {
            torsoHeight: null,
            avgKeypointScore: null,
            shoulderHeightDelta: metricsByView.front?.shoulderHeightDelta ?? null,
            hipHeightDelta: metricsByView.front?.hipHeightDelta ?? null,
            kneeAlignmentDelta: metricsByView.front?.kneeAlignmentDelta ?? null,
            headForwardOffset: metricsByView.side?.headForwardOffset ?? null,
            torsoLeanAngle: metricsByView.side?.torsoLeanAngle ?? null,
            hipToShoulderAlignment:
              metricsByView.side?.hipToShoulderAlignment ?? null,
            scapularSymmetry: metricsByView.back?.scapularSymmetry ?? null,
            hipShift: metricsByView.back?.hipShift ?? null,
          },
          observations: observations.length
            ? observations
            : ["We couldn’t reliably detect posture landmarks in these photos."],
          priorities: Array.from(new Set(priorities)).slice(0, 4),
          confidenceScore: confidenceScores.length
            ? confidenceScores.reduce((sum, value) => sum + value, 0) /
              confidenceScores.length
            : 0.4,
        };

        const report = buildAssessmentReport({
          questionnaire: data,
          poseAnalysis: combined,
        });
        setPoseState({ loading: false, error: null, analysis: combined, report });
        void pushTrainingPatch({
          assessment: report as unknown as Record<string, unknown>,
        });
      } catch (error) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        setPoseState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Pose detection failed. Try clearer photos.",
          analysis: null,
          report: fallbackReport,
        });
        void pushTrainingPatch({
          assessment: fallbackReport as unknown as Record<string, unknown>,
        });
      }
    };

    runPoseAnalysis();
  }, [photos, data, remoteAssessment]);

  return poseState;
}
