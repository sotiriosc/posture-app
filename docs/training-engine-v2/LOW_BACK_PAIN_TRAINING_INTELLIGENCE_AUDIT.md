# Low-Back Pain Training Intelligence Audit

Fixed review time: `2026-08-12T00:00:00.000Z`.

Overall classification: **TARGETED_CONTRACT_REQUIRED**.

## Boundary

Training Engine V2 consumes normalized training, response, restriction, and safety-escalation evidence. It does not diagnose low-back conditions, interpret imaging, infer pathology from posture or pain location, or prescribe medical treatment. This is a review-only audit; it adds no screening questionnaire, disease classifier, pain threshold, exercise row, Session Composer, or Week Composer.

## Readiness Answer

Can Candidate Intelligence currently be described as ready to intelligently train around reported low-back pain? **No.** It has useful region/stress separation, hard-authority handling, pain-response traces, compositional support mechanics, and broad conventional exercise candidates. It still lacks an independent safety-escalation authority, sufficient symptom/tolerance evidence, side ownership, curated low-back stress scopes, and longitudinal response semantics.

## Classification Summary

| Area | Classification | Finding | Minimum contract |
| --- | --- | --- | --- |
| Safety escalation versus pain severity | UPSTREAM_SAFETY_INPUT_OWNER | Urgent review is currently expressible only inside AcuteSeverePain, whose type restricts severity to 7-10. HardContraindication can block known exercises or stresses, but it is not a general independent review/escalation signal. Numeric pain severity is therefore carrying authority it should not own. | Add a non-diagnostic reported safety/escalation signal independent of pain score, with requested review level, source type, source reference, evidence basis, reporter/reviewer identity, reportedAt, and resolution state. It must globally gate ordinary generation when unresolved. Do not add a diagnostic questionnaire or infer pathology. |
| Region must not create mechanical intolerance | READY | Canonical pain matching requires an explicit shared stress tag; lumbar_spine alone creates no flexion, extension, hinge, axial-load, rotation, lateral-load, gait, or march intolerance. Region can provide generic assessment context and row-review trace context, but does not manufacture a stress fact or hard rejection. | Retain regression tests proving region-only signals cannot create stress matches. Review generic region-based assessment capability adjustments separately before describing them as mechanical tolerance evidence. |
| Symptom behavior and training tolerance | TARGETED_CONTRACT_REQUIRED | PainAndInjuryState can carry a region, side, stress tags, severity band, and a requested modification, but it cannot represent both aggravated and tolerated exposures, range/load sensitivity, preferred support context, repeated response, current function, or provenance with enough precision for response-led training. | Define non-diagnostic reported training-tolerance observations for aggravating and tolerated exposure, range/load/support context, current functional tolerance, response timing/distribution where relevant, and provenance. Preserve unknown and do not create directional diagnostic classifications. |
| Historical injury | TARGETED_CONTRACT_REQUIRED | Every HistoricalInjury field is currently unconsumed. That avoids permanent penalties, but recurring/managed history cannot trigger review and resolved history cannot be explicitly neutralized by successful re-exposure. | Keep resolved history observational by default; route active clinician restrictions to HardContraindication; let recurring/managed history request review only when paired with current response or restriction evidence; and allow repeated successful exposure to reduce concern without erasing history. |
| Side and distribution | TARGETED_CONTRACT_REQUIRED | Side is preserved in pain-match traces but has no candidate-ranking or prescription receiver, and symptom distribution is not normalized. The engine cannot yet reliably align unilateral load, support side, split stance, or asymmetric prescription with reported response. | Add a reviewed side/distribution ownership contract connecting reported side to prescription side behavior and response tracking. Unknown must remain legal; unilateral or referred symptoms must never imply a diagnosis. |
| Exercise stress knowledge | CATALOG_KNOWLEDGE_REQUIRED | The structured exposure-scope schema is adequate, but the 30-row production catalog still relies on legacy unscoped stress arrays. Several low-back-relevant tags are absent, and existing flexion/extension labels require row-level review before they can be treated as intrinsic exposure. | Curate each relevant row with intrinsic, prescription-modifiable, variant-dependent, dose-created, or unknown scope and human/external provenance. Exposure metadata must never be interpreted as danger or pathology. |
| Support and prescription | TARGETED_CONTRACT_REQUIRED | The new support/stance schema and prescription side/support types can represent chest support, free standing, machine support, wall support, support amount, and load/support relationship. Candidate policy still defers prefer_support/increase_support without an authoritative selection-versus-prescription-versus-progression ownership rule. | Use support as a contextual candidate differentiator when requested, realize exact support in prescription, record temporary response, and reduce support only through earned progression. Never make support a permanent destination from region or history alone. |
| Exercise coverage | CATALOG_KNOWLEDGE_REQUIRED | The current catalog can still provide presses, pulls, squats, hinges, single-leg, glute/hamstring, anti-extension, and anti-rotation options. It lacks production anti-lateral-flexion, controlled flexion, controlled rotation, loaded bracing, and carry/capacity rows, and supported alternatives are uneven across patterns. | Add only the reviewed minimal trunk/carry tranche after the listed blockers, then run the planned whole-body candidate-pool audit for supported/unsupported diversity and progression runway rather than creating a back-pain-only routine. |
| Response-led progression | LONGITUDINAL_OWNER | Prescription and progression contracts can record dose, quality, unresolved pain-response IDs, recovery, success/failure, and repeated evidence, but cannot distinguish tolerated, improved, unchanged, transient expected discomfort, repeatedly aggravated, failed progression, or successful re-exposure. | Create longitudinal response evidence linked to the exact exercise, variant, dose, range, load, support, side, timing, and source. Owner-reviewed policy must interpret patterns without arbitrary pain thresholds. |
| Fear and overprotection guard | TARGETED_CONTRACT_REQUIRED | Current logic does not globally ban bending, hinging, loading, or gait from lumbar region alone, and it does not ignore explicit pain-response requirements. The intended graded middle path is not yet an executable invariant across future candidate, prescription, and progression layers. | Add policy tests against permanent avoidance, universal core routines, pain-equals-damage messaging, and indiscriminate loading. Decisions must follow reported/observed response and explicit safety authority. |
| Whole-body interaction | CATALOG_KNOWLEDGE_REQUIRED | Support, trunk demand, hip demand, load, fatigue, stance, laterality, grip/carry contribution, pattern, fit, and progression runway are distributed across current contracts, but no whole-program audit has tested their combined coverage. | Run the planned whole-body exercise-knowledge and candidate-pool audit after upstream safety/tolerance ownership is fixed. Do not create a mandatory back-pain section. |
| Medical diagnosis boundary | OUT_OF_SCOPE_MEDICAL_DIAGNOSIS | Training Engine V2 consumes reported training response, restrictions, and safety/escalation evidence. It must not infer a condition from posture, pain location, distribution, form, imaging, or exercise identity. | Keep diagnosis, imaging interpretation, pathology classification, medical screening, and treatment outside V2. Preserve externally reported restrictions and review requests with provenance without translating them into diagnostic claims. |

