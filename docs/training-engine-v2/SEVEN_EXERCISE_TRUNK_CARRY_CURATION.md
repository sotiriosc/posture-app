# Seven Exercise Trunk / Carry Curation

Overall classification: `SEVEN_EXERCISE_STRESS_SUPPORT_IMPLEMENTED_IN_PRODUCTION`

Production implementation readiness: `PRODUCTION_CATALOG_IMPLEMENTED`

Production blockers:


## Owner Decisions Recorded

- Decision: Knee-supported forearm plank is approved as a same-exercise prescription/support/lever variant of `forearm-plank`.
  Effect: `forearm-plank` keeps one identity row; knee support is a prescribed lever/support variant, not a duplicate exercise.
- Decision: Bent-knee forearm side plank is approved as a same-exercise variant of `forearm-side-plank`.
  Effect: `forearm-side-plank` keeps one identity row; bent-knee support is a prescribed side-support/lever variant.
- Decision: Approved production identities are `forearm-plank`, `forearm-side-plank`, `machine-abdominal-crunch`, `half-kneeling-high-to-low-cable-chop`, `farmer-carry`, and `suitcase-carry`.
  Effect: These identities are owner-approved and implemented once each in the canonical production catalog.
- Decision: `wall-supported-suitcase-march` must not satisfy `carry` in the first production implementation.
  Effect: The row is not allowed to satisfy a loaded walking/carry request or inherit carry semantics.
- Decision: `wall-supported-suitcase-march` must not receive hard `anti_lateral_flexion_core` yet.
  Effect: Anti-lateral mechanics and lateral trunk exposure remain contextual/needs_review until support magnitude/control can be represented and reviewed.
- Decision: `wall-supported-suitcase-march` proposed movement role is `loaded_bracing`; proposed training roles are `activation` and `capacity`; sections are `activation` and `accessory` as appropriate.
  Effect: No new movement role is created to rescue the row.

## Boundary

This curation artifact now records the seven implemented production rows. It does not add Session Composer, Week Composer, workout-length policy, automatic substitution, automatic progression, Library, Knowledge Layer, Coaching Rail, or UI behavior.

Doctrine: task-appropriate alignment -> repeatable form -> appropriate dose -> observed response -> earned progression -> adaptation. More knowledge must improve selection, not inflate workout length.

## Complete Curation Matrix

| ID | Identity | Family | Movement roles | Training roles | Primary muscles | Key secondary | Equipment | Prerequisites | Principal mechanics | Accepted trunk mechanics | Unresolved trunk mechanics | Intrinsic stress | Potential/modifiable stress | Progression axes | Prescription modes | Phase status | Production blocker | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| forearm-plank | Ordinary straight-body forearm plank, stationary, bodyweight, full-lever unless prescription states a reviewed lever variant. | core_control | anti_extension_core | activation, hypertrophy_accessory | trunk | serratus, front_delts | bodyweight, floor_space | basic forearm-supported upper-limb tolerance | bodyweight | antiExtensionContribution:high, loadedBracingContribution:none | breathingPressureCoordination, antiRotationContribution, antiLateralFlexionContribution, controlledFlexionContribution, controlledRotationContribution, gaitLoadTransferContribution | upper_limb_support_loading | long_lever_core:variant_dependent | duration, lever, support_reduction, effort | timed_hold | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | none | READY_FOR_OWNER_APPROVAL |
| forearm-side-plank | Bodyweight side-oriented forearm plank with pelvis facing sideways and support through one forearm plus feet or accepted bent-knee variant. | core_control | anti_lateral_flexion_core | activation, hypertrophy_accessory | trunk | serratus, front_delts, hip_abductors | bodyweight, floor_space | side-bearing forearm support tolerance | bodyweight | antiLateralFlexionContribution:high, loadedBracingContribution:none | breathingPressureCoordination, antiExtensionContribution, antiRotationContribution, controlledFlexionContribution, controlledRotationContribution, gaitLoadTransferContribution | upper_limb_support_loading, lateral_trunk_loading | long_lever_core:variant_dependent | duration, lever, support_reduction, load, effort | timed_hold | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | none | READY_FOR_OWNER_APPROVAL |
| machine-abdominal-crunch | Selectorized abdominal-crunch machine where pads/seat guide intentional controlled trunk flexion. | core_control | trunk_flexion | hypertrophy_accessory, secondary_strength | trunk | none | selectorized_machine | ability to set up and exit the specific machine safely | machine_guided | controlledFlexionContribution:high | breathingPressureCoordination, antiExtensionContribution, antiRotationContribution, antiLateralFlexionContribution, controlledRotationContribution, loadedBracingContribution, gaitLoadTransferContribution | loaded_spinal_flexion | none | load, reps, sets, range, tempo | repetition_sets | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | Equipment requirement can name abdominal_crunch machine via machineIds, but capability key itself is selectorized_machine. | READY_FOR_OWNER_APPROVAL |
| half-kneeling-high-to-low-cable-chop | Half-kneeling stance, high cable anchor, high-to-low resisted chop with intentional controlled trunk rotation. | core_control | trunk_rotation | activation, hypertrophy_accessory, secondary_strength | trunk | glutes | cable_stack, cable_anchor_high, floor_space | ability to understand cable setup and half-kneeling side setup | cable_anchored | controlledRotationContribution:high | breathingPressureCoordination, antiExtensionContribution, antiRotationContribution, antiLateralFlexionContribution, controlledFlexionContribution, loadedBracingContribution, gaitLoadTransferContribution | loaded_trunk_rotation | none | load, reps, sets, range, tempo | repetition_sets | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | none | READY_FOR_OWNER_APPROVAL |
| farmer-carry | Upright loaded walking with one external implement in each hand and symmetrical load unless prescription states otherwise. | carry_load | carry, loaded_bracing | capacity, hypertrophy_accessory, secondary_strength | trunk, upper_back | glutes, quads, hamstrings | dumbbell_pair, loaded_gait_space, stable_loaded_standing_space | ability to walk while holding two implements, ability to grip two implements | free_implement | loadedBracingContribution:high, gaitLoadTransferContribution:high | breathingPressureCoordination, antiExtensionContribution, antiRotationContribution, antiLateralFlexionContribution, controlledFlexionContribution, controlledRotationContribution | loaded_gait, grip_loading | grip_intensive:dose_created, heavy_axial_loading:dose_created | load, distance, trips, duration, effort | distance_carry, timed_carry | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | No forearm/grip MuscleGroup; loaded gait trip/set-down standards remain prescription-detail only. | READY_FOR_OWNER_APPROVAL |
| suitcase-carry | Upright loaded walking with one external implement held on one side. | carry_load | carry, anti_lateral_flexion_core, loaded_bracing | capacity, hypertrophy_accessory, secondary_strength | trunk | upper_back, glutes, quads, hamstrings | dumbbells, loaded_gait_space, stable_loaded_standing_space | ability to walk while holding one implement, side-specific load tolerance | free_implement | antiRotationContribution:moderate, antiLateralFlexionContribution:high, loadedBracingContribution:high, gaitLoadTransferContribution:high | breathingPressureCoordination, antiExtensionContribution, controlledFlexionContribution, controlledRotationContribution | loaded_gait, grip_loading, lateral_trunk_loading | grip_intensive:dose_created, heavy_axial_loading:dose_created | load, distance, trips, duration, effort | distance_carry, timed_carry | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | No forearm/grip MuscleGroup. | READY_FOR_OWNER_APPROVAL |
| wall-supported-suitcase-march | One dumbbell in one hand, opposite hand supported on wall, stationary alternating march, both load sides trained across sets, no walking distance. | carry_load | loaded_bracing | activation, capacity | trunk | glutes, quads | dumbbells, wall, stable_loaded_standing_space | ability to march while supported, ability to grip one dumbbell | free_implement | loadedBracingContribution:moderate | breathingPressureCoordination, antiExtensionContribution, antiRotationContribution, antiLateralFlexionContribution, controlledFlexionContribution, controlledRotationContribution, gaitLoadTransferContribution | loaded_march, grip_loading | lateral_trunk_loading:prescription_modifiable | load, steps, duration, support_reduction, effort | step_march | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED | Anti-lateral exposure remains contextual/needs_review until support-force effects receive human exercise-science review. | READY_FOR_OWNER_APPROVAL |

