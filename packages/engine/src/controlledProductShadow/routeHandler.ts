import { Pool } from "pg";
import { getTrainingSnapshot } from "../trainingStoreDb";
import { readServerSession } from "../serverAuth";
import { CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE,
  type ControlledProductShadowAppSurface, type ControlledProductShadowClientTrigger,
  type ControlledProductShadowResourcePolicy } from "./contracts";
import { NOOP_CONTROLLED_PRODUCT_SHADOW_OBSERVABILITY } from "./observability";
import { createControlledProductShadowPostgresRepository } from "./postgresRepository";
import { controlledProductShadowEligibility, resolveControlledProductShadowRolloutPolicyFromEnvironment } from
  "./rolloutConfig";
import { createControlledProductShadowService } from "./service";
import { CONSERVATIVE_PRODUCT_SHADOW_V2_PIPELINE } from "./v2Pipeline";

let pool: Pool | null = null;

function databasePool(environment: Readonly<Record<string, string | undefined>>): Pool {
  if (pool) return pool;
  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL_REQUIRED_FOR_CONTROLLED_PRODUCT_SHADOW");
  pool = new Pool({ connectionString: databaseUrl });
  return pool;
}

export const CONTROLLED_PRODUCT_SHADOW_RESOURCE_POLICY_V1: ControlledProductShadowResourcePolicy = Object.freeze({
  acceptedTriggersPerWindow: 20, windowSeconds: 3600, concurrentRunsPerAthlete: 1, maximumPendingRuns: 3,
  maximumProductSnapshotBytes: 2_000_000, maximumSessions: 500, maximumLogs: 5_000,
  maximumSearchUnits: 50_000, wallClockBudgetMs: 8_000,
});

const EMPTY_HEADERS = Object.freeze({ "Cache-Control": "no-store, no-cache, must-revalidate" });

function empty(status: number): Response {
  return new Response(null, { status, headers: EMPTY_HEADERS });
}

export async function handleControlledProductShadowPost(input: {
  readonly request: Request;
  readonly appSurface: ControlledProductShadowAppSurface;
  readonly environment?: Readonly<Record<string, string | undefined>>;
}): Promise<Response> {
  const evaluationTime = new Date().toISOString();
  const environment = input.environment ?? process.env;
  const session = await readServerSession();
  if (!session) return empty(401);
  const policy = resolveControlledProductShadowRolloutPolicyFromEnvironment(environment);
  const eligibility = controlledProductShadowEligibility({ policy, authenticatedUserId: session.id,
    appSurface: input.appSurface });
  if (eligibility !== "eligible") return empty(204);
  const text = await input.request.text();
  if (!text || text.length > 16_384) return empty(400);
  let clientTrigger: ControlledProductShadowClientTrigger;
  try {
    clientTrigger = JSON.parse(text) as ControlledProductShadowClientTrigger;
  } catch {
    return empty(400);
  }
  try {
    const repository = createControlledProductShadowPostgresRepository({ pool: databasePool(environment) });
    const service = createControlledProductShadowService({ policy,
      dataMinimizationPolicy: Object.freeze({ reference: CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE,
        rawProductSnapshotPersistence: false, emailPersistence: false, notesPersistence: false,
        photoPersistence: false, authTokenPersistence: false, structuredReferencesOnly: true }),
      resourcePolicy: CONTROLLED_PRODUCT_SHADOW_RESOURCE_POLICY_V1, repository,
      loadProductSnapshot: getTrainingSnapshot, pipeline: CONSERVATIVE_PRODUCT_SHADOW_V2_PIPELINE,
      observability: NOOP_CONTROLLED_PRODUCT_SHADOW_OBSERVABILITY });
    const result = await service.run({ clientTrigger, authenticatedUserId: session.id,
      appSurface: input.appSurface, evaluationTime });
    if (result.disposition === "malformed") return empty(400);
    if (result.disposition === "conflict") return empty(409);
    if (result.disposition === "resource_limit") return empty(429);
    if (result.disposition === "noop_off" || result.disposition === "noop_ineligible") return empty(204);
    return empty(202);
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[controlled-product-shadow] accepted shadow request failed", { name, appSurface: input.appSurface });
    return empty(500);
  }
}
