# Training Engine V2 Scoring

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Foundation Contract

The foundation does not implement final candidate ranking behavior. It defines an inspectable scoring contract:

```ts
ScoreComponent {
  id
  family
  value
  reason
  reasonCode
  source
  assessmentInfluence?
}
```

`CandidateScore` is a named list of components plus an aggregate. Foundation tests still cover the original placeholder aggregate; Candidate Intelligence uses `weighted_mean_candidate_intelligence_v0`.

## Component Families

The contract can represent:

- role fit;
- goal fit;
- muscle target fit;
- session intent;
- weekly need;
- assessment relevance;
- alignment fit;
- pain suitability;
- experience suitability;
- phase suitability;
- stability fit;
- skill fit;
- progression value;
- continuity value;
- loadability;
- stimulus potential;
- fatigue cost;
- joint cost;
- equipment practicality;
- session synergy.

Candidate Intelligence v0 emits these exercise-level components:

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

`weekly_need` and `session_synergy` remain contract families for later whole-week and whole-session optimizers. They are weighted in the central config but not emitted by the candidate-only ranker.

## Candidate Intelligence v0 Weights

Weights live in `DEFAULT_CANDIDATE_SCORING_WEIGHTS`. They are deliberately modest: hard gates belong to eligibility, while scoring compares legal choices.

| Family | Weight |
| --- | ---: |
| `role_fit` | 1.4 |
| `goal_fit` | 1.1 |
| `session_intent` | 1.0 |
| `weekly_need` | 0.4 |
| `assessment_relevance` | 0.9 |
| `alignment_fit` | 0.9 |
| `pain_suitability` | 1.2 |
| `experience_suitability` | 0.7 |
| `phase_suitability` | 1.0 |
| `stability_fit` | 0.7 |
| `skill_fit` | 0.7 |
| `progression_value` | 0.9 |
| `continuity_value` | 0.9 |
| `loadability` | 0.8 |
| `stimulus_potential` | 0.9 |
| `fatigue_cost` | 0.7 |
| `joint_cost` | 0.8 |
| `equipment_practicality` | 0.6 |
| `session_synergy` | 0.4 |
| `muscle_target_fit` | 1.0 |

Assessment-specific influence is modeled as:

```ts
AssessmentInfluence {
  relevance
  direction: supports | neutral | conflicts
  affectedSignalIds
  confidence
  reasonCode
  reason
}
```

This makes assessment impact visible in candidate score breakdowns without letting low-confidence findings dominate.

## Deliberately Not Done

These weights are not final exercise-science tuning. No giant score matrix exists. Hard exclusions remain explicit rejection reasons rather than hidden negative scores.
