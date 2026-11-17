import type { Metadata } from "next";
import { locationMetadata } from "@/features/seo";
import type { PageKey } from "@/shared/config/site";
import { loadPoint, type LocationParams } from "@/views/location/server";
import { LocationSubpage } from "@/views/location/subpage";

type Props = { params: Promise<LocationParams> };

/** A sub-page's route: its `<head>` and its page. */
export function subpageRoute(page: Exclude<PageKey, "home">) {
  return {
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { point, copy } = await loadPoint(params);
      return locationMetadata(point, copy, page);
    },
    async Page({ params }: Props) {
      const { point, copy } = await loadPoint(params);
      return <LocationSubpage copy={copy} point={point} page={page} now={new Date()} />;
    },
  };
}
