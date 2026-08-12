# Low-Back Pain Training Intelligence Audit

Fixed review time: `2026-08-12T00:00:00.000Z`.

Overall classification: **TARGETED_CONTRACT_REQUIRED**.

## Boundary

Training Engine V2 consumes normalized training, response, restriction, and safety-escalation evidence. It does not diagnose low-back conditions, interpret imaging, infer pathology from posture or pain location, or prescribe medical treatment. This is a review-only audit; it adds no screening questionnaire, disease classifier, pain threshold, exercise row, Session Composer, or Week Composer.

## Readiness Answer

At candidate scope, the reviewed pain/stress, safety, response, support, and seven-row catalog contracts are implemented. Full-program low-back-aware training remains incomplete because Session/Week Composer and product adapter consumption are outside this task. Contextual phase scoring also remains legacy-authoritative after the new policy failed its semantic activation gate.

## Classification Summary

| Area | Classification | Finding | Minimum contract |
| --- | --- | --- | --- |
| Safety escalation versus pain severity | READY | TrainingSafetyState now carries explicit review or urgent-review authority independently of pain severity. Unresolved signals block result-level downstream readiness without changing candidate scores or manufacturing contraindications. The legacy AcuteSeverePain bridge reads only explicit urgentReviewRecommended authority, never severity alone. | Normalized engine input/result contract implemented and regression-tested. Golden-product wiring remains separately PRODUCT_ADAPTER_PENDING; future execution layers must consume downstreamTrainingAllowed. Only external resolution evidence can clear a signal. |
| Region must not create mechanical intolerance | READY | Canonical pain matching requires an explicit shared stress tag; lumbar_spine alone creates no flexion, extension, hinge, axial-load, rotation, lateral-load, gait, or march intolerance. Region can provide generic assessment context and row-review trace context, but does not manufacture a stress fact or hard rejection. | Retain regression tests proving region-only signals cannot create stress matches. Review generic region-based assessment capability adjustments separately before describing them as mechanical tolerance evidence. |
| Symptom behavior and training tolerance | READY | TrainingResponseObservation records factual response, and the deterministic receiver now distinguishes exact, related, and identity-only applicability. Exact dose, range, load, support, and laterality remain owned by linked prescription/performance records; partial historical reports preserve unknown. | Observation, linkage and owner receiver policy implemented. It routes prescription review, progression readiness and continuity without candidate scoring or automatic action. |
| Historical injury | READY | HistoricalInjury remains observational by doctrine and regression test. It creates no score, permanent avoidance, or mechanical intolerance. Current response observations can restore contextual relevance without altering the historical record, and successful re-exposure remains positive evidence rather than erasure. | Policy implemented as non-consumption in Candidate Intelligence. Explicit restrictions remain in HardContraindication; any future historical receiver must require separate current evidence and owner review. |
| Side and distribution | READY | Response observations can record multiple descriptive region/side locations, while the ledger resolves realization side from linked prescriptions. Left-side evidence does not automatically apply to a right-side realization. Distribution remains descriptive and cannot create diagnosis or candidate illegality. | Observation/linkage ownership implemented. Future candidate or prescription policy must still decide when side-specific evidence requests review and must preserve unknown. |
| Exercise stress knowledge | CATALOG_KNOWLEDGE_REQUIRED | Owner decisions are implemented: RDL and cable pull-through have intrinsic structured hinge exposure, false flexion/extension legacy facts are removed, and lever/row/heavy-load contexts remain potential until realization. | Owner approval and behavior-equivalent structured/legacy migration remain required. Exposure metadata must never be interpreted as danger or pathology. |
| Support and prescription | TARGETED_CONTRACT_REQUIRED | The new support/stance schema and prescription side/support types can represent chest support, free standing, machine support, wall support, support amount, and load/support relationship. Candidate policy still defers prefer_support/increase_support without an authoritative selection-versus-prescription-versus-progression ownership rule. | Use support as a contextual candidate differentiator when requested, realize exact support in prescription, record temporary response, and reduce support only through earned progression. Never make support a permanent destination from region or history alone. |
| Exercise coverage | CATALOG_KNOWLEDGE_REQUIRED | The current catalog can still provide presses, pulls, squats, hinges, single-leg, glute/hamstring, anti-extension, and anti-rotation options. It lacks production anti-lateral-flexion, controlled flexion, controlled rotation, loaded bracing, and carry/capacity rows, and supported alternatives are uneven across patterns. | Add only the reviewed minimal trunk/carry tranche after the listed blockers, then run the planned whole-body candidate-pool audit for supported/unsupported diversity and progression runway rather than creating a back-pain-only routine. |
| Response-led progression | READY | The response receiver integrates exact current evidence with progression readiness: tolerated may permit review, limited holds, aggravated requests regression/review, and mixed/unknown remains insufficient. Later tolerated re-exposure removes permanent-failure pressure while preserving prior history. | Candidate Intelligence receiver policy implemented. It selects no axis, threshold, progression, regression, replacement or score; later composition remains responsible for any actual program change. |
| Fear and overprotection guard | READY | Regression tests prove region/severity/history do not manufacture intolerance, safety escalation, permanent blocks, or support preference; explicit restrictions retain hard authority; one adverse response remains prescription-specific; and later tolerated re-exposure stays visible. | Current Candidate Intelligence invariant and receiver regressions are implemented. Future composers must retain them before any program-change policy is approved. |
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
| loaded_hinge | dumbbell-romanian-deadlift, cable-pull-through | A for reviewed hinge identities; C for row variants | One-arm row hinge remains variant-dependent potential and cannot match until prescription realization. |
| loaded_spinal_flexion | machine-abdominal-crunch | A for controlled crunch identity | False row/RDL legacy flexion was removed; controlled machine flexion is truthful exposure, not a danger label. |
| loaded_spinal_extension | none | E for reviewed current identities | Possible compensation is not intrinsic intended exposure; false shoulder-press and bridge legacy facts were removed. |
| heavy_axial_loading | none | D | Heavy is dose-created; exercise identity alone is insufficient. |
| loaded_trunk_rotation | half-kneeling-high-to-low-cable-chop | A plus B prescription context | Controlled loaded rotation is exposure, not danger; range, side, load and tempo remain prescription facts. |
| lateral_trunk_loading | forearm-side-plank, suitcase-carry | A for reviewed identities; B for supported march | Wall-march support amount keeps lateral exposure potential and needs-review. |
| loaded_gait | farmer-carry, suitcase-carry | A for walking carries | Requires actual gait space; stationary march does not inherit it. |
| loaded_march | wall-supported-suitcase-march | A for stationary loaded march | Stationary stepping remains distinct from loaded gait and distance carry. |
| long_lever_core | none | C potential on dead bug, push-up and Pallof press | Legacy arrays were removed; variant or prescription realization owns the final exposure. |

