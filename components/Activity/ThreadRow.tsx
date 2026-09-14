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
  onClick?: () => void;
}

export function ThreadRow({
  user,
  time,
  text,
  placeName,
  showPlaceName = true,
  images = [],
  avatarSize = 48,
  onClick,
}: ThreadRowProps) {
  const hasImages = images.length > 0;
  const className =
    "flex w-full flex-col overflow-visible border-none bg-transparent px-0 py-3 text-left outline-none" +
    (onClick ? " active:opacity-70" : "");

  const content = (
    <>
      <div className="flex w-full items-start gap-3 overflow-visible">
        <Avatar src={user.avatar} name={user.name} size={avatarSize} />
        <div className="min-w-0 flex-1 overflow-visible">
          <div className="flex min-w-0 items-baseline gap-1">
            <span className="truncate tux-p1-semi text-foreground">
              {user.name}
            </span>
            <span className="shrink-0 tux-p2 text-muted">·</span>
            <span className="shrink-0 tux-p2 text-muted">{time}</span>
          </div>
          {text ? (
            <p className="tux-p1 mt-0.5 whitespace-pre-wrap text-foreground">
              {text}
            </p>
          ) : null}
          {placeName && showPlaceName ? (
            <div className="mt-1 flex min-w-0 items-center gap-1 text-muted">
              <span className="truncate tux-p2">{placeName}</span>
              {onClick ? <IconChevronRight /> : null}
            </div>
          ) : null}
        </div>
      </div>
      {hasImages ? (
        <div className="overflow-visible pl-[60px]">
          <ActivityPlaceImages
            images={images}
            placeName={placeName ?? "Place"}
            variant="scatter"
            bleedEnd
          />
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
