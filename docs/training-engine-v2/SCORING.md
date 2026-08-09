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

`CandidateScore` is a named list of components plus a foundation placeholder aggregate. The aggregate exists only so tests can prove deterministic, structured decomposition.

## Component Families

The contract can represent:

- role fit;
- goal fit;
- session intent;
- weekly need;
- assessment relevance;
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

No final weights are tuned. No giant score matrix exists. Hard exclusions remain explicit rejection reasons rather than hidden negative scores.
