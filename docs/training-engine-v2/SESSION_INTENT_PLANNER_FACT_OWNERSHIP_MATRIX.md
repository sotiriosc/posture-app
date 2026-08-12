# Session Intent Planner Fact Ownership Matrix

Every behavioral fact below has one giver and one receiver. Prose is inert in every row.

| Fact | Giver / canonical source | Review | Receiver and bounded consequence | Absence | Downstream trace / duplicate audit |
| --- | --- | --- | --- | --- | --- |
| allocation | Week Composer or standalone brief / directive | explicit | Planner may plan only when present | unknown, blocking | directive ID; consumed once |
| outcome goal | directive | explicit | SessionIntent and CandidateRequest goal | under-specified | goal normalization; no athlete/phase fallback |
| context mode | directive | explicit | pain-aware context trace | ordinary/no special mode | mode trace; does not create needs |
| objective truth | directive objective | explicit | one normalized SessionNeed purpose | not applicable | objective-to-need rule; merges equivalent truth |
| objective priority/order | directive objective | explicit | need priority vector | invalid if malformed | priority provenance; no scoring coefficient |
| standalone direction | directive + capacity | explicit | need admission mode | policy default | admission rule trace; minutes never consumed |
| current minutes | current availability | explicit/default-provenance | SessionIntent duration handoff context | unknown | availability trace; no need admission effect |
| structural capacity | current availability/directive | explicit | standalone policy only | unknown | capacity trace; no minute inference |
| current equipment | session snapshot | explicit | passed unchanged to Candidate | unknown | context fingerprint; never rewrites purpose |
| assessment action | AssessmentSignal | reviewed/unknown | relevance, clustering, selection truth | unknown | signal IDs; no prose inference |
| assessment confidence/priority | AssessmentSignal | source reviewed | bounds standalone enrichment | no enrichment | enrichment trace; Candidate still receives full assessment |
| pain requirement | PainAndInjuryState | upstream report | refs active needs; Candidate/Prescription own effects | not applicable | signal IDs; creates no need |
| safety authority | TrainingSafetyState | external authority | pass-through readiness only | training allowed | canonical readiness trace; never cleared |
| phase ID | PhaseIntent | reviewed | developmental/candidate context | invalid input | phase ref; goal/muscle/prose do not create needs |
| fatigue | TrainingHistory/directive | structured | context/conflict and reallocation only | unknown/low as supplied | fatigue trace; cannot erase required allocation |
| continuity identity | history + response + equipment/block state | observed | active-need contextual evidence for Composer | none | source event/response refs; caller booleans forbidden |
| exercise preference | athlete profile | explicit | Candidate only | not applicable | no Planner need consequence |
| explicit session request | upstream adapter/directive | explicit | may own one objective | absent | dedicated source kind; not generic preference |
| missed session | history/Week owner | observed | requires Week reallocation when flagged | not applicable | unresolved Week ref; never doubles work |
| unresolved context | Product Adapter | unreviewed | trace and structured status only | not applicable | observation ID/owner/state; no behavior |

Profile availability, athlete label, demographic identity, phase prose, assessment/pain descriptions, unresolved descriptions, and need explanations are audited as trace-only or compatibility facts. Candidate, Composer, Prescription, Sequencing, and Week each consume only their owned projections; no mutable selection truth is duplicated.
