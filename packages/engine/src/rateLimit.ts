type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const takeRateLimit = (params: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  const now = Date.now();
  const current = buckets.get(params.key);
  if (!current || now >= current.resetAt) {
    buckets.set(params.key, {
      count: 1,
      resetAt: now + params.windowMs,
    });
    return { allowed: true, remaining: params.limit - 1 };
  }
  if (current.count >= params.limit) {
    return { allowed: false, remaining: 0 };
  }
  current.count += 1;
  buckets.set(params.key, current);
  return { allowed: true, remaining: params.limit - current.count };
};
