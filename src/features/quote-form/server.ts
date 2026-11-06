import "server-only";
import { leadWebhook, type LeadWebhook } from "@/shared/lib/sites-tools/server";
import { serverEnv } from "@/shared/config/env";
import { site } from "@/shared/config/site";
import { jobLabelFr } from "./lib/job-label";

export { notifier, NOTIFIER_OPTIONS } from "./api/notify";
export { jobLabelFr };

let hook: LeadWebhook | null | undefined;

/**
 * Each lead to the Service-Arb panel; `null` without `LEAD_WEBHOOK_URL`.
 * Here rather than beside `serverEnv`: the need is named in the copy's words,
 * which `shared` cannot read.
 */
export function webhook(): LeadWebhook | null {
  // A job the form no longer offers stays as posted.
  return (hook ??= leadWebhook(site, serverEnv(), { needLabel: subject => jobLabelFr(subject) ?? subject }));
}
