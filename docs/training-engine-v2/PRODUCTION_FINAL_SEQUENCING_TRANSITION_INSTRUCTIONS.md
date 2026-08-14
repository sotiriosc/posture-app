# Production Final Sequencing Transition Instructions

Generated deterministically from the inactive production Final Session Sequencing kernel.

Instruction types are `setup`, `recovery`, `section_boundary`, and `unknown`. Targets are exact seconds, a bounded range, unknown, or not prescribed.

Absent setup and section-boundary duration are unknown. Absent recovery is not prescribed, which means no prescribed delay rather than physical zero. Prescription rest is never copied, moved, duplicated, or reinterpreted.
