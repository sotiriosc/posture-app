import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import { generateWeeklyProgram } from "@/lib/program";

export type SlotAudit = {
  dayTitle: string;
  slotKind: string;
  capabilityMode: "noneOnly" | "bandOnly" | "hasLoad";
  chosen: { exerciseId: string; name: string; score: number; reasons: string[] };
  top: Array<{ exerciseId: string; name: string; score: number; reasons: string[] }>;
};

export function auditWeeklyProgramSelection(
  questionnaire: QuestionnaireData,
  options?: {
    poseAnalysis?: PoseAnalysis | null;
    assessmentReport?: AssessmentReport | null;
  }
): SlotAudit[] {
  const audits: SlotAudit[] = [];
  generateWeeklyProgram(questionnaire, `audit-${Date.now()}`, {
    poseAnalysis: options?.poseAnalysis,
    assessmentReport: options?.assessmentReport,
    selectionAuditHook: (entry) => {
      audits.push({
        dayTitle: entry.dayTitle,
        slotKind: entry.slotKind,
        capabilityMode: entry.capabilityMode,
        chosen: entry.chosen,
        top: entry.top,
      });
    },
  });
  return audits;
}
