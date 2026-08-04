# Pain lifecycle audit

Investigation date: 2026-08-04  
Branch base: `fix/questionnaire-knee-pain-input` (PR #74 Knees UI)  
Engine hardening branch: `fix/pain-aware-generation-hardening`  
Post-hardening delivery: see `docs/pain-aware-hardening-report.md`.

The coverage matrix below was captured as **pre-hardening truth**. Precedence and path wiring after the pass are summarized in the delivery report.

## Source-of-truth precedence (implemented)

1. Structured `painContraindications` with a non-acute matching canonical token → **hard exclude**.
2. Matching `acute_*` structured tokens → soft caution for questionnaire planning (session may treat acute as hard).
3. Usable structured metadata with no hard match → **do not** hard-exclude from free text.
4. Structured absent, empty, or entirely unmappable → free text may conservatively hard-exclude with audit warning.
5. Free text never overrides valid structured metadata.

Questionnaire pain = persistent planning constraint.  
Session pain = runtime event (exercise + area + severity). Same `CanonicalPainArea` tokens; distinct adaptation paths.

## Safety monotonicity invariant (target)

Once a candidate fails hard pain exclusion for the current context, no later stage (repair, fallback, scoring, coverage, variation, progression, substitution) may reintroduce it without the input context changing.

## Coverage matrix (current truth)

| Input pain area | Canonical token | Questionnaire source | Persisted correctly | Dedicated policy | Hard contraindication path | Soft scoring path | Warm-up path | Session adaptation | Progression protection | Test coverage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neck | `neck` | consumer + gyms | yes (display label) | `PAIN_RULES.neck` | free-text substring (mostly works for "neck") | yes | soft via avoid lists | feedback / ladder | phases + progression | partial |
| upper_back | `upper_back` | consumer + gyms (`Upper back`) | yes | `PAIN_RULES["upper back"]` | free-text broken for plurals/spacing | yes | avoid lists | feedback / ladder | partial | partial |
| lower_back | `lower_back` | consumer + gyms (`Lower back`) | yes | `PAIN_RULES["lower back"]` + intent heavy-hinge avoid | free-text often misses | yes | avoid lists | feedback / ladder | yes (intent) | partial |
| shoulders | `shoulders` | consumer + gyms | yes | `PAIN_RULES.shoulders` + overhead avoid | free-text often misses `"shoulders"` vs `"Shoulder"` | yes | protective injection (upper day) | feedback / ladder | yes | partial |
| hips | `hips` | consumer + gyms | yes | `PAIN_RULES.hips` | free-text often misses | yes | avoid lists | feedback / ladder | partial | partial |
| knees | `knees` | consumer + gyms (`Knees`, PR #74) | yes once selected | `PAIN_RULES.knees` | **broken** for main selection (`"knees"` ∉ `"Knee pain"`) | yes (deprioritize squat) | protective injection (lower day) + structured avoid | feedback / ladder | ladder exact-match fragile (`acute knees` ≠ `knees`) | warmup/golden partial; **no main hard-exclude test** |
| wrists | `wrists` | **none** | n/a | none | catalog tokens only | none | avoid if listed | session only if logged | n/a | catalog only |
| elbows | `elbows` | **none** | n/a | none | catalog tokens only | none | avoid if listed | session only | n/a | catalog only |
| ankles | `ankles` | **none** | n/a | none | catalog tokens only | none | avoid if listed | session only | n/a | catalog only |

## Path map (engine)

| # | Path | File | Pain handling today |
| ---: | --- | --- | --- |
| 1–2 | Questionnaire options | `apps/*/QuestionnaireForm.tsx` | Display labels; Knees added in PR #74 |
| 3 | Persist / sync | localStorage `posture_questionnaire`; `pushTrainingPatch({ questionnaire })` | Pass-through; no enum validation |
| 4 | Canonicalization | `program.ts` `canonicalizePainArea` | Local aliases; not shared with constraints/warmup |
| 5 | `PAIN_RULES` | `program.ts` | Soft preferred/deprioritize tags+patterns |
| 6 | Catalog | `exercises.ts` | `painContraindications` + free-text `contraindications` |
| 7 | Hard filters | `ensureEligibleItem` / scoring | Free-text `contraindicationHitsPainArea` substring |
| 8 | Soft scoring | `scoreExerciseForContextDetailed` | ± from PAIN_RULES; −8 free-text |
| 9 | Repair | contract/coverage/budget repair | Uses eligibility **without** structured pain |
| 10 | Warmup | `warmupPlanner.ts` | Structured `painAreasToAvoid`; knee/shoulder protective inject |
| 11–13 | Regen / cycles | `generateWeeklyProgram` / engine adapter | Passes questionnaire through |
| 14 | Session feedback | feedback contract, session swap tests | Severity → defer/swap/regress |
| 15 | Progression | `progression.ts`, `ladderAdvancement.ts`, `phases.ts` | Pain flag / REG-1a / rung block |
| 16 | Traces | selection reasons, warmup traces | Partial; no structured reason codes |
| 17 | Tests | warmupProtective*, golden regressor, slotDegradation | Knees covered for warmup/ladder soft paths |

## Wrists / elbows / ankles recommendation

- Valid catalog `painContraindications` tokens (high frequency for elbows/wrists).
- No questionnaire input today.
- **Recommendation:** keep as **catalog metadata + session-only feedback** (do not add onboarding checkboxes in this PR). Revisit advanced secondary input only after structured hard exclusion is stable for the six questionnaire areas.

## Gaps this hardening closes

1. Central `painModel` with one evaluator.
2. Structured `painContraindications` authoritative in main eligibility.
3. Repair/fallback/substitution/ladder use the same evaluator (safety monotonicity).
4. Legacy free-text only when structured unusable; word-boundary match + warnings.
5. Explainable reason codes.
6. Focused regression tests including knees hard exclusion.
