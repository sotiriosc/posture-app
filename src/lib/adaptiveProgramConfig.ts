type Env = Record<string, string | undefined>;

const readRuntimeEnv = (): Env => {
  if (typeof process === "undefined") return {};
  return process.env;
};

export const isAdaptiveProgrammingEnabled = (
  env: Env = readRuntimeEnv()
) => env.ADAPTIVE_PROGRAMMING_ENABLED === "true";