## Exact Identity Definitions

### Forearm Plank (forearm-plank)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Ordinary straight-body forearm plank, stationary, bodyweight, full-lever unless prescription states a reviewed lever variant. |
| START POSITION | Prone forearm support with feet on floor and body organized as a straight-body support. |
| SUPPORT | Forearms and feet on floor. |
| IMPLEMENT / RESISTANCE | Bodyweight only. |
| MOVEMENT PATH | Static timed hold; no travel or repeated flexion/extension path. |
| INTENDED TRUNK ACTION | Anti-extension trunk control. |
| PELVIS / RIBCAGE RELATIONSHIP | Maintain controlled ribcage-pelvis relationship without sagging into extension. |
| LATERALITY | Bilateral/midline. |
| END CONDITION | Time, quality loss, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | duration, effort, standard lever, shortened lever, knee-supported variant, support changes |
| NEW EXERCISE ID REQUIRED | high plank/wrist-supported plank, dynamic body saw, long-lever plank if owner wants separate row, loaded plank |

### Forearm Side Plank (forearm-side-plank)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Bodyweight side-oriented forearm plank with pelvis facing sideways and support through one forearm plus feet or accepted bent-knee variant. |
| START POSITION | Side-lying setup lifted into forearm-supported side support. |
| SUPPORT | One forearm and lateral foot/feet contact, with bent-knee support as an approved same-exercise regression. |
| IMPLEMENT / RESISTANCE | Bodyweight only unless a future external-load variant is explicitly retained. |
| MOVEMENT PATH | Static timed side support. |
| INTENDED TRUNK ACTION | Anti-lateral-flexion trunk control. |
| PELVIS / RIBCAGE RELATIONSHIP | Maintain lateral trunk line without sagging or rotating away from the side-support task. |
| LATERALITY | Prescription side matters; each side may be prescribed. |
| END CONDITION | Time, side completion, quality loss, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | duration, support level, bent-knee support, lever length, side, future external load only if owner accepts same identity |
| NEW EXERCISE ID REQUIRED | high side plank, Copenhagen plank, dynamic side plank dips, weighted side plank if owner wants a separate identity |

### Machine Abdominal Crunch (machine-abdominal-crunch)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Selectorized abdominal-crunch machine where pads/seat guide intentional controlled trunk flexion. |
| START POSITION | Seated or machine-supported setup with pads adjusted to the user's body. |
| SUPPORT | Machine seat and pads. |
| IMPLEMENT / RESISTANCE | Selectorized machine stack or equivalent guided machine resistance. |
| MOVEMENT PATH | Controlled trunk flexion through machine-guided path, then controlled return. |
| INTENDED TRUNK ACTION | Controlled trunk flexion for direct trunk development. |
| PELVIS / RIBCAGE RELATIONSHIP | Ribcage moves toward pelvis through intended spinal/trunk flexion while setup limits hip-dominant substitution. |
| LATERALITY | Bilateral/midline. |
| END CONDITION | Repetition target, quality loss, range loss, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | load, range, tempo, sets, reps, machine setup |
| NEW EXERCISE ID REQUIRED | cable crunch, floor crunch, reverse crunch, non-guided ab machine with materially different mechanics |

### Half-Kneeling High-to-Low Cable Chop (half-kneeling-high-to-low-cable-chop)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Half-kneeling stance, high cable anchor, high-to-low resisted chop with intentional controlled trunk rotation. |
| START POSITION | Half-kneeling facing/angled to high cable with per-side setup. |
| SUPPORT | Half-kneeling body support on floor with cable anchor resistance. |
| IMPLEMENT / RESISTANCE | Cable stack at high anchor. |
| MOVEMENT PATH | High-to-low diagonal path driven by controlled trunk rotation with arms transmitting cable resistance. |
| INTENDED TRUNK ACTION | Controlled trunk rotation, not anti-rotation. |
| PELVIS / RIBCAGE RELATIONSHIP | Pelvis/stance managed; some controlled pelvis contribution may occur but arm-only diagonal pulling is outside identity. |
| LATERALITY | Per-side prescription. |
| END CONDITION | Repetitions, side completion, quality loss, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | load, range, tempo, reps, sets, side, stance details |
| NEW EXERCISE ID REQUIRED | Pallof press, standing chop, low-to-high cable lift, band chop, arm-only diagonal cable pull |

### Farmer Carry (farmer-carry)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Upright loaded walking with one external implement in each hand and symmetrical load unless prescription states otherwise. |
| START POSITION | Standing with one implement per hand before walking. |
| SUPPORT | Unsupported loaded gait. |
| IMPLEMENT / RESISTANCE | Usually dumbbell pair for first production row. |
| MOVEMENT PATH | Walk for distance or time, including managed turns if prescribed. |
| INTENDED TRUNK ACTION | Loaded bracing and gait/load transfer for carry capacity. |
| PELVIS / RIBCAGE RELATIONSHIP | Maintain upright trunk position while walking under load. |
| LATERALITY | Bilateral linked implements. |
| END CONDITION | Trip distance/time, turn/set-down rule, quality loss, grip stop, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | load, distance, duration, trips, turns, effort, set-down rules |
| NEW EXERCISE ID REQUIRED | suitcase carry, front-rack carry, overhead carry, static farmer hold, yoke carry |

### Suitcase Carry (suitcase-carry)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | Upright loaded walking with one external implement held on one side. |
| START POSITION | Standing with a single implement in one hand. |
| SUPPORT | Unsupported loaded gait. |
| IMPLEMENT / RESISTANCE | One dumbbell or similar implement. |
| MOVEMENT PATH | Walk for distance or time while managing unilateral load. |
| INTENDED TRUNK ACTION | Carry capacity with anti-lateral-flexion and loaded-bracing expression. |
| PELVIS / RIBCAGE RELATIONSHIP | Maintain upright trunk/pelvis relationship without collapsing toward or away from load. |
| LATERALITY | Side-specific; single-side or each-side prescription. |
| END CONDITION | Trip distance/time, side completion, quality loss, grip stop, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | load side, each-side prescription, load, distance, duration, trips, turns, effort |
| NEW EXERCISE ID REQUIRED | farmer carry, suitcase hold, front-rack carry, overhead carry |

