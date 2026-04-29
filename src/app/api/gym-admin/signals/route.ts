import { NextResponse } from "next/server";
import { getActiveGymConfig } from "@/lib/gymSaas/gymConfig";
import {
  pilotOperatorSignals,
  pilotOperatorSummary,
} from "@/lib/gymSaas/operatorSignalFixtures";

export function GET() {
  const gymConfig = getActiveGymConfig();

  return NextResponse.json({
    mode: "pilot_preview",
    demo: true,
    message: "Pilot signal preview. Live member data connection comes next.",
    gym: {
      gymId: gymConfig.gymId,
      gymName: gymConfig.gymName,
      locationLabel: gymConfig.locationLabel,
      pilotLabel: gymConfig.pilotSettings.pilotLabel,
      dashboardConnected: gymConfig.pilotSettings.dashboardConnected,
    },
    summary: pilotOperatorSummary,
    signals: pilotOperatorSignals,
  });
}
