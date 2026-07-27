/**
 * Phase 6k Commit 1 — catalog data integrity audit (1.a–1.g).
 *
 * Pure checks over the post-inference catalog (`allExercises`). Used by the
 * unit guard and to generate docs/catalog-integrity-audit-6k.md.
 */

import { allExercises, type Exercise } from "@/lib/exercises";

export type IntegrityVerdict = "PASS" | "FAIL" | "NEEDS_REVIEW";

export type IntegrityIssue = {
  check: "1.a" | "1.b" | "1.c" | "1.d" | "1.e" | "1.f" | "1.g";
  severity: "fail" | "review";
  message: string;
  suggestedFix: string;
};

export type ExerciseIntegrityResult = {
  id: string;
  name: string;
  category: Exercise["category"];
  loadType: Exercise["loadType"];
  durationOrReps: string;
  pattern?: string;
  difficulty?: number;
  verdict: IntegrityVerdict;
  issues: IntegrityIssue[];
};

/** Patterns that progress by load/reps in place — ladder difficulty optional. */
export const ISOLATION_PATTERNS = new Set([
  "calves",
  "carry_load",
  "lateral_raise",
  "elbow_flexion",
  "elbow_extension",
]);

const MAIN_PATTERNS = new Set([
  "horizontal_pull",
  "vertical_pull",
  "horizontal_push",
  "vertical_push",
  "knee_dominant",
  "hinge",
  "core_stability",
  ...ISOLATION_PATTERNS,
]);

const PLACEHOLDER_RE =
  /\b(todo|tbd|lorem ipsum|add note here|placeholder|xxx|fix me)\b/i;

const TIMED_DURATION_RE =
  /(\d+)\s*[-–]?\s*(\d+)?\s*(sec|secs|second|seconds|s)\b/i;
const REP_RANGE_RE =
  /(\d+)\s*[-–]?\s*(\d+)?\s*(rep|reps|per side|per letter|each letter|each|\/\s*side)\b/i;
const BREATHS_RE = /(\d+)\s*[-–]?\s*(\d+)?\s*breaths?\b/i;

/**
 * Ambiguous postural correctives / flows where loadType vs durationOrReps
 * still needs a coaching ruling. Phase 6k Commit 5 cleared the ship queue
 * (cat-cow, wall-slides, hip-flexor-stretch, thread-the-needle,
 * reverse-snow-angel). Remaining ids stay for future audits.
 */
export const TIMING_REVIEW_CANDIDATES = new Set([
  "wall-angels",
  "open-books",
  "worlds-greatest-stretch",
  "pec-stretch",
]);

export const parseDurationOrRepsFormat = (
  durationOrReps: string,
  loadType: Exercise["loadType"]
): {
  format: "rep-based" | "timed" | "duration-per-rep" | "ambiguous" | "missing";
  hasRepRange: boolean;
  hasDurationSec: boolean;
} => {
  const raw = (durationOrReps ?? "").trim();
  if (!raw) {
    return {
      format: "missing",
      hasRepRange: false,
      hasDurationSec: false,
    };
  }
  const hasRepRange = REP_RANGE_RE.test(raw);
  const hasBreaths = BREATHS_RE.test(raw);
  const hasDurationSec = TIMED_DURATION_RE.test(raw) || hasBreaths;
  if (loadType === "timed") {
    return {
      format: hasDurationSec ? "timed" : hasRepRange ? "ambiguous" : "timed",
      hasRepRange,
      hasDurationSec,
    };
  }
  if (hasRepRange && hasDurationSec) {
    return { format: "duration-per-rep", hasRepRange, hasDurationSec };
  }
  if (hasRepRange) {
    return { format: "rep-based", hasRepRange, hasDurationSec };
  }
  if (hasDurationSec) {
    return { format: "timed", hasRepRange, hasDurationSec };
  }
  return { format: "ambiguous", hasRepRange, hasDurationSec };
};

