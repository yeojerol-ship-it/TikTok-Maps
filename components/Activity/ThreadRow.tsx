"use client";

import { User } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";
import { ActivityPlaceImages } from "./ActivityPlaceImages";

function IconChevronRight() {
  return (
    <svg
      width="6"
      height="9"
      viewBox="0 0 6 9"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M1 1L5 4.5 1 8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ThreadRowProps {
  user: User;
  time: string;
  text?: string;
  placeName?: string;
  showPlaceName?: boolean;
  images?: string[];
  avatarSize?: number;
  /** Whole-star rating 1–5 for the first / review thread. */
  rating?: number;
  commentCount?: number;
  likeCount?: number;
  showActions?: boolean;
  onClick?: () => void;
}

export function ThreadRow({
  user,
  time,
  text,
  placeName,
  showPlaceName = true,
  images = [],
  avatarSize = 40,
  rating,
  commentCount,
  likeCount,
  showActions = false,
  onClick,
}: ThreadRowProps) {
  const hasImages = images.length > 0;
  const showSocial =
    showActions || commentCount != null || likeCount != null || rating != null;
  const className =
    "flex w-full flex-col overflow-visible border-none bg-transparent px-0 py-5 text-left outline-none" +
    (onClick ? " active:opacity-70" : "");

  const content = (
    <>
      <div className="flex w-full items-start gap-3 overflow-visible">
        <div className="shrink-0 py-1">
          <Avatar src={user.avatar} name={user.name} size={avatarSize} />
        </div>
        <div className="min-w-0 flex-1 overflow-visible">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-end gap-1">
              <span className="truncate text-[15px] font-semibold leading-[1.3] text-foreground">
                {user.name}
              </span>
              <span className="shrink-0 text-[13px] leading-[17px] text-[#767b82]">
                ·
              </span>
              <span className="shrink-0 text-[13px] leading-[17px] text-[#767b82]">
                {time}
              </span>
            </div>
            {showActions || showSocial ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-black/[0.05] px-2.5 py-1 text-[12px] font-semibold leading-[1.3] text-foreground">
                  Message
                </span>
                <span
                  className="inline-flex size-6 items-center justify-center rounded-full bg-black/[0.05]"
                  aria-hidden
                >
                  <img
                    src="/icons/emoji-plus.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5"
                    draggable={false}
                  />
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 pt-0.5">
            {rating != null && rating > 0 ? (
              <img
                src="/icons/stars-4.svg"
                alt={`${rating} out of 5 stars`}
                width={85}
                height={18}
                className="h-[18px] w-[85px]"
                draggable={false}
              />
            ) : null}
            {text ? (
              <p className="whitespace-pre-wrap text-[14px] leading-[1.4] text-foreground">
                {text}
              </p>
            ) : null}
            {placeName && showPlaceName ? (
              <div className="mt-0.5 flex min-w-0 items-center gap-1 text-muted">
                <span className="truncate tux-p2">{placeName}</span>
                {onClick ? <IconChevronRight /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {hasImages ? (
        <div className="overflow-visible pl-[52px]">
          <ActivityPlaceImages
            images={images}
            placeName={placeName ?? "Place"}
            variant="thread"
            bleedEnd
          />
        </div>
      ) : null}

      {commentCount != null || likeCount != null ? (
        <div className="flex items-center gap-4 pl-[52px] pt-3">
          {commentCount != null ? (
            <span className="inline-flex items-center gap-1">
              <img
                src="/icons/comment.svg"
                alt=""
                width={22}
                height={22}
                className="size-[22px]"
                draggable={false}
              />
              <span className="text-[13px] font-semibold leading-[1.3] text-foreground">
                {commentCount}
              </span>
            </span>
          ) : null}
          {likeCount != null ? (
            <span className="inline-flex items-center gap-1">
              <img
                src="/icons/like.svg"
                alt=""
                width={22}
                height={22}
                className="size-[22px]"
                draggable={false}
              />
              <span className="text-[13px] font-semibold leading-[1.3] text-foreground">
                {likeCount}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
