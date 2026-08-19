CREATE TABLE outcome_source_raw_envelopes (
  envelope_id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  authenticated_principal_id TEXT NOT NULL,
  source_category TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_native_record_id TEXT NOT NULL,
  source_native_revision_id TEXT NULL,
  source_exposure_event_id TEXT NULL,
  session_id TEXT NULL,
  opportunity_id TEXT NULL,
  reservation_id TEXT NULL,
  prescription_id TEXT NULL,
  prescription_revision_id TEXT NULL,
  sequence_plan_id TEXT NULL,
  sequence_revision_id TEXT NULL,
  planned_block_id TEXT NULL,
  performed_block_id TEXT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  event_timezone TEXT NOT NULL,
  ingestion_time TIMESTAMPTZ NOT NULL,
  payload_schema_id TEXT NOT NULL,
  payload_schema_version TEXT NOT NULL,
  adapter_id TEXT NOT NULL,
  adapter_version TEXT NOT NULL,
  payload_checksum TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  authorization_reference TEXT NOT NULL,
  correction_reference TEXT NULL,
  structured_payload JSONB NULL,
  opaque_payload_reference TEXT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_raw_payload_form_chk CHECK (
    (structured_payload IS NULL) <> (opaque_payload_reference IS NULL)
  ),
  CONSTRAINT outcome_source_raw_event_before_ingestion_chk CHECK (event_time <= ingestion_time),
  CONSTRAINT outcome_source_raw_provenance_array_chk CHECK (jsonb_typeof(provenance) = 'array')
);

CREATE TABLE outcome_source_records (
  source_record_id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  source_category TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_native_record_id TEXT NOT NULL,
  first_envelope_id TEXT NOT NULL REFERENCES outcome_source_raw_envelopes(envelope_id),
  created_at TIMESTAMPTZ NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_record_native_identity_uq UNIQUE (
    athlete_id, source_category, source_system, source_native_record_id
  )
);

CREATE TABLE outcome_source_authorization_revisions (
  authorization_revision_id TEXT PRIMARY KEY,
  authorization_id TEXT NOT NULL,
  authorization_version TEXT NOT NULL,
  based_on_authorization_revision_id TEXT NULL REFERENCES outcome_source_authorization_revisions(authorization_revision_id),
  athlete_id TEXT NOT NULL,
  source_categories TEXT[] NOT NULL,
  permitted_purposes TEXT[] NOT NULL,
  authorization_state TEXT NOT NULL CHECK (authorization_state IN ('authorized','restricted','revoked','pending','unknown')),
  effective_time TIMESTAMPTZ NOT NULL,
  expiration_time TIMESTAMPTZ NULL,
  revocation_reference TEXT NULL,
  owner_id TEXT NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_authorization_version_uq UNIQUE (authorization_id, authorization_version),
  CONSTRAINT outcome_source_authorization_interval_chk CHECK (
    expiration_time IS NULL OR expiration_time >= effective_time
  )
);

