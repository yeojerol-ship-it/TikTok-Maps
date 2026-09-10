"use client";

import { RankingEntry } from "@/lib/types";
import { RankingRow } from "./RankingRow";

interface RankingProps {
  entries: RankingEntry[];
}

export function Ranking({ entries }: RankingProps) {
  return (
    <div data-sheet-scroll className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-3">
      <div className="flex flex-col pt-1">
        {entries.map((entry) => (
          <RankingRow key={entry.user.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