const hasPlaceholderText = (values: string[]) =>
  values.some((value) => PLACEHOLDER_RE.test(value));

export const auditExercise = (exercise: Exercise): ExerciseIntegrityResult => {
  const issues: IntegrityIssue[] = [];
  const parsed = parseDurationOrRepsFormat(
    exercise.durationOrReps,
    exercise.loadType
  );

  // 1.a — Timing / format completeness
  if (parsed.format === "missing") {
    issues.push({
      check: "1.a",
      severity: "fail",
      message: "durationOrReps is empty",
      suggestedFix: 'Set a rep range (e.g. "8-12 reps") or timed dose (e.g. "30-45 sec").',
    });
  } else if (exercise.loadType === "timed" && !parsed.hasDurationSec) {
    issues.push({
      check: "1.a",
      severity: "fail",
      message: `loadType is timed but durationOrReps ("${exercise.durationOrReps}") has no seconds`,
      suggestedFix: 'Add a hold/work duration in seconds (e.g. "30-45 sec").',
    });
  } else if (
    exercise.loadType !== "timed" &&
    !parsed.hasRepRange &&
    !parsed.hasDurationSec
  ) {
    issues.push({
      check: "1.a",
      severity: "fail",
      message: `durationOrReps ("${exercise.durationOrReps}") is not a clear rep or time dose`,
      suggestedFix: "Rewrite as a rep range or timed dose.",
    });
  } else if (
    TIMING_REVIEW_CANDIDATES.has(exercise.id) &&
    (parsed.format === "ambiguous" ||
      (exercise.loadType !== "timed" && parsed.hasDurationSec === false &&
        /flow|slide|angel|stretch|open book|thread/i.test(exercise.name)))
  ) {
    issues.push({
      check: "1.a",
      severity: "review",
      message:
        "Postural corrective / mobility flow — confirm whether prescription should be rep-based or timed",
      suggestedFix:
        "Sotirios ruling: choose loadType + durationOrReps; align warmupLibrary/program makeItem.",
    });
  } else if (TIMING_REVIEW_CANDIDATES.has(exercise.id)) {
    // Still flag known candidates even when parse is clean — dual sources may disagree.
    issues.push({
      check: "1.a",
      severity: "review",
      message: `Known dual-source timing risk (catalog ${exercise.loadType} / "${exercise.durationOrReps}" vs warmup/program durationSec)`,
      suggestedFix:
        "Confirm single source of truth for session prescription (reps vs timed hold).",
    });
  }

  // 1.b — Coach note presence
  const cues = exercise.cues ?? [];
  const mistakes = exercise.mistakes ?? [];
  if (cues.length === 0 && mistakes.length === 0) {
    issues.push({
      check: "1.b",
      severity: "fail",
      message: "No cues or mistakes — coach notes section would render empty",
      suggestedFix: "Add at least one form cue or common mistake.",
    });
  }
  if (hasPlaceholderText([...cues, ...mistakes])) {
    issues.push({
      check: "1.b",
      severity: "fail",
      message: "Coach notes contain placeholder text",
      suggestedFix: "Replace TODO/placeholder copy with real coaching language.",
    });
  }

  // 1.c — Difficulty rating (required for mains; warmups/activation/cooldown
  // intentionally omit ladder difficulty).
  const isIsolation = Boolean(
    exercise.pattern && ISOLATION_PATTERNS.has(exercise.pattern)
  );
  if (exercise.category === "main") {
    if (exercise.difficulty == null) {
      if (isIsolation) {
        issues.push({
          check: "1.c",
          severity: "review",
          message:
            "Isolation main has no ladder difficulty — confirm intentional exemption",
          suggestedFix:
            "Set difficulty 1–5, or document as intentional isolation exemption.",
        });
      } else {
        issues.push({
          check: "1.c",
          severity: "fail",
          message: "Main exercise missing difficulty (1–5)",
          suggestedFix: "Assign ladder difficulty.",
        });
      }
    }
  }

  // 1.d — Pattern classification
  if (exercise.category === "main") {
    if (!exercise.pattern) {
      issues.push({
        check: "1.d",
        severity: "fail",
        message: "Main exercise missing pattern",
        suggestedFix: "Assign a selection-canonical pattern.",
      });
    } else if (!MAIN_PATTERNS.has(exercise.pattern)) {
      issues.push({
        check: "1.d",
        severity: "fail",
        message: `Unrecognized pattern "${exercise.pattern}"`,
        suggestedFix: "Map to a known main/isolation pattern.",
      });
    }
  } else if (!exercise.pattern && !(exercise.primes?.length || exercise.mobilizes?.length)) {
    issues.push({
      check: "1.d",
      severity: "review",
      message: "Non-main exercise has no pattern and no primes/mobilizes tags",
      suggestedFix: "Add primes/mobilizes or an explicit pattern.",
    });
  }

  // 1.e — Contraindications present as a field
  const hasPainField = Array.isArray(exercise.painContraindications);
  const hasContraField = Array.isArray(exercise.contraindications);
  if (!hasPainField && !hasContraField) {
    issues.push({
      check: "1.e",
      severity: "fail",
      message: "Neither painContraindications nor contraindications is present",
      suggestedFix: "Add painContraindications: [] (or a real list).",
    });
  } else if (
    exercise.category === "main" &&
    (exercise.painContraindications?.length ?? 0) === 0 &&
    (exercise.contraindications?.length ?? 0) === 0
  ) {
    issues.push({
      check: "1.e",
      severity: "review",
      message: "Main exercise has empty contraindications — confirm intentional",
      suggestedFix: "Add pattern-matched pain contraindications when applicable.",
    });
  }

  // 1.f — Coaching cues for beginner-critical work
  if (exercise.category === "main" && !isIsolation) {
    if (cues.length === 0) {
      issues.push({
        check: "1.f",
        severity: "fail",
        message: "Compound/main lift missing form cues",
        suggestedFix: "Add 1–3 beginner-critical cues.",
      });
    }
    if (mistakes.length === 0) {
      issues.push({
        check: "1.f",
        severity: "review",
        message: "Main lift missing common-mistake text",
        suggestedFix: "Add at least one common mistake.",
      });
    }
  }

  // 1.g — Video / demonstration reference
  // Policy: missing videoUrl is allowed when demoStatus is "none" (set at map time).
  const demoStatus = (exercise as Exercise & { demoStatus?: "none" | "url" })
    .demoStatus;
  if (exercise.videoUrl) {
    // populated — pass
  } else if (demoStatus === "none") {
    // explicit no-demo — pass
  } else {
    issues.push({
      check: "1.g",
      severity: "fail",
      message: "No videoUrl and demoStatus is not explicitly \"none\"",
      suggestedFix: 'Set demoStatus: "none" (or add a videoUrl).',
    });
  }

  const hasFail = issues.some((issue) => issue.severity === "fail");
  const hasReview = issues.some((issue) => issue.severity === "review");
  const verdict: IntegrityVerdict = hasFail
    ? "FAIL"
    : hasReview
      ? "NEEDS_REVIEW"
      : "PASS";

  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    loadType: exercise.loadType,
    durationOrReps: exercise.durationOrReps,
    pattern: exercise.pattern,
    difficulty: exercise.difficulty,
    verdict,
    issues,
  };
};

