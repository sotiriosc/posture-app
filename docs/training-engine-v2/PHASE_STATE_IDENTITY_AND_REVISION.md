# Phase State Identity and Revision

Generated deterministically from explicit Authority Registry V3 and test/developer-only Gate 15 tooling.

`ProductionPhaseStateIdentity` binds athlete, cycle and stable state identity. Every immutable `PhaseStateRevision` carries current phase, based-on revision, reason, explicit time, evidence snapshot, status and final-for-decision state. Exactly one revision is final for an attempt. `weekInPhaseObservation` has `automaticAdvancementAuthority=false`.
