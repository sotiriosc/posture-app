# Low-Back Pain Training Intelligence Audit

Fixed review time: `2026-08-12T00:00:00.000Z`.

Overall classification: **TARGETED_CONTRACT_REQUIRED**.

## Boundary

Training Engine V2 consumes normalized training, response, restriction, and safety-escalation evidence. It does not diagnose low-back conditions, interpret imaging, infer pathology from posture or pain location, or prescribe medical treatment. This is a review-only audit; it adds no screening questionnaire, disease classifier, pain threshold, exercise row, Session Composer, or Week Composer.

## Readiness Answer

Can Candidate Intelligence currently be described as ready to intelligently train around reported low-back pain? **No.** It now has independent explicit safety authority, global downstream readiness, exposure-linked response observations, side-aware history, deterministic re-exposure evidence, region/stress separation, and compositional support mechanics. It still lacks upstream/future-execution adapter wiring, owner-approved response receivers, curated low-back stress scopes, support/prescription policy, final phase policy, and longitudinal interpretation policy.

## Classification Summary

| Area | Classification | Finding | Minimum contract |
| --- | --- | --- | --- |
| Safety escalation versus pain severity | READY | TrainingSafetyState now carries explicit review or urgent-review authority independently of pain severity. Unresolved signals block result-level downstream readiness without changing candidate scores or manufacturing contraindications. The legacy AcuteSeverePain bridge reads only explicit urgentReviewRecommended authority, never severity alone. | Engine contract implemented. Upstream adapters must supply only explicit authority with provenance, and future execution layers must consume downstreamTrainingAllowed. Only external resolution evidence can clear a signal. |
| Region must not create mechanical intolerance | READY | Canonical pain matching requires an explicit shared stress tag; lumbar_spine alone creates no flexion, extension, hinge, axial-load, rotation, lateral-load, gait, or march intolerance. Region can provide generic assessment context and row-review trace context, but does not manufacture a stress fact or hard rejection. | Retain regression tests proving region-only signals cannot create stress matches. Review generic region-based assessment capability adjustments separately before describing them as mechanical tolerance evidence. |
| Symptom behavior and training tolerance | READY | TrainingResponseObservation now records tolerance, reported symptom change, onset, persistence, consequence, descriptive region/side locations, and structured provenance against a specific exposure. Exact dose, range, load, support, and laterality remain owned by linked prescription/performance records; partial historical reports preserve unknown. | Observation and linkage contract implemented. Owner-reviewed receiver policy is still required before history can request candidate review, prescription modification, continuity, or progression action. |
| Historical injury | READY | HistoricalInjury remains observational by doctrine and regression test. It creates no score, permanent avoidance, or mechanical intolerance. Current response observations can restore contextual relevance without altering the historical record, and successful re-exposure remains positive evidence rather than erasure. | Policy implemented as non-consumption in Candidate Intelligence. Explicit restrictions remain in HardContraindication; any future historical receiver must require separate current evidence and owner review. |
| Side and distribution | READY | Response observations can record multiple descriptive region/side locations, while the ledger resolves realization side from linked prescriptions. Left-side evidence does not automatically apply to a right-side realization. Distribution remains descriptive and cannot create diagnosis or candidate illegality. | Observation/linkage ownership implemented. Future candidate or prescription policy must still decide when side-specific evidence requests review and must preserve unknown. |
| Exercise stress knowledge | CATALOG_KNOWLEDGE_REQUIRED | The structured exposure-scope schema is adequate, but the 30-row production catalog still relies on legacy unscoped stress arrays. Several low-back-relevant tags are absent, and existing flexion/extension labels require row-level review before they can be treated as intrinsic exposure. | Curate each relevant row with intrinsic, prescription-modifiable, variant-dependent, dose-created, or unknown scope and human/external provenance. Exposure metadata must never be interpreted as danger or pathology. |
| Support and prescription | TARGETED_CONTRACT_REQUIRED | The new support/stance schema and prescription side/support types can represent chest support, free standing, machine support, wall support, support amount, and load/support relationship. Candidate policy still defers prefer_support/increase_support without an authoritative selection-versus-prescription-versus-progression ownership rule. | Use support as a contextual candidate differentiator when requested, realize exact support in prescription, record temporary response, and reduce support only through earned progression. Never make support a permanent destination from region or history alone. |
| Exercise coverage | CATALOG_KNOWLEDGE_REQUIRED | The current catalog can still provide presses, pulls, squats, hinges, single-leg, glute/hamstring, anti-extension, and anti-rotation options. It lacks production anti-lateral-flexion, controlled flexion, controlled rotation, loaded bracing, and carry/capacity rows, and supported alternatives are uneven across patterns. | Add only the reviewed minimal trunk/carry tranche after the listed blockers, then run the planned whole-body candidate-pool audit for supported/unsupported diversity and progression runway rather than creating a back-pain-only routine. |
| Response-led progression | LONGITUDINAL_OWNER | The deterministic response ledger now orders applicable observations at explicit asOf, exposes latest and prior events, distinguishes factual tolerance/symptom outcomes, preserves conflicts/unknowns, and identifies later tolerated re-exposure after limited/not-tolerated exposure. It intentionally selects no numeric threshold or automatic action. | Evidence foundation implemented. A longitudinal owner must define interpretation and receiver policy for hold, review, re-exposure, prescription modification, and progression without arbitrary thresholds. |
| Fear and overprotection guard | READY | Regression tests prove region/severity/history do not manufacture intolerance, safety escalation, permanent blocks, or support preference; explicit restrictions retain hard authority; one adverse response remains prescription-specific; and later tolerated re-exposure stays visible. | Current Candidate Intelligence invariant is implemented. Future response receivers must retain these tests before any automatic policy is approved. |
| Whole-body interaction | CATALOG_KNOWLEDGE_REQUIRED | Support, trunk demand, hip demand, load, fatigue, stance, laterality, grip/carry contribution, pattern, fit, and progression runway are distributed across current contracts, but no whole-program audit has tested their combined coverage. | Run the planned whole-body exercise-knowledge and candidate-pool audit after upstream safety/tolerance ownership is fixed. Do not create a mandatory back-pain section. |
| Medical diagnosis boundary | OUT_OF_SCOPE_MEDICAL_DIAGNOSIS | Training Engine V2 consumes reported training response, restrictions, and safety/escalation evidence. It must not infer a condition from posture, pain location, distribution, form, imaging, or exercise identity. | Keep diagnosis, imaging interpretation, pathology classification, medical screening, and treatment outside V2. Preserve externally reported restrictions and review requests with provenance without translating them into diagnostic claims. |

