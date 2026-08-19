# Controlled Owner Draft Resume Implementation

Drafts use `SESSION_PRACTICE_PERSISTENCE@1.0.0` in the existing
`session_practice_v2_attempt_revisions` table. Every append preserves application Program envelope, source
session revision, attempt, request, selected mode, realization revision, final-for-execution revision,
exercise/block/set position, entered Performance, timers, substitution references, and source versions.

Resume reads the exact owner and attempt lineage. Every update supplies the exact prior persistence revision;
stale, cross-user, missing-source, or terminal revisions fail closed. The source is never regenerated on
resume, and the current legacy `SessionDraft` is unchanged.
