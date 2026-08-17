# Controlled Owner History Implementation

`/account/praxis-v2/history` and its GET API are apply-mode, owner-scoped, private no-store surfaces. They list
only owner V2 applications, current attempt revisions, selected modes, completion dispositions, Outcome-link
state, and owner delivery audit events. Legacy records are not presented as V2 lineage.

The separate link to legacy History preserves access without merging evidence. Mode off, preview mode,
ineligible identity, and cross-user identifiers return no owner History.
