import { defineConfig } from "vitest/config";
import path from "path";

// Root-level convenience: delegates to the engine's test suite.
// Run `npm test` at root or `vitest` from packages/engine directly.
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/engine/tests/unit/**/*.test.ts"],
    // Matrix, fuzz, and golden-anchor suites are intentionally large and can
    // take 30–120 s on constrained CI runners (especially WSL2). Raise the
    // default 5 000 ms to 3 minutes so these suites are not false-negatives.
    testTimeout: 180_000,
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "packages/engine/src"),
      "@/components": path.resolve(__dirname, "apps/consumer/src/components"),
      "@/app": path.resolve(__dirname, "apps/consumer/src/app"),
    },
  },
});
