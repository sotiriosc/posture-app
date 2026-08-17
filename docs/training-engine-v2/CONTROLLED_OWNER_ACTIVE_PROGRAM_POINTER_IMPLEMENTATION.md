# Controlled Owner Active Program Pointer Implementation

The owner-scoped pointer stores `legacy|v2_owner`, active application ID, legacy fallback reference, monotonic
revision, explicit update time, provenance, and fingerprint. No row means effective `legacy`.

Application changes the pointer only after exact approval and envelope writes succeed in the same transaction.
When delivery mode is off, effective mode is `legacy` while any stored pointer is preserved. No data is deleted
and ordinary routes remain on their existing legacy authority.
