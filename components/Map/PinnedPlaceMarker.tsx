"use client";

import { SocialPlace } from "@/lib/types";
import { getMarkerIconPath } from "@/data/markerIcons";
import { StickerMarkerIcon } from "./StickerMarkerIcon";

interface PinnedPlaceMarkerProps {
  place: SocialPlace;
}

export function PinnedPlaceMarker({ place }: PinnedPlaceMarkerProps) {
  const markerIcon = getMarkerIconPath(place.id, place.category);

  return (
    <div className="flex flex-col items-center">
      <StickerMarkerIcon src={markerIcon} size={40} />
      <p
        className="marker-label tux-small-1-semi mt-0.5 max-w-[140px] truncate text-center"
        style={{
          color: "var(--tux-text-2)",
          WebkitTextStroke: "2px #ffffff",
          paintOrder: "stroke fill",
        }}
      >
        {place.name}
      </p>
    </div>
  );
}
