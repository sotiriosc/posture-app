import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { auditWeeklyProgramSelection } from "@/lib/__debug__/programSelectionAudit";
import { derivePoseFocus } from "@/lib/engine/poseFocus";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
};

const buildPose = (overrides: Partial<PoseAnalysis["metrics"]>): PoseAnalysis => ({
  metrics: {
    torsoHeight: null,
    avgKeypointScore: 0.85,
    shoulderHeightDelta: 0.02,
    hipHeightDelta: 0.02,
    kneeAlignmentDelta: 0.02,
    headForwardOffset: 0.03,
    torsoLeanAngle: 2,
    hipToShoulderAlignment: 0.02,
    scapularSymmetry: 0.02,
    hipShift: 0.02,
    ...overrides,
  },
  observations: [],
  priorities: [],
  confidenceScore: 0.85,
});

const simulatedPose = buildPose({
  headForwardOffset: 0.16,
  scapularSymmetry: 0.13,
  torsoLeanAngle: 11,
  hipShift: 0.09,
});

const baseAudits = auditWeeklyProgramSelection(questionnaire);
const poseAudits = auditWeeklyProgramSelection(questionnaire, {
  poseAnalysis: simulatedPose,
});

const toKey = (dayTitle: string, slotKind: string) => `${dayTitle}::${slotKind}`;
const byKey = <T extends { dayTitle: string; slotKind: string }>(rows: T[]) => {
  const map = new Map<string, T>();
  rows.forEach((row) => map.set(toKey(row.dayTitle, row.slotKind), row));
  return map;
};

const baseMap = byKey(baseAudits);
const poseMap = byKey(poseAudits);
const poseFocus = derivePoseFocus(simulatedPose);

console.log("[poseFocusSelectionSmoke] derived focus");
console.log(`- tags: ${poseFocus.focusTags.join(", ") || "--"}`);
Object.entries(poseFocus.reasons).forEach(([tag, reason]) => {
  console.log(`  * ${tag}: ${reason}`);
});

let changedCount = 0;
let poseReasonCount = 0;
let rankOrScoreShiftCount = 0;

console.log("[poseFocusSelectionSmoke] slot comparison (base -> pose)");
Array.from(poseMap.entries()).forEach(([key, poseEntry]) => {
  const baseEntry = baseMap.get(key);
  if (!baseEntry) return;
  const changed = baseEntry.chosen.exerciseId !== poseEntry.chosen.exerciseId;
  if (changed) changedCount += 1;
  if (
    poseEntry.chosen.reasons.some((reason) =>
      reason.toLowerCase().includes("pose-focus tag match")
    )
  ) {
    poseReasonCount += 1;
  }
  console.log(
    `- ${poseEntry.dayTitle} | ${poseEntry.slotKind}: ${baseEntry.chosen.name} -> ${poseEntry.chosen.name}${changed ? " [changed]" : ""}`
  );
  const poseReasons = poseEntry.chosen.reasons.filter((reason) =>
    reason.toLowerCase().includes("pose-focus tag match")
  );
  if (poseReasons.length) {
    console.log(`  poseBonus: ${poseReasons.join(" ; ")}`);
  }

  poseEntry.top.forEach((poseCandidate, poseRank) => {
    const hasPoseReason = poseCandidate.reasons.some((reason) =>
      reason.toLowerCase().includes("pose-focus tag match")
    );
    if (!hasPoseReason) return;
    const baseRank = baseEntry.top.findIndex(
      (baseCandidate) => baseCandidate.exerciseId === poseCandidate.exerciseId
    );
    const baseScore =
      baseRank >= 0 ? baseEntry.top[baseRank]?.score ?? poseCandidate.score : 0;
    const scoreDelta = Number((poseCandidate.score - baseScore).toFixed(2));
    const improvedRank = baseRank >= 0 && poseRank < baseRank;
    const improvedScore = scoreDelta > 0;
    if (!improvedRank && !improvedScore) return;
    rankOrScoreShiftCount += 1;
    const rankText =
      baseRank >= 0 ? `rank ${baseRank + 1} -> ${poseRank + 1}` : "new in top list";
    console.log(
      `  shift: ${poseCandidate.name} ${rankText} (scoreDelta=${scoreDelta})`
    );
  });
});

console.log("[poseFocusSelectionSmoke] summary");
console.log(`- changedMainSlots=${changedCount}`);
console.log(`- slotsWithPoseBonusReason=${poseReasonCount}`);
console.log(`- rankOrScoreShiftsTowardPoseFocus=${rankOrScoreShiftCount}`);
