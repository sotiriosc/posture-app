import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: __dirname,
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Matrix, fuzz, and golden-anchor suites are intentionally large and can
    // take 30–120 s on constrained CI runners (especially WSL2). The vitest
    // default 5 000 ms is far too low; raise to 3 minutes.
    testTimeout: 180_000,
  },
  resolve: {
    alias: {
      // Engine-internal imports
      "@/lib": path.resolve(__dirname, "./src"),
      // Consumer aliases: some engine tests import React components / app routes.
      // These tests will migrate to apps/consumer in Day 2; for Day 1 we just
      // point the alias so the transport doesn't break them.
      "@/components": path.resolve(__dirname, "../../apps/consumer/src/components"),
      "@/app": path.resolve(__dirname, "../../apps/consumer/src/app"),
      "@/hooks": path.resolve(__dirname, "../../apps/consumer/src/hooks"),
    },
  },
});
