"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { PlaceInteraction, SocialPlace, User } from "@/lib/types";
import {
  PLACE_PANEL_EXPANDED_HEIGHT_FRACTION,
  PLACE_PANEL_REST_HEIGHT_FRACTION,
} from "@/lib/poiPanelLayout";
import { usePanelExpandDrag } from "@/lib/usePanelExpandDrag";
import {
  formatRelativeTime,
  getPlaceBeenFriends,
  getPlaceCategoryLabel,
  getPlaceExperienceForMarkerThought,
  getPlaceExperiences,
  getPlacePriceLevel,
  getPlaceReviewCountLabel,
  getPlaceSavedFriends,
} from "@/lib/selectors";
import { Avatar } from "@/components/Avatar/Avatar";
import { AvatarStack } from "@/components/Avatar/AvatarStack";
import { ThreadRow } from "@/components/Activity/ThreadRow";
import { CornerBookmark } from "@/components/Place/CornerBookmark";
import { currentUser } from "@/data/users";

interface PlacePanelProps {
  place: SocialPlace;
  /** Friend interaction shown on the map marker / activity row that opened this panel. */
  markerThought?: PlaceInteraction | null;
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
  animateLeadingAvatar = false,
  onLeadingAvatarAnimationEnd,
}: {
  count: number;
  label: string;
  avatarUser?: User | null;
  avatarUsers?: User[];
  plainText?: boolean;
  animateLeadingAvatar?: boolean;
  onLeadingAvatarAnimationEnd?: () => void;
}) {
  const stackedUsers = avatarUsers?.length ? avatarUsers : null;

  return (
    <div className="bump-pill inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3">
      {stackedUsers ? (
        <AvatarStack
          users={stackedUsers}
          max={3}
          size={22}
          cutoutColor="var(--surface-muted)"
          animateLeading={animateLeadingAvatar}
          onLeadingAnimationEnd={onLeadingAvatarAnimationEnd}
        />
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
    {
      place,
      markerThought = null,
      onClose,
      exiting = false,
      onExited,
      onExpandedChange,
    },
    ref,
  ) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const reviewCount = getPlaceReviewCountLabel(place.id);
  const priceLevel = getPlacePriceLevel(place.category);
  const categoryLabel = getPlaceCategoryLabel(place.category);
  const allSavedFriends = getPlaceSavedFriends(place.id);
  const savedFriends = markerThought
    ? allSavedFriends.filter((user) => user.id === markerThought.userId)
    : allSavedFriends;
  const savedCount = markerThought
    ? savedFriends.length + (saved ? 1 : 0)
    : place.friendWantToGoCount + (saved ? 1 : 0);
  const savedAvatarUsers = saved
    ? [currentUser, ...savedFriends]
    : savedFriends;

  const featuredExperience = markerThought
    ? getPlaceExperienceForMarkerThought(markerThought)
    : null;
  const experiences = featuredExperience
    ? [featuredExperience]
    : markerThought
      ? getPlaceExperiences(place.id).filter(
          (experience) => experience.user.id === markerThought.userId,
        )
      : getPlaceExperiences(place.id);

  const allBeenFriends = getPlaceBeenFriends(place.id);
  const beenFriends = markerThought
    ? allBeenFriends.filter((user) => user.id === markerThought.userId)
    : allBeenFriends;
  const beenCount = beenFriends.length;

  const handleToggleSave = useCallback(() => {
    setSaved((prev) => {
      const next = !prev;
      setJustSaved(next);
      return next;
    });
  }, []);

  const clearJustSaved = useCallback(() => setJustSaved(false), []);

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
    onRestDragDown: onClose,
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
      <CornerBookmark saved={saved} onToggle={handleToggleSave} />

      <div
        className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-2 pt-3 active:cursor-grabbing"
        {...grabberProps}
      >
        <div className="bump-grabber h-1 w-10 rounded-full" />
      </div>

      <div
        data-sheet-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28"
        {...contentProps}
      >
        <div className="inline-flex max-w-[calc(100%-72px)] items-center gap-0.5 pb-[2px] pt-1">
          <h2 className="truncate text-[22px] font-bold leading-tight text-foreground">
            {place.name}
          </h2>
          <IconChevronRight />
        </div>

        <div className="flex items-center gap-0.5 pt-1">
          <img
            src="/icons/rating-star.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0"
            draggable={false}
          />
          <span className="text-[13px] font-semibold leading-[1.3] text-foreground">
            {place.rating.toFixed(1)}
          </span>
          <span className="text-[13px] leading-[17.55px] text-[#656970]">
            {reviewCount}
          </span>
          <span className="truncate text-[13px] leading-[17.55px] text-[#656970]">
            {` · ${priceLevel} · ${categoryLabel}`}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {savedCount > 0 ? (
            <SocialPill
              count={savedCount}
              label="saved"
              avatarUsers={savedAvatarUsers}
              plainText
              animateLeadingAvatar={justSaved}
              onLeadingAvatarAnimationEnd={clearJustSaved}
            />
          ) : null}
          {beenCount > 0 ? (
            <SocialPill
              count={beenCount}
              label="been"
              avatarUser={beenCount === 1 ? beenFriends[0] : undefined}
              avatarUsers={beenCount > 1 ? beenFriends : undefined}
              plainText
            />
          ) : null}
        </div>

        <div className={experiences.length > 0 ? "mt-1" : "mt-3"}>
          {experiences.length > 0 ? (
            experiences.map((experience) => (
              <ThreadRow
                key={experience.user.id}
                user={experience.user}
                time={formatRelativeTime(experience.createdAt)}
                text={experience.text}
                placeName={place.name}
                showPlaceName={false}
                images={experience.images}
                avatarSize={40}
                rating={experience.rating}
                commentCount={experience.commentCount}
                likeCount={experience.likeCount}
                showActions
              />
            ))
          ) : (
            <p className="pt-3 text-[13px] leading-[1.35] text-muted">
              None of your friends have been here yet. Save this place and be
              the first.
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
