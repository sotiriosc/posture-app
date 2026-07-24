import { randomBytes, scryptSync } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { expect, type Page } from "@playwright/test";

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
  await writeFile(userDbPath, JSON.stringify(db, null, 2), "utf8");
};

export const e2eEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@e2e.local`;

export const upsertE2eUser = async (params: {
  email: string;
  password: string;
  plan?: SubscriptionPlan;
  stripeCustomerId?: string | null;
}) => {
  const db = await readUserDb();
  const now = new Date().toISOString();
  const normalizedEmail = params.email.trim().toLowerCase();
  const existing = db.users.find((user) => user.email === normalizedEmail);
  const passwordSalt = existing?.passwordSalt ?? randomBytes(16).toString("hex");
  const patch: StoredE2eUser = {
    id: existing?.id ?? `e2e-${randomBytes(8).toString("hex")}`,
    email: normalizedEmail,
    name: existing?.name ?? "Playwright Athlete",
    passwordHash: derivePasswordHash(params.password, passwordSalt),
    passwordSalt,
    plan: params.plan ?? "free",
    emailOptIn: existing?.emailOptIn ?? false,
    emailOptInAt: existing?.emailOptInAt ?? null,
    onboardingSource: existing?.onboardingSource ?? "playwright",
    stripeCustomerId: params.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
    stripeSubscriptionId: existing?.stripeSubscriptionId ?? "sub_playwright",
    stripePriceId: existing?.stripePriceId ?? "price_playwright",
    stripeSubscriptionStatus: existing?.stripeSubscriptionStatus ?? "active",
    stripeCurrentPeriodEnd:
      existing?.stripeCurrentPeriodEnd ?? "2035-01-01T00:00:00.000Z",
    stripeCancelAtPeriodEnd: existing?.stripeCancelAtPeriodEnd ?? false,
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
  await page.goto("/questionnaire");
  await expect(page.getByTestId("questionnaire-form")).toBeVisible();
};

export const completeQuestionnaire = async (
  page: Page,
  options: { daysPerWeek?: 3 | 4 | 5 } = {}
) => {
  await prepareCleanQuestionnaire(page);
  await page.getByTestId("equipment-none").check();
  await page.getByTestId(`days-${options.daysPerWeek ?? 3}`).click();
  await page.getByTestId("generate-routine").click();
  // Program generation runs client-side before the router push to /results,
  // and on a slower/first-compile CI runner this can comfortably exceed
  // Playwright's 5s default expect timeout even though nothing is actually
  // wrong -- matches the 20s tolerance already used for the dashboard text
  // assertion right below.
  await expect(page).toHaveURL(/\/results/, { timeout: 20_000 });
  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible({
    timeout: 20_000,
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