### Wall-Supported Suitcase March (wall-supported-suitcase-march)

Verdict: `READY_FOR_OWNER_APPROVAL`

| Field | Review |
| --- | --- |
| EXACT IDENTITY | One dumbbell in one hand, opposite hand supported on wall, stationary alternating march, both load sides trained across sets, no walking distance. |
| START POSITION | Standing near wall with one hand on wall and opposite hand holding dumbbell. |
| SUPPORT | Opposite hand on wall; support level explicitly prescribed. |
| IMPLEMENT / RESISTANCE | One dumbbell. |
| MOVEMENT PATH | Stationary alternating march; no travel/distance. |
| INTENDED TRUNK ACTION | Loaded bracing with contextual support-aware lateral-control exposure left unclaimed. |
| PELVIS / RIBCAGE RELATIONSHIP | Maintain controlled trunk/pelvis position while alternating march steps under supported unilateral load. |
| LATERALITY | Load side and support side are opposite; both load sides across sets. |
| END CONDITION | Steps, time, side completion, support-quality loss, symptom response, or prescribed stop. |
| SAME IDENTITY PRESCRIPTION CHANGES | load, steps, duration, support level, load side, support side, effort, march height |
| NEW EXERCISE ID REQUIRED | walking suitcase carry, unsupported suitcase march, same-side wall support, two-dumbbell march, static suitcase hold |

## Complete Metadata Proposals

#### Proposed Production Contract: forearm-plank

| Field | Proposal |
| --- | --- |
| Family | core_control |
| Movement roles | anti_extension_core |
| Movement-role notes | Do not grant loaded_bracing merely because the trunk braces. |
| Training roles | activation, hypertrophy_accessory |
| Sections | activation, accessory |
| Primary muscles | trunk |
| Key secondary muscles | serratus, front_delts |
| Incidental contributors | glutes, quads, calves |
| Body regions | shoulder, ribcage, lumbar_spine, pelvis |
| Equipment | bodyweight, floor_space |
| Optional equipment | none |
| Prerequisites | basic forearm-supported upper-limb tolerance |
| Prerequisite notes | Minimum trunk-control competency should usually be handled by prescription/support rather than a hard gate. |
| Loading profile | Bodyweight, limited loadability, moderate local fatigue, low systemic fatigue, no external axial loading. |
| Support mechanics | base=prone; stance=bilateral; orientation=prone; amount=prescription_modifiable; relationship=bilateral; contacts=forearm:floor:weight_bearing:bilateral:primary, foot:floor:weight_bearing:bilateral:primary. Forearm and foot contacts define the standard task; knee support is a prescription-controlled same-identity variant. |
| Resistance/path | bodyweight; trajectory=low; line=low; laterality=bilateral_linked; fit=low. Bodyweight support path; lever changes are prescription/variant facts. |
| Scapular mechanics | Loaded scapular support is relevant but this is not a scapular-control selection row. |
| Prescription modes | timed_hold |
| Progression axes | duration, lever, support_reduction, effort |
| Response-sensitive modifications | Shorten duration or reduce sets while retaining forearm-plank identity., Use knee support or a shorter lever after limited response, then preserve later full-lever re-exposure evidence., Hold the current support/lever realization when tolerated; do not progress automatically. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | none |
| Contract gaps | none |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Straight-body forearm support requires anti-extension trunk control. |
| scapular_control | moderate | Forearm support requires shoulder/scapular support without wrist extension truth. |
| stability | moderate | Stationary bodyweight support has a stable base but full-body tension demand. |
| coordination | low | No locomotion or external implement path. |
| range | low | Static hold with limited joint excursion. |
| joint_control | moderate | Upper-limb support tolerance matters. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | high | accepted | straight-body-forearm-support | The identity is intentionally selected for anti-extension trunk control. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | none | accepted | bodyweight-static-support | No external load or loaded transport is present. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| gaitLoadTransferContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| upper_limb_support_loading | joint_stress | intrinsic | bilateral_or_systemic | accepted | Forearm support loads the upper-limb support chain. |
| long_lever_core | joint_stress | variant_dependent | side_neutral | accepted | Only realized when the prescription selects a reviewed long/full lever state. |

Legacy stress recommendation: jointStressTags=upper_limb_support_loading, cautionStressTags=none, contraindicatedStressTags=none. If structured and legacy intrinsic tags both exist, current profile building deduplicates same tag/source; production tests must prove no double-count before row merge.

Progression runway: early=Short duration or support/lever regression if accepted.; standard=Standard full-lever timed hold.; later=Longer duration, harder effort target, lever change, or reduced support.; runs out=Further challenge would require loading/dynamic variants or another anti-extension exercise.; not progression=Dead Bug to Forearm Plank is not automatic progression; high plank is a different support identity..

Response-sensitive modification possibilities: Shorten duration or reduce sets while retaining forearm-plank identity., Use knee support or a shorter lever after limited response, then preserve later full-lever re-exposure evidence., Hold the current support/lever realization when tolerated; do not progress automatically. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| dead-bug | lateral | context_dependent | none | Both can train anti-extension, but supine control and prone support are different contexts. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| position_control | required_for_progression | Ribcage-pelvis position preserves anti-extension purpose. |
| breathing_pressure_control | preferred | Useful quality cue, not always a progression blocker. |
| exercise_intent_preservation | required_for_progression | Sagging/position loss changes the intended task. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| anti_extension_core | dead-bug | false | Adds prone support anti-extension exposure distinct from supine Dead Bug. | Can duplicate anti-extension work already covered by Dead Bug or Pallof context. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Simple full-body support anti-extension exposure. | Do not add automatically when anti-extension exposure is already adequate. | Dead Bug or Pallof Press already satisfies the user's current control need. | Direct anti-extension trunk exposure, one event. | A legal slot specifically needs supported anti-extension control. | The session already has sufficient anti-extension/control work or upper-limb support is the limiter. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| grip-limited user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| shoulder-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| low-back-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| user with little walking space | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |

#### Proposed Production Contract: forearm-side-plank

