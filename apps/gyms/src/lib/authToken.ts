import type { SessionTokenPayload } from "@/lib/authTypes";

const encoder = new TextEncoder();

const toBase64Url = (input: Uint8Array) => {
  let binary = "";
  input.forEach((char) => {
    binary += String.fromCharCode(char);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (input: string) => {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return new Uint8Array(binary.split("").map((char) => char.charCodeAt(0)));
};

const getHmacKey = async (secret: string) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

const signSegment = async (segment: string, secret: string) => {
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(segment));
  return toBase64Url(new Uint8Array(sig));
};

const verifySegment = async (
  segment: string,
  signature: string,
  secret: string
) => {
  let signatureBytes: Uint8Array;
  try {
    signatureBytes = fromBase64Url(signature);
  } catch {
    return false;
  }
  const key = await getHmacKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(segment)
  );
};

export const createSessionToken = async (
  payload: SessionTokenPayload,
  secret: string
) => {
  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const segment = `${header}.${body}`;
  const signature = await signSegment(segment, secret);
  return `${segment}.${signature}`;
};

export const verifySessionToken = async (
  token: string,
  secret: string
) => {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) return null;
  const segment = `${header}.${body}`;
  const valid = await verifySegment(segment, signature, secret);
  if (!valid) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body))
    ) as SessionTokenPayload;
    if (!payload.exp || Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};
