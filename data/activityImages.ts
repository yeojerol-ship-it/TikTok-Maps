/** Place photos shown in activity feed (Threads-style scroll). */
export const PLACE_ACTIVITY_IMAGES: Record<string, string[]> = {
  "common-man-coffee": [
    "/activity/places/place-1.png",
    "/activity/places/place-2.png",
  ],
  "gardens-by-the-bay": ["/activity/places/place-3.png"],
  "latteria-mozzarella": [
    "/activity/places/place-4.png",
    "/activity/places/place-1.png",
  ],
  "burnt-ends": ["/activity/places/place-2.png"],
  "hawker-chan": ["/activity/places/place-3.png", "/activity/places/place-4.png"],
  "marina-bay-sands": ["/activity/places/place-1.png"],
  "swee-choon": ["/activity/places/place-2.png", "/activity/places/place-3.png"],
  "lau-pa-sat": ["/activity/places/place-4.png"],
};

/** Per-post images when a friend review needs its own gallery. */
export const INTERACTION_ACTIVITY_IMAGES: Record<string, string[]> = {
  i13: ["/activity/places/place-4.png", "/activity/places/place-1.png"],
  i15: ["/activity/places/place-2.png", "/activity/places/place-3.png"],
};

export function getPlaceActivityImages(placeId: string): string[] {
  return PLACE_ACTIVITY_IMAGES[placeId] ?? [];
}

export function getInteractionActivityImages(
  interactionId: string,
  placeId: string,
): string[] {
  return (
    INTERACTION_ACTIVITY_IMAGES[interactionId] ??
    getPlaceActivityImages(placeId)
  );
}
