import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 7 — nav menu logout + usage ordering.
 *
 * 7.a: a signed-in user must be able to find "Log out" inside the nav menu
 * itself (previously it lived in a visually separate block below the menu,
 * which is exactly what prompted the "where is logout?" report this commit
 * is fixing).
 * 7.b: menu items are ordered by expected usage frequency for a signed-in
 * user — dashboard/progress first, the marketing "Home" link demoted near
 * the bottom, Log out/Log in last.
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test(`signed-in nav menu shows Log out as a nav item, ordered by usage frequency (${viewport.name})`, async ({
    page,
  }) => {
    const email = e2eEmail(`nav-menu-${viewport.name}`);
    await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
    const login = await page.request.post("/api/auth/login", {
      data: { email, password: "playwright-password" },
    });
    expect(login.ok()).toBeTruthy();

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/results");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: "Open menu" }).click();

    const logout = page.getByTestId("nav-menu-logout");
    await expect(logout).toBeVisible();
    const logoutBox = await logout.boundingBox();
    expect(logoutBox).not.toBeNull();
    if (logoutBox) expect(logoutBox.height).toBeGreaterThanOrEqual(44);

    // Usage-frequency order: dashboard/progress first, Home demoted near the
    // bottom, Log out last of all.
    const labels = [
      "Praxis Dashboard",
      "Progress",
      "Assessment",
      "Movement Profile",
      "Account / Billing",
      "Settings",
      "Help & FAQ",
      "Home",
    ];
    const positions = await Promise.all(
      labels.map(async (label) => {
        const locator = page.getByRole("link", { name: label, exact: true });
        const box = await locator.boundingBox();
        return box?.y ?? -1;
      })
    );
    for (const y of positions) expect(y).toBeGreaterThanOrEqual(0);

    for (let i = 0; i < positions.length - 1; i += 1) {
      expect(positions[i]).toBeLessThan(positions[i + 1]);
    }

    const logoutBoxY = logoutBox?.y ?? -1;
    expect(logoutBoxY).toBeGreaterThan(positions[positions.length - 1]);

    // Clicking it actually logs the user out.
    await logout.click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
    const session = await page.request.get("/api/auth/session");
    const sessionBody = (await session.json()) as { authenticated?: boolean };
    expect(sessionBody.authenticated).toBeFalsy();
  });
}

test("signed-out nav menu shows Log in in the same slot Log out would occupy", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const login = page.getByTestId("nav-menu-login");
  await expect(login).toBeVisible();
  await expect(page.getByTestId("nav-menu-logout")).toHaveCount(0);
  await expect(login).toHaveAttribute("href", "/auth/login");
});