| Field | Proposal |
| --- | --- |
| Family | core_control |
| Movement roles | anti_lateral_flexion_core |
| Movement-role notes | Do not grant carry. Foot stacking versus staggered stance should be prescription detail if side-plank task remains unchanged. |
| Training roles | activation, hypertrophy_accessory |
| Sections | activation, accessory |
| Primary muscles | trunk |
| Key secondary muscles | serratus, front_delts, hip_abductors |
| Incidental contributors | glutes, quads |
| Body regions | shoulder, ribcage, lumbar_spine, pelvis, hip |
| Equipment | bodyweight, floor_space |
| Optional equipment | none |
| Prerequisites | side-bearing forearm support tolerance |
| Prerequisite notes | Side support tolerance is hard-capability relevant; lever/support difficulty should be prescription-controlled. |
| Loading profile | Bodyweight lateral support, limited loadability unless future external loading is retained. |
| Support mechanics | base=side_support; stance=stacked_feet; orientation=lateral; amount=prescription_modifiable; relationship=side_neutral; contacts=forearm:floor:weight_bearing:unknown:primary, foot:floor:weight_bearing:unknown:primary. Lateral forearm/foot support defines the standard task; bent-knee support remains a same-identity prescription variant. |
| Resistance/path | bodyweight; trajectory=low; line=low; laterality=unilateral; fit=low. Side prescription and lever are realization facts. |
| Scapular mechanics | Support scapular control is meaningful context, not a scapular-preparation row. |
| Prescription modes | timed_hold |
| Progression axes | duration, lever, support_reduction, load, effort |
| Response-sensitive modifications | Use bent-knee support, shorter duration or reduced effort after limited response., Preserve side-specific response and review load/support side before changing identity., Represent later tolerated long-lever or reduced-support re-exposure without erasing prior evidence. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Whether foot stacking/staggered stance should be prescribed or separate variants., Whether external loading remains same identity. |
| Contract gaps | none |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Side support directly challenges anti-lateral trunk control. |
| scapular_control | moderate | Support shoulder/scapula must tolerate side support. |
| stability | moderate | Narrow side base and lever alter stability. |
| coordination | low | Static hold with limited movement path. |
| range | low | Static support position. |
| joint_control | moderate | Shoulder/hip support position matters. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | high | accepted | side-forearm-support | The identity is intentionally selected for anti-lateral-flexion control. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | none | accepted | bodyweight-static-support | No external load or loaded transport is present. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| gaitLoadTransferContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| upper_limb_support_loading | joint_stress | intrinsic | prescription_side | accepted | Support side loads the upper-limb support chain. |
| lateral_trunk_loading | joint_stress | intrinsic | prescription_side | accepted | Side support creates lateral trunk loading. |
| long_lever_core | joint_stress | variant_dependent | prescription_side | accepted | Only realized when lever choice is reviewed as long-lever exposure. |

Legacy stress recommendation: jointStressTags=upper_limb_support_loading, lateral_trunk_loading, cautionStressTags=none, contraindicatedStressTags=none. Same tag/source dedupe must be retained; long_lever_core should not go in legacy arrays unless realized by reviewed variant.

Progression runway: early=Bent-knee or short-duration side support.; standard=Full side support timed hold.; later=Duration, lever, reduced support, or carefully reviewed external load.; runs out=Further challenge becomes a different side-plank variation or a carry/lateral-control exercise.; not progression=Side Plank to Suitcase Carry is not same-exercise progression..

Response-sensitive modification possibilities: Use bent-knee support, shorter duration or reduced effort after limited response., Preserve side-specific response and review load/support side before changing identity., Represent later tolerated long-lever or reduced-support re-exposure without erasing prior evidence. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| suitcase-carry | lateral | context_dependent | none | Both can express lateral trunk control, but one is static side support and one is loaded gait. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| position_control | required_for_progression | Pelvis/ribcage side orientation preserves purpose. |
| side_or_symmetry_control | required_for_progression | Each-side completion matters. |
| support_control | preferred | Support quality can guide but may be adapted by prescription. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| anti_lateral_flexion_core | none | true | Bootstraps direct side-support anti-lateral-flexion candidate pool. | Can overlap later with suitcase carry when the session already has lateral trunk exposure. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Direct static anti-lateral trunk control without walking or implement grip. | May duplicate lateral trunk work in a carry-focused session. | Suitcase carry is already selected for appropriate lateral trunk exposure and support tolerance is not the goal. | Direct anti-lateral trunk exposure; side-specific. | A legal slot needs direct anti-lateral control without loaded gait. | The user needs carry capacity rather than static side support, or shoulder side support is limiting. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| grip-limited user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| shoulder-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| low-back-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| user with little walking space | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |

#### Proposed Production Contract: machine-abdominal-crunch

| Field | Proposal |
| --- | --- |
| Family | core_control |
| Movement roles | trunk_flexion |
| Movement-role notes | Direct flexion role, not a generic ab-machine bucket. |
| Training roles | hypertrophy_accessory, secondary_strength |
| Sections | accessory |
| Primary muscles | trunk |
| Key secondary muscles | none |
| Incidental contributors | hip flexors if setup allows substitution |
| Body regions | ribcage, lumbar_spine, pelvis |
| Equipment | selectorized_machine |
| Optional equipment | none |
| Prerequisites | ability to set up and exit the specific machine safely |
| Prerequisite notes | Machine quality is not assumed; geometry may make a row unsuitable for some users. |
| Loading profile | External guided load, high loadability, local trunk fatigue, low gait/systemic demand. |
| Support mechanics | base=seated; stance=bilateral; orientation=upright; amount=substantial; relationship=bilateral; contacts=seat:machine:weight_bearing:side_neutral:primary, back:machine:positioning:side_neutral:secondary. Machine geometry and pads materially define the identity. |
| Resistance/path | machine_guided; trajectory=low; line=low; laterality=bilateral_linked; fit=machine_geometry. Machine design may materially change path and suitability. |
| Scapular mechanics | Not relevant beyond setup contact. |
| Prescription modes | repetition_sets |
| Progression axes | load, reps, sets, range, tempo |
| Response-sensitive modifications | Review load, range, repetitions, sets or tempo before considering another exercise., A reduced-range tolerated exposure remains distinct from a prior full-range limited exposure., Do not infer that loaded flexion is tolerated at every future dose. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Specific machine geometry can change exercise truth., Phase context cannot be globally fixed. |
| Contract gaps | Equipment requirement can name abdominal_crunch machine via machineIds, but capability key itself is selectorized_machine. |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Intentional controlled flexion is the task. |
| scapular_control | low | Scapula are not a selection purpose. |
| stability | low | Machine support constrains path. |
| coordination | low | Guided single-path repetition. |
| range | moderate | Range target is meaningful and prescription controlled. |
| joint_control | moderate | Spinal/trunk flexion tolerance matters. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledFlexionContribution | high | accepted | guided-trunk-flexion-machine-path | The identity is intentionally selected for controlled trunk flexion. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| gaitLoadTransferContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| loaded_spinal_flexion | joint_stress | intrinsic | side_neutral | accepted | Controlled loaded trunk/spinal flexion is intrinsic to this identity. |

Legacy stress recommendation: jointStressTags=loaded_spinal_flexion, cautionStressTags=none, contraindicatedStressTags=none. Structured/legacy same tag/source dedupe must be tested; no caution/contra placement without reviewed reason.

Progression runway: early=Low load, controlled partial range if tolerated.; standard=Reviewed machine setup, controlled range, repetition sets.; later=Load, reps, sets, range, or tempo.; runs out=Machine stack/setup no longer fits productive stimulus or tolerance.; not progression=Cable crunch or reverse crunch is a different exercise identity..

