import { NextResponse } from "next/server";
import { readServerSession } from "@/lib/serverAuth";
import {
  getTrainingSnapshot,
  patchTrainingSnapshot,
  type TrainingSnapshot,
} from "@/lib/trainingStoreDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreJson = (payload: unknown, status = 200) =>
  NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

export async function GET() {
  const session = await readServerSession();
  if (!session) {
    return noStoreJson({ ok: true, authenticated: false, snapshot: null });
  }

  try {
    const snapshot = await getTrainingSnapshot(session.id);
    return noStoreJson({ ok: true, authenticated: true, snapshot });
  } catch (error) {
    console.error("[training/state] failed to load snapshot", error);
    return noStoreJson(
      { ok: false, authenticated: true, error: "Training snapshot unavailable." },
      500
    );
  }
}

export async function POST(request: Request) {
  const session = await readServerSession();
  if (!session) {
    return noStoreJson({ ok: false, error: "Not authenticated." }, 401);
  }

  const patch = (await request.json().catch(() => null)) as TrainingSnapshot | null;
  if (!patch || typeof patch !== "object") {
    return noStoreJson({ ok: false, error: "Invalid patch payload." }, 400);
  }

  try {
    await patchTrainingSnapshot(session.id, patch);
    return noStoreJson({ ok: true });
  } catch (error) {
    console.error("[training/state] failed to persist patch", error);
    return noStoreJson({ ok: false, error: "Failed to persist training state." }, 500);
  }
}
