# Session Practice Persistence and Replay

Contract: `SESSION_PRACTICE_PERSISTENCE@1.0.0`. In-memory and PostgreSQL repositories are append-only. Exact retry is idempotent; semantic collision and missing lineage fail closed. Latest fallback count is `0`; current-row mutation count is `0`. The isolated migration is test/CI-only until G.