## Safety Escalation Versus Pain Severity

`TrainingSafetyState` now accepts explicit review or urgent-external-review authority independently of pain severity. `TrainingReadinessTrace` reports whether downstream ordinary training is allowed, the unresolved and externally resolved signal IDs, full authority/provenance, and the required review level. Candidate ranking still runs for diagnostics and is unchanged; unresolved authority gates only result-level downstream execution. The engine never clears a signal because time passed or symptoms changed.

For backward compatibility, `AcuteSeverePain.urgentReviewRecommended=true` is explicitly bridged into global readiness as legacy urgent authority. The bridge condition is the boolean authority field, not severity 7-10. High severity with the flag false creates no independent safety escalation and no diagnosis.

`HardContraindication` remains the correct authority for explicit athlete/clinician/coach/safety restrictions on known exercises, roles, or stresses. It should not be overloaded as the only general review signal, and this task does not create a medical screening questionnaire.

## Region And Mechanical Intolerance

Canonical candidate pain matching joins explicit reported stress tags to explicit exercise stress facts. Region is copied into trace evidence but does not create a stress tag. A lumbar-only report with no stress evidence therefore creates none of the listed mechanical intolerances. Generic assessment code can use same-region pain as context for a small capability adjustment, and horizontal-row review traces can expose chest support in a lumbar context; neither pathway creates a specific motion intolerance or hard rejection. Keep both under regression test.

