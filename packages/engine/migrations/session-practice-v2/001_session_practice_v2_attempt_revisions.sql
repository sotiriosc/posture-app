CREATE TABLE IF NOT EXISTS session_practice_v2_attempt_revisions (
  persistence_revision_id TEXT PRIMARY KEY,
  based_on_persistence_revision_id TEXT NULL REFERENCES session_practice_v2_attempt_revisions(persistence_revision_id),
  athlete_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  realization_revision_id TEXT NOT NULL,
  source_session_revision_id TEXT NOT NULL,
  final_for_execution_revision_id TEXT NULL,
  contract_id TEXT NOT NULL CHECK (contract_id = 'SESSION_PRACTICE_PERSISTENCE'),
  contract_version TEXT NOT NULL CHECK (contract_version = '1.0.0'),
  semantic_fingerprint TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  plan_fingerprint TEXT NOT NULL,
  revision_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  evaluation_time TIMESTAMPTZ NOT NULL,
  current_product_write_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (current_product_write_applied = FALSE),
  product_activation_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (product_activation_applied = FALSE),
  UNIQUE (athlete_id, attempt_id, persistence_revision_id)
);

CREATE INDEX IF NOT EXISTS session_practice_v2_attempt_revisions_attempt_idx
  ON session_practice_v2_attempt_revisions (athlete_id, attempt_id, created_at, persistence_revision_id);

CREATE OR REPLACE FUNCTION reject_session_practice_v2_revision_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'SESSION_PRACTICE_V2_REVISIONS_APPEND_ONLY';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_practice_v2_revisions_append_only
  ON session_practice_v2_attempt_revisions;

CREATE TRIGGER session_practice_v2_revisions_append_only
  BEFORE UPDATE OR DELETE ON session_practice_v2_attempt_revisions
  FOR EACH ROW EXECUTE FUNCTION reject_session_practice_v2_revision_mutation();
