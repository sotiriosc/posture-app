CREATE TABLE adaptation_application_orchestration_runs (
  orchestration_revision_id TEXT PRIMARY KEY,
  orchestration_id TEXT NOT NULL,
  orchestration_attempt_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  request_revision_id TEXT NOT NULL,
  based_on_request_revision_id TEXT NULL,
  athlete_id TEXT NOT NULL,
  principal_id TEXT NOT NULL,
  directive_id TEXT NOT NULL,
  directive_revision_id TEXT NOT NULL,
  decision_id TEXT NOT NULL,
  decision_revision_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  rightful_owner TEXT NOT NULL,
  owner_port_reference JSONB NOT NULL,
  policy_references JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_semantic_fingerprint TEXT NOT NULL,
  orchestration_status TEXT NOT NULL CHECK (orchestration_status NOT IN ('applied','rolled_back')),
  persistence_state TEXT NOT NULL CHECK (persistence_state IN ('persisted','failed')),
  expected_current_revisions JSONB NOT NULL,
  request_payload JSONB NOT NULL,
  orchestration_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  application_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (application_applied = FALSE),
  product_mutation_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (product_mutation_applied = FALSE),
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_orchestration_idempotency_uq UNIQUE (athlete_id, idempotency_key),
  CONSTRAINT adaptation_orchestration_request_revision_uq UNIQUE (request_revision_id),
  CONSTRAINT adaptation_orchestration_one_final_attempt_uq UNIQUE (orchestration_attempt_id),
  CONSTRAINT adaptation_orchestration_payload_objects_chk CHECK (
    jsonb_typeof(request_payload) = 'object' AND jsonb_typeof(orchestration_payload) = 'object'
  )
);

CREATE TABLE adaptation_application_precondition_snapshots (
  precondition_snapshot_id TEXT PRIMARY KEY,
  orchestration_revision_id TEXT NOT NULL REFERENCES adaptation_application_orchestration_runs(orchestration_revision_id),
  athlete_id TEXT NOT NULL,
  precondition_state TEXT NOT NULL,
  failed_preconditions TEXT[] NOT NULL,
  reason_codes TEXT[] NOT NULL,
  snapshot_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  CONSTRAINT adaptation_precondition_one_per_run_uq UNIQUE (orchestration_revision_id),
  CONSTRAINT adaptation_precondition_payload_object_chk CHECK (jsonb_typeof(snapshot_payload) = 'object')
);

CREATE TABLE adaptation_application_owner_results (
  owner_result_record_id TEXT PRIMARY KEY,
  owner_result_fingerprint TEXT NOT NULL,
  orchestration_revision_id TEXT NOT NULL REFERENCES adaptation_application_orchestration_runs(orchestration_revision_id),
  athlete_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_contract_reference JSONB NOT NULL,
  action_value TEXT NOT NULL,
  target_id TEXT NOT NULL,
  owner_status TEXT NOT NULL,
  result_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  application_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (application_applied = FALSE),
  provenance JSONB NOT NULL,
  CONSTRAINT adaptation_owner_result_one_per_run_uq UNIQUE (orchestration_revision_id),
  CONSTRAINT adaptation_owner_result_payload_object_chk CHECK (jsonb_typeof(result_payload) = 'object')
);

CREATE TABLE adaptation_application_shadow_candidates (
  shadow_candidate_revision_id TEXT PRIMARY KEY,
  shadow_candidate_id TEXT NOT NULL,
  orchestration_revision_id TEXT NOT NULL REFERENCES adaptation_application_orchestration_runs(orchestration_revision_id),
  owner_result_record_id TEXT NOT NULL REFERENCES adaptation_application_owner_results(owner_result_record_id),
  athlete_id TEXT NOT NULL,
  proposed_program_revision_id TEXT NULL,
  proposed_week_plan_revision_id TEXT NULL,
  proposed_phase_result_revision_id TEXT NULL,
  candidate_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  application_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (application_applied = FALSE),
  provenance JSONB NOT NULL,
  CONSTRAINT adaptation_shadow_one_per_run_uq UNIQUE (orchestration_revision_id),
  CONSTRAINT adaptation_shadow_identity_uq UNIQUE (shadow_candidate_id, shadow_candidate_revision_id),
  CONSTRAINT adaptation_shadow_payload_object_chk CHECK (jsonb_typeof(candidate_payload) = 'object')
);

CREATE TABLE adaptation_application_validation_results (
  validation_result_record_id TEXT PRIMARY KEY,
  validation_fingerprint TEXT NOT NULL,
  orchestration_revision_id TEXT NOT NULL REFERENCES adaptation_application_orchestration_runs(orchestration_revision_id),
  shadow_candidate_revision_id TEXT NULL REFERENCES adaptation_application_shadow_candidates(shadow_candidate_revision_id),
  athlete_id TEXT NOT NULL,
  downstream_status TEXT NOT NULL,
  gate13_status TEXT NOT NULL,
  longitudinal_status TEXT NULL,
  locality_valid BOOLEAN NOT NULL,
  validation_payload JSONB NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  CONSTRAINT adaptation_validation_one_per_run_uq UNIQUE (orchestration_revision_id),
  CONSTRAINT adaptation_validation_payload_object_chk CHECK (jsonb_typeof(validation_payload) = 'object')
);

CREATE TABLE adaptation_application_orchestration_attempts (
  orchestration_attempt_record_id TEXT PRIMARY KEY,
  orchestration_revision_id TEXT NOT NULL REFERENCES adaptation_application_orchestration_runs(orchestration_revision_id),
  request_revision_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  principal_id TEXT NOT NULL,
  rightful_owner TEXT NOT NULL,
  result_state TEXT NOT NULL CHECK (result_state NOT IN ('applied','rolled_back')),
  before_references TEXT[] NOT NULL,
  proposed_after_references TEXT[] NOT NULL,
  attempt_payload JSONB NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL,
  application_applied BOOLEAN NOT NULL DEFAULT FALSE CHECK (application_applied = FALSE),
  provenance JSONB NOT NULL,
  CONSTRAINT adaptation_orchestration_attempt_one_per_run_uq UNIQUE (orchestration_revision_id),
  CONSTRAINT adaptation_orchestration_attempt_payload_object_chk CHECK (jsonb_typeof(attempt_payload) = 'object')
);

CREATE INDEX adaptation_orchestration_directive_idx
  ON adaptation_application_orchestration_runs(athlete_id, directive_revision_id, operation_time);
CREATE INDEX adaptation_orchestration_target_idx
  ON adaptation_application_orchestration_runs(athlete_id, target_id, operation_time);
CREATE INDEX adaptation_orchestration_owner_idx
  ON adaptation_application_orchestration_runs(rightful_owner, operation_time);

DO $$
DECLARE
  append_only_table TEXT;
BEGIN
  FOREACH append_only_table IN ARRAY ARRAY[
    'adaptation_application_orchestration_runs',
    'adaptation_application_precondition_snapshots',
    'adaptation_application_owner_results',
    'adaptation_application_shadow_candidates',
    'adaptation_application_validation_results',
    'adaptation_application_orchestration_attempts'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION reject_outcome_source_append_only_mutation()',
      append_only_table || '_append_only', append_only_table
    );
  END LOOP;
END;
$$;
