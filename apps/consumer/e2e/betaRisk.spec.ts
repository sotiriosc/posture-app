import { expect, test } from "@playwright/test";
import {
  completeCurrentSession,
  completeQuestionnaire,
  e2eEmail,
  getActiveProgramId,
  getStoredDaysPerWeek,
  mockAuthSession,
  mockAuthUnavailable,
  mockTrainingState,
  prepareCleanQuestionnaire,
  selectDashboardMode,
  upsertE2eUser,
  waitForResultsDashboard,
} from "./fixtures";

test("auth login flow lands on the requested dashboard route", async ({ page }) => {
  const email = e2eEmail("login");
  const password = "playwright-password";
  await upsertE2eUser({ email, password, plan: "free" });
  await mockTrainingState(page, { authenticated: false });

  await page.goto(`/auth/login?next=${encodeURIComponent("/results")}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/results/);
  await expect(page.getByText("Welcome back, Playwright Athlete")).toBeVisible();
  await expect(
    page.getByText("We need your movement profile answers to build your Praxis plan.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Build profile" })).toBeVisible();
});

test("protected account surfaces stay hidden and billing APIs reject unauthenticated access", async ({
  page,
  request,
}) => {
  await mockAuthSession(page, { enabled: true, authenticated: false });

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();

  await expect(page.getByText("Navigation")).toBeVisible();
  const menu = page.getByRole("complementary");
  await expect(menu.getByRole("link", { name: "Log in" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Billing" })).toHaveCount(0);
  await expect(menu.getByRole("link", { name: "Settings" })).toHaveCount(0);

  const portalResponse = await request.post("/api/billing/portal-session");
  expect(portalResponse.status()).toBe(401);
});

test("free plan locks Day 2 and pro access unlocks the same program day", async ({
  page,
}) => {
  let plan: "free" | "pro" = "free";
  await mockAuthSession(page, {
    enabled: true,
    authenticated: true,
    email: "plan-e2e@example.com",
    plan: () => plan,
  });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 4 });

  const programId = await getActiveProgramId(page);
  expect(programId).toBeTruthy();

  await page.goto(`/program/${programId}/day/1`);
  await expect(page).toHaveURL(new RegExp(`/program/${programId}/day/0`));
  await expect(page.getByText(/Free access keeps Day 1 available/i)).toBeVisible();

  plan = "pro";
  await page.goto(`/program/${programId}/day/1`);
  await expect(page).toHaveURL(new RegExp(`/program/${programId}/day/1`));
  await expect(page.getByText("Day 2").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Start This Day" })).toBeVisible();
});

test("questionnaire changes regenerate and reconcile the active program", async ({
  page,
}) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  const originalProgramId = await getActiveProgramId(page);
  expect(originalProgramId).toBeTruthy();

  await page.goto("/questionnaire");
  await expect(page.getByTestId("questionnaire-form")).toBeVisible();
  await page.getByTestId("days-4").click();
  await page.getByTestId("generate-routine").click();
  await expect(page.getByTestId("questionnaire-change-confirm-modal")).toBeVisible();
  await page.getByTestId("questionnaire-change-confirm").click();

  await waitForResultsDashboard(page);
  const regeneratedProgramId = await getActiveProgramId(page);
  expect(regeneratedProgramId).toBeTruthy();
  expect(regeneratedProgramId).not.toBe(originalProgramId);
  await expect.poll(() => getStoredDaysPerWeek(page)).toBe(4);
});

test("reset current progress preserves completed history", async ({ page }) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await completeCurrentSession(page);

  await selectDashboardMode(page, /Billing \/ Account/i);
  await page.getByTestId("reset-current-progress-trigger").click();
  await expect(page.getByTestId("reset-current-progress-confirm")).toBeVisible();
  await page.getByTestId("reset-current-progress-confirm-button").click();

  await expect(
    page.getByText("Current progress reset. Your workout history is still saved.")
  ).toBeVisible();
  await expect(page.getByTestId("history-mode-panel")).toBeVisible();
  await expect(page.getByText(/1 result/i)).toBeVisible();
  await expect(page.getByText(/completed workouts/i).first()).toBeVisible();
});

test("session resume keeps the active session and current exercise continuity", async ({
  page,
}) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await page.getByTestId("start-selected-day").click();
  await expect(page).toHaveURL(/\/session/);
  const firstExerciseId = await page
    .getByTestId("current-exercise-id")
    .getAttribute("data-exercise-id");

  await page.getByTestId("session-next").click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Exit session" }).click();

  await waitForResultsDashboard(page);
  await page.getByRole("link", { name: /Continue Session/i }).click();
  await expect(page).toHaveURL(/\/session/);
  const resumedExerciseId = await page
    .getByTestId("current-exercise-id")
    .getAttribute("data-exercise-id");

  expect(resumedExerciseId).toBeTruthy();
  expect(resumedExerciseId).not.toBe(firstExerciseId);
});

test("local-first flow still reaches results when auth and sync are unavailable", async ({
  page,
}) => {
  await mockAuthUnavailable(page);
  await page.route("**/api/training/state", async (route) => {
    await route.abort("failed");
  });

  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible();
  await expect(page.getByTestId("start-selected-day")).toBeVisible();
});

test("sync fallback keeps local progress visible when a server patch fails", async ({
  page,
}) => {
  await mockAuthSession(page, {
    enabled: true,
    authenticated: true,
    email: "sync-e2e@example.com",
    plan: "free",
  });
  const sync = await mockTrainingState(page, {
    authenticated: true,
    failGet: (requestNumber) => requestNumber > 1,
    failPost: true,
  });

  await prepareCleanQuestionnaire(page);
  await expect.poll(sync.getCount).toBeGreaterThan(0);
  await page.getByTestId("days-4").click();
  await expect.poll(sync.postCount).toBeGreaterThan(0);
  await page.getByTestId("generate-routine").click();

  await waitForResultsDashboard(page);
  await expect(page.getByTestId("training-sync-status")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByTestId("training-sync-status")).toContainText(
    "Local progress is saved"
  );
});

test("billing status page refresh uses mocked portal flow without Stripe network", async ({
  page,
}) => {
  const email = e2eEmail("billing");
  const password = "playwright-password";
  await upsertE2eUser({
    email,
    password,
    plan: "pro",
    stripeCustomerId: `cus_${Date.now()}`,
  });

  await page.route("**/api/billing/portal-session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        url: "/account/billing?portal=ok",
      }),
    });
  });

  await page.goto(`/auth/login?next=${encodeURIComponent("/account/billing")}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/account\/billing/);
  await expect(page.getByText("Account and billing")).toBeVisible();
  await expect(page.getByText("Pro").first()).toBeVisible();

  await page.getByRole("button", { name: "Manage subscription" }).click();
  await expect(page).toHaveURL(/\/account\/billing\?portal=ok/);

  await page.getByRole("button", { name: "Refresh subscription status" }).click();
  await expect(page.getByText("Account and billing")).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage subscription" })).toBeVisible();
});
