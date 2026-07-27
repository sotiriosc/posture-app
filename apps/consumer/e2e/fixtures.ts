import { randomBytes, scryptSync } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { expect, type APIResponse, type Page } from "@playwright/test";

type SubscriptionPlan = "free" | "pro";

type StoredE2eUser = {
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
  users: StoredE2eUser[];
};

type AuthSessionMockOptions = {
  enabled?: boolean;
  authenticated?: boolean;
  email?: string;
  plan?: SubscriptionPlan | (() => SubscriptionPlan);
};

type TrainingStateMockOptions = {
  authenticated?: boolean;
  snapshot?: unknown;
  failGet?: boolean | ((requestNumber: number) => boolean);
  failPost?: boolean | ((requestNumber: number) => boolean);
};

const userDbPath = path.join(process.cwd(), "data", "users.json");

const derivePasswordHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const readUserDb = async (): Promise<UserDb> => {
  try {
    const raw = await readFile(userDbPath, "utf8");
    const parsed = JSON.parse(raw) as UserDb;
    return Array.isArray(parsed.users) ? parsed : { users: [] };
  } catch {
    return { users: [] };
  }
};

const writeUserDb = async (db: UserDb) => {
  await mkdir(path.dirname(userDbPath), { recursive: true });
  const payload = JSON.stringify(db, null, 2);
  const tempPath = `${userDbPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, userDbPath);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const e2eEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@e2e.local`;

export const upsertE2eUser = async (params: {
  /** Force a stable id (e.g. admin allowlist e2e). */
  id?: string;
  email: string;
  password: string;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeSubscriptionStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
  stripeCancelAtPeriodEnd?: boolean | null;
}) => {
  const normalizedEmail = params.email.trim().toLowerCase();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const db = await readUserDb();
      const now = new Date().toISOString();
      const existing = db.users.find((user) => user.email === normalizedEmail);
      const passwordSalt = existing?.passwordSalt ?? randomBytes(16).toString("hex");
      const nextId = params.id ?? existing?.id ?? `e2e-${randomBytes(8).toString("hex")}`;
      // Keep ids unique when a test forces a stable allowlist id.
      if (params.id) {
        db.users = db.users.filter(
          (user) => user.id !== params.id || user.email === normalizedEmail
        );
      }
      const patch: StoredE2eUser = {
        id: nextId,
        email: normalizedEmail,
        name: existing?.name ?? "Playwright Athlete",
        passwordHash: derivePasswordHash(params.password, passwordSalt),
        passwordSalt,
        plan: params.plan ?? "free",
        emailOptIn: existing?.emailOptIn ?? false,
        emailOptInAt: existing?.emailOptInAt ?? null,
        onboardingSource: existing?.onboardingSource ?? "playwright",
        stripeCustomerId:
          params.stripeCustomerId !== undefined
            ? params.stripeCustomerId
            : existing?.stripeCustomerId ?? null,
        stripeSubscriptionId:
          params.stripeSubscriptionId !== undefined
            ? params.stripeSubscriptionId
            : existing?.stripeSubscriptionId ?? "sub_playwright",
        stripePriceId:
          params.stripePriceId !== undefined
            ? params.stripePriceId
            : existing?.stripePriceId ?? "price_playwright",
        stripeSubscriptionStatus:
          params.stripeSubscriptionStatus !== undefined
            ? params.stripeSubscriptionStatus
            : existing?.stripeSubscriptionStatus ?? "active",
        stripeCurrentPeriodEnd:
          params.stripeCurrentPeriodEnd !== undefined
            ? params.stripeCurrentPeriodEnd
            : existing?.stripeCurrentPeriodEnd ?? "2035-01-01T00:00:00.000Z",
        stripeCancelAtPeriodEnd:
          params.stripeCancelAtPeriodEnd !== undefined
            ? params.stripeCancelAtPeriodEnd
            : existing?.stripeCancelAtPeriodEnd ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      if (existing) {
        Object.assign(existing, patch);
      } else {
        db.users.push(patch);
      }

      await writeUserDb(db);
      return patch;
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(25 * (attempt + 1));
    }
  }
  throw new Error("Failed to upsert e2e user.");
};

export const loginE2eUser = async (
  page: Page,
  params: {
    id?: string;
    email: string;
    password: string;
    plan?: SubscriptionPlan;
  }
): Promise<APIResponse> => {
  await upsertE2eUser(params);
  const normalizedEmail = params.email.trim().toLowerCase();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const login = await page.request.post("/api/auth/login", {
      data: { email: normalizedEmail, password: params.password },
      headers: {
        // Playwright requests share one IP ("unknown"); isolate rate-limit buckets per test user.
        "x-forwarded-for": `playwright-e2e-${normalizedEmail}`,
      },
    });
    if (login.ok()) return login;

    const status = login.status();
    if (status === 429) {
      await sleep(500 * (attempt + 1));
      continue;
    }
    if (status === 401 && attempt < 5) {
      await upsertE2eUser(params);
      await sleep(50 * (attempt + 1));
      continue;
    }

    throw new Error(
      `E2E login failed (${status}): ${(await login.text()).slice(0, 240)}`
    );
  }

  throw new Error("E2E login failed after retries.");
};

