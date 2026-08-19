import { HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_CONTRACT_REFERENCE } from "./contracts";

export const HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_SOURCE_FINGERPRINT =
  "988c8e62bc0975662d6b505d2080d00bacc16494f3f87fe4ebf7f14b05f23e6c" as const;

export const HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_DOM_BEHAVIOR_FINGERPRINT =
  "35107e225e8e2b5f572677d55dbaa4c00957d317990d6cf4b96467c0cb7d41fa" as const;

export const HISTORICAL_SESSION_PRACTICE_OPTIONS_V1 = Object.freeze({
  contractReference: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_CONTRACT_REFERENCE,
  sourcePath: "packages/engine/src/sessionPracticeOptions.ts",
  sourceFingerprint: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_SOURCE_FINGERPRINT,
  currentSessionClientPath: "apps/consumer/src/app/session/SessionClient.tsx",
  currentSessionClientFingerprint: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_DOM_BEHAVIOR_FINGERPRINT,
  modes: Object.freeze(["full", "lighter", "recovery"] as const),
  copy: Object.freeze({
    full: Object.freeze({ label: "Full", description: "The whole session as planned." }),
    lighter: Object.freeze({ label: "Lighter", description: "Same movements, less work." }),
    recovery: Object.freeze({ label: "Recovery", description: "Mobility and easy movement only." }),
  }),
  aliases: Object.freeze({
    steady: "full",
    reduced: "lighter",
    simplified: "lighter",
  } as const),
  recommendationMapping: Object.freeze({
    normal: "full",
    repeat: "full",
    reduce: "lighter",
    simplify: "lighter",
    recover: "recovery",
  } as const),
  full: "SHALLOW_ROUTINE_ARRAY_COPY",
  lighter: "WARMUP_ACTIVATION_PLUS_MAIN_MINUS_ONE_SET_NOT_BELOW_ONE_PLUS_COOLDOWN",
  recovery: "WARMUP_ACTIVATION_PLUS_KEYWORD_FILTERED_NON_MAIN_SUPPORT_PLUS_COOLDOWN",
  recoveryKeywordSurface: Object.freeze([
    "item.notes",
    "item.rationale.whyThisExercise",
    "exercise.movementIntensity",
    "exercise.movementPattern",
    "exercise.muscleGroups",
    "exercise.tags",
    "exercise.focusTags",
    "exercise.carryType",
  ]),
  recoveryKeywords: Object.freeze([
    "core", "mobility", "breath", "spine", "t-spine", "hip", "hips", "scap", "posture",
  ]),
  selectedModePersistence: "SessionRecord.selectedPracticeMode",
  draftModePersistence: "ABSENT_FROM_HISTORICAL_SESSION_DRAFT",
  resumeModeRestoration: "NOT_RESTORED",
  completionCredit: "ANY_SELECTED_MODE_ADVANCES_CURRENT_PROGRAM_PROGRESS",
  limitationsFrozenNotCorrectedInPlace: true,
} as const);

export type HistoricalSessionPracticeModeV1 = "full" | "lighter" | "recovery";

export function normalizeHistoricalSessionPracticeMode(
  value: string | null | undefined,
): HistoricalSessionPracticeModeV1 {
  if (value === "steady" || value === "full") return "full";
  if (value === "reduced" || value === "simplified" || value === "lighter") return "lighter";
  if (value === "recovery") return "recovery";
  return "full";
}

export function historicalPracticeModeForRecommendation(
  value: "normal" | "repeat" | "reduce" | "simplify" | "recover" | null | undefined,
): HistoricalSessionPracticeModeV1 {
  return value ? HISTORICAL_SESSION_PRACTICE_OPTIONS_V1.recommendationMapping[value] : "full";
}

export interface HistoricalSessionPracticeItemV1 {
  readonly id: string;
  readonly section?: "warmup" | "activation" | "main" | "accessory" | "cooldown";
  readonly sets?: string | number | null;
  readonly recoverySearchText?: string;
}

function parsedSetCount(value: HistoricalSessionPracticeItemV1["sets"]): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function replayHistoricalSessionPracticeSelection<T extends HistoricalSessionPracticeItemV1>(
  items: readonly T[],
  modeInput: string,
): readonly T[] {
  const mode = normalizeHistoricalSessionPracticeMode(modeInput);
  if (mode === "full") return [...items];
  const section = (item: T) => item.section ?? "main";
  const warmupActivation = items.filter((item) => ["warmup", "activation"].includes(section(item)));
  const cooldown = items.filter((item) => section(item) === "cooldown");
  if (mode === "lighter") {
    const main = items.filter((item) => section(item) === "main").map((item) => {
      const count = parsedSetCount(item.sets);
      return count <= 1 ? item : { ...item, sets: String(count - 1) };
    });
    return [...warmupActivation, ...main, ...cooldown];
  }
  const keyword = /\b(core|mobility|breath|spine|t-spine|hip|hips|scap|posture)\b/;
  const support = items.filter((item) => !["warmup", "activation", "main", "cooldown"].includes(section(item)) &&
    keyword.test((item.recoverySearchText ?? "").toLowerCase()));
  return [...warmupActivation, ...support, ...cooldown];
}
