"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
} from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import MapGL, { Marker, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  DEFAULT_MAP_PLACE_ID,
  isMinorMapPlace,
} from "@/data/featuredPlaces";
import { placeMap } from "@/data/places";
import { SINGAPORE_OVERVIEW_CAMERA } from "@/data/mapLocation";
import { PlaceInteraction, RankingMapAvatar, SocialPlace } from "@/lib/types";
import { getPlaceMarkerBubble } from "@/lib/selectors";
import {
  animate3dBuildings,
  MAP_CAMERA_2D,
  MAP_CAMERA_3D,
  MAP_STYLE_CONFIG,
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
  MINI_MARKER_LAYOUT_BOX,
  RANKING_AVATAR_LAYOUT_BOX,
  RANKING_CROWNED_AVATAR_LAYOUT_BOX,
  resolveMarkerOffsets,
  SELECTED_MARKER_FLY_OFFSET_Y,
  type MarkerLayoutItem,
} from "@/lib/markerLayout";
import { USER_LOCATION } from "@/data/userLocation";
import { MapNavBar } from "./MapNavBar";
import { RankingAvatarMarker } from "./RankingAvatarMarker";
import { SocialMarker } from "./SocialMarker";
import { UserLocationMarker } from "./UserLocationMarker";

const FOCUS_ZOOM = MAP_CAMERA_2D.zoom;
const SELECTED_ZOOM = MAP_CAMERA_3D.selectedZoom;
/** Past this zoom, secondary emoji discs expand into full pill markers. */
const MARKER_DETAIL_ZOOM = FOCUS_ZOOM + 0.6;
/** Matches BottomSheet collapsed snap height fraction. */
const COLLAPSED_SHEET_FRACTION = 0.32;

const MARKER_ENTER_STAGGER_MS = 40;
const MARKER_ENTER_DURATION_MS = 460;

const MARKER_ENTER_DONE_CLASS: Record<string, string> = {
  "map-marker-enter": "map-marker-enter--done",
  "map-ranking-avatar-enter": "map-ranking-avatar-enter--done",
  "map-comment-bubble-enter": "map-comment-bubble-enter--done",
};

function handleMarkerEnterAnimationEnd(
  event: AnimationEvent<HTMLDivElement>,
) {
  const doneClass = MARKER_ENTER_DONE_CLASS[event.animationName];
  if (!doneClass) return;
  event.currentTarget.classList.add(doneClass);
}

export interface SocialMapHandle {
  recenter: () => void;
}

type MapViewMode = "activities" | "ranking";

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
  viewMode?: MapViewMode;
  rankingAvatars?: RankingMapAvatar[];
  /** Hide markers during landing → map entry (before panel reveal). */
  suppressMarkers?: boolean;
  /** Trigger scale-pop enter animation after entry sequence. */
  triggerMarkerEnter?: boolean;
}