## Historical Injury

`HistoricalInjury` remains deliberately inert in Candidate Intelligence. Resolved, managed, or recurring history creates no score, mechanical intolerance, or permanent avoidance by itself. Current response evidence can make the context relevant again without modifying history. Successful re-exposure is positive evidence rather than deletion. Explicit restrictions belong in `HardContraindication`, with source authority preserved.

## Side And Distribution

Training response observations preserve multiple descriptive region/side locations. Exact movement, load, support, and starting side remain owned by the linked prescription. Ledger queries resolve side through that source of truth, so left-side exposure evidence does not automatically apply to a right-side realization. Distribution is descriptive only and is never translated into a diagnosis or candidate prohibition.

## Exercise Stress Knowledge

A stress tag describes exposure, not pathology, harm, or contraindication. Scope is row-specific; the same vocabulary item can be intrinsic for one identity and variant-dependent for another.

| Stress | Current production rows | A-E classification | Finding |
| --- | --- | --- | --- |
| loaded_hinge | one-arm-dumbbell-row, dumbbell-romanian-deadlift, cable-pull-through | A for hinge identities; C for setup-dependent row variants | Scope must be curated per row; the tag is not globally intrinsic. |
| loaded_spinal_flexion | one-arm-dumbbell-row, dumbbell-romanian-deadlift | C or E pending review | Do not infer loaded spinal flexion from a hinge or row name; actual range and variant matter. |
| loaded_spinal_extension | dumbbell-shoulder-press, glute-bridge | B, C, or E pending review | Current legacy labels cannot distinguish intended task from avoidable compensation or range. |
| heavy_axial_loading | none | D | Heavy is dose-created; exercise identity alone is insufficient. |
| loaded_trunk_rotation | none | A plus B prescription context for the proposed chop | Controlled loaded rotation is exposure, not danger; range and load remain prescription facts. |
| lateral_trunk_loading | none | A for suitcase carry; B for supported march | Support amount changes realized exposure and must remain observable. |
| loaded_gait | none | A for walking carries | Requires actual gait-space and walking identity; stationary march must not inherit it. |
| loaded_march | none | A for loaded march identity | Stationary stepping is distinct from loaded gait and distance carry. |
| long_lever_core | dead-bug, push-up, pallof-press | C | Lever is variant/prescription dependent; current legacy arrays cannot express that scope. |

## Support And Prescription

The implemented support/stance model can distinguish chest-supported and unsupported rows, machine and free-standing setups, task-changing wall support, half-kneeling, and load/support relationship. Prescription can separately own support level/surface, range, load, and side. Candidate selection should use explicit preference/tolerance evidence; prescription should realize the exact support and dose; response tracking should decide whether it helped; progression may reduce support when earned. Region alone must not choose permanent support.

## Candidate Coverage

| Need | Current production candidates |
| --- | --- |
| horizontal pull | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row, reverse-pec-deck, band-face-pull, dumbbell-curl |
| vertical pull | lat-pulldown, band-lat-pulldown |
| squat | goblet-squat, leg-press, bodyweight-box-squat, split-squat, step-up |
| hinge | dumbbell-romanian-deadlift, cable-pull-through, lying-leg-curl, glute-bridge |
| single-leg | split-squat, step-up |
| trunk anti-extension | ninety-ninety-breathing, dead-bug, push-up |
| anti-rotation | pallof-press |
| anti-lateral-flexion | none |
| controlled flexion | none |
| controlled rotation | none |
| loaded bracing | none |
| carries/capacity | none |
| upper-body pressing | serratus-wall-slide, push-up, dumbbell-bench-press, machine-chest-press, cable-chest-fly, dumbbell-shoulder-press, dumbbell-lateral-raise, cable-triceps-pressdown |

