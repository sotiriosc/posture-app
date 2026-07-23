import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 8 — PWA install prompt orchestration.
 *
 * `InstallApp` previously existed but was never mounted anywhere, so its
 * `beforeinstallprompt` listener never attached and Chrome's native banner
 * fired uncontested. It's now mounted at the root layout (suppressing the
 * native banner app-wide via `preventDefault()`) and only actually shows
 * its own dismissible card after the user's first-ever completed session,
 * never on the session-complete screen itself.
 *
 * Real browsers don't reliably fire `beforeinstallprompt` under automation,
 * so these tests dispatch a synthetic one with stubbed `prompt()` /
 * `userChoice`, matching the shape the component expects — this is
 * orchestration logic under test, not Chrome's own install eligibility
 * heuristics.
 */

const dispatchFakeInstallPrompt = () =>
  window.dispatchEvent(
    Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    })
  );

const dispatchSessionCompleted = () =>
  window.dispatchEvent(
    new CustomEvent("session:completed", {
      detail: {
        sessionId: "e2e-session",
        programId: null,
        dayIndex: null,
        completedAt: new Date().toISOString(),
      },
    })
  );

test("install prompt stays hidden until a session has completed, then appears off the session route", async ({
  page,
}) => {
  const email = e2eEmail("pwa-install");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 20_000,
  });
  // Give the root layout's effect a moment past the initial dev-mode
  // double-invoke before dispatching, so the listener is reliably attached.
  await page.waitForTimeout(300);

  await page.evaluate(dispatchFakeInstallPrompt);
  // No session has completed yet in this visit — the stashed native event
  // alone must not be enough to show the custom card.
  await expect(page.getByTestId("pwa-install-prompt")).toHaveCount(0);

  await page.evaluate(dispatchSessionCompleted);
  const prompt = page.getByTestId("pwa-install-prompt");
  await expect(prompt).toBeVisible();

  const installButton = page.getByTestId("pwa-install-accept");
  const dismissButton = page.getByTestId("pwa-install-dismiss");
  await expect(installButton).toBeVisible();
  await expect(dismissButton).toBeVisible();
  const installBox = await installButton.boundingBox();
  const dismissBox = await dismissButton.boundingBox();
  expect(installBox).not.toBeNull();
  expect(dismissBox).not.toBeNull();
  if (installBox) expect(installBox.height).toBeGreaterThanOrEqual(44);
  if (dismissBox) expect(dismissBox.height).toBeGreaterThanOrEqual(44);
});

test("install prompt does not render on the session route even once eligible", async ({
  page,
}) => {
  const email = e2eEmail("pwa-install-session-route");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    localStorage.setItem(
      "posture_questionnaire",
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      })
    );
  });

  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(500);

  await page.goto("/session");
  await expect(page.getByTestId("session-next")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(300);

  await page.evaluate(dispatchFakeInstallPrompt);
  await page.evaluate(dispatchSessionCompleted);
  await expect(page.getByTestId("pwa-install-prompt")).toHaveCount(0);
});

test("dismissing the install prompt is remembered for the cooldown window", async ({
  page,
}) => {
  const email = e2eEmail("pwa-install-dismiss");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 20_000,
  });
  await page.waitForTimeout(300);

  await page.evaluate(dispatchFakeInstallPrompt);
  await page.evaluate(dispatchSessionCompleted);
  await expect(page.getByTestId("pwa-install-prompt")).toBeVisible();

  await page.getByTestId("pwa-install-dismiss").click();
  await expect(page.getByTestId("pwa-install-prompt")).toHaveCount(0);

  const dismissedAt = await page.evaluate(() =>
    localStorage.getItem("pwa_install_dismissed_at")
  );
  expect(dismissedAt).toBeTruthy();

  // Reloading within the cooldown window keeps it suppressed even though
  // the underlying eligibility signal (a completed session) is still true.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 20_000,
  });
  await page.waitForTimeout(300);
  await page.evaluate(dispatchFakeInstallPrompt);
  await page.evaluate(dispatchSessionCompleted);
  await expect(page.getByTestId("pwa-install-prompt")).toHaveCount(0);
});
