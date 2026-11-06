import "server-only";
import { applyOverrides } from "@evinvest/experiments";
import { createExperimentsSource } from "@/shared/lib/sites-tools/server";
import { site } from "@/shared/config/site";
import { EXPERIMENTS, type LiveExperiments } from "@/shared/config/experiments";

/**
 * The panel's weights, kill switch and holdout for the brand's experiments
 * (sites_panel's `/brands/<brand>/experiments`), cached in memory: the proxy asks
 * on every request. No `SITES_PANEL_INTERNAL_URL`, or a panel that cannot answer, is the
 * config in code — the last good answer once there was one.
 */
const source = createExperimentsSource(site);

/** Where the applied config comes from; injected by the tests. */
export type LiveConfig = () => Promise<LiveExperiments>;

/**
 * The config every reader of a variant uses — assignment, the bucket, the lead
 * events. One reader on the code's config would let a cookie of an experiment
 * the panel switched off count as its arm.
 */
export const liveExperiments: LiveConfig = async () => applyOverrides(EXPERIMENTS, await source.overrides());