The user can receive a conventional upper/lower or full-body strength, hypertrophy, or general-fitness pool where appropriate. The major gaps are not a lack of corrective drills; they are missing production options for anti-lateral flexion, controlled flexion/rotation, loaded bracing, carries, and uneven supported alternatives. The seven-row proposal addresses several of these gaps but remains blocked.

## Response-Led Progression

The intended doctrine remains: appropriate task -> tolerable starting prescription -> repeatable form -> observed symptom/performance response -> maintain or modify -> earned progression -> broader capacity. TrainingResponseObservation records tolerance, symptom change, onset, persistence, completion/modification consequence, locations, and provenance. ExercisePerformanceRecord references observation IDs; the completed prescription remains source of truth for dose, range, load, support, and side.

The deterministic ledger orders applicable observations at explicit `asOf`, exposes latest and previous events, preserves unknown and mixed evidence, and identifies later tolerated exposure after earlier limited/not-tolerated exposure. It does not choose a threshold, score, hold, regression, progression, replacement, or ban.

## Fear And Overprotection Guard

Praxis must preserve the middle path: no universal ban on lumbar bending, hinging, loading, gait, or rotation; no universal core routine; no implication that pain or posture proves damage; and no instruction to ignore symptoms or load regardless of response. Support and reduced exposure are temporary tools when evidence supports them, with re-exposure and broader capacity available when earned.

The regression matrix now proves region-only, severity-only, historical injury, one adverse exposure, symptom side, and notes cannot manufacture global intolerance or permanent exercise identity behavior. Explicit hard restrictions retain their existing authority.

## Phase Calibration Consequences

These are non-production sensitivity results from the existing calibration laboratory. Close-order changes are candidate rank changes. Continuity disruptions remain zero because no variant changes continuity evidence; contextual unknown/no-match and accepted poor remain distinguishable while final scoring policy is pending.

| Policy | Category spacing | Phase weight | Winner changes | Close-order changes | Continuity disruptions | Unknown evidence | Accepted poor | Representative Phase 1/2/3 effects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A_CURRENT | 8.8/7.8/6.2/5.5 | 1 | 0 | 0 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | No winner changes from current control. |
| B_ANNOTATION_ONLY | 8.8/7.8/6.2/5.5 | 1 | 1 | 2 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up; phase_2: none; phase_3: none |
| C_NO_PHASE_COMPONENT | none | omitted | 7 | 16 | 0 | phase component omitted; implemented contextual unknown/no-match remains neutral and unscored | phase component omitted; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up, goblet-squat->leg-press, cable-pull-through->dumbbell-romanian-deadlift; phase_2: dumbbell-bench-press->push-up; phase_3: chest-supported-dumbbell-row->machine-row, split-squat->step-up, reverse-pec-deck->band-face-pull |
| D_WEIGHT_05 | 8.8/7.8/6.2/5.5 | 0.5 | 4 | 8 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up, cable-pull-through->dumbbell-romanian-deadlift; phase_2: none; phase_3: split-squat->step-up, reverse-pec-deck->band-face-pull |
| E_GENTLE_GAP | 8/7.6/7.2/6.8 | 1 | 6 | 12 | 0 | legacy lab fallback=6.8; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=6.8; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up, goblet-squat->leg-press, cable-pull-through->dumbbell-romanian-deadlift; phase_2: dumbbell-bench-press->push-up; phase_3: split-squat->step-up, reverse-pec-deck->band-face-pull |
| E_MODERATE_GAP | 8.4/7.7/6.8/6.2 | 1 | 2 | 4 | 0 | legacy lab fallback=6.2; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=6.2; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up; phase_2: none; phase_3: reverse-pec-deck->band-face-pull |

## Whole-Body Interaction

Low-back-sensitive programming must emerge from the whole program. The future whole-body audit needs to compare support, trunk and hip demand, loading, fatigue, stance, laterality, grip/carry contribution, movement pattern, fit, and progression runway. It should not create a mandatory back-pain section.

