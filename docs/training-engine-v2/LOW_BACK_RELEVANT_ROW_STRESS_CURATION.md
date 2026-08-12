# Low-Back-Relevant Row Stress Curation

Classification: **FOCUSED_CURATION_READY_FOR_OWNER_DECISION_PRODUCTION_UNCHANGED**. Production behavior: **UNCHANGED**.

This focused review covers only the approved low-back-relevant vocabulary. Exposure is not danger, pathology, diagnosis or contraindication. Exercise names and possible compensations are non-executable; prescription-modifiable, variant-dependent, dose-created and unknown facts require realization evidence.

Fingerprint: `00d77d57851e2b8fec361a06ae48de85d6506d1818f87c8f0c85351f18bd56d3`.

## Current Production Rows

| Exercise | Stress | Scope | Side | Decision | Legacy present | Legacy plan | Rationale | Provenance | Uncertainty |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dead-bug | long_lever_core | variant_dependent | bilateral_or_systemic | KEEP_NEEDS_REVIEW | true | replace_after_equivalence_proof | Long-lever exposure is not intrinsic to every dead-bug prescription and must be realized from lever/range context. | Current catalog legacy jointStressTags; Reviewed lever prescription contract | The realized lever can shorten or lengthen without changing exercise identity. |
| push-up | long_lever_core | variant_dependent | bilateral_or_systemic | KEEP_NEEDS_REVIEW | true | replace_after_equivalence_proof | Support and lever realization determine long-lever exposure; horizontal pressing identity alone does not. | Current catalog legacy jointStressTags; Reviewed support and lever mechanics | Knee, incline and full-lever realizations change trunk demand. |
| one-arm-dumbbell-row | loaded_hinge | variant_dependent | prescription_side | KEEP_NEEDS_REVIEW | true | replace_after_equivalence_proof | Some unsupported row setups realize a loaded hinge, while supported realizations do not prove the same exposure. | Current catalog legacy jointStressTags; Compositional support/stance review | Bench support, stance and load/support side alter realized trunk and hinge demand. |
| one-arm-dumbbell-row | loaded_spinal_flexion | unknown | unknown | REJECT_LEGACY_AS_INTRINSIC | true | remove_after_equivalence_proof | A row or hinge setup does not itself prove loaded spinal flexion; compensation must not become intended exposure truth. | Current catalog legacy jointStressTags; Low-back region/stress ownership audit | Actual spinal position is not represented by exercise identity or the current support metadata. |
| dumbbell-shoulder-press | loaded_spinal_extension | unknown | bilateral_or_systemic | REJECT_LEGACY_AS_INTRINSIC | true | remove_after_equivalence_proof | Overhead pressing identity does not prove loaded spinal extension. | Current catalog legacy jointStressTags; Low-back stress ownership audit | Support, load, range and execution may alter trunk position; extension as compensation is not intended task truth. |
| dumbbell-shoulder-press | heavy_axial_loading | dose_created | bilateral_or_systemic | KEEP_NEEDS_REVIEW | false | none | Axial loading can become heavy only through realized dose, never from shoulder-press identity alone. | Structured load prescription contract; Exercise loading profile | No arbitrary threshold defines heavy; realized dose needs an external reviewed exposure classification. |
| goblet-squat | heavy_axial_loading | dose_created | bilateral_or_systemic | KEEP_NEEDS_REVIEW | false | none | A goblet squat may realize substantial axial load at some doses, but identity cannot create heavy exposure. | Structured load prescription contract; Exercise loading profile | The engine has no owner-approved heavy-load threshold and must preserve unknown until supplied. |
| dumbbell-romanian-deadlift | loaded_hinge | intrinsic | bilateral_or_systemic | PROPOSE_ACCEPT_STRUCTURED | true | retain_for_compatibility | The reviewed identity is a loaded hip-hinge task; exposure does not imply danger or intolerance. | Current catalog legacy jointStressTags; Reviewed hinge movement role and identity | Exact magnitude remains prescription-dependent even though the hinge exposure is intrinsic. |
| dumbbell-romanian-deadlift | loaded_spinal_flexion | unknown | bilateral_or_systemic | REJECT_LEGACY_AS_INTRINSIC | true | remove_after_equivalence_proof | Loaded hinge does not entail loaded spinal flexion, and technique compensation is not identity truth. | Current catalog legacy jointStressTags; Low-back stress ownership audit | Actual range and spinal motion are realization/performance facts not currently captured as accepted stress exposure. |
| dumbbell-romanian-deadlift | heavy_axial_loading | dose_created | bilateral_or_systemic | KEEP_NEEDS_REVIEW | false | none | Load magnitude can create heavy axial exposure, but RDL identity alone cannot. | Structured load prescription contract; Reviewed loaded-hinge identity | Heavy exposure requires explicit realized-dose authority; no threshold is approved here. |
| cable-pull-through | loaded_hinge | intrinsic | bilateral_or_systemic | PROPOSE_ACCEPT_STRUCTURED | true | retain_for_compatibility | The reviewed identity is a resisted hinge task; this is exposure truth, not a danger label. | Current catalog legacy jointStressTags; Reviewed hinge movement role and cable resistance path | Magnitude and range remain prescription-realized. |
| glute-bridge | loaded_spinal_extension | unknown | bilateral_or_systemic | REJECT_LEGACY_AS_INTRINSIC | true | remove_after_equivalence_proof | Potential compensation cannot be promoted to intrinsic exercise exposure. | Current catalog legacy jointStressTags; Low-back stress ownership audit | Hip extension intent does not reveal whether loaded spinal extension occurred. |
| pallof-press | long_lever_core | prescription_modifiable | prescription_side | KEEP_NEEDS_REVIEW | true | replace_after_equivalence_proof | Long-lever exposure must follow the actual press-out prescription rather than anti-rotation identity alone. | Current catalog legacy jointStressTags; Range/load/side prescription contracts | Arm reach, range, cable load and stance determine realized lever demand. |

## Vocabulary Without An Owner-Ready Current Accepted Row

- `loaded_spinal_flexion`
- `loaded_spinal_extension`
- `heavy_axial_loading`
- `loaded_trunk_rotation`
- `lateral_trunk_loading`
- `loaded_gait`
- `loaded_march`
- `long_lever_core`

Absence means no current owner-ready accepted structured fact, not reviewed zero exposure. Proposed seven-row facts remain in their separate curation and are not production metadata.

## Exact Owner Questions

- Approve loaded_hinge as intrinsic for dumbbell RDL and cable pull-through while keeping magnitude prescription-realized?
- Remove loaded_spinal_flexion from one-arm row and RDL legacy arrays after byte-equivalent structured migration tests?
- Remove loaded_spinal_extension from shoulder press and glute bridge rather than treating possible compensation as intrinsic exposure?
- Which upstream or human-reviewed authority may classify a realized load as heavy_axial_loading without an engine-invented threshold?
- Approve long_lever_core as variant/prescription-dependent for dead bug, push-up and Pallof press?
- Should one-arm row loaded_hinge remain needs-review until exact support/stance realization is linked to stress exposure?
