# Pain-aware generation hardening — delivery report

Branch: `fix/pain-aware-generation-hardening` (stacked on `fix/questionnaire-knee-pain-input` / PR #74)  
Base commit (Knees UI): `4e6f5aa`  
Date: 2026-08-04  
Status: **ready for review; do not merge** until PR #74 and this PR are validated.

## Source of truth and precedence

1. Structured `painContraindications` with a **non-acute** matching canonical area → **hard exclude**.
2. Structured token with only the `acute` modifier for a matching area → **soft caution** for questionnaire / planning (`deprioritized:pain_policy:acute_caution:<area>`). Session paths may pass `{ treatAcuteAsHard: true }`.
3. Usable structured metadata with no hard match → **do not** hard-exclude from free text.
4. Structured absent / empty / entirely unmappable → legacy free-text may conservatively hard-exclude (`legacy_text_contraindication_used:<area>`).
5. Free text never overrides valid structured metadata.

Questionnaire pain = persistent planning constraint (display labels persisted; canonicalize at engine boundaries).  
Session pain = runtime event; shares `CanonicalPainArea` but must not collapse into questionnaire adaptation automatically.

## Safety monotonicity

Once a candidate fails hard pain exclusion for the current context, repair / fallback / scoring / coverage / variation / progression / substitution must not reintroduce it without the input context changing. Enforced via:

- `isExerciseEligibleForProgramContext` (central gate)
- `ensureEligibleItem` + final `normalizeWeekForSelectionContext` pass
- Rescue bypasses (phase-bridge / slot purity) that still require `!exerciseHardExcludedForPain`
- Ladder next-rung eligibility via `evaluateHardPainExclusion`

## Engine paths audited / wired

| Path | Uses central evaluator |
| --- | --- |
| `isExerciseEligibleForProgramContext` | yes |
| `ensureEligibleItem` / uniqueness / baseline fallback | yes |
| Contract / coverage / budget repair candidates | via eligibility |
| Substitution ranking | hard-drop via score + eligibility |
| `enforceHigherFrequencyFinalMainIntegrity` rescue | pain check before bypass |
| `findLowerSlotPurityReplacement` | pain check before bypass |
| Final week normalize (post slot-truth) | yes |
| `warmupPlanner` avoid lists | `painAreasConflict` / canonical |
| `ladderAdvancement.checkNextRungEligibility` | yes |
| `constraints.ts` canonicalization | `painModel` |
| Soft `PAIN_RULES` / knee novelty tags | soft only (no squat boost under knees) |

## Before / after eligibility flow

```
normalize inputs (canonicalizePainAreas)
→ validate candidate metadata
→ hard pain exclusion (evaluateHardPainExclusion)
→ other eligibility (equipment, phase, day intent, blocks)
→ soft pain scoring (PAIN_RULES, acute caution reasons)
→ selection
→ repair/fallback/substitution through the same gate
→ final normalizeWeekForSelectionContext
```

Previously: main hard filter used free-text substring (`contraindicationHitsPainArea`), which missed plurals like `knees` vs `"Knee pain…"`, while structured tokens were ignored in the primary gate.

## Catalog integrity findings (justified edits only)

Regenerate: `npm run audit:pain-catalog` → `docs/pain-catalog-integrity-report.md`.

Findings that drove edits:

1. **Pattern inference** (`inferPainContraindicationsForExercise`) stamped family-wide unmodified `low back` / `knees` / `shoulders` on mains missing explicit tags. Under authoritative hard exclusion that emptied movement families. Defaults now use `acute_*` caution tags.
2. **Acute vs hard:** questionnaire planning treats `acute_*` as soft; unmodified tokens remain hard. Session can opt into acute-as-hard.
3. **Targeted authored demotions** (free-text = load/range management, not absolute ban), including:
   - Shoulder/neck therapeutic + press work: `shoulders`/`neck` → `acute shoulders`/`acute neck` (e.g. pike-pushup, prone-* raises, face-pulls, DB/machine shoulder press, band shoulder accessories)
   - Common gym hinges/squats used under questionnaire lower-back: `low back` → `acute low back` (e.g. machine-leg-press, barbell-hip-thrust, DB RDL variants, step-up/lunge)
4. **Band-only + low-back hinge ordering:** prefer `band-rdl` from skill phase onward so phase-demand coherence is preserved when soft acute tags make bodyweight surrogates newly eligible.

No blind mass catalog rewrite. Hard `knees` (e.g. `machine-leg-press`) remains authoritative for the Knees questionnaire fix.

## Known legacy-text fallbacks

Exercises with no usable structured tokens still rely on word-boundary free-text matching (see integrity report `legacy_text_only`). Each use emits `legacy_text_contraindication_used:*`.

## Area parity / wrists–elbows–ankles

| Area | Questionnaire | Hard structured | Soft PAIN_RULES | Warmup | Session |
| --- | --- | --- | --- | --- | --- |
| neck, upper_back, lower_back, shoulders, hips, knees | yes (shared labels) | yes | yes | yes | yes |
| wrists, elbows, ankles | **no UI (this PR)** | catalog tokens only | none dedicated | avoid if listed | **recommended path** |

**Recommendation (option D/C):** keep wrists/elbows/ankles as catalog metadata + session feedback only. Do not add onboarding checkboxes until the six-area hard gate is stable in production. Same `CanonicalPainArea` / evaluator already accepts those tokens when present in feedback or future inputs.

## Knee soft policy

- Hard-exclude only unmodified catalog knee contraindications (e.g. `machine-leg-press`).
- `acute knees` (e.g. `goblet-squat`) = soft caution; squat pattern deprioritized via `PAIN_RULES.knees`, not blanket-banned.
- Novelty / priority tags under knees prefer hinge/glute/core (no squat boost).
- Protective knee warmup injection retained (`warmup_added:pain_protection:knees`).

## Tests and commands run

| Command | Result |
| --- | --- |
| `npm run audit:pain-catalog` | wrote integrity report |
| vitest painModel / painHardExclusion / painKneePolicy / painCatalogIntegrity / golden anchors | pass |
| `npm run test:critical` (includes new pain suites) | **342/342 pass** |

New / updated suites:

- `packages/engine/tests/unit/painModel.test.ts`
- `packages/engine/tests/unit/painHardExclusion.test.ts`
- `packages/engine/tests/unit/painKneePolicy.test.ts`
- `packages/engine/tests/unit/painCatalogIntegrity.test.ts`
- `packages/engine/tests/unit/painQuestionnaireParity.test.ts`

## Behavior intentionally not changed

- No wrists/elbows/ankles questionnaire UI
- No auth / billing / Stripe / deploy / posture-analysis changes
- Persist questionnaire display labels as today (canonicalize only at engine boundaries)
- Soft PAIN_RULES area-specific preferences retained
- User-facing copy remains non-diagnostic

## Manual acceptance (local)

Env: `USER_STORE_DRIVER=memory`, `TRAINING_STORE_DRIVER=disabled`.

1. Select **Knees** in consumer or gyms questionnaire → persist → generate week.
2. Confirm audit/eligibility reasons show hard excludes for unmodified knee tokens; soft caution for acute-only.
3. Confirm lower-body work remains; squat pattern may appear only when not hard-excluded.
4. Simulate session knee pain → substitution / ladder hold should not reintroduce hard-excluded same-area work.

## Delivery

- Keep PR #74 narrow (Knees UI).
- This branch is the engine hardening PR (stacked).
- **Do not merge** either PR from this workstream without explicit human approval.
