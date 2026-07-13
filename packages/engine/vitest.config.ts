import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: __dirname,
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
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
    },
  },
});
