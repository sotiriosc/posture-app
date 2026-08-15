export * from "./contracts";
export * from "./ingestionService";
export * from "./migrationRunner";
export * from "./migrations";
export * from "./observability";
export * from "./postgresRepository";
export * from "./replay";

export const OUTCOME_SOURCE_PERSISTENCE_SERVER_ONLY = true as const;
export const OUTCOME_SOURCE_PERSISTENCE_LIVE_APP_WIRING_COUNT = 0 as const;
export const OUTCOME_SOURCE_PERSISTENCE_IMPORT_SIDE_EFFECT_COUNT = 0 as const;
