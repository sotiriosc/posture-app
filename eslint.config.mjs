import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ─── Boundary rules (bloom-plan §1.4) ────────────────────────────────────────
//
// R2  engine must NEVER import from apps/*
// R3  engine must NEVER import next/* or react (value imports); type-only is
//     allowed. Three legacy files predate Phase 1 and are explicitly carved out
//     with a comment — they are tracked as a post-Phase-1 cleanup ticket.
// R4  no cross-app imports: consumer ↔ gyms forbidden in both directions.
// R1  apps may import engine ONLY via @praxis/engine (barrel) — deferred to
//     post-Phase-3 (alias approach required for Edge Runtime; see bloom-plan §1.3).

const R2_R3 = {
  files: ["packages/engine/src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "^\\.\\./apps/|^apps/",
            message:
              "R2 violation: engine must not import from apps/*. " +
              "Move shared code into packages/engine/src/ instead.",
          },
          {
            regex: "^next(/|$)",
            message:
              "R3 violation: engine must not import from next/*. " +
              "Use `import type` for type-only needs; value imports belong in the app layer.",
          },
          {
            regex: "^react$",
            message:
              "R3 violation: engine must not import from react. " +
              "Use `import type` for type-only needs; hooks belong in the app layer.",
          },
        ],
      },
    ],
  },
};

// Three legacy files that predate Phase 1 hold value imports from next/react.
// They are tracked as post-Phase-1 refactor work (not R3-exempt forever).
const R3_LEGACY_EXCEPTIONS = {
  files: [
    "packages/engine/src/adminAuth.ts",
    "packages/engine/src/serverAuth.ts",
    "packages/engine/src/useTrainingSyncStatus.ts",
  ],
  rules: {
    // adminAuth + serverAuth: import { cookies } from "next/headers" for auth
    // useTrainingSyncStatus: import { useSyncExternalStore } from "react"
    // Post-Phase-1 refactor: move these to apps/ layer or wrap behind DI.
    "no-restricted-imports": "off",
  },
};

const R4_CONSUMER = {
  files: ["apps/consumer/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "^@praxis/gyms|^\\.\\./apps/gyms/|^apps/gyms/",
            message:
              "R4 violation: consumer must not import from the gyms app. " +
              "Share code via @praxis/engine instead.",
          },
        ],
      },
    ],
  },
};

const R4_GYMS = {
  files: ["apps/gyms/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "^@praxis/consumer|^\\.\\./apps/consumer/|^apps/consumer/",
            message:
              "R4 violation: gyms must not import from the consumer app. " +
              "Share code via @praxis/engine instead.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "**/.next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "**/node_modules/**",
  ]),
  R2_R3,
  R3_LEGACY_EXCEPTIONS,
  R4_CONSUMER,
  R4_GYMS,
]);

export default eslintConfig;
