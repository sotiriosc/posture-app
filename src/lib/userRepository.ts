import type { SubscriptionPlan } from "@/lib/authTypes";
import {
  createUser,
  ensureBootstrapUser,
  findUserById,
  findUserByStripeCustomerId,
  findUserByEmail,
  listUsers,
  type StoredUser,
  updateUserBilling,
  updateUserPlan,
  verifyUserPassword,
} from "@/lib/userStore";
import {
  dbCreateUser,
  dbEnsureBootstrapUser,
  dbFindUserById,
  dbFindUserByStripeCustomerId,
  dbFindUserByEmail,
  dbListUsers,
  dbMarkStripeWebhookEvent,
  dbUpdateUserBilling,
  dbUpdateUserPlan,
  dbVerifyUserPassword,
} from "@/lib/userStoreDb";
import {
  memoryCreateUser,
  memoryEnsureBootstrapUser,
  memoryFindUserByEmail,
  memoryFindUserById,
  memoryFindUserByStripeCustomerId,
  memoryListUsers,
  memoryMarkStripeWebhookEvent,
  memoryUpdateUserBilling,
  memoryUpdateUserPlan,
  memoryVerifyUserPassword,
} from "@/lib/userStoreMemory";
import { hasDatabaseUrl, shouldUseLocalDbFallback, warnOnce } from "@/lib/runtimeEnv";

export type UserStoreDriver = "file" | "memory" | "db";

export type UserRepository = {
  driver: UserStoreDriver;
  listUsers: () => Promise<StoredUser[]>;
  findUserByEmail: (email: string) => Promise<StoredUser | null>;
  findUserById: (userId: string) => Promise<StoredUser | null>;
  findUserByStripeCustomerId: (
    stripeCustomerId: string
  ) => Promise<StoredUser | null>;
  createUser: (params: {
    email: string;
    password: string;
    name?: string | null;
    emailOptIn?: boolean;
    onboardingSource?: string | null;
    plan?: SubscriptionPlan;
  }) => Promise<StoredUser>;
  updateUserPlan: (
    userId: string,
    plan: SubscriptionPlan
  ) => Promise<StoredUser | null>;
  updateUserBilling: (
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
  ) => Promise<StoredUser | null>;
  markStripeWebhookEvent: (
    eventId: string,
    eventType: string,
    payload: string
  ) => Promise<boolean>;
  verifyUserPassword: (user: StoredUser, password: string) => boolean;
  ensureBootstrapUser: () => Promise<StoredUser | null>;
};

const fileRepository: UserRepository = {
  driver: "file",
  listUsers,
  findUserByEmail,
  findUserById,
  findUserByStripeCustomerId,
  createUser,
  updateUserPlan,
  updateUserBilling,
  markStripeWebhookEvent: async () => true,
  verifyUserPassword,
  ensureBootstrapUser,
};

const memoryRepository: UserRepository = {
  driver: "memory",
  listUsers: memoryListUsers,
  findUserByEmail: memoryFindUserByEmail,
  findUserById: memoryFindUserById,
  findUserByStripeCustomerId: memoryFindUserByStripeCustomerId,
  createUser: memoryCreateUser,
  updateUserPlan: memoryUpdateUserPlan,
  updateUserBilling: memoryUpdateUserBilling,
  markStripeWebhookEvent: memoryMarkStripeWebhookEvent,
  verifyUserPassword: memoryVerifyUserPassword,
  ensureBootstrapUser: memoryEnsureBootstrapUser,
};

const dbRepository: UserRepository = {
  driver: "db",
  listUsers: dbListUsers,
  findUserByEmail: dbFindUserByEmail,
  findUserById: dbFindUserById,
  findUserByStripeCustomerId: dbFindUserByStripeCustomerId,
  createUser: dbCreateUser,
  updateUserPlan: dbUpdateUserPlan,
  updateUserBilling: dbUpdateUserBilling,
  markStripeWebhookEvent: dbMarkStripeWebhookEvent,
  verifyUserPassword: dbVerifyUserPassword,
  ensureBootstrapUser: dbEnsureBootstrapUser,
};

export const getConfiguredUserStoreDriver = (): UserStoreDriver => {
  const raw = process.env.USER_STORE_DRIVER?.trim().toLowerCase();
  if (raw === "file" || raw === "memory" || raw === "db") return raw;
  if (raw) {
    warnOnce(
      "user-store-invalid-driver",
      `[auth] Unknown USER_STORE_DRIVER="${raw}"; using file user store.`
    );
  }
  return "file";
};

export const getUserRepository = (): UserRepository => {
  const driver = getConfiguredUserStoreDriver();
  if (driver === "memory") return memoryRepository;
  if (driver === "db") {
    if (!hasDatabaseUrl() && shouldUseLocalDbFallback()) {
      warnOnce(
        "user-store-local-db-fallback",
        "[auth] USER_STORE_DRIVER=db but DATABASE_URL is empty in local dev; using memory user store."
      );
      return memoryRepository;
    }
    return dbRepository;
  }
  return fileRepository;
};
