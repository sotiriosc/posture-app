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

## Session Composer Production Acceptance

The exported production kernel consumes Planner-authored normalized needs after Candidate Intelligence. Its pure seam separates per-need candidate evidence, explicit evaluation time, readiness, continuity/response context and deterministic search policy. It exposes low-level composition and handoff APIs without application wiring.

The eleven-user fixed-shell session cohort holds experience, full-gym equipment, Phase 1, evaluation time and the 45-row catalog constant. Goal, pain context, assessment, continuity, adverse response, preference, explicit Planner capacity and fatigue create material skeleton differences, same-anchor need differences, Prescription requirements or justified convergence. Raw minutes alone never change identity admission; they pass unchanged to duration feasibility.

Variety remains acceptance-contract-only: low variety may reinforce stable supporting work; moderate/high variety may make comparable accessories rotation-eligible under a future explicit budget. No randomization, rotation or productive-anchor displacement is implemented.

## P0 Whole-Body Fixed-Shell Results

The fixed-shell P0 cohort holds athlete, experience, phase, evaluation time, and unrelated context constant. One-variable direct calf, adductor, abductor, cuff, home knee-flexion, ankle-preparation, hinge-preparation, and single-leg-preparation requests each admit only their truthful P0 row. Removing the direct need removes that relevance. Loaded main hinge and loaded single-leg accessory requests do not admit the low-load rehearsal rows as strength substitutes. Shared full-gym hamstring outcomes are `JUSTIFIED_CONVERGENCE` when both legal rows express the same requested primary hamstring/knee-flexion truth.

No cohort request receives all eight rows. Athlete IDs, labels, notes, coaching prose, and action metadata without a matching structured need remain behaviorally inert.

## Session Planner Fixed Shell

The Planner adds an 18-user fixed shell and a 10+ same-experience/equipment regression. Explicit allocation, outcome, structural capacity, high-confidence relevant assessment, direct priority, and active continuity have bounded receivers. Pain, current equipment, and execution requirements may preserve identical Planner needs while changing Candidate/Composer or future Prescription behavior. Missed sessions route to Week; no directive returns an allocation-required status. Convergence is accepted when the changed fact is irrelevant or owned by another layer.

## Week Design Fixed Shell

The design-only Week lab adds a separate 18-user fixed shell, including 12 users sharing experience and equipment. Explicit weekly priority changes intent; current opportunities, completion, expected equipment/capacity, and productive continuity can change allocation; actual-day divergence changes materialization or requests reallocation; and downstream-only facts do not force cosmetic Week differences.

The matrix reports material intent differences, material allocation differences, same responsibility in different sessions, justified convergence, policy-required, current-availability-required, reallocation, wrong-layer effects, and unresponsive material inputs. No tested row has a wrong-layer or unresponsive-material classification. This evidence remains non-production.

## CAGT Formalization (2026-08-12)

CAGT operationalizes this counterfactual boundary with predeclared changed paths, owner, response window, invariant gates, and permitted dimensions. It distinguishes expected/justified convergence from unresponsiveness, detects over-adaptation before an owner has authority, and prevents lower-level novelty from rescuing missing higher-level personalization.
