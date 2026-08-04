/**
 * Canonical pain taxonomy for Praxis program generation and session adaptation.
 *
 * Questionnaire pain = persistent planning constraint (display labels may be stored).
 * Session pain = runtime event (exercise + area + severity); shares CanonicalPainArea
 * tokens but must not be collapsed into questionnaire semantics.
 *
 * Structured painContraindications are the authoritative hard-exclusion source.
 * Free-text contraindications are a temporary legacy fallback only when usable
 * structured metadata is unavailable.
 */

export type CanonicalPainArea =
  | "neck"
  | "upper_back"
  | "lower_back"
  | "shoulders"
  | "hips"
  | "knees"
  | "wrists"
  | "elbows"
  | "ankles";

/** Recognized acuity/chronicity modifiers (do not change body-area hard match). */
export type PainTokenModifier = "acute" | "chronic";

export type ParsedPainToken = {
  raw: string;
  area: CanonicalPainArea | null;
  modifier: PainTokenModifier | null;
  /** True when a prefix looked like a modifier but was not recognized. */
  unknownModifier: boolean;
  /** True when the body area could not be mapped to a canonical area. */
  unknownArea: boolean;
};

export type CanonicalizePainAreasResult = {
  areas: CanonicalPainArea[];
  unknown: string[];
  warnings: string[];
};

export type PainConflictResult = {
  excluded: boolean;
  matchedAreas: CanonicalPainArea[];
  matchedTokens: string[];
  unknownTokens: string[];
  source: "structured" | "legacy_text" | "none";
  reasonCodes: string[];
};

export type HardPainExclusionResult = PainConflictResult & {
  via: "structured" | "legacy_text" | "none";
};

/** User-facing questionnaire labels (consumer + gyms). */
export const QUESTIONNAIRE_PAIN_DISPLAY_LABELS = [
  "Neck",
  "Upper back",
  "Lower back",
  "Shoulders",
  "Hips",
  "Knees",
] as const;

export type QuestionnairePainDisplayLabel =
  (typeof QUESTIONNAIRE_PAIN_DISPLAY_LABELS)[number];

export const QUESTIONNAIRE_PAIN_AREAS: ReadonlyArray<{
  display: QuestionnairePainDisplayLabel;
  canonical: CanonicalPainArea;
}> = [
  { display: "Neck", canonical: "neck" },
  { display: "Upper back", canonical: "upper_back" },
  { display: "Lower back", canonical: "lower_back" },
  { display: "Shoulders", canonical: "shoulders" },
  { display: "Hips", canonical: "hips" },
  { display: "Knees", canonical: "knees" },
];

export const CANONICAL_PAIN_AREAS: readonly CanonicalPainArea[] = [
  "neck",
  "upper_back",
  "lower_back",
  "shoulders",
  "hips",
  "knees",
  "wrists",
  "elbows",
  "ankles",
] as const;

const CANONICAL_SET = new Set<string>(CANONICAL_PAIN_AREAS);

const RECOGNIZED_MODIFIERS = new Set<PainTokenModifier>(["acute", "chronic"]);

/** Map normalized underscore tokens → canonical area. */
const AREA_ALIASES: Record<string, CanonicalPainArea> = {
  neck: "neck",
  upper_back: "upper_back",
  upperback: "upper_back",
  lower_back: "lower_back",
  low_back: "lower_back",
  lowerback: "lower_back",
  lowback: "lower_back",
  shoulders: "shoulders",
  shoulder: "shoulders",
  hips: "hips",
  hip: "hips",
  knees: "knees",
  knee: "knees",
  wrists: "wrists",
  wrist: "wrists",
  elbows: "elbows",
  elbow: "elbows",
  ankles: "ankles",
  ankle: "ankles",
};

/** Legacy spaced keys still used by some PAIN_RULES lookups. */
export const toLegacySpacedPainKey = (area: CanonicalPainArea): string => {
  if (area === "upper_back") return "upper back";
  if (area === "lower_back") return "lower back";
  return area;
};

export const fromLegacySpacedPainKey = (value: string): CanonicalPainArea | null => {
  const parsed = parsePainToken(value);
  return parsed.area;
};

