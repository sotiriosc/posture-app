# Trunk / Carry Pain-Stress Owner Decisions

Stable ID: `TRUNK-CARRY-PAIN-STRESS-OWNER-2026-08-12`

Readiness classification: `TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY`

## Decisions

Pain-stress evidence is contextual training evidence. It is not a diagnosis, damage label, universal stop rule, exercise-quality label, hidden governor, or automatic ranking penalty. Moderate pain severity 3-6 stays flat under the existing policy and coefficients. Severity alone does not hard-reject; matching explicit hard contraindication or acute authority is still required.

The accepted architecture is potential -> prescription realization -> response:

- exercise definitions may expose stress potential;
- prescriptions realize or remove exposure through load, range, side, support, lever, duration, distance, steps, tempo, and effort;
- performance records may later reference realized stress-exposure IDs when recording what happened.

Policy C is accepted. Accepted intrinsic structured exposure may participate in candidate-level canonical matching. `prescription_modifiable`, `variant_dependent`, `dose_created`, and `unknown` exposure remains potential evidence at candidate scope and requires prescription resolution before it becomes realized receiver truth. Unknown remains unknown, not safe, absent, zero, hard, caution, or preferred.

## Contract

`ExerciseStressAnnotation` is generic and body-region neutral. It records tag, source, exposure scope, side scope, review status, provenance, and notes. Accepted annotations require nonempty owner, human exercise-science, or external provenance with a nonempty evidence basis; `reference_catalog` is not a circular authority.

Legacy `loading.jointStressTags`, `cautionStressTags`, and `contraindicatedStressTags` remain behaviorally authoritative. The structured annotation layer is additive. Legacy tags are not falsely relabeled intrinsic; they remain legacy unscoped until a future reviewed migration.

Pain signals now accept optional `side` for historical sensitivity, current discomfort, moderate pain, acute/severe pain, and hard contraindication. Missing side is preserved as `null` in traces. Tags are side-neutral; final side compatibility belongs to prescription-realized stress evaluation.

`ExerciseStressPotentialTrace` exposes potential stress without counting it as realized. When current or moderate pain matches potential-only structured stress, Candidate Intelligence emits prescription-resolution observability without pain units, joint units, hard criteria, or acute criteria.

`PrescriptionStressExposureTrace` preserves one `sourceExposureEventId` and records realization status: `intrinsic_present`, `present_under_prescription`, `removed_by_reviewed_variant`, `dose_not_yet_classified`, or `unknown`. No risk score, heavy threshold, or grip threshold is introduced.

## Approved Tags

Approved in `joint_stress` source placement:

- `upper_limb_support_loading`
- `loaded_trunk_rotation`
- `lateral_trunk_loading`
- `loaded_gait`
- `loaded_march`
- `grip_loading`

Rejected or not approved:

- `sustained_upper_limb_support_loading`
- `loaded_gait_or_march`
- `core_stress`
- `carry_stress`
- `bad_posture`
- `spinal_instability`
- `unsafe_rotation`
- `weak_core`
- `poor_alignment`
- `bracing_stress`
- `hard_exercise`

## Current Tag Migrations

These are recorded but not performed:

- `loaded_spinal_flexion`: keep; use for future machine crunch; current row/hinge use remains `REVIEW_LATER`.
- `long_lever_core`: future `variant_dependent`.
- `grip_intensive`: future `dose_created`; preserve current use, do not statically assign to carries, and do not count `grip_loading` plus `grip_intensive` as two full grip exposures from one realized event.
- `heavy_axial_loading`: future `dose_created`; no thresholds approved.
- `loaded_spinal_extension`: `REVIEW_LATER`.
- `shoulder_abduction_external_rotation`: `REVIEW_LATER`.

## Seven Candidate Mappings

These are proposal mappings only; no production exercises were added.

- Forearm plank: intrinsic `upper_limb_support_loading`; future `long_lever_core` is variant dependent.
- Forearm side plank: intrinsic `upper_limb_support_loading` and `lateral_trunk_loading`; support, lever, side, duration, and future external load are prescription facts.
- Machine abdominal crunch: `loaded_spinal_flexion`; no new abdominal-flexion tag.
- Half-kneeling high-to-low cable chop: intrinsic `loaded_trunk_rotation`; load and range remain prescription modifiable.
- Farmer carry: intrinsic `loaded_gait` and `grip_loading`; `grip_intensive` and `heavy_axial_loading` are dose-created and threshold-pending.
- Suitcase carry: intrinsic `loaded_gait`, `grip_loading`, and `lateral_trunk_loading`; dose-created grip and heavy axial concepts still use one source exposure event.
- Wall-supported suitcase march: Option A accepted. It is stationary alternating marching with dumbbell load in one hand, opposite hand on wall, both load sides trained across sets, no walking distance, and prescribed support level. Intrinsic tags are `loaded_march` and `grip_loading`; `lateral_trunk_loading` is prescription-realized; never `loaded_gait`.

## Next Dependency

Next dependency: `EXACT SEVEN-EXERCISE TRUNK / CARRY OWNER CURATION`, then `PRODUCTION REFERENCE CATALOG IMPLEMENTATION`.
