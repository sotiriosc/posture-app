import { test, expect, type Page } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  upsertE2eUser,
} from "../../e2e/fixtures";

/**
 * Permanent guard against cross-account browser storage leaks.
 *
 * Log in as user A, enter data across multiple surfaces (questionnaire +
 * macro calculator account save), log out via the real UI logout path
 * (`performLogout` → `clearAllLocalState`), log in as user B, and assert
 * none of A's values are visible in the UI or in browser storage.
 */

const UNIQUE_WEIGHT_A = "222";
const UNIQUE_HEIGHT_A = "71";
const UNIQUE_AGE_A = "41";

const fillMacroAs = async (
  page: Page,
  values: { weight: string; height: string; age: string }
) => {
  await page.goto("/tools/macro-calculator");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-hydrated",
    "1"
  );
  await page.getByTestId("macro-input-weight").fill(values.weight);
  await page.getByTestId("macro-input-height").fill(values.height);
  await page.getByTestId("macro-input-age").fill(values.age);
  await page.getByTestId("macro-input-sex").selectOption("female");
  await page.getByTestId("macro-input-activity").selectOption("active");
  await page.getByTestId("macro-input-goal").selectOption("lose");
  await expect(page.getByTestId("macro-results")).toBeVisible();
};

const uiLogout = async (page: Page) => {
  await page.goto("/results");
  await expect(page.getByText("Praxis Dashboard", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByTestId("nav-menu-logout").click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
};

test("user B never sees user A's macro calculator or questionnaire values after logout", async ({
  page,
}) => {
  const passwordA = "playwright-password-a1";
  const passwordB = "playwright-password-b1";
  const emailA = e2eEmail("storage-leak-a");
  const emailB = e2eEmail("storage-leak-b");
  await upsertE2eUser({ email: emailA, password: passwordA, plan: "free" });
  await upsertE2eUser({ email: emailB, password: passwordB, plan: "free" });

  // Account A
  let login = await page.request.post("/api/auth/login", {
    data: { email: emailA, password: passwordA },
  });
  expect(login.ok()).toBeTruthy();

  await completeQuestionnaire(page);

  await fillMacroAs(page, {
    weight: UNIQUE_WEIGHT_A,
    height: UNIQUE_HEIGHT_A,
    age: UNIQUE_AGE_A,
  });
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-authenticated",
    "1"
  );

  // Wait for debounced account-side save, then confirm it stuck server-side.
  await expect
    .poll(
      async () => {
        const res = await page.request.get("/api/tools/macro-calculator");
        const body = (await res.json()) as {
          inputs?: { weightLb?: number } | null;
        };
        return body.inputs?.weightLb ?? null;
      },
      { timeout: 10_000 }
    )
    .toBe(Number(UNIQUE_WEIGHT_A));

  // Distinctive local questionnaire marker must exist for A before logout.
  const questionnaireBefore = await page.evaluate(() =>
    localStorage.getItem("posture_questionnaire")
  );
  expect(questionnaireBefore).toBeTruthy();

  await uiLogout(page);

  // After logout wipe: no questionnaire / app state leftovers.
  await page.goto("/tools/macro-calculator");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-hydrated",
    "1"
  );
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-authenticated",
    "0"
  );
  await expect(page.getByTestId("macro-input-weight")).toHaveValue("");
  await expect(page.getByTestId("macro-input-height")).toHaveValue("");
  await expect(page.getByTestId("macro-input-age")).toHaveValue("");

  const localAfterLogout = await page.evaluate(() => ({
    questionnaire: localStorage.getItem("posture_questionnaire"),
    appState: localStorage.getItem("app_state_v1"),
    owner: localStorage.getItem("praxis_local_owner_id"),
  }));
  expect(localAfterLogout.questionnaire).toBeNull();
  expect(localAfterLogout.appState).toBeNull();
  expect(localAfterLogout.owner).toBeNull();

  // Account B on the same browser
  login = await page.request.post("/api/auth/login", {
    data: { email: emailB, password: passwordB },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/tools/macro-calculator");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-hydrated",
    "1"
  );
  await expect(page.getByTestId("macro-calculator")).toHaveAttribute(
    "data-authenticated",
    "1"
  );

  // B has never saved calculator inputs — form must not show A's numbers.
  await expect(page.getByTestId("macro-input-weight")).toHaveValue("");
  await expect(page.getByTestId("macro-input-height")).toHaveValue("");
  await expect(page.getByTestId("macro-input-age")).toHaveValue("");
  await expect(page.getByTestId("macro-input-weight")).not.toHaveValue(
    UNIQUE_WEIGHT_A
  );

  const bServer = await page.request.get("/api/tools/macro-calculator");
  const bBody = (await bServer.json()) as {
    inputs?: { weightLb?: number } | null;
  };
  expect(bBody.inputs).toBeNull();

  // B also must not inherit A's questionnaire from localStorage.
  await page.goto("/assessment");
  await page.waitForLoadState("networkidle");
  const localAsB = await page.evaluate(() =>
    localStorage.getItem("posture_questionnaire")
  );
  // Either wiped empty or a fresh B draft — never A's distinctive payload alone.
  if (localAsB) {
    expect(localAsB).not.toEqual(questionnaireBefore);
  }
});