Response-sensitive modification possibilities: Review load, range, repetitions, sets or tempo before considering another exercise., A reduced-range tolerated exposure remains distinct from a prior full-range limited exposure., Do not infer that loaded flexion is tolerated at every future dose. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| range_control | required_for_progression | Range must preserve controlled flexion purpose. |
| tempo_control | preferred | Tempo can refine stimulus without always blocking progression. |
| exercise_intent_preservation | required_for_progression | Hip substitution or uncontrolled motion changes the task. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| trunk_flexion | none | true | Bootstraps direct controlled trunk-flexion candidate pool. | Can be unnecessary when direct flexion is not a current goal or tolerance is unclear. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Guided loadable trunk flexion for direct development. | Should not be added merely because user has abs. | A direct trunk-flexion slot is not requested or current trunk work already meets the plan. | Direct trunk-flexion developmental exposure; machine-specific setup provenance. | A program needs direct controlled flexion and machine access/tolerance is present. | Pain/tolerance, phase context, or session goal does not call for direct flexion. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | unavailable | Equipment, space, or setup makes this concept unavailable. |
| intermediate commercial-gym hypertrophy | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| grip-limited user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| shoulder-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| low-back-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| user with little walking space | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |

#### Proposed Production Contract: half-kneeling-high-to-low-cable-chop

| Field | Proposal |
| --- | --- |
| Family | core_control |
| Movement roles | trunk_rotation |
| Movement-role notes | Do not grant anti_rotation_core; the identity produces controlled rotation. |
| Training roles | activation, hypertrophy_accessory, secondary_strength |
| Sections | activation, accessory |
| Primary muscles | trunk |
| Key secondary muscles | glutes |
| Incidental contributors | shoulders, arms, hip adductors |
| Body regions | thoracic_spine, ribcage, lumbar_spine, pelvis, hip, shoulder |
| Equipment | cable_stack, cable_anchor_high, floor_space |
| Optional equipment | none |
| Prerequisites | ability to understand cable setup and half-kneeling side setup |
| Prerequisite notes | Cable setup skill is a setup prerequisite; load/range tolerance belongs to prescription. |
| Loading profile | Cable-guided external load, moderate loadability, controlled rotational range. |
| Support mechanics | base=half_kneeling; stance=half_kneeling_lead_side; orientation=upright; amount=none; relationship=side_neutral; contacts=knee:floor:weight_bearing:unknown:primary, foot:floor:weight_bearing:unknown:primary. Half-kneeling contacts are explicit; the cable anchor is resistance-path metadata, not body support. |
| Resistance/path | cable_anchored; trajectory=moderate; line=high; laterality=unilateral; fit=setup_geometry. High-anchor setup and user position determine path. |
| Scapular mechanics | Shoulder/scapular participation is contextual, not a scapular-control row. |
| Prescription modes | repetition_sets |
| Progression axes | load, reps, sets, range, tempo |
| Response-sensitive modifications | Review cable load, rotational range, stance, side and tempo after a limited response., Preserve half-kneeling side and load direction in the linked prescription., Allow later tolerated re-exposure at a modified range without manufacturing permanent rotation intolerance. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Allowed pelvis rotation amount needs owner confirmation., Half-kneeling support is not represented exactly. |
| Contract gaps | none |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Controlled rotation is the selected task. |
| scapular_control | low | Arms transmit resistance but scapula are not the target. |
| stability | moderate | Half-kneeling stance and cable pull require position control. |
| coordination | moderate | Trunk rotation and cable path must coordinate. |
| range | moderate | Rotation range is meaningful and prescription controlled. |
| joint_control | moderate | Rotation tolerance and cable setup matter. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | high | accepted | high-to-low-cable-rotation | The identity is intentionally selected for controlled trunk rotation. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| loadedBracingContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| gaitLoadTransferContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| loaded_trunk_rotation | joint_stress | intrinsic | prescription_side | accepted | Controlled resisted rotation is intrinsic; load/range/side are prescription facts. |

Legacy stress recommendation: jointStressTags=loaded_trunk_rotation, cautionStressTags=none, contraindicatedStressTags=none. Do not add flexion, extension, or overhead tags from path/anchor alone.

Progression runway: early=Light load and controlled partial range.; standard=Per-side repetition sets through reviewed range.; later=Load, reps, sets, range, or tempo.; runs out=Further challenge becomes another rotational exercise or different anchor/stance identity.; not progression=Pallof Press to Cable Chop is not same-exercise progression..

Response-sensitive modification possibilities: Review cable load, rotational range, stance, side and tempo after a limited response., Preserve half-kneeling side and load direction in the linked prescription., Allow later tolerated re-exposure at a modified range without manufacturing permanent rotation intolerance. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| pallof-press | lateral | context_dependent | none | Anti-rotation and controlled rotation are related but not interchangeable. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| movement_control | required_for_progression | Rotation must be intentional and controlled. |
| side_or_symmetry_control | required_for_progression | Per-side prescription must be completed truthfully. |
| range_control | preferred | Range can be adjusted by prescription. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| trunk_rotation | none | true | Bootstraps controlled trunk-rotation candidate pool. | Can be redundant if no current rotation need exists or anti-rotation already satisfies the request. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Controlled resisted rotation with adjustable cable line. | Should not appear merely because controlled rotation exists in vocabulary. | Pallof/Dead Bug/trunk work already addresses the actual current role. | Direct controlled-rotation exposure, side-specific. | A legal slot needs controlled rotation and cable setup is available. | The session needs anti-rotation or no direct rotation exposure. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | unavailable | Equipment, space, or setup makes this concept unavailable. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| grip-limited user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| shoulder-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| low-back-sensitive user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| user with little walking space | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |

#### Proposed Production Contract: farmer-carry

| Field | Proposal |
| --- | --- |
| Family | carry_load |
| Movement roles | carry, loaded_bracing |
| Movement-role notes | Carry and loaded_bracing are reviewed independently; the row is not mandatory conditioning. |
| Training roles | capacity, hypertrophy_accessory, secondary_strength |
| Sections | main, accessory |
| Primary muscles | trunk, upper_back |
| Key secondary muscles | glutes, quads, hamstrings |
| Incidental contributors | forearms are not represented in MuscleGroup, calves, shoulder stabilizers |
| Body regions | shoulder, wrist, lumbar_spine, pelvis, hip, knee, ankle |
| Equipment | dumbbell_pair, loaded_gait_space, stable_loaded_standing_space |
| Optional equipment | none |
| Prerequisites | ability to walk while holding two implements, ability to grip two implements |
| Prerequisite notes | Not inherently heavy; grip/load limits should usually be prescription facts. |
| Loading profile | External bilateral implement load, loadable, systemic and local grip/trunk contribution, not inherently maximal. |
| Support mechanics | base=standing; stance=unknown; orientation=upright; amount=none; relationship=bilateral; contacts=foot:floor:weight_bearing:alternating:primary. Unsupported loaded gait; loaded_gait_space implies standing-space truth but requirement should include stable_loaded_standing_space explicitly for review clarity. |
| Resistance/path | free_implement; trajectory=high; line=low; laterality=bilateral_independent; fit=low. Free implements in each hand; load symmetry is identity truth. |
| Scapular mechanics | Upper-quarter support of implements is meaningful but not a scapular-control selection row. |
| Prescription modes | distance_carry, timed_carry |
| Progression axes | load, distance, trips, duration, effort |
| Response-sensitive modifications | Review load, trip distance, trip count, duration, effort and grip demands before substitution., Shorter-distance tolerated exposure does not prove longer-distance tolerance., Later tolerated re-exposure remains possible after a limited high-dose carry. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Exact turn/set-down representation needs prescription standards., Forearm muscle target cannot be represented. |
| Contract gaps | No forearm/grip MuscleGroup; loaded gait trip/set-down standards remain prescription-detail only. |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Loaded transport requires trunk control under external load. |
| scapular_control | moderate | Loaded hands require upper-quarter position control without becoming a scapular exercise. |
| stability | moderate | Walking under load has dynamic stability demand. |
| coordination | moderate | Gait, load, and posture must remain coordinated. |
| range | low | No large-range joint target is intrinsic. |
| joint_control | moderate | Load and gait create stress/pain relevance without being inherently heavy. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | high | accepted | bilateral-loaded-gait-event | Loaded walking with bilateral implements materially expresses loaded bracing. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| gaitLoadTransferContribution | high | accepted | bilateral-loaded-gait-event | Walking under external load materially expresses gait/load transfer. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| loaded_gait | joint_stress | intrinsic | bilateral_or_systemic | accepted | Walking under load is intrinsic. |
| grip_loading | joint_stress | intrinsic | bilateral_or_systemic | accepted | Holding two implements loads grip. |
| grip_intensive | joint_stress | dose_created | bilateral_or_systemic | accepted | Only if future dose thresholds classify grip intensity. |
| heavy_axial_loading | joint_stress | dose_created | bilateral_or_systemic | accepted | Only if future dose thresholds classify heavy axial exposure. |

