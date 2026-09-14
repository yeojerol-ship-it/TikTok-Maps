"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import MapGL, { Marker, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DEFAULT_MAP_PLACE_ID } from "@/data/featuredPlaces";
import { placeMap } from "@/data/places";
import { PlaceInteraction, SocialPlace } from "@/lib/types";
import { getPlaceMarkerBubble } from "@/lib/selectors";
import {
  animate3dBuildings,
  MAP_CAMERA_2D,
  MAP_CAMERA_3D,
  MAP_STYLE_URL,
  SELECTED_POI_CAMERA,
  setup2dMap,
} from "@/lib/mapStyle";
import {
  getMapCenterOffsetForBottomPanel,
  PLACE_PANEL_REST_HEIGHT_FRACTION,
} from "@/lib/poiPanelLayout";
import {
  COMPACT_MARKER_LAYOUT_BOX,
  DETAILED_MARKER_LAYOUT_BOX,
  resolveMarkerOffsets,
  SELECTED_MARKER_FLY_OFFSET_Y,
} from "@/lib/markerLayout";
import { USER_LOCATION } from "@/data/userLocation";
import { MapNavBar } from "./MapNavBar";
import { SocialMarker } from "./SocialMarker";
import { UserLocationMarker } from "./UserLocationMarker";

const FOCUS_ZOOM = MAP_CAMERA_2D.zoom;
const SELECTED_ZOOM = MAP_CAMERA_3D.selectedZoom;
/** Matches BottomSheet collapsed snap height fraction. */
const COLLAPSED_SHEET_FRACTION = 0.32;

export interface SocialMapHandle {
  recenter: () => void;
}

interface SocialMapProps {
  places: SocialPlace[];
  selectedPlaceId: string | null;
  onSelectPlace: (
    place: SocialPlace,
    markerThought?: PlaceInteraction,
  ) => void;
  onBack?: () => void;
  /** Offset map centering for the collapsed bottom sheet. */
  reserveBottomSheet?: boolean;
}

