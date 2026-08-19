# Production Prescription Revision Ledger

Generated deterministically from the production Prescription Compiler kernel.

`ProductionPrescriptionRevisionLedger` is append-only. Every revision has explicit ancestry, reason, changed refs, policy ref, explicit timestamp, and provenance. Supersession is a separate immutable edge. Exactly one `finalRevisionId` exists per execution attempt.

- Revision chains validated: `1000`
- Broken chains: `0`
- Completed-history rewrites: `0`
