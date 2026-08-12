# Actual User Personalization and Counterfactual Contract

Status: binding Candidate Intelligence contract, 2026-08-12.

Candidate Intelligence is not an experience-plus-equipment template. It consumes relevant structured user state. Two users may legitimately converge on the same result when their active facts imply the same legal pool and score; that outcome is `JUSTIFIED_CONVERGENCE`, not a failure of personalization. Artificial uniqueness is forbidden.

## Field Ownership Audit

| Field | Classification | Current consequence / owner |
| --- | --- | --- |
| `CandidateRequest.goal` | active | sole candidate goal authority; goal fit, loadability, stimulus, and pain-aware context |
| legacy `CandidateNeed.goal` | intentionally inert | diagnostic compatibility field; conflicts are exposed by `candidateGoalConflict` |
| athlete experience | active | experience/demand suitability |
| preferred/disliked exercise IDs | active | bounded continuity-family preference/reconsideration consequence |
| variety preference | future-consumed | Composer diversity policy; no candidate effect |
| preference notes and all prose notes | intentionally inert | audit context only; no text inference |
| availability fields | future-consumed | Composer/session/week feasibility signatures only |
| athlete ID and label | intentionally inert | trace identity only |
| requested role/section, movement, action, muscle relationship, body region | active where receiver exists | hard legality and bounded fit components; body region remains assessment/pain context rather than a standalone score |
| assessment priority/confidence/features | active | scoped assessment and alignment influence |
| pain and contraindications | active when anatomically/stress relevant | rejection, review, pain fit, and joint cost; irrelevant pain is inert |
| training safety | active at readiness boundary | session-level readiness; no invented candidate distinction |
| equipment capabilities | active | hard legality and practicality |
| current/previous/productive/stable continuity | active | bounded continuity support |
| plateau/failure/pain response/personal block | active | bounded reconsideration or hard block |
| structured tolerated/adverse response | active | bounded identity-specific continuity/reconsideration; never auto-progresses or auto-replaces |
| phase intent | active | phase, loading, progression-axis, and demand context; `PhaseIntent.primaryGoal` remains developmental/inert |
| fatigue signals/history | active when relevant | fatigue cost and assessment capability context |

## Fixed-Shell Cohort

The reviewed cohort holds candidate pool, need shell, phase, and equipment constant and varies at least these 12 athlete states: novice, advanced, strength goal, posture goal, relevant knee pain, irrelevant neck pain, high-confidence assessment priority, low-confidence priority, preferred candidate, disliked candidate, productive continuity, plateau/adverse response, blocked candidate, and systemic fatigue. Shared winners are recorded as `JUSTIFIED_CONVERGENCE` whenever the changed fact does not distinguish the legal candidates.

## One-Variable Counterfactual Matrix

| Pair | Expected candidate consequence |
| --- | --- |
| goal | score/rank change where candidate goal properties differ |
| relevant pain | legality/readiness/score change |
| irrelevant pain | none; justified convergence |
| assessment priority | scoped assessment score change |
| assessment confidence | influence magnitude/relationship change |
| safety | training-readiness change, not fabricated candidate rank |
| continuity | identity-specific score change |
| plateau | identity-specific reconsideration score change |
| tolerated response | identity-specific continuity score increase |
| adverse response | identity-specific reconsideration score decrease |
| personal block | hard legality change |
| athlete ID | none |
| label/prose notes | none |
| availability | none in Candidate Intelligence |
| variety preference | none in Candidate Intelligence |
| equipment | legal-pool/practicality change |

The consequence may be a legality delta, score/component delta, rank delta, readiness delta, or explicit trace delta. A winner change is not required.

## Future Composer Acceptance Signatures

Documentation-only signatures: `composeSession(candidateResults, availability, sessionIntent)`, `composeWeek(sessionOptions, daysPerWeek, preferredTrainingDays)`, and `applyVarietyPolicy(legalRankings, varietyPreference, recentExposure)`. Candidate Intelligence must not implement those owners, reserve exercise IDs, award set credits, or infer availability/variety effects early.

## P0 Whole-Body Fixed-Shell Results

The fixed-shell P0 cohort holds athlete, experience, phase, evaluation time, and unrelated context constant. One-variable direct calf, adductor, abductor, cuff, home knee-flexion, ankle-preparation, hinge-preparation, and single-leg-preparation requests each admit only their truthful P0 row. Removing the direct need removes that relevance. Loaded main hinge and loaded single-leg accessory requests do not admit the low-load rehearsal rows as strength substitutes. Shared full-gym hamstring outcomes are `JUSTIFIED_CONVERGENCE` when both legal rows express the same requested primary hamstring/knee-flexion truth.

No cohort request receives all eight rows. Athlete IDs, labels, notes, coaching prose, and action metadata without a matching structured need remain behaviorally inert.
