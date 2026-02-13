import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { SubscriptionPlan } from "@/lib/authTypes";

export type StoredUser = {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
  passwordSalt: string;
  plan: SubscriptionPlan;
  emailOptIn?: boolean;
  emailOptInAt?: string | null;
  onboardingSource?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeSubscriptionStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
  stripeCancelAtPeriodEnd?: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type UserDb = {
  users: StoredUser[];
};

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "users.json");

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const nowIso = () => new Date().toISOString();

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const deriveHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const ensureStore = async () => {
  await mkdir(DB_DIR, { recursive: true });
  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    const initial: UserDb = { users: [] };
    await writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
};

const readStore = async (): Promise<UserDb> => {
  await ensureStore();
  const raw = await readFile(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as UserDb;
    if (!parsed || !Array.isArray(parsed.users)) return { users: [] };
    return parsed;
  } catch {
    return { users: [] };
  }
};

const writeStore = async (store: UserDb) => {
  await ensureStore();
  await writeFile(DB_PATH, JSON.stringify(store, null, 2), "utf8");
};

export const listUsers = async () => {
  const store = await readStore();
  return store.users;
};

export const findUserByEmail = async (email: string) => {
  const normalized = normalizeEmail(email);
  const users = await listUsers();
  return users.find((user) => user.email === normalized) ?? null;
};

export const createUser = async (params: {
  email: string;
  password: string;
  name?: string | null;
  emailOptIn?: boolean;
  onboardingSource?: string | null;
  plan?: SubscriptionPlan;
}) => {
  const normalized = normalizeEmail(params.email);
  const store = await readStore();
  if (store.users.some((user) => user.email === normalized)) {
    throw new Error("Email already exists.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = deriveHash(params.password, salt);
  const createdAt = nowIso();
  const user: StoredUser = {
    id: uuid(),
    email: normalized,
    name: params.name?.trim() ? params.name.trim() : null,
    passwordHash,
    passwordSalt: salt,
    plan: params.plan === "pro" ? "pro" : "free",
    emailOptIn: Boolean(params.emailOptIn),
    emailOptInAt: params.emailOptIn ? createdAt : null,
    onboardingSource: params.onboardingSource?.trim() ? params.onboardingSource.trim() : "web_signup",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeSubscriptionStatus: null,
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: null,
    createdAt,
    updatedAt: createdAt,
  };
  store.users.push(user);
  await writeStore(store);
  return user;
};

export const verifyUserPassword = (user: StoredUser, password: string) => {
  const derived = Buffer.from(deriveHash(password, user.passwordSalt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
};

export const updateUserPlan = async (userId: string, plan: SubscriptionPlan) => {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;
  user.plan = plan;
  user.updatedAt = nowIso();
  await writeStore(store);
  return user;
};

export const findUserById = async (userId: string) => {
  const users = await listUsers();
  return users.find((user) => user.id === userId) ?? null;
};

export const findUserByStripeCustomerId = async (stripeCustomerId: string) => {
  const users = await listUsers();
  return (
    users.find((user) => (user.stripeCustomerId ?? null) === stripeCustomerId) ??
    null
  );
};

export const updateUserBilling = async (
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
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;
  if (patch.plan) {
    user.plan = patch.plan === "pro" ? "pro" : "free";
  }
  if (patch.stripeCustomerId !== undefined) {
    user.stripeCustomerId = patch.stripeCustomerId;
  }
  if (patch.stripeSubscriptionId !== undefined) {
    user.stripeSubscriptionId = patch.stripeSubscriptionId;
  }
  if (patch.stripePriceId !== undefined) {
    user.stripePriceId = patch.stripePriceId;
  }
  if (patch.stripeSubscriptionStatus !== undefined) {
    user.stripeSubscriptionStatus = patch.stripeSubscriptionStatus;
  }
  if (patch.stripeCurrentPeriodEnd !== undefined) {
    user.stripeCurrentPeriodEnd = patch.stripeCurrentPeriodEnd;
  }
  if (patch.stripeCancelAtPeriodEnd !== undefined) {
    user.stripeCancelAtPeriodEnd = patch.stripeCancelAtPeriodEnd;
  }
  user.updatedAt = nowIso();
  await writeStore(store);
  return user;
};

export const ensureBootstrapUser = async () => {
  const email = process.env.AUTH_USER_EMAIL?.trim();
  const password = process.env.AUTH_USER_PASSWORD?.trim();
  const plan = (process.env.AUTH_USER_PLAN?.trim().toLowerCase() ?? "free") as SubscriptionPlan;
  if (!email || !password) return null;
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  return createUser({ email, password, plan: plan === "pro" ? "pro" : "free" });
};
