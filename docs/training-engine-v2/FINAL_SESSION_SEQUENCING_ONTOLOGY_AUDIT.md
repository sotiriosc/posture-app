# Final Session Sequencing Ontology Audit

Generated deterministically from the inactive Final Session Sequencing V1 design lab.

Classification: `FINAL_SEQUENCING_ONTOLOGY_READY`.

| Fact | Classification | Finding |
| --- | --- | --- |
| Selected assignment coverage | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Yes; SessionSkeleton identifies each selected assignment exactly once. |
| Assignment identity | `COMPOSER_OWNER` | Stable handoff and exercise identity are sufficient for ordering. |
| Dependency edges | `HARD_ORDERING_AUTHORITY` | Typed Composer edges are authoritative; missing edges cannot be inferred from names. |
| Section precedence | `HARD_ORDERING_AUTHORITY` | Valid for ordinary_training and preserved with empty sections. |
| Capacity-main | `SEQUENCING_OWNER` | May be dominant when Planner purpose and Composer role say capacity. |
| Preparation trace | `COMPOSER_OWNER` | Ordering constraints connect selected preparation to dependents. |
| Activation trace | `COMPOSER_OWNER` | Ordering constraints connect selected activation to dependents. |
| Dose-block order | `PRESCRIPTION_OWNER` | Fully owned by the final Prescription revision. |
| Within-exercise rest | `PRESCRIPTION_OWNER` | PrescriptionRestInstruction remains immutable. |
| Inter-exercise recovery | `SEQUENCING_OWNER` | Requires an explicit reviewed fact; otherwise unknown or not prescribed. |
| Setup transition | `EQUIPMENT_OWNER` | Relationships can be classified without converting them to seconds. |
| Fatigue interference | `SOFT_SEQUENCE_PREFERENCE` | Typed dimensions remain separate and purpose-subordinate. |
| Equipment truth | `EQUIPMENT_OWNER` | Equipment realization supports relationship comparison, not time inference. |
| Candidate rank | `WRONG_OWNER` | Present in assignment trace but excluded from SequencingAssignmentFact and ordering. |
| App ordering | `TRACE_ONLY` | Recursive guard found no app or UI authority leak. |
| Final duration | `SEQUENCING_OWNER` | Nullable upper bounds preserve unknown transitions truthfully. |
| Pairing | `DOMAIN_CHANGE_REQUIRED` | Deferred to SESSION_PAIRING_AND_SUPERSET_POLICY_REVIEW. |
| Prior sequence continuity | `MISSING_TYPED_FACT` | No V1 behavior; future evidence needs a stable typed contract. |
| Side order | `PRESCRIPTION_OWNER` | Preserve side behavior; side order remains not prescribed. |
| Cross-session concerns | `WEEK_OWNER` | Spacing and weekly stress never alter within-session V1 order. |

The existing domain is sufficient for a production-kernel authorization. Candidate rank remains historical selection trace only; explicit setup/recovery/location timing and prior-order continuity remain typed future inputs rather than inferred behavior.