## Safety Escalation Versus Pain Severity

The current global urgent-review path is technically preserved across every candidate and takes precedence over ranking, but its input authority is nested inside `AcuteSeverePain` and therefore available only at severity 7-10. This is not adequate: high pain is not itself a diagnosis, and low or moderate pain does not establish medical safety. A future upstream signal should report a requested review/escalation action without naming a condition. It should preserve who reported it, when, the source reference and evidence basis, and whether it remains unresolved.

`HardContraindication` remains the correct authority for explicit athlete/clinician/coach/safety restrictions on known exercises, roles, or stresses. It should not be overloaded as the only general review signal, and this task does not create a medical screening questionnaire.

## Region And Mechanical Intolerance

Canonical candidate pain matching joins explicit reported stress tags to explicit exercise stress facts. Region is copied into trace evidence but does not create a stress tag. A lumbar-only report with no stress evidence therefore creates none of the listed mechanical intolerances. Generic assessment code can use same-region pain as context for a small capability adjustment, and horizontal-row review traces can expose chest support in a lumbar context; neither pathway creates a specific motion intolerance or hard rejection. Keep both under regression test.

## Historical Injury

`HistoricalInjury` is deliberately inert today. Resolved history should remain observational unless current response or an explicit restriction gives it renewed relevance. Managed or recurring history may justify review, but not a permanent score penalty. Repeated successful exposure should become positive longitudinal evidence. Clinician-imposed restrictions belong in `HardContraindication`, with source authority preserved.

