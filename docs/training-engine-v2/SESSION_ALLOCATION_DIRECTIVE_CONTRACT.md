# Session Allocation Directive Contract

Status: production authority for the Session Intent Planner, 2026-08-12.

`SessionAllocationDirective` is the required upstream statement of what this session has been allocated to develop. Its only approved givers are `future_week_composer` and `explicit_standalone_session_brief`. Without it, the Planner returns `requires_week_or_explicit_session_allocation`; experience, equipment, profile goal, phase, and generic availability cannot select a split or purpose.

## Required Truth

- one athlete and explicit evaluation timestamp;
- session type `ordinary_training`;
- one outcome goal, separate from optional `pain_aware_return` context;
- current-session availability with minutes, structural capacity, provenance, and source reference, or a traced profile default;
- one required `dominant_main` objective and any explicitly allocated secondary objectives;
- structured selection targets and source evidence for every objective;
- unresolved, neighboring-session, and Week-reallocation references as trace or routing facts.

The fixed objective mapping is: `dominant_main` to main/primary strength; `secondary_main` to main/secondary strength; `secondary_accessory` to accessory/secondary strength; `direct_accessory` to accessory/hypertrophy accessory; `capacity_main` to main/capacity; `capacity_accessory` to accessory/capacity; `explicit_preparation` to warmup/preparation; `activation` to activation/activation; and `recovery` to cooldown/recovery.

Descriptions explain a decision but cannot create or alter one. Current `WeeklyIntent` numeric maps are not directive authority. Schedule disruption is returned to the future Week owner through `requires_week_reallocation` rather than compensated for locally.
