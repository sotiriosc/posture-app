# Session Composer Current Seam Audit

The seam audit is now implemented.

| Prior seam | Current authority |
| --- | --- |
| CandidateNeed selection fields | Canonical `ExerciseSelectionNeed`; deterministic legacy adapter only |
| CandidateNeed goal | Removed from authoritative path; request/session goals own context |
| CandidateNeed requestedSection | `SessionNeed.section` is sole Composer section authority |
| SessionIntent slots | Removed from authoritative `SessionIntent` |
| TrainingSlot | Deprecated legacy trace/optimizer type; no Composer behavior |
| PlannedExercise slot binding | Replaced by evidence-bearing `SessionExerciseAssignment` |
| Hand-authored composition facts | Prohibited; deterministic canonical projection |
| One ContinuityContext | Replaced by per-identity/per-need `SessionContinuityEvidence` |
| Overloaded status | Separate composition and execution-readiness statuses |
| Design-only API | Approved low-level production API exported |

Candidate result consistency is a hard boundary: athlete, phase, goal, assessment, pain, TrainingSafety, equipment, catalog, evaluation time, history/fatigue, need ID, section, role, action/movement/muscle truth, and session intent must agree. Mismatch throws a structured input error rather than normalizing.

Weekly allocation remains deferred to Week Composer; dose and exact duration remain deferred to Prescription; exact within-section order remains deferred to Sequencing.
