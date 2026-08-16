import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  test: {
    environment: "node",
    include: [
      "tests/unit/goalSpecificProductShadowEvidence.test.ts",
      "tests/controlledProductShadowGoalEvidence/**/*.test.ts",
    ],
    testTimeout: 300_000,
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "../../apps/consumer/src/components"),
      "@/app": path.resolve(__dirname, "../../apps/consumer/src/app"),
      "@/hooks": path.resolve(__dirname, "../../apps/consumer/src/hooks"),
      "@/firstRunCalm": path.resolve(__dirname, "../../apps/consumer/src/firstRunCalm.ts"),
    },
  },
});
