# Trunk / Carry Pain-Stress Vocabulary and Receiver Review

## Boundary

This is a deterministic review and proposal-only laboratory updated after owner vocabulary approval. It adds no production exercise, reference-catalog exercise stress row, coefficient, hard gate, ranking behavior, phase behavior, assessment behavior, prescription generation, transition behavior, Session Composer, Weekly Composer, apps/**, or packages/engine/** change.

Pain-stress metadata describes a modeled training exposure. It does not describe a diagnosis, tissue damage, universal danger, exercise quality, exercise difficulty, progression, or a reason every athlete should avoid an exercise. A mechanical function is not automatically a pain-stress fact.

## Current Vocabulary Inventory

| Tag | Classes | Exercises | Sources | Intrinsic / dose | Variant / side | Treatment |
| --- | --- | --- | --- | --- | --- | --- |
| deep_knee_flexion | WELL_DEFINED, VARIANT_DEPENDENT | goblet-squat [loading.jointStressTags + cautionStressTags], leg-press [loading.jointStressTags], bodyweight-box-squat [loading.jointStressTags + cautionStressTags], split-squat [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Range dependent and often prescription modifiable; not inherently dose-created. | Variant dependent when box height, support, or depth target changes the range. Side: Potentially side-specific for unilateral lower-body prescriptions, but current matching has no usable side. | UNCHANGED |
| loaded_knee_flexion | WELL_DEFINED, DOSE_DEPENDENT | goblet-squat [loading.jointStressTags + cautionStressTags], leg-press [loading.jointStressTags + cautionStressTags], split-squat [loading.jointStressTags + cautionStressTags], step-up [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Load and range modifiable; heavy-versus-light magnitude belongs to prescription. | General for current loaded knee-flexion rows, with variant-specific magnitude. Side: Potentially side-specific in split, step, and single-side prescriptions. | UNCHANGED |
| loaded_spinal_flexion | PLAUSIBLE_NEEDS_REVIEW, OVERBROAD | none | none | Load and range modifiable; exact flexion direction should be reviewed per exercise. | General enough to be useful, but current mappings are broader than controlled crunch work. Side: Usually bilateral or midline; side may be irrelevant unless a future prescription creates asymmetry. | REVIEW_LATER |
| loaded_spinal_extension | PLAUSIBLE_NEEDS_REVIEW | none | none | Load, range, and setup dependent. | General but needs field-level provenance because current uses span shoulder press and glute bridge. Side: Mostly midline unless future unilateral loading creates asymmetric extension demand. | REVIEW_LATER |
| heavy_axial_loading | UNUSED, DOSE_DEPENDENT | none | none | Dose-created and threshold dependent by definition. | Not a truthful static carry tag when the legal prescription may be light. Side: Usually systemic/axial rather than left-right, though asymmetry can coexist with lateral loading. | MIGRATE_TO_STRUCTURED_SCOPE |
| loaded_hinge | WELL_DEFINED, DOSE_DEPENDENT | dumbbell-romanian-deadlift [loading.jointStressTags + cautionStressTags], cable-pull-through [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Load and range modifiable, but the hinge pattern is stable for current mapped rows. | General for current hinge/row exposure, with prescription-level magnitude. Side: Potentially side-specific for unilateral hinges, not current catalog use. | UNCHANGED |
| overhead_pressing | WELL_DEFINED | serratus-wall-slide [loading.jointStressTags + cautionStressTags], dumbbell-shoulder-press [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Range, load, and implement path modifiable. | General for shoulder-press and wall-slide rows; anchor height alone must not create it. Side: Potentially side-specific for single-arm prescriptions. | UNCHANGED |
| horizontal_pressing | WELL_DEFINED | push-up [loading.jointStressTags + cautionStressTags], dumbbell-bench-press [loading.jointStressTags + cautionStressTags], machine-chest-press [loading.jointStressTags + cautionStressTags], cable-chest-fly [loading.jointStressTags] | cautionStressTags, loading.jointStressTags | Load and range modifiable. | General for the current push-up, bench, machine press, and cable fly rows. Side: Potentially side-specific for unilateral future prescriptions. | UNCHANGED |
| shoulder_abduction_external_rotation | PLAUSIBLE_NEEDS_REVIEW | cable-chest-fly [loading.jointStressTags + cautionStressTags], dumbbell-lateral-raise [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Range, load, and arm path modifiable. | General enough for current rows, but exact joint position needs provenance. Side: Potentially side-specific for single-arm or asymmetrical prescriptions. | REVIEW_LATER |
| wrist_extension_loading | WELL_DEFINED, VARIANT_DEPENDENT | push-up [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Support and hand position dependent. | Variant dependent; forearm support specifically removes ordinary wrist-extension loading. Side: Potentially side-specific for one-hand support, not current use. | UNCHANGED |
| high_impact | UNUSED | none | none | Often intrinsic to the movement class but magnitude remains dose and surface dependent. | Unknown for current catalog because no reference exercise uses it. Side: Potentially side-specific for unilateral impact but generally bilateral/systemic in simple matching. | REVIEW_LATER |
| grip_intensive | OVERBROAD, DOSE_DEPENDENT | chest-supported-dumbbell-row [loading.jointStressTags + cautionStressTags], one-arm-dumbbell-row [loading.jointStressTags + cautionStressTags], machine-row [loading.jointStressTags + cautionStressTags], seated-cable-row [loading.jointStressTags + cautionStressTags], lat-pulldown [loading.jointStressTags + cautionStressTags], dumbbell-romanian-deadlift [loading.jointStressTags], dumbbell-curl [loading.jointStressTags + cautionStressTags] | cautionStressTags, loading.jointStressTags | Dose-created/intensity dependent; light carries are not automatically intensive. | Overbroad as a static tag because implement, load, duration, and straps can change grip demand. Side: Potentially side-specific for unilateral load prescriptions. | MIGRATE_TO_STRUCTURED_SCOPE |
| long_lever_core | OVERBROAD, VARIANT_DEPENDENT | none | none | Variant and lever dependent rather than universally intrinsic to a base exercise identity. | Overbroad for lateral plank and support-regressed plank unless the prescription realizes the lever. Side: Generally midline for anti-extension; side plank needs a separate lateral-loading truth. | MIGRATE_TO_STRUCTURED_SCOPE |
| upper_limb_support_loading | WELL_DEFINED, VARIANT_DEPENDENT | none | none | Can be intrinsic to forearm-support identities, while support level, lever, duration, and side remain prescription facts. | Variant dependent for hand versus forearm support and for support-regressed prescriptions. Side: Side belongs in prescription realization; tag is side-neutral. | UNCHANGED |
| loaded_trunk_rotation | WELL_DEFINED, VARIANT_DEPENDENT | none | none | Intrinsic to a reviewed resisted-rotation identity, while load, range, side, and tempo are prescription facts. | Variant dependent when the movement is anti-rotation, flexion, extension, or anchor-only overhead setup rather than rotation. Side: Prescription side or direction may matter; tag is side-neutral. | UNCHANGED |
| lateral_trunk_loading | WELL_DEFINED, VARIANT_DEPENDENT | none | none | Intrinsic for reviewed side-plank or suitcase identities; support/load/side can alter realized magnitude or remove it. | Variant and prescription dependent when wall support, load side, lever, or support force materially changes exposure. Side: High side relevance, but side remains a prescription-realized fact. | UNCHANGED |
| loaded_gait | WELL_DEFINED, VARIANT_DEPENDENT | none | none | Intrinsic to walking carry identities; distance, duration, and load are prescription modifiable. | Absent from stationary marches and static holds. Side: Load side can matter for unilateral carries; gait exposure itself is often bilateral/systemic. | UNCHANGED |
| loaded_march | WELL_DEFINED, VARIANT_DEPENDENT | none | none | Intrinsic to reviewed loaded stationary march identities; steps, time, load, support, and side are prescription facts. | Variant dependent when walking distance appears or support removes the relevant exposure. Side: High side relevance through load side, support side, and stepping alternation. | UNCHANGED |
| grip_loading | WELL_DEFINED, DOSE_DEPENDENT | none | none | Intrinsic to implement-holding carry identities; grip_intensive remains dose-created and threshold-pending. | Variant dependent when straps, support, implement, or no-hold setup changes grip involvement. Side: Side follows load side and prescription laterality. | UNCHANGED |

Pain signals that can currently supply stress tags: HistoricalSensitivity.stressTags, CurrentDiscomfort.stressTags, ModeratePain.stressTags, AcuteSeverePain.stressTags, HardContraindication.stressTags. Receivers consuming canonical stress facts: pain_suitability, joint_cost, moderate_warning, hard_contraindication, acute_severe_eligibility, assessment_demand_reduction.

## Static Versus Prescription-Realized Exposure

Exercise-level stress metadata can truthfully identify intrinsic exposure and reviewed possible exposure channels. The accepted structured prescription contract can represent load, lever, support, side, range, duration, distance, trips, steps, tempo, effort, and one source exposure event. Therefore dose-created, side-specific, and variant-removable facts should not be converted into unconditional static candidate tags.

Minimum architecture recommendation: use structured exercise stress annotation before production metadata, then add prescription-realized stress evidence before hard/acute matching consumes modifiable exposure. Raw arrays remain sufficient only for today's simple intrinsic facts.

## Candidate Audit

| Candidate | Intrinsic exposures | Modifiable / variant / dose | Current tags | Potential tags | Source / receiver / side |
| --- | --- | --- | --- | --- | --- |
| forearm-plank | sustained forearm-supported upper-limb loading, bodyweight support, anti-extension function as movement purpose, not a stress tag | M: duration, effort, support level V: long_lever_core under ordinary or lengthened lever D: none | fit: long_lever_core only when the prescription realizes ordinary/full lever; no: wrist_extension_loading, heavy_axial_loading | upper_limb_support_loading | upper_limb_support_loading in joint_stress after owner curation; long_lever_core only through prescription realization. Support tag can affect pain_suitability, joint_cost, moderate_warning, and intrinsic hard/acute criteria. Side: No side for ordinary bilateral plank; side remains null. |
| forearm-side-plank | unilateral forearm support, lateral trunk loading, anti-lateral-flexion purpose as movement role, not tag | M: duration, support level, lever V: long-lever contribution if full lever is selected D: future external load | fit: none; no: long_lever_core as a substitute for lateral loading, wrist_extension_loading | upper_limb_support_loading, lateral_trunk_loading | Both proposed tags need joint_stress placement, with side truth deferred to prescription realization. One canonical fact per tag; lateral and support exposures must not clone the same fact. Side: Required for side-bearing support and lateral trunk exposure before prescription validation. |
| machine-abdominal-crunch | controlled loaded trunk flexion | M: machine load, range, tempo, repetition dose V: none D: high-load or high-volume flexion intensity | fit: loaded_spinal_flexion; no: loaded_spinal_extension, loaded_trunk_rotation | none | loaded_spinal_flexion in joint_stress is sufficient; caution/contraindicated placement requires owner-specific reason. Existing tag gives normal canonical pain receiver behavior without anatomy duplicate. Side: Generally not side-specific. |
| half-kneeling-high-to-low-cable-chop | controlled loaded trunk rotation, half-kneeling setup | M: load, range, tempo, per-side dose V: stance/setup adjustments D: none | fit: none; no: loaded_spinal_flexion, loaded_spinal_extension, overhead_pressing from anchor height alone | loaded_trunk_rotation | loaded_trunk_rotation in joint_stress after owner curation. Allows rotation-specific pain matching without confusing anti-rotation, flexion, extension, or overhead pressing. Side: Required for per-side chop direction and pain response validation. |
| farmer-carry | bilateral external load, loaded gait, grip loading | M: load, distance, duration, trips, turns, set-downs V: none D: grip_intensive, heavy_axial_loading | fit: none; no: heavy_axial_loading as static tag, grip_intensive at every legal load | loaded_gait, grip_loading | loaded_gait and grip_loading in joint_stress; grip_intensive/heavy_axial_loading only if future dose thresholds are realized. Loaded-walking and neutral grip facts support pain/joint receivers without making carries inherently heavy. Side: Grip can be per-hand; gait is generally bilateral/systemic for bilateral farmer carry. |
| suitcase-carry | unilateral external load, loaded gait, grip loading, lateral trunk loading | M: load side, distance, duration, trips, load magnitude V: none D: grip_intensive, heavy_axial_loading | fit: none; no: grip_intensive at every legal load, heavy_axial_loading as static tag | loaded_gait, lateral_trunk_loading, grip_loading | All three proposed exposure tags in joint_stress, with side compatibility deferred until prescription side is known. Farmer carry differs by lateral trunk loading and unilateral grip/load side, not by a side-encoded tag name. Side: Required for single-side or each-side prescriptions; tag remains side-neutral. |
| wall-supported-suitcase-march | stationary loaded march, unilateral load, wall support, grip loading, lateral trunk loading unless reviewed support removes it | M: support side, load side, support level, steps, duration, load V: lateral trunk loading under high support D: grip_intensive, heavy_axial_loading | fit: none; no: loaded_gait, high_impact, grip_intensive at every legal load | loaded_march, lateral_trunk_loading, grip_loading | loaded_march and grip_loading in joint_stress; lateral_trunk_loading requires prescription-realized support/load-side truth. Stationary march is visible to pain/joint receivers without granting walking distance or loaded-gait exposure. Side: Required for load side, support side, and alternating step side. |

## Potential New-Tag Analysis

| Concept | Proposed name | Recommendation | Candidates | Scope | Receiver need | Double-count risk |
| --- | --- | --- | --- | --- | --- | --- |
| sustained upper-limb support loading | upper_limb_support_loading | ACCEPT_FOR_OWNER_DECISION | forearm-plank, forearm-side-plank | Intrinsic to the reviewed forearm-support identities; magnitude is support, lever, duration, and effort modifiable. | Pain matching for shoulder/elbow support sensitivity and explicit hard/acute support restrictions. | Do not count it as anti-extension, lateral trunk loading, or long-lever core. |
| loaded trunk rotation | loaded_trunk_rotation | ACCEPT_FOR_OWNER_DECISION | half-kneeling-high-to-low-cable-chop | Intrinsic to the exact cable-chop identity; load and range remain prescription modifiable. | Pain matching for users who report loaded rotation sensitivity without treating anti-rotation as the same exposure. | Do not infer overhead pressing from high cable anchor or spinal flexion from chop path. |
| lateral trunk loading | lateral_trunk_loading | ACCEPT_FOR_OWNER_DECISION | forearm-side-plank, suitcase-carry, wall-supported-suitcase-march | Intrinsic to side-plank and suitcase identities, but support/load/lever materially alter magnitude. | Pain matching for side-specific trunk intolerance and prescription response requirements. | Do not also count it as long_lever_core unless a separate lever exposure is reviewed. |
| loaded gait | loaded_gait | ACCEPT_FOR_OWNER_DECISION | farmer-carry, suitcase-carry | Intrinsic to distance/timed walking carry identities; distance, turns, load, and duration are prescription modifiable. | Pain/joint-cost matching for users sensitive to loaded walking rather than static standing. | Do not grant it to stationary wall march or static holds. |
| loaded march | loaded_march | ACCEPT_FOR_OWNER_DECISION | wall-supported-suitcase-march | Intrinsic to the proposed stationary march identity; support, steps, time, and load are prescription modifiable. | Pain/joint-cost matching for loaded single-leg support/marching without granting loaded-walking capacity. | Do not also count as loaded_gait or distance carry. |
| loaded gait or march as one shared exposure | none | REJECT_AS_SHARED_TAG | farmer-carry, suitcase-carry, wall-supported-suitcase-march | Too broad for flat canonical matching because one pain signal/tag would match both walking and stationary prescriptions. | No distinct receiver needs the umbrella before it would create false positives. | Would make wall march look like distance carry and erase the equipment contract distinction. |
| grip loading distinct from grip_intensive | grip_loading | ACCEPT_FOR_OWNER_DECISION | farmer-carry, suitcase-carry, wall-supported-suitcase-march | Intrinsic to dumbbell carry/march identities; intensity is dose-created from load, duration, handle, and assistance. | Pain matching for hand/wrist/elbow grip exposure without pretending every carry is intensive. | Do not count both grip_loading and grip_intensive unless intensity threshold is explicitly realized. |

Rejected vague tags: core_stress, carry_stress, bad_posture, spinal_instability, unsafe_rotation, weak_core, poor_alignment, bracing_stress, hard_exercise.

## Source / Receiver Matrix

| Source | Signal | Legal | Warning | Canonical | Pain units | Joint units | Hard criteria | Acute criteria | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| joint_stress | current_discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | prescription |
| joint_stress | moderate_pain | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | prescription |
| joint_stress | hard_contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | none |
| joint_stress | acute_severe_pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | none |
| caution | current_discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | prescription |
| caution | moderate_pain | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | prescription |
| caution | hard_contraindication | LEGAL | no | 1 | 0 | 0 | 0 | 0 | none |
| caution | acute_severe_pain | LEGAL | no | 1 | 0 | 0 | 0 | 0 | none |
| contraindicated | current_discomfort | LEGAL | no | 1 | 1 | 0 | 0 | 0 | prescription |
| contraindicated | moderate_pain | LEGAL | yes | 1 | 1 | 0 | 0 | 0 | prescription |
| contraindicated | hard_contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | none |
| contraindicated | acute_severe_pain | LEGAL | no | 1 | 0 | 0 | 0 | 0 | none |
| joint_stress + caution | current_discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | prescription |
| joint_stress + caution | moderate_pain | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | prescription |
| joint_stress + caution | hard_contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | none |
| joint_stress + caution | acute_severe_pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | none |

Receiver-source summary: joint_stress feeds pain suitability, joint cost, moderate warning, hard criteria, and acute criteria. Caution feeds pain suitability, joint cost, and moderate warning, but is not hard/acute authority. Contraindicated-only feeds pain suitability, moderate warning, and explicit hard criteria, but not joint cost or acute criteria.

## Side-Specific Pain Gap

Current matchable pain signals have no usable side and the canonical matcher emits side null; unilateral trunk/carry compatibility must remain deferred to prescription-realized side truth until optional side is added to HistoricalSensitivity, CurrentDiscomfort, ModeratePain, AcuteSeverePain, and HardContraindication.

Minimum future contract: add optional side to the matchable pain signals, keep tags side-neutral, and evaluate bilateral, single-side, each-side, and alternating prescriptions only when prescription side behavior is known. Candidate Intelligence cannot decide load-side compatibility before prescription side is compiled.

## Intrinsic Versus Modifiable Hard Authority

Adopt Policy C: intrinsic candidate stress remains eligible for candidate hard/acute authority, while variant-, dose-, or prescription-removable exposure is deferred to prescription realization with traceable unresolved requirements.

Risk: Policy A over-rejects removable variants, while Policy B can hide unresolved prescription work. Policy C preserves intrinsic candidate truth and forces modifiable exposure into an explicit prescription requirement trace.

## Prescription-Realized Stress Concept

Add a future PrescriptionStressExposureTrace only after owner approval; it should expose prescriptionId, sourceExposureEventId, exerciseId, stressTag, exercisePotential, realizationStatus, side, load, range, support, lever, duration/distance/steps, provenance, and receiverEligibility.

Integration: validateStructuredPrescriptionContext should confirm whether a possible exposure is present, removed by reviewed variant, dose-not-yet-classified, or unknown. PainResponseRequirementTrace should point to unresolved prescription exposure. ExercisePerformanceRecord should record actual realized exposure and response. ProgressionEvidence should use completed performance and unresolved pain-response evidence. The Weekly Development Ledger should aggregate one completed source exposure event rather than cloned facts.

## Synthetic Receiver Matrix

| Candidate | Scenario | Legal | Warn | Canonical | Pain | Joint | Hard | Acute | Readiness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| forearm-plank | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-plank | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-plank | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| forearm-plank | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| forearm-plank | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-plank | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-plank | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-plank | multiple tags from one signal | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-side-plank | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-side-plank | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| forearm-side-plank | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| forearm-side-plank | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-side-plank | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| forearm-side-plank | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| forearm-side-plank | multiple tags from one signal | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| machine-abdominal-crunch | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| machine-abdominal-crunch | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| machine-abdominal-crunch | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| machine-abdominal-crunch | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| machine-abdominal-crunch | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| machine-abdominal-crunch | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| machine-abdominal-crunch | multiple tags from one signal | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| half-kneeling-high-to-low-cable-chop | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| half-kneeling-high-to-low-cable-chop | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| half-kneeling-high-to-low-cable-chop | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| half-kneeling-high-to-low-cable-chop | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| half-kneeling-high-to-low-cable-chop | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| half-kneeling-high-to-low-cable-chop | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| half-kneeling-high-to-low-cable-chop | multiple tags from one signal | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| farmer-carry | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| farmer-carry | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| farmer-carry | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| farmer-carry | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| farmer-carry | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| farmer-carry | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| farmer-carry | multiple tags from one signal | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| suitcase-carry | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| suitcase-carry | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| suitcase-carry | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| suitcase-carry | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| suitcase-carry | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| suitcase-carry | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| suitcase-carry | multiple tags from one signal | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | no pain | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| wall-supported-suitcase-march | unrelated current discomfort | LEGAL | no | 0 | 0 | 0 | 0 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| wall-supported-suitcase-march | matching current discomfort | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | matching moderate pain: avoid_aggravator | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_CANDIDATE_REVIEW |
| wall-supported-suitcase-march | matching moderate pain: reduce_load_and_range | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | matching moderate pain: substitute_role | LEGAL | yes | 1 | 1 | 1 | 0 | 0 | REQUIRES_SESSION_ROLE_SUBSTITUTION |
| wall-supported-suitcase-march | matching acute/severe pain | REJECTED | no | 1 | 0 | 0 | 0 | 1 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| wall-supported-suitcase-march | matching hard contraindication | REJECTED | no | 1 | 0 | 0 | 1 | 0 | EXECUTABLE_AT_CANDIDATE_SCOPE |
| wall-supported-suitcase-march | caution-only source | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | joint-source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | contraindicated-only placement | LEGAL | no | 1 | 1 | 0 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | duplicate source placement | LEGAL | no | 1 | 1 | 1 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | two distinct signals sharing one tag | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |
| wall-supported-suitcase-march | multiple tags from one signal | LEGAL | no | 2 | 2 | 2 | 0 | 0 | REQUIRES_PRESCRIPTION |

The synthetic rows use proposal-only strings in synthetic exercises and never add them to REFERENCE_EXERCISES. Representative receiver status values remain: hard=rejected, acute=legal.

## Variant And Dose Counterfactuals

| Candidate | Variant | Remain | Magnitude changes | Appear | Disappear | Unknown |
| --- | --- | --- | --- | --- | --- | --- |
| forearm-plank | shortened/support-regressed | upper_limb_support_loading | duration, effort, support | none | long_lever_core | none |
| forearm-plank | ordinary full lever | upper_limb_support_loading | duration, effort | long_lever_core | none | none |
| forearm-plank | lengthened lever | upper_limb_support_loading, long_lever_core | lever, duration, effort | none | none | whether a longer-lever tag split is needed later |
| forearm-side-plank | bent-knee/support-regressed | upper_limb_support_loading | lateral_trunk_loading, duration, support | none | none | whether lateral_trunk_loading can be removed under high support |
| forearm-side-plank | full lever | upper_limb_support_loading, lateral_trunk_loading | lever, duration | none | none | long_lever_core double-count policy |
| forearm-side-plank | externally loaded future state | upper_limb_support_loading, lateral_trunk_loading | load, lever, duration | possible grip_loading if held implement is introduced | none | whether external loading belongs in same exercise identity |
| half-kneeling-high-to-low-cable-chop | reduced range/light load | loaded_trunk_rotation | range, load | none | none | none |
| half-kneeling-high-to-low-cable-chop | ordinary reviewed dose | loaded_trunk_rotation | per-side dose | none | none | exact shoulder contribution |
| half-kneeling-high-to-low-cable-chop | greater range/load | loaded_trunk_rotation | range, load, tempo | none | none | whether any high-load threshold creates additional stress truth |
| farmer-carry | light short carry | loaded_gait, grip_loading | load, distance | none | grip_intensive, heavy_axial_loading | none |
| farmer-carry | moderate ordinary carry | loaded_gait, grip_loading | load, distance, trips | none | none | heavy_axial_loading threshold |
| farmer-carry | high-load long-distance future state | loaded_gait, grip_loading | load, distance, turns | grip_intensive, possible heavy_axial_loading after threshold approval | none | exact heavy threshold |
| suitcase-carry | left only | loaded_gait, grip_loading, lateral_trunk_loading | load side | none | none | side-specific pain compatibility until prescription validation |
| suitcase-carry | right only | loaded_gait, grip_loading, lateral_trunk_loading | load side | none | none | side-specific pain compatibility until prescription validation |
| suitcase-carry | each side | loaded_gait, grip_loading, lateral_trunk_loading | per-side exposure accounting | none | none | whether each side creates one or two prescription-side checks |
| suitcase-carry | reduced load | loaded_gait, grip_loading | load, lateral_trunk_loading | none | grip_intensive, heavy_axial_loading | none |
| suitcase-carry | greater load/distance | loaded_gait, grip_loading, lateral_trunk_loading | load, distance | possible grip_intensive after threshold approval | none | heavy_axial_loading threshold |
| wall-supported-suitcase-march | high support/light load | loaded_march, grip_loading | support, load, steps | none | loaded_gait, grip_intensive, heavy_axial_loading | whether lateral_trunk_loading is removed or reduced |
| wall-supported-suitcase-march | reduced support/moderate load | loaded_march, grip_loading | support, load, lateral_trunk_loading | lateral_trunk_loading if owner confirms support does not remove it | loaded_gait | none |
| wall-supported-suitcase-march | no walking distance | loaded_march | steps, duration | none | loaded_gait | none |

## Current-Tag Migration Risks

| Tag | Treatment | Risk |
| --- | --- | --- |
| loaded_spinal_flexion | REVIEW_LATER | Current hinge/row use and future machine-crunch use are not the same movement exposure. |
| loaded_spinal_extension | REVIEW_LATER | May be a conservative lumbar exposure rather than a precise extension movement fact. |
| heavy_axial_loading | MIGRATE_TO_STRUCTURED_SCOPE | Without load thresholds it would silently convert ordinary load into heavy load. |
| grip_intensive | MIGRATE_TO_STRUCTURED_SCOPE | The current name conflates any grip loading with high-intensity grip demand. |
| long_lever_core | MIGRATE_TO_STRUCTURED_SCOPE | Can double count trunk demand if used as a substitute for lateral trunk loading or anti-extension role. |

No migration is performed. Current production behavior remains unchanged.

## Owner Decisions Required

- Approve or rename each proposed stress tag before it enters JOINT_STRESS_TAGS.
- Approve source placement and exposureScope for every candidate/tag pair.
- Decide whether modifiable exposure uses Policy C trace semantics before hard/acute matching changes.
- Approve optional side fields for matchable pain signals and prescription-side compatibility rules.
- Approve grip_intensive and heavy_axial_loading dose thresholds before migration.
- Approve whether wall-supported suitcase march remains provisional or becomes a production identity.
- Curate exact seven-exercise metadata only after the above decisions are made.

## Recommended Minimum Implementation Boundary

- No production JointStressTag additions in this task.
- No current exercise stress metadata changes in this task.
- No pain coefficients, receiver policies, hard gates, rankings, phase, assessment, prescription generation, transitions, apps, packages/engine, Session Composer, or Weekly Composer changes.
- Tests and docs validate the proposal-only laboratory and current-behavior fingerprints.

## Behavior Fingerprints

| Artifact | Current fingerprint | Unchanged |
| --- | --- | --- |
| 22-scenario production ranking | 6d4603fa0a2f604c13e8dde8d1758b38af0452a505c2df6c7618520524fdda56 | true |
| Comprehensive behavior | fb08893df66978c60edf912d58cd333e649c5b79d1bf965595b588f49db104de | true |
| Reference catalog | 1f67c9616a101ea1d27c376bd0b1ca55c9eb33c12e23e50a45296a5416fc8ee8 | true |
| Equipment legality | 5aa3d161faf552652caec1b6b01e22f2c2718dfc12337d74329f4a39deb38869 | true |
| Expanded equipment fixtures | bb07188480cab4134ba4f2eb36dfa4f17e5d4d62d6139b539c5603ad602b482a | true |

## Explicit Uncertainty

Every proposed tag and source assignment still requires project-owner exercise-science review. The laboratory proves receiver consequences and invariants; it does not prove clinical safety, tissue state, or universal training risk. External primary references are recommended before production curation for upper-limb support loading, resisted trunk rotation, lateral trunk loading, loaded gait/march, and grip-loading thresholds.

## Final Classification

**TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY**

The contract is ready for owner decision because the smallest truthful vocabulary, source consequences, side gap, hard-authority boundary, prescription-realized stress concept, and no-production-change invariants are now explicit. Production metadata remains blocked until owner decisions and exact seven-exercise curation are complete.