export const SocialMap = forwardRef<SocialMapHandle, SocialMapProps>(
  function SocialMap(
    {
      places,
      selectedPlaceId,
      onSelectPlace,
      onBack,
      reserveBottomSheet = true,
    },
    ref,
  ) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const moveFrameRef = useRef<number | null>(null);
  const rotationFrameRef = useRef<number | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [visiblePlaceIds, setVisiblePlaceIds] = useState<Set<string>>(
    () => new Set([DEFAULT_MAP_PLACE_ID]),
  );
  const [markerOffsets, setMarkerOffsets] = useState<
    Map<string, { x: number; y: number }>
  >(() => new Map());
  const [mapZoom, setMapZoom] = useState<number>(FOCUS_ZOOM);
  const showDetailedMarkers = mapZoom >= FOCUS_ZOOM;

  const focusPlace = useMemo(
    () => placeMap[DEFAULT_MAP_PLACE_ID],
    [],
  );

  const initialViewState = useMemo(
    () => ({
      latitude: focusPlace.latitude,
      longitude: focusPlace.longitude,
      zoom: FOCUS_ZOOM,
      bearing: MAP_CAMERA_2D.bearing,
      pitch: MAP_CAMERA_2D.pitch,
    }),
    [focusPlace],
  );

  const mapPitch = selectedPlaceId ? MAP_CAMERA_3D.pitch : MAP_CAMERA_2D.pitch;
  const mapBearing = selectedPlaceId
    ? MAP_CAMERA_3D.bearing
    : MAP_CAMERA_2D.bearing;

  const getMapFlyOffset = useCallback((): [number, number] => {
    const containerHeight = containerRef.current?.clientHeight ?? 844;
    const panelFraction = selectedPlaceId
      ? PLACE_PANEL_REST_HEIGHT_FRACTION
      : reserveBottomSheet
        ? COLLAPSED_SHEET_FRACTION
        : 0;

    const panelOffsetY =
      panelFraction === 0
        ? 0
        : getMapCenterOffsetForBottomPanel(containerHeight, panelFraction);

    const markerOffsetY = selectedPlaceId ? SELECTED_MARKER_FLY_OFFSET_Y : 0;

    return [0, panelOffsetY + markerOffsetY];
  }, [reserveBottomSheet, selectedPlaceId]);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const centerOnPlace = useCallback(
    (
      place: { longitude: number; latitude: number },
      duration = 0,
      zoom: number = FOCUS_ZOOM,
    ) => {
      mapRef.current?.flyTo({
        center: [place.longitude, place.latitude],
        zoom,
        bearing: mapBearing,
        pitch: mapPitch,
        offset: getMapFlyOffset(),
        duration: prefersReducedMotion() ? 0 : duration,
        essential: true,
      });
    },
    [getMapFlyOffset, mapBearing, mapPitch, prefersReducedMotion],
  );

  const centerOnFocus = useCallback(() => {
    centerOnPlace(focusPlace, 0);
  }, [centerOnPlace, focusPlace]);

  useImperativeHandle(ref, () => ({ recenter: centerOnFocus }), [centerOnFocus]);

  const hasSelectedRef = useRef(false);

  useEffect(() => {
    if (selectedPlaceId) {
      hasSelectedRef.current = true;
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        centerOnPlace(place, SELECTED_POI_CAMERA.flyDurationMs, SELECTED_ZOOM);
      }
      return;
    }

    if (reserveBottomSheet) {
      const duration = hasSelectedRef.current
        ? SELECTED_POI_CAMERA.returnDurationMs
        : 0;
      centerOnPlace(focusPlace, duration, FOCUS_ZOOM);
    }
  }, [
    centerOnPlace,
    focusPlace,
    places,
    reserveBottomSheet,
    selectedPlaceId,
  ]);

  useEffect(() => {
    if (!selectedPlaceId) return;
    if (prefersReducedMotion()) return;

    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;

    let active = true;
    let lastTime = performance.now();
    let bearing: number = MAP_CAMERA_3D.bearing;

    const stopRotation = () => {
      active = false;
      if (rotationFrameRef.current !== null) {
        cancelAnimationFrame(rotationFrameRef.current);
        rotationFrameRef.current = null;
      }
    };

    const rotate = (now: number) => {
      if (!active) return;

      const map = mapRef.current?.getMap();
      if (!map) {
        stopRotation();
        return;
      }

      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;
      bearing += SELECTED_POI_CAMERA.rotationDegreesPerSecond * deltaSeconds;

      map.easeTo({
        center: [place.longitude, place.latitude],
        zoom: SELECTED_ZOOM,
        bearing,
        pitch: MAP_CAMERA_3D.pitch,
        offset: getMapFlyOffset(),
        duration: 0,
        essential: true,
      });

      rotationFrameRef.current = requestAnimationFrame(rotate);
    };

    const startRotation = () => {
      const map = mapRef.current?.getMap();
      if (!map || !active) return;
      bearing = map.getBearing();
      lastTime = performance.now();
      rotationFrameRef.current = requestAnimationFrame(rotate);
    };

    const map = mapRef.current?.getMap();
    if (map?.isMoving()) {
      map.once("moveend", startRotation);
    } else {
      startRotation();
    }

    return () => {
      stopRotation();
      map?.off("moveend", startRotation);
    };
  }, [getMapFlyOffset, places, prefersReducedMotion, selectedPlaceId]);

  const displayedPlaces = useMemo(() => {
    if (selectedPlaceId) {
      return places.filter((place) => place.id === selectedPlaceId);
    }
    return places;
  }, [places, selectedPlaceId]);

  const updateVisiblePlaces = useCallback(() => {
    const map = mapRef.current?.getMap();
    const container = containerRef.current;
    if (!map || !container) return;

    setMapZoom(map.getZoom());

    if (selectedPlaceId) {
      setVisiblePlaceIds(new Set([selectedPlaceId]));
      setMarkerOffsets(new Map());
      return;
    }

    const bounds = map.getBounds();
    if (!bounds) return;

    const bottomPanelFraction = reserveBottomSheet
      ? COLLAPSED_SHEET_FRACTION
      : 0;
    const maxY = container.clientHeight * (1 - bottomPanelFraction);
    const next = new Set<string>();

    const layoutItems: {
      id: string;
      x: number;
      y: number;
      priority: number;
    }[] = [];

    for (const place of places) {
      if (!bounds.contains([place.longitude, place.latitude])) continue;

      const { x, y } = map.project([place.longitude, place.latitude]);
      if (x >= 0 && x <= container.clientWidth && y >= 0 && y <= maxY) {
        next.add(place.id);
        layoutItems.push({
          id: place.id,
          x,
          y,
          priority: place.id === DEFAULT_MAP_PLACE_ID ? 10 : 1,
        });
      }
    }

    const zoom = map.getZoom();
    const detailed = zoom >= FOCUS_ZOOM;
    const offsets = resolveMarkerOffsets(
      layoutItems,
      detailed ? DETAILED_MARKER_LAYOUT_BOX : COMPACT_MARKER_LAYOUT_BOX,
    );

    setVisiblePlaceIds(next);
    setMarkerOffsets(offsets);
  }, [places, reserveBottomSheet, selectedPlaceId]);

  const scheduleVisiblePlacesUpdate = useCallback(() => {
    if (moveFrameRef.current !== null) return;
    moveFrameRef.current = window.requestAnimationFrame(() => {
      moveFrameRef.current = null;
      updateVisiblePlaces();
    });
  }, [updateVisiblePlaces]);

  const handleMapLoad = useCallback(
    (event: { target: MapboxMap }) => {
      const map = event.target;
      setup2dMap(map);
      map.on("styledata", () => setup2dMap(map));
      centerOnFocus();
      updateVisiblePlaces();
      map.on("move", scheduleVisiblePlacesUpdate);
      map.on("moveend", updateVisiblePlaces);
      map.on("resize", updateVisiblePlaces);
    },
    [centerOnFocus, scheduleVisiblePlacesUpdate, updateVisiblePlaces],
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const duration = prefersReducedMotion()
      ? 0
      : selectedPlaceId
        ? SELECTED_POI_CAMERA.buildingsDurationMs
        : SELECTED_POI_CAMERA.returnDurationMs;

    animate3dBuildings(map, Boolean(selectedPlaceId), duration);
  }, [prefersReducedMotion, selectedPlaceId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => {
      mapRef.current?.resize();
      updateVisiblePlaces();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateVisiblePlaces]);

  const handleSelect = useCallback(
    (place: SocialPlace) => {
      const bubble = getPlaceMarkerBubble(place.id);
      const markerThought =
        bubble?.mode === "single" ? bubble.thought : undefined;
      onSelectPlace(place, markerThought);
    },
    [onSelectPlace],
  );

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#f5f5f7] p-6 text-center">
        <p className="tux-h3-semi">Mapbox token required</p>
        <p className="tux-p2 mt-2 text-muted">
          Add <code className="rounded bg-border px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
          <code className="rounded bg-border px-1">.env.local</code>
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%" }}
        antialias
        attributionControl={false}
        onLoad={handleMapLoad}
      >
        {displayedPlaces.map((place) => {
          const offset = markerOffsets.get(place.id);
          const isSelected = selectedPlaceId === place.id;
          const inView = isSelected || visiblePlaceIds.has(place.id);
          const compact = !showDetailedMarkers || isSelected;
          return (
          <Marker
            key={place.id}
            latitude={place.latitude}
            longitude={place.longitude}
            anchor="bottom"
            offset={
              isSelected
                ? undefined
                : offset
                  ? [offset.x, offset.y]
                  : undefined
            }
            style={{ zIndex: isSelected ? 3 : 1 }}
          >
            <SocialMarker
              place={place}
              selected={isSelected}
              inView={inView}
              compact={compact}
              onClick={() => handleSelect(place)}
            />
          </Marker>
          );
        })}
        <Marker
          latitude={USER_LOCATION.latitude}
          longitude={USER_LOCATION.longitude}
          anchor="center"
          style={{ zIndex: 4 }}
        >
          <UserLocationMarker />
        </Marker>
      </MapGL>
      <MapNavBar />
    </div>
  );
},
);
