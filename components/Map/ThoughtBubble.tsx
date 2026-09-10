"use client";

import { PlaceInteraction } from "@/lib/types";
import { userMap } from "@/data/users";
import { Avatar } from "@/components/Avatar/Avatar";
import { BubbleTail } from "./BubbleTail";

interface ThoughtBubbleProps {
  thought: PlaceInteraction;
  typing?: boolean;
}

function getThoughtText(thought: PlaceInteraction) {
  if (thought.type === "WANT_TO_GO") return "Want to go";
  if (thought.type === "BEEN") return "Been here";
  return thought.comment ?? "";
}

const bubbleShellClass =
  "flex w-fit max-w-[168px] items-center rounded-2xl border border-border bg-bg text-left";

export function ThoughtBubble({ thought, typing = false }: ThoughtBubbleProps) {
  const user = userMap[thought.userId];

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
        aria-label={typing ? "Typing" : undefined}
      >
        {typing ? (
          <>
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
          </>
        ) : user ? (
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
