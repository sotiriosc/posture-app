import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import type { SubscriptionPlan } from "@/lib/authTypes";
import type { StoredUser } from "@/lib/userStore";

type MemoryStore = {
  users: StoredUser[];
  stripeWebhookEvents: Set<string>;
};

const store: MemoryStore = {
  users: [],
  stripeWebhookEvents: new Set<string>(),
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const nowIso = () => new Date().toISOString();
const deriveHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

export const resetMemoryUserStoreForTests = () => {
  store.users = [];
  store.stripeWebhookEvents.clear();
};

export const memoryListUsers = async () => store.users;

export const memoryFindUserByEmail = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  return store.users.find((user) => user.email === normalizedEmail) ?? null;
};

export const memoryFindUserById = async (userId: string) =>
  store.users.find((user) => user.id === userId) ?? null;

export const memoryFindUserByStripeCustomerId = async (stripeCustomerId: string) =>
  store.users.find((user) => (user.stripeCustomerId ?? null) === stripeCustomerId) ??
  null;

export const memoryCreateUser = async (params: {
  email: string;
  password: string;
  name?: string | null;
  emailOptIn?: boolean;
  onboardingSource?: string | null;
  plan?: SubscriptionPlan;
}) => {
  const normalizedEmail = normalizeEmail(params.email);
  if (store.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Email already exists.");
  }

  const salt = randomBytes(16).toString("hex");
  const createdAt = nowIso();
  const user: StoredUser = {
    id: randomUUID(),
    email: normalizedEmail,
    name: params.name?.trim() ? params.name.trim() : null,
    passwordHash: deriveHash(params.password, salt),
    passwordSalt: salt,
    plan: params.plan === "pro" ? "pro" : "free",
    emailOptIn: Boolean(params.emailOptIn),
    emailOptInAt: params.emailOptIn ? createdAt : null,
    onboardingSource: params.onboardingSource?.trim()
      ? params.onboardingSource.trim()
      : "web_signup",
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
  return user;
};

export const memoryVerifyUserPassword = (user: StoredUser, password: string) => {
  const derived = Buffer.from(deriveHash(password, user.passwordSalt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
};

export const memoryUpdateUserPlan = async (
  userId: string,
  plan: SubscriptionPlan
) => {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;
  user.plan = plan === "pro" ? "pro" : "free";
  user.updatedAt = nowIso();
  return user;
};

export const memoryUpdateUserBilling = async (
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
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;
  if (patch.plan) user.plan = patch.plan === "pro" ? "pro" : "free";
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
  return user;
};

export const memoryMarkStripeWebhookEvent = async (
  eventId: string,
  _eventType: string,
  _payload: string
) => {
  if (store.stripeWebhookEvents.has(eventId)) return false;
  store.stripeWebhookEvents.add(eventId);
  return true;
};

export const memoryEnsureBootstrapUser = async () => {
  const email = process.env.AUTH_USER_EMAIL?.trim();
  const password = process.env.AUTH_USER_PASSWORD?.trim();
  const plan = (process.env.AUTH_USER_PLAN?.trim().toLowerCase() ??
    "free") as SubscriptionPlan;
  if (!email || !password) return null;
  const existing = await memoryFindUserByEmail(email);
  if (existing) return existing;
  return memoryCreateUser({
    email,
    password,
    plan: plan === "pro" ? "pro" : "free",
  });
};
