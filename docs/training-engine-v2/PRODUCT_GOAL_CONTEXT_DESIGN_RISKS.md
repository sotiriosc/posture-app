# Product Goal and Context Design Risks

| Risk | Severity | Evidence | Mitigation | F | Later |
| --- | --- | --- | --- | --- | --- |
| form_height | high | single page is already long on 390px | conditional disclosure and collapsed secondary goal | low | high |
| fixed_control_overlap | high | Info and Menu are fixed near final CTA | retain ui-shell bottom safe space and automated overlap checks | medium | high |
| secondary_text_contrast | medium | small slate copy overlays photographic background | contrast audit against actual glass surfaces | medium | high |
| gyms_experience_contrast | medium | unselected labels are faint in buyer-demo mobile render | separate later parity/contrast fix; no E runtime mutation | none | medium |
| native_select_explanation | medium | native options cannot carry rich descriptions consistently | concise helper/status below select | medium | medium |
| repeated_dark_panels | low | dense dark surfaces can flatten hierarchy | section ownership, spacing, and disclosure rather than new card layers | low | medium |
| build_copy_conflation | high | Build copy says strength while mode is not outcome | future Develop copy | record_only | high |
| reduce_pain_conflation | high | current goal makes context look like outcome | explicit confirmed migration | none | high |
| broad_goal_follow_up | high | General fitness and Athletic performance are underspecified | inline required focus and fail closed | none | high |
| equipment_overclaim | high | labels do not prove capabilities | minimal conditional capability plus calibration | none | high |
| consumer_gyms_drift | medium | duplicated forms already differ on training mode and lock behavior | future shared canonical inert registry | medium | high |
| deployment_drift | medium | Knees and reported band detail differ from branch | explicit drift record and owner review before implementation | low | medium |
| legacy_regeneration | high | signed changes regenerate and can end active session | inactive preview cannot dirty persist or submit | critical | high |

Fingerprint: `91dfb9320c1cc324441981ffa79461aff387e36190472ae3ccc8c590444773f5`.
