/**
 * catalogLadderInvariants.test.ts
 *
 * Encodes the decided invariant rules for the exercise catalog. This test MUST
 * pass on phase-2b-institutionalize and MUST fail if any future edit violates a rule.
 *
 * Rules encoded (from bloom-plan Phase 2b.1 + 2b.2):
 *   I4  Bidirectional coherence: A.progressionOf = B ⇒ B.regressionOf = A
 *       Exception: KNOWN_BRANCH_CHILDREN — exercises that are alternate progressions
 *       from a parent where another exercise is the canonical regressionOf target.
 *       Branch children must be EXPLICITLY listed in KNOWN_BRANCH_CHILDREN; any
 *       unlisted asymmetric link is a violation (no silent third state).
 *   I5  Difficulty strictly increases along every progressionOf chain.
 *       Exception I5a: d5 ceiling ties are allowed (two d5 entries may share the top rung).
 *   I6  Pattern is constant within a progressionOf/regressionOf chain.
 *   I7  Ladder graph is acyclic (no cycles via progressionOf).
 *
 * Vocabulary rules (Phase 2b.3):
 *   VOCAB-P  primes values must be drawn from VALID_PRIMES.
 *   VOCAB-M  mobilizes values must be drawn from VALID_MOBILIZES.
 *            "neck" is overlay-only and exempt from pattern-map matching.
 *
 * Exemptions (encoded as explicit allow-lists):
 *   - warmup / cooldown / activation entries: NOT required to have difficulty or pattern;
 *     they carry primes/mobilizes instead.
 *   - subPattern entries (toolbox items like scap_health, hip_health, knee_health,
 *     core_health): pattern-exempt by rule; may have difficulty but NO chain links.
 *   - ISOLATION_PATTERNS (calves, carry_load, lateral_raise, elbow_flexion,
 *     elbow_extension): valid patterns but ladder-exempt — no progressionOf/regressionOf.
 *   - deprecated entries: excluded from all checks (they're not in the selectable pool).
 */

import { describe, test, expect } from "vitest";
import { exercises, type Exercise } from "@/lib/exercises";

// ─── Pattern classification (mirrors exerciseCatalog.ts) ──────────────────────

const MAIN_PATTERNS = new Set([
  "horizontal_pull",
  "vertical_pull",
  "horizontal_push",
  "vertical_push",
  "knee_dominant",
  "hinge",
  "core_stability",
]);

const ISOLATION_PATTERNS = new Set([
  "calves",
  "carry_load",
  "lateral_raise",
  "elbow_flexion",
  "elbow_extension",
]);

// ─── Closed vocabulary for primes/mobilizes (VOCAB-P / VOCAB-M) ───────────────

/**
 * Ratified pattern names (Sotirios, 2026-07-12).
 * Any primes value not in this set is a violation.
 */
const VALID_PRIMES = new Set([
  "hinge",
  "knee_dominant",
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "core_stability",
]);

/**
 * Ratified joint/region names for mobilizes (Sotirios, 2026-07-12).
 * Derived from the ratified pattern→joint map:
 *   hinge          → hips, hamstrings, lower back
 *   knee_dominant  → knees, hips, ankles
 *   horizontal_push → shoulders, elbows, wrists
 *   vertical_push  → shoulders, thoracic spine, elbows, wrists
 *   horizontal_pull → shoulders, scapulae, elbows
 *   vertical_pull  → shoulders, scapulae, elbows
 *   core_stability → spine, hips
 * Plus overlay-only: neck (exempt from pattern-map matching)
 * Plus exercise-specific: lats (anatomically meaningful in lat stretches)
 *
 * Normalized terms (no longer accepted after 2026-07-12):
 *   "upper_back"  → "thoracic spine"
 *   "serratus"    → "scapulae"
 *   "hip flexors" → "hips"
 *   "chest"       → "shoulders"
 *
 * Inventory gaps flagged for Sotirios (2026-07-12):
 *   knees, elbows, wrists, grip have ZERO mobilizer exercises currently.
 *   Do not author new exercises for these without sign-off.
 */
