/**
 * Demo requirement → presentation status (Owner Decision: videos deferred).
 */

import type { Exercise } from "@/lib/exercises";
import type {
  ExerciseCoachingContent,
  ExerciseDemoRequirement,
  ExerciseDemoStatus,
} from "@/lib/coaching/exerciseCoachingContract";

export const resolveExerciseDemoStatus = (params: {
  exercise: Pick<Exercise, "videoUrl" | "demoStatus">;
  demoRequirement: ExerciseDemoRequirement;
}): ExerciseDemoStatus => {
  const url = params.exercise.videoUrl?.trim();
  if (url) return "available";
  if (params.demoRequirement === "textSufficient") return "notRequired";
  return "planned";
};

export const demoStatusLabel = (status: ExerciseDemoStatus): string | undefined => {
  if (status === "planned") return "Demonstration planned";
  if (status === "notRequired") return undefined;
  return undefined;
};

export type DemoQueuePriority = "P0" | "P1" | "P2" | "P3";

export const demoQueuePriorityFor = (
  content: Pick<ExerciseCoachingContent, "demoRequirement" | "contentComplexity">
): DemoQueuePriority => {
  if (content.demoRequirement === "required") {
    return content.contentComplexity === "complex" ? "P0" : "P1";
  }
  if (content.demoRequirement === "recommended") return "P2";
  return "P3";
};

export const inferDemoRequirement = (params: {
  contentComplexity: ExerciseCoachingContent["contentComplexity"];
  hasAnchor: boolean;
  unusualSetup: boolean;
}): ExerciseDemoRequirement => {
  if (params.contentComplexity === "complex" || params.unusualSetup) {
    return "required";
  }
  if (params.hasAnchor || params.contentComplexity === "moderate") {
    return "recommended";
  }
  return "textSufficient";
};