export const normalizePainAreaToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export const parsePainToken = (raw: string): ParsedPainToken => {
  const normalized = normalizePainAreaToken(raw);
  if (!normalized) {
    return {
      raw,
      area: null,
      modifier: null,
      unknownModifier: false,
      unknownArea: true,
    };
  }

  // Direct canonical / alias hit
  if (AREA_ALIASES[normalized]) {
    return {
      raw,
      area: AREA_ALIASES[normalized],
      modifier: null,
      unknownModifier: false,
      unknownArea: false,
    };
  }

  // modifier_area (e.g. acute_knees, chronic_lower_back)
  const underscoreIdx = normalized.indexOf("_");
  if (underscoreIdx > 0) {
    const maybeMod = normalized.slice(0, underscoreIdx);
    const rest = normalized.slice(underscoreIdx + 1);
    if (RECOGNIZED_MODIFIERS.has(maybeMod as PainTokenModifier)) {
      const area = AREA_ALIASES[rest] ?? (CANONICAL_SET.has(rest) ? (rest as CanonicalPainArea) : null);
      return {
        raw,
        area,
        modifier: maybeMod as PainTokenModifier,
        unknownModifier: false,
        unknownArea: !area,
      };
    }
    // Unknown prefix that looks like a modifier (not an alias for the whole token)
    if (AREA_ALIASES[rest] || CANONICAL_SET.has(rest)) {
      return {
        raw,
        area: AREA_ALIASES[rest] ?? (rest as CanonicalPainArea),
        modifier: null,
        unknownModifier: true,
        unknownArea: false,
      };
    }
  }

  // Phrases like "hamstring_strain" / "hamstrings" are not body-area questionnaire tokens
  return {
    raw,
    area: null,
    modifier: null,
    unknownModifier: false,
    unknownArea: true,
  };
};

/**
 * Normalize questionnaire / stored pain area inputs into canonical areas.
 * Unknown values never throw; they are listed for audit warnings.
 */
export const canonicalizePainAreas = (
  inputs: readonly string[] | null | undefined
): CanonicalizePainAreasResult => {
  const areas: CanonicalPainArea[] = [];
  const seen = new Set<CanonicalPainArea>();
  const unknown: string[] = [];
  const warnings: string[] = [];

  for (const input of inputs ?? []) {
    if (typeof input !== "string" || !input.trim()) continue;
    const parsed = parsePainToken(input);
    if (parsed.unknownModifier) {
      warnings.push(`unknown_pain_modifier:${normalizePainAreaToken(input)}`);
    }
    if (parsed.area) {
      if (!seen.has(parsed.area)) {
        seen.add(parsed.area);
        areas.push(parsed.area);
      }
      continue;
    }
    unknown.push(input.trim());
    warnings.push(`unknown_pain_token:${normalizePainAreaToken(input)}`);
  }

  return { areas, unknown, warnings };
};

/** Single-value helper (legacy call sites). */
export const canonicalizePainArea = (value: string): string => {
  const parsed = parsePainToken(value);
  if (parsed.area) return toLegacySpacedPainKey(parsed.area);
  return normalizePainAreaToken(value).replace(/_/g, " ");
};

export const painReasonCode = (
  kind:
    | "hard_excluded"
    | "deprioritized"
    | "preferred"
    | "warmup_added"
    | "substituted"
    | "progression_held"
    | "legacy_text_contraindication_used"
    | "unknown_pain_token",
  detail: string
): string => {
  switch (kind) {
    case "hard_excluded":
      return `hard_excluded:pain_contraindication:${detail}`;
    case "deprioritized":
      return `deprioritized:pain_policy:${detail}`;
    case "preferred":
      return `preferred:pain_compatible_pattern:${detail}`;
    case "warmup_added":
      return `warmup_added:pain_protection:${detail}`;
    case "substituted":
      return `substituted:session_pain:${detail}`;
    case "progression_held":
      return `progression_held:recent_pain:${detail}`;
    case "legacy_text_contraindication_used":
      return `legacy_text_contraindication_used:${detail}`;
    case "unknown_pain_token":
      return `unknown_pain_token:${detail}`;
  }
};

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

/**
 * Structured token conflict: user area matches catalog painContraindications
 * when the parsed body area overlaps. Acuity modifiers do not change the match.
 */
export const painAreasConflict = (
  exercisePainTokens: readonly string[] | null | undefined,
  activeAreas: readonly CanonicalPainArea[]
): PainConflictResult => {
  const active = new Set(activeAreas);
  if (!active.size || !exercisePainTokens?.length) {
    return {
      excluded: false,
      matchedAreas: [],
      matchedTokens: [],
      unknownTokens: [],
      source: "none",
      reasonCodes: [],
    };
  }

  const matchedAreas: CanonicalPainArea[] = [];
  const matchedTokens: string[] = [];
  const unknownTokens: string[] = [];
  const reasonCodes: string[] = [];

  for (const token of exercisePainTokens) {
    const parsed = parsePainToken(token);
    if (parsed.unknownModifier) {
      reasonCodes.push(`unknown_pain_modifier:${normalizePainAreaToken(token)}`);
    }
    if (!parsed.area) {
      unknownTokens.push(token);
      continue;
    }
    if (active.has(parsed.area)) {
      matchedAreas.push(parsed.area);
      matchedTokens.push(token);
      reasonCodes.push(painReasonCode("hard_excluded", parsed.area));
    }
  }

  const uniqAreas = unique(matchedAreas);
  return {
    excluded: uniqAreas.length > 0,
    matchedAreas: uniqAreas,
    matchedTokens: unique(matchedTokens),
    unknownTokens: unique(unknownTokens),
    source: uniqAreas.length ? "structured" : "none",
    reasonCodes: unique(reasonCodes),
  };
};

