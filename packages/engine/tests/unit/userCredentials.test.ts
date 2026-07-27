import { afterEach, describe, expect, test } from "vitest";
import {
  memoryCreateUser,
  memoryFindUserByEmail,
  memoryUpdateUserCredentials,
  resetMemoryUserStoreForTests,
} from "@/lib/userStoreMemory";

describe("updateUserCredentials", () => {
  afterEach(() => {
    resetMemoryUserStoreForTests();
  });

  test("updates email while preserving stripe ids", async () => {
    const user = await memoryCreateUser({
      email: "before@example.com",
      password: "password123",
    });
    user.stripeCustomerId = "cus_keep_me";
    user.stripeSubscriptionId = "sub_keep_me";

    const updated = await memoryUpdateUserCredentials(user.id, {
      email: "after@example.com",
    });

    expect(updated?.email).toBe("after@example.com");
    expect(updated?.stripeCustomerId).toBe("cus_keep_me");
    expect(updated?.stripeSubscriptionId).toBe("sub_keep_me");
    expect(await memoryFindUserByEmail("after@example.com")).not.toBeNull();
    expect(await memoryFindUserByEmail("before@example.com")).toBeNull();
  });

  test("updates password hash without touching billing fields", async () => {
    const user = await memoryCreateUser({
      email: "user@example.com",
      password: "old-password",
    });
    user.stripeCustomerId = "cus_abc";
    const previousHash = user.passwordHash;
    const previousSalt = user.passwordSalt;

    const updated = await memoryUpdateUserCredentials(user.id, {
      password: "new-password-xyz",
    });

    expect(updated?.stripeCustomerId).toBe("cus_abc");
    expect(updated?.passwordHash).not.toBe(previousHash);
    expect(updated?.passwordSalt).not.toBe(previousSalt);
  });

  test("rejects duplicate email", async () => {
    await memoryCreateUser({ email: "taken@example.com", password: "password123" });
    const user = await memoryCreateUser({
      email: "mine@example.com",
      password: "password123",
    });

    await expect(
      memoryUpdateUserCredentials(user.id, { email: "taken@example.com" })
    ).rejects.toThrow(/exists/i);
  });
});
