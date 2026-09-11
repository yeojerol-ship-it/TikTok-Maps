"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RankingEntry } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";

interface RankingBarProps {
  entries: RankingEntry[];
  /** Bottom sheet height as a fraction of the viewport (0–1). */
  bottomInsetFraction?: number;
  /** Hide with GPU chrome-out motion while the sheet / POI panel is at max height. */
  hidden?: boolean;
}

const BAR_WIDTH_PX = 26;
const BAR_HEIGHT_PX = 160;
const PANEL_GAP_PX = 16;
const PEER_AVATAR_PX = 18;
const YOU_AVATAR_PX = 30;
const CLUSTER_OVERLAP_PX = 4;
const CLUSTER_GAP_PX = 6;
const SAFE_ZONE_PX = 8;

/** Rank digit overlapping the current-user avatar at the bottom-right. */
function YouRankLabel({ rank }: { rank: number }) {
  return (
    <span className="bump-ranking-bar__you-rank" aria-hidden>
      #{rank}
    </span>
  );
}

type LaidOutAvatar = {
  entry: RankingEntry;
  avatar: number;
  slot: number;
  top: number;
  zIndex: number;
};

function avatarSizeFor(entry: RankingEntry) {
  return entry.isCurrentUser ? YOU_AVATAR_PX : PEER_AVATAR_PX;
}

function slotHeightFor(entry: RankingEntry) {
  return avatarSizeFor(entry);
}

/** Top 1, the person just ahead, you, and the person just behind. */
function pickVisibleEntries(entries: RankingEntry[]): RankingEntry[] {
  const currentUser = entries.find((entry) => entry.isCurrentUser);
  const top = entries.find((entry) => entry.rank === 1);
  const ahead = currentUser
    ? entries.find((entry) => entry.rank === currentUser.rank - 1)
    : undefined;
  const behind = currentUser
    ? entries.find((entry) => entry.rank === currentUser.rank + 1)
    : undefined;

  const picked: RankingEntry[] = [];
  const seen = new Set<string>();
  for (const entry of [top, ahead, currentUser, behind]) {
    if (!entry || seen.has(entry.user.id)) continue;
    seen.add(entry.user.id);
    picked.push(entry);
  }
  return picked;
}

function layoutRankingAvatars(
  visible: RankingEntry[],
  all: RankingEntry[],
  trackHeight: number,
): LaidOutAvatar[] {
  if (trackHeight <= 0 || visible.length === 0 || all.length === 0) return [];

  const scores = all.map((entry) => entry.placesVisited);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = Math.max(maxScore - minScore, 1);
  const innerBottom = Math.max(trackHeight - SAFE_ZONE_PX, SAFE_ZONE_PX);
  const maxSlot = Math.max(...visible.map((entry) => slotHeightFor(entry)));
  const travel = Math.max(innerBottom - SAFE_ZONE_PX - maxSlot, 0);

  const items = [...visible]
    .map((entry) => {
      const avatar = avatarSizeFor(entry);
      const slot = slotHeightFor(entry);
      const t = (maxScore - entry.placesVisited) / range;
      const idealTop = SAFE_ZONE_PX + t * travel;
      return { entry, avatar, slot, idealTop };
    })
    .sort(
      (a, b) => a.idealTop - b.idealTop || a.entry.rank - b.entry.rank,
    );

  const clusters: (typeof items)[] = [];
  for (const item of items) {
    const cluster = clusters[clusters.length - 1];
    if (!cluster) {
      clusters.push([item]);
      continue;
    }

    const prev = cluster[cluster.length - 1];
    const prevBottom = prev.idealTop + prev.slot;
    if (item.idealTop < prevBottom - CLUSTER_OVERLAP_PX) {
      cluster.push(item);
    } else {
      clusters.push([item]);
    }
  }

  type Box = { top: number; height: number; cluster: typeof items };
  const boxes: Box[] = clusters.map((cluster) => {
    const height =
      cluster.reduce((sum, item) => sum + item.slot, 0) +
      Math.max(0, cluster.length - 1) * CLUSTER_GAP_PX;
    const avgCenter =
      cluster.reduce((sum, item) => sum + item.idealTop + item.slot / 2, 0) /
      cluster.length;

    return {
      top: avgCenter - height / 2,
      height,
      cluster,
    };
  });

  if (boxes.length > 0) {
    boxes[0].top = Math.max(SAFE_ZONE_PX, boxes[0].top);
  }
  for (let i = 1; i < boxes.length; i++) {
    const minTop = boxes[i - 1].top + boxes[i - 1].height + CLUSTER_GAP_PX;
    if (boxes[i].top < minTop) boxes[i].top = minTop;
  }

  const last = boxes[boxes.length - 1];
  if (last && last.top + last.height > innerBottom) {
    last.top = innerBottom - last.height;
    for (let i = boxes.length - 1; i > 0; i--) {
      const maxBottom = boxes[i].top - CLUSTER_GAP_PX;
      const prev = boxes[i - 1];
      if (prev.top + prev.height > maxBottom) {
        prev.top = maxBottom - prev.height;
      }
    }
    if (boxes[0].top < SAFE_ZONE_PX) boxes[0].top = SAFE_ZONE_PX;
  }

  return boxes.flatMap((box) => {
    let offset = 0;
    return box.cluster.map((item, index) => {
      const top = box.top + offset;
      offset += item.slot + CLUSTER_GAP_PX;
      return {
        entry: item.entry,
        avatar: item.avatar,
        slot: item.slot,
        top,
        zIndex: item.entry.isCurrentUser ? 80 : box.cluster.length - index,
      };
    });
  });
}

