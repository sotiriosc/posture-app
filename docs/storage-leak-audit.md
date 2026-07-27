# Storage leak audit (consumer app)

Cross-account browser storage audit. Observed symptom: macro calculator appeared to retain another user’s inputs after logout → login. Root cause on current `main`: the public calculator used **shared default form values** (180 lb / 70 in / 30 yo) with no persistence — which looks like retention — not a localStorage write. This audit still covers every client persistence path.

Isolation model (Phase 6e): non-photo local state is device-global and wiped on account boundary via `clearAllLocalState()` / `clearAllLocalStateExceptPhotos()` + `syncLocalOwner`. Photos are namespaced by `userId` in IndexedDB `bodycoach-photos`.

---

## Legend

| Classification | Rule |
|---|---|
| **User data** | Must be namespaced by `userId` **or** cleared on logout / account switch |
| **Device/app data** | May persist unscoped; document why |
| **Ambiguous** | Needs product ruling |

| Verdict | Meaning |
|---|---|
| **safe** | Meets the rule today |
| **leaks** | Can show another account’s data |
| **fixed** | Addressed in this change |

---

## localStorage

| Key | Data | Namespaced? | Cleared on logout/switch? | Class | Verdict |
|---|---|---|---|---|---|
| `app_state_v1` | Active program / UI app state | No (wipe model) | Yes (`clearAllLocalState`) | User | safe |
| `posture_questionnaire` | Assessment answers | No (wipe model) | Yes | User | safe |
| `posture_photo_meta` | Photo slot metadata | No (wipe model); blobs namespaced in IDB | Yes | User | safe |
| `exercise_logs` | Legacy logs (migrated to IDB) | No | Yes | User | safe |
| `bodycoach_sessions` | Legacy sessions | No | Yes | User | safe |
| `timer_prefs` | Legacy timer prefs | No | Yes | User | safe |
| `session_feedback` | Legacy feedback | No | Yes | User | safe |
| `praxis_subscription_v1` | Cached subscription snapshot | No (wipe model) | Yes | User | safe |
| `praxis_coach_note_v1` | Coach note cache | No (wipe model) | Yes | User | safe |
| `praxis_offline_sync_queue` | Offline training mutations | No (wipe model) | Yes | User | safe |
| `praxis_local_owner_id` | Current local owner marker | N/A (isolation control) | Rewritten after wipe | Device/app | safe |
| `session_last_completed_at` | Last completed session timestamp | No | Yes | User | safe |
| `session_dropoff_telemetry` | Drop-off telemetry buffer | No | Yes | User | safe |
| `results_last_seen_session_complete_at` | Session-complete notice ack | No | Yes | User | safe |
| `praxis_dashboard_unlock_level` | Dashboard unlock progress | No | Yes | User | safe |
| `phase-ready-dismissed:{programId}:phase-{n}` | Phase-ready notice dismissal | No | Yes | User | safe |
| `praxis_feedback_prompt_dismissed` | Feedback prompt dismissal | No | Yes | User | safe |
| `onboarding_state_v1` | Onboarding progress | No | Yes | User | safe |
| `pwa_install_dismissed_at` | Install prompt dismissal | No | Cleared by full wipe (acceptable reset) | Device/app | safe — device UX preference; wiping on logout is fine |
| `pwa_install_installed` | Install completed flag | No | Cleared by full wipe | Device/app | safe |
| `device_qa_checklist_v1` | Dev QA checklist | No | Cleared by full wipe | Device/app | safe — dev-only |
| *(macro calculator)* | Inputs | **Server on `StoredUser`** when logged in; **no browser persist** when anonymous | Any future local cache must clear via `clearAllLocalState` | User | **fixed** — Option C (account recall); anonymous blank |

---

## sessionStorage

| Key | Data | Namespaced? | Cleared on logout/switch? | Class | Verdict |
|---|---|---|---|---|---|
| `resume_banner_dismissed_{sessionId}` | Resume banner dismiss | By sessionId | Yes (`sessionStorage.clear`) | User | safe |

---

## IndexedDB

| Database | Data | Namespaced? | Cleared on logout/switch? | Class | Verdict |
|---|---|---|---|---|---|
| `bodycoach-logs` | Programs, sessions, logs, prefs | No (wipe model) | Yes | User | safe |
| `bodycoach-drafts` | In-progress session drafts | No (wipe model) | Yes | User | safe |
| `bodycoach-photos` | Progress photos | Yes (`userId:slot`) | **No** (preserved) | User | safe — namespaced; invisible to other accounts |

Direct IDB opens outside the photo namespace helper are the logs/drafts stores above; they rely on wipe-on-switch, not key namespacing.

---

## Cookies (client / auth)

| Cookie | Data | Notes | Class | Verdict |
|---|---|---|---|---|
| Auth session cookie (`AUTH_COOKIE_NAME`) | Signed session | Set/cleared by server auth routes; logout clears | User | safe |
| Admin cookie | Admin gate | Server-set; not account training data | Device/app | safe |

No third-party / persistence-library cookie stores found (`zustand` persist, etc.).

---

## State libraries

None found (`zustand`/`persist`/`createJSONStorage` unused for browser persistence).

---

## Wipe utilities

| API | Behavior | Notes |
|---|---|---|
| `clearAllLocalState()` | Alias of `clearAllLocalStateExceptPhotos` | Enumerates all origin IndexedDB DBs except photos; `localStorage.clear()` + `sessionStorage.clear()` |
| `clearAllLocalStateExceptPhotos()` | Same | Used by `syncLocalOwner` on login/logout/switch |
| `eraseAllLocalData()` | Full wipe including photos | Settings “Erase all local data” |
| `resetAllAppData()` | Surgical | Now clears **all Praxis-owned localStorage keys** by prefix/exact-match enumeration (not a stale hard-coded subset) |

---

## Macro calculator (Option C — ratified)

| State | Behavior |
|---|---|
| Logged out | Form **blank**; nothing saved to browser or server |
| Logged in | Inputs saved on the **user record** (`macroCalculatorInputs`); prefilled on load |
| Logout | Local caches cleared via `clearAllLocalState`; server record kept |
| Other user | Sees their own saved inputs or blank — never another user’s |

---

## Ambiguous (for Sotirios)

None blocking this PR. `praxis_feedback_prompt_dismissed` is treated as user UX state and is cleared on account switch (safe under wipe model). If it should survive logout as a device preference, say so and we can exclude it from the wipe (not recommended).

---

## Test guard

`apps/consumer/tests/e2e/noCrossAccountStorageLeak.spec.ts` — login as A, enter data (including macro calculator), logout, login as B, assert A’s values are not visible.
