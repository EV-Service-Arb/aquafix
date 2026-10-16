import { copyFor, type Copy } from "@/entities/content";
import { bakedPlace, contactOf, placeView, storefrontOf, type Place, type PlaceView } from "@/entities/place";
import type { Locale } from "@/shared/config/i18n";

type Storefront = NonNullable<ReturnType<typeof storefrontOf<Locale>>>;

export function clermontFerrand(overrides: Partial<Place> = {}): Place {
  const baked = bakedPlace("clermont-ferrand");
  if (!baked) throw new Error("fixture: clermont-ferrand is not configured");
  return { ...baked, ...overrides };
}

/** Clermont-Ferrand with some of its storefront fields replaced. */
export function withFront(place: Place, front: Partial<Omit<Storefront, "kind">>): Place {
  const current = storefrontOf(place);
  if (!current) throw new Error("fixture: not a storefront");
  return { ...place, presence: { ...current, ...front } };
}

/** Every publication field filled — the shape an owner-completed point has. */
export function publishedClermontFerrand(overrides: Partial<Place> = {}, front: Partial<Omit<Storefront, "kind">> = {}): Place {
  const place = clermontFerrand({
    serviceArea: [{ kind: "localities", names: ["Clermont-Ferrand", "Chamalières", "Aubière"] }],
    hours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "21:00" }],
    ...overrides,
  });
  return withFront(place, {
    storefrontPhoto: "https://cdn.example/clermont-ferrand.jpg",
    landmark: { fr: "Près des fontaines pétrifiantes", en: "Near the petrifying fountains" },
    ...front,
  });
}

export function context(place: Place, locale: Locale = "fr"): { point: PlaceView; copy: Copy } {
  return {
    point: placeView(place, locale, "host"),
    copy: copyFor({ locale, place: place.name[locale], phone: contactOf(place).phone }),
  };
}
