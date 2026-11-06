import { healthRoute } from "@/shared/lib/sites-tools/next";

/** The container's readiness probe: the process answers. */
export const dynamic = "force-dynamic";

export const GET = healthRoute();