## Support And Prescription

The implemented support/stance model can distinguish chest-supported and unsupported rows, machine and free-standing setups, task-changing wall support, half-kneeling, and load/support relationship. Prescription can separately own support level/surface, range, load, and side. Candidate selection should use explicit preference/tolerance evidence; prescription should realize the exact support and dose; response tracking should decide whether it helped; progression may reduce support when earned. Region alone must not choose permanent support.

## Candidate Coverage

| Need | Current production candidates |
| --- | --- |
| horizontal pull | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| vertical pull | lat-pulldown, band-lat-pulldown |
| squat | goblet-squat, bodyweight-box-squat |
| hinge | dumbbell-romanian-deadlift, cable-pull-through |
| single-leg | split-squat, step-up |
| trunk anti-extension | ninety-ninety-breathing, dead-bug, push-up, forearm-plank |
| anti-rotation | pallof-press |
| anti-lateral-flexion | forearm-side-plank, suitcase-carry |
| controlled flexion | machine-abdominal-crunch |
| controlled rotation | half-kneeling-high-to-low-cable-chop |
| loaded bracing | farmer-carry, suitcase-carry, wall-supported-suitcase-march |
| carries/capacity | farmer-carry, suitcase-carry |
| upper-body pressing | push-up, dumbbell-bench-press, machine-chest-press, dumbbell-shoulder-press |