/**
 * Whether structured painContraindications are usable for hard decisions.
 * Empty / missing / entirely unmappable → not usable (legacy text may apply).
 */
export const hasUsableStructuredPainMetadata = (
  exercisePainTokens: readonly string[] | null | undefined
): boolean => {
  if (!exercisePainTokens?.length) return false;
  return exercisePainTokens.some((token) => parsePainToken(token).area !== null);
};

/** Phrase patterns for legacy free-text contraindications (word-boundary style). */
const LEGACY_TEXT_PATTERNS: ReadonlyArray<{
  area: CanonicalPainArea;
  pattern: RegExp;
}> = [
  { area: "neck", pattern: /\bnecks?\b/i },
  { area: "upper_back", pattern: /\bupper[\s_-]*backs?\b/i },
  { area: "lower_back", pattern: /\b(lower|low)[\s_-]*backs?\b|\blow[\s_-]*back\b/i },
  { area: "shoulders", pattern: /\bshoulders?\b/i },
  { area: "hips", pattern: /\bhips?\b/i },
  { area: "knees", pattern: /\bknees?\b/i },
  { area: "wrists", pattern: /\bwrists?\b/i },
  { area: "elbows", pattern: /\belbows?\b/i },
  { area: "ankles", pattern: /\bankles?\b/i },
];

export const legacyTextContraindicationHits = (
  textEntries: readonly string[] | null | undefined,
  activeAreas: readonly CanonicalPainArea[]
): PainConflictResult => {
  const active = new Set(activeAreas);
  if (!active.size || !textEntries?.length) {
    return {
      excluded: false,
      matchedAreas: [],
      matchedTokens: [],
      unknownTokens: [],
      source: "none",
      reasonCodes: [],
    };
  }

  const blob = textEntries.join(" \n ");
  const matchedAreas: CanonicalPainArea[] = [];
  const matchedTokens: string[] = [];
  const reasonCodes: string[] = [];

  for (const { area, pattern } of LEGACY_TEXT_PATTERNS) {
    if (!active.has(area)) continue;
    if (!pattern.test(blob)) continue;
    matchedAreas.push(area);
    const hitLine =
      textEntries.find((line) => pattern.test(line)) ?? blob.slice(0, 80);
    matchedTokens.push(hitLine);
    reasonCodes.push(painReasonCode("legacy_text_contraindication_used", area));
    reasonCodes.push(painReasonCode("hard_excluded", area));
  }

  const uniqAreas = unique(matchedAreas);
  return {
    excluded: uniqAreas.length > 0,
    matchedAreas: uniqAreas,
    matchedTokens: unique(matchedTokens),
    unknownTokens: [],
    source: uniqAreas.length ? "legacy_text" : "none",
    reasonCodes: unique(reasonCodes),
  };
};

export type PainEligibleExercise = {
  painContraindications?: string[] | null;
  contraindications?: string[] | null;
};

export type HardPainExclusionOptions = {
  /**
   * When true, `acute_*` structured tokens hard-exclude (session / acute events).
   * Questionnaire planning defaults to false: acute tokens are soft caution only,
   * while unmodified / chronic tokens remain hard exclusions.
   */
  treatAcuteAsHard?: boolean;
};

/**
 * Central hard-exclusion evaluator (questionnaire / planning by default).
 *
 * Precedence:
 * 1. Matching structured token without acute-only caution → hard exclude.
 * 2. Matching structured token with only `acute` modifier → soft caution
 *    (not hard-excluded unless treatAcuteAsHard).
 * 3. Usable structured metadata with no hard match → do NOT exclude via free text.
 * 4. No usable structured metadata → legacy free text may conservatively exclude
 *    (emits legacy_text_contraindication_used:*).
 * 5. Free text never overrides valid structured metadata.
 */
