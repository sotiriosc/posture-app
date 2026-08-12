# Session Intent Planner Context Coverage Audit

## Represented Contexts

| Context | Current owner | Planner behavior |
| --- | --- | --- |
| explicit day purpose | Week Composer or standalone adapter | required directive/objectives |
| outcome and pain-aware mode | directive | separated and validated |
| today's minutes/capacity | Product Adapter or Week allocation | explicit provenance; no thresholds |
| today's equipment | Product Adapter | passed unchanged downstream |
| assessment | Assessment system | bounded enrichment plus context |
| pain | athlete/clinical inputs | references only; creates no section |
| safety | upstream safety authority | unchanged pass-through |
| phase | phase system | context/reference only |
| fatigue/history | longitudinal state | conflict/reallocation/context only |
| continuity/response | history and response receiver | only identities serving active needs |
| preferences | athlete profile | no need creation |
| missed session/change in days | Week Composer | reallocation status, no local compensation |

## Missing Or Intentionally Unrepresented Contexts

| Context | Classification | Proposed owner |
| --- | --- | --- |
| poor sleep / feels off | MISSING_CONTEXT | future typed recovery-readiness contract |
| illness | UNKNOWN_REQUIRES_REVIEW | upstream Safety/Clinical |
| accessibility/support requirement | MISSING_CONTEXT | Product Adapter then Candidate/Prescription |
| crowded gym | MISSING_CONTEXT | explicit current-equipment snapshot |
| workout partner | OUT_OF_SCOPE | future Sequencing/Prescription constraint |
| superset preference | OUT_OF_SCOPE | future Sequencing |
| time-of-day preference | TRACE_ONLY_NOT_BEHAVIORAL | Product Adapter unless a receiver is approved |
| exercise familiarity | MISSING_CONTEXT | Candidate Intelligence if reviewed |
| clinician restriction | MISSING_CONTEXT | upstream Safety/Clinical typed authority |
| standalone recovery session | UNKNOWN_REQUIRES_REVIEW | future Week/session-type review |
| demographic fields | TRACE_ONLY_NOT_BEHAVIORAL | no direct effect; future fit/dose receivers only |
| arbitrary external prose | UNKNOWN_REQUIRES_REVIEW | typed owner must be established first |

Unknown observations are serialized as `UnresolvedPlannerContextObservation` with proposed owner and resolution state. They cannot alter planning until promoted into a reviewed typed contract. The ordinary-session Planner may graduate while these remain explicit future-owned gaps; it may not claim to represent them.
