import Link from "next/link";
import type { ReactNode } from "react";
import { readOwnerGate } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountSettingsLayout({ children }: { readonly children: ReactNode }) {
  const gate = await readOwnerGate("read");
  if (!gate.allowed) return children;
  return <>
    {children}
    <aside aria-label="Owner preview" style={{ maxWidth: 720, margin: "0 auto 32px", padding: "0 20px" }}>
      <Link href="/account/praxis-v2" style={{ display: "inline-flex", minHeight: 44,
        alignItems: "center", color: "var(--text, #171717)", fontWeight: 700 }}>
        Praxis V2 owner preview
      </Link>
    </aside>
  </>;
}