The catalog now includes truthful production options for anti-lateral flexion, controlled flexion and rotation, loaded bracing, walking carries, and a stationary supported loaded march. They improve candidate diversity without creating a mandatory slot, workout-length policy, substitution, or progression behavior.

## Response-Led Progression

The intended doctrine remains: appropriate task -> tolerable starting prescription -> repeatable form -> observed symptom/performance response -> maintain or modify -> earned progression -> broader capacity. TrainingResponseObservation records tolerance, symptom change, onset, persistence, completion/modification consequence, locations, and provenance. ExercisePerformanceRecord references observation IDs; the completed prescription remains source of truth for dose, range, load, support, and side.

The deterministic receiver classifies exact, related and identity-only evidence. Current tolerated evidence may permit progression review; limited evidence holds/monitors; aggravated evidence requests regression or review; mixed/unknown evidence stays insufficient. It preserves earlier adverse and later tolerated re-exposure, but selects no axis, threshold, progression, replacement or ban.

## Fear And Overprotection Guard

Praxis must preserve the middle path: no universal ban on lumbar bending, hinging, loading, gait, or rotation; no universal core routine; no implication that pain or posture proves damage; and no instruction to ignore symptoms or load regardless of response. Support and reduced exposure are temporary tools when evidence supports them, with re-exposure and broader capacity available when earned.

The regression matrix now proves region-only, severity-only, historical injury, one adverse exposure, symptom side, and notes cannot manufacture global intolerance or permanent exercise identity behavior. Explicit hard restrictions retain their existing authority.

## Phase Calibration Consequences

Owner-approved contextual annotations and the annotation-only low-churn shape are implemented for dual-run inspection. Production remains legacy because three winner changes lacked accepted contextual phase evidence on the new winner; no continuity winner changed, unknown/no-match stays omitted, and the contextual scorer remains explicit and non-default.

| Policy | Category spacing | Phase weight | Winner changes | Close-order changes | Continuity disruptions | Unknown evidence | Accepted poor | Representative Phase 1/2/3 effects |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A_CURRENT | 8.8/7.8/6.2/5.5 | 1 | 0 | 0 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | No winner changes from current control. |
| B_ANNOTATION_ONLY | 8.8/7.8/6.2/5.5 | 1 | 0 | 0 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | No winner changes from current control. |
| C_NO_PHASE_COMPONENT | none | omitted | 5 | 13 | 0 | phase component omitted; implemented contextual unknown/no-match remains neutral and unscored | phase component omitted; accepted contextual poor remains distinct but production policy is pending | phase_1: machine-chest-press->push-up, cable-pull-through->dumbbell-romanian-deadlift; phase_2: none; phase_3: chest-supported-dumbbell-row->machine-row, split-squat->step-up, reverse-pec-deck->band-face-pull |
| D_WEIGHT_05 | 8.8/7.8/6.2/5.5 | 0.5 | 3 | 6 | 0 | legacy lab fallback=5.5; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=5.5; accepted contextual poor remains distinct but production policy is pending | phase_1: cable-pull-through->dumbbell-romanian-deadlift; phase_2: none; phase_3: split-squat->step-up, reverse-pec-deck->band-face-pull |
| E_GENTLE_GAP | 8/7.6/7.2/6.8 | 1 | 3 | 6 | 0 | legacy lab fallback=6.8; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=6.8; accepted contextual poor remains distinct but production policy is pending | phase_1: cable-pull-through->dumbbell-romanian-deadlift; phase_2: none; phase_3: split-squat->step-up, reverse-pec-deck->band-face-pull |
| E_MODERATE_GAP | 8.4/7.7/6.8/6.2 | 1 | 0 | 0 | 0 | legacy lab fallback=6.2; implemented contextual unknown/no-match remains neutral and unscored | legacy lab fallback=6.2; accepted contextual poor remains distinct but production policy is pending | No winner changes from current control. |

## Whole-Body Interaction

Low-back-sensitive programming must emerge from the whole program. The future whole-body audit needs to compare support, trunk and hip demand, loading, fatigue, stance, laterality, grip/carry contribution, movement pattern, fit, and progression runway. It should not create a mandatory back-pain section.

