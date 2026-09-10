"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { SocialPlace, User } from "@/lib/types";
import {
  PLACE_PANEL_EXPANDED_HEIGHT_FRACTION,
  PLACE_PANEL_REST_HEIGHT_FRACTION,
} from "@/lib/poiPanelLayout";
import { usePanelExpandDrag } from "@/lib/usePanelExpandDrag";
import {
  formatRelativeTime,
  getPlaceBeenFriend,
  getPlaceDistanceLabel,
  getPlaceExperiences,
  getPlaceHours,
  getPlaceSavedFriends,
} from "@/lib/selectors";
import { Avatar } from "@/components/Avatar/Avatar";
import { AvatarStack } from "@/components/Avatar/AvatarStack";
import { ActivityPlaceImages } from "@/components/Activity/ActivityPlaceImages";

interface PlacePanelProps {
  place: SocialPlace;
  onClose: () => void;
  exiting?: boolean;
  onExited?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
}

function IconChevronRight() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 text-muted"
    >
      <path
        d="M6 4.5L10 8l-4 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SocialPill({
  count,
  label,
  avatarUser,
  avatarUsers,
  plainText = false,
}: {
  count: number;
  label: string;
  avatarUser?: User | null;
  avatarUsers?: User[];
  plainText?: boolean;
}) {
  const stackedUsers = avatarUsers?.length ? avatarUsers : null;

  return (
    <div className="bump-pill inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3">
      {stackedUsers ? (
        <AvatarStack users={stackedUsers} max={2} size={22} />
      ) : avatarUser ? (
        <Avatar
          src={avatarUser.avatar}
          name={avatarUser.name}
          size={22}
          className="shrink-0"
        />
      ) : null}
      <span className="text-[13px] text-[var(--tux-text-2)]">
        {plainText ? (
          `${count} ${label}`
        ) : (
          <>
            <span className="font-bold text-[var(--bump-blue)]">{count}</span>
            {` ${label}`}
          </>
        )}
      </span>
    </div>
  );
}

export const PlacePanel = forwardRef<HTMLDivElement, PlacePanelProps>(
  function PlacePanel(
    { place, onClose, exiting = false, onExited, onExpandedChange },
    ref,
  ) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const hours = getPlaceHours(place.id);
  const metaTail =
    place.distance === "0m"
      ? ` · ${hours} · ${place.category}`
      : ` · ${hours} · ${getPlaceDistanceLabel(place.distance)} · ${place.category}`;
  const savedCount = place.friendWantToGoCount;
  const savedFriends = getPlaceSavedFriends(place.id);
  const beenCount = place.friendBeenCount;
  const beenFriend = getPlaceBeenFriend(place.id);
  const experiences = getPlaceExperiences(place.id);

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const { grabberProps, contentProps } = usePanelExpandDrag({
    expanded,
    enabled: !exiting,
    onExpand: expand,
    onCollapse: collapse,
    rootRef,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const restHeight = `${PLACE_PANEL_REST_HEIGHT_FRACTION * 100}%`;
  const maxHeight = `${PLACE_PANEL_EXPANDED_HEIGHT_FRACTION * 100}%`;

  return (
    <div
      ref={setRefs}
      className={`place-panel bump-panel pointer-events-auto absolute inset-x-0 bottom-0 z-[32] flex flex-col overflow-hidden rounded-t-[var(--radius-surface)] ${expanded ? "place-panel--max" : ""} ${exiting ? "place-panel--exit" : "place-panel--enter"}`}
      style={{
        height: expanded ? maxHeight : restHeight,
        maxHeight: expanded ? maxHeight : restHeight,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (exiting) onExited?.();
      }}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-2 pt-3 active:cursor-grabbing"
        {...grabberProps}
      >
        <div className="bump-grabber h-1 w-10 rounded-full" />
      </div>

      <div
        data-sheet-scroll
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28 ${expanded ? "" : "touch-none"}`}
        {...contentProps}
      >
        <div className="inline-flex max-w-full items-center gap-1 pb-[2px] pt-1">
          <h2 className="truncate text-[22px] font-bold leading-tight text-foreground">
            {place.name}
          </h2>
          <IconChevronRight />
        </div>

        <p className="mt-1.5 text-[13px] leading-[1.35] text-[var(--tux-text-2)]">
          <span className="font-semibold text-[var(--bump-green)]">Open</span>
          <span>{metaTail}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {savedCount > 0 ? (
            <SocialPill
              count={savedCount}
              label="saved"
              avatarUsers={savedFriends}
              plainText
            />
          ) : null}
          {beenCount > 0 ? (
            <SocialPill
              count={beenCount}
              label="been"
              avatarUser={beenFriend}
              plainText
            />
          ) : null}
        </div>

        <div className="mt-6 space-y-5">
          {experiences.length > 0 ? (
            experiences.map((experience) => (
              <div key={experience.user.id}>
                <div className="flex items-start gap-3">
                  <Avatar
                    src={experience.user.avatar}
                    name={experience.user.name}
                    size={44}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline gap-1">
                      <p className="truncate text-[15px] font-semibold text-foreground">
                        {experience.user.name}
                      </p>
                      <span className="shrink-0 text-[13px] text-muted">·</span>
                      <span className="shrink-0 text-[13px] text-muted">
                        {formatRelativeTime(experience.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-[14px] leading-[1.4] text-[var(--tux-text-2)]">
                      {experience.text}
                    </p>
                    {experience.images.length > 0 ? (
                      <ActivityPlaceImages
                        images={experience.images}
                        placeName={place.name}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="py-2 text-[13px] text-muted">
              No friend experiences yet
            </p>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[34px] flex justify-center">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="bump-glass pointer-events-auto flex size-14 items-center justify-center rounded-full text-[oklch(0.55_0.01_260)] outline-none active:scale-[0.97]"
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
},
);
