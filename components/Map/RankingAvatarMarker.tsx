"use client";

import { User } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";
import { RankingCrown } from "@/components/Ranking/RankingCrown";
import { getMapAvatarPx, getRankStyle } from "@/lib/rankingStyles";

const BORDER_PX = 2;

interface RankingAvatarMarkerProps {
  user: User;
  rank: number;
  isCurrentUser?: boolean;
}

/** Ranking map avatar — 28×28 top 3 (with crown), 20×20 for rank 4+. */
export function RankingAvatarMarker({
  user,
  rank,
  isCurrentUser = false,
}: RankingAvatarMarkerProps) {
  const avatarPx = getMapAvatarPx(rank);
  const rankStyle = getRankStyle(rank);
  const borderColor = rankStyle?.border ?? "#ffffff";

  return (
    <div
      className="relative shrink-0 overflow-visible"
      style={{ width: avatarPx, height: avatarPx }}
    >
      {rankStyle ? (
        <RankingCrown src={rankStyle.crown} variant="map" rank={rank} />
      ) : null}
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-white"
        style={{
          width: avatarPx,
          height: avatarPx,
          boxShadow: isCurrentUser
            ? `0 0 0 ${BORDER_PX}px ${borderColor}, 0 0 12px rgba(0, 0, 0, 0.14)`
            : `0 0 0 ${BORDER_PX}px ${borderColor}, 0 0 12px rgba(0, 0, 0, 0.08)`,
        }}
      >
        <Avatar
          src={user.avatar}
          name={user.name}
          size={avatarPx}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