## External Evidence Boundary

| Source | Version | Status | URL | Use boundary |
| --- | --- | --- | --- | --- |
| VA/DoD Clinical Practice Guideline for the Diagnosis and Treatment of Low Back Pain | Version 3.0, February 2022 | ACCESSED | https://www.healthquality.va.gov/guidelines/Pain/lbp/VADoDLBPCPGFinal508.pdf | Supports a safety path based on reported signs, symptoms, and history rather than pain score alone, and supports broad structured exercise. It does not authorize Praxis to diagnose or screen pathology. |
| WHO guideline for non-surgical management of chronic primary low back pain in adults in primary and community care settings | 7 December 2023 | ACCESSED | https://www.who.int/publications/i/item/9789240081789 | Supports person-centred, graded and paced activity, structured exercise, shared decisions, monitoring, and modification. It does not create exercise-row mechanical truth or numeric response thresholds. |
| Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021 | JOSPT 51(11), 2021; DOI 10.2519/jospt.2021.0304 | ACCESSED | https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf | Supports exercise diversity including general, aerobic, trunk strengthening/endurance, and movement-control approaches. Clinical subgrouping and treatment remain outside Training Engine V2. |

These clinician-facing guidelines inform safety boundaries, exercise-program principles, and uncertainty only. They do not establish diagnosis logic, exercise-row stress truth, arbitrary pain thresholds, or medical treatment in Praxis. Guidance version and access date are recorded because recommendations can change.

## Seven Production Row Status

- None. Exactly seven owner-approved rows are implemented in the canonical production catalog.

## Blockers Before Whole-Body Audit

- No technical blocker prevents the separately requested review-only whole-body audit.
- Review the three unexplained contextual-phase winner changes before authorizing the deferred whole-body audit; this task does not start that audit.

## Fingerprints

| Artifact | Fingerprint | Behavior meaning |
| --- | --- | --- |
| Production ranking | 6d4603fa0a2f604c13e8dde8d1758b38af0452a505c2df6c7618520524fdda56 | Intentionally changed by approved catalog/stress truth |
| Comprehensive behavior | fb08893df66978c60edf912d58cd333e649c5b79d1bf965595b588f49db104de | Intentionally changed by approved catalog/stress truth |
| Reference catalog | 1f67c9616a101ea1d27c376bd0b1ca55c9eb33c12e23e50a45296a5416fc8ee8 | Intentionally changed by seven rows and focused migrations |
| Support/stance contract | 6542bc249181f0e1a010323763a7e51505dee7ee87229c4c43b65e0d2cc2963f | Intentionally changed by implementation |
| Contextual phase laboratory | 8a1b0bdd4caf699d8b61ffb790388a518cda10699da9eec3481f50afaa1f7ef8 | Resolver/trace contract implementation |
| Training safety | 0a0805117529073887fe7aca94a1bc2f097e53e1de14d320b1e37093a8825048 | Independent global readiness contract |
| Training response | 33aec8bb8433d0bf27f63b3fe76e0c6349708e4da47608a5d6957687818453ec | Exposure-linked observation and ledger contract |
| Response receiver | 26fe112e7c0fced67912e38e9118fed1808c973d74172d78af64f2ae4b6bb7d2 | Applicability, prescription-first routing, progression and continuity policy |
| Stable-adaptive policy | 2e941653546cac2e8d8a8151c91d9470123b80dd06e8b387b734e882a83734a6 | Continuity doctrine and selected contextual phase policy |
| Focused row stress curation | 8fada7ea2f07b7ddedea8d181a6d862e2d4d654ec74aea763766445f5db0cfc7 | Current low-back-relevant migration decisions |
| Safety/response combined | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 | Training intelligence foundation |
| Low-back audit | bc4f00a942e0041dee25af23d7e13099f450eff090e6aa91f12ed779080f7f4c | Deterministic review artifact |

## Exact Next Dependency

Review the three unexplained contextual-phase winner changes (two controlled scenarios and one golden persona); keep legacy phase scoring authoritative until a revised contextual policy passes the semantic gate.