Legacy stress recommendation: jointStressTags=loaded_gait, grip_loading, cautionStressTags=none, contraindicatedStressTags=none. Do not place grip_intensive or heavy_axial_loading statically; future thresholds must create realized exposure from the same source event.

Progression runway: early=Light implements and short distance/time.; standard=Reviewed loaded walking distance or timed carry.; later=Load, distance, trips, duration, or effort.; runs out=Gait space, grip, recovery, or carry goal no longer supports more carry exposure.; not progression=Making it maximal strongman loading or a mandatory finisher is not progression..

Response-sensitive modification possibilities: Review load, trip distance, trip count, duration, effort and grip demands before substitution., Shorter-distance tolerated exposure does not prove longer-distance tolerance., Later tolerated re-exposure remains possible after a limited high-dose carry. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| suitcase-carry | lateral | context_dependent | none | Bilateral and unilateral carries serve related but distinct tasks. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| gait_load_transfer_control | required_for_progression | Loaded walking quality preserves carry identity. |
| position_control | required_for_progression | Upright trunk position preserves loaded bracing purpose. |
| side_or_symmetry_control | observational | Load symmetry matters but can be prescribed. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| carry, loaded_bracing | none | true | Bootstraps bilateral loaded gait/carry capacity. | Can crowd sessions if treated as universal finisher. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Simple loaded gait and grip/trunk capacity exposure. | Should not finish every workout by default. | Loaded bracing or grip/capacity exposure is already sufficient from other work. | One bilateral loaded-gait source event with grip and bracing descriptors. | Carry/capacity or loaded-gait exposure is a real session need. | Walking space, grip, fatigue, or recovery makes marginal value poor. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| grip-limited user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| shoulder-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| low-back-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| user with little walking space | unavailable | Equipment, space, or setup makes this concept unavailable. |

#### Proposed Production Contract: suitcase-carry

| Field | Proposal |
| --- | --- |
| Family | carry_load |
| Movement roles | carry, anti_lateral_flexion_core, loaded_bracing |
| Movement-role notes | Anti-rotation expression is mechanics context, not a separate legal movement role in this row. |
| Training roles | capacity, hypertrophy_accessory, secondary_strength |
| Sections | main, accessory |
| Primary muscles | trunk |
| Key secondary muscles | upper_back, glutes, quads, hamstrings |
| Incidental contributors | forearms are not represented in MuscleGroup, calves, shoulder stabilizers |
| Body regions | shoulder, wrist, lumbar_spine, ribcage, pelvis, hip, knee, ankle |
| Equipment | dumbbells, loaded_gait_space, stable_loaded_standing_space |
| Optional equipment | none |
| Prerequisites | ability to walk while holding one implement, side-specific load tolerance |
| Prerequisite notes | Side selection and load are prescription facts; do not encode left/right in ID. |
| Loading profile | Unilateral external implement, loaded gait, high side relevance, not inherently heavy. |
| Support mechanics | base=standing; stance=unknown; orientation=upright; amount=none; relationship=unknown; contacts=foot:floor:weight_bearing:alternating:primary. Unsupported loaded gait with unilateral load side. |
| Resistance/path | free_implement; trajectory=high; line=low; laterality=unilateral; fit=low. One implement side is prescription-realized. |
| Scapular mechanics | Loaded upper-quarter position is context; not a scapular row. |
| Prescription modes | distance_carry, timed_carry |
| Progression axes | load, distance, trips, duration, effort |
| Response-sensitive modifications | Review load, distance, trips, effort and load side before considering replacement., Preserve left/right load-side response separately and expose both sides when performed., A later tolerated exposure on the same side or opposite side does not erase prior side-specific evidence. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Anti-rotation magnitude is likely but not independently proven from lateral/gait cluster., Forearm muscle target cannot be represented. |
| Contract gaps | No forearm/grip MuscleGroup. |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | high | Loaded transport requires trunk control under external load. |
| scapular_control | moderate | Loaded hands require upper-quarter position control without becoming a scapular exercise. |
| stability | moderate | Walking under load has dynamic stability demand. |
| coordination | moderate | Gait, load, and posture must remain coordinated. |
| range | low | No large-range joint target is intrinsic. |
| joint_control | moderate | Load and gait create stress/pain relevance without being inherently heavy. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | moderate | accepted | unilateral-loaded-gait-event | Unilateral load may require resisting unwanted rotation while walking. Uncertainty: Magnitude depends on load side, gait, and strategy. |
| antiLateralFlexionContribution | high | accepted | unilateral-loaded-gait-event | Unilateral loaded walking materially expresses anti-lateral trunk control. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | high | accepted | unilateral-loaded-gait-event | External load during gait materially expresses loaded bracing. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |
| gaitLoadTransferContribution | high | accepted | unilateral-loaded-gait-event | Walking under unilateral load materially expresses gait/load transfer. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| loaded_gait | joint_stress | intrinsic | bilateral_or_systemic | accepted | Walking under load is intrinsic. |
| grip_loading | joint_stress | intrinsic | prescription_side | accepted | Holding one implement loads the prescribed side. |
| lateral_trunk_loading | joint_stress | intrinsic | prescription_side | accepted | Unilateral load creates lateral trunk loading. |
| grip_intensive | joint_stress | dose_created | prescription_side | accepted | Only if future dose thresholds classify grip intensity. |
| heavy_axial_loading | joint_stress | dose_created | bilateral_or_systemic | accepted | Only if future dose thresholds classify heavy axial exposure. |

Legacy stress recommendation: jointStressTags=loaded_gait, grip_loading, lateral_trunk_loading, cautionStressTags=none, contraindicatedStressTags=none. Do not statically add grip_intensive/heavy_axial_loading; one source event must not become multiple full grip events.

