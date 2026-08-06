# Engine Gate Intelligence Audit (Phase 8 §5A)

Generated: 2026-08-06T21:59:35.594Z
Checkpoint base: `921bd35bf17eeaaf32c0decd2638a45671687354`

## Philosophy

> Beginner = lower complexity/stability — NOT machine-only and NOT forced free-weights

## Gate inventory summary

| Class | Count |
|---|---|
| HARD_INVARIANT | 4 |
| CONTEXTUAL_HARD_GATE | 7 |
| SCORING_SIGNAL | 4 |
| SOFT_PREFERENCE | 1 |
| REPAIR_ONLY_RULE | 4 |
| OBSERVABILITY_ONLY | 1 |
| STALE_OR_REDUNDANT | 1 |

## Rules requiring action this phase

- **goblet-vs-machine-squat-hard-exclude** (CONTEXTUAL_HARD_GATE): applied: convert_to_soft_preference (+2.5 machine squat / +1 goblet; hard exclude removed)
- **activation-push-machine-chest-plus16** (SCORING_SIGNAL): applied: reduce_to_moderate_preference (+4 machine chest / +2 DB bench)

## Full inventory

### blocked-exercise-hard-filter

- File: `packages/engine/src/program.ts`
- Function: `isExerciseEligibleForProgramContext`
- Condition: blockedExerciseIds.has(exercise.id)
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: initial_selection
- Effect: Excludes personally blocked exercises
- Rationale: Personal Equipment Blocks — user-controlled hard contract
- Evidence: Injected as deferred=true at generation entry; same tier as pain
- Classification: **HARD_INVARIANT**
- Recommended action: preserve

### experience-min-hard

- File: `packages/engine/src/program.ts`
- Function: `isExerciseEligibleForProgramContext / isBackChestExperienceEligible`
- Condition: user experience rank < exercise.experienceMin
- Modes: all
- Experience: beginner, intermediate
- Phases: all
- Sections/roles: main, accessory
- Stage: initial_selection
- Effect: Excludes exercises above experience floor
- Rationale: Skill / complexity floor from catalog
- Evidence: Applied in eligibility before scoring
- Classification: **HARD_INVARIANT**
- Recommended action: preserve

### beginner-back-squat-ban

- File: `packages/engine/src/program.ts`
- Function: `isExerciseEligibleForProgramContext`
- Condition: beginner + main + back squat pattern
- Modes: gym, dumbbells, mixedHome
- Experience: beginner
- Phases: all
- Sections/roles: main
- Stage: initial_selection
- Effect: Excludes unsupported barbell back squat for beginners
- Rationale: Avoid advanced unsupported barbell for beginners
- Evidence: Aligned with Beginner ≠ advanced barbell assertion
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve

### goblet-vs-machine-squat-hard-exclude

- File: `packages/engine/src/program.ts`
- Function: `isExerciseEligibleForProgramContext`
- Condition: main + goblet-squat + machines available + machine squat still viable
- Modes: gym
- Experience: all
- Phases: all
- Sections/roles: main / squat_primary
- Stage: initial_selection
- Effect: Hard-excludes goblet squat whenever machine leg press/hack squat viable
- Rationale: Prefer machine squat primaries in gym
- Evidence: Over-broad: erases a lawful beginner-appropriate free-weight option even when context supports goblet; creates machine-only funnel for squat_primary
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: applied: convert_to_soft_preference (+2.5 machine squat / +1 goblet; hard exclude removed)

### phase-min-eligibility

- File: `packages/engine/src/program.ts`
- Function: `isEligibleForPhase`
- Condition: phase stage < exercise.phaseMin (with listed exceptions)
- Modes: all
- Experience: all
- Phases: activation, skill, growth
- Sections/roles: main, activation
- Stage: initial_selection
- Effect: Excludes later-stage exercises early; exceptions for machine primers / bridges
- Rationale: Developmental stage gating
- Evidence: Machine primer exception expands machine availability below phaseMin
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve_with_family_aware_review; do not broaden machine exceptions

### activation-hard-tier-beg-int

