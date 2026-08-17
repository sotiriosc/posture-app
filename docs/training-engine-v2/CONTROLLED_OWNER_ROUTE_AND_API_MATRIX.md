# Controlled Owner Route And API Matrix

| Surface | Method | Preview mode | Apply mode | Authority |
| --- | --- | --- | --- | --- |
| `/account/praxis-v2` | GET | allowed | allowed | server page gate |
| `/account/praxis-v2/preview/[previewId]` | GET | exact owner preview | exact owner preview | server page gate + repository |
| `/account/praxis-v2/week/[applicationId]` | GET | 404 | active exact application | server page gate + pointer |
| `/account/praxis-v2/session/[attemptId]` | GET | 404 | exact active owner attempt | envelope + practice revisions |
| `/account/praxis-v2/history` | GET | 404 | owner V2 only | session user ID |
| `/api/training/v2-owner/status` | GET | allowed | allowed | passive identity gate |
| `/api/training/v2-owner/enrollment` | POST | preview permission | apply permission allowed | CSRF + session user ID |
| `/api/training/v2-owner/profile` | GET/POST | allowed | allowed | CSRF on POST + session user ID |
| `/api/training/v2-owner/preview` | POST | allowed | allowed | CSRF + idempotency + rate limit |
| `/api/training/v2-owner/preview/[previewId]` | GET | exact owner preview | exact owner preview | session user ID |
| `/api/training/v2-owner/approve` | POST | 404 | allowed | CSRF + idempotency + revalidation |
| `/api/training/v2-owner/apply` | POST | 404 | allowed | CSRF + idempotency + transaction |
| `/api/training/v2-owner/week/[applicationId]` | GET | 404 | active exact application | session user ID + pointer |
| `/api/training/v2-owner/session/start` | POST | 404 | explicit practice selection | CSRF + active envelope |
| `/api/training/v2-owner/session/record` | POST | 404 | exact draft/mode revision | CSRF + exact prior revision |
| `/api/training/v2-owner/session/complete` | POST | 404 | exact completion | CSRF + idempotency + source events |
| `/api/training/v2-owner/history` | GET | 404 | owner V2 only | session user ID |

Every response is private no-store with structured errors. GET never mutates. Client `userId` and email fields
are rejected; only the passive session gate supplies identity. Rollback is added by its owning hardening commit
without changing this namespace.
