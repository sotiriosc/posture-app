# Owner V2 Product Program Envelope

Contract: `OWNER_V2_PRODUCT_PROGRAM_ENVELOPE@1.0.0`.

The immutable envelope remains source of truth and preserves:

- v2Program
- displayProjection
- assignmentIds
- sourceEventIds
- PrescriptionIds
- SequenceIds
- WeekIds
- practiceOptionReferences
- exerciseIds
- phaseReferences
- longitudinalReferences
- versions
- previewApprovalApplicationLineage

The display projection is never the only truth.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