const VALID_MOBILIZES = new Set([
  "hips",
  "hamstrings",
  "lower back",
  "knees",
  "ankles",
  "shoulders",
  "elbows",
  "wrists",
  "thoracic spine",
  "scapulae",
  "spine",
  "neck",   // overlay-only: chin-tucks; exempt from pattern-map matching
  "lats",   // exercise-specific: banded-lat-stretch
]);

// ─── Explicitly declared branch children (I4 multi-branch annotation) ─────────

/**
 * Branch children are exercises that claim progressionOf = X but X.regressionOf
 * points to a different "canonical" sibling. Every such asymmetric link MUST be
 * listed here — any unlisted case is a test failure (no silent third state).
 *
 * Rationale for each entry (2026-07-12):
 *   incline-pushup           — alt d2 path from wall-pushup; canonical = countertop-pushup
 *   suspension-archer-row    — unilateral variant at same level; canonical = suspension-row-feet-elevated
 *   suspension-rear-delt-row — rear-delt emphasis branch; canonical = suspension-row-parallel
 *   suspension-face-pull     — face-pull emphasis branch; canonical = suspension-row-incline
 *   pullup-isometric-top-hold — isometric hold branch; canonical = neutral-grip-pullup
 *   suspension-archer-pushup  — unilateral push branch d5; canonical = suspension-pushup-feet-elevated
 *   suspension-chest-fly     — fly variant d5 ceiling tie; canonical = suspension-pushup-parallel
 *   hanging-oblique-knee-raise — rotation branch; canonical = hanging-hollow-hold
 *   machine-chest-press      — machine-track branch from band-chest-press; canonical = machine-pec-deck-press
 *   seated-lat-sweep-pulse   — lat-sweep branch; canonical = kneeling-prayer-lat-pulldown
 */
const KNOWN_BRANCH_CHILDREN = new Set([
  "incline-pushup",
  "suspension-archer-row",
  "suspension-rear-delt-row",
  "suspension-face-pull",
  "pullup-isometric-top-hold",
  "suspension-archer-pushup",
  "suspension-chest-fly",
  "hanging-oblique-knee-raise",
  "machine-chest-press",
  "seated-lat-sweep-pulse",
]);

// ─── Helper predicates ────────────────────────────────────────────────────────

/** Warmup / cooldown / activation entries are fully exempt from ladder rules. */
const isExemptCategory = (e: Exercise) =>
  e.category === "warmup" || e.category === "cooldown" || e.category === "activation";

/** subPattern toolbox items are exempt from chain-link rules. */
const hasToolboxSubPattern = (e: Exercise) => !!e.subPattern;

/** Isolation-pattern entries are ladder-exempt (no chain links allowed). */
const isIsolationPattern = (e: Exercise) =>
  !!e.pattern && ISOLATION_PATTERNS.has(e.pattern);

/**
 * An exercise is exempt from I4/I5/I6/I7 ladder checks if:
 *  - it is a warmup/cooldown/activation entry, OR
 *  - it carries a subPattern (toolbox), OR
 *  - it belongs to an isolation pattern.
 */
const isLadderExempt = (e: Exercise) =>
  isExemptCategory(e) || hasToolboxSubPattern(e) || isIsolationPattern(e);

const exerciseMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

// ─── I4 — Bidirectional coherence ─────────────────────────────────────────────

