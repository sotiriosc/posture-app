export const PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY_V1_2 = Object.freeze({
  defaultCompilerVersion: null,
  versions: Object.freeze({
    "1.0.0": "HISTORICAL_PRODUCT_SHADOW_COMPATIBILITY_PINNED",
    "1.1.0": "PURPOSE_FIRST_FAIL_CLOSED_BASELINE_FROZEN",
    "1.2.0": "SUPPORTED_PURPOSE_FUTURE_ONLY_EXPLICIT_CALLS",
  }),
  automaticMigration: false,
  productCallerCount: 0,
  productShadowCallerCount: 0,
  orchestrationCallerCount: 0,
  activated: false,
} as const);
