"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestProgram, init, listSessions } from "@/lib/logStore";

export default function ContinueProgramCTA() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = async () => {
      await init();
      const program = await getLatestProgram();
      const sessions = await listSessions(1);
      const hasLocal =
        typeof window !== "undefined" &&
        (localStorage.getItem("posture_questionnaire") ||
          localStorage.getItem("app_state_v1"));
      const hasData = Boolean(program || sessions.length || hasLocal);
      setVisible(hasData);
      setMounted(true);
    };
    check();
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/results"
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } hover:bg-white/25`}
    >
      <span aria-hidden>▶</span>
      Continue program
    </Link>
  );
}
