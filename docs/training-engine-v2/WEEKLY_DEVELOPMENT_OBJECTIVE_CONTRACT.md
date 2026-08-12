# Weekly Development Objective Contract

Status: `DESIGN_READY` as a design-only normalized responsibility; policy values remain `OWNER_POLICY_REQUIRED`.

`WeeklyDevelopmentObjective` is one stable weekly development responsibility. It does not represent an exercise, session, set target, completed exposure, adaptation result, or split label.

## Required Shape

- stable ID and one `WeeklyDevelopmentPurpose`;
- structured `WeeklySelectionTarget` across movement, action, muscle, relationship, and body-region lanes;
- weekly priority (`required`, `preferred`, or `optional`) and deterministic priority order;
- one or more explicit source-evidence records with provenance;
- optional `WeeklyFrequencyIntent` from reviewed policy or explicit authority;
- `WeeklyDosePolicyReference`, which normally remains `pending_prescription_policy` at allocation time;
- recovery-spacing requirement references;
- permitted session-role flexibility (`main`, `secondary`, `accessory`);
- explicit unresolved-policy state, reason code, and explanation.

## Purpose Vocabulary

The closed design vocabulary is `movement_development`, `muscle_development`, `direct_action_development`, `capacity_development`, `conditioning_development`, `assessment_priority_development`, and `recovery_support`. These terms establish why responsibility exists; they do not authorize dose or exercise selection.

## Frequency Intent

Frequency is expressed as minimum, target, and soft maximum allocated session opportunities. Its unit is allocation opportunity count, not sets, hard sets, tonnage, minutes, completed exposure, or physiological credit. Minimum is a hard policy obligation when approved; target participates in lexicographic evaluation; soft maximum triggers review rather than an automatic prohibition.

## Credit Boundary

Allocation gives zero dose credit. Movement, action, capacity, and muscle targets remain separate lanes. A muscle relationship describes candidate relevance, not fractional set equivalence. Direct versus meaningful-secondary development requires reviewed policy and later Prescription evidence; no coefficients are proposed here.

## Merge And Satisfaction

Objectives may merge only under semantic equivalence and must retain all provenance. Satisfaction at this layer means allocation status only. `allocated_target_opportunities` must never be presented as prescribed-dose sufficiency, completed training, or observed adaptation.