CREATE TABLE outcome_source_record_revisions (
  source_record_revision_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES outcome_source_records(source_record_id),
  envelope_id TEXT NOT NULL REFERENCES outcome_source_raw_envelopes(envelope_id),
  based_on_revision_id TEXT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  source_category TEXT NOT NULL,
  source_owner TEXT NOT NULL,
  source_authority TEXT NOT NULL CHECK (source_authority IN (
    'authenticated_product_event','independently_observed_performance','athlete_explicit_report',
    'coach_reviewed','clinician_explicit_restriction','production_engine_trace','reviewed_aggregate',
    'imported_legacy_record','unknown'
  )),
  source_exposure_event_id TEXT NULL,
  session_id TEXT NULL,
  opportunity_id TEXT NULL,
  reservation_id TEXT NULL,
  prescription_id TEXT NULL,
  prescription_revision_id TEXT NULL,
  sequence_plan_id TEXT NULL,
  sequence_revision_id TEXT NULL,
  planned_block_id TEXT NULL,
  performed_block_id TEXT NULL,
  target_ids TEXT[] NOT NULL,
  structured_facts JSONB NOT NULL,
  explicit_unknowns TEXT[] NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  ingestion_time TIMESTAMPTZ NOT NULL,
  applies_through_time TIMESTAMPTZ NULL,
  review_state TEXT NOT NULL CHECK (review_state IN ('validated','reviewed','pending','rejected','unknown')),
  revision_state TEXT NOT NULL CHECK (revision_state IN ('active','corrected','superseded','withdrawn','invalid','unknown')),
  authorization_state TEXT NOT NULL CHECK (authorization_state IN ('authorized','restricted','revoked','pending','unknown')),
  authorization_revision_id TEXT NOT NULL REFERENCES outcome_source_authorization_revisions(authorization_revision_id),
  correction_reason TEXT NULL,
  changed_structured_paths TEXT[] NOT NULL,
  correction_owner TEXT NULL,
  correction_time TIMESTAMPTZ NULL,
  final_for_source_record BOOLEAN NOT NULL,
  immutable_content_fingerprint TEXT NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_revision_record_identity_uq UNIQUE (source_record_id, source_record_revision_id),
  CONSTRAINT outcome_source_revision_event_before_ingestion_chk CHECK (event_time <= ingestion_time),
  CONSTRAINT outcome_source_revision_final_active_chk CHECK (
    NOT final_for_source_record OR revision_state = 'active'
  ),
  CONSTRAINT outcome_source_revision_no_self_reference_chk CHECK (
    based_on_revision_id IS NULL OR based_on_revision_id <> source_record_revision_id
  ),
  CONSTRAINT outcome_source_revision_facts_array_chk CHECK (jsonb_typeof(structured_facts) = 'array')
);

CREATE TABLE outcome_source_active_revisions (
  source_record_id TEXT PRIMARY KEY REFERENCES outcome_source_records(source_record_id),
  athlete_id TEXT NOT NULL,
  active_revision_id TEXT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  authorization_revision_id TEXT NULL REFERENCES outcome_source_authorization_revisions(authorization_revision_id),
  pointer_version BIGINT NOT NULL DEFAULT 1 CHECK (pointer_version > 0),
  changed_at TIMESTAMPTZ NOT NULL,
  changed_by_principal_id TEXT NOT NULL,
  change_reason TEXT NOT NULL
);

CREATE TABLE outcome_source_idempotency (
  athlete_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  payload_checksum TEXT NOT NULL,
  source_native_identity TEXT NOT NULL,
  normalized_semantic_identity TEXT NOT NULL,
  envelope_id TEXT NOT NULL REFERENCES outcome_source_raw_envelopes(envelope_id) DEFERRABLE INITIALLY DEFERRED,
  source_record_id TEXT NOT NULL REFERENCES outcome_source_records(source_record_id) DEFERRABLE INITIALLY DEFERRED,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id) DEFERRABLE INITIALLY DEFERRED,
  ingestion_result JSONB NOT NULL,
  ingestion_time TIMESTAMPTZ NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (athlete_id, source_system, idempotency_key),
  CONSTRAINT outcome_source_idempotency_result_object_chk CHECK (jsonb_typeof(ingestion_result) = 'object')
);

CREATE TABLE outcome_source_performance_blocks (
  performance_block_result_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  source_exposure_event_id TEXT NOT NULL,
  planned_block_id TEXT NULL,
  performed_block_id TEXT NOT NULL,
  completion_state TEXT NOT NULL,
  actual_facts JSONB NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_performance_revision_block_uq UNIQUE (source_record_revision_id, performed_block_id),
  CONSTRAINT outcome_source_performance_actual_object_chk CHECK (jsonb_typeof(actual_facts) = 'object')
);

