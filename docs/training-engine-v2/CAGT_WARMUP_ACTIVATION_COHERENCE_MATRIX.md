# CAGT Warm-up Activation Coherence Matrix

Classification: `WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS`.

Candidate state: `OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION`. Production activation: **no**.

| Scenario | Result | Warm-up | Activation | Main | Failures |
|---|---|---|---|---|---|
| coherence-01-ordinary-empty-preparation | PASS | empty | empty | machine-chest-press | none |
| coherence-02-movement-rehearsal-dependency | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-03-control-activation-dependency | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-04-overlapping-assessment-cluster | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-05-relevant-upper-signal-only | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-06-irrelevant-shoulder-lower-inert | PASS | empty | empty | machine-chest-press | none |
| coherence-07-low-confidence-context-only | PASS | empty | empty | machine-chest-press | none |
| coherence-08-ankle-range-truth | PASS | wall-ankle-dorsiflexion-rock | empty | goblet-squat | none |
| coherence-09-hinge-rehearsal-not-main | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-10-single-leg-preparation-truth | PASS | single-leg-balance-rehearsal | empty | split-squat | none |
| coherence-11-serratus-truth | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-12-cuff-not-universal | PASS | empty | side-lying-dumbbell-external-rotation | machine-chest-press | none |
| coherence-13-breathing-not-mandatory | PASS | empty | empty | machine-chest-press | none |
| coherence-14-equipment-main-change-revalidated | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-15-pain-main-change-revalidated | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-16-condensed-required-retained | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-17-required-dependency-unavailable | EXPECTED_INFEASIBLE | empty | empty | empty | none |
| coherence-18-same-dependency-recurrence | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-19-unrelated-generic-recurrence | EXPECTED_MUTATION_REJECTED | empty | empty | machine-chest-press | GENERIC_EVERY_DAY_RECURRENCE |
| coherence-20-weekly-a1-session-dependency-separate | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-21-same-framework-different-assessment | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-22-same-framework-irrelevant-assessment | PASS | empty | empty | machine-chest-press | none |
| coherence-23-pain-without-dependency-empty | PASS | empty | empty | machine-chest-press | none |
| coherence-24-p0-rows-no-stack | PASS | empty | empty | machine-chest-press | none |
| coherence-25-productive-anchor-continuity | PASS | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | none |
| coherence-26-changed-anchor-stale-removed | PASS | empty | empty | machine-chest-press | none |
| coherence-27-fatigue-burden-observed | PASS | empty | side-lying-dumbbell-external-rotation | machine-chest-press | none |
| coherence-28-one-identity-one-section | PASS | empty | serratus-wall-slide | machine-chest-press | none |
| coherence-29-direct-accessory-no-activation | PASS | empty | empty | machine-chest-press | none |
| coherence-30-capacity-main-no-generic-warmup | PASS | empty | empty | machine-chest-press | none |
| coherence-31-generic-warmup-mutation | EXPECTED_MUTATION_REJECTED | empty | empty | machine-chest-press | GENERIC_WARMUP_FILLER |
| coherence-32-generic-activation-mutation | EXPECTED_MUTATION_REJECTED | empty | empty | machine-chest-press | GENERIC_ACTIVATION_FILLER |
| coherence-33-stale-preparation-mutation | EXPECTED_MUTATION_REJECTED | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | STALE_PREPARATION_AFTER_SELECTION |
| coherence-34-orphan-activation-mutation | EXPECTED_MUTATION_REJECTED | empty | serratus-wall-slide | machine-chest-press | ORPHAN_ACTIVATION |
| coherence-35-duplicate-identity-mutation | EXPECTED_MUTATION_REJECTED | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | DUPLICATE_IDENTITY_ACROSS_SECTIONS |
| coherence-36-assessment-multiplication-mutation | EXPECTED_MUTATION_REJECTED | empty | serratus-wall-slide | machine-chest-press | ASSESSMENT_CLUSTER_MULTIPLICATION |
| coherence-37-dose-credit-mutation | EXPECTED_MUTATION_REJECTED | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | WARMUP_COUNTED_AS_WEEKLY_DOSE |
| coherence-38-downstream-rescue-mutation | EXPECTED_MUTATION_REJECTED | bodyweight-hip-hinge-rehearsal | empty | dumbbell-romanian-deadlift | DOWNSTREAM_RESCUE_ATTEMPT |
