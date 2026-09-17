"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ActivityItem,
  PlaceInteraction,
  SheetSnap,
  SheetTab,
  SocialPlace,
} from "@/lib/types";
import {
  getActivityFeed,
  getDefaultMapActivityFeed,
  getMapPlaces,
  getNewMapActivityCount,
  getRanking,
  getRankingMapAvatars,
  getSocialPlaces,
} from "@/lib/selectors";
import {
  BottomSheet,
  SHEET_SNAP_FRACTIONS,
} from "@/components/BottomSheet/BottomSheet";
import {
  SheetTabs,
  SHEET_TABS_BODY_RADIUS,
} from "@/components/BottomSheet/SheetTabs";
import { MAP_CITY_NAME } from "@/data/mapLocation";
import { ActivityFeed } from "@/components/Activity/ActivityFeed";
import { Ranking } from "@/components/Ranking/Ranking";
import { RankingBar } from "@/components/Ranking/RankingBar";
import { PlacePanel } from "@/components/Place/PlacePanel";
import { AnimatedSubtitle } from "@/components/Map/AnimatedSubtitle";
import { MapCompass } from "@/components/Map/MapCompass";
import {
  PLACE_PANEL_REST_HEIGHT_FRACTION,
  POI_PANEL_COMPASS_GAP_PX,
} from "@/lib/poiPanelLayout";

const SocialMap = dynamic(
  () =>
    import("@/components/Map/SocialMap").then((m) => m.SocialMap),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#e8e8ea]" />,
  },
);

function IconClose() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M3 3L11 11M11 3L3 11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Landing → map horizontal slide (matches `.app-screen` transition). */
const MAP_SCREEN_SLIDE_MS = 320;

interface SocialMapAppProps {
  /** True when the map screen is visible after the landing slide completes. */
  isMapScreenActive?: boolean;
  onBack?: () => void;
}