CREATE TABLE outcome_source_response_observations (
  response_observation_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  source_exposure_event_id TEXT NOT NULL,
  performance_block_result_id TEXT NULL REFERENCES outcome_source_performance_blocks(performance_block_result_id),
  tolerance TEXT NOT NULL,
  region TEXT NULL,
  side TEXT NULL,
  symptom_change TEXT NOT NULL,
  onset_state TEXT NOT NULL,
  persistence_state TEXT NOT NULL,
  consequence TEXT NOT NULL,
  realization_context JSONB NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcome_source_adherence_observations (
  adherence_observation_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  source_exposure_event_id TEXT NULL,
  session_id TEXT NULL,
  adherence_state TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcome_source_recovery_observations (
  recovery_observation_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  target_ids TEXT[] NOT NULL,
  readiness_state TEXT NOT NULL,
  scope_state TEXT NOT NULL,
  applies_through_time TIMESTAMPTZ NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_recovery_interval_chk CHECK (applies_through_time >= event_time)
);

CREATE TABLE outcome_source_safety_restrictions (
  safety_restriction_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  authority TEXT NOT NULL,
  restriction_type TEXT NOT NULL,
  restriction_value TEXT NOT NULL,
  permitted BOOLEAN NOT NULL,
  effective_time TIMESTAMPTZ NOT NULL,
  applies_through_time TIMESTAMPTZ NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcome_source_equipment_environment_snapshots (
  equipment_environment_snapshot_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  source_category TEXT NOT NULL CHECK (source_category IN ('equipment_snapshot','environment_constraint')),
  capabilities JSONB NOT NULL,
  location_id TEXT NULL,
  effective_time TIMESTAMPTZ NOT NULL,
  applies_through_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_equipment_interval_chk CHECK (applies_through_time >= effective_time),
  CONSTRAINT outcome_source_equipment_capabilities_array_chk CHECK (jsonb_typeof(capabilities) = 'array')
);

CREATE TABLE outcome_source_external_load_observations (
  external_load_observation_id TEXT PRIMARY KEY,
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes NUMERIC NULL CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  intensity_descriptor TEXT NOT NULL,
  explicit_regions TEXT[] NOT NULL,
  receiver_state TEXT NOT NULL CHECK (receiver_state = 'EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED'),
  event_time TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcome_source_snapshots (
  snapshot_revision_id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  evaluation_time TIMESTAMPTZ NOT NULL,
  fingerprint TEXT NOT NULL,
  conflicts TEXT[] NOT NULL,
  unresolved_source_categories TEXT[] NOT NULL,
  authorization_states TEXT[] NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_source_snapshot_identity_uq UNIQUE (snapshot_id, snapshot_revision_id)
);

CREATE TABLE outcome_source_snapshot_memberships (
  snapshot_revision_id TEXT NOT NULL REFERENCES outcome_source_snapshots(snapshot_revision_id),
  source_record_revision_id TEXT NOT NULL REFERENCES outcome_source_record_revisions(source_record_revision_id),
  athlete_id TEXT NOT NULL,
  membership_state TEXT NOT NULL CHECK (membership_state IN ('included','excluded')),
  exclusion_reasons TEXT[] NOT NULL,
  PRIMARY KEY (snapshot_revision_id, source_record_revision_id)
);

CREATE TABLE adaptation_completed_exposure_ledgers (
  ledger_revision_id TEXT PRIMARY KEY,
  ledger_id TEXT NOT NULL,
  based_on_ledger_revision_id TEXT NULL REFERENCES adaptation_completed_exposure_ledgers(ledger_revision_id),
  athlete_id TEXT NOT NULL,
  source_snapshot_revision_id TEXT NOT NULL REFERENCES outcome_source_snapshots(snapshot_revision_id),
  evaluated_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_completed_ledger_identity_uq UNIQUE (ledger_id, ledger_revision_id)
);

CREATE TABLE adaptation_completed_exposure_entries (
  ledger_revision_id TEXT NOT NULL REFERENCES adaptation_completed_exposure_ledgers(ledger_revision_id),
  outcome_entry_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  source_exposure_event_id TEXT NOT NULL,
  original_exercise_id TEXT NOT NULL,
  realized_exercise_id TEXT NOT NULL,
  prescription_id TEXT NOT NULL,
  prescription_revision_id TEXT NOT NULL,
  sequence_plan_id TEXT NOT NULL,
  sequence_revision_id TEXT NOT NULL,
  block_performance_references TEXT[] NOT NULL,
  response_references TEXT[] NOT NULL,
  recovery_references TEXT[] NOT NULL,
  entry_payload JSONB NOT NULL,
  PRIMARY KEY (ledger_revision_id, outcome_entry_id),
  CONSTRAINT adaptation_completed_ledger_event_uq UNIQUE (ledger_revision_id, source_exposure_event_id)
);

CREATE TABLE adaptation_longitudinal_state_revisions (
  state_revision_id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL,
  based_on_state_revision_id TEXT NULL REFERENCES adaptation_longitudinal_state_revisions(state_revision_id),
  decision_attempt_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  source_snapshot_revision_id TEXT NOT NULL REFERENCES outcome_source_snapshots(snapshot_revision_id),
  program_snapshot_revision_id TEXT NOT NULL,
  phase_result_revision_id TEXT NOT NULL,
  evidence_window_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  state_value TEXT NOT NULL,
  final_for_decision_attempt BOOLEAN NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_longitudinal_state_identity_uq UNIQUE (state_id, state_revision_id)
);

CREATE TABLE adaptation_longitudinal_decision_revisions (
  decision_revision_id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL,
  based_on_decision_revision_id TEXT NULL REFERENCES adaptation_longitudinal_decision_revisions(decision_revision_id),
  decision_attempt_id TEXT NOT NULL,
  state_revision_id TEXT NOT NULL REFERENCES adaptation_longitudinal_state_revisions(state_revision_id),
  athlete_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  source_snapshot_revision_id TEXT NOT NULL REFERENCES outcome_source_snapshots(snapshot_revision_id),
  program_snapshot_revision_id TEXT NOT NULL,
  phase_result_revision_id TEXT NOT NULL,
  evidence_window_id TEXT NOT NULL,
  policy_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  action_value TEXT NOT NULL,
  application_owner TEXT NOT NULL,
  authorization_state TEXT NOT NULL CHECK (authorization_state IN ('authorized','restricted','revoked','pending','unknown')),
  application_state TEXT NOT NULL CHECK (application_state <> 'applied'),
  final_for_decision_attempt BOOLEAN NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_longitudinal_decision_identity_uq UNIQUE (decision_id, decision_revision_id)
);

CREATE TABLE adaptation_action_directives (
  directive_revision_id TEXT PRIMARY KEY,
  directive_id TEXT NOT NULL,
  based_on_directive_revision_id TEXT NULL REFERENCES adaptation_action_directives(directive_revision_id),
  decision_id TEXT NOT NULL,
  decision_revision_id TEXT NOT NULL REFERENCES adaptation_longitudinal_decision_revisions(decision_revision_id),
  athlete_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_scope TEXT NOT NULL,
  source_snapshot_revision_id TEXT NOT NULL REFERENCES outcome_source_snapshots(snapshot_revision_id),
  program_snapshot_revision_id TEXT NOT NULL,
  action_value TEXT NOT NULL,
  requested_dimensions TEXT[] NOT NULL,
  application_owner TEXT NOT NULL,
  application_state TEXT NOT NULL CHECK (application_state <> 'applied'),
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_action_directive_identity_uq UNIQUE (directive_id, directive_revision_id)
);

CREATE TABLE adaptation_application_requests (
  request_revision_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  directive_id TEXT NOT NULL,
  directive_revision_id TEXT NOT NULL REFERENCES adaptation_action_directives(directive_revision_id),
  target_id TEXT NOT NULL,
  application_owner TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  expected_current_revisions JSONB NOT NULL,
  confirmation_state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT adaptation_application_request_idempotency_uq UNIQUE (athlete_id, idempotency_key),
  CONSTRAINT adaptation_application_request_identity_uq UNIQUE (request_id, request_revision_id)
);

CREATE TABLE adaptation_application_attempts (
  attempt_id TEXT PRIMARY KEY,
  request_revision_id TEXT NOT NULL REFERENCES adaptation_application_requests(request_revision_id),
  athlete_id TEXT NOT NULL,
  principal_id TEXT NOT NULL,
  rightful_owner TEXT NOT NULL,
  precondition_result JSONB NOT NULL,
  confirmation_state TEXT NOT NULL,
  result_state TEXT NOT NULL CHECK (result_state <> 'applied'),
  before_references TEXT[] NOT NULL,
  after_references TEXT[] NOT NULL,
  rollback_reference TEXT NULL,
  attempted_at TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcome_source_audit_events (
  audit_event_id TEXT PRIMARY KEY,
  athlete_id TEXT NULL,
  principal_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_revision_id TEXT NULL,
  before_reference TEXT NULL,
  after_reference TEXT NULL,
  reason_code TEXT NOT NULL,
  operation_time TIMESTAMPTZ NOT NULL,
  result_state TEXT NOT NULL,
  provenance JSONB NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX outcome_source_one_final_state_per_attempt_idx
  ON adaptation_longitudinal_state_revisions(decision_attempt_id) WHERE final_for_decision_attempt;
CREATE UNIQUE INDEX outcome_source_one_final_decision_per_attempt_idx
  ON adaptation_longitudinal_decision_revisions(decision_attempt_id) WHERE final_for_decision_attempt;
CREATE INDEX outcome_source_raw_athlete_event_time_idx ON outcome_source_raw_envelopes(athlete_id, event_time);
CREATE INDEX outcome_source_raw_athlete_category_idx ON outcome_source_raw_envelopes(athlete_id, source_category);
CREATE INDEX outcome_source_raw_exposure_event_idx ON outcome_source_raw_envelopes(source_exposure_event_id);
CREATE INDEX outcome_source_raw_session_idx ON outcome_source_raw_envelopes(session_id);
CREATE INDEX outcome_source_raw_opportunity_reservation_idx ON outcome_source_raw_envelopes(opportunity_id, reservation_id);
CREATE INDEX outcome_source_raw_prescription_revision_idx ON outcome_source_raw_envelopes(prescription_id, prescription_revision_id);
CREATE INDEX outcome_source_raw_sequence_revision_idx ON outcome_source_raw_envelopes(sequence_plan_id, sequence_revision_id);
CREATE INDEX outcome_source_revision_record_idx ON outcome_source_record_revisions(source_record_id, source_record_revision_id);
CREATE INDEX outcome_source_revision_athlete_event_idx ON outcome_source_record_revisions(athlete_id, event_time);
CREATE INDEX outcome_source_revision_exposure_idx ON outcome_source_record_revisions(source_exposure_event_id);
CREATE INDEX outcome_source_revision_prescription_idx ON outcome_source_record_revisions(prescription_id, prescription_revision_id);
CREATE INDEX outcome_source_revision_sequence_idx ON outcome_source_record_revisions(sequence_plan_id, sequence_revision_id);
CREATE INDEX outcome_source_active_athlete_idx ON outcome_source_active_revisions(athlete_id, source_record_id);
CREATE INDEX outcome_source_authorization_active_idx ON outcome_source_authorization_revisions(athlete_id, authorization_state, effective_time);
CREATE INDEX outcome_source_performance_event_idx ON outcome_source_performance_blocks(athlete_id, source_exposure_event_id);
CREATE INDEX outcome_source_response_event_idx ON outcome_source_response_observations(athlete_id, source_exposure_event_id);
CREATE INDEX outcome_source_adherence_session_idx ON outcome_source_adherence_observations(athlete_id, session_id);
CREATE INDEX outcome_source_snapshot_athlete_time_idx ON outcome_source_snapshots(athlete_id, evaluation_time);
CREATE INDEX outcome_source_snapshot_member_revision_idx ON outcome_source_snapshot_memberships(source_record_revision_id);
CREATE INDEX adaptation_ledger_snapshot_idx ON adaptation_completed_exposure_ledgers(source_snapshot_revision_id);
CREATE INDEX adaptation_ledger_event_idx ON adaptation_completed_exposure_entries(athlete_id, source_exposure_event_id);
CREATE INDEX adaptation_state_target_idx ON adaptation_longitudinal_state_revisions(athlete_id, target_id, evaluated_at);
CREATE INDEX adaptation_decision_target_idx ON adaptation_longitudinal_decision_revisions(athlete_id, target_id, evaluated_at);
CREATE INDEX adaptation_directive_target_idx ON adaptation_action_directives(athlete_id, target_id, created_at);
CREATE INDEX adaptation_application_directive_idx ON adaptation_application_requests(directive_revision_id);
CREATE INDEX outcome_source_audit_entity_idx ON outcome_source_audit_events(entity_type, entity_id, operation_time);
CREATE INDEX outcome_source_audit_athlete_idx ON outcome_source_audit_events(athlete_id, operation_time);

CREATE FUNCTION reject_outcome_source_append_only_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'OUTCOME_SOURCE_APPEND_ONLY_MUTATION_REJECTED:%', TG_TABLE_NAME
    USING ERRCODE = '55000';
END;
$$;

CREATE FUNCTION audit_outcome_source_active_pointer_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  before_active_revision_id TEXT;
  pointer_changed BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    before_active_revision_id := NULL;
    pointer_changed := TRUE;
  ELSE
    before_active_revision_id := OLD.active_revision_id;
    pointer_changed := OLD.active_revision_id IS DISTINCT FROM NEW.active_revision_id OR
      OLD.authorization_revision_id IS DISTINCT FROM NEW.authorization_revision_id;
  END IF;
  IF pointer_changed THEN
    INSERT INTO outcome_source_audit_events (
      audit_event_id, athlete_id, principal_id, operation, entity_type, entity_id,
      before_reference, after_reference, reason_code, operation_time, result_state, provenance
    ) VALUES (
      'active-pointer:' || md5(NEW.source_record_id || ':' || NEW.pointer_version::text || ':' || txid_current()::text),
      NEW.athlete_id, NEW.changed_by_principal_id, 'active_revision_changed', 'active_revision_reference',
      NEW.source_record_id, before_active_revision_id, NEW.active_revision_id, NEW.change_reason,
      NEW.changed_at, 'succeeded', '["database-trigger:active-pointer-audit"]'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER outcome_source_active_pointer_audit
AFTER INSERT OR UPDATE ON outcome_source_active_revisions
FOR EACH ROW EXECUTE FUNCTION audit_outcome_source_active_pointer_change();

DO $$
DECLARE
  append_only_table TEXT;
BEGIN
  FOREACH append_only_table IN ARRAY ARRAY[
    'outcome_source_raw_envelopes', 'outcome_source_records',
    'outcome_source_authorization_revisions', 'outcome_source_record_revisions',
    'outcome_source_idempotency', 'outcome_source_performance_blocks',
    'outcome_source_response_observations', 'outcome_source_adherence_observations',
    'outcome_source_recovery_observations', 'outcome_source_safety_restrictions',
    'outcome_source_equipment_environment_snapshots', 'outcome_source_external_load_observations',
    'outcome_source_snapshots', 'outcome_source_snapshot_memberships',
    'adaptation_completed_exposure_ledgers', 'adaptation_completed_exposure_entries',
    'adaptation_longitudinal_state_revisions', 'adaptation_longitudinal_decision_revisions',
    'adaptation_action_directives', 'adaptation_application_requests',
    'adaptation_application_attempts', 'outcome_source_audit_events'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION reject_outcome_source_append_only_mutation()',
      append_only_table || '_append_only', append_only_table
    );
  END LOOP;
END;
$$;
