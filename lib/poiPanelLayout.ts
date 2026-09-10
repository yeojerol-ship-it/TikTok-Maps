/** Visible map centering + compass position when the POI panel is open. */
export const POI_PANEL_HEIGHT_FRACTION = 0.58;
export const POI_PANEL_MAX_HEIGHT_FRACTION = 0.68;
export const POI_PANEL_HEIGHT = `${POI_PANEL_HEIGHT_FRACTION * 100}%`;
/** Resting POI card height — compass / ranking pill pin here and do not follow expand. */
export const PLACE_PANEL_REST_HEIGHT_FRACTION = POI_PANEL_MAX_HEIGHT_FRACTION;
export const PLACE_PANEL_EXPANDED_HEIGHT_FRACTION = 0.95;
/** Compass offset from viewport bottom — matches panel min height. */
export const POI_PANEL_COMPASS_BOTTOM = POI_PANEL_HEIGHT;
export const POI_PANEL_COMPASS_GAP_PX = 12;

/** Mapbox flyTo offset — places lng/lat in the vertical center of map above the panel. */
export function getMapCenterOffsetForBottomPanel(
  containerHeight: number,
  panelFraction: number,
): number {
  return -(containerHeight * panelFraction) / 2;
}
