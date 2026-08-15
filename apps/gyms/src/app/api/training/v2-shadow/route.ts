import { handleControlledProductShadowPost } from "@/lib/controlledProductShadow/routeHandler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function POST(request: Request) {
  return handleControlledProductShadowPost({ request, appSurface: "gyms" });
}
