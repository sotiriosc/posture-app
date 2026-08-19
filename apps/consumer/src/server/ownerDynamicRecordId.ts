const OWNER_RECORD_PREFIX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OWNER_RECORD_TOKEN = /^[0-9a-f]{16}$/;

export function normalizeOwnerDynamicRecordId(
  value: string,
  expectedPrefix: string
): string | null {
  if (!value || value.length > 256 || !OWNER_RECORD_PREFIX.test(expectedPrefix)) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  const prefix = `${expectedPrefix}:`;
  return decoded.startsWith(prefix) && OWNER_RECORD_TOKEN.test(decoded.slice(prefix.length))
    ? decoded
    : null;
}
