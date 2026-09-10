/** Outline emoji markers — standalone icons (no circle plate). */
export const MARKER_ICONS = {
  cinema: "/markers/outline/cinema.png",
  "avocado-toast": "/markers/outline/avocado-toast.png",
  "coconut-drink": "/markers/outline/coconut-drink.png",
  arcade: "/markers/outline/arcade.png",
  dumplings: "/markers/outline/dumplings.png",
  sushi: "/markers/outline/sushi.png",
  keyboard: "/markers/outline/keyboard.png",
} as const;

export type MarkerIconId = keyof typeof MARKER_ICONS;

const PLACE_ICON: Partial<Record<string, MarkerIconId>> = {
  "common-man-coffee": "avocado-toast",
  "ps-cafe": "avocado-toast",
  "tiong-bahru-bakery": "avocado-toast",
  "dempsey-hill": "coconut-drink",
  "gardens-by-the-bay": "coconut-drink",
  "macritchie-reservoir": "coconut-drink",
  "fort-canning": "coconut-drink",
  "merlion-park": "coconut-drink",
  "swee-choon": "dumplings",
  "hawker-chan": "dumplings",
  "maxwell-food-centre": "dumplings",
  "chinatown-complex": "dumplings",
  "lau-pa-sat": "dumplings",
  "latteria-mozzarella": "sushi",
  "burnt-ends": "dumplings",
  "jumbo-seafood": "sushi",
  "shake-shack": "avocado-toast",
  "ion-orchard": "arcade",
  "national-gallery": "keyboard",
};

const CATEGORY_ICON: Record<string, MarkerIconId> = {
  Cafe: "avocado-toast",
  Attraction: "coconut-drink",
  Food: "dumplings",
  Restaurant: "sushi",
  Museum: "keyboard",
  Shopping: "arcade",
  Outdoors: "coconut-drink",
  Nightlife: "cinema",
};

export function getMarkerIconPath(
  placeId: string,
  category: string,
): string {
  const iconId =
    PLACE_ICON[placeId] ?? CATEGORY_ICON[category] ?? "sushi";
  return MARKER_ICONS[iconId];
}
