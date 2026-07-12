/**
 * catalogLadderInvariants.test.ts
 *
 * Encodes the decided invariant rules for the exercise catalog. This test MUST
 * pass on phase-2b-institutionalize and MUST fail if any future edit violates a rule.
 *
 * Rules encoded (from bloom-plan Phase 2b.1 + 2b.2):
 *   I4  Bidirectional coherence: A.progressionOf = B ⇒ B.regressionOf = A
 *       Exception: familyKey branch — one parent may have two regressionOf children
 *       (annotated via different familyKey/variantKey pairings).
 *   I5  Difficulty strictly increases along every progressionOf chain.
 *       Exception I5a: d5 ceiling ties are allowed (two d5 entries may share the top rung).
 *   I6  Pattern is constant within a progressionOf/regressionOf chain.
 *   I7  Ladder graph is acyclic (no cycles via progressionOf).
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
  test("every progressionOf link has a matching regressionOf on the target", () => {
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

      // The target's regressionOf must point back to this exercise.
      // Multi-branch exception: if another sibling ALSO has progressionOf = target.id
      // AND the target's regressionOf points to THAT sibling (not us), we are the
      // "branch child" and are exempt — the parent cannot have two regressionOf values.
      if (target.regressionOf !== exercise.id) {
        const anotherChildIsCanonical = exercises.some(
          (e) =>
            e.id !== exercise.id &&
            e.progressionOf === target.id &&
            target.regressionOf === e.id
        );

        if (!anotherChildIsCanonical) {
          violations.push(
            `${exercise.id}.progressionOf = "${exercise.progressionOf}" ` +
              `but ${target.id}.regressionOf = "${target.regressionOf ?? "(none)"}"`
          );
        }
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
