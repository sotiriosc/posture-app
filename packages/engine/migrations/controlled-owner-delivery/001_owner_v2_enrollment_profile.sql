CREATE TABLE IF NOT EXISTS owner_v2_enrollments (
  user_id TEXT NOT NULL,
  enrollment_id TEXT NOT NULL,
  revision_id TEXT NOT NULL,
  based_on_revision_id TEXT NULL,
  contract_id TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  semantic_fingerprint TEXT NOT NULL,
  state TEXT NOT NULL,
  permission TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, enrollment_id, revision_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_v2_enrollments_current
  ON owner_v2_enrollments (user_id, created_at DESC, revision_id DESC);

CREATE TABLE IF NOT EXISTS owner_v2_profiles (
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  revision_id TEXT NOT NULL,
  based_on_revision_id TEXT NULL,
  contract_id TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  semantic_fingerprint TEXT NOT NULL,
  review_state TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  evaluation_time TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, profile_id, revision_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_v2_profiles_current
  ON owner_v2_profiles (user_id, review_state, created_at DESC, revision_id DESC);
