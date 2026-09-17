import { USER_LOCATION } from "./userLocation";

/** City header shown above the map (Figma node 2969:18752). */
export const MAP_CITY_NAME = "Osaka City";

/** Zoomed-out island view used on the Ranking tab — anchored on the user puck. */
export const SINGAPORE_OVERVIEW_CAMERA = {
  latitude: USER_LOCATION.latitude,
  longitude: USER_LOCATION.longitude,
  zoom: 11.3,
} as const;
