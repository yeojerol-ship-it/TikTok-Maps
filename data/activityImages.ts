/** Place photos shown in activity feed (Threads-style scroll). */
export const PLACE_ACTIVITY_IMAGES: Record<string, string[]> = {
  "common-man-coffee": [
    "/reviews/cocktail-orange.jpg",
    "/reviews/handroll-chili.jpg",
  ],
  "gardens-by-the-bay": ["/activity/places/place-3.png"],
  "rappu-sushi": [
    "/reviews/beef-tartare.jpg",
    "/reviews/appetizers-platter.jpg",
    "/reviews/sea-grapes-bowl.jpg",
  ],
  "burnt-ends": ["/activity/places/place-2.png"],
  "hawker-chan": [
    "/reviews/salmon-tempura-handroll.jpg",
    "/reviews/sushi-appetizer.jpg",
    "/reviews/handrolls-green-plate.jpg",
  ],
  "marina-bay-sands": ["/activity/places/place-1.png"],
  "swee-choon": ["/activity/places/place-2.png", "/activity/places/place-3.png"],
  "lau-pa-sat": ["/activity/places/place-4.png"],
  "ion-orchard": ["/activity/places/place-1.png", "/activity/places/place-3.png"],
};

/** Per-post images when a friend review needs its own gallery. */
export const INTERACTION_ACTIVITY_IMAGES: Record<string, string[]> = {
  i13: [
    "/reviews/beef-tartare.jpg",
    "/reviews/appetizers-platter.jpg",
    "/reviews/sea-grapes-bowl.jpg",
  ],
  i15: [
    "/reviews/sushi-appetizer.jpg",
    "/reviews/handrolls-green-plate.jpg",
    "/reviews/salmon-tempura-handroll.jpg",
  ],
  i60: [
    "/reviews/beef-tartare.jpg",
    "/reviews/appetizers-platter.jpg",
    "/reviews/sea-grapes-bowl.jpg",
  ],
  i62: [
    "/reviews/beef-tartare.jpg",
    "/reviews/appetizers-platter.jpg",
    "/reviews/sea-grapes-bowl.jpg",
  ],
  i24r: ["/activity/places/place-1.png", "/activity/places/place-3.png"],
  i25r: ["/activity/places/place-2.png", "/activity/places/place-4.png"],
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
