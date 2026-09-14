"use client";

import { useCallback, useMemo, useState } from "react";
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
  getRanking,
  getSocialPlaces,
} from "@/lib/selectors";
import {
  BottomSheet,
  SHEET_SNAP_FRACTIONS,
} from "@/components/BottomSheet/BottomSheet";
import { SegmentedControl } from "@/components/BottomSheet/SegmentedControl";
import { ActivityFeed } from "@/components/Activity/ActivityFeed";
import { Ranking } from "@/components/Ranking/Ranking";
import { RankingBar } from "@/components/Ranking/RankingBar";
import { PlacePanel } from "@/components/Place/PlacePanel";
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

function IconBackChevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M10 4.5L6 8l4 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SocialMapApp() {
  const socialPlaces = useMemo(() => getSocialPlaces(), []);
  const mapPlaces = useMemo(() => getMapPlaces(), []);
  const ranking = useMemo(() => getRanking(), []);

  const [selectedPlace, setSelectedPlace] = useState<SocialPlace | null>(null);
  const [panelMarkerThought, setPanelMarkerThought] =
    useState<PlaceInteraction | null>(null);
  const [placePanelOpen, setPlacePanelOpen] = useState(false);
  const [placePanelExpanded, setPlacePanelExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>("activities");
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("collapsed");
  const [restSheetSnap, setRestSheetSnap] = useState<SheetSnap>("collapsed");
  const activities = useMemo(
    () => (selectedPlace ? getActivityFeed() : getDefaultMapActivityFeed()),
    [selectedPlace],
  );

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
    if (sheetSnap === "collapsed") return;
    setSheetSnap("collapsed");
    setRestSheetSnap("collapsed");
  }, [sheetSnap]);

  const handleTabChange = useCallback((tab: SheetTab) => {
    setActiveTab(tab);
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
        />
      </div>

      {showRankingBar ? (
        <RankingBar
          entries={ranking}
          bottomInsetFraction={rankingInsetFraction}
          hidden={rankingHidden}
        />
      ) : null}

      {!selectedPlace ? (
        <div className="pointer-events-none absolute left-4 top-7 z-40">
          <button
            type="button"
            onClick={handleMapBack}
            className="bump-glass pointer-events-auto inline-flex size-9 items-center justify-center rounded-full text-foreground outline-none active:scale-[0.97]"
            aria-label="Back"
          >
            <IconBackChevron />
          </button>
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
        grabberOverlay={isRankingView}
        recede={placePanelOpen}
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-hidden">
          <div className="relative z-50 mb-2 shrink-0 px-4 pt-1">
            <SegmentedControl active={activeTab} onChange={handleTabChange} />
          </div>
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
