import { runGenuineGenerationStressShard } from "./evidence";

try {
  const start = Number(process.argv[2]);
  const count = Number(process.argv[3]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(count)) throw new Error("INVALID_STRESS_SHARD");
  process.send?.({ fingerprint: runGenuineGenerationStressShard(start, count) });
} catch (error) {
  process.send?.({ error: error instanceof Error ? error.stack ?? error.message : String(error) });
}