Progression runway: early=Light implement, short distance/time, reviewed side plan.; standard=Single-side or each-side distance/timed carry.; later=Load, distance, trips, duration, or effort.; runs out=Side tolerance, grip, gait space, or fatigue makes added carry exposure low value.; not progression=Side plank to suitcase carry is not same-exercise progression..

Response-sensitive modification possibilities: Review load, distance, trips, effort and load side before considering replacement., Preserve left/right load-side response separately and expose both sides when performed., A later tolerated exposure on the same side or opposite side does not erase prior side-specific evidence. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| forearm-side-plank | lateral | context_dependent | none | Both can express lateral trunk control but static support and loaded gait differ. |
| farmer-carry | lateral | context_dependent | none | Bilateral and unilateral carry variants answer different needs. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| side_or_symmetry_control | required_for_progression | Side prescription and each-side completion preserve identity. |
| gait_load_transfer_control | required_for_progression | Walking under load is the task. |
| position_control | required_for_progression | Avoiding uncontrolled trunk collapse preserves purpose. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| carry, anti_lateral_flexion_core, loaded_bracing | none | true | Bootstraps unilateral carry and anti-lateral loaded-gait exposure. | Can overlap side plank or farmer carry depending on goal. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| One source event can provide unilateral carry, lateral trunk, grip, and loaded-gait evidence. | Should not be added just because it touches several future ledger descriptors. | Side plank covers lateral control or farmer carry covers loaded gait adequately. | One unilateral loaded-gait event with side-specific descriptors. | A real side-specific carry/lateral-control capacity need exists. | The session already has enough carry/lateral/grip exposure or walking space is absent. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| grip-limited user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| shoulder-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| low-back-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| user with little walking space | unavailable | Equipment, space, or setup makes this concept unavailable. |

#### Proposed Production Contract: wall-supported-suitcase-march

| Field | Proposal |
| --- | --- |
| Family | carry_load |
| Movement roles | loaded_bracing |
| Movement-role notes | Do not grant carry or hard anti-lateral-flexion role. Anti-lateral mechanics remain contextual/needs_review until support magnitude and control can be represented. |
| Training roles | activation, capacity |
| Sections | activation, accessory |
| Primary muscles | trunk |
| Key secondary muscles | glutes, quads |
| Incidental contributors | hip flexors are not represented in MuscleGroup, forearms are not represented in MuscleGroup, calves, shoulder support side |
| Body regions | shoulder, wrist, lumbar_spine, ribcage, pelvis, hip, knee, ankle |
| Equipment | dumbbells, wall, stable_loaded_standing_space |
| Optional equipment | none |
| Prerequisites | ability to march while supported, ability to grip one dumbbell |
| Prerequisite notes | Support solves much of the balance problem; do not hard-gate ordinary coaching needs. |
| Loading profile | Stationary unilateral dumbbell march, support-modified, no distance, not inherently heavy. |
| Support mechanics | base=standing; stance=alternating_march; orientation=upright; amount=prescription_modifiable; relationship=opposite_side_load; contacts=foot:floor:weight_bearing:alternating:primary, hand:wall:balance_assist:unknown:secondary. Wall support force and side relationship must be prescription-realized. |
| Resistance/path | free_implement; trajectory=moderate; line=low; laterality=alternating; fit=setup_geometry. Free implement plus wall support; side relationship is essential. |
| Scapular mechanics | Wall support is support mechanics, not scapular preparation. |
| Prescription modes | step_march |
| Progression axes | load, steps, duration, support_reduction, effort |
| Response-sensitive modifications | Review load, steps, duration, wall-support amount, support side and effort after limited response., A tolerated highly supported realization does not create permanent support dependence., Preserve later reduced-support re-exposure while keeping stationary march distinct from walking carry. |
| Phase status | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |
| Unresolved unknowns | Lateral trunk and gait/load-transfer mechanics are support-force dependent. |
| Contract gaps | Anti-lateral exposure remains contextual/needs_review until support-force effects receive human exercise-science review. |

Generic demands:

| Dimension | Level | Evidence |
| --- | --- | --- |
| trunk_control | moderate | Support-modified unilateral loaded march requires trunk position control. |
| scapular_control | low | Wall hand/support and load arm require position but are not target. |
| stability | moderate | Stationary alternating march under support has balance/stability demand. |
| coordination | moderate | Alternating march, load side, and support side must coordinate. |
| range | low | March height is prescribed but no large range target. |
| joint_control | moderate | Loaded march and support side matter for pain/stress context. |

Trunk mechanics:

| Function | Level | Status | Evidence cluster | Claim / uncertainty |
| --- | --- | --- | --- | --- |
| breathingPressureCoordination | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiExtensionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| antiLateralFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledFlexionContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| controlledRotationContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |
| loadedBracingContribution | moderate | accepted | supported-unilateral-loaded-march | Holding load while marching expresses support-modified loaded bracing. Uncertainty: Magnitude depends heavily on wall support force and load. |
| gaitLoadTransferContribution | unknown | needs_review | not-reviewed-for-this-identity | No accepted curation claim. Uncertainty: Unknown remains unknown until field-specific owner/human review exists. |

Structured stress:

| Tag | Source | Scope | Side | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| loaded_march | joint_stress | intrinsic | bilateral_or_systemic | accepted | Stationary loaded march is intrinsic. |
| grip_loading | joint_stress | intrinsic | prescription_side | accepted | One dumbbell creates load-side grip exposure. |
| lateral_trunk_loading | joint_stress | prescription_modifiable | prescription_side | needs_review | Wall support/load/support-force relationship must realize or remove lateral trunk loading; production scoring must not treat this as accepted anti-lateral exposure yet. |

Legacy stress recommendation: jointStressTags=loaded_march, grip_loading, cautionStressTags=none, contraindicatedStressTags=none. Do not add loaded_gait, carry, distance, or hard anti-lateral truth. lateral_trunk_loading remains structured, prescription-realized, and needs_review until support magnitude is modeled.

Progression runway: early=Light load, high support, low step count or short duration.; standard=Opposite wall support, alternating stationary march, both load sides across sets.; later=Load, steps, duration, reduced support, or effort.; runs out=Reduced support or walking starts changing identity toward suitcase carry or unsupported march.; not progression=Wall march to suitcase carry is not same-exercise progression; adding walking distance changes identity..

Response-sensitive modification possibilities: Review load, steps, duration, wall-support amount, support side and effort after limited response., A tolerated highly supported realization does not create permanent support dependence., Preserve later reduced-support re-exposure while keeping stationary march distinct from walking carry. These preserve exact-realization evidence and never authorize automatic progression, regression or replacement.

Transition proposals:

| Target | Direction | Class | Effect | Reason |
| --- | --- | --- | --- | --- |
| suitcase-carry | progression | context_dependent | none | May prepare for walking suitcase carry, but walking and support removal change identity. |

Execution-standard needs:

| Dimension | Importance | Reason |
| --- | --- | --- |
| support_control | required_for_progression | Support force/side relationship preserves identity. |
| side_or_symmetry_control | required_for_progression | Both load sides across sets must be represented. |
| movement_control | preferred | March height/control guides dose. |

Phase-context audit:

