# Program Quality V2 — Phase 7 Completion

Verdict: **PASS**

Resolves the two remaining broad phase-matrix blockers after Phase 7 checkpoint
`3cbecf298f06c0f378b54fe5ff895621f1cdfd13` without rewriting that checkpoint.

- Template version: **18** (composition change — carry/calves/accessory purity + frequency quotas)
- Historical Phase 0–7 reports: **preserved** (this file is an addendum surface)

## Blockers resolved

| Code | Status |
|------|--------|
| `MATRIX_GYM_4D_BICEPS_TRICEPS_PUSH_COVERAGE` | **PASS** |
| `MATRIX_CARRY_EXPOSURE_INTELLIGENCE` | **PASS** |

## Deterministic reproductions

### Gym 4-day biceps/triceps/push

All five matrix profiles × activation/skill/growth previously failed with
`bicepsDays 1/2`, `tricepsDays 1/2`, `pushDays 1/2` on gym 4-day Upper/Lower weeks.

Canonical seed example:

- `phase-matrix-normal beginner-4-gym-activation`
- Week identity: Upper Push / Lower Squat / Upper Pull / Lower Hinge+Carry
- Observed before fix: `biceps=1 triceps=1 push=1` against contract minima of 2

### Carry exposure intelligence

69 matrix personas previously failed intelligence with
`Carry exposure missing for the week` whenever `daysPerWeek >= 4` and
`carryDays === 0`, including bodyweight/band contexts with no legal true carry
and activation gym weeks where coverage repair placed a carry that accessory
slot purity later stripped.

Canonical seeds:

- `phase-matrix-normal beginner-4-gym-activation` (legal true carry available)
- `phase-matrix-pain beginner-4-none-activation` (no legal true carry)
- `phase-matrix-pain beginner-4-gym-activation` (pain-contraindicated loaded carries)

## Relational traces

### Blocker 1 — Gym 4-day arm/push

```text
system input
  persona + phase + 4d gym + Upper/Lower split
→ giver
  getWeeklyCoverageContract(4) + weekly arm/push repair caps
→ output
  one direct biceps day, one direct triceps day, one push day
→ UI receiver
  program week / session cards (day titles + accessories)
→ persistence effect
  stored in newly generated program composition (template v18);
  existing stored programs unchanged
```

Root cause: **frequency-specific quota policy** demanded two arm/push days on a
four-day Upper/Lower structure that only has one push day and one pull day.
Engine repair already capped minima to available day indexes (1), so the audit
contract was dishonest relative to the template.

### Blocker 2 — Carry exposure intelligence

```text
system input
  persona + phase + frequency≥4 + equipment + pain
→ giver
  true-carry legality (equipment + painContraindications) +
  weekly carry repair + final accessory slot purity lane resolution
→ output
  true loaded carry days when legal; zero when capability-limited
→ UI receiver
  lower/carry day accessories (not marches mislabeled as carries)
→ persistence effect
  carry placement stored in generated program (template v18);
  audit capability limitation is generation-time classification only
```

Root causes:

1. Audit required carry unconditionally for `daysPerWeek >= 4`.
2. Activation coverage repair inserted `farmers-carry`, then accessory slot purity
   forced it onto a planned lower ordinal and replaced it.
3. Pain-safe true-carry candidates were not distinguished from core-stability marches.

## Policy corrections

1. **4-day weekly contract** — `bicepsDays/tricepsDays/pushDays/hingeDays = 1`
   (honest Upper/Lower + full-body home floor; gym still commonly delivers more).
2. **True-carry legality helper** — `hasLegalTrueCarryExposureCandidate` /
   pain-safe carry checks; audit requires carry only when a legal candidate exists.
3. **Carry repair** — preserve calves/arms; prefer replacing duplicate core slots.
4. **Accessory slot purity** — if a planned lane falsely rejects a truthful
   exercise, fall back to a legal inferred/debug/core lane (preserves carries and calves).
5. **Calves repair** — preserve true carries; must-include protection allows
   replacement when another accessory already satisfies the same rule.
6. **Home arm coverage indexes** — union full-body / upper-pattern days so 5-day
   home biceps minima can be met.
7. **Coverage harness** — mode-owned home day titles (Full Body, Practice & Restore,
   Upper Pattern Practice, Lower & Core Practice) are not judged by gym day specs.
8. **Phase-matrix band target assert** — band 3-day checks Full Body A push+pull
   (current authorship), not gym Back + Chest.
9. **Quality-gate recovery preserves caller prefs** — recovery/fallback re-generation
   forwards `blockedExerciseIds` and other options (previously dropped blocks and
   could re-insert blocked machines).
10. **Gym squat/hinge block fallbacks** — machine-preference no longer starves
    `squat_primary` when leg-press is blocked (`goblet-squat`); `band-rdl` is
    `loadedMainEligible` so blocking `db-rdl` still fills `hinge_primary`.

## Intentional program changes

- Activation gym HF weeks retain a true loaded carry when legal.
- Hinge/carry days prefer `carry + calf` over `plank + carry` with missing calves.
- 4-day contract minima no longer force duplicate arm/push volume.
- Pain / no-load contexts no longer get false “missing carry” intelligence failures.
- Home 5-day plans receive direct biceps accessories across eligible days.

## Template-version decision

**Bump 17 → 18.** Newly generated program composition changes (carry retention,
calves coexistence, home biceps placement, accessory purity lane fallback).
Not a test-only or classification-only change.

## Focused tests

`packages/engine/tests/unit/phase7CompletionCoveragePolicy.test.ts`

- four-day arm/push quotas
- direct vs indirect arm coverage
- pain-aware four-day push preservation
- carry vs core-stability truth
- equipment-appropriate carry expectations
- pain-aware carry limitation
- frequency-specific quota + determinism
- no same-day duplicate accessories / no arbitrary volume inflation

`programQualityGate.test.ts` — template version **18**; advanced 5d pain baseline still green.

## Full matrix results

- `npm run audit:coverage-matrix` → **PASS**
- `npm run audit:phase-matrix` → **PASS** (0 remaining blockers)

## Complete fuzz results (rerun)

From `npm run audit:program-quality` after the completion fixes:

| Mode | Cases | Hard failures | Identity collapse | Illegal equipment | Deterministic mismatches | Exceptions |
|------|------:|-------------:|------------------:|------------------:|-------------------------:|-----------:|
| gym | 10000 | 0 | 0 | 0 | 0 | 0 |
| dumbbells | 10000 | 0 | 0 | 0 | 0 | 0 |
| bands | 10000 | 0 | 0 | 0 | 0 | 0 |
| bodyweight | 10000 | 0 | 0 | 0 | 0 | 0 |
| mixedHome | 10000 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **50000** | **0** | **0** | **0** | **0** | **0** |

- 0 required-zero regressions
- 0 new coaching gaps (`audit:exercise-coaching` PASS)
- Coaching completeness preserved

## Mode regressions

No mode-contract regressions observed in the 50k fuzz surface. Five equipment
identities preserved. Pain-aware and photo-informed paths unchanged in contract
shape; only honest coverage/carry policy corrected.

## Final verdict

**Phase 7 Completion PASS.** Stop before Phase 7B.
