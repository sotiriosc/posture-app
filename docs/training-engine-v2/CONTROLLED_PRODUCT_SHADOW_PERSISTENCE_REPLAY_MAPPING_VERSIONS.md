# Controlled Product Shadow Persistence and Replay Mapping Versions

Existing append-only JSON record storage can preserve the versioned bundle and exact references; no migration or production database change is required.

Replay requires every exact mapping profile, planning policy, pipeline profile, source revision, identity registry, B1-B4 reference, comparison version, and evaluation time. Missing versions return `CONTROLLED_PRODUCT_SHADOW_MAPPING_PROFILE_VERSION_UNAVAILABLE`; latest fallback count is `0`.
