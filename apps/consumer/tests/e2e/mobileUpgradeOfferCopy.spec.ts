import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  loginE2eUser,
  mockTrainingState,
} from "../../e2e/fixtures";

/**
 * Mobile upgrade card must surface the same offer facts as desktop —
 * promo code + founders explanation + value framing — without expanders.
 */

const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "360x740", width: 360, height: 740 },
] as const;

const mockBillingStatus = async (page: import("@playwright/test").Page) => {
  await page.route("**/api/billing/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        stripeConfigured: true,
        checkoutPlans: { monthly: true, annual: true, founders: true },
        priceLabels: {
          monthly: { label: "$19.99/mo", detail: "Standard monthly" },
          annual: { label: "$199.99/yr", detail: "Best value" },
          founders: { label: "$12.99/mo", detail: "Founders" },
        },
      }),
    });
  });
};

for (const viewport of VIEWPORTS) {
  test(`mobile upgrade card shows offer copy and value framing (${viewport.name})`, async ({
    page,
  }) => {
    const email = e2eEmail(`upgrade-copy-${viewport.name}`);
    await loginE2eUser(page, {
      email,
      password: "playwright-password",
      plan: "free",
    });
    await mockTrainingState(page, { authenticated: false });
    await mockBillingStatus(page);
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await completeQuestionnaire(page);

    const mobileCard = page.getByTestId("upgrade-prompt-mobile");
    await expect(mobileCard).toBeVisible();
    await expect(page.getByTestId("upgrade-prompt-desktop")).toBeHidden();

    await expect(mobileCard.getByTestId("upgrade-offer-notes")).toBeVisible();
    await expect(mobileCard.getByText("PRAXISTRIAL60DAY")).toBeVisible();
    await expect(
      mobileCard.getByText(/Founding members:\s*100 spots/i)
    ).toBeVisible();
    await expect(mobileCard.getByTestId("upgrade-value-context")).toBeVisible();
    await expect(mobileCard.getByText("What this actually costs")).toBeVisible();
  });
}