- File: `packages/engine/src/program.ts`
- Function: `isEligibleForPhase`
- Condition: activation + difficultyTier===hard + beginner/intermediate
- Modes: all
- Experience: beginner, intermediate
- Phases: activation
- Sections/roles: main
- Stage: initial_selection
- Effect: Excludes hard-tier mains in activation for beg/int
- Rationale: Lower complexity in Control & Technique
- Evidence: Supports Beginner = lower complexity; not machine-only
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve

### bc-tier-ceilings

- File: `packages/engine/src/program.ts`
- Function: `resolveBackChestTierProfile / isBackChestAnchorTierAllowed`
- Condition: min(equipCeiling, painCap); beginner reduce-pain → tier≤2; growth T3 requires allowTier3
- Modes: gym
- Experience: beginner, all
- Phases: activation≤1, skill≤2, growth=ceiling
- Sections/roles: back-chest anchors
- Stage: initial_selection
- Effect: Caps equipment tier by pain/experience/phase
- Rationale: Stability and loadability ceilings
- Evidence: Tier≤2 still admits dumbbells/cables; not machine-only
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve

### bc-beginner-growth-t3-safety

- File: `packages/engine/src/program.ts`
- Function: `isBackChestBeginnerSafeTier3Anchor / isBackChestAnchorTierAllowed`
- Condition: 3-day beginner growth + horizontal push/pull + tier≥3 → machine/cable/landmine/chest-supported only
- Modes: gym
- Experience: beginner
- Phases: growth
- Sections/roles: horizontalPush, horizontalPull
- Stage: initial_selection
- Effect: Blocks unsupported barbell T3; allows supported free-weight T3
- Rationale: Beginner growth safety — avoid unsupported barbell bench/row
- Evidence: Not machine-only: chest-supported and landmine pass; tier≤2 free weights still legal
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve

### activation-machine-main-score-bias

- File: `packages/engine/src/program.ts`
- Function: `getIntentSlotScoreBonus`
- Condition: activation + hasLoad + beginner|high pain + foundational pattern + machines
- Modes: gym
- Experience: beginner
- Phases: activation
- Sections/roles: main push/pull/squat/hinge
- Stage: initial_selection
- Effect: +5 machines / −1 non-machine weighted
- Rationale: Control & Technique machine-main priority
- Evidence: Legitimate soft stability preference; magnitude rarely erases all non-machines alone
- Classification: **SCORING_SIGNAL**
- Recommended action: preserve_as_preference

### activation-push-machine-chest-plus16

- File: `packages/engine/src/program.ts`
- Function: `scoreExerciseForContextDetailed`
- Condition: activation + push lane + back-chest + beginner|high pain + machine-chest-press
- Modes: gym
- Experience: beginner
- Phases: activation
- Sections/roles: main push
- Stage: initial_selection
- Effect: +16 machine-chest-press vs +4 dumbbell-bench-press
- Rationale: Beginner/high-pain machine-stable push default
- Evidence: Pseudo-gate magnitude: +16 dominates typical score spreads and collapses push to machine-only in practice
- Classification: **SCORING_SIGNAL**
- Recommended action: applied: reduce_to_moderate_preference (+4 machine chest / +2 DB bench)

### gym-implement-preference-penalty

- File: `packages/engine/src/program.ts`
- Function: `resolveBackChestAnchorImplementPreferencePenalty`
- Condition: gym implements available → penalize DB/bands for anchors
- Modes: gym
- Experience: all
- Phases: all
- Sections/roles: back-chest anchors
- Stage: initial_selection
- Effect: Ranks gym implements above casual substitutes
- Rationale: Full gym should prefer gym-capable work
- Evidence: Soft ranking; still allows DB when better contextually
- Classification: **SOFT_PREFERENCE**
- Recommended action: preserve

### main-role-legality

- File: `packages/engine/src/program.ts`
- Function: `isMainLegalForSlot / isRoleLegalForSlot / isThreeDayGymMainSlotEligible`
- Condition: slot role / loadedMainEligible / support_corrective rejection
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: main slots
- Stage: initial_selection
- Effect: Rejects prep/support as true main
- Rationale: Movement-role truth
- Evidence: Required hard invariant
- Classification: **HARD_INVARIANT**
- Recommended action: preserve

