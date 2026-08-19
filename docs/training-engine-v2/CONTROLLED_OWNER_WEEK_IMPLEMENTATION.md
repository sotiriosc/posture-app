# Controlled Owner Week Implementation

The Week route requires apply mode, exact owner, exact application, a matching active `v2_owner` pointer, and
an exact envelope ID plus envelope revision. It has no latest fallback. The page reads the immutable owner
projection and displays Week sessions while retaining the legacy fallback reference.

Preview mode, mode off, ineligible identity, cross-user IDs, inactive applications, missing envelope revisions,
and repository failures cannot disclose owner Program data.