## Side And Distribution

Current match traces preserve left/right/bilateral/unknown where reported, but side does not drive candidate or prescription behavior. Prescription already has side, load-side, support-side, and relationship fields, so the missing piece is an ownership bridge. Distribution remains unmodeled and must never be translated into a diagnosis. Legitimate future uses are side-aware loading/support, split stance, asymmetric prescription, and response comparison.

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

The intended doctrine remains: appropriate task -> tolerable starting prescription -> repeatable form -> observed symptom/performance response -> maintain or modify -> earned progression -> broader capacity. Current records can prove dose, quality, recovery, unresolved pain response, success/failure, and repeated evidence, but not the required symptom-response meanings. No numeric response threshold is selected here.

## Fear And Overprotection Guard

Praxis must preserve the middle path: no universal ban on lumbar bending, hinging, loading, gait, or rotation; no universal core routine; no implication that pain or posture proves damage; and no instruction to ignore symptoms or load regardless of response. Support and reduced exposure are temporary tools when evidence supports them, with re-exposure and broader capacity available when earned.

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

- Independent non-diagnostic safety/escalation input and global unresolved-review gate.
- Reported symptom-behavior/training-tolerance contract with provenance and explicit unknown.
- HistoricalInjury consumption/non-consumption policy that avoids permanent penalties.
- Side/distribution ownership for unilateral load, support, and response tracking.
- Row-level structured low-back stress curation and legacy compatibility tests for the seven proposals.
- Owner-reviewed contextual phase scoring policy after calibration, or an explicit temporary policy for rows while legacy phase scoring remains authoritative.
- Longitudinal response owner capable of distinguishing successful exposure from repeated aggravation without arbitrary thresholds.

## Blockers Before Whole-Body Audit

- No blocker prevents a review-only whole-body audit from starting after this task.
- A production-readiness claim from that audit remains blocked by upstream safety, tolerance, side, stress-curation, and longitudinal-response ownership.

## Fingerprints

| Artifact | Fingerprint | Behavior meaning |
| --- | --- | --- |
| Production ranking | d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782 | Unchanged |
| Comprehensive behavior | 216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9 | Unchanged |
| Reference catalog | 124786e955fb411f556d0b583e127d3261a7385ccfa11175a95a9bae79bd41f9 | Intentionally changed by support/stance metadata migration |
| Support/stance contract | 76b7aa7cc14c606e597bd4ac7f2759f88585ed9e49211bcf6a68e6b24ace0181 | Intentionally changed by implementation |
| Contextual phase laboratory | b114b80cba21918c9292fc025686fec3fe82f79cc18477fb9a6a25f893060550 | Resolver/trace contract implementation |
| Low-back audit | 716a3ab26469cbef477d1214bfd0427b40059cba6ffee4b2e11ea40270fa2179 | Deterministic review artifact |

## Exact Next Dependency

Implement the independent reported safety/escalation contract and the non-diagnostic symptom-behavior/training-tolerance contract before adding the seven production rows or claiming low-back-pain training readiness.
