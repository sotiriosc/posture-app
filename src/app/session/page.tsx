import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
  isBuyerDemoSearchParamValue,
} from "@/lib/gymSaas/demoMode";
import SessionClient from "./SessionClient";

type SessionPageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const buyerDemoMode =
    isBuyerDemoSearchParamValue(query.demo) ||
    isBuyerDemoCookieValue(cookieStore.get(BUYER_DEMO_COOKIE)?.value);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen page-shell">
          <div className="ui-shell flex max-w-4xl flex-col gap-6 py-8 sm:py-12">
            <p className="text-sm text-slate-200">Loading session...</p>
          </div>
        </div>
      }
    >
      <SessionClient buyerDemoMode={buyerDemoMode} />
    </Suspense>
  );
}