### pain-contraindications-hard

- File: `packages/engine/src/program.ts`
- Function: `ensureEligibleItem / ladderAdvancement`
- Condition: exercise.contraindications / painContraindications hit pain areas
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: repair
- Effect: Hard-swaps or blocks contraindicated work
- Rationale: True pain safety
- Evidence: Catalog painContraindications vs contraindications dual path — flag inconsistency for later, do not weaken
- Classification: **CONTEXTUAL_HARD_GATE**
- Recommended action: preserve; document dual-field inconsistency as STALE risk

### pain-soft-score

- File: `packages/engine/src/program.ts`
- Function: `scoreExerciseForContextDetailed / scoreSubstitutionCandidate`
- Condition: contraindicationHitsPainArea soft path
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: initial_selection
- Effect: −8 / −12 soft pain penalties
- Rationale: Prefer safer alternatives among legal options
- Evidence: Soft preference when hard path does not fire
- Classification: **SCORING_SIGNAL**
- Recommended action: preserve

### feedback-penalty-not-hard-block

- File: `packages/engine/src/program.ts`
- Function: `getFeedbackSelectionScoreBonus / shouldAvoidFeedbackRiskCandidate`
- Condition: prior pain/fail/hard feedback
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: initial_selection
- Effect: Heavy score penalty; remains selectable if no better option
- Rationale: Feedback risk ≠ personal block
- Evidence: Matches documented philosophy
- Classification: **SCORING_SIGNAL**
- Recommended action: preserve

### deferred-repair-hard-block

- File: `packages/engine/src/program.ts`
- Function: `multiple repair insertion paths`
- Condition: feedbackSummary.deferred === true
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: repair
- Effect: Hard-excludes deferred from repair reinsert; initial uses score only
- Rationale: User-controlled deferral contract
- Evidence: Documented 8 repair sites; initial not hard-blocked
- Classification: **REPAIR_ONLY_RULE**
- Recommended action: preserve

### equipment-capability-support-anchor

- File: `packages/engine/src/program.ts + equipmentCapabilities.ts`
- Function: `isExerciseEligibleForProgramContext / isSupportConfirmedByCapabilities`
- Condition: mode illegal equipment; band anchor/type; bench/support unconfirmed
- Modes: dumbbells, bands, bodyweight, mixedHome, gym
- Experience: all
- Phases: all
- Sections/roles: main, accessory
- Stage: initial_selection
- Effect: Excludes unavailable equipment/support/anchor patterns
- Rationale: Capability honesty
- Evidence: Hard legality — must not weaken
- Classification: **HARD_INVARIANT**
- Recommended action: preserve

### uniqueness-coverage-contract-dayintel-repairs

- File: `packages/engine/src/program.ts`
- Function: `ensureDistinctRoutine / applyWeeklyCoverageRepairs / repairDayToMeetSpec / repair*DayIntelligence`
- Condition: missing coverage, duplicates, day curriculum gaps
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: main, accessory
- Stage: repair
- Effect: Replaces/reinserts from preferred pools and rescue lists
- Rationale: Contract and day intelligence integrity
- Evidence: Repair pools can reassert machine-first preferences; parity with initial selection must be tested
- Classification: **REPAIR_ONLY_RULE**
- Recommended action: preserve_intelligence_parity_tests

### quality-recovery-mode-fallback

- File: `packages/engine/src/program/qualityGate/recoverProgramQuality.ts + modeQualityFallback.ts`
- Function: `recoverAndEvaluateProgramQuality / resolveModeQualityFallbackSeed`
- Condition: quality gate fail → seed retry → mode canonical seed fallback
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: fallback
- Effect: Replaces failed generation with mode-identity-preserving seed
- Rationale: Never return failed-quality programs
- Evidence: Canonical seeds re-enter same generator; not a second generator
- Classification: **REPAIR_ONLY_RULE**
- Recommended action: preserve

### hardcoded-rescue-lists

