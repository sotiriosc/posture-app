const normalized = (value: string | undefined) => value?.trim().toLowerCase() ?? "";

export const isLocalDevRuntime = () => normalized(process.env.NODE_ENV) === "development";

export const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL?.trim());

export const shouldUseLocalDbFallback = () =>
  isLocalDevRuntime() && normalized(process.env.LOCAL_DB_GRACEFUL_FALLBACK) !== "0";

export const warnOnce = (() => {
  const seen = new Set<string>();
  return (key: string, message: string, error?: unknown) => {
    if (seen.has(key)) return;
    seen.add(key);
    if (error) {
      console.warn(message, error);
    } else {
      console.warn(message);
    }
  };
})();
