CREATE TABLE controlled_product_shadow_triggers (
  trigger_revision_id TEXT PRIMARY KEY,
  trigger_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  app_surface TEXT NOT NULL CHECK (app_surface IN ('consumer', 'gyms')),
  trigger_kind TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  semantic_fingerprint TEXT NOT NULL,
  trigger_payload JSONB NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL,
  UNIQUE (athlete_id, idempotency_key),
  UNIQUE (athlete_id, trigger_id)
);

CREATE TABLE controlled_product_shadow_runs (
  run_revision_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  based_on_run_revision_id TEXT NULL REFERENCES controlled_product_shadow_runs(run_revision_id),
  trigger_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_triggers(trigger_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  anchor_program_id TEXT NULL,
  run_type TEXT NOT NULL,
  run_status TEXT NOT NULL,
  product_snapshot_revision_id TEXT NOT NULL,
  mapping_payload JSONB NOT NULL,
  resource_trace JSONB NOT NULL,
  record_payload JSONB NOT NULL,
  evaluation_time TIMESTAMPTZ NOT NULL,
  product_mutation_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (product_mutation_applied = FALSE),
  application_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (application_applied = FALSE),
  delivered_to_user BOOLEAN NOT NULL DEFAULT FALSE CHECK (delivered_to_user = FALSE),
  performed BOOLEAN NOT NULL DEFAULT FALSE CHECK (performed = FALSE),
  UNIQUE (athlete_id, run_id)
);

CREATE TABLE controlled_product_shadow_product_snapshots (
  source_snapshot_revision_id TEXT PRIMARY KEY,
  run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  product_state_revision_fingerprint TEXT NOT NULL,
  structured_reference_payload JSONB NOT NULL,
  evaluation_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE controlled_product_shadow_legacy_program_projections (
  projection_record_id TEXT PRIMARY KEY,
  run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  program_id TEXT NOT NULL,
  program_revision_id TEXT NOT NULL,
  projection_payload JSONB NOT NULL,
  candidate_authority BOOLEAN NOT NULL DEFAULT FALSE CHECK (candidate_authority = FALSE),
  prescription_authority BOOLEAN NOT NULL DEFAULT FALSE CHECK (prescription_authority = FALSE),
  performance_authority BOOLEAN NOT NULL DEFAULT FALSE CHECK (performance_authority = FALSE)
);

CREATE TABLE controlled_product_shadow_v2_artifact_references (
  artifact_record_id TEXT PRIMARY KEY,
  run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  artifact_id TEXT NOT NULL,
  artifact_revision_id TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  counterfactual_only BOOLEAN NOT NULL DEFAULT TRUE CHECK (counterfactual_only = TRUE),
  UNIQUE (run_revision_id, artifact_revision_id)
);

CREATE TABLE controlled_product_shadow_comparisons (
  comparison_revision_id TEXT PRIMARY KEY,
  comparison_id TEXT NOT NULL,
  run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  difference_class TEXT NOT NULL,
  first_meaningful_difference TEXT NULL,
  comparison_payload JSONB NOT NULL,
  weighted_better_score NUMERIC NULL CHECK (weighted_better_score IS NULL),
  outcome_superiority_claimed BOOLEAN NOT NULL DEFAULT FALSE CHECK (outcome_superiority_claimed = FALSE)
);

CREATE TABLE controlled_product_shadow_failures (
  failure_record_id TEXT PRIMARY KEY,
  run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  athlete_id TEXT NOT NULL,
  failure_codes TEXT[] NOT NULL,
  failure_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE controlled_product_shadow_audit_events (
  audit_event_id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  trigger_revision_id TEXT NULL,
  run_revision_id TEXT NULL,
  operation TEXT NOT NULL,
  result_state TEXT NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  audit_payload JSONB NOT NULL
);

CREATE TABLE controlled_product_shadow_supersessions (
  supersession_id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  prior_run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  superseding_run_revision_id TEXT NOT NULL REFERENCES controlled_product_shadow_runs(run_revision_id) ON DELETE CASCADE,
  reason_code TEXT NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  UNIQUE (prior_run_revision_id, superseding_run_revision_id)
);

CREATE INDEX idx_controlled_shadow_trigger_athlete_time
  ON controlled_product_shadow_triggers (athlete_id, accepted_at DESC);
CREATE INDEX idx_controlled_shadow_run_athlete_time
  ON controlled_product_shadow_runs (athlete_id, evaluation_time DESC);
CREATE INDEX idx_controlled_shadow_run_anchor
  ON controlled_product_shadow_runs (athlete_id, anchor_program_id, evaluation_time DESC);

CREATE OR REPLACE FUNCTION reject_controlled_product_shadow_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('praxis.controlled_shadow_erasure_authorized', TRUE) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'CONTROLLED_PRODUCT_SHADOW_APPEND_ONLY';
END;
$$;

CREATE TRIGGER controlled_shadow_triggers_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_triggers
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_runs_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_runs
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_snapshots_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_product_snapshots
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_legacy_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_legacy_program_projections
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_artifacts_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_v2_artifact_references
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_comparisons_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_comparisons
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_failures_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_failures
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_audit_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_audit_events
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
CREATE TRIGGER controlled_shadow_supersessions_append_only
  BEFORE UPDATE OR DELETE ON controlled_product_shadow_supersessions
  FOR EACH ROW EXECUTE FUNCTION reject_controlled_product_shadow_mutation();
