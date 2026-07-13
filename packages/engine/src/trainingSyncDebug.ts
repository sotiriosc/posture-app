const runtimeLabel = () =>
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.VERCEL_ENV ??
  process.env.NODE_ENV ??
  "unknown";

export const trainingSyncRuntimeLabel = () => runtimeLabel();

export const shouldLogTrainingSync = () =>
  process.env.NEXT_PUBLIC_TRAINING_SYNC_DEBUG === "1" ||
  process.env.TRAINING_SYNC_DEBUG === "1" ||
  (runtimeLabel() !== "production" && runtimeLabel() !== "test");

export const logTrainingSync = (
  scope: string,
  message: string,
  details?: Record<string, unknown>
) => {
  if (!shouldLogTrainingSync()) return;
  const prefix = `[${scope}:${runtimeLabel()}] ${message}`;
  if (details) {
    console.info(prefix, details);
    return;
  }
  console.info(prefix);
};
