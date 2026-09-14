"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAP_PLACE_ID } from "@/data/featuredPlaces";
import { SocialPlace } from "@/lib/types";
import { getPlaceMarkerBubble } from "@/lib/selectors";
import { getMarkerIconPath } from "@/data/markerIcons";
import { StickerMarkerIcon } from "./StickerMarkerIcon";
import { ThoughtBubble } from "./ThoughtBubble";

interface SocialMarkerProps {
  place: SocialPlace;
  selected: boolean;
  inView: boolean;
  compact?: boolean;
  onClick: () => void;
}

export function SocialMarker({
  place,
  selected,
  inView,
  compact = false,
  onClick,
}: SocialMarkerProps) {
  const isFocusPlace = place.id === DEFAULT_MAP_PLACE_ID;
  const hideBubble = compact || selected;

  const markerBubble = useMemo(
    () => getPlaceMarkerBubble(place.id),
    [place.id],
  );
  const hasSpeech = Boolean(markerBubble);
  const [speechRevealed, setSpeechRevealed] = useState(isFocusPlace);

  useEffect(() => {
    if (selected) setSpeechRevealed(true);
  }, [selected]);

  useEffect(() => {
    if (isFocusPlace || speechRevealed || !inView || !hasSpeech) return;

    const timer = window.setTimeout(() => setSpeechRevealed(true), 700);
    return () => window.clearTimeout(timer);
  }, [hasSpeech, inView, isFocusPlace, speechRevealed]);

  const showFocusBubble = !hideBubble && isFocusPlace && hasSpeech;
  const showOtherBubble = !hideBubble && !isFocusPlace && hasSpeech;
  const showTyping = showOtherBubble && !speechRevealed;

  const markerIcon = getMarkerIconPath(place.id, place.category);

  const markerSubLabelStyle = {
    color: "var(--tux-text-2)",
    WebkitTextStroke: "2px #ffffff",
    paintOrder: "stroke fill" as const,
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative flex flex-col items-center border-none bg-transparent p-0 outline-none"
      style={{ cursor: "pointer" }}
    >
      {showFocusBubble || showOtherBubble ? (
        markerBubble?.mode === "marked" ? (
          <ThoughtBubble
            markedUsers={markerBubble.users}
            markedCount={markerBubble.count}
            typing={showTyping}
          />
        ) : (
          <ThoughtBubble
            thought={markerBubble?.thought}
            typing={showTyping}
          />
        )
      ) : null}

      <StickerMarkerIcon src={markerIcon} size={selected ? 48 : 40} />

      <p
        className="marker-label tux-small-1-semi mt-0.5 max-w-[140px] truncate text-center"
        style={markerSubLabelStyle}
      >
        {place.name}
      </p>
    </button>
  );
}
