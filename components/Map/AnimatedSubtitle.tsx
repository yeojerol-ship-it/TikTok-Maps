"use client";

import type { AnimationEvent } from "react";

interface AnimatedSubtitleProps {
  text: string;
  /** When false, characters stay hidden until the next play cycle. */
  playing: boolean;
  className?: string;
}

function handleCharAnimationEnd(event: AnimationEvent<HTMLSpanElement>) {
  if (event.animationName !== "map-subtitle-char-enter") return;
  event.currentTarget.classList.add("map-subtitle-char--done");
}

export function AnimatedSubtitle({
  text,
  playing,
  className = "",
}: AnimatedSubtitleProps) {
  const chars = Array.from(text);

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key -- staggered char list remounts via parent key
          key={index}
          className={
            playing
              ? "map-subtitle-char map-subtitle-char--enter"
              : "map-subtitle-char map-subtitle-char--hidden"
          }
          style={{ "--char-index": index } as React.CSSProperties}
          aria-hidden
          onAnimationEnd={handleCharAnimationEnd}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
