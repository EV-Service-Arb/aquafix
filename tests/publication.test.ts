import { describe, expect, it } from "vitest";
import { isPublished, PLACES, publicationGaps } from "@/entities/place";
import { locationMetadata } from "@/features/seo";
import { context, publishedClermontFerrand, clermontFerrand } from "./support/fixtures";

describe("the publication gate", () => {
  it("holds every point back until the owner fills its local fields", () => {
    for (const location of PLACES) {
      expect(publicationGaps(location)).toEqual(["storefrontPhoto", "landmark", "serviceArea", "hours"]);
      expect(isPublished(location)).toBe(false);
    }
  });

  it("opens only when all four are there", () => {
    expect(isPublished(publishedClermontFerrand())).toBe(true);
    expect(publicationGaps(publishedClermontFerrand({ hours: [] }))).toEqual(["hours"]);
    expect(publicationGaps(publishedClermontFerrand({ serviceArea: [] }))).toEqual(["serviceArea"]);
    expect(publicationGaps(publishedClermontFerrand({}, { landmark: { fr: "Place", en: " " } }))).toEqual(["landmark"]);
  });

  it("serves an unpublished point noindex, and a published one indexable", () => {
    const held = context(clermontFerrand());
    expect(locationMetadata(held.point, held.copy, "home").robots).toMatchObject({ index: false });
    const open = context(publishedClermontFerrand());
    expect(locationMetadata(open.point, open.copy, "home").robots).toMatchObject({ index: true });
  });

  it("points the canonical at the subdomain and names both languages plus x-default", () => {
    const { point, copy } = context(clermontFerrand(), "en");
    const meta = locationMetadata(point, copy, "prices");
    expect(meta.alternates?.canonical).toBe("https://clermont-ferrand.aquafix.top/en/prices");
    expect(meta.alternates?.languages).toEqual({
      "fr-FR": "https://clermont-ferrand.aquafix.top/fr/prices",
      en: "https://clermont-ferrand.aquafix.top/en/prices",
      "x-default": "https://clermont-ferrand.aquafix.top/fr/prices",
    });
  });
});
