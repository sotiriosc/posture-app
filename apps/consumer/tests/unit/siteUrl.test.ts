import { afterEach, describe, expect, test, vi } from "vitest";
import { PRODUCTION_SITE_URL, resolvePublicSiteUrl } from "@/siteUrl";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe("resolvePublicSiteUrl", () => {
  test("uses production canonical URL when NODE_ENV is production and env is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(resolvePublicSiteUrl()).toBe(PRODUCTION_SITE_URL);
  });

  test("rejects localhost env values in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(resolvePublicSiteUrl()).toBe(PRODUCTION_SITE_URL);
  });

  test("honors a valid production app URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://praxisapp.ca/");

    expect(resolvePublicSiteUrl()).toBe("https://praxisapp.ca");
  });

  test("allows localhost in non-production", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;

    expect(resolvePublicSiteUrl()).toBe("http://localhost:3000");
  });
});
