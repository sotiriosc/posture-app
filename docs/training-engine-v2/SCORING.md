# Training Engine V2 Scoring

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Foundation Contract

The foundation does not implement final candidate ranking behavior. It defines an inspectable scoring contract:

```ts
ScoreComponent {
  id
  family
  value
  rawValue
  weight
  unnormalizedWeight
  weightedContribution
  reason
  reasonCode
  source
  assessmentInfluence?
  assessmentRelevance?
}
```

`value` and `rawValue` are the raw component score after component-local clamping. `weight` is the normalized aggregate weight used to reproduce the final score. `unnormalizedWeight` is the configured family weight before normalization. `weightedContribution` is `rawValue * weight`.

`CandidateScore` is a named list of components plus an aggregate. Foundation tests still cover the original placeholder aggregate; Candidate Intelligence uses `weighted_mean_candidate_intelligence_v0`. The aggregate exposes `totalWeight`, `unroundedValue`, and `weightNormalization` so score reports do not require implicit math.

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

## Assessment Relevance Scoping

Assessment influence is applied only after hard eligibility has established that an exercise is a truthful candidate for the requested training need.

Role/training-need truth includes:

- requested training role;
- requested session section;
- requested movement role;
- requested target muscles where supplied.

Assessment can rank among truthful candidates. It cannot create role relevance. A squat/hinge candidate cannot become a horizontal-push or horizontal-pull candidate because it overlaps a posture finding by body region.

`assessmentFit` and `alignmentFit` now share a bounded assessment-relevance trace:

```ts
AssessmentRelevanceTrace {
  signalId
  candidateId
  requestedRole
  relevance
  relevanceReasonCode
  relevanceReason
  signalInterpretation {
    confidence
    priority
    severity
    severitySource
    deficitMagnitude
    evidence
  }
  featureMatches {
    assessmentFeature
    assessmentFeatureSource: explicit | normalized_from_signal | unknown
    candidateFeature
    candidateFeatureLevel
    candidateFeatureReviewStatus
    candidateFeatureProfileReviewStatus
    featureMatch: strong | moderate | weak | low_expression | conflict | unknown
    featureReason
  }
  featureDevelopment {
    assessmentFeature
    featureMatch
    featureEmphasisLevel
    featureEmphasisSource
    featureReviewStatus
    overallTaskDemand
    overallTaskDemandSource
    featureChallengeDemand
    featureChallengeDemandSource
    featureCapabilityEstimate
    featureCapabilitySource
    featureCapabilityEvidenceQuality
    featureCapabilityPriorSource
    featureSpecificEvidenceSources
    featureSpecificHistorySupport
    featureDemandCapabilityMatch
    evidence
  }
  relationship
  relationshipReason
  demandCapability {
    dimension
    candidateDemand // number when known, null when unknown
    candidateDemandSource {
      level
      value
      source
      reviewStatus
      evidence
    }
    currentCapability
    capabilityEstimate {
      value
      estimateSource
      contributingSources
      evidenceQuality
      evidence
    }
    phaseIntentDemand
    phaseIntentSource
    developmentalValue
    match
    evidence
  }
  confidence
  priority
  direction
  boundedInfluence
  assessmentContribution
  alignmentContribution
  contributesTo
}
```

`assessmentFit` owns general compatibility with normalized assessment findings. `alignmentFit` owns the specific alignment/control effect for the candidate. When the same signal contributes to both, its single bounded influence is split between the two components rather than added twice.

Assessment relevance and assessment relationship are intentionally separate:

