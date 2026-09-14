import type { Expression, Map as MapboxMap } from "mapbox-gl";

/** Published Mapbox style — jerolyeo/cmtub466s005c01qy1i96fo7u */
export const MAP_STYLE_URL =
  "mapbox://styles/jerolyeo/cmtub466s005c01qy1i96fo7u";

/** Initial Standard basemap config — keep 3D off until a POI is selected. */
export const MAP_STYLE_CONFIG = {
  basemap: {
    show3dBuildings: false,
    show3dObjects: false,
  },
} as const;

const BUILDINGS_LAYER_ID = "3d-buildings";

/** Default map — flat top-down before a POI is opened. */
export const MAP_CAMERA_2D = {
  bearing: -20,
  pitch: 0,
  zoom: 16.2,
  selectedZoom: 17.35,
} as const;

/** Selected POI — tilted perspective with extruded buildings. */
export const MAP_CAMERA_3D = {
  bearing: -20,
  pitch: 48,
  zoom: 16.2,
  selectedZoom: 17.35,
} as const;

/** @deprecated Use MAP_CAMERA_2D / MAP_CAMERA_3D */
export const MAP_CAMERA = MAP_CAMERA_3D;

/** Slow orbit while a POI is selected. */
export const SELECTED_POI_CAMERA = {
  rotationDegreesPerSecond: 2.4,
  flyDurationMs: 780,
  returnDurationMs: 560,
  buildingsDurationMs: 900,
} as const;

const STANDARD_BASEMAP_IMPORT_ID = "basemap";

/** Edit this to change 3D building color (Mapbox Standard + fallback layer). */
export const MAP_BUILDINGS_COLOR = "#e8e6e1";

const BUILDINGS_HEIGHT_EXPRESSION: Expression = [
  "interpolate",
  ["linear"],
  ["zoom"],
  15,
  0,
  15.05,
  ["get", "height"],
];

const BUILDINGS_BASE_EXPRESSION: Expression = [
  "interpolate",
  ["linear"],
  ["zoom"],
  15,
  0,
  15.05,
  ["get", "min_height"],
];

/** Flat map on load — buildings layer exists but extruded height stays at zero. */
export function setup2dMap(map: MapboxMap) {
  setStandard3dBuildingsVisible(map, false);
  // Only add a composite fill-extrusion fallback when the style is NOT
  // Mapbox Standard. Mixing streets-v8 / composite extrusions into Standard
  // has blanked this map before and can explode WebGL buffers.
  const style = map.getStyle();
  const hasStandardImport = style?.imports?.some(
    (entry) => entry.id === STANDARD_BASEMAP_IMPORT_ID,
  );
  if (!hasStandardImport) {
    ensureComposite3dBuildingsLayer(map, { extruded: false });
  }
}

/** Animate extruded buildings in or out when a POI is opened / closed. */
export function animate3dBuildings(
  map: MapboxMap,
  visible: boolean,
  duration: number = SELECTED_POI_CAMERA.buildingsDurationMs,
) {
  setStandard3dBuildingsVisible(map, visible);

  const style = map.getStyle();
  const hasStandardImport = style?.imports?.some(
    (entry) => entry.id === STANDARD_BASEMAP_IMPORT_ID,
  );
  if (!hasStandardImport) {
    ensureComposite3dBuildingsLayer(map, { extruded: false });
  }

  if (!map.getLayer(BUILDINGS_LAYER_ID)) return;

  const transition = { duration, delay: visible ? 140 : 0 };

  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-height-transition",
    transition,
  );
  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-base-transition",
    transition,
  );
  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-opacity-transition",
    transition,
  );

  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-height",
    visible ? BUILDINGS_HEIGHT_EXPRESSION : 0,
  );
  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-base",
    visible ? BUILDINGS_BASE_EXPRESSION : 0,
  );
  map.setPaintProperty(
    BUILDINGS_LAYER_ID,
    "fill-extrusion-opacity",
    visible ? 0.72 : 0,
  );
}

function setStandard3dBuildingsVisible(map: MapboxMap, visible: boolean) {
  const style = map.getStyle();
  const hasStandardImport = style?.imports?.some(
    (entry) => entry.id === STANDARD_BASEMAP_IMPORT_ID,
  );
  if (!hasStandardImport) return;

  try {
    // Skip no-op config writes — each setConfigProperty can reload Standard
    // style data and thrash WebGL buffers if called in a loop.
    const currentBuildings = map.getConfigProperty(
      STANDARD_BASEMAP_IMPORT_ID,
      "show3dBuildings",
    );
    const currentObjects = map.getConfigProperty(
      STANDARD_BASEMAP_IMPORT_ID,
      "show3dObjects",
    );

    if (currentBuildings !== visible) {
      map.setConfigProperty(
        STANDARD_BASEMAP_IMPORT_ID,
        "show3dBuildings",
        visible,
      );
    }
    if (currentObjects !== visible) {
      map.setConfigProperty(
        STANDARD_BASEMAP_IMPORT_ID,
        "show3dObjects",
        visible,
      );
    }
    if (visible) {
      map.setConfigProperty(
        STANDARD_BASEMAP_IMPORT_ID,
        "colorBuildings",
        MAP_BUILDINGS_COLOR,
      );
    }
  } catch {
    /* config API unavailable for this style version */
  }
}

function ensureComposite3dBuildingsLayer(
  map: MapboxMap,
  { extruded }: { extruded: boolean },
) {
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
        "fill-extrusion-height": extruded ? BUILDINGS_HEIGHT_EXPRESSION : 0,
        "fill-extrusion-base": extruded ? BUILDINGS_BASE_EXPRESSION : 0,
        "fill-extrusion-opacity": extruded ? 0.72 : 0,
      },
    },
    labelLayerId,
  );
}
