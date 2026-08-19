# Historical Session Practice Options V1 Freeze

Contract: `HISTORICAL_SESSION_PRACTICE_OPTIONS_V1@1.0.0`

- Source SHA-256: `988c8e62bc0975662d6b505d2080d00bacc16494f3f87fe4ebf7f14b05f23e6c`
- SessionClient SHA-256: `35107e225e8e2b5f572677d55dbaa4c00957d317990d6cf4b96467c0cb7d41fa`
- Labels and descriptions remain exact: Full, Lighter, Recovery.
- `steady` maps to Full; `reduced` and `simplified` map to Lighter; unknown maps to Full.
- Full shallow-copies the routine array.
- Lighter retains warmup/activation, subtracts one set from each main above one, removes accessories,
  and retains cooldown.
- Recovery retains warmup/activation and cooldown and uses the historical text-field keyword filter.
- Recommendation remains suggested UI context.
- Selected mode remains on SessionRecord, absent from SessionDraft, and unrestored on resume.
- Historical any-mode ProgramProgress completion behavior remains unchanged.

These limitations are compatibility facts. V2 does not repair them in place.