| Question | Answer |
| --- | --- |
| CURRENT GLOBAL PHASE VALUE WOULD BE TRUTHFUL? | no |
| ROLE/SECTION-SCOPED EVIDENCE REQUIRED? | yes |
| ACCEPTED PHASE EVIDENCE AVAILABLE? | yes |
| NEEDS_REVIEW? | yes |
| UNKNOWN? | yes |
| PRODUCTION PHASE STATUS | OWNER_DECISIONS_APPLIED_CONTEXTUAL_ACTIVATION_GATE_FAILED |

Candidate-pool effect:

| Requested roles | Competes with | Bootstrap? | Diversity | Redundancy risk |
| --- | --- | --- | --- | --- |
| loaded_bracing | none | true | Adds stationary supported loaded-march option for limited walking space. | Could overlap suitcase carry only after walking space, support removal, and lateral trunk exposure are explicitly requested and reviewed. |

Marginal-value / workout-length review:

| Unique value | Redundancy risk | Existing coverage | Ledger | New slot when | Do not add when |
| --- | --- | --- | --- | --- | --- |
| Supported stationary loaded march with no gait-space requirement. | Should not be added if suitcase carry or simpler marching already covers the need. | Suitcase carry covers loaded gait/carry need or side plank covers direct anti-lateral control. | One supported loaded-march event with side/support descriptors, no distance. | A user needs supported loaded bracing through marching or has little walking space. | The goal is loaded walking gait, support-free carry capacity, or accepted anti-lateral trunk exposure. |

Persona review:

| Persona | Classification | Reason |
| --- | --- | --- |
| novice general fitness | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| beginner home dumbbells | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| intermediate commercial-gym hypertrophy | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| advanced strength/hypertrophy user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| posture/movement-quality user | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| pain-aware return user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| grip-limited user | prescription_review_required | Potentially useful only after side, load, support, or pain-response prescription review. |
| shoulder-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| low-back-sensitive user | context_dependent | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |
| user with little walking space | good_candidate_possibility | May be useful when the requested role, equipment, dose, and response make the identity appropriate. |

## Shared Evidence And Science Review

Every accepted non-unknown trunk-mechanics field includes curation provenance. External primary evidence remains `EXTERNAL_REFERENCE_PENDING`; no empirical activation percentages or threshold claims are made. Mechanically definitional claims are accepted as identity review, while physiological magnitude remains uncalibrated.

### Forearm Plank

- Shared evidence cluster: straight-body forearm support supplies anti-extension evidence and upper-limb support stress; it is one cluster, not independent proof of several functions.
- Claim: The identity is intentionally selected for anti-extension trunk control. Structured support: straight-body-forearm-support. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: No external load or loaded transport is present. Structured support: bodyweight-static-support. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Forearm Side Plank

- Shared evidence cluster: side forearm support supplies lateral-control role evidence, lateral trunk mechanics, and upper-limb support stress as one cluster.
- Claim: The identity is intentionally selected for anti-lateral-flexion control. Structured support: side-forearm-support. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: No external load or loaded transport is present. Structured support: bodyweight-static-support. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Machine Abdominal Crunch

- Shared evidence cluster: machine-guided trunk flexion supplies both movement-role truth and loaded_spinal_flexion stress; not independent evidence.
- Claim: The identity is intentionally selected for controlled trunk flexion. Structured support: guided-trunk-flexion-machine-path. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Half-Kneeling High-to-Low Cable Chop

- Shared evidence cluster: high-to-low resisted rotation supplies controlled-rotation mechanics and loaded_trunk_rotation stress as one evidence cluster.
- Claim: The identity is intentionally selected for controlled trunk rotation. Structured support: high-to-low-cable-rotation. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Farmer Carry

- Shared evidence cluster: one bilateral loaded-gait event supplies loaded bracing, gait transfer, grip loading, and loaded_gait stress; do not ledger as independent full events.
- Claim: Loaded walking with bilateral implements materially expresses loaded bracing. Structured support: bilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: Walking under external load materially expresses gait/load transfer. Structured support: bilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Suitcase Carry

- Shared evidence cluster: one unilateral load + gait event contributes to anti-lateral, anti-rotation, loaded bracing, gait transfer, grip loading, loaded_gait, and lateral_trunk_loading.
- Claim: Unilateral load may require resisting unwanted rotation while walking. Structured support: unilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Magnitude depends on load side, gait, and strategy.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: Unilateral loaded walking materially expresses anti-lateral trunk control. Structured support: unilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: External load during gait materially expresses loaded bracing. Structured support: unilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.
- Claim: Walking under unilateral load materially expresses gait/load transfer. Structured support: unilateral-loaded-gait-event. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Mechanically definitional within the exact identity; physiological magnitude remains uncalibrated.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

### Wall-Supported Suitcase March

- Shared evidence cluster: supported unilateral load + alternating march is one cluster; lateral control and gait/load-transfer remain support-dependent rather than independently accepted.
- Claim: Holding load while marching expresses support-modified loaded bracing. Structured support: supported-unilateral-loaded-march. Owner/human basis: docs/training-engine-v2/TRUNK_CORE_DOMAIN_REVIEW.md, docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md, docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md, docs/training-engine-v2/TRUNK_CARRY_EQUIPMENT_CONTRACT.md, docs/training-engine-v2/STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT.md, docs/training-engine-v2/TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md. External primary evidence status: EXTERNAL_REFERENCE_PENDING. Uncertainty: Magnitude depends heavily on wall support force and load.. Risk of overreach: Do not convert mechanics into extra movement roles, pain stress, or independent ledger credits.

## Owner Decision Questions

No unresolved owner-decision questions remain inside this seven-exercise curation artifact. The contextual scorer remains non-default because its semantic activation gate failed in three winner-change cases.

## Current-Behavior Invariance

| Artifact | Current | Matches |
| --- | --- | --- |
| Production ranking fingerprint | f9e22a86a99361f6fa4cd36d663a8b448ec6f25a10301cc413ecdec31c9c206c | true |
| Comprehensive behavior fingerprint | 3a52602bd3ebcaf116a3289ff329e54c2374539a92974aca2bec33dec0b0de1f | true |
| Reference catalog fingerprint | 903e344207a91f4af6519f88c667f7baa5f2d04711579fc2e2effddc8820ef8c | true |
| Equipment legality fingerprint | 5aa3d161faf552652caec1b6b01e22f2c2718dfc12337d74329f4a39deb38869 | true |
| Expanded equipment fixture fingerprint | bb07188480cab4134ba4f2eb36dfa4f17e5d4d62d6139b539c5603ad602b482a | true |

## Whole-Body Roadmap Handoff

Whole-body audit is not started. The seven-row tranche and focused owner decisions are implemented; the exact next dependency is owner review of the three unexplained contextual-phase winner changes before `WHOLE_BODY_EXERCISE_KNOWLEDGE_AND_CANDIDATE_POOL_AUDIT`. The later audit must decide whether `MuscleGroup` should add forearm/grip or hip-flexor target status; do not add either now.

The later audit must cover chest, lats, mid/upper back, shoulders, arms, legs, glutes, calves, hip adductors/abductors, trunk, serratus/cuff/scapular work, and carries/capacity. The goal is meaningfully distinct, well-understood candidates, not a huge exercise count.
