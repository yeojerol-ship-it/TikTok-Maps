"use client";

import { RankingEntry } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";
interface RankingRowProps {
  entry: RankingEntry;
}

function RankMark({ rank }: { rank: number }) {
  return (
    <span className="w-8 shrink-0 text-center text-[15px] font-bold tabular-nums text-muted">
      #{rank}
    </span>
  );
}

export function RankingRow({ entry }: RankingRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        entry.isCurrentUser ? "ranking-row--you" : ""
      }`}
    >
      <RankMark rank={entry.rank} />
      <Avatar
        src={entry.user.avatar}
        name={entry.user.name}
        size={48}
        className="shrink-0"
      />
      <p
        className="min-w-0 flex-1 truncate tux-p1-semi text-foreground"
      >
        {entry.isCurrentUser ? "You" : entry.user.name}
      </p>
      <p className="shrink-0 text-[16px] font-bold tabular-nums leading-none text-foreground">
        {entry.placesVisited}
      </p>
    </div>
  );
}
