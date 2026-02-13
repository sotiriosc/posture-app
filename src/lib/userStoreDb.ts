import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { Pool } from "pg";
import type { SubscriptionPlan } from "@/lib/authTypes";
import type { StoredUser } from "@/lib/userStore";

const nowIso = () => new Date().toISOString();
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const deriveHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

let pool: Pool | null = null;
let initialized = false;

const getPool = () => {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for USER_STORE_DRIVER=db.");
  }
  pool = new Pool({ connectionString });
  return pool;
};

const ensureDb = async () => {
  if (initialized) return;
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
        email_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
        email_opt_in_at TIMESTAMPTZ NULL,
        onboarding_source TEXT NULL,
        stripe_customer_id TEXT NULL,
        stripe_subscription_id TEXT NULL,
        stripe_price_id TEXT NULL,
        stripe_subscription_status TEXT NULL,
        stripe_current_period_end TIMESTAMPTZ NULL,
        stripe_cancel_at_period_end BOOLEAN NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS name TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS email_opt_in_at TIMESTAMPTZ NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS onboarding_source TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_price_id TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ NULL;
    `);
    await client.query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS stripe_cancel_at_period_end BOOLEAN NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS stripe_webhook_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        payload JSONB NULL
      );
    `);
    initialized = true;
  } finally {
    client.release();
  }
};

const rowToUser = (row: {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  password_salt: string;
  plan: SubscriptionPlan;
  email_opt_in: boolean | null;
  email_opt_in_at: string | null;
  onboarding_source: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_subscription_status: string | null;
  stripe_current_period_end: string | null;
  stripe_cancel_at_period_end: boolean | null;
  created_at: string;
  updated_at: string;
}): StoredUser => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  passwordSalt: row.password_salt,
  plan: row.plan,
  emailOptIn: Boolean(row.email_opt_in),
  emailOptInAt: row.email_opt_in_at ? new Date(row.email_opt_in_at).toISOString() : null,
  onboardingSource: row.onboarding_source ?? null,
  stripeCustomerId: row.stripe_customer_id,
  stripeSubscriptionId: row.stripe_subscription_id,
  stripePriceId: row.stripe_price_id,
  stripeSubscriptionStatus: row.stripe_subscription_status,
  stripeCurrentPeriodEnd: row.stripe_current_period_end
    ? new Date(row.stripe_current_period_end).toISOString()
    : null,
  stripeCancelAtPeriodEnd: row.stripe_cancel_at_period_end,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

export const dbListUsers = async () => {
  await ensureDb();
  const result = await getPool().query(
    `SELECT id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at
     FROM app_users
     ORDER BY created_at ASC`
  );
  return result.rows.map((row) => rowToUser(row));
};