export const SocialMap = forwardRef<SocialMapHandle, SocialMapProps>(
  function SocialMap(
    {
      places,
      selectedPlaceId,
      onSelectPlace,
      onBack,
      reserveBottomSheet = true,
      viewMode = "activities",
      rankingAvatars = [],
      suppressMarkers = false,
      triggerMarkerEnter = false,
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
  const [rankingAvatarOffsets, setRankingAvatarOffsets] = useState<
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
  const wasRankingRef = useRef(false);
  const tabSwitchPendingRef = useRef(false);
  const poiClosePendingRef = useRef(false);
  const prevViewModeRef = useRef(viewMode);
  const prevSelectedPlaceIdRef = useRef<string | null>(selectedPlaceId);
  const prevMarkersHiddenRef = useRef(true);
  const [tabMarkersHidden, setTabMarkersHidden] = useState(false);
  const [tabMarkersEnterActive, setTabMarkersEnterActive] = useState(false);
  const [markerLoadOutKey, setMarkerLoadOutKey] = useState(0);
  const markersHidden = suppressMarkers || tabMarkersHidden;
  const markersEnterActive =
    (triggerMarkerEnter || tabMarkersEnterActive) && !markersHidden;

  const flyToOverview = useCallback(
    (duration = 0) => {
      mapRef.current?.flyTo({
        center: [
          SINGAPORE_OVERVIEW_CAMERA.longitude,
          SINGAPORE_OVERVIEW_CAMERA.latitude,
        ],
        zoom: SINGAPORE_OVERVIEW_CAMERA.zoom,
        bearing: MAP_CAMERA_2D.bearing,
        pitch: 0,
        offset: getMapFlyOffset(),
        duration: prefersReducedMotion() ? 0 : duration,
        essential: true,
      });
    },
    [getMapFlyOffset, prefersReducedMotion],
  );

  const isRankingView = viewMode === "ranking" && !selectedPlaceId;

  const updateRankingAvatarLayout = useCallback(() => {
    const map = mapRef.current?.getMap();
    const container = containerRef.current;
    if (!map || !container || !isRankingView || rankingAvatars.length === 0) {
      return;
    }

    const layoutItems: MarkerLayoutItem[] = rankingAvatars.map((avatar) => {
      const { x, y } = map.project([avatar.longitude, avatar.latitude]);
      return {
        id: avatar.id,
        x,
        y,
        priority: 100 - avatar.rank,
        box:
          avatar.rank <= 3
            ? RANKING_CROWNED_AVATAR_LAYOUT_BOX
            : RANKING_AVATAR_LAYOUT_BOX,
      };
    });

    const offsets = resolveMarkerOffsets(
      layoutItems,
      RANKING_CROWNED_AVATAR_LAYOUT_BOX,
      { width: container.clientWidth },
      "center",
      {
        iterations: Math.max(24, layoutItems.length * 8),
        separationBoost: 2,
      },
    );

    setRankingAvatarOffsets(offsets);
  }, [isRankingView, rankingAvatars]);

  const updateRankingAvatarLayoutRef = useRef(updateRankingAvatarLayout);
  updateRankingAvatarLayoutRef.current = updateRankingAvatarLayout;

  useEffect(() => {
    if (selectedPlaceId) {
      hasSelectedRef.current = true;
      setMarkerOffsets(new Map());
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        centerOnPlace(place, SELECTED_POI_CAMERA.flyDurationMs, SELECTED_ZOOM);
      }
      return;
    }

    if (viewMode === "ranking") {
      wasRankingRef.current = true;
      flyToOverview(SELECTED_POI_CAMERA.flyDurationMs);
      return;
    }

    if (reserveBottomSheet) {
      const duration = wasRankingRef.current
        ? SELECTED_POI_CAMERA.flyDurationMs
        : hasSelectedRef.current
          ? SELECTED_POI_CAMERA.returnDurationMs
          : 0;
      wasRankingRef.current = false;
      centerOnPlace(focusPlace, duration, FOCUS_ZOOM);
    }
  }, [
    centerOnPlace,
    flyToOverview,
    focusPlace,
    places,
    reserveBottomSheet,
    selectedPlaceId,
    viewMode,
  ]);

  useEffect(() => {
    if (!isRankingView) {
      setRankingAvatarOffsets(new Map());
      return;
    }

    const map = mapRef.current?.getMap();
    if (!map) return;

    const layout = () => {
      window.requestAnimationFrame(() => {
        updateRankingAvatarLayoutRef.current();
      });
    };

    if (map.isMoving()) {
      map.once("moveend", layout);
      return () => {
        map.off("moveend", layout);
      };
    }

    layout();
  }, [isRankingView, rankingAvatars]);

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

      // Rotate around the POI — do not re-solve center+offset each frame.
      // Offset recalculation rounds projected Y to whole pixels and bobbles
      // the selected marker when the anchor straddles a pixel boundary.
      map.easeTo({
        around: [place.longitude, place.latitude],
        bearing,
        pitch: MAP_CAMERA_3D.pitch,
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
  }, [places, prefersReducedMotion, selectedPlaceId]);

  const displayedPlaces = useMemo(() => {
    if (viewMode === "ranking") return [];
    if (selectedPlaceId) {
      return places.filter((place) => place.id === selectedPlaceId);
    }
    return places;
  }, [places, selectedPlaceId, viewMode]);

  const updateVisiblePlaces = useCallback(() => {
    const map = mapRef.current?.getMap();
    const container = containerRef.current;
    if (!map || !container) return;

    // Map move/rotate already repositions anchored markers every frame. Pushing
    // fresh Set/Map state here during POI selection fights Mapbox and bobbles.
    if (selectedPlaceId || viewMode === "ranking") return;

    setMapZoom(map.getZoom());

    const bounds = map.getBounds();
    if (!bounds) return;

    const bottomPanelFraction = reserveBottomSheet
      ? COLLAPSED_SHEET_FRACTION
      : 0;
    const maxY = container.clientHeight * (1 - bottomPanelFraction);
    const next = new Set<string>();

    const zoom = map.getZoom();
    const detailed = zoom >= FOCUS_ZOOM;
    const expandMinor = zoom >= MARKER_DETAIL_ZOOM;
    const layoutItems: MarkerLayoutItem[] = [];

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
          box:
            isMinorMapPlace(place.id) && !expandMinor
              ? MINI_MARKER_LAYOUT_BOX
              : undefined,
        });
      }
    }

    const offsets = resolveMarkerOffsets(
      layoutItems,
      detailed ? DETAILED_MARKER_LAYOUT_BOX : COMPACT_MARKER_LAYOUT_BOX,
      { width: container.clientWidth },
    );

    setVisiblePlaceIds(next);
    setMarkerOffsets(offsets);
  }, [places, reserveBottomSheet, selectedPlaceId, viewMode]);

  const updateVisiblePlacesRef = useRef(updateVisiblePlaces);
  updateVisiblePlacesRef.current = updateVisiblePlaces;

  const revealActivityMarkers = useCallback(() => {
    updateVisiblePlacesRef.current();
    window.requestAnimationFrame(() => {
      setTabMarkersHidden(false);
      setTabMarkersEnterActive(true);
    });
  }, []);

  useEffect(() => {
    const wasHidden = prevMarkersHiddenRef.current;
    prevMarkersHiddenRef.current = markersHidden;
    if (wasHidden && !markersHidden && markersEnterActive) {
      setMarkerLoadOutKey((key) => key + 1);
    }
  }, [markersEnterActive, markersHidden]);

  useEffect(() => {
    const prevViewMode = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;

    if (selectedPlaceId || prevViewMode === viewMode) return;

    tabSwitchPendingRef.current = true;
    setTabMarkersEnterActive(false);
    setTabMarkersHidden(true);

    const map = mapRef.current?.getMap();
    if (!map) {
      tabSwitchPendingRef.current = false;
      setTabMarkersHidden(false);
      return;
    }

    const revealMarkers = () => {
      if (!tabSwitchPendingRef.current) return;
      tabSwitchPendingRef.current = false;
      updateRankingAvatarLayoutRef.current();
      revealActivityMarkers();
    };

    if (prefersReducedMotion() || !map.isMoving()) {
      revealMarkers();
      return;
    }

    map.once("moveend", revealMarkers);
    return () => {
      map.off("moveend", revealMarkers);
    };
  }, [prefersReducedMotion, revealActivityMarkers, selectedPlaceId, viewMode]);

  useEffect(() => {
    const prevSelectedPlaceId = prevSelectedPlaceIdRef.current;
    prevSelectedPlaceIdRef.current = selectedPlaceId;

    if (selectedPlaceId || !prevSelectedPlaceId || viewMode === "ranking") {
      return;
    }

    poiClosePendingRef.current = true;
    setTabMarkersEnterActive(false);
    setTabMarkersHidden(true);

    const map = mapRef.current?.getMap();
    if (!map) {
      poiClosePendingRef.current = false;
      setTabMarkersHidden(false);
      return;
    }

    const revealMarkers = () => {
      if (!poiClosePendingRef.current) return;
      poiClosePendingRef.current = false;
      revealActivityMarkers();
    };

    if (prefersReducedMotion() || !map.isMoving()) {
      revealMarkers();
      return;
    }

    map.once("moveend", revealMarkers);
    return () => {
      poiClosePendingRef.current = false;
      map.off("moveend", revealMarkers);
    };
  }, [
    prefersReducedMotion,
    revealActivityMarkers,
    selectedPlaceId,
    viewMode,
  ]);

  const scheduleVisiblePlacesUpdate = useCallback(() => {
    if (selectedPlaceId || viewMode === "ranking") return;
    if (moveFrameRef.current !== null) return;
    moveFrameRef.current = window.requestAnimationFrame(() => {
      moveFrameRef.current = null;
      updateVisiblePlaces();
    });
  }, [selectedPlaceId, updateVisiblePlaces, viewMode]);

  const handleMapLoad = useCallback(
    (event: { target: MapboxMap }) => {
      const map = event.target;
      // Config already disables 3D at construction; reinforce once (not on
      // styledata — that loop blanks the map / kills POI buildings).
      setup2dMap(map);
      centerOnFocus();
      updateVisiblePlaces();
      map.on("move", scheduleVisiblePlacesUpdate);
      map.on("moveend", () => {
        updateVisiblePlaces();
        updateRankingAvatarLayoutRef.current();
      });
      map.on("resize", () => {
        updateVisiblePlaces();
        updateRankingAvatarLayoutRef.current();
      });
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

    let frame: number | null = null;
    const resize = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        mapRef.current?.resize();
        updateVisiblePlaces();
      });
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [updateVisiblePlaces]);

  const activityMarkerEnterCount =
    !isRankingView && !selectedPlaceId ? displayedPlaces.length : 0;
  const inActivityEnterSequence =
    !selectedPlaceId &&
    !isRankingView &&
    (triggerMarkerEnter || tabMarkersEnterActive);
  const commentBubblePopDelayMs =
    inActivityEnterSequence && activityMarkerEnterCount > 0
      ? (activityMarkerEnterCount - 1) * MARKER_ENTER_STAGGER_MS +
        MARKER_ENTER_DURATION_MS
      : undefined;

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
        attributionControl={false}
        maxTileCacheSize={50}
        // Needed so Figma html-to-design can serialize the WebGL basemap as PNG.
        preserveDrawingBuffer
        onLoad={handleMapLoad}
        {...({
          // Disable Standard 3D before first paint — zoom ~16 extrusions can
          // OOM ("Array buffer allocation failed") and blank the basemap.
          // react-map-gl Map props omit `config` in typings; Mapbox accepts it.
          config: MAP_STYLE_CONFIG,
        } as object)}
      >
        {isRankingView
          ? rankingAvatars.map((avatar, index) => {
              const offset = rankingAvatarOffsets.get(avatar.id);
              return (
              <Marker
                key={avatar.id}
                latitude={avatar.latitude}
                longitude={avatar.longitude}
                anchor="center"
                offset={offset ? [offset.x, offset.y] : undefined}
                style={{ zIndex: 12 - avatar.rank }}
              >
                <div
                  className={
                    markersHidden
                      ? "map-ranking-avatar-enter--hidden"
                      : markersEnterActive
                        ? "map-ranking-avatar-enter"
                        : undefined
                  }
                  style={
                    markersEnterActive && !markersHidden
                      ? { animationDelay: `${index * 40}ms` }
                      : undefined
                  }
                  onAnimationEnd={handleMarkerEnterAnimationEnd}
                >
                  <RankingAvatarMarker
                    user={avatar.user}
                    rank={avatar.rank}
                    isCurrentUser={avatar.isCurrentUser}
                  />
                </div>
              </Marker>
            );
            })
          : null}
        {displayedPlaces.map((place, index) => {
          const offset = markerOffsets.get(place.id);
          const isSelected = selectedPlaceId === place.id;
          const inView = isSelected || visiblePlaceIds.has(place.id);
          const compact = !showDetailedMarkers || isSelected;
          const mini =
            !isSelected &&
            isMinorMapPlace(place.id) &&
            mapZoom < MARKER_DETAIL_ZOOM;
          const bubble = getPlaceMarkerBubble(place.id);
          const hasCommentBubble =
            !isSelected &&
            bubble?.mode === "single" &&
            Boolean(bubble.thought.comment);
          const markerZIndex = isSelected ? 5 : hasCommentBubble ? 3 : 1;
          const animateTabSwitch = !selectedPlaceId;
          const markerEnterDelayMs =
            animateTabSwitch && markersEnterActive && !markersHidden
              ? index * MARKER_ENTER_STAGGER_MS
              : 0;
          const deferCommentBubble =
            place.id === DEFAULT_MAP_PLACE_ID &&
            hasCommentBubble &&
            animateTabSwitch &&
            commentBubblePopDelayMs !== undefined;
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
            style={{ zIndex: markerZIndex }}
          >
            <div
              key={
                animateTabSwitch && markersEnterActive
                  ? `marker-enter-${markerLoadOutKey}`
                  : undefined
              }
              className={
                animateTabSwitch
                  ? markersHidden
                    ? "map-ranking-avatar-enter--hidden map-marker-enter--anchor-bottom"
                    : markersEnterActive
                      ? "map-ranking-avatar-enter map-marker-enter--anchor-bottom"
                      : undefined
                  : undefined
              }
              style={
                markerEnterDelayMs > 0
                  ? { animationDelay: `${markerEnterDelayMs}ms` }
                  : undefined
              }
              onAnimationEnd={handleMarkerEnterAnimationEnd}
            >
              <SocialMarker
                place={place}
                selected={isSelected}
                inView={inView}
                compact={compact}
                variant={mini ? "mini" : "full"}
                suppressCommentBubble={deferCommentBubble && markersHidden}
                commentBubblePopDelayMs={
                  deferCommentBubble && !markersHidden
                    ? commentBubblePopDelayMs
                    : undefined
                }
                commentBubbleLoadOutKey={
                  deferCommentBubble ? markerLoadOutKey : undefined
                }
                onClick={() => handleSelect(place)}
              />
            </div>
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
