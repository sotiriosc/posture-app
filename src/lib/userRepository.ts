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

export type UserStoreDriver = "file" | "db";

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

export const getUserRepository = (): UserRepository => {
  const driver = (process.env.USER_STORE_DRIVER?.trim().toLowerCase() ??
    "file") as UserStoreDriver;
  if (driver === "db") return dbRepository;
  return fileRepository;
};
