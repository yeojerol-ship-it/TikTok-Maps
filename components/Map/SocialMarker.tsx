"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAP_PLACE_ID } from "@/data/featuredPlaces";
import { SocialPlace } from "@/lib/types";
import {
  getPlaceMarkerAvatarUsers,
  getPlaceMarkerBubble,
  getPlaceMarkerCaption,
} from "@/lib/selectors";
import { getMarkerIconPath } from "@/data/markerIcons";
import { SELECTED_MARKER_ICON_SIZE } from "@/lib/markerLayout";
import { MarkerCommentBubble } from "./MarkerCommentBubble";
import { MarkerMiniIcon } from "./MarkerMiniIcon";
import { MarkerPill } from "./MarkerPill";
import { StickerMarkerIcon } from "./StickerMarkerIcon";

interface SocialMarkerProps {
  place: SocialPlace;
  selected: boolean;
  inView: boolean;
  compact?: boolean;
  /** `mini` collapses to a small emoji disc until the map is zoomed in. */
  variant?: "full" | "mini";
  /** Hold bubble hidden while markers are suppressed during enter sequence. */
  suppressCommentBubble?: boolean;
  /** Wait until activity marker enter sequence finishes before showing bubble. */
  commentBubblePopDelayMs?: number;
  /** Bumps on each marker load-out; resets bubble before delayed pop. */
  commentBubbleLoadOutKey?: number;
  onClick: () => void;
}

/** Figma label block (node 2969:18742) is a fixed 113px column. */
const LABEL_WIDTH = 113;
/** Quote bubble offset from the pill (Figma node 2969:18745). */
const BUBBLE_OFFSET_X = 66;
const BUBBLE_OFFSET_Y = -23;

export function SocialMarker({
  place,
  selected,
  inView,
  compact = false,
  variant = "full",
  suppressCommentBubble = false,
  commentBubblePopDelayMs,
  commentBubbleLoadOutKey = 0,
  onClick,
}: SocialMarkerProps) {
  const isFocusPlace = place.id === DEFAULT_MAP_PLACE_ID;

  const markerBubble = useMemo(
    () => getPlaceMarkerBubble(place.id),
    [place.id],
  );
  const caption = useMemo(
    () => getPlaceMarkerCaption(place.id),
    [place.id],
  );
  const avatarUsers = useMemo(
    () => getPlaceMarkerAvatarUsers(place.id),
    [place.id],
  );

  const quote =
    markerBubble?.mode === "single" ? markerBubble.thought.comment : undefined;
  const [quoteRevealed, setQuoteRevealed] = useState(false);

  useEffect(() => {
    if (selected) setQuoteRevealed(true);
  }, [selected]);

  useEffect(() => {
    setQuoteRevealed(false);
  }, [commentBubbleLoadOutKey]);

  useEffect(() => {
    if (selected || !inView || !quote || suppressCommentBubble) return;

    if (commentBubblePopDelayMs !== undefined) {
      const timer = window.setTimeout(
        () => setQuoteRevealed(true),
        commentBubblePopDelayMs,
      );
      return () => window.clearTimeout(timer);
    }

    if (isFocusPlace) {
      setQuoteRevealed(true);
      return;
    }

    const timer = window.setTimeout(() => setQuoteRevealed(true), 700);
    return () => window.clearTimeout(timer);
  }, [
    commentBubblePopDelayMs,
    commentBubbleLoadOutKey,
    inView,
    isFocusPlace,
    quote,
    selected,
    suppressCommentBubble,
  ]);

  const markerIcon = getMarkerIconPath(place.id, place.category);
  const showQuote = Boolean(quote) && quoteRevealed && !compact && !selected;

  const labelStrokeStyle = {
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
      {selected ? (
        <div className="poi-pin--selected-enter">
          <StickerMarkerIcon
            src={markerIcon}
            size={SELECTED_MARKER_ICON_SIZE}
            expanded
          />
        </div>
      ) : variant === "mini" ? (
        <MarkerMiniIcon icon={markerIcon} />
      ) : (
        <>
          <div className="relative flex flex-col items-center gap-2">
            {showQuote ? (
              <div
                className="map-comment-bubble-enter absolute z-20"
                style={{ left: BUBBLE_OFFSET_X, top: BUBBLE_OFFSET_Y }}
              >
                <MarkerCommentBubble text={quote!} />
              </div>
            ) : null}

            <MarkerPill icon={markerIcon} users={avatarUsers} />

            <div
              className="marker-label flex flex-col items-center gap-px text-center"
              style={{ width: LABEL_WIDTH }}
            >
              <p
                className="tux-small-1-semi w-full truncate text-foreground"
                style={labelStrokeStyle}
              >
                {place.name}
              </p>
              {caption ? (
                <p
                  className="w-full truncate text-[10px] font-semibold leading-[14px] text-[var(--tux-text-3)]"
                  style={labelStrokeStyle}
                >
                  {caption}
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </button>
  );
}