- relevance answers whether the finding belongs in this candidate's context;
- relationship answers whether the candidate supports control, reduces excess demand, provides appropriate exposure, develops the priority, conflicts with the priority, exceeds current capability, or remains neutral;
- demand/capability compares candidate demand, estimated current capability, and phase intent demand by dimension instead of using a single generic difficulty number;
- confidence scales trust in the influence budget, not estimated physical capability;
- severity/deficit magnitude is represented separately from confidence and priority. Existing fixtures without severity use a documented conservative `unknown` default.
- capability provenance is visible through `estimateSource`, `contributingSources`, and `evidenceQuality`; movement-role-matched training history can contribute inferred capability evidence, while low-quality capability evidence limits bounded assessment/alignment influence;
- history recency is deterministic: `CandidateRequest.evaluationContext.asOf` is the only evaluation time used by the engine. If `asOf` is absent or unparsable, timestamped history falls back to `no_recency` rather than reading the system clock;
- unknown exercise mechanics use `candidateDemand: null` and `match: not_applicable`, so unknown does not silently become zero demand, easy, safe, ideal, or inappropriate.

## Feature-Specific Scapular Semantics

Scapular assessment findings now have a small normalized feature layer. The current contract supports:

- `serratus_or_protraction_control`
- `upward_rotation_control`
- `retraction_control`
- `external_rotation_or_cuff_control`
- `loaded_scapular_stability`

Generic scapular findings still work: a signal with `movementRole: "scapular_control"` and no feature-specific evidence may use broad movement-role relevance after training-need truth is established.

Feature-specific scapular findings use a stricter order:

1. hard training-need truth;
2. signal classification;
3. normalized feature extraction;
4. broad scapular/upper-body domain check;
5. candidate-specific feature matching from `exercise.mechanics.scapularMechanics`;
6. overall scapular task demand/capability context;
7. feature challenge/capability relationship when feature challenge is explicitly modeled;
8. bounded influence.

That order prevents `movementRole: "scapular_control"` from short-circuiting candidate-specific mechanics when a signal also carries feature-specific meaning.

Normalization is conservative:

- explicit `assessmentFeatures` on `AssessmentSignal` produce `assessmentFeatureSource: explicit`;
- `movementRole: "scapular_control"` or another scapular/shoulder signal plus `muscleGroup: "serratus"` derives `serratus_or_protraction_control`;
- a scapular/shoulder signal plus `muscleGroup: "rotator_cuff"` derives `external_rotation_or_cuff_control`;
- a scapular/shoulder signal plus `muscleGroup: "upper_back"` or `muscleGroup: "rear_delts"` derives `retraction_control`;
- shoulder region alone does not derive upward rotation, cuff control, loaded stability, or any other fine feature;
- insufficient evidence leaves the feature list empty and preserves generic behavior.

Candidate feature matching reads the existing scapular mechanics fields:

| Assessment Feature | Candidate Field |
| --- | --- |
| `serratus_or_protraction_control` | `scapularMechanics.serratusContribution` |
| `upward_rotation_control` | `scapularMechanics.upwardRotationControl` |
| `retraction_control` | `scapularMechanics.retractionDemand` |
| `external_rotation_or_cuff_control` | `scapularMechanics.externalRotationContribution` |
| `loaded_scapular_stability` | `scapularMechanics.loadedScapularControl` |

Feature match determines feature relevance, not automatic score direction. The current `scapularMechanics` fields are treated as feature emphasis/expression metadata. They answer whether the exercise meaningfully exposes serratus/protraction, upward rotation, retraction, cuff/external rotation, or loaded scapular stability. They do not automatically define the difficulty of executing that feature.

Feature-specific traces now separate four concepts:

- `featureEmphasisLevel` says how much the exercise expresses the assessment feature.
- `overallTaskDemand` keeps generic `mechanics.demands.scapular_control` visible as the task's overall control requirement.
- `featureChallengeDemand` is the difficulty of executing that exact feature in the exercise. It is currently `unknown/not_modeled` unless future reviewed metadata explicitly provides it.
- `featureCapabilityEstimate` scopes assessment severity to the feature-specific capability prior rather than reducing broad/global scapular task capability.

If feature relevance is strong/moderate/low but `featureChallengeDemand` is unknown, the feature demand/capability match remains `not_applicable`; the developmental relationship remains neutral; and bounded influence is zero. Low feature expression is labeled `low_expression`, not `conflict`. `conflict` is reserved for actual opposing or contraindicating mechanics if those are modeled later. Unknown or `needs_review` feature metadata is traced explicitly and is not promoted into high-confidence certainty.

