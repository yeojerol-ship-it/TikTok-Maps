"use client";

import { RankingEntry } from "@/lib/types";
import { RankingRow } from "@/components/Ranking/RankingRow";
import { RankingPodium } from "./RankingPodium";

interface RankingProps {
  entries: RankingEntry[];
}

export function Ranking({ entries }: RankingProps) {
  const rest = entries.filter((entry) => entry.rank > 3);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-3">
      <div className="relative shrink-0">
        <RankingPodium entries={entries} />
      </div>
      {rest.length > 0 ? (
        <div className="relative z-10 flex flex-col pt-1">
          {rest.map((entry) => (
            <RankingRow key={entry.user.id} entry={entry} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
