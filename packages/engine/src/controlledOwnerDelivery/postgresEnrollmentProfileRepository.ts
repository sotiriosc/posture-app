import type { OwnerEnrollmentRevision, OwnerGetStrongerProfileRevision } from "@praxis/training-engine-v2";
import { validateOwnerEnrollmentRevision, validateOwnerProfileRevision } from "@praxis/training-engine-v2";
import type { OwnerEnrollmentProfileRepository, OwnerPostgresQueryable } from "./contracts";

type EnrollmentRow = Record<string, unknown> & {
  semantic_fingerprint: string;
  payload: OwnerEnrollmentRevision;
};
type ProfileRow = Record<string, unknown> & {
  semantic_fingerprint: string;
  payload: OwnerGetStrongerProfileRevision;
};

export function createOwnerEnrollmentProfilePostgresRepository(input: {
  readonly queryable: OwnerPostgresQueryable;
}): OwnerEnrollmentProfileRepository {
  const db = input.queryable;
  const repository: OwnerEnrollmentProfileRepository = {
    appendEnrollment: async (revision) => {
      if (validateOwnerEnrollmentRevision(revision).length) throw new Error("OWNER_ENROLLMENT_INVALID");
      if (revision.basedOnRevisionId) {
        const basedOn = await db.query<EnrollmentRow>(
          `SELECT semantic_fingerprint, payload FROM owner_v2_enrollments
            WHERE user_id = $1 AND enrollment_id = $2 AND revision_id = $3`,
          [revision.userId, revision.enrollmentId, revision.basedOnRevisionId],
        );
        if (!basedOn.rows[0]) return "conflict";
      }
      const inserted = await db.query(
        `INSERT INTO owner_v2_enrollments
          (user_id, enrollment_id, revision_id, based_on_revision_id, contract_id, contract_version,
           semantic_fingerprint, state, permission, payload, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
         ON CONFLICT (user_id, enrollment_id, revision_id) DO NOTHING`,
        [revision.userId, revision.enrollmentId, revision.revisionId, revision.basedOnRevisionId,
          revision.contract.contractId, revision.contract.contractVersion, revision.semanticFingerprint,
          revision.state, revision.permission, JSON.stringify(revision), revision.createdAt],
      );
      if ((inserted.rowCount ?? 0) > 0) return "appended";
      const prior = await db.query<EnrollmentRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_enrollments
          WHERE user_id = $1 AND enrollment_id = $2 AND revision_id = $3`,
        [revision.userId, revision.enrollmentId, revision.revisionId],
      );
      return prior.rows[0]?.semantic_fingerprint === revision.semanticFingerprint ? "exact_retry" : "conflict";
    },
    readEnrollmentExact: async (userId, enrollmentId, revisionId) => {
      const result = await db.query<EnrollmentRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_enrollments
          WHERE user_id = $1 AND enrollment_id = $2 AND revision_id = $3`,
        [userId, enrollmentId, revisionId],
      );
      return result.rows[0]?.payload ?? null;
    },
    readCurrentEnrollment: async (userId) => {
      const result = await db.query<EnrollmentRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_enrollments
          WHERE user_id = $1 ORDER BY created_at DESC, revision_id DESC LIMIT 1`, [userId]);
      return result.rows[0]?.payload ?? null;
    },
    appendProfile: async (revision) => {
      if (validateOwnerProfileRevision(revision).length) throw new Error("OWNER_PROFILE_INVALID");
      if (revision.basedOnRevisionId) {
        const basedOn = await db.query<ProfileRow>(
          `SELECT semantic_fingerprint, payload FROM owner_v2_profiles
            WHERE user_id = $1 AND profile_id = $2 AND revision_id = $3`,
          [revision.userId, revision.profileId, revision.basedOnRevisionId],
        );
        if (!basedOn.rows[0]) return "conflict";
      }
      const inserted = await db.query(
        `INSERT INTO owner_v2_profiles
          (user_id, profile_id, revision_id, based_on_revision_id, contract_id, contract_version,
           semantic_fingerprint, review_state, payload, created_at, evaluation_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
         ON CONFLICT (user_id, profile_id, revision_id) DO NOTHING`,
        [revision.userId, revision.profileId, revision.revisionId, revision.basedOnRevisionId,
          revision.contract.contractId, revision.contract.contractVersion, revision.semanticFingerprint,
          revision.reviewState, JSON.stringify(revision), revision.createdAt, revision.evaluationTime],
      );
      if ((inserted.rowCount ?? 0) > 0) return "appended";
      const prior = await db.query<ProfileRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_profiles
          WHERE user_id = $1 AND profile_id = $2 AND revision_id = $3`,
        [revision.userId, revision.profileId, revision.revisionId],
      );
      return prior.rows[0]?.semantic_fingerprint === revision.semanticFingerprint ? "exact_retry" : "conflict";
    },
    readProfileExact: async (userId, profileId, revisionId) => {
      const result = await db.query<ProfileRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_profiles
          WHERE user_id = $1 AND profile_id = $2 AND revision_id = $3`,
        [userId, profileId, revisionId],
      );
      return result.rows[0]?.payload ?? null;
    },
    readCurrentProfile: async (userId) => {
      const result = await db.query<ProfileRow>(
        `SELECT semantic_fingerprint, payload FROM owner_v2_profiles
          WHERE user_id = $1 AND review_state = 'confirmed'
          ORDER BY created_at DESC, revision_id DESC LIMIT 1`, [userId]);
      return result.rows[0]?.payload ?? null;
    },
  };
  return Object.freeze(repository);
}
