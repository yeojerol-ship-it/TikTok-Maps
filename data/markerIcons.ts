/** Outline emoji markers — standalone icons (no circle plate). */
export const MARKER_ICONS = {
  cinema: "/markers/outline/cinema.png",
  "avocado-toast": "/markers/outline/avocado-toast.png",
  "coconut-drink": "/markers/outline/coconut-drink.png",
  arcade: "/markers/outline/arcade.png",
  dumplings: "/markers/outline/dumplings.png",
  sushi: "/markers/outline/sushi.png",
  keyboard: "/markers/outline/keyboard.png",
  "ice-cream": "/markers/outline/ice-cream.png",
  churros: "/markers/outline/churros.png",
  pho: "/markers/outline/pho.png",
  steak: "/markers/outline/steak.png",
  matcha: "/markers/outline/matcha.png",
} as const;

export type MarkerIconId = keyof typeof MARKER_ICONS;

/**
 * Pastel plates from Figma Key screens markers. `useMarkerPastel` samples the
 * emoji at runtime and supersedes these, so they act as the first-paint value.
 */
export const MARKER_PASTELS: Record<MarkerIconId, string> = {
  cinema: "#f8f1eb",
  "avocado-toast": "#ffeed1",
  "coconut-drink": "#f0ebd6",
  arcade: "#e7d4ff",
  dumplings: "#f9e8d9",
  sushi: "#ffebe3",
  keyboard: "#e8eef5",
  // Figma map frame 2969:14433 mini discs and pill containers.
  "ice-cream": "#ffe9fe",
  churros: "#fffee5",
  pho: "#fdffe2",
  // No Figma plate for these yet — seeded with the sampled pastel.
  steak: "#fff1e3",
  matcha: "#faffe3",
};

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
  "rappu-sushi": "sushi",
  "burnt-ends": "steak",
  "jumbo-seafood": "sushi",
  "shake-shack": "avocado-toast",
  "ion-orchard": "arcade",
  "national-gallery": "keyboard",
  "namnam-noodle-bar": "pho",
  // Minor map POIs get their own emoji so no two map discs repeat.
  tangs: "ice-cream",
  "wheelock-place": "churros",
  "shaw-centre": "matcha",
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

export function getMarkerIconId(
  placeId: string,
  category: string,
): MarkerIconId {
  return PLACE_ICON[placeId] ?? CATEGORY_ICON[category] ?? "sushi";
}

export function getMarkerIconPath(
  placeId: string,
  category: string,
): string {
  return MARKER_ICONS[getMarkerIconId(placeId, category)];
}

export function getMarkerPastel(src: string): string {
  const entry = Object.entries(MARKER_ICONS).find(([, path]) => path === src);
  if (entry) return MARKER_PASTELS[entry[0] as MarkerIconId];
  return "#ebebeb";
}
