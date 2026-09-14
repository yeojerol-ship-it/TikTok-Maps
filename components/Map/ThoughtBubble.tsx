"use client";

import { PlaceInteraction, User } from "@/lib/types";
import { userMap } from "@/data/users";
import { Avatar } from "@/components/Avatar/Avatar";
import { AvatarStack } from "@/components/Avatar/AvatarStack";
import { BubbleTail } from "./BubbleTail";

interface ThoughtBubbleProps {
  thought?: PlaceInteraction;
  markedUsers?: User[];
  markedCount?: number;
  typing?: boolean;
}

function getThoughtText(thought: PlaceInteraction) {
  if (thought.comment) return thought.comment;
  if (thought.type === "WANT_TO_GO") return "Want to go";
  if (thought.type === "BEEN") return "Been here";
  return "";
}

const bubbleShellClass =
  "flex w-fit max-w-[168px] items-center rounded-2xl border border-border bg-bg text-left";

const MARKED_AVATAR_MAX = 3;

export function ThoughtBubble({
  thought,
  markedUsers,
  markedCount = 0,
  typing = false,
}: ThoughtBubbleProps) {
  const showMarked = markedCount > 1 && Boolean(markedUsers?.length);
  const visibleMarked = showMarked
    ? markedUsers!.slice(0, MARKED_AVATAR_MAX)
    : [];
  const markedLabelCount = Math.min(markedCount, MARKED_AVATAR_MAX);

  const user = thought ? userMap[thought.userId] : undefined;

  return (
    <div
      className="relative z-20 mb-0 mt-1 flex flex-col items-center"
      style={{
        minHeight: 56,
        transform: "translateY(16px)",
      }}
    >
      <div
        className={`${bubbleShellClass} ${
          typing
            ? "h-9 justify-center gap-1 px-3 py-2"
            : "gap-2 px-2.5 py-2"
        }`}
        style={{ boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)" }}
        aria-label={
          typing
            ? "Typing"
            : showMarked
              ? `${markedCount} marked`
              : undefined
        }
      >
        {typing ? (
          <>
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
          </>
        ) : showMarked ? (
          <>
            <AvatarStack users={visibleMarked} max={MARKED_AVATAR_MAX} size={22} />
            <p className="shrink-0 tux-small-1 text-foreground">
              {markedCount} marked
            </p>
          </>
        ) : user && thought ? (
          <>
            <Avatar
              src={user.avatar}
              name={user.name}
              size={28}
              className="shrink-0 ring-1 ring-white"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate tux-small-1-semi text-foreground">
                {user.name}
              </p>
              <p className="mt-0.5 truncate tux-small-1 text-muted">
                {getThoughtText(thought)}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <BubbleTail />
    </div>
  );
}
