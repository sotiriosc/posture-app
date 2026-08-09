# Training Engine V2 Candidate Intelligence Review

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Scope Completed

Candidate Intelligence now performs this deterministic pipeline:

1. receive a `CandidateRequest`;
2. interpret athlete, phase, need, equipment, pain, history, continuity, assessment, alignment, and fatigue context;
3. apply modular hard eligibility components;
4. score only legal candidates with inspectable score components;
5. sort legal candidates deterministically;
6. return ranked candidates, hard rejections, score breakdowns, assessment/alignment influence, pipeline snapshots, and a `DecisionTrace`.

This phase does not generate sessions, weeks, final sets/reps, phase advancement, or Praxis integration.

## Hard Eligibility Modules

- `equipment_eligibility`
- `setup_eligibility`
- `personal_block_eligibility`
- `contraindication_eligibility`
- `capability_eligibility`
- `role_eligibility`
- `pain_review_eligibility`

Hard rules answer only whether an exercise is legal. Moderate pain currently creates warnings and scoring influence unless an explicit hard contraindication exists.

## Score Modules

- `role_fit`
- `goal_fit`
- `session_intent_fit`
- `muscle_target_fit`
- `assessment_fit`
- `alignment_fit`
- `pain_suitability`
- `experience_fit`
- `phase_fit`
- `stability_fit`
- `skill_fit`
- `progression_value`
- `continuity_value`
- `loadability`
- `stimulus_potential`
- `fatigue_cost`
- `joint_cost`
- `equipment_practicality`

Each component produces a 0-10 value, reason code, human-readable reason, source, and optional assessment influence.

## Controlled Scenarios

The scenario corpus in `src/data/candidateScenarios.ts` currently includes:

- `horizontal-pull-gym-neutral`
- `horizontal-pull-low-back-discomfort`
- `horizontal-pull-low-confidence-scapular`
- `scapular-activation-high-confidence`
- `horizontal-pull-productive-continuity`
- `horizontal-pull-plateau-replacement`
- `horizontal-push-phase-1`
- `horizontal-push-phase-3`
- `horizontal-push-shoulder-discomfort`
- `horizontal-push-no-bench`
- `lower-squat-phase-1`
- `lower-squat-phase-3`
- `lower-hinge-moderate-low-back-pain`
- `lower-hinge-capability-missing`
- `home-dumbbells-bench-horizontal-pull`
- `home-dumbbells-no-bench-horizontal-pull`
- `anchored-bands-horizontal-pull`
- `bands-without-anchor-horizontal-pull`
- `loop-bands-only-horizontal-pull`
- `bodyweight-personal-block-push-up`
- `rear-delt-accessory-scapular-priority`
- `horizontal-pull-fatigue-context`

## Representative Ranking Examples

| Scenario | Key Result |
| --- | --- |
| `horizontal-pull-low-back-discomfort` | `chest-supported-dumbbell-row` ranked above `one-arm-dumbbell-row`; pain and joint-cost components explain the difference. |
| `horizontal-push-phase-1` | `machine-chest-press` ranked first because Phase 1 favors supported, lower-complexity pressing. |
| `horizontal-push-phase-3` | `dumbbell-bench-press` ranked first because Phase 3 increases the value of loadability and progression. |
| `scapular-activation-high-confidence` | `band-face-pull` ranked first with visible assessment and alignment boosts. |
| `horizontal-pull-productive-continuity` | `chest-supported-dumbbell-row` ranked first when current/productive/progression-ready. |
| `horizontal-pull-plateau-replacement` | `chest-supported-dumbbell-row` dropped below alternative rows when plateau and failed progression were present. |
| `home-dumbbells-no-bench-horizontal-pull` | `chest-supported-dumbbell-row` was hard-rejected for equipment while `one-arm-dumbbell-row` remained legal. |
| `lower-hinge-capability-missing` | `dumbbell-romanian-deadlift` was hard-rejected for missing `hinge-control`; `cable-pull-through` remained available. |

## Assessment And Alignment

Low-confidence assessment signals remain visible but do not create alignment priorities. Confirmed, high-confidence priorities create `AlignmentPriority` records and influence score components through:

- `assessment_fit`
- `alignment_fit`
- pipeline snapshot `interpreted_assessment`
- pipeline snapshot `alignment_priorities`
- `DecisionTrace.topCandidateScores`

## Phase And Continuity

Phase is represented as developmental appropriateness, not simple difficulty. The same horizontal-push pool produces different rankings in Phase 1 and Phase 3.

Continuity is also not automatic repetition. Productive current work receives a positive `continuity_value`; plateau, failed progression, or pain response reduce that value and can justify replacement.

## Deliberately Rejected

- fixed workout templates patched after the fact;
- beginner equals machine-only;
- advanced equals automatically harder exercises;
- random novelty;
- giant hidden penalties used as fake hard gates;
- repeated program repair after poor selection;
- old-engine score blobs or catalog-specific special cases.

## Human Review Needed

- How strongly moderate pain should demote an otherwise good exercise before it becomes a hard stop.
- Which stress-tag overlaps should be clinically equivalent versus distinct.
- Whether some movement-role mismatches should become candidate-pool filtering rather than low score.
- Final weights for pain, joint cost, phase fit, and continuity.
- Exercise-science review of the two new reference exercises: `one-arm-dumbbell-row` and `machine-row`.
- Whether assessment priorities should influence main lift selection only directly, or also through preparation dependencies once session composition begins.

## Verification

Current commands:

```bash
npm run build --workspace=@praxis/training-engine-v2
npm run test --workspace=@praxis/training-engine-v2
```
