CREATE TABLE IF NOT EXISTS owner_v2_calibration_cycle_revisions (
  user_id TEXT NOT NULL,
  cycle_id TEXT NOT NULL,
  cycle_revision_id TEXT NOT NULL,
  based_on_revision_id TEXT NULL,
  envelope_id TEXT NOT NULL,
  envelope_revision_id TEXT NOT NULL,
  state TEXT NOT NULL,
  cycle_fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, cycle_id, cycle_revision_id),
  UNIQUE (user_id, based_on_revision_id),
  FOREIGN KEY (user_id, envelope_id, envelope_revision_id)
    REFERENCES owner_v2_program_envelopes (user_id, envelope_id, envelope_revision_id),
  FOREIGN KEY (user_id, cycle_id, based_on_revision_id)
    REFERENCES owner_v2_calibration_cycle_revisions (user_id, cycle_id, cycle_revision_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_v2_calibration_cycle_current
  ON owner_v2_calibration_cycle_revisions (user_id, cycle_id, created_at DESC, cycle_revision_id DESC);

CREATE INDEX IF NOT EXISTS idx_owner_v2_calibration_envelope
  ON owner_v2_calibration_cycle_revisions (user_id, envelope_revision_id, created_at DESC);