export const dbFindUserByEmail = async (email: string) => {
  await ensureDb();
  const normalized = normalizeEmail(email);
  const result = await getPool().query(
    `SELECT id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at
     FROM app_users
     WHERE email = $1
     LIMIT 1`,
    [normalized]
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
};

export const dbCreateUser = async (params: {
  email: string;
  password: string;
  name?: string | null;
  emailOptIn?: boolean;
  onboardingSource?: string | null;
  plan?: SubscriptionPlan;
}) => {
  await ensureDb();
  const normalized = normalizeEmail(params.email);
  const existing = await dbFindUserByEmail(normalized);
  if (existing) {
    throw new Error("Email already exists.");
  }
  const salt = randomBytes(16).toString("hex");
  const passwordHash = deriveHash(params.password, salt);
  const createdAt = nowIso();
  const id = randomUUID();
  const plan = params.plan === "pro" ? "pro" : "free";
  const name = params.name?.trim() ? params.name.trim() : null;
  const emailOptIn = Boolean(params.emailOptIn);
  const emailOptInAt = emailOptIn ? createdAt : null;
  const onboardingSource = params.onboardingSource?.trim()
    ? params.onboardingSource.trim()
    : "web_signup";

  const result = await getPool().query(
    `INSERT INTO app_users (id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, NULL, NULL, NULL, NULL, $10, $10)
     RETURNING id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at`,
    [id, normalized, name, passwordHash, salt, plan, emailOptIn, emailOptInAt, onboardingSource, createdAt]
  );
  return rowToUser(result.rows[0]);
};

export const dbUpdateUserPlan = async (
  userId: string,
  plan: SubscriptionPlan
) => {
  await ensureDb();
  const nextPlan = plan === "pro" ? "pro" : "free";
  const updatedAt = nowIso();
  const result = await getPool().query(
    `UPDATE app_users
     SET plan = $2, updated_at = $3
     WHERE id = $1
     RETURNING id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at`,
    [userId, nextPlan, updatedAt]
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
};

export const dbFindUserById = async (userId: string) => {
  await ensureDb();
  const result = await getPool().query(
    `SELECT id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at
     FROM app_users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
};

export const dbUpdateUserBilling = async (
  userId: string,
  patch: {
    plan?: SubscriptionPlan;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeSubscriptionStatus?: string | null;
    stripeCurrentPeriodEnd?: string | null;
    stripeCancelAtPeriodEnd?: boolean | null;
  }
) => {
  await ensureDb();
  const existing = await dbFindUserById(userId);
  if (!existing) return null;
  const nextPlan = patch.plan ? (patch.plan === "pro" ? "pro" : "free") : existing.plan;
  const nextCustomerId =
    patch.stripeCustomerId !== undefined
      ? patch.stripeCustomerId
      : existing.stripeCustomerId ?? null;
  const nextSubscriptionId =
    patch.stripeSubscriptionId !== undefined
      ? patch.stripeSubscriptionId
      : existing.stripeSubscriptionId ?? null;
  const nextPriceId =
    patch.stripePriceId !== undefined ? patch.stripePriceId : existing.stripePriceId ?? null;
  const nextSubscriptionStatus =
    patch.stripeSubscriptionStatus !== undefined
      ? patch.stripeSubscriptionStatus
      : existing.stripeSubscriptionStatus ?? null;
  const nextCurrentPeriodEnd =
    patch.stripeCurrentPeriodEnd !== undefined
      ? patch.stripeCurrentPeriodEnd
      : existing.stripeCurrentPeriodEnd ?? null;
  const nextCancelAtPeriodEnd =
    patch.stripeCancelAtPeriodEnd !== undefined
      ? patch.stripeCancelAtPeriodEnd
      : existing.stripeCancelAtPeriodEnd ?? null;
  const updatedAt = nowIso();
  const result = await getPool().query(
    `UPDATE app_users
     SET plan = $2,
         stripe_customer_id = $3,
         stripe_subscription_id = $4,
         stripe_price_id = $5,
         stripe_subscription_status = $6,
         stripe_current_period_end = $7,
         stripe_cancel_at_period_end = $8,
         updated_at = $9
     WHERE id = $1
     RETURNING id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at`,
    [
      userId,
      nextPlan,
      nextCustomerId,
      nextSubscriptionId,
      nextPriceId,
      nextSubscriptionStatus,
      nextCurrentPeriodEnd,
      nextCancelAtPeriodEnd,
      updatedAt,
    ]
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
};

export const dbFindUserByStripeCustomerId = async (stripeCustomerId: string) => {
  await ensureDb();
  const result = await getPool().query(
    `SELECT id, email, name, password_hash, password_salt, plan, email_opt_in, email_opt_in_at, onboarding_source, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, stripe_current_period_end, stripe_cancel_at_period_end, created_at, updated_at
     FROM app_users
     WHERE stripe_customer_id = $1
     LIMIT 1`,
    [stripeCustomerId]
  );
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
};

export const dbMarkStripeWebhookEvent = async (
  eventId: string,
  eventType: string,
  payload: string
) => {
  await ensureDb();
  const result = await getPool().query(
    `INSERT INTO stripe_webhook_events (id, event_type, payload)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [eventId, eventType, payload]
  );
  return (result.rowCount ?? 0) > 0;
};

export const dbVerifyUserPassword = (user: StoredUser, password: string) => {
  const derived = Buffer.from(deriveHash(password, user.passwordSalt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
};

export const dbEnsureBootstrapUser = async () => {
  const email = process.env.AUTH_USER_EMAIL?.trim();
  const password = process.env.AUTH_USER_PASSWORD?.trim();
  const plan = (process.env.AUTH_USER_PLAN?.trim().toLowerCase() ?? "free") as SubscriptionPlan;
  if (!email || !password) return null;
  const existing = await dbFindUserByEmail(email);
  if (existing) return existing;
  return dbCreateUser({ email, password, plan: plan === "pro" ? "pro" : "free" });
};
