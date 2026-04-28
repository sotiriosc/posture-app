import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { ADMIN_COOKIE_NAME, getAdminSecretHash, isAdminCookieValue } from "@/lib/adminAuth";

type AccessBody = {
  accessKey?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AccessBody | null;
  const incoming = body?.accessKey?.trim() ?? "";
  const expectedHash = getAdminSecretHash();
  if (!expectedHash || !incoming) {
    return NextResponse.json({ ok: false, error: "Invalid admin configuration." }, { status: 401 });
  }

  const incomingHash = getAdminSecretHashFromRaw(incoming);
  if (incomingHash !== expectedHash) {
    return NextResponse.json({ ok: false, error: "Invalid access key." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, expectedHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const raw = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")[1];
  const response = NextResponse.json({ ok: isAdminCookieValue(raw) });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

function getAdminSecretHashFromRaw(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
