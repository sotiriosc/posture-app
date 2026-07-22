import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: __dirname,
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: [
      {
        find: /^@\/lib\/gymSaas\/(.*)$/,
        replacement: path.resolve(__dirname, "./src/lib/gymSaas/$1"),
      },
      {
        find: /^@\/lib\/(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/engine/src/$1"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