Feature capability provenance is deliberately stricter than overall task capability provenance. Overall scapular task capability may use movement-role-matched training history. Feature capability does not, because current `ExerciseHistoryEvent` values carry only `movementRole` and not normalized assessment features. Until feature-aware history exists at that boundary, feature-specific history support is traced as `unavailable_not_modeled`; generic `scapular_control` history cannot become retraction, serratus, upward-rotation, cuff, or loaded-scapular-stability evidence. The feature capability estimate is therefore a weak `phase_experience_default` prior unless the assessment signal supplies feature-specific severity, which is traced through `featureSpecificEvidenceSources`. Default conservative unknown severity is not feature-specific evidence and does not reduce the feature capability prior.

## Assessment Semantics Modules

Assessment semantics are split by training responsibility:

| Module | Responsibility |
| --- | --- |
| `candidate/scoring/assessment/classifySignal.ts` | Classifies assessment signals into trunk, scapular, lower-body, or fallback demand dimensions. |
| `candidate/scoring/assessment/features.ts` | Normalizes assessment features and matches them against candidate scapular mechanics. |
| `candidate/scoring/assessment/featureDevelopment.ts` | Separates feature emphasis, overall task demand, feature challenge demand, and feature-scoped capability in traces. |
| `candidate/scoring/assessment/specificity.ts` | Calculates candidate/request specificity after training-role truth is established. |
| `candidate/scoring/assessment/relevance.ts` | Decides whether a signal is relevant to this candidate in this requested role. |
| `candidate/scoring/assessment/candidateDemand.ts` | Reads explicit exercise demand metadata or known structured loading fields. |
| `candidate/scoring/assessment/athleteCapability.ts` | Estimates current capability from phase, weak experience prior, severity, pain context, and movement-role-matched history while exposing source/evidence quality. |
| `candidate/scoring/assessment/demandCapabilityMatch.ts` | Compares candidate demand, capability, and phase intent. |
| `candidate/scoring/assessment/developmentalRelationship.ts` | Interprets below/match/challenge/exceeds states by section, role, pain, fatigue, and goal context. |
| `candidate/scoring/assessment/influenceBudget.ts` | Applies relevance, confidence, priority, relationship, and capability evidence quality to bounded assessment/alignment contributions. |
| `candidate/scoring/assessment/trace.ts` | Assembles the developer-facing trace. |
| `candidate/scoring/assessmentRelevance.ts` | Thin orchestrator retained for existing imports. |

## Explicit Mechanics

Mechanical truth lives in `ExerciseDefinition.mechanics`:

- `support.externalSupport`
- `support.bodySupport`
- independent demand annotations for `trunk_control`, `scapular_control`, `stability`, `coordination`, `range`, and `joint_control`;
- optional `scapularMechanics` annotations for serratus contribution, upward rotation, retraction, external rotation, loaded scapular control, and preparation suitability.

Candidate scoring does not infer support by searching summary, equipment labels, or coaching text. Unknown mechanics remain `unknown` with `needs_review` status.

Relevance reason codes:

- `ASSESSMENT_ROLE_RELEVANT`
- `ASSESSMENT_MOVEMENT_RELEVANT`
- `ASSESSMENT_STABILITY_RELEVANT`
- `ASSESSMENT_JOINT_RELEVANT`
- `ASSESSMENT_NOT_RELEVANT`
- `ASSESSMENT_SUPPORTS_CONTROL`
- `ASSESSMENT_REDUCES_EXCESS_DEMAND`
- `ASSESSMENT_APPROPRIATE_EXPOSURE`
- `ASSESSMENT_DEVELOPS_PRIORITY`
- `ASSESSMENT_UNDER_CHALLENGES_DEVELOPMENT`
- `ASSESSMENT_EXCEEDS_CAPABILITY`
- `ASSESSMENT_NEUTRAL_RELATIONSHIP`

Body-region overlap alone is not enough to establish assessment relevance.

## Deliberately Not Done

These weights are not final exercise-science tuning. No giant score matrix exists. Hard exclusions remain explicit rejection reasons rather than hidden negative scores.