export const evaluateHardPainExclusion = (
  exercise: PainEligibleExercise,
  activeAreas: readonly CanonicalPainArea[] | readonly string[],
  options: HardPainExclusionOptions = {}
): HardPainExclusionResult => {
  const treatAcuteAsHard = options.treatAcuteAsHard === true;
  const normalizedAreas = canonicalizePainAreas(
    activeAreas as readonly string[]
  ).areas;

  if (!normalizedAreas.length) {
    return {
      excluded: false,
      matchedAreas: [],
      matchedTokens: [],
      unknownTokens: [],
      source: "none",
      via: "none",
      reasonCodes: [],
    };
  }

  const tokens = exercise.painContraindications;
  const unknownTokens: string[] = [];
  const softCautionCodes: string[] = [];
  const hardMatchedAreas: CanonicalPainArea[] = [];
  const hardMatchedTokens: string[] = [];
  const hardReasonCodes: string[] = [];

  for (const token of tokens ?? []) {
    const parsed = parsePainToken(token);
    if (parsed.unknownModifier) {
      softCautionCodes.push(
        `unknown_pain_modifier:${normalizePainAreaToken(token)}`
      );
    }
    if (!parsed.area) {
      unknownTokens.push(token);
      continue;
    }
    if (!normalizedAreas.includes(parsed.area)) continue;

    const acuteOnly = parsed.modifier === "acute" && !treatAcuteAsHard;
    if (acuteOnly) {
      softCautionCodes.push(
        painReasonCode("deprioritized", `acute_caution:${parsed.area}`)
      );
      continue;
    }

    hardMatchedAreas.push(parsed.area);
    hardMatchedTokens.push(token);
    hardReasonCodes.push(painReasonCode("hard_excluded", parsed.area));
  }

  if (hardMatchedAreas.length) {
    return {
      excluded: true,
      matchedAreas: unique(hardMatchedAreas),
      matchedTokens: unique(hardMatchedTokens),
      unknownTokens: unique(unknownTokens),
      source: "structured",
      via: "structured",
      reasonCodes: unique([...hardReasonCodes, ...softCautionCodes]),
    };
  }

  if (hasUsableStructuredPainMetadata(tokens)) {
    // Structured present and valid but no hard match — free text must not override.
    return {
      excluded: false,
      matchedAreas: [],
      matchedTokens: [],
      unknownTokens: unique(unknownTokens),
      source: "none",
      via: "none",
      reasonCodes: unique([
        ...softCautionCodes,
        ...unknownTokens.map(
          (t) => `catalog_unmapped_pain_token:${normalizePainAreaToken(t)}`
        ),
      ]),
    };
  }

  const legacy = legacyTextContraindicationHits(
    exercise.contraindications,
    normalizedAreas
  );
  if (legacy.excluded) {
    return { ...legacy, via: "legacy_text" };
  }

  return {
    excluded: false,
    matchedAreas: [],
    matchedTokens: [],
    unknownTokens: unique(unknownTokens),
    source: "none",
    via: "none",
    reasonCodes: unique(softCautionCodes),
  };
};

export const isHardExcludedByPain = (
  exercise: PainEligibleExercise,
  activeAreas: readonly CanonicalPainArea[] | readonly string[]
): boolean => evaluateHardPainExclusion(exercise, activeAreas).excluded;

/** Active areas as a Set of underscore tokens for warmup-style intersection checks. */
export const activePainAreaTokenSet = (
  inputs: readonly string[] | null | undefined
): Set<string> => {
  const { areas } = canonicalizePainAreas(inputs);
  return new Set(areas);
};

export type WarmupAvoidListOptions = {
  /**
   * Warmup avoid lists intentionally treat `acute_*` as hard by default.
   * Protective prep should not load an area the user already flagged (even acutely).
   * Questionnaire exercise planning remains soft for acute_* via evaluateHardPainExclusion.
   */
  treatAcuteAsHard?: boolean;
};

/**
 * Warmup avoid-list eligibility via the central hard-exclusion evaluator.
 *
 * Policy: treatAcuteAsHard defaults to **true** for warmup/prep avoid lists
 * (explicit; not implicit via painAreasConflict alone). Pass false only when
 * a caller intentionally wants questionnaire-style acute soft caution.
 */
export const isPainEligibleAgainstAvoidList = (
  avoidTokens: readonly string[] | null | undefined,
  activeInputs: readonly string[] | null | undefined,
  options: WarmupAvoidListOptions = {}
): boolean => {
  const { areas } = canonicalizePainAreas(activeInputs);
  if (!areas.length || !avoidTokens?.length) return true;
  const treatAcuteAsHard = options.treatAcuteAsHard !== false;
  return !evaluateHardPainExclusion(
    { painContraindications: [...avoidTokens], contraindications: [] },
    areas,
    { treatAcuteAsHard }
  ).excluded;
};
