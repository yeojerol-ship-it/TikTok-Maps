"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { RankingEntry } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";

interface PodiumRibbonProps {
  entry: RankingEntry;
  rank: 1 | 2 | 3;
  cardHeight: number;
  avatarSize: number;
  label: string;
}

interface RibbonSize {
  width: number;
  height: number;
}

/** Ribbon silhouette with even pixel radii — rounded top + soft V tail. */
function buildRibbonPath({ width, height }: RibbonSize): string {
  const topR = Math.min(18, width * 0.16);
  const tailDepth = Math.min(24, height * 0.11);
  const tailJoinY = height - tailDepth;
  const tailTipY = height - 1.5;
  const tailR = Math.min(10, tailDepth * 0.42);
  const cx = width / 2;

  return [
    `M ${topR} 0`,
    `H ${width - topR}`,
    `Q ${width} 0 ${width} ${topR}`,
    `V ${tailJoinY - tailR * 0.65}`,
    `Q ${width} ${tailJoinY} ${width - tailR} ${tailJoinY + tailR * 0.55}`,
    `Q ${cx + tailR * 2.2} ${tailTipY - tailR * 0.35} ${cx} ${tailTipY}`,
    `Q ${cx - tailR * 2.2} ${tailTipY - tailR * 0.35} ${tailR} ${tailJoinY + tailR * 0.55}`,
    `Q 0 ${tailJoinY} 0 ${tailJoinY - tailR * 0.65}`,
    `V ${topR}`,
    `Q 0 0 ${topR} 0`,
    "Z",
  ].join(" ");
}

export function PodiumRibbon({
  entry,
  rank,
  cardHeight,
  avatarSize,
  label,
}: PodiumRibbonProps) {
  const gradientId = useId();
  const borderGradientId = useId();
  const articleRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<RibbonSize>({ width: 100, height: cardHeight });
  const placeWord = entry.placesVisited === 1 ? "place" : "places";

  useLayoutEffect(() => {
    const node = articleRef.current;
    if (!node) return;

    const update = () => {
      setSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [cardHeight]);

  const ribbonPath = buildRibbonPath(size);

  return (
    <div className="podium-ribbon-shadow min-w-0 flex-1">
      <article
        ref={articleRef}
        className="podium-ribbon relative w-full"
        style={{ height: cardHeight }}
        aria-label={`${label}, ${entry.user.name}`}
      >
        <svg
          className="podium-ribbon__shape absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.width} ${size.height}`}
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2={size.height}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="var(--ranking-ribbon-from)" />
              <stop offset="55%" stopColor="var(--ranking-ribbon-mid)" />
              <stop offset="100%" stopColor="var(--ranking-ribbon-to)" />
            </linearGradient>
            <linearGradient
              id={borderGradientId}
              x1="0"
              y1="0"
              x2="0"
              y2={size.height}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.5" />
              <stop offset="42%" stopColor="oklch(1 0 0)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="oklch(1 0 0)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={ribbonPath} fill={`url(#${gradientId})`} />
          <path
            d={ribbonPath}
            className="podium-ribbon__stroke"
            fill="none"
            stroke={`url(#${borderGradientId})`}
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="podium-ribbon__content relative z-10 flex h-full flex-col items-center px-2 pb-7 pt-3">
          <span className={`podium-ribbon__rank podium-ribbon__rank--${rank}`}>
            {label}
          </span>

          <div className="mt-2.5">
            <Avatar
              src={entry.user.avatar}
              name={entry.user.name}
              size={avatarSize}
              className="block"
            />
          </div>

          <p
            className={`mt-3.5 w-full truncate text-center tux-p1-semi ${
              entry.isCurrentUser ? "text-accent" : "text-foreground"
            }`}
          >
            {entry.isCurrentUser ? "You" : entry.user.name}
          </p>

          <span className="podium-ribbon__stat mt-1.5 tux-p3">
            {entry.placesVisited} {placeWord}
          </span>
        </div>
      </article>
    </div>
  );
}
