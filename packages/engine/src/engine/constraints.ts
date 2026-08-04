import { PAIN_RULES } from "@/lib/program";
import type { EngineSignals } from "@/lib/engine/engineTypes";
import {
  canonicalizePainArea,
  canonicalizePainAreas,
  normalizePainAreaToken,
} from "@/lib/painModel";

export type ConstraintReport = {
  blockedTags: string[];
  preferredTags: string[];
  blockedPatterns: string[];
  notes: string[];
  severity: "low" | "med" | "high";
};

const unique = (values: string[]) => Array.from(new Set(values));

const resolveRules = (area: string) => {
  const spaced = canonicalizePainArea(area);
  const underscored = normalizePainAreaToken(spaced);
  return PAIN_RULES[spaced] ?? PAIN_RULES[underscored] ?? PAIN_RULES[area] ?? null;
};

export const buildConstraintReport = (signals: EngineSignals): ConstraintReport => {
  const canonicalized = canonicalizePainAreas(signals.questionnaire.painAreas);
  const painAreas = canonicalized.areas.map((area) => canonicalizePainArea(area));
  const preferredTags: string[] = [];
  const blockedTags: string[] = [];
  const blockedPatterns: string[] = [];
  const notes: string[] = [];

  if (!painAreas.length) {
    notes.push("No pain areas selected in questionnaire.");
  }

  for (const warning of canonicalized.warnings) {
    notes.push(warning);
  }

  painAreas.forEach((area) => {
    const rules = resolveRules(area);
    if (!rules) {
      notes.push(`No explicit PAIN_RULES mapping found for "${area}".`);
      return;
    }
    preferredTags.push(...rules.preferredTags);
    blockedTags.push(...rules.deprioritizeTags);
    blockedPatterns.push(...rules.deprioritizePatterns);
    notes.push(`Applied pain constraints for "${area}".`);
  });

  const recentPainFlag =
    (signals.history?.exerciseLogs ?? []).some((log) => log.felt === "pain") ||
    (signals.history?.sessions ?? []).some(
      (session) => session.sessionFeedback === "pain"
    );
  if (recentPainFlag) {
    notes.push("Recent pain feedback found in history; progression should stay conservative.");
  }

  let severityScore = 0;
  if (painAreas.length >= 2) severityScore += 2;
  else if (painAreas.length === 1) severityScore += 1;
  if (blockedPatterns.length > 0) severityScore += 1;
  if (blockedTags.length > 0) severityScore += 1;
  if (recentPainFlag) severityScore += 2;

  const severity: ConstraintReport["severity"] =
    severityScore >= 4 ? "high" : severityScore >= 2 ? "med" : "low";

  return {
    blockedTags: unique(blockedTags),
    preferredTags: unique(preferredTags),
    blockedPatterns: unique(blockedPatterns),
    notes,
    severity,
  };
};
