import type { Map as MapboxMap } from "mapbox-gl";

/** Published Mapbox style — jerolyeo/cmtub466s005c01qy1i96fo7u */
export const MAP_STYLE_URL =
  "mapbox://styles/jerolyeo/cmtub466s005c01qy1i96fo7u";

const BUILDINGS_LAYER_ID = "3d-buildings";

/** Bump-style perspective — tilted map with slight rotation. */
export const MAP_CAMERA = {
  bearing: -20,
  pitch: 48,
  zoom: 16.2,
  selectedZoom: 17.35,
} as const;

/** Slow orbit while a POI is selected. */
export const SELECTED_POI_CAMERA = {
  rotationDegreesPerSecond: 2.4,
  flyDurationMs: 780,
  returnDurationMs: 560,
} as const;

const STANDARD_BASEMAP_IMPORT_ID = "basemap";

/** Edit this to change 3D building color (Mapbox Standard + fallback layer). */
export const MAP_BUILDINGS_COLOR = "#e8e6e1";

/** Adds extruded buildings for the tilted Bump-style camera. */
export function enable3dBuildings(map: MapboxMap) {
  enableStandardStyle3dBuildings(map);
  enableComposite3dBuildings(map);
}

function enableStandardStyle3dBuildings(map: MapboxMap) {
  const style = map.getStyle();
  const hasStandardImport = style?.imports?.some(
    (entry) => entry.id === STANDARD_BASEMAP_IMPORT_ID,
  );
  if (!hasStandardImport) return;

  try {
    map.setConfigProperty(STANDARD_BASEMAP_IMPORT_ID, "show3dBuildings", true);
    map.setConfigProperty(STANDARD_BASEMAP_IMPORT_ID, "show3dObjects", true);
    map.setConfigProperty(
      STANDARD_BASEMAP_IMPORT_ID,
      "colorBuildings",
      MAP_BUILDINGS_COLOR,
    );
  } catch {
    /* config API unavailable for this style version */
  }
}

function enableComposite3dBuildings(map: MapboxMap) {
  if (map.getLayer(BUILDINGS_LAYER_ID)) return;

  const style = map.getStyle();
  if (!style?.sources?.composite) return;

  const labelLayerId = style.layers?.find(
    (layer) =>
      layer.type === "symbol" &&
      layer.layout &&
      "text-field" in layer.layout &&
      layer.layout["text-field"],
  )?.id;

  map.addLayer(
    {
      id: BUILDINGS_LAYER_ID,
      source: "composite",
      "source-layer": "building",
      filter: ["==", ["get", "extrude"], "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": MAP_BUILDINGS_COLOR,
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.72,
      },
    },
    labelLayerId,
  );
}