export function RankingBar({
  entries,
  bottomInsetFraction = 0.32,
  hidden = false,
}: RankingBarProps) {
  const total = entries.length;
  const currentUser = entries.find((entry) => entry.isCurrentUser);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const sync = () => setTrackHeight(el.clientHeight);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visibleEntries = useMemo(
    () => pickVisibleEntries(entries),
    [entries],
  );

  const laidOut = useMemo(
    () => layoutRankingAvatars(visibleEntries, entries, trackHeight),
    [visibleEntries, entries, trackHeight],
  );

  const fillHeight = useMemo(() => {
    const you = laidOut.find((item) => item.entry.isCurrentUser);
    if (!you || trackHeight <= 0) return 0;
    return Math.max(0, trackHeight - (you.top + you.avatar / 2));
  }, [laidOut, trackHeight]);

  if (total === 0) return null;

  return (
    <div
      className="bump-ranking-bar-stage pointer-events-none absolute z-40 overflow-visible"
      style={{
        left: 12,
        bottom: `calc(${bottomInsetFraction * 100}% + ${PANEL_GAP_PX}px)`,
        height: `min(${BAR_HEIGHT_PX}px, calc(100% - ${bottomInsetFraction * 100}% - ${PANEL_GAP_PX}px - 16px))`,
        width: Math.max(YOU_AVATAR_PX, BAR_WIDTH_PX),
      }}
      aria-hidden={hidden || undefined}
      aria-label={
        currentUser
          ? `Your rank is number ${currentUser.rank} of ${total}`
          : "Friend ranking"
      }
    >
      <div
        className={`map-chrome relative h-full w-full overflow-visible ${hidden ? "map-chrome--hidden" : ""}`}
      >
        <div
          className="bump-ranking-bar absolute inset-y-0 left-1/2 overflow-hidden"
          style={{
            width: BAR_WIDTH_PX,
            marginLeft: -BAR_WIDTH_PX / 2,
          }}
        >
          {fillHeight > 0 ? (
            <div
              className="bump-ranking-bar__fill"
              style={{ height: fillHeight }}
            />
          ) : null}
        </div>

        <div ref={trackRef} className="relative h-full w-full overflow-visible">
        {laidOut.map((item, index) => {
          const isYou = Boolean(item.entry.isCurrentUser);

          return (
            <div
              key={item.entry.user.id}
              className={
                isYou
                  ? "bump-ranking-bar__marker bump-ranking-bar__marker--you absolute left-1/2 flex flex-col items-center overflow-visible"
                  : "bump-ranking-bar__marker absolute left-1/2 flex flex-col items-center overflow-visible"
              }
              style={{
                top: item.top,
                width: item.avatar,
                height: item.slot,
                zIndex: item.zIndex,
                ["--i" as string]: index,
              }}
            >
              <div className="relative z-0 shrink-0 overflow-visible">
                <Avatar
                  src={item.entry.user.avatar}
                  name={item.entry.user.name}
                  size={item.avatar}
                  className={
                    isYou ? "shadow-[0_2px_8px_rgba(0,0,0,0.16)]" : ""
                  }
                />
                {isYou ? <YouRankLabel rank={item.entry.rank} /> : null}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
