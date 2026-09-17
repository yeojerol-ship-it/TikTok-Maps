/** Single POI focus during UI refinement. Expand list when ready. */
export const DEFAULT_MAP_PLACE_ID = "rappu-sushi";

/** POIs shown on the map — clustered near the default focus. */
export const FEATURED_MAP_PLACE_IDS = [
  "rappu-sushi",
  "ion-orchard",
  "burnt-ends",
  "dempsey-hill",
  "namnam-noodle-bar",
] as const;

/**
 * Secondary POIs drawn as small emoji discs. They expand into full pill
 * markers (avatars + labels) once the map is zoomed past MARKER_DETAIL_ZOOM.
 */
export const MINOR_MAP_PLACE_IDS = [
  "tangs",
  "wheelock-place",
  "shaw-centre",
] as const;

const MINOR_IDS = new Set<string>(MINOR_MAP_PLACE_IDS);

export function isMinorMapPlace(placeId: string): boolean {
  return MINOR_IDS.has(placeId);
}