export function SocialMapApp({
  isMapScreenActive = true,
  onBack,
}: SocialMapAppProps) {
  const socialPlaces = useMemo(() => getSocialPlaces(), []);
  const mapPlaces = useMemo(() => getMapPlaces(), []);
  const ranking = useMemo(() => getRanking(), []);
  const rankingMapAvatars = useMemo(() => getRankingMapAvatars(), []);

  const [selectedPlace, setSelectedPlace] = useState<SocialPlace | null>(null);
  const [panelMarkerThought, setPanelMarkerThought] =
    useState<PlaceInteraction | null>(null);
  const [placePanelOpen, setPlacePanelOpen] = useState(false);
  const [placePanelExpanded, setPlacePanelExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>("activities");
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("collapsed");
  const [restSheetSnap, setRestSheetSnap] = useState<SheetSnap>("collapsed");
  const [sheetEnterHidden, setSheetEnterHidden] = useState(
    () => !isMapScreenActive,
  );
  const [suppressMarkers, setSuppressMarkers] = useState(
    () => !isMapScreenActive,
  );
  const [triggerMarkerEnter, setTriggerMarkerEnter] = useState(false);
  const [subtitleAnimKey, setSubtitleAnimKey] = useState(0);

  useEffect(() => {
    if (!isMapScreenActive) {
      setSheetEnterHidden(true);
      setSuppressMarkers(true);
      setTriggerMarkerEnter(false);
      setSubtitleAnimKey(0);
      return;
    }

    setSheetEnterHidden(true);
    setSuppressMarkers(true);
    setTriggerMarkerEnter(false);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slideMs = reducedMotion ? 0 : MAP_SCREEN_SLIDE_MS;

    // After the landing slide completes, sheet slide-up and marker pop run in parallel.
    const enterTimer = window.setTimeout(() => {
      setSheetEnterHidden(false);
      setSuppressMarkers(false);
      setTriggerMarkerEnter(true);
      setSubtitleAnimKey((k) => k + 1);
    }, slideMs);

    return () => {
      window.clearTimeout(enterTimer);
    };
  }, [isMapScreenActive]);
  const activities = useMemo(
    () => (selectedPlace ? getActivityFeed() : getDefaultMapActivityFeed()),
    [selectedPlace],
  );
  const districtSubtitle = useMemo(() => {
    if (activeTab === "ranking") {
      const rank = ranking.find((entry) => entry.isCurrentUser)?.rank ?? 8;
      const suffix =
        rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
      return `Ranked ${rank}${suffix} this week`;
    }
    const count = getNewMapActivityCount();
    return `${count} new ${count === 1 ? "activity" : "activities"} here`;
  }, [activeTab, ranking]);

  const handleSnapChange = useCallback((snap: SheetSnap) => {
    if (snap !== "expanded") setRestSheetSnap(snap);
    setSheetSnap(snap);
  }, []);

  const handleSelectPlace = useCallback(
    (place: SocialPlace, markerThought?: PlaceInteraction) => {
      setSelectedPlace(place);
      setPanelMarkerThought(markerThought ?? null);
      setPlacePanelOpen(true);
      setPlacePanelExpanded(false);
      setSheetSnap("collapsed");
      setRestSheetSnap("collapsed");
    },
    [],
  );

  const handleSelectActivity = useCallback(
    (item: ActivityItem) => {
      const place = socialPlaces.find((p) => p.id === item.place.id);
      if (place) {
        setSelectedPlace(place);
        setPanelMarkerThought(item.interaction);
        setPlacePanelOpen(true);
        setPlacePanelExpanded(false);
        setSheetSnap("collapsed");
        setRestSheetSnap("collapsed");
      }
    },
    [socialPlaces],
  );

  const handleClosePlace = useCallback(() => {
    setPlacePanelOpen(false);
    setActiveTab("activities");
    setSheetSnap("collapsed");
    setRestSheetSnap("collapsed");
  }, []);

  const handlePlaceExited = useCallback(() => {
    setSelectedPlace(null);
    setPanelMarkerThought(null);
    setPlacePanelExpanded(false);
  }, []);

  const handleMapBack = useCallback(() => {
    if (sheetSnap !== "collapsed") {
      setSheetSnap("collapsed");
      setRestSheetSnap("collapsed");
      return;
    }
    onBack?.();
  }, [onBack, sheetSnap]);

  const handleTabChange = useCallback((tab: SheetTab) => {
    setActiveTab(tab);
    setSubtitleAnimKey((k) => k + 1);
  }, []);

  const isRankingView = !selectedPlace && activeTab === "ranking";
  const showRankingBar = isRankingView;
  const rankingInsetFraction = SHEET_SNAP_FRACTIONS[restSheetSnap];
  const rankingHidden = sheetSnap === "expanded";
  const compassBottom = `calc(${PLACE_PANEL_REST_HEIGHT_FRACTION * 100}% + ${POI_PANEL_COMPASS_GAP_PX}px)`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SocialMap
          places={mapPlaces}
          selectedPlaceId={placePanelOpen ? selectedPlace?.id ?? null : null}
          onSelectPlace={handleSelectPlace}
          reserveBottomSheet={!placePanelOpen}
          viewMode={isRankingView ? "ranking" : "activities"}
          rankingAvatars={rankingMapAvatars}
          suppressMarkers={suppressMarkers}
          triggerMarkerEnter={triggerMarkerEnter}
        />
      </div>

      <div
        className="map-top-fade pointer-events-none absolute inset-x-0 top-0 z-30"
        aria-hidden
      />

      {showRankingBar ? (
        <RankingBar
          entries={ranking}
          bottomInsetFraction={rankingInsetFraction}
          hidden={rankingHidden}
        />
      ) : null}

      {!selectedPlace ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <div className="relative flex items-start justify-between px-4 pt-[66px]">
            <div className="min-w-0">
              <p className="map-district-title truncate">{MAP_CITY_NAME}</p>
              <p className="map-district-subtitle mt-2 truncate">
                <AnimatedSubtitle
                  key={subtitleAnimKey}
                  text={districtSubtitle}
                  playing={subtitleAnimKey > 0}
                />
              </p>
            </div>
            <button
              type="button"
              onClick={handleMapBack}
              className="bump-glass pointer-events-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#171b22] outline-none active:scale-[0.97]"
              aria-label="Close"
            >
              <IconClose />
            </button>
          </div>
        </div>
      ) : null}

      {selectedPlace ? (
        <>
          <div
            className={`poi-compass pointer-events-none absolute inset-x-0 z-40 flex justify-end px-4 ${placePanelOpen ? "poi-compass--enter" : "poi-compass--exit"}`}
            style={{ bottom: compassBottom }}
          >
            <div
              className={`map-chrome ${placePanelExpanded ? "map-chrome--hidden" : ""}`}
            >
              <MapCompass distance={selectedPlace.distance} />
            </div>
          </div>
          <PlacePanel
            key={`${selectedPlace.id}-${panelMarkerThought?.id ?? "all"}`}
            place={selectedPlace}
            markerThought={panelMarkerThought}
            exiting={!placePanelOpen}
            onClose={handleClosePlace}
            onExited={handlePlaceExited}
            onExpandedChange={setPlacePanelExpanded}
          />
        </>
      ) : null}

      <BottomSheet
        snap={sheetSnap}
        onSnapChange={handleSnapChange}
        header={<SheetTabs active={activeTab} onChange={handleTabChange} />}
        surfaceClassName=""
        flushTop
        recede={placePanelOpen}
        enterHidden={sheetEnterHidden}
      >
        <div
          className="sheet-tabs__body relative flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-hidden"
          style={
            activeTab === "ranking"
              ? { borderTopLeftRadius: SHEET_TABS_BODY_RADIUS }
              : { borderTopRightRadius: SHEET_TABS_BODY_RADIUS }
          }
        >
          <div className="relative z-0 min-h-0 flex-1 overflow-x-visible overflow-y-hidden">
            <div
              className={`sheet-pane ${
                activeTab === "activities"
                  ? "sheet-pane--active"
                  : "sheet-pane--left"
              }`}
            >
              <ActivityFeed
                items={activities}
                onSelectActivity={handleSelectActivity}
              />
            </div>
            <div
              className={`sheet-pane ${
                activeTab === "ranking"
                  ? "sheet-pane--active"
                  : "sheet-pane--right"
              }`}
            >
              <Ranking entries={ranking} />
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
