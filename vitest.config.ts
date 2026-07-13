import { defineConfig } from "vitest/config";
import path from "path";

// Root-level convenience: delegates to the engine's test suite.
// Run `npm test` at root or `vitest` from packages/engine directly.
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/engine/tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "packages/engine/src"),
      "@/components": path.resolve(__dirname, "apps/consumer/src/components"),
      "@/app": path.resolve(__dirname, "apps/consumer/src/app"),
    },
  },
});