describe("I4 — bidirectional coherence (A.progressionOf = B ⇒ B.regressionOf = A)", () => {
  test("every progressionOf link has a matching regressionOf on the target, or is in KNOWN_BRANCH_CHILDREN", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (isLadderExempt(exercise)) continue;
      if (!exercise.progressionOf) continue;

      const target = exerciseMap.get(exercise.progressionOf);
      if (!target) {
        // I3 (link existence) is covered by exerciseCatalog validator; skip here.
        continue;
      }
      if (isLadderExempt(target)) continue;

      if (target.regressionOf !== exercise.id) {
        if (KNOWN_BRANCH_CHILDREN.has(exercise.id)) {
          // Explicitly annotated branch child — exempted.
          continue;
        }
        // Not listed in KNOWN_BRANCH_CHILDREN and not bidirectional — genuine violation.
        violations.push(
          `${exercise.id}.progressionOf = "${exercise.progressionOf}" ` +
            `but ${target.id}.regressionOf = "${target.regressionOf ?? "(none)"}" ` +
            `— add to KNOWN_BRANCH_CHILDREN if intentional branch`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  test("every regressionOf link has a matching progressionOf on the target", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (isLadderExempt(exercise)) continue;
      if (!exercise.regressionOf) continue;

      const target = exerciseMap.get(exercise.regressionOf);
      if (!target) continue;
      if (isLadderExempt(target)) continue;

      if (target.progressionOf !== exercise.id) {
        violations.push(
          `${exercise.id}.regressionOf = "${exercise.regressionOf}" ` +
            `but ${target.id}.progressionOf = "${target.progressionOf ?? "(none)"}"`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  test("each KNOWN_BRANCH_CHILDREN entry is structurally a valid branch child", () => {
    const invalid: string[] = [];

    for (const id of KNOWN_BRANCH_CHILDREN) {
      const exercise = exerciseMap.get(id);
      if (!exercise) {
        invalid.push(`${id} — not found in catalog`);
        continue;
      }
      if (!exercise.progressionOf) {
        invalid.push(`${id} — in KNOWN_BRANCH_CHILDREN but has no progressionOf`);
        continue;
      }
      const target = exerciseMap.get(exercise.progressionOf);
      if (!target) {
        invalid.push(`${id}.progressionOf = "${exercise.progressionOf}" — target not found`);
        continue;
      }
      if (target.regressionOf === id) {
        invalid.push(
          `${id} — in KNOWN_BRANCH_CHILDREN but is actually the canonical regressionOf target; remove from set`
        );
        continue;
      }
      // There must be a canonical sibling pointing back to the parent
      const hasCanonicalSibling = exercises.some(
        (e) => e.id !== id && e.progressionOf === target.id && target.regressionOf === e.id
      );
      if (!hasCanonicalSibling) {
        invalid.push(
          `${id} — in KNOWN_BRANCH_CHILDREN but no canonical sibling found for parent ${target.id}`
        );
      }
    }

    expect(invalid, invalid.join("\n")).toHaveLength(0);
  });
});

// ─── I5 — Strict monotonicity (+I5a d5 ceiling ties) ─────────────────────────

describe("I5 — difficulty strictly increases along progressionOf chain (+I5a d5 ties allowed)", () => {
  test("each progression step is strictly harder, with d5 ceiling ties permitted", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (isLadderExempt(exercise)) continue;
      if (!exercise.progressionOf) continue;

      const target = exerciseMap.get(exercise.progressionOf);
      if (!target) continue;
      if (isLadderExempt(target)) continue;

      const fromDifficulty = exercise.difficulty;
      const toDifficulty = target.difficulty;

      if (!fromDifficulty || !toDifficulty) continue;

      // I5a: d5 ceiling ties are allowed
      if (fromDifficulty === 5 && toDifficulty === 5) continue;

      // Violation: exercise should be strictly harder than its progressionOf target.
      // (A.progressionOf = B means A came after B, so A.difficulty > B.difficulty)
      if (fromDifficulty <= toDifficulty) {
        violations.push(
          `${exercise.id}(d${fromDifficulty}).progressionOf = ` +
            `${target.id}(d${toDifficulty}) — exercise is not strictly harder than target`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

// ─── I6 — Pattern constant within a ladder ───────────────────────────────────

describe("I6 — pattern is constant within a progressionOf chain", () => {
  test("A.progressionOf = B implies A.pattern === B.pattern", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (isLadderExempt(exercise)) continue;
      if (!exercise.progressionOf || !exercise.pattern) continue;

      const target = exerciseMap.get(exercise.progressionOf);
      if (!target) continue;
      if (isLadderExempt(target)) continue;
      if (!target.pattern) continue;

      if (exercise.pattern !== target.pattern) {
        violations.push(
          `${exercise.id}(${exercise.pattern}).progressionOf = ` +
            `${target.id}(${target.pattern}) — cross-pattern link`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

// ─── I7 — Acyclic graph ───────────────────────────────────────────────────────

describe("I7 — ladder graph is acyclic via progressionOf", () => {
  test("no exercise reaches itself via progressionOf chain", () => {
    const cycles: string[] = [];

    const detectCycle = (
      startId: string,
      currentId: string,
      visited: Set<string>
    ): boolean => {
      if (visited.has(currentId)) {
        if (currentId === startId) return true;
        return false;
      }
      visited.add(currentId);
      const exercise = exerciseMap.get(currentId);
      if (!exercise?.progressionOf) return false;
      return detectCycle(startId, exercise.progressionOf, visited);
    };

    for (const exercise of exercises) {
      if (!exercise.progressionOf) continue;
      const visited = new Set<string>();
      if (detectCycle(exercise.id, exercise.progressionOf, visited)) {
        cycles.push(`Cycle detected starting from ${exercise.id}`);
      }
    }

    expect(cycles, cycles.join("\n")).toHaveLength(0);
  });
});

// ─── ISO-delinked — Isolation and toolbox patterns have no chain links ────────

describe("ISO-delinked — isolation patterns and subPattern toolboxes have no chain links", () => {
  test("isolation-pattern exercises have no progressionOf or regressionOf", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (!isIsolationPattern(exercise)) continue;
      if (exercise.progressionOf) {
        violations.push(
          `${exercise.id} (${exercise.pattern}) is isolation-pattern but has progressionOf: "${exercise.progressionOf}"`
        );
      }
      if (exercise.regressionOf) {
        violations.push(
          `${exercise.id} (${exercise.pattern}) is isolation-pattern but has regressionOf: "${exercise.regressionOf}"`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  test("subPattern toolbox exercises have no progressionOf or regressionOf", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      if (!exercise.subPattern) continue;
      if (exercise.progressionOf) {
        violations.push(
          `${exercise.id} (subPattern: ${exercise.subPattern}) has progressionOf: "${exercise.progressionOf}"`
        );
      }
      if (exercise.regressionOf) {
        violations.push(
          `${exercise.id} (subPattern: ${exercise.subPattern}) has regressionOf: "${exercise.regressionOf}"`
        );
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

// ─── Deprecated exclusion sanity ─────────────────────────────────────────────

describe("deprecated exercises are excluded from the selectable pool", () => {
  test("no deprecated exercise appears in the exported exercises array", () => {
    const deprecated = exercises.filter((e) => e.deprecated);
    expect(
      deprecated.map((e) => e.id),
      "These deprecated entries leaked into the selection pool"
    ).toHaveLength(0);
  });
});

// ─── VOCAB-P / VOCAB-M — Closed vocabulary for primes/mobilizes ───────────────

describe("VOCAB-P — primes values are drawn from the closed vocabulary", () => {
  test("every primes term is in VALID_PRIMES", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      const primes = (exercise as any).primes as string[] | undefined;
      if (!primes) continue;
      for (const term of primes) {
        if (!VALID_PRIMES.has(term)) {
          violations.push(`${exercise.id}: primes includes unknown term "${term}"`);
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

describe("VOCAB-M — mobilizes values are drawn from the closed vocabulary", () => {
  test("every mobilizes term is in VALID_MOBILIZES", () => {
    const violations: string[] = [];

    for (const exercise of exercises) {
      const mobilizes = (exercise as any).mobilizes as string[] | undefined;
      if (!mobilizes) continue;
      for (const term of mobilizes) {
        if (!VALID_MOBILIZES.has(term)) {
          violations.push(`${exercise.id}: mobilizes includes unknown term "${term}"`);
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});
