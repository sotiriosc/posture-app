# Pain-aware generation hardening — delivery report

Branch: `fix/pain-aware-generation-hardening` (stacked on `fix/questionnaire-knee-pain-input` / PR #74)  
PR: https://github.com/sotiriosc/posture-app/pull/75  
Base commit (Knees UI): `4e6f5aa`  
Date: 2026-08-04  
Status: **defects fixed; ready for re-review; do not merge** without explicit human approval.

## Source of truth and precedence

1. Structured `painContraindications` with a **non-acute** matching canonical area → **hard exclude**.
2. Structured token with only the `acute` modifier for a matching area → **soft caution** for questionnaire / planning (`deprioritized:pain_policy:acute_caution:<area>`). Session paths may pass `{ treatAcuteAsHard: true }`.
3. Usable structured metadata with no hard match → **do not** hard-exclude from free text.
4. Structured absent / empty / entirely unmappable → legacy free-text may conservatively hard-exclude (`legacy_text_contraindication_used:<area>`).
5. Free text never overrides valid structured metadata.

Questionnaire pain = persistent planning constraint (display labels persisted; canonicalize at engine boundaries).  
Session pain = runtime event; shares `CanonicalPainArea` but must not collapse into questionnaire adaptation automatically.

## Defects discovered after PR #75 review (and resolutions)

### CRITICAL 1 — hard-excluded original could survive `ensureEligibleItem`

**Defect:** When no same-category replacement existed, the no-replacement path returned the original item (`if (!anyPainSafe) return item`) even when `failsPainFilter` was true — violating safety monotonicity.

**Resolution:**

- `ensureEligibleItem` never returns a hard-excluded original unchanged.
- Order: ranked substitution → baseline (catalog-scoped) → same-category widen → any section-legal widen → **omit** with  
  `unresolved_slot:no_pain_safe_candidate:<area> (dropped <exerciseId>)`.
- Omits land in `day.degradationNotes` via `normalizeWeekForProgramConstraints`.
- Safety outranks slot completeness.

### CRITICAL 2 — substitution relied on finite score penalty

**Defect:** `scoreSubstitutionCandidate` previously applied a −12 penalty to hard-excluded candidates (finite score is not a safety boundary).

**Resolution:**

- Hard-excluded candidates are **filtered out before scoring** in `rankSubstitutionCandidates` via `evaluateHardPainExclusion`.
- No finite pain penalty remains in `scoreSubstitutionCandidate`.
- Eligibility gate still independently rejects hard-excluded candidates.

### Acute token consistency (warmup)

**Decision (explicit):** Warmup / prep avoid lists treat `acute_*` as **hard** (`treatAcuteAsHard: true` by default).

**Rationale:** Protective prep should not load an area the user already flagged, even acutely. This intentionally differs from questionnaire exercise planning (acute = soft caution).

**Implementation:** `isPainEligibleAgainstAvoidList` routes through `evaluateHardPainExclusion` with explicit `treatAcuteAsHard` (default true). `warmupPlanner.isWarmupItemPainEligible` passes `{ treatAcuteAsHard: true }`.

## Safety monotonicity (current)

Once a candidate fails hard pain exclusion for the current context, repair / fallback / scoring / coverage / variation / progression / substitution must not reintroduce it without the input context changing. Enforced via:

- `isExerciseEligibleForProgramContext` (central gate)
- `ensureEligibleItem` (omit-or-replace; never retain hard-excluded original)
- Final `normalizeWeekForSelectionContext` / `normalizeWeekForProgramConstraints`
- Substitution hard-drop before score
- Rescue bypasses that still require pain checks
- Ladder next-rung eligibility via `evaluateHardPainExclusion`

## Engine paths audited / wired

| Path | Uses central evaluator |
| --- | --- |
| `isExerciseEligibleForProgramContext` | yes |
| `ensureEligibleItem` / uniqueness / baseline fallback | yes (omit on empty safe pool) |
| Contract / coverage / budget repair candidates | via eligibility |
| Substitution ranking | **hard-drop before score** |
| `enforceHigherFrequencyFinalMainIntegrity` rescue | pain check before bypass |
| `findLowerSlotPurityReplacement` | pain check before bypass |
| Final week normalize (post slot-truth) | yes (supports omit + degradationNotes) |
| `warmupPlanner` avoid lists | `evaluateHardPainExclusion` via avoid-list helper, **acute-as-hard** |
| `ladderAdvancement.checkNextRungEligibility` | yes |
| Soft `PAIN_RULES` / knee novelty tags | soft only |

## Catalog change review

Full machine-readable demotion table: [`docs/pain-catalog-hard-to-acute-demotions.md`](./pain-catalog-hard-to-acute-demotions.md).

Summary:

- Inference defaults demoted family-wide hard stamps → `acute_*` (metadata was too broad).
- 26 authored exercises with targeted hard→acute demotions justified by free-text load/ROM language.
- Hard `knees` retained on `machine-leg-press` (Knees questionnaire fix).
- Empty-family cases resolved by inference redesign + widen/omit architecture — not by mass demotion alone.

## Tests proving the five acceptance criteria

Suite: `packages/engine/tests/unit/painSafetyMonotonicity.test.ts` (wired into `test:critical`).

1. No hard-excluded original survives when no replacement exists → omit + reason.
2. No hard-excluded substitution can win by score → filtered before score; highest-trait contra never selected.
3. Final normalize cannot preserve an unresolved contraindicated item → injected `machine-leg-press` removed.
4. Empty safe pools produce explicit degradation/warning → `degradationNotes` + omit reason.
5. Acute behavior context-explicit → planning soft vs warmup hard defaults.
6. Multi-area scarce pools remain safe → Shoulders+Knees+Lower back generation.
7. Critical suite green → see validation table.

## Validation results (2026-08-04)

| Command | Result |
| --- | --- |
| vitest `painSafetyMonotonicity` | **12/12 pass** |
| vitest painModel / painHardExclusion / related | pass |
| `npm run test:critical` | **354/354 pass** (was 342; +12 safety tests) |
| `npm run test:full` | **1017 pass / 8 fail / 133 files pass** — **same 8 failures on pre-fix HEAD** (not introduced by this defect fix). Failures are structural/pain-profile matrix tests that still expect fixed main counts / identities under scarce pain pools. |
| `tsc -p packages/engine` | pre-existing test typing noise (QuestionnaireForm path aliases, etc.); no new production errors attributed to this change |
| `npm run build --workspace=apps/gyms` | **pass** |
| `npm run build --workspace=apps/consumer` | **pass** (local install of missing `@vercel/analytics` from #73; not a pain-engine change) |

Pre-existing full-suite failures (unchanged vs `1af7b14` before this defect fix):

- `program.test.ts` — pain areas influence priorities
- `programFuzz.test.ts` — structural safety under random questionnaires
- `programHigherFrequencyContracts.test.ts` — 2 band pain Phase 1 hinge cases
- `programMatrix.test.ts` — core structure invariants
- `programSelectionAudit.test.ts` — pain-aware main identity
- `programSplitContractRepair.test.ts` — 4-day required main patterns
- `scenarioMatrix.test.ts` — expected main count under pain

These are orthogonal follow-ups (slot-count contracts vs safety-first omit). **Safety outranks slot completeness** by design for hard exclusions.

## Delivery

- Keep PR #74 narrow (Knees UI).
- This branch is the engine hardening PR (stacked) — https://github.com/sotiriosc/posture-app/pull/75
- **Do not merge** either PR from this workstream without explicit human approval.
