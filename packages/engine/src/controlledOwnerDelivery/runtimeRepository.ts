import { Pool, type PoolClient } from "pg";
import { createOwnerDeliveryPostgresRepository } from "./postgresDeliveryRepository";
import { createOwnerEnrollmentProfilePostgresRepository } from "./postgresEnrollmentProfileRepository";

let pool: Pool | null = null;

function databasePool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL_REQUIRED_FOR_CONTROLLED_OWNER_DELIVERY");
  pool = new Pool({ connectionString });
  return pool;
}

export async function withControlledOwnerRepositories<T>(callback: (repositories: {
  readonly queryable: PoolClient;
  readonly enrollmentProfiles: ReturnType<typeof createOwnerEnrollmentProfilePostgresRepository>;
  readonly delivery: ReturnType<typeof createOwnerDeliveryPostgresRepository>;
}) => Promise<T>): Promise<T> {
  const client = await databasePool().connect();
  try {
    return await callback({ queryable: client,
      enrollmentProfiles: createOwnerEnrollmentProfilePostgresRepository({ queryable: client }),
      delivery: createOwnerDeliveryPostgresRepository({ queryable: client }) });
  } finally {
    client.release();
  }
}
