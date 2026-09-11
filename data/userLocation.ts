import { placeMap } from "./places";

const EARTH_RADIUS_M = 6_371_000;

/** Walking offset from Rappu (latteria-mozzarella) — mock “you are here”. */
export const USER_TO_LATTERIA_METERS = 63;
/** SSE of the POI so the puck sits in the pitched-camera foreground. */
export const USER_FROM_LATTERIA_BEARING_DEG = 160;

function destinationPoint(
  origin: { latitude: number; longitude: number },
  distanceM: number,
  bearingDeg: number,
) {
  const angularDistance = distanceM / EARTH_RADIUS_M;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.latitude * Math.PI) / 180;
  const lng1 = (origin.longitude * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lng2 * 180) / Math.PI,
  };
}

const latteria = placeMap["latteria-mozzarella"];

export const USER_LOCATION = destinationPoint(
  latteria,
  USER_TO_LATTERIA_METERS,
  USER_FROM_LATTERIA_BEARING_DEG,
);
