"use client";

import { RankingEntry } from "@/lib/types";
import { RankingRow } from "./RankingRow";

interface RankingProps {
  entries: RankingEntry[];
}

export function Ranking({ entries }: RankingProps) {
  return (
    <div
      data-sheet-scroll
      className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-3"
    >
      <div className="flex flex-col pt-1">
        <div className="flex items-center px-5 pt-2.5 pb-1.5">
          <p className="text-[12px] leading-[18px] text-[var(--tux-text-3)]">
            Top rankings this week · Next update in 3d
          </p>
        </div>
        {entries.map((entry) => (
          <RankingRow key={entry.user.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