export const auditCatalog = (
  catalog: readonly Exercise[] = allExercises
): ExerciseIntegrityResult[] => catalog.map(auditExercise);

export const summarizeCatalogAudit = (results: ExerciseIntegrityResult[]) => {
  const pass = results.filter((r) => r.verdict === "PASS").length;
  const fail = results.filter((r) => r.verdict === "FAIL").length;
  const needsReview = results.filter((r) => r.verdict === "NEEDS_REVIEW").length;
  return {
    total: results.length,
    pass,
    fail,
    needsReview,
    failResults: results.filter((r) => r.verdict === "FAIL"),
    reviewResults: results.filter((r) => r.verdict === "NEEDS_REVIEW"),
  };
};

export const renderCatalogIntegrityMarkdown = (
  results: ExerciseIntegrityResult[]
): string => {
  const summary = summarizeCatalogAudit(results);
  const lines: string[] = [];
  lines.push("# Catalog Integrity Audit — Phase 6k Commit 1");
  lines.push("");
  lines.push(`Audited: **${summary.total}** exercises (includes deprecated).`);
  lines.push("");
  lines.push("| Verdict | Count |");
  lines.push("|---|---|");
  lines.push(`| PASS | ${summary.pass} |`);
  lines.push(`| FAIL | ${summary.fail} |`);
  lines.push(`| NEEDS_REVIEW | ${summary.needsReview} |`);
  lines.push("");
  lines.push(
    "Checks: **1.a** timing · **1.b** coach notes · **1.c** difficulty · **1.d** pattern · **1.e** contraindications · **1.f** cues · **1.g** demo reference."
  );
  lines.push("");
  lines.push(
    "Commit 5 applies Sotirios's coaching rulings on every `NEEDS_REVIEW` item below. Structural `FAIL`s must be cleared before/with Commit 1's fix pass."
  );
  lines.push("");

  if (summary.failResults.length) {
    lines.push("## FAIL — fix required");
    lines.push("");
    for (const result of summary.failResults) {
      lines.push(`### \`${result.id}\` — ${result.name} (**FAIL**)`);
      lines.push("");
      lines.push(
        `- Category: ${result.category} · loadType: ${result.loadType} · dose: \`${result.durationOrReps}\``
      );
      for (const issue of result.issues.filter((i) => i.severity === "fail")) {
        lines.push(
          `- **${issue.check}**: ${issue.message} → _${issue.suggestedFix}_`
        );
      }
      lines.push("");
    }
  } else {
    lines.push("## FAIL — none");
    lines.push("");
  }

  lines.push("## NEEDS_REVIEW — Sotirios coaching rulings");
  lines.push("");
  if (!summary.reviewResults.length) {
    lines.push("_None._");
    lines.push("");
  } else {
    lines.push(
      "Reply with a ruling per id (e.g. `wall-slides: timed, 30-45 sec` or `wall-slides: reps, 8-10`)."
    );
    lines.push("");
    for (const result of summary.reviewResults) {
      lines.push(`### \`${result.id}\` — ${result.name}`);
      lines.push("");
      lines.push(
        `- Category: ${result.category} · loadType: ${result.loadType} · dose: \`${result.durationOrReps}\` · pattern: \`${result.pattern ?? "—"}\` · difficulty: ${result.difficulty ?? "—"}`
      );
      for (const issue of result.issues.filter((i) => i.severity === "review")) {
        lines.push(
          `- **${issue.check}**: ${issue.message} → _${issue.suggestedFix}_`
        );
      }
      lines.push("");
    }
  }

  lines.push("## Full roster");
  lines.push("");
  lines.push("| id | name | verdict | issues |");
  lines.push("|---|---|---|---|");
  for (const result of results) {
    const issueSummary = result.issues
      .map((i) => `${i.check}:${i.severity}`)
      .join(", ");
    lines.push(
      `| \`${result.id}\` | ${result.name} | ${result.verdict} | ${issueSummary || "—"} |`
    );
  }
  lines.push("");
  return lines.join("\n");
};

/** Session UI fallbacks (belt-and-suspenders) — shared copy. */
export const FALLBACK_TIMED_DURATION_COPY = "Hold for controlled tempo";
export const FALLBACK_REP_RANGE_COPY = "Perform controlled reps to fatigue";
