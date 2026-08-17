CREATE TABLE IF NOT EXISTS owner_v2_previews (
  user_id TEXT NOT NULL,
  preview_id TEXT NOT NULL,
  preview_fingerprint TEXT NOT NULL,
  profile_revision_id TEXT NOT NULL,
  source_product_revision_id TEXT NOT NULL,
  readiness_status TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, preview_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_v2_previews_user_created
  ON owner_v2_previews (user_id, created_at DESC, preview_id DESC);

CREATE TABLE IF NOT EXISTS owner_v2_approvals (
  user_id TEXT NOT NULL,
  approval_id TEXT NOT NULL,
  preview_id TEXT NOT NULL,
  approval_fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, approval_id),
  UNIQUE (user_id, preview_id),
  FOREIGN KEY (user_id, preview_id) REFERENCES owner_v2_previews (user_id, preview_id)
);

CREATE TABLE IF NOT EXISTS owner_v2_program_envelopes (
  user_id TEXT NOT NULL,
  envelope_id TEXT NOT NULL,
  envelope_revision_id TEXT NOT NULL,
  envelope_fingerprint TEXT NOT NULL,
  preview_id TEXT NOT NULL,
  approval_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, envelope_id, envelope_revision_id),
  FOREIGN KEY (user_id, preview_id) REFERENCES owner_v2_previews (user_id, preview_id),
  FOREIGN KEY (user_id, approval_id) REFERENCES owner_v2_approvals (user_id, approval_id)
);

CREATE TABLE IF NOT EXISTS owner_v2_applications (
  user_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  approval_id TEXT NOT NULL,
  preview_id TEXT NOT NULL,
  envelope_id TEXT NOT NULL,
  application_fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, application_id),
  UNIQUE (user_id, approval_id),
  FOREIGN KEY (user_id, preview_id) REFERENCES owner_v2_previews (user_id, preview_id),
  FOREIGN KEY (user_id, approval_id) REFERENCES owner_v2_approvals (user_id, approval_id)
);

CREATE TABLE IF NOT EXISTS owner_v2_active_program_pointers (
  user_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  active_application_id TEXT NULL,
  legacy_fallback_reference TEXT NULL,
  revision INTEGER NOT NULL,
  pointer_fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS owner_v2_delivery_audit_events (
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  event_fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_v2_delivery_audit_user_time
  ON owner_v2_delivery_audit_events (user_id, occurred_at DESC, event_id DESC);

CREATE TABLE IF NOT EXISTS owner_v2_idempotency (
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  response_payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NULL,
  PRIMARY KEY (user_id, action, idempotency_key)
);