export const resetBrowserState = async (page: Page) => {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();

    const knownDatabaseNames = [
      "bodycoach-logs",
      "bodycoach-drafts",
      "bodycoach-photos",
    ];
    const indexed = indexedDB as IDBFactory & {
      databases?: () => Promise<Array<{ name?: string | null }>>;
    };
    const discoveredNames =
      typeof indexed.databases === "function"
        ? (await indexed.databases())
            .map((database) => database.name)
            .filter((name): name is string => Boolean(name))
        : [];
    const names = [...new Set([...knownDatabaseNames, ...discoveredNames])];

    await Promise.all(
      names.map(
        (name) =>
          new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          })
      )
    );
  });
};

export const mockAuthSession = async (
  page: Page,
  options: AuthSessionMockOptions = {}
) => {
  const {
    enabled = true,
    authenticated = false,
    email = "playwright@example.com",
  } = options;

  await page.route("**/api/auth/session", async (route) => {
    const plan =
      typeof options.plan === "function" ? options.plan() : options.plan ?? "free";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        enabled,
        authenticated,
        user: authenticated ? { id: "e2e-user", email, plan } : null,
      }),
    });
  });
};

export const mockAuthUnavailable = async (page: Page) => {
  await page.route("**/api/auth/session", async (route) => {
    await route.abort("failed");
  });
};

export const mockTrainingState = async (
  page: Page,
  options: TrainingStateMockOptions = {}
) => {
  let getCount = 0;
  let postCount = 0;
  const authenticated = options.authenticated ?? false;
  const snapshot = options.snapshot ?? null;

  await page.route("**/api/training/state", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      getCount += 1;
      const shouldFail =
        typeof options.failGet === "function"
          ? options.failGet(getCount)
          : Boolean(options.failGet);
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            ok: false,
            authenticated: true,
            error: "Playwright sync load failure.",
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          authenticated,
          snapshot: authenticated ? snapshot : null,
        }),
      });
      return;
    }

    if (method === "POST") {
      postCount += 1;
      const shouldFail =
        typeof options.failPost === "function"
          ? options.failPost(postCount)
          : Boolean(options.failPost);
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            ok: false,
            authenticated: true,
            error: "Playwright sync patch failure.",
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, authenticated }),
      });
      return;
    }

    await route.continue();
  });

  return {
    getCount: () => getCount,
    postCount: () => postCount,
  };
};

export const prepareCleanQuestionnaire = async (page: Page) => {
  await page.goto("/");
  await resetBrowserState(page);
  // `resetBrowserState` clears localStorage, including `praxis_local_owner_id`.
  // If the browser already has a session cookie (smoke tests log in first),
  // restore the owner marker immediately so AccountIsolationGate's next
  // syncLocalOwner does not treat this as a brand-new account switch and
  // race questionnaire / program writes.
  await page.evaluate(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        user?: { id?: string };
      };
      const id = data.authenticated ? data.user?.id ?? null : null;
      if (id) {
        localStorage.setItem("praxis_local_owner_id", id);
      }
    } catch {
      // Best-effort; anonymous questionnaire flows still work.
    }
  });
  await page.goto("/questionnaire");
  await expect(page.getByTestId("questionnaire-form")).toBeVisible({
    timeout: 30_000,
  });
};

export const completeQuestionnaire = async (
  page: Page,
  options: { daysPerWeek?: 3 | 4 | 5 } = {}
) => {
  await prepareCleanQuestionnaire(page);
  await page.getByTestId("equipment-none").check();
  await page.getByTestId(`days-${options.daysPerWeek ?? 3}`).click();
  await page.getByTestId("generate-routine").click();

  // Stale profile edge case: confirm modal instead of immediate generate.
  const changeConfirm = page.getByTestId("questionnaire-change-confirm");
  try {
    await changeConfirm.waitFor({ state: "visible", timeout: 1_500 });
    await changeConfirm.click();
  } catch {
    // No modal — first-run path.
  }

  // Program generation is client-side; cold Turbopack compile on CI workers
  // routinely exceeds 20s when smoke specs run in parallel.
  await expect(page).toHaveURL(/\/results/, { timeout: 60_000 });
  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
};

export const waitForResultsDashboard = async (page: Page) => {
  await expect(page).toHaveURL(/\/results/, { timeout: 20_000 });
  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
};

export const getActiveProgramId = async (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem("app_state_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { activeProgramId?: string };
    return parsed.activeProgramId ?? null;
  });

export const getStoredDaysPerWeek = async (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem("posture_questionnaire");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { daysPerWeek?: number };
    return parsed.daysPerWeek ?? null;
  });

export const completeCurrentSession = async (page: Page) => {
  await page.getByTestId("start-selected-day").click();
  await expect(page).toHaveURL(/\/session/, { timeout: 20_000 });

  for (let i = 0; i < 20; i += 1) {
    const button = page.getByTestId("session-next");
    await expect(button).toBeEnabled();
    const label = (await button.textContent()) ?? "";
    await button.evaluate((element: HTMLElement) => element.click());
    if (label.toLowerCase().includes("finish")) {
      break;
    }
  }

  await expect(page.getByText("Session complete")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Back to results" }).click();
  await waitForResultsDashboard(page);
};

export const selectDashboardMode = async (page: Page, name: RegExp | string) => {
  await page.getByRole("button", { name }).first().click();
};