## External Evidence Boundary

| Source | Version | Status | URL | Use boundary |
| --- | --- | --- | --- | --- |
| VA/DoD Clinical Practice Guideline for the Diagnosis and Treatment of Low Back Pain | Version 3.0, February 2022 | ACCESSED | https://www.healthquality.va.gov/guidelines/Pain/lbp/VADoDLBPCPGFinal508.pdf | Supports a safety path based on reported signs, symptoms, and history rather than pain score alone, and supports broad structured exercise. It does not authorize Praxis to diagnose or screen pathology. |
| WHO guideline for non-surgical management of chronic primary low back pain in adults in primary and community care settings | 7 December 2023 | ACCESSED | https://www.who.int/publications/i/item/9789240081789 | Supports person-centred, graded and paced activity, structured exercise, shared decisions, monitoring, and modification. It does not create exercise-row mechanical truth or numeric response thresholds. |
| Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021 | JOSPT 51(11), 2021; DOI 10.2519/jospt.2021.0304 | ACCESSED | https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf | Supports exercise diversity including general, aerobic, trunk strengthening/endurance, and movement-control approaches. Clinical subgrouping and treatment remain outside Training Engine V2. |

These clinician-facing guidelines inform safety boundaries, exercise-program principles, and uncertainty only. They do not establish diagnosis logic, exercise-row stress truth, arbitrary pain thresholds, or medical treatment in Praxis. Guidance version and access date are recorded because recommendations can change.

## Blockers Before Seven Production Rows

- Wire explicit TrainingSafetyState authority into upstream adapters and require future execution layers to consume downstreamTrainingAllowed.
- Owner-reviewed response receiver policy for candidate review, prescription modification, continuity, re-exposure review, and progression without a numeric score.
- Row-level structured low-back stress curation and legacy compatibility tests for the seven proposals.
- Owner-reviewed support/prescription policy that uses exact response evidence without creating permanent support dependence.
- Owner-reviewed contextual phase scoring policy after calibration, or an explicit temporary policy for rows while legacy phase scoring remains authoritative.
- Longitudinal interpretation owner for mixed history and successful re-exposure; the ledger exposes evidence but selects no threshold or action.

## Blockers Before Whole-Body Audit

- No blocker prevents a review-only whole-body audit from starting after this task.
- Owner sequencing still defers that audit; a production-readiness claim remains blocked by safety adapter wiring, response receiver policy, stress/support curation, phase policy, and longitudinal interpretation ownership.

## Fingerprints

| Artifact | Fingerprint | Behavior meaning |
| --- | --- | --- |
| Production ranking | d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782 | Unchanged |
| Comprehensive behavior | 216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9 | Unchanged |
| Reference catalog | 124786e955fb411f556d0b583e127d3261a7385ccfa11175a95a9bae79bd41f9 | Intentionally changed by support/stance metadata migration |
| Support/stance contract | 76b7aa7cc14c606e597bd4ac7f2759f88585ed9e49211bcf6a68e6b24ace0181 | Intentionally changed by implementation |
| Contextual phase laboratory | b114b80cba21918c9292fc025686fec3fe82f79cc18477fb9a6a25f893060550 | Resolver/trace contract implementation |
| Training safety | 0a0805117529073887fe7aca94a1bc2f097e53e1de14d320b1e37093a8825048 | Independent global readiness contract |
| Training response | 33aec8bb8433d0bf27f63b3fe76e0c6349708e4da47608a5d6957687818453ec | Exposure-linked observation and ledger contract |
| Safety/response combined | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 | Training intelligence foundation |
| Low-back audit | 94a562b812c0d6c24b4eefd601037676480aeb0f428beda8b8f20cd2a1d40338 | Deterministic review artifact |

## Exact Next Dependency

Obtain owner decisions for response-history receivers and contextual phase scoring, then curate row-level stress/support policy before adding the seven production rows; separately wire explicit TrainingSafetyState into upstream and future execution adapters.