- File: `packages/engine/src/program.ts + qualityGate/repairProgramQualityContracts.ts`
- Function: `HF integrity / forceThreeDayFinalDisplayedSlotTruth / quality alt lists`
- Condition: integrity/truth/quality repair needs a replacement ID
- Modes: gym primarily
- Experience: all
- Phases: all
- Sections/roles: main / hinge / unilateral
- Stage: repair
- Effect: Forces preferred rescue IDs
- Rationale: Last-resort truthful replacements
- Evidence: Can reintroduce machine bias if lists are machine-heavy; audit parity
- Classification: **REPAIR_ONLY_RULE**
- Recommended action: preserve; ensure lists include truthful non-machine options

### quality-observability

- File: `packages/engine/src/program/qualityGate/programQualityObservability.ts`
- Function: `observability helpers`
- Condition: audit/debug emission
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: n/a
- Stage: observability
- Effect: Does not exclude candidates
- Rationale: Debug / audit
- Evidence: No selection effect
- Classification: **OBSERVABILITY_ONLY**
- Recommended action: preserve

### pain-contraindications-field-duality

- File: `packages/engine/src/program.ts + ladderAdvancement.ts + catalog`
- Function: `contraindications vs painContraindications`
- Condition: two catalog fields used by different stages
- Modes: all
- Experience: all
- Phases: all
- Sections/roles: all
- Stage: initial_selection
- Effect: Inconsistent hard/soft application across stages
- Rationale: Historical field split
- Evidence: Potential STALE_OR_REDUNDANT inconsistency; out of sequencing scope
- Classification: **STALE_OR_REDUNDANT**
- Recommended action: document_only_this_phase; do not blindly unify tags

## Beginner machine-only funnel (§5A D)

- Candidate funnel stages inspected via code audit: raw → equipment → pain → experience → phase → tier → scored → selected → repair → fallback → final
- Primary machine-only collapse points: goblet hard-exclude when machines viable; +16 machine-chest-press activation push bonus
- Beginner growth T3 safety is NOT machine-only (chest-supported/landmine/tier≤2 free weights remain)
- At-home modes are unaffected by machine gates (machines illegal); sequencing work proceeds after minimal gym gate correction

## Beginner ruling matrix (§5A E)

| Persona | Seeds | Avg machine main share | Always machine-only | Any non-machine | Goblet | DB press | Barbell back squat | Machine chest rate |
|---|---:|---:|---|---|---|---|---|---:|
| beg_gym_3d_nopain_p1_gf | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_3d_shoulder_p1 | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_3d_lbp_p1 | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_3d_knee_p1 | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_3d_multi_pain_p1 | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_4d_nopain_p2_gf | 12 | 25.0% | false | true | false | true | false | 0% |
| beg_gym_5d_nopain_p3_gf | 12 | 29.2% | false | true | false | true | false | 0% |
| beg_gym_3d_nopain_p1_mg | 12 | 66.7% | false | true | false | false | false | 100% |
| beg_gym_3d_nopain_p2_gf | 12 | 11.1% | false | true | true | true | false | 0% |
| beg_gym_3d_nopain_p3_gf | 12 | 0.0% | false | true | true | true | false | 0% |
| beg_gym_3d_block_machine_press | 12 | 55.6% | false | true | false | true | false | 0% |

## Required assertions

- beginnerDoesNotImplyMachineOnly: **PASS**
- beginnerDoesNotImplyFreeWeightAvoidance: **PASS**
- beginnerDoesNotImplyAdvancedBarbell: **PASS**
- machinesCanStillWin: **PASS**
- painOverridesPreference: **PASS**
- personalBlocksOverride: **PASS**

## Acceptance criteria (§5A H)

- Unexplained machine-only beginner personas (no-pain): 0
- Score penalties acting as undocumented hard gates (flagged for correction): 2
- Safety invariants weakened: 0

## Interaction with composition refinement (§5A I)

At-home modes are not subject to machine gates. After minimal correction of the two over-broad gym beginner preferences above, selection for at-home work is judged sound enough to proceed to composition baseline and sequencing. Selection changes and ordering changes are reported separately.
