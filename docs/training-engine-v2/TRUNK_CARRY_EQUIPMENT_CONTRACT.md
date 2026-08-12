# Trunk / Carry Training-Space and Equipment Contract

## Scope

This contract resolves only training-space and equipment truth for the accepted minimal trunk/carry direction. It adds no proposed exercise and changes no current exercise requirement, pain/stress tag, prescription, progression axis, score, rank, phase, assessment, transition, Session Composer, or Weekly Composer behavior.

## Owner Identity Refinements

| Future identity | Status | Equipment finding |
| --- | --- | --- |
| forearm-plank | SETTLED | Ordinary stationary floor space is sufficient; loaded standing and loaded gait are irrelevant. |
| forearm-side-plank | SETTLED | Ordinary stationary floor space is sufficient; side prescription is now representable by the structured prescription contract. |
| machine-abdominal-crunch | SETTLED | Generic selectorized-machine availability and exact abdominal-crunch identity are both required. |
| half-kneeling-high-to-low-cable-chop | SETTLED | Generic cable availability and adjustableHeight do not replace explicit high-attachment truth. |
| farmer-carry | SETTLED | The pair and loaded-gait facts are explicit; no minimum effective load or distance is manufactured. |
| suitcase-carry | SETTLED | One-or-more dumbbell truth remains distinct from pair truth; no minimum effective load is a hard gate. |
| wall-supported-suitcase-march | PROVISIONAL | The stationary march does not request loaded-gait space; side, support, load, and no-distance dose semantics are now representable, but final identity still awaits owner curation. |

`wall-supported-suitcase-march` remains provisional for exercise-science curation. The structured prescription contract can represent support side, load side, steps/time, stationary gait, and no-distance semantics, but it does not approve production metadata.

## Training-Space Contract

`EquipmentCapabilities.trainingSpace` now requires `stableLoadedStandingSpace` and a separate `loadedGait.available` fact. Loaded gait may optionally report `straightLineMeters`, `turningAvailable`, and `overheadClearance`. Absence of those optional details means unknown, not false.

Loaded-gait availability is a user/environment capability statement, not a medical or absolute safety guarantee. It does not manufacture a usable distance, turn, or overhead-clearance fact.

## Loaded Standing Versus Loaded Gait

`floor_space`, `stable_loaded_standing_space`, and `loaded_gait_space` are independent requirement keys. Floor space satisfies neither loaded-space key. Stable loaded standing does not satisfy loaded gait. Loaded gait marked available while stable loaded standing is false remains raw input truth for inspection and emits `loaded_gait_requires_stable_loaded_standing_space` validation error rather than being silently normalized.

| Loaded-gait trace field | Value in unknown-detail example |
| --- | --- |
| available | true |
| straightLineMeters | null |
| turningAvailable | null |
| overheadClearance | null |

## Cable-Height Contract

`CableCapability.availableHeights` explicitly enumerates `low`, `mid`, and `high`. `adjustableHeight` remains a separate equipment characteristic and does not prove any usable attachment height. `cable_anchor_low`, `cable_anchor_mid`, and `cable_anchor_high` require both cable availability and the matching explicit height. Band-anchor keys remain independent.

## Abdominal-Crunch Machine Identity

`MachineId` now includes `abdominal_crunch`. A future requirement must request `selectorized_machine` and `machineIds: [abdominal_crunch]`; a generic machine or commercial-gym label cannot satisfy exact identity.

## Dumbbell Single / Pair Truth

`DumbbellCapability.pairAvailable` distinguishes one-or-more dumbbell availability from a usable pair. The existing `dumbbells` key reads generic availability; `dumbbell_pair` requires both generic and pair truth. Existing maximum-pair-weight data is preserved.

Minimum effective carry load remains a future prescription and candidate-suitability question. Neither generic dumbbell nor pair equipment legality invents a minimum load gate.

## Carry Exercise Family

`ExerciseFamily` includes `carry_load` for future catalog identity and personal-block taxonomy. Current exercises using it: 0. The family creates no role legality, score, capacity credit, carry slot, or mandatory finisher.

## Synthetic Future Requirements

| Future identity | Requirement | Complete environment | Missing capability trace |
| --- | --- | --- | --- |
| forearm-plank | bodyweight, floor_space | true | none |
| forearm-side-plank | bodyweight, floor_space | true | none |
| machine-abdominal-crunch | selectorized_machine, machine:abdominal_crunch | true | none |
| half-kneeling-high-to-low-cable-chop | cable_stack, cable_anchor_high, floor_space | true | none |
| farmer-carry | dumbbell_pair, loaded_gait_space | true | none |
| suitcase-carry | dumbbells, loaded_gait_space | true | none |
| wall-supported-suitcase-march | dumbbells, wall, stable_loaded_standing_space | true | none |

Synthetic counterfactuals prove each missing structured fact fails with its exact capability key, commercial-gym labels provide no carry-space or machine identity, and home/travel environments can satisfy carries when their explicit capabilities match.

## Requirement Trace and Observability

Every pure requirement result now exposes the requirement ID, requested capabilities, available requested capabilities, missing capabilities, per-capability checks, and a capability snapshot containing loaded-gait details, cable heights, dumbbell-pair truth, and machine identities. Existing hard-rejection evidence continues to use the same missing-capability strings.

## Current-Behavior Invariance

| Artifact | Required fingerprint/count | Current | Result |
| --- | --- | --- | --- |
| 240 current exercise-by-fixture equipment legality rows | 50881bd4cd735954dae1d9a8574165d5a6bff40d8af990c8324a21ba8436b8e6 | 50881bd4cd735954dae1d9a8574165d5a6bff40d8af990c8324a21ba8436b8e6 | true |
| Expanded equipment fixture serialization | 98f672133e3498b84f47e81751f1fbf443faae556029835fec5b30b90d884117 | 98f672133e3498b84f47e81751f1fbf443faae556029835fec5b30b90d884117 | true |
| 22-scenario ranking | d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782 | d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782 | true |
| Comprehensive behavior including hard-rejection codes | 216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9 | 216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9 | true |
| Reference catalog | 124786e955fb411f556d0b583e127d3261a7385ccfa11175a95a9bae79bd41f9 | 124786e955fb411f556d0b583e127d3261a7385ccfa11175a95a9bae79bd41f9 | true |
| Current requirements using a new capability | 0 | 0 | true |
| Current exercises using carry_load | 0 | 0 | true |

The fixture fingerprint changes intentionally because every equipment fixture now serializes explicit training-space, cable-height, and dumbbell-pair truth. Exercise catalog serialization does not change.

## Validation Results

Focused tests cover explicit space fields, all non-implication boundaries, inconsistent loaded-gait input, unknown optional details, cable/band separation, exact machine identity, dumbbell single/pair truth, future synthetic requirements, environment-label counterfactuals, carry-family non-use, and all current fingerprints.

## Final Classification

**TRUNK_CARRY_EQUIPMENT_CONTRACT_READY**

Structured prescription and same-exercise progression semantics are now represented by `STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY`. The exercise tranche is still not production-ready. The next dependency is:

**TRUNK / CARRY PAIN-STRESS VOCABULARY AND RECEIVER REVIEW**

Then exact seven-exercise owner curation and production metadata.
