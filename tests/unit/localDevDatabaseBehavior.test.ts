import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getConfiguredTrainingStoreDriver } from "@/lib/trainingStoreConfig";
import { getUserRepository } from "@/lib/userRepository";
import { resetMemoryUserStoreForTests } from "@/lib/userStoreMemory";

const originalEnv = { ...process.env };

const restoreEnv = () => {
  process.env = { ...originalEnv };
};

describe("local development database behavior", () => {
  beforeEach(() => {
    restoreEnv();
    resetMemoryUserStoreForTests();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    restoreEnv();
    resetMemoryUserStoreForTests();
    vi.restoreAllMocks();
    vi.doUnmock("@/lib/userRepository");
    vi.doUnmock("@/lib/serverAuth");
    vi.doUnmock("@/lib/trainingStoreDb");
    vi.resetModules();
  });

  test("USER_STORE_DRIVER=memory keeps auth users out of DATABASE_URL-backed storage", async () => {
    process.env.USER_STORE_DRIVER = "memory";
    process.env.DATABASE_URL = "postgres://example.invalid/prod";
    process.env.AUTH_USER_EMAIL = "Local@example.com";
    process.env.AUTH_USER_PASSWORD = "local-password";
    process.env.AUTH_USER_PLAN = "pro";

    const repo = getUserRepository();
    const bootstrapUser = await repo.ensureBootstrapUser();

    expect(repo.driver).toBe("memory");
    expect(bootstrapUser?.email).toBe("local@example.com");
    expect(bootstrapUser?.plan).toBe("pro");
    expect(await repo.listUsers()).toHaveLength(1);
  });

  test("local dev with memory user store disables training DB sync by default", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.USER_STORE_DRIVER = "memory";
    process.env.DATABASE_URL = "postgres://example.invalid/prod";
    delete process.env.TRAINING_STORE_DRIVER;

    expect(getConfiguredTrainingStoreDriver()).toBe("disabled");
  });

  test("preview and production keep training DB sync explicit", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.USER_STORE_DRIVER = "db";
    delete process.env.TRAINING_STORE_DRIVER;

    expect(getConfiguredTrainingStoreDriver()).toBe("db");
  });

  test("isAuthConfigured degrades instead of throwing for local DB failures", async () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.AUTH_SECRET = "local-secret";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    vi.resetModules();
    vi.doMock("@/lib/userRepository", () => ({
      getUserRepository: () => ({
        driver: "db",
        ensureBootstrapUser: vi.fn(async () => {
          throw new Error("Neon quota exceeded");
        }),
        listUsers: vi.fn(),
      }),
    }));

    const { isAuthConfigured } = await import("@/lib/serverAuth");

    await expect(isAuthConfigured()).resolves.toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("User store is unavailable in local dev"),
      expect.any(Error)
    );
  });

  test("training state route skips DB calls in local-safe mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.USER_STORE_DRIVER = "memory";
    process.env.DATABASE_URL = "postgres://example.invalid/prod";
    delete process.env.TRAINING_STORE_DRIVER;
    const getTrainingSnapshot = vi.fn();
    const patchTrainingSnapshot = vi.fn();

    vi.resetModules();
    vi.doUnmock("@/lib/userRepository");
    vi.doMock("@/lib/serverAuth", () => ({
      readServerSession: vi.fn(async () => ({
        id: "user-local",
        email: "local@example.com",
        plan: "free",
      })),
    }));
    vi.doMock("@/lib/trainingStoreDb", () => ({
      getTrainingSnapshot,
      patchTrainingSnapshot,
    }));

    const { GET, POST } = await import("@/app/api/training/state/route");

    const getResponse = await GET();
    await expect(getResponse.json()).resolves.toMatchObject({
      ok: true,
      authenticated: true,
      snapshot: null,
      sync: "disabled",
    });
    expect(getTrainingSnapshot).not.toHaveBeenCalled();

    const postResponse = await POST(
      new Request("http://localhost/api/training/state", {
        method: "POST",
        body: JSON.stringify({
          sessions: [
            {
              id: "session-feedback-local-safe",
              userId: null,
              startedAt: "2026-02-15T00:00:00.000Z",
              completedAt: "2026-02-15T00:30:00.000Z",
              createdAt: "2026-02-15T00:00:00.000Z",
              updatedAt: "2026-02-15T00:31:00.000Z",
              routineId: "program-1",
              durationSec: 1800,
              notes: "dayIndex:0",
              feedback: {
                completed: "yes",
                difficultyRPE: 7,
                painBefore: 2,
                painAfter: 3,
                energy: 4,
                techniqueConfidence: 4,
              },
              source: "local",
              deletedAt: null,
            },
          ],
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    await expect(postResponse.json()).resolves.toMatchObject({
      ok: true,
      sync: "disabled",
    });
    expect(patchTrainingSnapshot).not.toHaveBeenCalled();
  });
});
