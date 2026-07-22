import { defineConfig } from "@playwright/test";

const host = process.env.PLAYWRIGHT_HOST ?? "127.0.0.1";
const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname ${host} --port ${port}`,
    env: {
      ...process.env,
      AUTH_SECRET: process.env.PLAYWRIGHT_AUTH_SECRET ?? "playwright-auth-secret",
      AUTH_USER_EMAIL:
        process.env.PLAYWRIGHT_AUTH_USER_EMAIL ?? "playwright-bootstrap@example.com",
      AUTH_USER_PASSWORD:
        process.env.PLAYWRIGHT_AUTH_USER_PASSWORD ?? "playwright-password",
      AUTH_USER_PLAN: process.env.PLAYWRIGHT_AUTH_USER_PLAN ?? "free",
      USER_STORE_DRIVER: "file",
      DATABASE_URL: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_ID: "price_playwright",
      STRIPE_WEBHOOK_SECRET: "",
    },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
